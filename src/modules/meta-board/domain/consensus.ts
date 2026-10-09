import type {
  ConsensusCalculationInput,
  ConsensusCalculationResult,
  DisagreementLevel,
} from "./types";

/**
 * Calculates consensus and disagreement from normalized source ratings.
 * Transparent and verifiable: produces agreeingSourceCount and disagreement level
 * without opaque or fabricated confidence formulas.
 */
export function calculateConsensus(input: ConsensusCalculationInput): ConsensusCalculationResult {
  const { entityId, sourceRatings } = input;
  const validRatings = sourceRatings.filter(
    (rating) => rating.normalizedTier !== null && rating.normalizedTier !== undefined,
  );

  const sourceCount = validRatings.length;
  if (sourceCount === 0) {
    return {
      entityId,
      sourceCount: 0,
      agreeingSourceCount: 0,
      consensusTier: null,
      consensusScore: null,
      disagreementLevel: "none",
    };
  }

  // Count occurrences of each normalized tier
  const tierCounts = new Map<string, number>();
  let totalScore = 0;
  let scoreCount = 0;

  for (const rating of validRatings) {
    const tier = rating.normalizedTier!;
    tierCounts.set(tier, (tierCounts.get(tier) ?? 0) + 1);
    if (rating.normalizedScore !== null && rating.normalizedScore !== undefined) {
      totalScore += rating.normalizedScore;
      scoreCount += 1;
    }
  }

  // Find majority / plurality tier
  let highestCount = 0;
  let consensusTier: string | null = null;
  for (const [tier, count] of tierCounts.entries()) {
    if (count > highestCount) {
      highestCount = count;
      consensusTier = tier;
    }
  }

  const agreeingSourceCount = highestCount;
  const agreementRatio = sourceCount > 0 ? agreeingSourceCount / sourceCount : 0;

  // Determine disagreement level based on agreement ratio and source count
  let disagreementLevel: DisagreementLevel = "none";
  if (sourceCount > 1) {
    if (agreementRatio === 1) {
      disagreementLevel = "none";
    } else if (agreementRatio >= 0.75) {
      disagreementLevel = "low";
    } else if (agreementRatio >= 0.5) {
      disagreementLevel = "moderate";
    } else {
      disagreementLevel = "high";
    }
  }

  const consensusScore = scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(2)) : null;

  return {
    entityId,
    sourceCount,
    agreeingSourceCount,
    consensusTier,
    consensusScore,
    disagreementLevel,
  };
}
