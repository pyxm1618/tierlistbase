export type TierLevel = "S" | "A" | "B" | "C" | "D" | "F" | string;

export type DisagreementLevel = "none" | "low" | "moderate" | "high";

export type FreshnessStatus = "current" | "preliminary" | "stale";

export type DataStatus = "available" | "preliminary" | "unavailable";

export type ChangeType = "promoted" | "demoted" | "new" | "reclassified";

export type SourceType = "expert" | "data" | "aggregator";

export type SourceMappingRule = {
  readonly sourceName: string;
  readonly gradeMapping?: Readonly<Record<string, { tier: string; score: number }>>;
  readonly rankScoreFormula?: (rank: number, total: number) => number;
};

export type FreshnessRuleThresholds = {
  readonly currentMaxDays?: number;
  readonly preliminaryMaxDays?: number;
  readonly buildMustMatch?: boolean;
};

export type NormalizedResult = {
  readonly rawTier: string;
  readonly normalizedTier: string | null;
  readonly normalizedScore: number | null;
  readonly unconfigured: boolean;
};

export type ConsensusCalculationInput = {
  readonly entityId: string;
  readonly sourceRatings: readonly {
    readonly sourceId: string;
    readonly rawTier: string;
    readonly normalizedTier: string | null;
    readonly normalizedScore: number | null;
  }[];
};

export type ConsensusCalculationResult = {
  readonly entityId: string;
  readonly sourceCount: number;
  readonly agreeingSourceCount: number;
  readonly consensusTier: string | null;
  readonly consensusScore: number | null;
  readonly disagreementLevel: DisagreementLevel;
};

export type FreshnessInput = {
  readonly sourceDate?: Date | null;
  readonly checkedAt?: Date | null;
  readonly sourceBuild?: string | null;
  readonly targetBuild?: string | null;
  readonly thresholds?: FreshnessRuleThresholds;
};
