export type ForeverLogsMetric = "avg_dps" | "avg_hps" | "avg_dtps";
export type ForeverLogsRole = "dps" | "healer" | "tank";

export type ForeverLogsObservation = {
  readonly source: "Forever Logs";
  readonly sourceUrl: string;
  readonly apiPath: string;
  readonly retrievedAt: Date;
  readonly phase: number;
  readonly phaseName: string | null;
  readonly location: string;
  readonly difficulty: string;
  readonly bracket: string;
  readonly metric: ForeverLogsMetric;
  readonly damageMode: string;
  readonly className: string;
  readonly specName: string;
  readonly avg: number | null;
  readonly median: number;
  readonly min: number | null;
  readonly max: number | null;
  readonly totalParses: number;
  readonly percentiles: Readonly<Record<string, number>>;
};

export type ForeverLogsObservationFlag =
  | "wrong_role"
  | "insufficient_sample"
  | "invalid_metric"
  | "extreme_tail";

export type ForeverLogsProcessedObservation = ForeverLogsObservation & {
  readonly expectedRole: ForeverLogsRole | null;
  readonly included: boolean;
  readonly normalizedScore: number | null;
  readonly flags: readonly ForeverLogsObservationFlag[];
};

export type ForeverLogsRankingConfidence = "high" | "medium" | "low" | "insufficient";

export type ForeverLogsDataRankingItem = {
  readonly source: "Forever Logs";
  readonly metric: ForeverLogsMetric;
  readonly role: ForeverLogsRole;
  readonly className: string;
  readonly specName: string;
  readonly weightedMedianScore: number | null;
  readonly sampleCount: number;
  readonly locationsIncluded: readonly string[];
  readonly confidence: ForeverLogsRankingConfidence;
  readonly flags: readonly ForeverLogsObservationFlag[];
  readonly observations: readonly ForeverLogsProcessedObservation[];
};

export type ForeverLogsRankingPolicy = {
  readonly minParsesPerLocation: number;
  readonly minLocationsForRanking: number;
  readonly minTotalParsesForRanking: number;
  readonly mediumConfidenceMinParses: number;
  readonly hi...[truncated]