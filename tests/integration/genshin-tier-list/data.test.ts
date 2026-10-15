import { afterAll, beforeAll, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import postgres from "postgres";
import { sql as query } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { loadGenshinData } from "@/modules/genshin-tier-list/data";
import { importReviewedPackage } from "../../../scripts/editorial-import";
import { readReviewedPackage } from "../../../scripts/editorial-package";
import { genshinTestDatabaseUrl } from "../../genshin-tier-list/database";

const baseUrl = new URL(genshinTestDatabaseUrl());
const databaseName = `genshin_query_test_${process.pid}_${Date.now()}`;
const admin = postgres(baseUrl.toString(), { max: 1 });
baseUrl.pathname = `/${databaseName}`;
const sql = postgres(baseUrl.toString(), { max: 1 });
const db = drizzle(sql);
let created = false;

beforeAll(async () => {
  // Exactly one new, owned disposable database; no pre-existing database reset.
  await admin.unsafe(`CREATE DATABASE "${databaseName}"`);
  created = true;
  await migrate(db, { migrationsFolder: "drizzle" });
  await importReviewedPackage(sql, await readReviewedPackage());
});
afterAll(async () => {
  await sql.end();
  if (created) await admin.unsafe(`DROP DATABASE "${databaseName}"`);
  await admin.end();
});

it("reads 121 characters, reviewed ratings and profiles in a read-only transaction", async () => {
  const result = await db.transaction(async (tx) => loadGenshinData(tx), {
    accessMode: "read only",
  });
  expect(result.status).toBe("available");
  if (result.status !== "available") throw new Error("Expected complete reviewed data");
  expect(result.data).toMatchObject({
    version: "7.1",
    context: "endgame-overall",
    evidenceCount: 130,
    changes: [],
  });
  expect(result.data.characters).toHaveLength(121);
  expect(result.data.sources).toHaveLength(4);
  expect(result.data.sources.map((source) => source.name).sort()).toEqual([
    "Genshin Builds",
    "Icy Veins",
    "KeqingMains",
    "Mobalytics",
  ]);
  expect(
    result.data.characters
      .filter((c) => c.officialReleaseVersion === result.data.version)
      .map((c) => c.name),
  ).toEqual(["Vesna", "Vodyanitsa"]);
  expect(
    await sql`select count(*)::int as count from ratings where editorial_status='reviewed'`,
  ).toEqual([{ count: 121 }]);
  expect(await sql`select count(*)::int as count from entity_profiles`).toEqual([{ count: 121 }]);
  expect(result.data.characters.find((c) => c.name === "Vesna")).toMatchObject({ tier: "A+" });
  expect(result.data.characters.find((c) => c.name === "Vodyanitsa")).toMatchObject({ tier: "S" });
  expect(await sql`select distinct role from entities`).toEqual([{ role: "unclassified" }]);
  expect(result.data.characters.every((c) => c.primaryRole !== ("unclassified" as string))).toBe(
    true,
  );
  const [latest] = await sql`select max(updated_at) as updated from ratings`;
  expect(result.data.updatedAt).toBe(new Date(latest!.updated).toISOString());
});

it.each([
  ["game", "update games set slug='temporarily-missing'"],
  ["version", "update games set current_version_id=null"],
  ["context", "update ranking_contexts set slug='temporarily-missing'"],
  ["profile", "delete from entity_profiles where entity_id=(select id from entities limit 1)"],
  ["rating", "delete from ratings where id=(select id from ratings limit 1)"],
  [
    "draft",
    "update ratings set editorial_status='draft' where id=(select id from ratings limit 1)",
  ],
  [
    "malformed JSON",
    "update ratings set strengths='not-json' where id=(select id from ratings limit 1)",
  ],
])("fails closed for missing/invalid %s without a mock fallback", async (_name, statement) => {
  await db
    .transaction(async (tx) => {
      await tx.execute(query.raw(statement));
      expect(await loadGenshinData(tx)).toEqual({ status: "unavailable" });
      throw new Error("rollback fixture mutation");
    })
    .catch((error) => {
      if (error.message !== "rollback fixture mutation") throw error;
    });
});

it("excludes foreign versions, contexts, games and draft rows", async () => {
  await db
    .transaction(async (tx) => {
      await tx.execute(
        query`insert into games (id,slug,name,publisher) values ('other-game','other-game','Other','Test')`,
      );
      await tx.execute(
        query`insert into game_versions (id,game_id,version) select 'other-version',id,'old' from games where slug='genshin-impact'`,
      );
      await tx.execute(
        query`insert into ranking_contexts (id,game_id,slug,mode,role,label) select 'other-context',id,'other','overall','all','Other' from games where slug='genshin-impact'`,
      );
      await tx.execute(
        query`insert into entities (id,game_id,entity_type,slug,name,role) values ('foreign-entity','other-game','character','foreign','Foreign','unclassified')`,
      );
      await tx.execute(
        query`insert into ratings (id,entity_id,game_version_id,ranking_context_id,tier,editorial_status) select 'foreign-rating',entity_id,'other-version',ranking_context_id,'F','reviewed' from ratings limit 1`,
      );
      await tx.execute(
        query`insert into ratings (id,entity_id,game_version_id,ranking_context_id,tier,editorial_status) select 'foreign-context-rating',entity_id,game_version_id,'other-context','F','reviewed' from ratings limit 1`,
      );
      const result = await loadGenshinData(tx);
      expect(result.status).toBe("available");
      if (result.status === "available") expect(result.data.characters).toHaveLength(121);
      throw new Error("rollback fixture mutation");
    })
    .catch((error) => {
      if (error.message !== "rollback fixture mutation") throw error;
    });
});

it("returns a safe unavailable result for database connection failure", async () => {
  const disconnected = postgres("postgres://localhost:1/genshin_unreachable_test", {
    connect_timeout: 1,
    max: 1,
  });
  try {
    expect(await loadGenshinData(drizzle(disconnected))).toEqual({ status: "unavailable" });
  } finally {
    await disconnected.end();
  }
});

it("resolves sources from verified evidence relationships, including DB-only sources", async () => {
  await db
    .transaction(async (tx) => {
      await tx.execute(
        query`insert into sources (id,name,url,source_type,publisher) values ('db-only-source','DB-only source','https://example.com/db-only','test','Test')`,
      );
      await tx.execute(query`insert into evidence_observations (id,entity_id,source_id,game_version_id,ranking_context_id,observation_type,text_value,source_url,checked_at,status)
      select 'db-only-observation',entity_id,'db-only-source',game_version_id,ranking_context_id,'test','Verified DB relationship','https://example.com/db-only',checked_at,'verified'
      from evidence_observations limit 1`);
      const result = await loadGenshinData(tx);
      expect(result.status).toBe("available");
      if (result.status === "available") {
        expect(result.data.sources).toHaveLength(5);
        expect(result.data.sources).toContainEqual({
          id: "db-only-source",
          name: "DB-only source",
          url: "https://example.com/db-only",
          sourceType: "test",
        });
        expect(result.data.evidenceCount).toBe(131);
      }
      throw new Error("rollback fixture mutation");
    })
    .catch((error) => {
      if (error.message !== "rollback fixture mutation") throw error;
    });
});
