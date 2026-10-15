import "server-only";

import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { z } from "zod";
import type { DatabaseClient } from "@/platform/database/client";
import {
  entities,
  entityProfiles,
  evidenceObservations,
  games,
  gameVersions,
  rankingContexts,
  ratingChanges,
  ratings,
  sources,
} from "@/modules/meta-board";
import { elements, roles, tiers, type Character } from "./characters";

const text = z.string().trim().min(1);
const avatarSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    return val;
  },
  z
    .object({
      128: z.string().url(),
      256: z.string().url(),
    })
    .nullable()
    .optional(),
);

const rowSchema = z.object({
  id: text,
  name: text,
  profileId: text,
  ratingId: text,
  editorialStatus: z.enum(["reviewed", "published"]),
  tier: z.enum(tiers.map((tier) => tier.name)),
  primaryRole: z.enum(roles.filter((role) => role !== "All")),
  whyThisTier: text,
  strengths: text,
  constraints: text,
  bestUseContext: text,
  rankingAssumption: text,
  evidenceSummary: text,
  updatedAt: z.date(),
  avatar: avatarSchema,
  metadata: z.object({
    element: text.refine((value) =>
      value
        .split(" / ")
        .every((part) => elements.some((element) => element !== "All" && element === part)),
    ),
    rarity: z.union([z.literal(4), z.literal(5)]),
    weapon: text,
    officialReleaseVersion: text,
    officialUrl: z.url().refine((value) => new URL(value).protocol === "https:"),
  }),
});

