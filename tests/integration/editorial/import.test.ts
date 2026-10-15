import { execFileSync } from "node:child_process";
import { afterAll, beforeAll, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { readReviewedPackage, stableEditorialId } from "../../../scripts/editorial-package";
import { importReviewedPackage, readBackReviewedPackage } from "../../../scripts/editorial-import";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required");
const sql = postgres(databaseUrl, { max: 2 });
const pkg = await readReviewedPackage();

beforeAll(async () => {
  await migrate(drizzle(sql), { migrationsFolder: "drizzle", migrationsSchema: "drizzle" });
  await sql`insert into games (id,slug,name,publisher) values ('editorial-wow','editorial-wow','Preserved WoW','Blizzard') on conflict do nothing`;
  await sql`insert into entities (id,game_id,entity_type,slug,name,role) values ('editorial-wow-entity','editorial-wow','spec','mage','Mage','dps') on conflict do nothing`;
});
afterAll(async () => {
  await sql.end();
});

it("rolls back all earlier inserts when a source ID collision is found", async () => {
  const id = stableEditorialId("source", "genshin-builds");
  const prior = await sql`select count(*)::int as count from games where slug='genshin-impact'`;
  expect(prior[0]!.count).toBe(0);
  await sql`insert into sources (id,name,url,source_type,publisher) values (${id},'Collision fixture','https://example.com/collision','test','test')`;
  try {
    await expect(importReviewedPackage(sql, pkg)).rejects.toThrow(/conflict/i);
    expect(await sql`select count(*)::int as count from games where slug='genshin-impact'`).toEqual(
      [{ count: 0 }],
    );
    expect(await sql`select count(*)::int as count from entities where slug='aino'`).toEqual([
      { count: 0 },
    ]);
  } finally {
    await sql`delete from sources where id=${id} and url='https://example.com/collision'`;
  }
});

it("imports reviewed data twice without duplicate rows or fabricated history", async () => {
  const first = await importReviewedPackage(sql, pkg);
  const second = await importReviewedPackage(sql, pkg);
  expect(first.inserted).toMatchObject({ entities: 121, ratings: 121, evidence_observations: 130 });
  expect(Object.values(second.inserted).every((count) => count === 0)).toBe(true);
  const report = await readBackReviewedPackage(sql, pkg);
  expect(report).toMatchObject({
    entities: 121,
    profiles: 121,
    ratings: 121,
    evidenceObservations: 130,
    duplicateCount: 0,
    missingRelationCount: 0,
    currentVersion: "7.1",
    rankingContext: "endgame-overall",
  });
  expect(
    await sql`select count(*)::int as count from rating_changes c join entities e on c.entity_id=e.id where e.game_id=${report.gameId}`,
  ).toEqual([{ count: 0 }]);
  expect(await sql`select name,role from entities where id='editorial-wow-entity'`).toEqual([
    { name: "Mage", role: "dps" },
  ]);
  expect(
    await sql`select count(*)::int as count from evidence_observations where numeric_value is not null and sample_size is null`,
  ).toEqual([{ count: 120 }]);
  expect(
    await sql`select count(*)::int as count from ratings where editorial_status='reviewed' and published_at is null`,
  ).toEqual([{ count: 121 }]);
});

it("runs the real CLI with an independent postgres connection and JSONB objects", async () => {
  const output = execFileSync("bun", ["scripts/reviewed-editorial.ts", "import"], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    encoding: "utf8",
  });
  expect(output).toContain('"event":"independent_post_commit_read_back"');
  const report = await readBackReviewedPackage(sql, pkg);
  expect(
    await sql`select count(*)::int as count
      from entity_profiles p
      join entities e on e.id=p.entity_id
      where e.game_id=${report.gameId} and jsonb_typeof(p.metadata)='object'`,
  ).toEqual([{ count: 121 }]);
});

it("refuses to overwrite a conflicting frozen snapshot and rolls back", async () => {
  const changed = structuredClone(pkg);
  changed.ratings[0]!.tier = "S";
  await expect(importReviewedPackage(sql, changed)).rejects.toThrow(/conflict/i);
  await expect(readBackReviewedPackage(sql, pkg)).resolves.toMatchObject({ ratings: 121 });
});

it("rejects invalid input before inserting anything", async () => {
  const invalid = structuredClone(pkg);
  invalid.evidence[0]!.sourceKey = "unknown";
  await expect(importReviewedPackage(sql, invalid)).rejects.toThrow(/Unknown source/);
  await expect(readBackReviewedPackage(sql, pkg)).resolves.toMatchObject({
    evidenceObservations: 130,
  });
});

it("detects changed database content during independent read-back", async () => {
  const report = await readBackReviewedPackage(sql, pkg);
  await sql`update ratings set why_this_tier='corrupted' where entity_id=(select id from entities where game_id=${report.gameId} and slug='aino')`;
  await expect(readBackReviewedPackage(sql, pkg)).rejects.toThrow(/mismatch/i);
  await sql`update ratings set why_this_tier=${pkg.ratings[0]!.whyThisTier} where entity_id=(select id from entities where game_id=${report.gameId} and slug='aino')`;
});

it("rejects JSONB string metadata even when its text matches the approved object", async () => {
  const report = await readBackReviewedPackage(sql, pkg);
  const [entity] =
    await sql`select id from entities where game_id=${report.gameId} and slug='aino'`;
  await sql`update entity_profiles set metadata=to_jsonb(metadata::text) where entity_id=${entity!.id}`;
  try {
    await expect(readBackReviewedPackage(sql, pkg)).rejects.toThrow(/JSONB object/);
    await expect(importReviewedPackage(sql, pkg)).rejects.toThrow(/JSONB object/);
  } finally {
    await sql`update entity_profiles set metadata=(metadata #>> '{}')::jsonb where entity_id=${entity!.id}`;
  }
});
