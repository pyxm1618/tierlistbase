import type {
  DataStatus,
  FreshnessStatus,
  TierLevel,
} from "./types";
import type { ForeverLogsDataRankingItem } from "./forever-logs-data-ranking";

export type ForeverLogsDerivedTier = {
  readonly tier: TierLevel | "Pending";
  readonly dataStatus: DataStatus;
  readonly freshnessStatus: FreshnessStatus;
  readonly preliminary: boolean;
};

export const FOREVER_LOGS_DATA_TIER_BANDS = {
  sMin: 120,
  aMin: 105,
  bMin: 90,
} as const;

/**
 * Transparent V1 data-only tier bands.
 *
 * Scores are already normalized inside each dungeon so 100 means the
 * median eligible spec in that same dungeon, then aggregated by parse count.
 * These bands are TierListBase product rules, not tiers supplied by Forever Logs.
 */
export function deriveForeverLogsDataTier(
  item: ForeverLogsDataRankingItem,
): ForeverLogsDerivedTier {
  if (item.weightedMedianScore === null || item.confidence === "insufficient") {
    return {
      tier: "Pending",
      dataStatus: "unavailable",
      freshnessStatus: "preliminary",
      preliminary: true,
    };
  }

  const score = item.weightedMedianScore;
  const tier: TierLevel =
    score >= FOREVER_LOGS_DATA_TIER_BANDS.sMin
      ? "S"
      : score >= FOREVER_LOGS_DATA_TIER_BANDS.aMin
        ? "A"
        : score >= FOREVER_LOGS_DATA_TIER_BANDS.bMin
          ? "B"
          : "C";

  const preliminary =
    item.confidence === "low" || item.flags.includes("extreme_tail");

  return {
    tier,
    dataStatus: preliminary ? "preliminary" : "available",
    freshnessStatus: preliminary ? "preliminary" : "current",
    preliminary,
  };
}