export function mapGenshinCharacters(
  input: unknown,
  evidenceSourcesByEntity: ReadonlyMap<string, Character["evidenceSources"]> = new Map(),
): Character[] {
  const rows = z.array(rowSchema).length(121).parse(input);
  if (
    new Set(rows.map((row) => row.id)).size !== 121 ||
    new Set(rows.map((row) => row.ratingId)).size !== 121 ||
    rows.some((row) => row.profileId !== row.id)
  ) {
    throw new Error("Genshin roster, rating and profile coverage must each equal 121");
  }
  return rows
    .map((row) => ({
      id: row.id,
      name: row.name,
      tier: row.tier,
      primaryRole: row.primaryRole,
      whyThisTier: row.whyThisTier,
      strengths: z.array(text).parse(JSON.parse(row.strengths)),
      limitations: z.array(text).parse(JSON.parse(row.constraints)),
      bestUseContext: row.bestUseContext,
      rankingAssumption: row.rankingAssumption,
      evidenceSummary: row.evidenceSummary,
      updatedAt: row.updatedAt.toISOString(),
      evidenceSources: evidenceSourcesByEntity.get(row.id) ?? [],
      avatar: row.avatar ?? null,
      ...row.metadata,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export type GenshinData = {
  version: string;
  context: "endgame-overall";
  characters: Character[];
  updatedAt: string;
  sources: { id: string; name: string; url: string; sourceType: string }[];
  evidenceCount: number;
  changes: {
    id: string;
    name: string;
    previousTier: string;
    newTier: string;
    reason: string | null;
  }[];
};
export type GenshinDataResult =
  | { status: "available"; data: GenshinData }
  | { status: "unavailable" };

export async function loadGenshinData(
  database?: Pick<DatabaseClient, "select">,
): Promise<GenshinDataResult> {
  try {
    const db = database ?? (await import("@/platform/database/application-database")).db;
    const [scope] = await db
      .select({
        gameId: games.id,
        versionId: gameVersions.id,
        version: gameVersions.version,
        contextId: rankingContexts.id,
      })
      .from(games)
      .innerJoin(
        gameVersions,
        and(eq(gameVersions.id, games.currentVersionId), eq(gameVersions.gameId, games.id)),
      )
      .innerJoin(
        rankingContexts,
        and(
          eq(rankingContexts.gameId, games.id),
          eq(rankingContexts.slug, "endgame-overall"),
          eq(rankingContexts.status, "active"),
        ),
      )
      .where(eq(games.slug, "genshin-impact"));
    if (!scope) return { status: "unavailable" };
    const rows = await db
      .select({
        id: entities.id,
        name: entities.name,
        profileId: entityProfiles.entityId,
        metadata: entityProfiles.metadata,
        avatar: entityProfiles.avatar,
        ratingId: ratings.id,
        tier: ratings.tier,
        primaryRole: ratings.primaryRole,
        whyThisTier: ratings.whyThisTier,
        strengths: ratings.strengths,
        constraints: ratings.constraints,
        bestUseContext: ratings.bestUseContext,
        rankingAssumption: ratings.rankingAssumption,
        evidenceSummary: ratings.evidenceSummary,
        editorialStatus: ratings.editorialStatus,
        updatedAt: ratings.updatedAt,
      })
      .from(entities)
      .leftJoin(entityProfiles, eq(entityProfiles.entityId, entities.id))
      .leftJoin(
        ratings,
        and(
          eq(ratings.entityId, entities.id),
          eq(ratings.gameVersionId, scope.versionId),
          eq(ratings.rankingContextId, scope.contextId),
          inArray(ratings.editorialStatus, ["reviewed", "published"]),
        ),
      )
      .where(
        and(
          eq(entities.gameId, scope.gameId),
          eq(entities.entityType, "character"),
          eq(entities.status, "active"),
        ),
      );
    const entityIds = rows.map((row) => row.id);
    const [observations, changes] = await Promise.all([
      db
        .select({
          id: evidenceObservations.id,
          entityId: evidenceObservations.entityId,
          source: {
            id: sources.id,
            name: sources.name,
            url: sources.url,
            sourceType: sources.sourceType,
          },
        })
        .from(evidenceObservations)
        .innerJoin(sources, eq(sources.id, evidenceObservations.sourceId))
        .where(
          and(
            inArray(evidenceObservations.entityId, entityIds),
            eq(evidenceObservations.gameVersionId, scope.versionId),
            or(
              eq(evidenceObservations.rankingContextId, scope.contextId),
              isNull(evidenceObservations.rankingContextId),
            ),
            eq(evidenceObservations.status, "verified"),
          ),
        ),
      db
        .select({
          id: ratingChanges.id,
          name: entities.name,
          previousTier: ratingChanges.previousTier,
          newTier: ratingChanges.newTier,
          reason: ratingChanges.reason,
        })
        .from(ratingChanges)
        .innerJoin(entities, eq(entities.id, ratingChanges.entityId))
        .where(
          and(
            inArray(ratingChanges.entityId, entityIds),
            eq(ratingChanges.toVersionId, scope.versionId),
            eq(ratingChanges.rankingContextId, scope.contextId),
          ),
        ),
    ]);
    const sourcesByEntity = new Map<
      string,
      Map<string, { id: string; name: string; url: string; observationCount: number }>
    >();
    for (const observation of observations) {
      let characterSources = sourcesByEntity.get(observation.entityId);
      if (!characterSources) {
        characterSources = new Map();
        sourcesByEntity.set(observation.entityId, characterSources);
      }
      const existing = characterSources.get(observation.source.id);
      if (existing) {
        existing.observationCount += 1;
      } else {
        characterSources.set(observation.source.id, {
          id: observation.source.id,
          name: observation.source.name,
          url: observation.source.url,
          observationCount: 1,
        });
      }
    }
    const evidenceSourcesByEntity = new Map<string, Character["evidenceSources"]>();
    for (const [entityId, map] of sourcesByEntity.entries()) {
      evidenceSourcesByEntity.set(
        entityId,
        [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "en")),
      );
    }
    const characters = mapGenshinCharacters(rows, evidenceSourcesByEntity);
    const sourceRows = [
      ...new Map(
        observations.map((observation) => [observation.source.id, observation.source]),
      ).values(),
    ].sort((a, b) => a.name.localeCompare(b.name, "en"));
    return {
      status: "available",
      data: {
        version: scope.version,
        context: "endgame-overall",
        characters,
        updatedAt: characters
          .map((character) => character.updatedAt)
          .sort()
          .at(-1)!,
        sources: sourceRows,
        evidenceCount: observations.length,
        changes,
      },
    };
  } catch {
    // Fail closed at the page boundary, including malformed persisted editorial data.
    // Never expose driver errors/credentials or substitute fixture ratings.
    return { status: "unavailable" };
  }
}
