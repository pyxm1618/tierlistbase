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
  const profileTypes = await database.db.execute(
    sql`select jsonb_typeof(metadata) as kind from entity_profiles`,
  );
  expect(profileTypes.map((row) => row.kind)).toEqual(["object", "object"]);
  // Repair the exact JSONB-string shape observed in the production read-back,
  // retaining unrelated existing profile metadata on a repeated publication.
  await database.db.execute(sql`update entity_profiles
    set metadata = to_jsonb((metadata || '{"retained":"reviewed"}'::jsonb)::text)`);
  await publishWowForeverDataCandidate({ candidate, databaseUrl: url! });
  const repairedProfiles = await database.db.execute(sql`select
    jsonb_typeof(metadata) as kind, metadata->>'retained' as retained,
    metadata->>'className' as class_name from entity_profiles`);
  expect(repairedProfiles.map((row) => row.kind)).toEqual(["object", "object"]);
  expect(repairedProfiles.every((row) => row.retained === "reviewed")).toBe(true);
  expect(repairedProfiles.map((row) => row.class_name).sort()).toEqual(["Priest", "Shaman"]);
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

it("tracks cross-phase and same-phase rating_changes and strictly enforces cohort semantics", async () => {
  const baseNow = new Date();
  const t1 = new Date(baseNow.getTime() - 3 * 3600 * 1000);
  const dungeons = WOW_FOREVER_NEAR_CAP_DUNGEONS.map((d) => d.name);

  // --- 1. Phase 1 Setup & Publication ---
  const reviewPhase1 = {
    phaseId: 101,
    phaseName: "Beta · Phase 1 The Awakening",
    levelCap: 30,
    checkedAt: t1.toISOString(),
    officialSourceUrl:
      "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes/2360696",
    taxonomySourceUrl: "https://foreverlogs.gg/faq",
    dungeons,
    roleBySpec: {
      "Warrior::Arms": ["dps"],
      "Warrior::Fury": ["dps"],
      "Warrior::Gladiator": ["dps"],
      "Priest::Holy": ["healer"],
    },
  };

  let currentPhaseId = 101;
  let currentPhaseName = reviewPhase1.phaseName;
  let armsMedian = 100;
  let gladiatorMedian = 100;

  vi.stubGlobal("fetch", async (input: string) => {
    const endpoint = new URL(input);
    if (endpoint.pathname.endsWith("/phases")) {
      return new Response(
        JSON.stringify({
          success: true,
          phases: [
            {
              id: 1001,
              phase_number: currentPhaseId,
              name: currentPhaseName,
              is_active: true,
              locations: dungeons.map((location) => ({ location })),
            },
          ],
        }),
      );
    }

    const metric = endpoint.searchParams.get("metric");
    if (metric === "avg_hps") {
      return new Response(
        JSON.stringify({
          success: true,
          phase: currentPhaseId,
          phase_name: currentPhaseName,
          location: endpoint.searchParams.get("location"),
          difficulty: "all",
          bracket: "all",
          damage_mode: "standard",
          metric,
          statistics: {
            Priest: { specs: { Holy: { median: 100, total_parses: 30 } } },
          },
        }),
      );
    }

    if (metric === "avg_dtps") {
      return new Response(
        JSON.stringify({
          success: true,
          phase: currentPhaseId,
          phase_name: currentPhaseName,
          location: endpoint.searchParams.get("location"),
          difficulty: "all",
          bracket: "all",
          damage_mode: "standard",
          metric,
          statistics: {},
        }),
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        phase: currentPhaseId,
        phase_name: currentPhaseName,
        location: endpoint.searchParams.get("location"),
        difficulty: "all",
        bracket: "all",
        damage_mode: "standard",
        metric,
        statistics: {
          Warrior: {
            specs: {
              Arms: { median: armsMedian, total_parses: 30 },
              Fury: { median: 200 - armsMedian, total_parses: 30 },
              Gladiator: { median: gladiatorMedian, total_parses: 30 },
            },
          },
        },
      }),
    );
  });

  const candidate1 = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: reviewPhase1,
    now: t1,
  });
  gladiatorMedian = 1;
  const changedCohort = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: reviewPhase1,
    now: t1,
  });
  expect(
    changedCohort.rankings.find((entry) => entry.item.specName === "Arms")?.item
      .weightedMedianScore,
  ).toBe(100);
  gladiatorMedian = 100;
  const res1 = await publishWowForeverDataCandidate({ candidate: candidate1, databaseUrl: url! });
  expect(res1.changes).toBe(0);

  // 验证实体语义
  type EntityRow = { slug: string; entityType: string };
  const entities = (await database.db.execute(
    sql`select e.slug, e.entity_type as "entityType" from entities e
        join games g on g.id = e.game_id
        where g.slug = 'wow-forever'
        order by e.slug`,
  )) as unknown as EntityRow[];
  const armsEntity = entities.find((e) => e.slug === "arms-warrior");
  const gladiatorEntity = entities.find((e) => e.slug === "gladiator-warrior");
  const holyEntity = entities.find((e) => e.slug === "holy-priest");

  expect(armsEntity?.entityType).toBe("spec");
  expect(holyEntity?.entityType).toBe("spec");
  expect(gladiatorEntity?.entityType).toBe("cohort");

  type ProfileRow = { slug: string; metadata: Record<string, unknown> };
  const profiles = (await database.db.execute(
    sql`select e.slug, ep.metadata from entity_profiles ep
        join entities e on e.id = ep.entity_id
        join games g on g.id = e.game_id
        where g.slug = 'wow-forever'`,
  )) as unknown as ProfileRow[];
  const armsProf = profiles.find((p) => p.slug === "arms-warrior");
  const gladProf = profiles.find((p) => p.slug === "gladiator-warrior");
  expect(armsProf?.metadata.officialSpec).toBe(true);
  expect(armsProf?.metadata.entityKind).toBe("official_spec");
  expect(gladProf?.metadata.officialSpec).toBe(false);
  expect(gladProf?.metadata.entityKind).toBe("forever_logs_cohort");

  // 验证 Board 严格排除 cohort
  const dpsBoardP1 = await getGameMetaBoardData({
    gameSlug: "wow-forever",
    mode: "dungeon",
    role: "dps",
    levelCap: 30,
    db: database.db,
  });
  const dpsSpecsP1 = buildWowSpecs(dpsBoardP1);
  expect(dpsSpecsP1.some((s) => s.specName === "Gladiator")).toBe(false);
  expect(dpsSpecsP1.some((s) => s.specName === "Arms")).toBe(true);
  expect(dpsSpecsP1.find((s) => s.specName === "Arms")?.tier).toBe("B");

  // --- 2. Phase 2 Setup & Publication (跨版本) ---
  const t2 = new Date(baseNow.getTime() - 2 * 3600 * 1000);
  currentPhaseId = 102;
  currentPhaseName = "Beta · Phase 2 The Rift";
  const reviewPhase2 = {
    ...reviewPhase1,
    phaseId: currentPhaseId,
    phaseName: currentPhaseName,
    checkedAt: t2.toISOString(),
  };

  // Official Arms 110 and Fury 90 give benchmark 100, independently of Gladiator.
  armsMedian = 110;
  gladiatorMedian = 90;

  const candidate2 = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: reviewPhase2,
    now: t2,
  });
  const res2 = await publishWowForeverDataCandidate({ candidate: candidate2, databaseUrl: url! });
  expect(res2.versionId).not.toBe(res1.versionId);

  // 验证 rating_changes：
  // 1) Arms Warrior: B -> A 跨版本产生记录
  // 2) Holy Priest: B -> B 保持不变，不产生记录
  const changes = await database.db.execute(
    sql`select rc.*, e.slug as entity_slug from rating_changes rc
        join entities e on e.id = rc.entity_id
        where rc.to_version_id = ${res2.versionId}`,
  );

  const armsChange = changes.find((c) => c.entity_slug === "arms-warrior");
  const holyChange = changes.find((c) => c.entity_slug === "holy-priest");

  expect(armsChange).toBeDefined();
  expect(armsChange?.from_version_id).toBe(res1.versionId);
  expect(armsChange?.to_version_id).toBe(res2.versionId);
  expect(armsChange?.previous_tier).toBe("B");
  expect(armsChange?.new_tier).toBe("A");
  expect(armsChange?.change_type).toBe("reclassified");

  expect(holyChange).toBeUndefined();

  // 验证 Phase 2 的 Board 数据
  const dpsBoardP2 = await getGameMetaBoardData({
    gameSlug: "wow-forever",
    mode: "dungeon",
    role: "dps",
    levelCap: 30,
    db: database.db,
  });
  const dpsSpecsP2 = buildWowSpecs(dpsBoardP2);
  expect(dpsSpecsP2.some((s) => s.specName === "Gladiator")).toBe(false);
  const armsSpecP2 = dpsSpecsP2.find((s) => s.specName === "Arms");
  expect(armsSpecP2?.tier).toBe("A");

  // --- 3. Phase 2 同版本内数据更新 ---
  const t3 = new Date(baseNow.getTime() - 1 * 3600 * 1000);
  // Official Arms 140 and Fury 60 give benchmark 100 and Tier S.
  armsMedian = 140;
  gladiatorMedian = 70;

  const candidate3 = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: {
      ...reviewPhase2,
      checkedAt: t3.toISOString(),
    },
    now: t3,
  });
  const res3 = await publishWowForeverDataCandidate({ candidate: candidate3, databaseUrl: url! });
  expect(res3.versionId).toBe(res2.versionId);

  // 验证同版本 rating_changes:
  // Arms: A -> S，from_version_id == to_version_id == res2.versionId
  const sameVersionChanges = await database.db.execute(
    sql`select rc.*, e.slug as entity_slug from rating_changes rc
        join entities e on e.id = rc.entity_id
        where rc.to_version_id = ${res3.versionId} and rc.from_version_id = ${res3.versionId}`,
  );
  const armsSameVersionChange = sameVersionChanges.find((c) => c.entity_slug === "arms-warrior");
  expect(armsSameVersionChange).toBeDefined();
  expect(armsSameVersionChange?.from_version_id).toBe(res2.versionId);
  expect(armsSameVersionChange?.to_version_id).toBe(res2.versionId);
  expect(armsSameVersionChange?.previous_tier).toBe("A");
  expect(armsSameVersionChange?.new_tier).toBe("S");
});

