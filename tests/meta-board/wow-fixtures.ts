import { eq } from "drizzle-orm";
import { createDatabaseClient } from "../../src/platform/database/client";
import {
  entities,
  entityProfiles,
  games,
  gameVersions,
  rankingContexts,
  ratings,
  sources,
  sourceRatings,
  ratingChanges,
} from "../../src/modules/meta-board/db/schema";

// Synthetic UI contract data only. This never runs against Neon or the normal local development DB.
export async function seedWowPresentationFixtures() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL required");
  const target = new URL(url);
  if (
    !["localhost", "127.0.0.1"].includes(target.hostname) ||
    !target.pathname.startsWith("/tierlistbase_presentation_test_wow_v1")
  )
    throw new Error("Refusing synthetic data outside dedicated local WoW presentation database");
  const database = createDatabaseClient(url);
  try {
    const [game] = await database.db.select().from(games).where(eq(games.slug, "wow-forever"));
    if (game) {
      if (game.id !== "wow-v1-synthetic-game")
        throw new Error("Refusing to replace existing game data");
      return;
    }
    const now = new Date();
    await database.db.transaction(async (db) => {
      await db
        .insert(games)
        .values({
          id: "wow-v1-synthetic-game",
          slug: "wow-forever",
          name: "World of Warcraft: Forever",
          publisher: "Synthetic test fixture",
        });
      await db.insert(gameVersions).values([
        {
          id: "wow-v1-synthetic-version",
          gameId: "wow-v1-synthetic-game",
          version: "Beta · synthetic test",
          levelCap: 30,
          status: "current",
          notes: JSON.stringify({ phaseId: 1 }),
        },
        {
          id: "wow-v1-foreign-version",
          gameId: "wow-v1-synthetic-game",
          version: "FOREIGN VERSION DO NOT DISPLAY",
          levelCap: 30,
          status: "stale",
        },
      ]);
      await db
        .update(games)
        .set({ currentVersionId: "wow-v1-synthetic-version" })
        .where(eq(games.id, "wow-v1-synthetic-game"));
      await db
        .insert(rankingContexts)
        .values(
          ["dps", "tank", "healer"].map((role) => ({
            id: `wow-v1-${role}`,
            gameId: "wow-v1-synthetic-game",
            slug: `dungeon-${role}-30`,
            mode: "dungeon",
            role,
            levelCap: 30,
            label: `Dungeon · ${role.toUpperCase()} · Level Cap 30`,
          })),
        );
      await db.insert(sources).values([
        {
          id: "wow-v1-data",
          name: "Synthetic Forever Logs fixture",
          url: "https://foreverlogs.gg/",
          sourceType: "data",
          publisher: "Synthetic test only",
          checkedAt: now,
          freshnessStatus: "current",
        },
        {
          id: "wow-v1-foreign-source",
          name: "FOREIGN SOURCE DO NOT DISPLAY",
          url: "https://example.com/foreign",
          sourceType: "expert",
          publisher: "Synthetic test only",
          checkedAt: now,
          freshnessStatus: "stale",
        },
      ]);
      const samples = [
        ["Warrior", "Arms", "dps", 130, 30],
        ["Warrior", "Fury", "dps", 112, 50],
        ["Paladin", "Retribution", "dps", 95, 25],
        ["Hunter", "Beast Mastery", "dps", 101, 40],
        ["Rogue", "Combat", "dps", 109, 30],
        ["Priest", "Shadow", "dps", 88, 20],
        ["Shaman", "Elemental", "dps", 107, 35],
        ["Mage", "Fire", "dps", 126, 60],
        ["Mage", "Frost", "dps", null, 2],
        ["Warlock", "Destruction", "dps", 103, 35],
        ["Druid", "Balance", "dps", 91, 30],
        ["Warrior", "Protection", "tank", 110, 50],
        ["Shaman", "Earthen Guardian", "tank", 125, 25],
        ["Paladin", "Protection", "tank", null, 2],
        ["Priest", "Holy", "healer", 113, 60],
        ["Shaman", "Restoration", "healer", 99, 25],
      ] as const;
      for (let index = 0; index < samples.length; index++) {
        const [className, specName, role, score, parses] = samples[index]!;
        const id = `wow-v1-spec-${index}`;
        const tier =
          score === null
            ? "Pending"
            : score >= 120
              ? "S"
              : score >= 105
                ? "A"
                : score >= 90
                  ? "B"
                  : "C";
        await db
          .insert(entities)
          .values({
            id,
            gameId: "wow-v1-synthetic-game",
            entityType: "spec",
            slug: `synthetic-${index}`,
            name: `${specName} ${className}`,
            role,
          });
        await db.insert(entityProfiles).values({ entityId: id, metadata: { className, specName } });
        await db
          .insert(ratings)
          .values({
            id: `wow-v1-rating-${index}`,
            entityId: id,
            rankingContextId: `wow-v1-${role}`,
            gameVersionId: "wow-v1-synthetic-version",
            tier,
            consensusScore: score === null ? null : String(score),
            dataStatus: score === null ? "unavailable" : "available",
            freshnessStatus: score === null ? "preliminary" : "current",
            whyThisTier: "Synthetic observed evidence",
            updatedAt: now,
          });
        const notes = JSON.stringify({
          derivedBy: "TierListBase",
          dataSource: "Forever Logs Public API",
          attributionUrl: "https://foreverlogs.gg/",
          retrievedAt: now.toISOString(),
          phaseId: 1,
          phaseName: "Beta",
          publicationVerifiedAt: now.toISOString(),
          dungeons: [
            {
              location: "Uldaman",
              median: 200 + index,
              sampleSize: parses,
              included: score !== null,
              normalizedScore: score,
              flags: [],
            },
            {
              location: "Razorfen Downs",
              median: 150 + index,
              sampleSize: parses,
              included: score !== null,
              normalizedScore: score,
              flags: [],
            },
          ],
        });
        await db
          .insert(sourceRatings)
          .values({
            id: `wow-v1-source-rating-${index}`,
            sourceId: "wow-v1-data",
            entityId: id,
            rankingContextId: `wow-v1-${role}`,
            gameVersionId: "wow-v1-synthetic-version",
            rawTier: tier,
            normalizedTier: tier,
            rawScore: score === null ? null : String(score),
            normalizedScore: score === null ? null : String(score),
            sampleSize: parses * 2,
            collectedAt: now,
            notes,
          });
      }
      await db.insert(ratingChanges).values([
        {
          id: "wow-v1-change",
          entityId: "wow-v1-spec-1",
          rankingContextId: "wow-v1-dps",
          fromVersionId: "wow-v1-synthetic-version",
          toVersionId: "wow-v1-synthetic-version",
          previousTier: "B",
          newTier: "A",
          changeType: "promoted",
          reason: "Synthetic ranking movement",
          changedAt: now,
        },
        {
          id: "wow-v1-foreign-change",
          entityId: "wow-v1-spec-1",
          rankingContextId: "wow-v1-tank",
          fromVersionId: "wow-v1-synthetic-version",
          toVersionId: "wow-v1-foreign-version",
          previousTier: "C",
          newTier: "S",
          changeType: "promoted",
          reason: "FOREIGN CHANGE DO NOT DISPLAY",
          changedAt: now,
        },
      ]);
      await db
        .insert(sourceRatings)
        .values({
          id: "wow-v1-foreign-rating",
          sourceId: "wow-v1-foreign-source",
          entityId: "wow-v1-spec-0",
          rankingContextId: "wow-v1-tank",
          gameVersionId: "wow-v1-foreign-version",
          rawTier: "S",
          normalizedTier: "S",
          notes: "FOREIGN EVIDENCE DO NOT DISPLAY",
        });
    });
  } finally {
    await database.close();
  }
}
