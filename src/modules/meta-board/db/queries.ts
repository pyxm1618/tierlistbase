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
  tierChanges: NonNullable<BoardEntityItem["latestTierChange"]>[];
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

  // 2. Fetch all combinations of (context, version) that actually have ratings for this game
  const activeRatingCombinations = await db
    .selectDistinct({
      contextId: rankingContexts.id,
      mode: rankingContexts.mode,
      role: rankingContexts.role,
      levelCap: rankingContexts.levelCap,
      contextLabel: rankingContexts.label,
      contextSlug: rankingContexts.slug,
      versionId: gameVersions.id,
      versionString: gameVersions.version,
      build: gameVersions.build,
      versionStatus: gameVersions.status,
      versionLevelCap: gameVersions.levelCap,
    })
    .from(ratings)
    .innerJoin(rankingContexts, eq(ratings.rankingContextId, rankingContexts.id))
    .innerJoin(gameVersions, eq(ratings.gameVersionId, gameVersions.id))
    .where(
      and(
        eq(rankingContexts.gameId, gameRow.id),
        eq(rankingContexts.status, "active"),
        eq(gameVersions.gameId, gameRow.id),
      ),
    );

  if (activeRatingCombinations.length === 0) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
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

  // 3. Determine selected game version deterministically
  let selectedVersionRow: {
    id: string;
    version: string;
    build: string | null;
    levelCap: number | null;
    status: string;
  } | null = null;

  if (options?.build) {
    // If a specific build was requested, strictly require active ratings for this build
    const matchByBuild = activeRatingCombinations.find((c) => c.build === options.build);
    if (!matchByBuild) {
      return {
        game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
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
    selectedVersionRow = {
      id: matchByBuild.versionId,
      version: matchByBuild.versionString,
      build: matchByBuild.build,
      levelCap: matchByBuild.versionLevelCap,
      status: matchByBuild.versionStatus,
    };
  } else {
    // Deterministic selection: currentVersionId -> status==='current' -> highest version string
    const distinctVersions = Array.from(
      new Map(
        activeRatingCombinations.map((c) => [
          c.versionId,
          {
            id: c.versionId,
            version: c.versionString,
            build: c.build,
            levelCap: c.versionLevelCap,
            status: c.versionStatus,
          },
        ]),
      ).values(),
    ).sort((a, b) => b.version.localeCompare(a.version));

    selectedVersionRow =
      (gameRow.currentVersionId
        ? distinctVersions.find((v) => v.id === gameRow.currentVersionId)
        : null) ??
      distinctVersions.find((v) => v.status === "current") ??
      distinctVersions[0] ??
      null;
  }

  if (!selectedVersionRow) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
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

  // 4. In the selected version, find valid combinations
  const versionCombinations = activeRatingCombinations.filter(
    (c) => c.versionId === selectedVersionRow.id,
  );

  const availableModes = Array.from(
    new Set(versionCombinations.map((c) => c.mode).filter(Boolean)),
  ).sort();

  if (availableModes.length === 0) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
      version: selectedVersionRow,
      activeContext: null,
      availableModes: [],
      availableRoles: [],
      availableLevels: [],
      availableBuilds: [],
      tiers: [],
      hasData: false,
    };
  }

  let targetMode: string;
  if (options?.mode) {
    if (!availableModes.includes(options.mode)) {
      return {
        game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
        version: selectedVersionRow,
        activeContext: null,
        availableModes,
        availableRoles: [],
        availableLevels: [],
        availableBuilds: [],
        tiers: [],
        hasData: false,
      };
    }
    targetMode = options.mode;
  } else {
    // Default page: must explicitly prefer "overall"
    if (availableModes.includes("overall")) {
      targetMode = "overall";
    } else {
      // If "overall" is not an active ranking context in current version, return explicit unavailable state
      return {
        game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
        version: selectedVersionRow,
        activeContext: null,
        availableModes,
        availableRoles: [],
        availableLevels: [],
        availableBuilds: [],
        tiers: [],
        hasData: false,
      };
    }
  }

  const modeCombinations = versionCombinations.filter((c) => c.mode === targetMode);

  const availableRoles = Array.from(
    new Set(modeCombinations.map((c) => c.role).filter(Boolean)),
  ).sort();
  const availableLevels = Array.from(
    new Set(
      modeCombinations
        .map((c) => c.levelCap)
        .filter((l): l is number => l !== null && l !== undefined),
    ),
  ).sort((a, b) => a - b);

  let targetRole: string;
  if (options?.role) {
    if (!availableRoles.includes(options.role)) {
      return {
        game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
        version: selectedVersionRow,
        activeContext: null,
        availableModes,
        availableRoles,
        availableLevels,
        availableBuilds: [],
        tiers: [],
        hasData: false,
      };
    }
    targetRole = options.role;
  } else {
    // When role is not explicitly specified, require real "all" ranking context
    if (availableRoles.includes("all")) {
      targetRole = "all";
    } else {
      // "all" does NOT exist as an active ranking context in targetMode.
      // Do NOT arbitrarily pick the first context; return explicit empty state.
      return {
        game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
        version: selectedVersionRow,
        activeContext: null,
        availableModes,
        availableRoles,
        availableLevels,
        availableBuilds: [],
        tiers: [],
        hasData: false,
      };
    }
  }

  let targetLevel = options?.levelCap;
  if (targetLevel !== undefined) {
    if (!availableLevels.includes(targetLevel)) {
      return {
        game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
        version: selectedVersionRow,
        activeContext: null,
        availableModes,
        availableRoles,
        availableLevels,
        availableBuilds: [],
        tiers: [],
        hasData: false,
      };
    }
  } else {
    const matchingLevels = modeCombinations
      .filter((c) => c.role === targetRole)
      .map((c) => c.levelCap)
      .filter((l): l is number => l !== null && l !== undefined);
    if (matchingLevels.length > 0) {
      targetLevel = Math.max(...matchingLevels);
    }
  }

  const matchingContexts = modeCombinations
    .filter((c) => {
      const matchRole = c.role === targetRole;
      const matchLevel = targetLevel !== undefined ? c.levelCap === targetLevel : true;
      return matchRole && matchLevel;
    })
    .sort((a, b) => a.contextSlug.localeCompare(b.contextSlug));

  const chosenContext = matchingContexts[0];
  if (!chosenContext) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
      version: selectedVersionRow,
      activeContext: null,
      availableModes,
      availableRoles,
      availableLevels,
      availableBuilds: [],
      tiers: [],
      hasData: false,
    };
  }

  // 5. availableBuilds: builds that actually have ratings in THIS chosen ranking context!
  const buildsForCurrentContext = activeRatingCombinations
    .filter((c) => c.contextId === chosenContext.contextId)
    .map((c) => c.build)
    .filter((b): b is string => Boolean(b));

  const availableBuilds = Array.from(new Set(buildsForCurrentContext)).sort();

  // If a specific build was requested, verify that the chosen context actually has ratings for this build
  if (options?.build && !availableBuilds.includes(options.build)) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
      version: selectedVersionRow,
      activeContext: null,
      availableModes,
      availableRoles,
      availableLevels,
      availableBuilds,
      tiers: [],
      hasData: false,
    };
  }

  // 6. Fetch ratings for this context and version
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
      and(
        eq(ratings.rankingContextId, chosenContext.contextId),
        eq(ratings.gameVersionId, selectedVersionRow.id),
      ),
    );

  if (rows.length === 0) {
    return {
      game: { id: gameRow.id, name: gameRow.name, slug: gameRow.slug },
      version: selectedVersionRow,
      activeContext: {
        id: chosenContext.contextId,
        slug: chosenContext.contextSlug,
        mode: chosenContext.mode,
        role: chosenContext.role,
        levelCap: chosenContext.levelCap,
        label: chosenContext.contextLabel,
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

  // 7. Fetch associated source ratings strictly isolated to CURRENT version and context
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
        eq(sourceRatings.rankingContextId, chosenContext.contextId),
        eq(sourceRatings.gameVersionId, selectedVersionRow.id),
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
      versionMatch: item.ratingGameVersionId === selectedVersionRow.id,
      notes: item.notes,
    });
  }

  // 8. Fetch latest rating changes for these entities strictly for CURRENT version and context
  const changeRows = await db
    .select()
    .from(ratingChanges)
    .where(
      and(
        inArray(ratingChanges.entityId, entityIds),
        eq(ratingChanges.rankingContextId, chosenContext.contextId),
        eq(ratingChanges.toVersionId, selectedVersionRow.id),
      ),
    )
    .orderBy(desc(ratingChanges.changedAt));

  const latestChangeByEntity = new Map<string, BoardEntityItem["latestTierChange"]>();
  const changesByEntity = new Map<string, BoardEntityItem["tierChanges"]>();
  for (const c of changeRows) {
    const history = changesByEntity.get(c.entityId) ?? [];
    history.push({
      previousTier: c.previousTier,
      newTier: c.newTier,
      changeType: c.changeType,
      reason: c.reason,
      changedAt: c.changedAt,
    });
    changesByEntity.set(c.entityId, history);
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

  // 9. Group only existing DB tiers without fabricating missing ones
  const baseVisualOrder = ["S", "A", "B", "C"];
  const grouped = new Map<string, BoardEntityItem[]>();

  for (const row of rows) {
    const tier = row.tier.toUpperCase();
    if (!grouped.has(tier)) {
      grouped.set(tier, []);
    }
    const entitySources = evidenceByEntity.get(row.entityId) ?? [];

    // TRUST INVARIANT:
    // UI sourceCount & agreeingSourceCount must strictly derive from and align with real evidence in Drawer.
    // Ensure 100% auditability between UI badges and Drawer records.
    const sourceCount = entitySources.length;
    const agreeingSourceCount = entitySources.filter(
      (s) => s.normalizedTier && s.normalizedTier.toUpperCase() === tier,
    ).length;
    const agreementRatio =
      sourceCount > 0 ? Number((agreeingSourceCount / sourceCount).toFixed(4)) : 0;

    grouped.get(tier)!.push({
      entityId: row.entityId,
      entityName: row.entityName,
      entitySlug: row.entitySlug,
      entityType: row.entityType,
      role: row.role,
      tier: row.tier,
      currentContextLabel: chosenContext.contextLabel,
      versionString: selectedVersionRow.version,
      buildString: selectedVersionRow.build,
      consensusScore: row.consensusScore ? Number(row.consensusScore) : null,
      sourceCount,
      agreeingSourceCount,
      agreementRatio,
      disagreementLevel: row.disagreementLevel,
      dataStatus: row.dataStatus,
      freshnessStatus: row.freshnessStatus,
      whyThisTier: row.whyThisTier,
      strengths: row.strengths,
      constraints: row.constraints,
      lastUpdated: row.updatedAt,
      latestTierChange: latestChangeByEntity.get(row.entityId) ?? null,
      tierChanges: changesByEntity.get(row.entityId) ?? [],
      sources: entitySources,
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
      id: selectedVersionRow.id,
      version: selectedVersionRow.version,
      build: selectedVersionRow.build,
      levelCap: selectedVersionRow.levelCap,
      status: selectedVersionRow.status,
    },
    activeContext: {
      id: chosenContext.contextId,
      slug: chosenContext.contextSlug,
      mode: chosenContext.mode,
      role: chosenContext.role,
      levelCap: chosenContext.levelCap,
      label: chosenContext.contextLabel,
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
  filters?: {
    rankingContextId?: string | undefined;
    toVersionId?: string | undefined;
  },
): Promise<RecentRatingChangeItem[]> {
  const db = dbInstance ?? (await getDb());

  const conditions = [eq(games.slug, gameSlug)];
  if (filters?.rankingContextId) {
    conditions.push(eq(ratingChanges.rankingContextId, filters.rankingContextId));
  }
  if (filters?.toVersionId) {
    conditions.push(eq(ratingChanges.toVersionId, filters.toVersionId));
  }

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
    .where(and(...conditions))
    .orderBy(desc(ratingChanges.changedAt))
    .limit(limit);

  return changes;
}
