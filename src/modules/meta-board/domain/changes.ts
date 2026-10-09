import type { ChangeType } from "./types";

export type DetectChangeInput = {
  readonly entityId: string;
  readonly rankingContextId: string;
  readonly previousTier: string | null;
  readonly newTier: string;
  readonly fromVersionId?: string | null;
  readonly toVersionId: string;
  readonly reason?: string | null;
  readonly evidence?: string | null;
  readonly tierRankOrder?: readonly string[]; // e.g. ['S', 'A', 'B', 'C', 'D', 'F']
};

export type DetectedChange = {
  readonly entityId: string;
  readonly rankingContextId: string;
  readonly fromVersionId: string | null;
  readonly toVersionId: string;
  readonly previousTier: string;
  readonly newTier: string;
  readonly changeType: ChangeType;
  readonly reason: string | null;
  readonly evidence: string | null;
};

const DEFAULT_TIER_ORDER = ["S", "A", "B", "C", "D", "F"];

/**
 * Detects whether a tier transition occurred and classifies the change type.
 * Returns null if the tier has not changed.
 */
export function detectRatingChange(input: DetectChangeInput): DetectedChange | null {
  const {
    entityId,
    rankingContextId,
    previousTier,
    newTier,
    fromVersionId = null,
    toVersionId,
    reason = null,
    evidence = null,
    tierRankOrder = DEFAULT_TIER_ORDER,
  } = input;

  if (previousTier === null || previousTier === undefined) {
    return {
      entityId,
      rankingContextId,
      fromVersionId,
      toVersionId,
      previousTier: "Unranked",
      newTier,
      changeType: "new",
      reason,
      evidence,
    };
  }

  if (previousTier === newTier) {
    return null;
  }

  const prevIndex = tierRankOrder.indexOf(previousTier);
  const newIndex = tierRankOrder.indexOf(newTier);

  let changeType: ChangeType = "reclassified";
  if (prevIndex !== -1 && newIndex !== -1) {
    if (newIndex < prevIndex) {
      changeType = "promoted"; // Lower index means higher tier in ['S', 'A', 'B'...]
    } else if (newIndex > prevIndex) {
      changeType = "demoted";
    }
  }

  return {
    entityId,
    rankingContextId,
    fromVersionId,
    toVersionId,
    previousTier,
    newTier,
    changeType,
    reason,
    evidence,
  };
}
