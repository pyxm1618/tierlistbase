import { and, desc, eq, inArray } from "drizzle-orm";
import type { DatabaseClient } from "@/platform/database/client";

async function getDb() {
  const { db } = await import("@/platform/database/application-database");
  return db;
}

import {
  entities,
  gameVersions,
  games,
  rankingContexts,
  ratingChanges,
  ratings,
  sourceRatings,
  sources,
} from "./schema";

export type SourceEvidenceItem = {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string; // 'expert' | 'data' | 'aggregator'
  publisher: string;
  publishedAt: Date | null;
  updatedAtSource: Date | null;
  checkedAt: Date;
  rawTier: string;
  rawRank: number | null;
  rawScore: number | null;
  normalizedTier: string | null;
  normalizedScore: number | null;
  sourceFreshness: string;
  versionMatch: boolean;
  notes: string | null;
};

export type BoardEntityItem = {
  entityId: string;
  entityName: string;
  entitySlug: string;
  entityType: string;
  role: string;
  tier: string;
  currentContextLabel: string;
  versionString: string;
  buildString: string | null;
  consensusScore: number | null;
  sourceCount: number;
  agreeingSourceCount: number;
  agreementRatio: number;
  disagreementLevel: string;
  dataStatus: string;
  freshnessStatus: string;
  whyThisTier: string | null;
  strengths: string | null;
  constraints: string | null;
  lastUpdated: Date;
  latestTierChange: {
    previousTier: string;
    newTier: string;
    changeType: string;
    reason: string | null;
    changedAt: Date;
  } | null;
  sources: SourceEvidenceItem[];
};

export type BoardTierGroup = {
  tier: string;
  items: BoardEntityItem[];
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
  availableLevels: number[];
  availableBuilds: string[];
  tiers: BoardTierGroup[];
  hasData: boolean;
};

