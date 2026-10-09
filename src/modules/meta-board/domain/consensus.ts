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
  const { entityId, sourceRatings, disagreementRule } = input;
  const validRatings = sourceRatings.filter(
    (rating) => rating.normalizedTier !== null && rating.normalizedTier !== undefined,
  );

  const sourceCount = validRatings.length;
  if (sourceCount === 0) {
    return {
      entityId,
      sourceCount: 0,
      agreeingSourceCount: 0,
      agreementRatio: 0,
      tierDistribution: {},
      consensusTier: null,
      consensusScore: null,
      disagreementLevel: "none",
      isTie: false,
    };
  }

  // Count occurrences of each normalized tier and calculate real distribution
  const tierDistribution: Record<string, number> = {};
  let totalScore = 0;
  let scoreCount = 0;

  for (const rating of validRatings) {
    const tier = rating.normalizedTier!;
    tierDistribution[tier] = (tierDistribution[tier] ?? 0) + 1;
    if (rating.normalizedScore !== null && rating.normalizedScore !== undefined) {
      totalScore += rating.normalizedScore;
      scoreCount += 1;
    }
  }

  // Find majority / plurality tier(s)
  let highestCount = 0;
  let topTiers: string[] = [];
  for (const [tier, count] of Object.entries(tierDistribution)) {
    if (count > highestCount) {
      highestCount = count;
      topTiers = [tier];
    } else if (count === highestCount) {
      topTiers.push(tier);
    }
  }

  const isTie = topTiers.length > 1;
  // If there's a plurality tie without an explicit tie-break rule, consensusTier must be null
  const consensusTier = isTie ? null : (topTiers[0] ?? null);
  const agreeingSourceCount = highestCount;
  const agreementRatio =
    sourceCount > 0 ? Number((agreeingSourceCount / sourceCount).toFixed(4)) : 0;

  // Determine disagreement level
  let disagreementLevel: DisagreementLevel;
  if (sourceCount <= 1 || agreementRatio === 1) {
    disagreementLevel = "none";
  } else if (disagreementRule) {
    disagreementLevel = disagreementRule.classify(agreementRatio, sourceCount);
  } else {
    // Without approved business rules, do not fabricate categories; record as unconfigured
    disagreementLevel = "unconfigured";
  }

  const consensusScore = scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(2)) : null;

  return {
    entityId,
    sourceCount,
    agreeingSourceCount,
    agreementRatio,
    tierDistribution,
    consensusTier,
    consensusScore,
    disagreementLevel,
    isTie,
  };
}
