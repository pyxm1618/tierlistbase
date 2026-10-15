import { z } from "zod";
import type { BoardEntityItem, MetaBoardData } from "../db/queries";

import {
  validatePublicationReview,
  type PublicationReview,
} from "../domain/forever-logs-publication";
import { FOREVER_LOGS_DATA_TIER_BANDS } from "../domain/forever-logs-data-tier";
import { WOW_CLASSES, WOW_DUNGEONS } from "../domain/wow-context";
export { WOW_CLASSES, WOW_DUNGEONS, WOW_ROLES } from "../domain/wow-context";
const dungeonSchema = z.object({
  location: z.enum(WOW_DUNGEONS),
  median: z.number().positive(),
  sampleSize: z.number().int().nonnegative(),
  included: z.boolean(),
  normalizedScore: z.number().positive().nullable(),
  flags: z.array(z.string()),
});
const evidenceSchema = z.object({
  derivedBy: z.literal("TierListBase"),
  dataSource: z.literal("Forever Logs Public API"),
  attributionUrl: z.url().refine((value) => new URL(value).hostname === "foreverlogs.gg"),
  retrievedAt: z.iso.datetime(),
  phaseId: z.number().int().positive().optional(),
  phaseName: z.string().optional(),
  publicationVerifiedAt: z.iso.datetime().optional(),
  dungeons: z.array(dungeonSchema).min(1).max(4),
});
export type DungeonEvidence = z.infer<typeof dungeonSchema>;
export type WowSpec = {
  id: string;
  name: string;
  specName: string;
  className: string | null;
  role: string;
  tier: string;
  rank: number | null;
  score: number | null;
  parses: number | null;
  coverage: number | null;
  dungeons: DungeonEvidence[];
  retrievedAt: string | null;
  status: string;
  evidenceIssue: string | null;
  item: BoardEntityItem;
};
export function parseDungeonEvidence(notes: string | null) {
  if (!notes) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(notes);
  } catch {
    return null;
  }
  const result = evidenceSchema.safeParse(parsed);
  if (!result.success) return null;
  if (new Set(result.data.dungeons.map((d) => d.location)).size !== result.data.dungeons.length)
    return null;
  if (
    result.data.dungeons.some((d) => d.included && (d.sampleSize < 5 || d.normalizedScore === null))
  )
    return null;
  return result.data;
}
export function buildWowSpecs(board: MetaBoardData): WowSpec[] {
  const items = board.tiers.flatMap((group) => group.items);
  const specs = items
    .map((item): WowSpec => {
      const sources = item.sources.filter(
        (source) =>
          source.sourceType === "data" &&
          source.versionMatch &&
          /^https:\/\/foreverlogs\.gg\/?$/.test(source.sourceUrl),
      );
      const evidence = sources.length === 1 ? parseDungeonEvidence(sources[0]!.notes) : null;
      const dungeons = evidence?.dungeons ?? [];
      const included = dungeons.filter((d) => d.included);
      const parses = evidence ? included.reduce((sum, d) => sum + d.sampleSize, 0) : null;
      const coverage = evidence ? included.length : null;
      const score = sources[0]?.normalizedScore ?? null;
      const weighted = parses
        ? included.reduce((sum, d) => sum + (d.normalizedScore ?? 0) * d.sampleSize, 0) / parses
        : null;
      const contextMatches =
        board.activeContext?.role === item.role &&
        board.activeContext.mode === "dungeon" &&
        board.activeContext.levelCap === 30 &&
        board.version?.levelCap === 30;
      const bands = FOREVER_LOGS_DATA_TIER_BANDS;
      const expectedTier =
        score === null
          ? "Pending"
          : score >= bands.sMin
            ? "S"
            : score >= bands.aMin
              ? "A"
              : score >= bands.bMin
                ? "B"
                : "C";
      const valid =
        contextMatches &&
        item.tier === expectedTier &&
        evidence !== null &&
        parses !== null &&
        parses >= 20 &&
        (coverage ?? 0) >= 2 &&
        score !== null &&
        Number.isFinite(score) &&
        score > 0 &&
        weighted !== null &&
        Math.abs(weighted - score) <= 0.06;
      const className =
        typeof item.profile?.className === "string" &&
        WOW_CLASSES.some((c) => c === item.profile?.className)
          ? item.profile.className
          : null;
      const specName =
        typeof item.profile?.specName === "string" ? item.profile.specName : item.entityName;
      const tier = valid && item.tier !== "Pending" ? item.tier : "Pending";
      return {
        id: item.entityId,
        name: item.entityName,
        specName,
        className,
        role: item.role,
        tier,
        rank: null,
        score: tier === "Pending" ? null : score,
        parses,
        coverage,
        dungeons,
        retrievedAt: evidence?.retrievedAt ?? null,
        status: valid
          ? item.freshnessStatus === "stale"
            ? "Stale"
            : item.dataStatus === "available"
              ? "Current"
              : "Preliminary"
          : "Preliminary",
        evidenceIssue: !evidence
          ? "No validated performance observations recorded for this context and version."
          : !valid
            ? "Evidence does not meet the current context, score or minimum sample requirements."
            : null,
        item,
      };
    })
    .sort(
      (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity) || a.name.localeCompare(b.name),
    );
  let rank = 0;
  for (const spec of specs) if (spec.score !== null) spec.rank = ++rank;
  return specs;
}
export function summarizeWowStatus(
  board: MetaBoardData,
  now = new Date(),
): "Current" | "Preliminary" | "Stale" {
  const specs = buildWowSpecs(board);
  if (
    board.version?.status === "stale" ||
    specs.some(
      (s) =>
        s.item.freshnessStatus === "stale" ||
        s.item.sources.some((source) => source.versionMatch && source.sourceFreshness === "stale"),
    )
  )
    return "Stale";
  const times = specs.map((s) => (s.retrievedAt ? new Date(s.retrievedAt).getTime() : NaN));
  // Publication policy: Current requires a verified phase snapshot and data checked within 24 hours.
  if (times.some((time) => Number.isFinite(time) && now.getTime() - time > 24 * 60 * 60 * 1000))
    return "Stale";
  const versionNotes = board.version?.notes;
  let review: PublicationReview | null = null;
  if (versionNotes && board.version) {
    try {
      const value: unknown = JSON.parse(versionNotes);
      if (
        value &&
        typeof value === "object" &&
        "phaseId" in value &&
        typeof value.phaseId === "number"
      )
        review = validatePublicationReview(value, {
          phaseId: value.phaseId,
          phaseName: board.version.version,
          now,
        });
    } catch {
      // Legacy, malformed or expired review records cannot establish Current.
      review = null;
    }
  }
  const verified =
    specs.length > 0 &&
    specs.every((spec) => {
      const data = spec.item.sources
        .filter((s) => s.sourceType === "data" && s.versionMatch)
        .map((s) => parseDungeonEvidence(s.notes));
      return (
        data.length === 1 &&
        review !== null &&
        data[0]?.phaseId === review.phaseId &&
        data[0]?.phaseName === review.phaseName &&
        data[0]?.publicationVerifiedAt === review.checkedAt &&
        spec.className !== null &&
        (review.roleBySpec[`${spec.className}::${spec.specName}`]?.includes(
          spec.role as "dps" | "tank" | "healer",
        ) ??
          false) &&
        spec.item.sources.every(
          (source) =>
            source.sourceType !== "data" ||
            (source.sourceFreshness === "current" &&
              new Date(source.checkedAt).getTime() <= now.getTime() &&
              now.getTime() - new Date(source.checkedAt).getTime() <= 24 * 60 * 60 * 1000),
        ) &&
        data[0]?.publicationVerifiedAt &&
        now.getTime() - new Date(data[0].publicationVerifiedAt).getTime() <= 24 * 60 * 60 * 1000 &&
        now.getTime() >= new Date(data[0].publicationVerifiedAt).getTime() &&
        spec.status === "Current"
      );
    });
  return verified &&
    board.version?.status === "current" &&
    times.every((t) => Number.isFinite(t) && now.getTime() >= t)
    ? "Current"
    : "Preliminary";
}