it("selects the most recent previous version when multiple older versions exist (Test A)", async () => {
  const baseNow = new Date();
  const dungeons = WOW_FOREVER_NEAR_CAP_DUNGEONS.map((d) => d.name);

  let currentPhaseId = 201;
  let currentPhaseName = "Beta · Phase 201 Historical Baseline";
  let armsMedian = 100;

  vi.stubGlobal("fetch", async (input: string) => {
    const endpoint = new URL(input);
    if (endpoint.pathname.endsWith("/phases")) {
      return new Response(
        JSON.stringify({
          success: true,
          phases: [
            {
              id: 2000 + currentPhaseId,
              phase_number: currentPhaseId,
              name: currentPhaseName,
              is_active: true,
              locations: dungeons.map((location) => ({ location })),
            },
          ],
        }),
      );
    }

    const metric = endpoint.searchParams.get("metric");
    if (metric === "avg_hps") {
      return new Response(
        JSON.stringify({
          success: true,
          phase: currentPhaseId,
          phase_name: currentPhaseName,
          location: endpoint.searchParams.get("location"),
          difficulty: "all",
          bracket: "all",
          damage_mode: "standard",
          metric,
          statistics: {
            Priest: { specs: { Holy: { median: 100, total_parses: 30 } } },
          },
        }),
      );
    }

    if (metric === "avg_dtps") {
      return new Response(
        JSON.stringify({
          success: true,
          phase: currentPhaseId,
          phase_name: currentPhaseName,
          location: endpoint.searchParams.get("location"),
          difficulty: "all",
          bracket: "all",
          damage_mode: "standard",
          metric,
          statistics: {},
        }),
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        phase: currentPhaseId,
        phase_name: currentPhaseName,
        location: endpoint.searchParams.get("location"),
        difficulty: "all",
        bracket: "all",
        damage_mode: "standard",
        metric,
        statistics: {
          Warrior: {
            specs: {
              Arms: { median: armsMedian, total_parses: 30 },
              Fury: { median: 200 - armsMedian, total_parses: 30 },
            },
          },
        },
      }),
    );
  });

  const baseReview = {
    officialSourceUrl:
      "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes/2360696",
    taxonomySourceUrl: "https://foreverlogs.gg/faq",
    dungeons,
    roleBySpec: {
      "Warrior::Arms": ["dps"],
      "Warrior::Fury": ["dps"],
      "Priest::Holy": ["healer"],
    },
    levelCap: 30 as const,
  };

  // --- Version 1 (Phase 201): Arms = 100 -> Tier B ---
  const t1 = new Date(baseNow.getTime() - 6 * 3600 * 1000);
  currentPhaseId = 201;
  currentPhaseName = "Beta · Phase 201 Historical Baseline";
  armsMedian = 100;
  const candidateV1 = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: {
      ...baseReview,
      phaseId: currentPhaseId,
      phaseName: currentPhaseName,
      checkedAt: t1.toISOString(),
    },
    now: t1,
  });
  const resV1 = await publishWowForeverDataCandidate({ candidate: candidateV1, databaseUrl: url! });

  // --- Version 2 (Phase 202): Arms = 110 -> Tier A ---
  const t2 = new Date(baseNow.getTime() - 5 * 3600 * 1000);
  currentPhaseId = 202;
  currentPhaseName = "Beta · Phase 202 Intermediate Baseline";
  armsMedian = 110;
  const candidateV2 = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: {
      ...baseReview,
      phaseId: currentPhaseId,
      phaseName: currentPhaseName,
      checkedAt: t2.toISOString(),
    },
    now: t2,
  });
  const resV2 = await publishWowForeverDataCandidate({ candidate: candidateV2, databaseUrl: url! });
  expect(resV2.versionId).not.toBe(resV1.versionId);

  // --- Version 3 (Phase 203): Arms = 140 -> Tier S ---
  const t3 = new Date(baseNow.getTime() - 4 * 3600 * 1000);
  currentPhaseId = 203;
  currentPhaseName = "Beta · Phase 203 Latest Baseline";
  armsMedian = 140;
  const candidateV3 = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: {
      ...baseReview,
      phaseId: currentPhaseId,
      phaseName: currentPhaseName,
      checkedAt: t3.toISOString(),
    },
    now: t3,
  });
  const resV3 = await publishWowForeverDataCandidate({ candidate: candidateV3, databaseUrl: url! });
  expect(resV3.versionId).not.toBe(resV2.versionId);
  expect(resV3.versionId).not.toBe(resV1.versionId);

  // 核心断言：发布 Version 3 时，系统必须选择最近的 previous Version (Version 2 A -> Version 3 S)，而不是更早的 Version 1 (B -> S)
  const changesV3 = await database.db.execute(
    sql`select rc.*, e.slug as entity_slug from rating_changes rc
        join entities e on e.id = rc.entity_id
        where rc.to_version_id = ${resV3.versionId}`,
  );
  const armsChangeV3 = changesV3.find((c) => c.entity_slug === "arms-warrior");
  expect(armsChangeV3).toBeDefined();
  expect(armsChangeV3?.from_version_id).toBe(resV2.versionId);
  expect(armsChangeV3?.from_version_id).not.toBe(resV1.versionId);
  expect(armsChangeV3?.to_version_id).toBe(resV3.versionId);
  expect(armsChangeV3?.previous_tier).toBe("A");
  expect(armsChangeV3?.new_tier).toBe("S");
});

