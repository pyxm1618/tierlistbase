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

  // If target build is specified and doesn't match, check if strict matching is required
  if (thresholds?.buildMustMatch && targetBuild && sourceBuild && sourceBuild !== targetBuild) {
    return "stale";
  }

  const referenceDate = checkedAt ?? new Date();
  const diffDays = Math.max(
    0,
    (referenceDate.getTime() - sourceDate.getTime()) / MILLISECONDS_PER_DAY,
  );

  const currentMaxDays = thresholds?.currentMaxDays ?? 30;
  const preliminaryMaxDays = thresholds?.preliminaryMaxDays ?? 90;

  if (diffDays <= currentMaxDays) {
    return "current";
  }

  if (diffDays <= preliminaryMaxDays) {
    return "preliminary";
  }

  return "stale";
}
