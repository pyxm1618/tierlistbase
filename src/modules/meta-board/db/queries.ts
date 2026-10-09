import { and, desc, eq } from "drizzle-orm";

async function getDb() {
  const { db } = await import("@/platform/database/application-database");
  return db;
}

import { entities, gameVersions, games, rankingContexts, ratingChanges, ratings } from "./schema";

export type BoardTierGroup = {
  tier: string;
  items: {
    entityId: string;
    entityName: string;
    entitySlug: string;
    entityType: string;
    role: string;
    tier: string;
    consensusScore: number | null;
    sourceCount: number;
    agreeingSourceCount: number;
    disagreementLevel: string;
    dataStatus: string;
    freshnessStatus: string;
    whyThisTier: string | null;
    strengths: string | null;
    constraints: string | null;
    lastUpdated: Date;
  }[];
};

export type MetaBoardData = {
  game: {
    id: string;
    name: string;
    slug: string;
  } | null;
  version: {
    id: string;
    version: string;
    build: string | null;
    levelCap: number | null;
    status: string;
  } | null;
  activeContext: {
    id: string;
    slug: string;
    mode: string;
    role: string;
    levelCap: number | null;
    label: string;
  } | null;
  availableModes: string[];
  availableRoles: string[];
  tiers: BoardTierGroup[];
  hasData: boolean;
};

export async function getGameMetaBoardData(options?: {
  gameSlug?: string;
  mode?: string;
  role?: string;
}): Promise<MetaBoardData> {
  const gameSlug = options?.gameSlug ?? "wow-forever";
  const targetMode = options?.mode ?? "overall";
  const targetRole = options?.role ?? "all";
  const db = await getDb();

  // 1. Fetch game
  const [gameRow] = await db
    .select()
    .from(games)
    .where(and(eq(games.slug, gameSlug), eq(games.status, "active")))
    .limit(1);

  if (!gameRow) {
    return {
      game: null,
      version: null,
      activeContext: null,
      availableModes: ["overall", "leveling", "dungeon", "pvp"],
      availableRoles: ["all", "dps", "tank", "healer"],
      tiers: [],
      hasData: false,
    };
  }

  // 2. Fetch current version
  let versionRow = null;
  if (gameRow.currentVersionId) {
    const [v] = await db
      .select()
      .from(gameVersions)
      .where(eq(gameVersions.id, gameRow.currentVersionId))
      .limit(1);
    versionRow = v ?? null;
  }

  if (!versionRow) {
    const [latestV] = await db
      .select()
      .from(gameVersions)
      .where(and(eq(gameVersions.gameId, gameRow.id), eq(gameVersions.status, "current")))
      .limit(1);
    versionRow = latestV ?? null;
  }

  // 3. Fetch active ranking context
  const [contextRow] = await db
    .select()
    .from(rankingContexts)
    .where(
      and(
        eq(rankingContexts.gameId, gameRow.id),
        eq(rankingContexts.mode, targetMode),
        eq(rankingContexts.role, targetRole),
        eq(rankingContexts.status, "active"),
      ),
    )
    .limit(1);

  if (!contextRow || !versionRow) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
      version: versionRow
        ? {
            id: versionRow.id,
            version: versionRow.version,
            build: versionRow.build,
            levelCap: versionRow.levelCap,
            status: versionRow.status,
          }
        : null,
      activeContext: contextRow
        ? {
            id: contextRow.id,
            slug: contextRow.slug,
            mode: contextRow.mode,
            role: contextRow.role,
            levelCap: contextRow.levelCap,
            label: contextRow.label,
          }
        : null,
      availableModes: ["overall", "leveling", "dungeon", "pvp"],
      availableRoles: ["all", "dps", "tank", "healer"],
      tiers: [],
      hasData: false,
    };
  }

  // 4. Fetch ratings for this context and version
  const rows = await db
    .select({
      entityId: entities.id,
      entityName: entities.name,
      entitySlug: entities.slug,
      entityType: entities.entityType,
      role: entities.role,
      sortOrder: entities.sortOrder,
      tier: ratings.tier,
      consensusScore: ratings.consensusScore,
      sourceCount: ratings.sourceCount,
      agreeingSourceCount: ratings.agreeingSourceCount,
      disagreementLevel: ratings.disagreementLevel,
      dataStatus: ratings.dataStatus,
      freshnessStatus: ratings.freshnessStatus,
      whyThisTier: ratings.whyThisTier,
      strengths: ratings.strengths,
      constraints: ratings.constraints,
      updatedAt: ratings.updatedAt,
    })
    .from(ratings)
    .innerJoin(entities, eq(ratings.entityId, entities.id))
    .where(
      and(eq(ratings.rankingContextId, contextRow.id), eq(ratings.gameVersionId, versionRow.id)),
    );

  if (rows.length === 0) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
      version: {
        id: versionRow.id,
        version: versionRow.version,
        build: versionRow.build,
        levelCap: versionRow.levelCap,
        status: versionRow.status,
      },
      activeContext: {
        id: contextRow.id,
        slug: contextRow.slug,
        mode: contextRow.mode,
        role: contextRow.role,
        levelCap: contextRow.levelCap,
        label: contextRow.label,
      },
      availableModes: ["overall", "leveling", "dungeon", "pvp"],
      availableRoles: ["all", "dps", "tank", "healer"],
      tiers: [],
      hasData: false,
    };
  }

  // Group by tier
  const tierOrder = ["S", "A", "B", "C", "D", "F"];
  const grouped = new Map<string, BoardTierGroup["items"]>();

  for (const row of rows) {
    const tier = row.tier.toUpperCase();
    if (!grouped.has(tier)) {
      grouped.set(tier, []);
    }
    grouped.get(tier)!.push({
      entityId: row.entityId,
      entityName: row.entityName,
      entitySlug: row.entitySlug,
      entityType: row.entityType,
      role: row.role,
      tier: row.tier,
      consensusScore: row.consensusScore ? Number(row.consensusScore) : null,
      sourceCount: row.sourceCount,
      agreeingSourceCount: row.agreeingSourceCount,
      disagreementLevel: row.disagreementLevel,
      dataStatus: row.dataStatus,
      freshnessStatus: row.freshnessStatus,
      whyThisTier: row.whyThisTier,
      strengths: row.strengths,
      constraints: row.constraints,
      lastUpdated: row.updatedAt,
    });
  }

  // Sort tiers according to standard tier order, followed by other unexpected tiers
  const sortedTiers: BoardTierGroup[] = [];
  for (const tier of tierOrder) {
    if (grouped.has(tier)) {
      sortedTiers.push({ tier, items: grouped.get(tier)! });
      grouped.delete(tier);
    }
  }
  for (const [tier, items] of grouped.entries()) {
    sortedTiers.push({ tier, items });
  }

  return {
    game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
    version: {
      id: versionRow.id,
      version: versionRow.version,
      build: versionRow.build,
      levelCap: versionRow.levelCap,
      status: versionRow.status,
    },
    activeContext: {
      id: contextRow.id,
      slug: contextRow.slug,
      mode: contextRow.mode,
      role: contextRow.role,
      levelCap: contextRow.levelCap,
      label: contextRow.label,
    },
    availableModes: ["overall", "leveling", "dungeon", "pvp"],
    availableRoles: ["all", "dps", "tank", "healer"],
    tiers: sortedTiers,
    hasData: sortedTiers.length > 0,
  };
}

