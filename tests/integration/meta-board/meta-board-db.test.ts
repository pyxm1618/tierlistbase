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

    // TEST A: Verify active context filters derived dynamically from DB
    const v1OverallData = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "overall",
      role: "dps",
      db: database.db,
    });

    expect(v1OverallData.hasData).toBe(true);
    expect(v1OverallData.availableModes.sort()).toEqual(["leveling", "overall", "pvp"].sort());
    // In overall mode, only role "dps" exists in seed; "healer" belongs strictly to pvp
    expect(v1OverallData.availableRoles).toEqual(["dps"]);
    expect(v1OverallData.availableLevels).toEqual([60]);
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
    // Mode "leveling" only has role "dps" in seed
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

    // TEST E: Source evidence query integrity
    const mageItem = overallSGroup?.items.find((i) => i.entityName === "Frost Mage");
    expect(mageItem).toBeDefined();
    expect(mageItem!.sources.length).toBeGreaterThan(0);
    expect(mageItem!.sources[0]!.sourceName).toBe("Warcraft Meta Digest");
    expect(mageItem!.sources[0]!.rawTier).toBe("S");
    expect(mageItem!.sources[0]!.versionMatch).toBe(true);
    expect(mageItem!.sources[0]!.sourceType).toBe("expert");
    expect(mageItem!.sources[0]!.publisher).toBe("Community Editors");
    expect(mageItem!.sources[0]!.checkedAt).toBeDefined();

    // TEST F: Rating changes query integrity
    const recentChanges = await getRecentRatingChanges("wow-forever", 5, database.db);
    expect(recentChanges.length).toBeGreaterThan(0);
    expect(recentChanges[0]!.entityName).toBe("Frost Mage");
    expect(recentChanges[0]!.previousTier).toBe("S");
    expect(recentChanges[0]!.newTier).toBe("A");
    expect(recentChanges[0]!.changeType).toBe("demoted");
  });
});
