import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { createDatabaseClient } from "@/platform/database/client";
import {
  entities,
  gameVersions,
  games,
  rankingContexts,
  ratingChanges,
  ratings,
  sourceRatings,
  sources,
} from "@/modules/meta-board/db/schema";
import { getGameMetaBoardData, getRecentRatingChanges } from "@/modules/meta-board/db/queries";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required");

const database = createDatabaseClient(databaseUrl);

const migrationOptions = {
  migrationsFolder: "drizzle",
  migrationsSchema: "drizzle",
  migrationsTable: "__drizzle_migrations",
} as const;

describe("TierListBase Meta Board Database Integration", () => {
  beforeAll(async () => {
    // Reset schema and migrate to latest 0016
    await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS public CASCADE"));
    await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE"));
    await database.db.execute(sql.raw("CREATE SCHEMA public"));
    await migrate(database.db, migrationOptions);
  });

  afterAll(async () => {
    await database.close();
  });

  it("verifies all 8 product tables exist in public schema after migration", async () => {
    const result = await database.db.execute<{ table_name: string }>(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'games',
          'game_versions',
          'entities',
          'ranking_contexts',
          'sources',
          'source_ratings',
          'ratings',
          'rating_changes'
        )
      ORDER BY table_name;
    `);

    const tableNames = result.map((r) => r.table_name).sort();
    expect(tableNames).toEqual([
      "entities",
      "game_versions",
      "games",
      "ranking_contexts",
      "rating_changes",
      "ratings",
      "source_ratings",
      "sources",
    ]);
  });

  it("returns honest empty state when database contains no game data", async () => {
    const data = await getGameMetaBoardData({ gameSlug: "wow-forever", db: database.db });
    expect(data.hasData).toBe(false);
    expect(data.game).toBeNull();
    expect(data.version).toBeNull();

    expect(data.activeContext).toBeNull();
    expect(data.availableModes).toEqual([]);
    expect(data.availableRoles).toEqual([]);
    expect(data.availableLevels).toEqual([]);
    expect(data.availableBuilds).toEqual([]);
    expect(data.tiers).toEqual([]);
  });

  it("populates active contexts and isolates ratings by version and context", async () => {
    // 1. Seed synthetic game and versions (isolated in test DB)
    const testGameId = "game-wow-test";
    const testVersionV1Id = "ver-wow-1152";
    const testVersionV2Id = "ver-wow-1153";

    await database.db.insert(games).values({
      id: testGameId,
      slug: "wow-forever",
      name: "World of Warcraft: Forever",
      publisher: "Blizzard Entertainment",
      status: "active",
    });

    await database.db.insert(gameVersions).values([
      {
        id: testVersionV1Id,
        gameId: testGameId,
        version: "1.15.2",
        build: "54321",
        levelCap: 60,
        status: "current",
      },
      {
        id: testVersionV2Id,
        gameId: testGameId,
        version: "1.15.3",
        build: "54322",
        levelCap: 60,
        status: "active",
      },
    ]);

    await database.db
      .update(games)
      .set({ currentVersionId: testVersionV1Id })
      .where(eq(games.id, testGameId));

    // 2. Seed active ranking contexts (Overall, Leveling, Dungeon, PvP)
    const ctxOverallId = "ctx-overall-dps";
    const ctxLevelingId = "ctx-leveling-dps";
    const ctxPvPId = "ctx-pvp-healer";

    await database.db.insert(rankingContexts).values([
      {
        id: ctxOverallId,
        gameId: testGameId,
        slug: "overall-dps-60",
        mode: "overall",
        role: "dps",
        levelCap: 60,
        label: "Overall • DPS • Level 60",
        status: "active",
      },
      {
        id: ctxLevelingId,
        gameId: testGameId,
        slug: "leveling-dps-60",
        mode: "leveling",
        role: "dps",
        levelCap: 60,
        label: "Leveling • DPS • Level 60",
        status: "active",
      },
      {
        id: ctxPvPId,
        gameId: testGameId,
        slug: "pvp-healer-60",
        mode: "pvp",
        role: "healer",
        levelCap: 60,
        label: "PvP • Healer • Level 60",
        status: "active",
      },
    ]);

    // 3. Seed entities (Mage, Priest)
    const entityMageId = "ent-mage-frost";
    const entityPriestId = "ent-priest-holy";

    await database.db.insert(entities).values([
      {
        id: entityMageId,
        gameId: testGameId,
        name: "Frost Mage",
        slug: "frost-mage",
        entityType: "spec",
        role: "dps",
        sortOrder: 1,
      },
      {
        id: entityPriestId,
        gameId: testGameId,
        name: "Holy Priest",
        slug: "holy-priest",
        entityType: "spec",
        role: "healer",
        sortOrder: 2,
      },
    ]);

    // 4. Seed ratings isolated by version and context:
    // Mage is 'S' tier in V1 Overall, but 'B' tier in V1 Leveling, and 'A' tier in V2 Overall
    await database.db.insert(ratings).values([
      {
        id: "rat-mage-v1-overall",
        entityId: entityMageId,
        rankingContextId: ctxOverallId,
        gameVersionId: testVersionV1Id,
        tier: "S",
        consensusScore: "95.00",
        sourceCount: 2,
        agreeingSourceCount: 2,
        disagreementLevel: "none",
        dataStatus: "available",
        freshnessStatus: "current",
        whyThisTier: "Dominant ranged burst damage.",
      },
      {
        id: "rat-mage-v1-leveling",
        entityId: entityMageId,
        rankingContextId: ctxLevelingId,
        gameVersionId: testVersionV1Id,
        tier: "B",
        consensusScore: "75.00",
        sourceCount: 1,
        agreeingSourceCount: 1,
        disagreementLevel: "none",
        dataStatus: "preliminary",
        freshnessStatus: "current",
        whyThisTier: "Mana downtime during leveling slows pace.",
      },
      {
        id: "rat-mage-v2-overall",
        entityId: entityMageId,
        rankingContextId: ctxOverallId,
        gameVersionId: testVersionV2Id,
        tier: "A",
        consensusScore: "85.00",
        sourceCount: 2,
        agreeingSourceCount: 2,
        disagreementLevel: "none",
        dataStatus: "available",
        freshnessStatus: "current",
        whyThisTier: "Targeted tuning reduced frost damage.",
      },
    ]);

    // 5. Seed sources and source ratings for evidence
    const source1Id = "src-warcraft-review";
    await database.db.insert(sources).values({
      id: source1Id,
      name: "Warcraft Meta Digest",
      url: "https://example.com/warcraft-meta",
      sourceType: "expert",
      publisher: "Community Editors",
      freshnessStatus: "current",
    });

    await database.db.insert(sourceRatings).values({
      id: "sr-mage-v1-overall-1",
      sourceId: source1Id,
      entityId: entityMageId,
      rankingContextId: ctxOverallId,
      gameVersionId: testVersionV1Id,
      rawTier: "S",
      normalizedTier: "S",
      normalizedScore: "95.00",
    });

    // 6. Seed rating changes
    await database.db.insert(ratingChanges).values({
      id: "rc-mage-v1-to-v2",
      entityId: entityMageId,
      rankingContextId: ctxOverallId,
      fromVersionId: testVersionV1Id,
      toVersionId: testVersionV2Id,
      previousTier: "S",
      newTier: "A",
      changeType: "demoted",
      reason: "Class tuning aura adjusted by 5%",
    });

    // TEST A: Verify active context filters derived strictly from active ratings in DB
    const v1OverallData = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "overall",
      role: "dps",
      db: database.db,
    });

    expect(v1OverallData.hasData).toBe(true);
    // PvP context has NO active ratings, so it MUST NOT appear in availableModes
    expect(v1OverallData.availableModes.sort()).toEqual(["leveling", "overall"].sort());
    // In overall mode, only role "dps" has active ratings in current seed
    expect(v1OverallData.availableRoles).toEqual(["dps"]);
    expect(v1OverallData.availableLevels).toEqual([60]);
    // Both builds 54321 and 54322 have active ratings in overall+dps
    expect(v1OverallData.availableBuilds.sort()).toEqual(["54321", "54322"].sort());

    // TEST B: Context filtering is DB-driven (Overall vs Leveling)
    const overallSGroup = v1OverallData.tiers.find((g) => g.tier === "S");
    expect(overallSGroup?.items.some((i) => i.entityName === "Frost Mage")).toBe(true);

    const v1LevelingData = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "leveling",
      role: "dps",
      db: database.db,
    });
    const levelingBGroup = v1LevelingData.tiers.find((g) => g.tier === "B");
    expect(levelingBGroup?.items.some((i) => i.entityName === "Frost Mage")).toBe(true);

    // CRITICAL 4D LINKAGE CHECK:
    // Build 54322 exists in game_versions table, but has NO rating in Leveling+DPS!
    // Therefore, Build 54322 MUST NOT be a selectable option in Leveling+DPS!
    expect(v1LevelingData.availableBuilds).toEqual(["54321"]);

    // If requesting Build 54322 in Leveling+DPS context, strictly return empty state (NO silent fallback)
    const unratedBuildInLeveling = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "leveling",
      role: "dps",
      build: "54322",
      db: database.db,
    });
    expect(unratedBuildInLeveling.hasData).toBe(false);
    expect(unratedBuildInLeveling.tiers).toEqual([]);

    // TEST C: Version filtering is DB-driven (Build 54321 vs 54322)
    const v2Data = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "overall",
      role: "dps",
      build: "54322",
      db: database.db,
    });
    expect(v2Data.version?.version).toBe("1.15.3");
    const v2AGroup = v2Data.tiers.find((g) => g.tier === "A");
    expect(v2AGroup?.items.some((i) => i.entityName === "Frost Mage")).toBe(true);

    // TEST D: Non-existent context returns unavailable / empty state
    const nonExistentData = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "mythic-plus", // not seeded
      role: "tank",
      db: database.db,
    });
    expect(nonExistentData.hasData).toBe(false);
    expect(nonExistentData.tiers).toEqual([]);

    // TEST D2: Invalid or non-existent build strictly returns empty state (NO silent fallback)
    const invalidBuildData = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "overall",
      role: "dps",
      build: "99999-invalid-build",
      db: database.db,
    });
    expect(invalidBuildData.hasData).toBe(false);
    expect(invalidBuildData.version).toBeNull();
    expect(invalidBuildData.tiers).toEqual([]);

    // TEST D3: Cascading role derivation and illegal role combination rejection
    const levelingContextData = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "leveling",
      db: database.db,
    });
    expect(levelingContextData.availableRoles).toEqual(["dps"]);

    // Requesting illegal combination: mode "leveling" + role "healer" MUST return empty state
    const illegalRoleCombination = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "leveling",
      role: "healer",
      db: database.db,
    });
    expect(illegalRoleCombination.hasData).toBe(false);
    expect(illegalRoleCombination.tiers).toEqual([]);

    // TEST E1: Default page without overall+all returns honest empty state (does not fabricate All)
    const defaultPageWithoutAll = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      db: database.db,
    });
    expect(defaultPageWithoutAll.hasData).toBe(false);
    expect(defaultPageWithoutAll.activeContext).toBeNull();

    // Now seed a real "overall + all" context with rating and verify explicit matching
    const ctxOverallAllId = "ctx-overall-all-60";
    await database.db.insert(rankingContexts).values({
      id: ctxOverallAllId,
      gameId: testGameId,
      slug: "overall-all-60",
      mode: "overall",
      role: "all",
      levelCap: 60,
      label: "Overall • All Roles • Level 60",
      status: "active",
    });
    await database.db.insert(ratings).values({
      id: "rat-mage-v1-overall-all",
      entityId: entityMageId,
      rankingContextId: ctxOverallAllId,
      gameVersionId: testVersionV1Id,
      tier: "S",
      consensusScore: "96.00",
      sourceCount: 1,
      agreeingSourceCount: 1,
      disagreementLevel: "none",
      dataStatus: "available",
      freshnessStatus: "current",
      whyThisTier: "Top overall performer across all roles.",
    });

    const defaultPageWithAll = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      db: database.db,
    });
    expect(defaultPageWithAll.hasData).toBe(true);
    expect(defaultPageWithAll.activeContext?.id).toBe(ctxOverallAllId);
    expect(defaultPageWithAll.activeContext?.mode).toBe("overall");
    expect(defaultPageWithAll.activeContext?.role).toBe("all");

    // TEST E2: Cross-version Source Evidence Isolation
    // Seed a source for V2 Overall to prove V1 evidence does NOT bleed into V2 and vice versa
    const source2Id = "src-warcraft-logs-v2";
    await database.db.insert(sources).values({
      id: source2Id,
      name: "Warcraft Logs V2",
      url: "https://example.com/warcraft-logs-v2",
      sourceType: "data",
      publisher: "Combat Log Analytics",
      freshnessStatus: "current",
      publishedAt: new Date("2026-02-15T00:00:00Z"),
    });
    await database.db.insert(sourceRatings).values({
      id: "sr-mage-v2-overall-1",
      sourceId: source2Id,
      entityId: entityMageId,
      rankingContextId: ctxOverallId,
      gameVersionId: testVersionV2Id,
      rawTier: "A",
      normalizedTier: "A",
      normalizedScore: "85.00",
    });

    // Re-query V1 and V2 data to test Drawer evidence
    const v1UpdatedData = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "overall",
      role: "dps",
      build: "54321",
      db: database.db,
    });
    const v1MageItem = v1UpdatedData.tiers
      .find((g) => g.tier === "S")
      ?.items.find((i) => i.entityName === "Frost Mage");
    expect(v1MageItem).toBeDefined();
    expect(v1MageItem!.sources.length).toBe(1);
    expect(v1MageItem!.sources[0]!.sourceId).toBe(source1Id);
    expect(v1MageItem!.sources[0]!.rawTier).toBe("S");
    expect(v1MageItem!.sources.some((s) => s.sourceId === source2Id)).toBe(false);

    // Check V2 Drawer evidence
    const v2UpdatedData = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "overall",
      role: "dps",
      build: "54322",
      db: database.db,
    });
    const v2MageItem = v2UpdatedData.tiers
      .find((g) => g.tier === "A")
      ?.items.find((i) => i.entityName === "Frost Mage");
    expect(v2MageItem).toBeDefined();
    expect(v2MageItem!.sources.length).toBe(1);
    expect(v2MageItem!.sources[0]!.sourceId).toBe(source2Id);
    expect(v2MageItem!.sources[0]!.rawTier).toBe("A");
    expect(v2MageItem!.sources.some((s) => s.sourceId === source1Id)).toBe(false);

    // TEST F: Rating changes query integrity
    const recentChanges = await getRecentRatingChanges("wow-forever", 5, database.db);
    expect(recentChanges.length).toBeGreaterThan(0);
    expect(recentChanges[0]!.entityName).toBe("Frost Mage");
    expect(recentChanges[0]!.previousTier).toBe("S");
    expect(recentChanges[0]!.newTier).toBe("A");
    expect(recentChanges[0]!.changeType).toBe("demoted");
  });

  it("strictly selects overall+all on default page independent of database insertion order and isolates builds", async () => {
    const gameId = "game-order-test";
    const vAId = "ver-a";
    const vBId = "ver-b";

    await database.db.insert(games).values({
      id: gameId,
      slug: "order-test",
      name: "Order Test Game",
      publisher: "Test Publisher",
      status: "active",
    });

    await database.db.insert(gameVersions).values([
      { id: vAId, gameId, version: "2.0.0", build: "build-A", levelCap: 60, status: "current" },
      { id: vBId, gameId, version: "2.1.0", build: "build-B", levelCap: 60, status: "active" },
    ]);

    // Deliberately insert other contexts BEFORE overall+all to test order independence
    const ctxDungeon = "ctx-order-dungeon-tank";
    const ctxPvP = "ctx-order-pvp-healer";
    const ctxOverallAll = "ctx-order-overall-all";

    await database.db.insert(rankingContexts).values([
      {
        id: ctxDungeon,
        gameId,
        slug: "order-dungeon-tank",
        mode: "dungeon",
        role: "tank",
        levelCap: 60,
        label: "Dungeon • Tank",
        status: "active",
      },
      {
        id: ctxPvP,
        gameId,
        slug: "order-pvp-healer",
        mode: "pvp",
        role: "healer",
        levelCap: 60,
        label: "PvP • Healer",
        status: "active",
      },
      {
        id: ctxOverallAll,
        gameId,
        slug: "overall-all-order",
        mode: "overall",
        role: "all",
        levelCap: 60,
        label: "Overall • All",
        status: "active",
      },
    ]);

    const entityWarrior = "ent-order-warrior";
    await database.db.insert(entities).values({
      id: entityWarrior,
      gameId,
      name: "Warrior",
      slug: "order-warrior",
      entityType: "class",
      role: "tank",
      sortOrder: 1,
    });

    // Ratings:
    // Dungeon+tank has rating only on Build A
    await database.db.insert(ratings).values({
      id: "rat-warrior-dungeon",
      entityId: entityWarrior,
      rankingContextId: ctxDungeon,
      gameVersionId: vAId,
      tier: "S",
      consensusScore: "90.00",
      sourceCount: 1,
      agreeingSourceCount: 1,
      disagreementLevel: "none",
      dataStatus: "available",
      freshnessStatus: "current",
    });

    // Overall+all has rating on Build A
    await database.db.insert(ratings).values({
      id: "rat-warrior-overall-all",
      entityId: entityWarrior,
      rankingContextId: ctxOverallAll,
      gameVersionId: vAId,
      tier: "A",
      consensusScore: "80.00",
      sourceCount: 1,
      agreeingSourceCount: 1,
      disagreementLevel: "none",
      dataStatus: "available",
      freshnessStatus: "current",
    });

    // 1. Default request must strictly select overall+all even though dungeon was inserted first
    const defaultData = await getGameMetaBoardData({ gameSlug: "order-test", db: database.db });
    expect(defaultData.hasData).toBe(true);
    expect(defaultData.activeContext?.id).toBe(ctxOverallAll);
    expect(defaultData.activeContext?.mode).toBe("overall");
    expect(defaultData.activeContext?.role).toBe("all");

    // 2. In dungeon+tank context, only Build A has rating; Build B exists in DB but MUST NOT be selectable
    const dungeonData = await getGameMetaBoardData({
      gameSlug: "order-test",
      mode: "dungeon",
      role: "tank",
      db: database.db,
    });
    expect(dungeonData.hasData).toBe(true);
    expect(dungeonData.availableBuilds).toEqual(["build-A"]);

    // 3. Requesting Build B in dungeon+tank context must strictly return empty state (no silent fallback)
    const dungeonBuildB = await getGameMetaBoardData({
      gameSlug: "order-test",
      mode: "dungeon",
      role: "tank",
      build: "build-B",
      db: database.db,
    });
    expect(dungeonBuildB.hasData).toBe(false);
    expect(dungeonBuildB.tiers).toEqual([]);

    // 4. Requesting mode "dungeon" without role: since dungeon has NO role=all, strictly return unavailable
    const dungeonNoRole = await getGameMetaBoardData({
      gameSlug: "order-test",
      mode: "dungeon",
      db: database.db,
    });
    expect(dungeonNoRole.hasData).toBe(false);
    expect(dungeonNoRole.activeContext).toBeNull();
  });
});