export type RecentRatingChangeItem = {
  id: string;
  entityName: string;
  entitySlug: string;
  previousTier: string;
  newTier: string;
  changeType: string;
  reason: string | null;
  evidence: string | null;
  changedAt: Date;
  contextLabel: string;
  toVersion: string;
};

export async function getRecentRatingChanges(
  gameSlug = "wow-forever",
  limit = 10,
): Promise<RecentRatingChangeItem[]> {
  const db = await getDb();
  const changes = await db
    .select({
      id: ratingChanges.id,
      entityName: entities.name,
      entitySlug: entities.slug,
      previousTier: ratingChanges.previousTier,
      newTier: ratingChanges.newTier,
      changeType: ratingChanges.changeType,
      reason: ratingChanges.reason,
      evidence: ratingChanges.evidence,
      changedAt: ratingChanges.changedAt,
      contextLabel: rankingContexts.label,
      toVersion: gameVersions.version,
    })
    .from(ratingChanges)
    .innerJoin(entities, eq(ratingChanges.entityId, entities.id))
    .innerJoin(rankingContexts, eq(ratingChanges.rankingContextId, rankingContexts.id))
    .innerJoin(gameVersions, eq(ratingChanges.toVersionId, gameVersions.id))
    .innerJoin(games, eq(entities.gameId, games.id))
    .where(eq(games.slug, gameSlug))
    .orderBy(desc(ratingChanges.changedAt))
    .limit(limit);

  return changes;
}
