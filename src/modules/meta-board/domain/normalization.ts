import type { NormalizedResult, SourceMappingRule } from "./types";

/**
 * Normalizes a raw source rating according to source-specific mapping rules.
 * If no mapping rule is configured for the source, returns unconfigured = true
 * without fabricating arbitrary scores or tiers.
 */
export function normalizeSourceRating(
  rawTier: string,
  mappingRule?: SourceMappingRule | null,
): NormalizedResult {
  const trimmed = rawTier.trim();
  if (!trimmed) {
    return {
      rawTier,
      normalizedTier: null,
      normalizedScore: null,
      unconfigured: true,
    };
  }

  if (!mappingRule || !mappingRule.gradeMapping) {
    return {
      rawTier: trimmed,
      normalizedTier: null,
      normalizedScore: null,
      unconfigured: true,
    };
  }

  const mapped =
    mappingRule.gradeMapping[trimmed] ?? mappingRule.gradeMapping[trimmed.toUpperCase()];
  if (!mapped) {
    return {
      rawTier: trimmed,
      normalizedTier: null,
      normalizedScore: null,
      unconfigured: true,
    };
  }

  return {
    rawTier: trimmed,
    normalizedTier: mapped.tier,
    normalizedScore: mapped.score,
    unconfigured: false,
  };
}