it("strictly isolates ranking contexts: same entity in different contexts never cross-compares (Test B)", async () => {
  const baseNow = new Date();
  const dungeons = WOW_FOREVER_NEAR_CAP_DUNGEONS.map((d) => d.name);

  let currentPhaseId = 301;
  let currentPhaseName = "Beta · Phase 301 Context Isolation 1";
  let shamanDpsMedian = 110;
  let shamanTankMedian = 100;

  vi.stubGlobal("fetch", async (input: string) => {
    const endpoint = new URL(input);
    if (endpoint.pathname.endsWith("/phases")) {
      return new Response(
        JSON.stringify({
          success: true,
          phases: [
            {
              id: 3000 + currentPhaseId,
              phase_number: currentPhaseId,
              name: currentPhaseName,
              is_active: true,
              locations: dungeons.map((location) => ({ location })),
            },
          ],
        }),
      );
    }

    const metric = endpoint.searchParams.get("metric");
    if (metric === "avg_hps") {
      return new Response(
        JSON.stringify({
          success: true,
          phase: currentPhaseId,
          phase_name: currentPhaseName,
          location: endpoint.searchParams.get("location"),
          difficulty: "all",
          bracket: "all",
          damage_mode: "standard",
          metric,
          statistics: {
            Priest: { specs: { Holy: { median: 100, total_parses: 30 } } },
          },
        }),
      );
    }

    if (metric === "avg_dtps") {
      return new Response(
        JSON.stringify({
          success: true,
          phase: currentPhaseId,
          phase_name: currentPhaseName,
          location: endpoint.searchParams.get("location"),
          difficulty: "all",
          bracket: "all",
          damage_mode: "standard",
          metric,
          statistics:
            currentPhaseId === 301
              ? {}
              : {
                  Warrior: {
                    specs: {
                      Protection: { median: 200 - shamanTankMedian, total_parses: 30 },
                    },
                  },
                  Shaman: {
                    specs: {
                      "Earthen Guardian": { median: shamanTankMedian, total_parses: 30 },
                    },
                  },
                },
        }),
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        phase: currentPhaseId,
        phase_name: currentPhaseName,
        location: endpoint.searchParams.get("location"),
        difficulty: "all",
        bracket: "all",
        damage_mode: "standard",
        metric,
        statistics:
          currentPhaseId === 301
            ? {
                Warrior: {
                  specs: {
                    Arms: { median: 100, total_parses: 30 },
                    Fury: { median: 100, total_parses: 30 },
                  },
                },
                Shaman: {
                  specs: {
                    "Earthen Guardian": { median: shamanDpsMedian, total_parses: 30 },
                  },
                },
              }
            : {},
      }),
    );
  });

  const baseReview = {
    officialSourceUrl:
      "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes/2360696",
    taxonomySourceUrl: "https://foreverlogs.gg/faq",
    dungeons,
    levelCap: 30 as const,
  };

  // --- Phase 301: Shaman::Earthen Guardian published under DPS context (Tier A) ---
  const t1 = new Date(baseNow.getTime() - 6 * 3600 * 1000);
  currentPhaseId = 301;
  currentPhaseName = "Beta · Phase 301 Context Isolation 1";
  shamanDpsMedian = 110;
  const candidateB1 = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: {
      ...baseReview,
      phaseId: currentPhaseId,
      phaseName: currentPhaseName,
      checkedAt: t1.toISOString(),
      roleBySpec: {
        "Warrior::Arms": ["dps"],
        "Warrior::Fury": ["dps"],
        "Shaman::Earthen Guardian": ["dps"],
        "Priest::Holy": ["healer"],
      },
    },
    now: t1,
  });
  const resB1 = await publishWowForeverDataCandidate({ candidate: candidateB1, databaseUrl: url! });

  // --- Phase 302: SAME entity Shaman::Earthen Guardian now published only under TANK context (Tier B) ---
  const t2 = new Date(baseNow.getTime() - 5 * 3600 * 1000);
  currentPhaseId = 302;
  currentPhaseName = "Beta · Phase 302 Context Isolation 2";
  shamanTankMedian = 100;
  const candidateB2 = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: {
      ...baseReview,
      phaseId: currentPhaseId,
      phaseName: currentPhaseName,
      checkedAt: t2.toISOString(),
      roleBySpec: {
        "Warrior::Protection": ["tank"],
        "Shaman::Earthen Guardian": ["tank"],
        "Priest::Holy": ["healer"],
      },
    },
    now: t2,
  });
  const resB2 = await publishWowForeverDataCandidate({ candidate: candidateB2, databaseUrl: url! });

  // 断言：由于 Phase 301 仅有 DPS context 评分，Phase 302 的 Tank context 绝不能与同一个 entity 的 DPS 串比！
  // 必须严格为 same entity_id + same ranking_context_id。找不到同 context 的 previous rating，绝不产生 rating_change！
  const changesB2 = await database.db.execute(
    sql`select rc.*, e.slug as entity_slug from rating_changes rc
        join entities e on e.id = rc.entity_id
        where rc.to_version_id = ${resB2.versionId}`,
  );
  const shamanChangeB2 = changesB2.find((c) => c.entity_slug === "earthen-guardian-shaman");
  expect(shamanChangeB2).toBeUndefined();

  // --- Phase 303: Shaman::Earthen Guardian published under TANK context again, but now Tier S ---
  const t3 = new Date(baseNow.getTime() - 4 * 3600 * 1000);
  currentPhaseId = 303;
  currentPhaseName = "Beta · Phase 303 Context Isolation 3";
  shamanTankMedian = 60;
  const candidateB3 = await buildWowForeverDataCandidate({
    apiKey: randomUUID(),
    review: {
      ...baseReview,
      phaseId: currentPhaseId,
      phaseName: currentPhaseName,
      checkedAt: t3.toISOString(),
      roleBySpec: {
        "Warrior::Protection": ["tank"],
        "Shaman::Earthen Guardian": ["tank"],
        "Priest::Holy": ["healer"],
      },
    },
    now: t3,
  });
  const resB3 = await publishWowForeverDataCandidate({ candidate: candidateB3, databaseUrl: url! });

  // 对照断言：同一 entity 在相同 ranking_context_id (tank) 下跨版本正常比较 (Phase 302 Tier B -> Phase 303 Tier S)
  const changesB3 = await database.db.execute(
    sql`select rc.*, e.slug as entity_slug from rating_changes rc
        join entities e on e.id = rc.entity_id
        where rc.to_version_id = ${resB3.versionId}`,
  );
  const shamanChangeB3 = changesB3.find((c) => c.entity_slug === "earthen-guardian-shaman");
  expect(shamanChangeB3).toBeDefined();
  expect(shamanChangeB3?.from_version_id).toBe(resB2.versionId);
  expect(shamanChangeB3?.from_version_id).not.toBe(resB1.versionId);
  expect(shamanChangeB3?.to_version_id).toBe(resB3.versionId);
  expect(shamanChangeB3?.previous_tier).toBe("B");
  expect(shamanChangeB3?.new_tier).toBe("S");
});
