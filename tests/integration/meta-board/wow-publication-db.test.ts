import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
vi.mock("server-only", () => ({}));
import { createDatabaseClient } from "@/platform/database/client";
import {
  buildWowForeverDataCandidate,
  publishWowForeverDataCandidate,
  WOW_FOREVER_NEAR_CAP_DUNGEONS,
} from "@/modules/meta-board/data/forever-logs-publisher";
import { getGameMetaBoardData } from "@/modules/meta-board/db/queries";
import { buildWowSpecs } from "@/modules/meta-board/wow/model";
const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL required");
const target = new URL(url);
if (
  !["localhost", "127.0.0.1"].includes(target.hostname) ||
  !(
    /(?:_test|_integration)/.test(target.pathname) ||
    (process.env.CLEAN_SETUP_DATABASE_URL === url && /_clean(?:_|$)/.test(target.pathname))
  )
)
  throw new Error("Publisher integration requires a dedicated local WoW V1 integration database");
const database = createDatabaseClient(url);
beforeAll(async () => {
  // Same isolated TEST_DATABASE_URL reset contract as the existing serial integration suites.
  await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS public CASCADE"));
  await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE"));
  await database.db.execute(sql.raw("CREATE SCHEMA public"));
  await migrate(database.db, {
    migrationsFolder: "drizzle",
    migrationsSchema: "drizzle",
    migrationsTable: "__drizzle_migrations",
  });
});
afterAll(async () => {
  vi.unstubAllGlobals();
  await database.close();
});
it("persists phase/profile/evidence and blocks incomplete refresh without deleting prior observations", async () => {
  const now = new Date();
  const dungeons = WOW_FOREVER_NEAR_CAP_DUNGEONS.map((d) => d.name);
  const review = {
    phaseId: 55,
    phaseName: "Beta · synthetic publisher test",
    levelCap: 30,
    checkedAt: now.toISOString(),
    officialSourceUrl:
      "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes/2360696",
    taxonomySourceUrl: "https://foreverlogs.gg/faq",
    dungeons,
    roleBySpec: { "Shaman::Earthen Guardian": ["tank", "dps"], "Priest::Holy": ["healer"] },
  };
  vi.stubGlobal("fetch", async (input: string) => {
    const endpoint = new URL(input);
    return new Response(
      JSON.stringify(
        endpoint.pathname.endsWith("/phases")
          ? {
              success: true,
              phases: [
                {
                  id: 999,
                  phase_number: 55,
                  name: review.phaseName,
                  is_active: true,
                  locations: dungeons.map((location) => ({ location })),
                },
              ],
            }
          : {
              success: true,
              phase: 55,
              phase_name: review.phaseName,
              location: endpoint.searchParams.get("location"),
              difficulty: "all",
              bracket: "all",
              damage_mode: "standard",
              metric: endpoint.searchParams.get("metric"),
              statistics:
                endpoint.searchParams.get("metric") === "avg_hps"
                  ? { Priest: { specs: { Holy: { median: 120, total_parses: 30 } } } }
                  : {
                      Shaman: { specs: { "Earthen Guardian": { median: 100, total_parses: 30 } } },
                    },
            },
      ),
    );
  });
  const candidate = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review,
    now,
  });
  const first = await publishWowForeverDataCandidate({ candidate, databaseUrl: url! });
  expect(first.contexts).toBe(3);
  expect(first.ratings).toBe(3);
  for (const role of ["dps", "tank", "healer"]) {
    const board = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "dungeon",
      role,
      levelCap: 30,
      db: database.db,
    });
    const spec = buildWowSpecs(board)[0];
    expect(spec).toMatchObject({ role, tier: "B", score: 100, parses: 120, coverage: 4 });
    expect(spec?.className).toBe(role === "healer" ? "Priest" : "Shaman");
    expect(JSON.parse(board.version!.notes!).phaseId).toBe(55);
  }
  const partial = {
    ...candidate,
    rankings: candidate.rankings.filter((r) => r.item.role !== "tank"),
  };
  await expect(
    publishWowForeverDataCandidate({ candidate: partial, databaseUrl: url! }),
  ).rejects.toThrow(/omits previously stored/);
  const tank = await getGameMetaBoardData({
    gameSlug: "wow-forever",
    mode: "dungeon",
    role: "tank",
    levelCap: 30,
    db: database.db,
  });
  expect(buildWowSpecs(tank)).toHaveLength(1);
});