export async function getGameMetaBoardData(options?: {
  gameSlug?: string | undefined;
  mode?: string | undefined;
  role?: string | undefined;
  levelCap?: number | undefined;
  build?: string | undefined;
  db?: DatabaseClient | undefined;
}): Promise<MetaBoardData> {
  const gameSlug = options?.gameSlug ?? "wow-forever";
  const db = options?.db ?? (await getDb());

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
      availableModes: [],
      availableRoles: [],
      availableLevels: [],
      availableBuilds: [],
      tiers: [],
      hasData: false,
    };
  }

  // 2. Fetch available game versions
  const allVersions = await db
    .select()
    .from(gameVersions)
    .where(eq(gameVersions.gameId, gameRow.id));

  const availableBuilds = Array.from(
    new Set(allVersions.map((v) => v.build).filter((b): b is string => Boolean(b))),
  );

  let versionRow = null;
  if (options?.build) {
    versionRow = allVersions.find((v) => v.build === options.build) ?? null;
  }
  if (!versionRow && gameRow.currentVersionId) {
    versionRow = allVersions.find((v) => v.id === gameRow.currentVersionId) ?? null;
  }
  if (!versionRow) {
    versionRow = allVersions.find((v) => v.status === "current") ?? allVersions[0] ?? null;
  }

  // 3. Fetch active ranking contexts from DB for this game
  const activeContextRows = await db
    .select()
    .from(rankingContexts)
    .where(and(eq(rankingContexts.gameId, gameRow.id), eq(rankingContexts.status, "active")));

  const availableModes = Array.from(new Set(activeContextRows.map((c) => c.mode).filter(Boolean)));
  const availableRoles = Array.from(new Set(activeContextRows.map((c) => c.role).filter(Boolean)));
  const availableLevels = Array.from(
    new Set(
      activeContextRows
        .map((c) => c.levelCap)
        .filter((l): l is number => l !== null && l !== undefined),
    ),
  );

  if (activeContextRows.length === 0 || !versionRow) {
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
      activeContext: null,
      availableModes,
      availableRoles,
      availableLevels,
      availableBuilds,
      tiers: [],
      hasData: false,
    };
  }

  // If a specific mode was requested but doesn't exist in DB, return empty state
  if (options?.mode && !availableModes.includes(options.mode)) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
      version: {
        id: versionRow.id,
        version: versionRow.version,
        build: versionRow.build,
        levelCap: versionRow.levelCap,
        status: versionRow.status,
      },
      activeContext: null,
      availableModes,
      availableRoles,
      availableLevels,
      availableBuilds,
      tiers: [],
      hasData: false,
    };
  }

  // Match target context based on provided options or available defaults
  const targetMode = options?.mode ?? availableModes[0];
  const targetRole = options?.role;
  const targetLevel = options?.levelCap;

  let contextRow = activeContextRows.find((c) => {
    const matchMode = c.mode === targetMode;
    const matchRole = targetRole ? c.role === targetRole : true;
    const matchLevel = targetLevel !== undefined ? c.levelCap === targetLevel : true;
    return matchMode && matchRole && matchLevel;
  });

  // If role/level wasn't explicitly given, fallback to first matching mode
  if (!contextRow && !targetRole && targetLevel === undefined) {
    contextRow = activeContextRows.find((c) => c.mode === targetMode) ?? undefined;
  }

  if (!contextRow) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
      version: {
        id: versionRow.id,
        version: versionRow.version,
        build: versionRow.build,
        levelCap: versionRow.levelCap,
        status: versionRow.status,
      },
      activeContext: null,
      availableModes,
      availableRoles,
      availableLevels,
      availableBuilds,
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
      availableModes,
      availableRoles,
      availableLevels,
      availableBuilds,
      tiers: [],
      hasData: false,
    };
  }

  const entityIds = rows.map((r) => r.entityId);

  // 5. Fetch associated source ratings and sources for evidence
  const sourceEvidenceRows = await db
    .select({
      entityId: sourceRatings.entityId,
      sourceId: sources.id,
      sourceName: sources.name,
      sourceUrl: sources.url,
      sourceType: sources.sourceType,
      publisher: sources.publisher,
      publishedAt: sources.publishedAt,
      updatedAtSource: sources.updatedAtSource,
      checkedAt: sources.checkedAt,
      rawTier: sourceRatings.rawTier,
      rawRank: sourceRatings.rawRank,
      rawScore: sourceRatings.rawScore,
      normalizedTier: sourceRatings.normalizedTier,
      normalizedScore: sourceRatings.normalizedScore,
      sourceFreshness: sources.freshnessStatus,
      ratingGameVersionId: sourceRatings.gameVersionId,
      notes: sourceRatings.notes,
    })
    .from(sourceRatings)
    .innerJoin(sources, eq(sourceRatings.sourceId, sources.id))
    .where(
      and(
        inArray(sourceRatings.entityId, entityIds),
        eq(sourceRatings.rankingContextId, contextRow.id),
      ),
    );

  const evidenceByEntity = new Map<string, SourceEvidenceItem[]>();
  for (const item of sourceEvidenceRows) {
    if (!evidenceByEntity.has(item.entityId)) {
      evidenceByEntity.set(item.entityId, []);
    }
    evidenceByEntity.get(item.entityId)!.push({
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      sourceType: item.sourceType,
      publisher: item.publisher,
      publishedAt: item.publishedAt,
      updatedAtSource: item.updatedAtSource,
      checkedAt: item.checkedAt,
      rawTier: item.rawTier,
      rawRank: item.rawRank,
      rawScore: item.rawScore ? Number(item.rawScore) : null,
      normalizedTier: item.normalizedTier,
      normalizedScore: item.normalizedScore ? Number(item.normalizedScore) : null,
      sourceFreshness: item.sourceFreshness,
      versionMatch: item.ratingGameVersionId === versionRow.id,
      notes: item.notes,
    });
  }

  // 6. Fetch latest rating changes for these entities in this context
  const changeRows = await db
    .select()
    .from(ratingChanges)
    .where(
      and(
        inArray(ratingChanges.entityId, entityIds),
        eq(ratingChanges.rankingContextId, contextRow.id),
      ),
    )
    .orderBy(desc(ratingChanges.changedAt));

  const latestChangeByEntity = new Map<string, BoardEntityItem["latestTierChange"]>();
  for (const c of changeRows) {
    if (!latestChangeByEntity.has(c.entityId)) {
      latestChangeByEntity.set(c.entityId, {
        previousTier: c.previousTier,
        newTier: c.newTier,
        changeType: c.changeType,
        reason: c.reason,
        changedAt: c.changedAt,
      });
    }
  }

  // 7. Group only existing DB tiers without fabricating missing ones
  const baseVisualOrder = ["S", "A", "B", "C"];
  const grouped = new Map<string, BoardEntityItem[]>();

  for (const row of rows) {
    const tier = row.tier.toUpperCase();
    if (!grouped.has(tier)) {
      grouped.set(tier, []);
    }
    const agreementRatio =
      row.sourceCount > 0 ? Number((row.agreeingSourceCount / row.sourceCount).toFixed(4)) : 0;

    grouped.get(tier)!.push({
      entityId: row.entityId,
      entityName: row.entityName,
      entitySlug: row.entitySlug,
      entityType: row.entityType,
      role: row.role,
      tier: row.tier,
      currentContextLabel: contextRow.label,
      versionString: versionRow.version,
      buildString: versionRow.build,
      consensusScore: row.consensusScore ? Number(row.consensusScore) : null,
      sourceCount: row.sourceCount,
      agreeingSourceCount: row.agreeingSourceCount,
      agreementRatio,
      disagreementLevel: row.disagreementLevel,
      dataStatus: row.dataStatus,
      freshnessStatus: row.freshnessStatus,
      whyThisTier: row.whyThisTier,
      strengths: row.strengths,
      constraints: row.constraints,
      lastUpdated: row.updatedAt,
      latestTierChange: latestChangeByEntity.get(row.entityId) ?? null,
      sources: evidenceByEntity.get(row.entityId) ?? [],
    });
  }

  const sortedTiers: BoardTierGroup[] = [];
  for (const tier of baseVisualOrder) {
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
    availableModes,
    availableRoles,
    availableLevels,
    availableBuilds,
    tiers: sortedTiers,
    hasData: true,
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
  dbInstance?: DatabaseClient,
): Promise<RecentRatingChangeItem[]> {
  const db = dbInstance ?? (await getDb());

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
