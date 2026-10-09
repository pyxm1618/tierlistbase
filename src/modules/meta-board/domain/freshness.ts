import type { FreshnessInput, FreshnessStatus } from "./types";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Determines freshness status (current | preliminary | stale).
 * If no source date is provided, returns 'preliminary'.
 * If thresholds are not configured, uses explicit rules or leaves un-promoted.
 */
export function calculateFreshness(input: FreshnessInput): FreshnessStatus {
  const { sourceDate, checkedAt, sourceBuild, targetBuild, thresholds } = input;

  if (!sourceDate) {
    return "preliminary";
  }

  // If strict build matching is explicitly required, mismatch results in stale
  if (thresholds?.buildMustMatch && targetBuild && sourceBuild && sourceBuild !== targetBuild) {
    return "stale";
  }

  // Without explicitly configured thresholds, do not fabricate a 'current' classification
  if (thresholds?.currentMaxDays === undefined) {
    return "unconfigured";
  }

  const referenceDate = checkedAt ?? new Date();
  const diffDays = Math.max(
    0,
    (referenceDate.getTime() - sourceDate.getTime()) / MILLISECONDS_PER_DAY,
  );

  if (diffDays <= thresholds.currentMaxDays) {
    return "current";
  }

  if (thresholds.preliminaryMaxDays !== undefined && diffDays <= thresholds.preliminaryMaxDays) {
    return "preliminary";
  }

  return "stale";
}
