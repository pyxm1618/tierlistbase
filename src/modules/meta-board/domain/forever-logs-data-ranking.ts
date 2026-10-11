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
  readonly highConfidenceMinParses: number;
  readonly highConfidenceMinLocations: number;
  readonly extremeTailRatio: number;
};

export const DEFAULT_FOREVER_LOGS_RANKING_POLICY: ForeverLogsRankingPolicy = {
  // Product guardrails, not statistical significance claims.
  minParsesPerLocation: 5,
  minLocationsForRanking: 2,
  minTotalParsesForRanking: 20,
  mediumConfidenceMinParses: 50,
  highConfidenceMinParses: 100,
  highConfidenceMinLocations: 3,
  extremeTailRatio: 5,
};

export type ForeverLogsParseIssue = {
  readonly className?: string;
  readonly specName?: string;
  readonly reason:
    | "invalid_response"
    | "unsupported_metric"
    | "missing_context"
    | "invalid_spec_statistics";
};

export type ForeverLogsParseResult = {
  readonly observations: readonly ForeverLogsObservation[];
  readonly issues: readonly ForeverLogsParseIssue[];
};

const METRIC_ROLE: Readonly<Record<ForeverLogsMetric, ForeverLogsRole>> = {
  avg_dps: "dps",
  avg_hps: "healer",
  avg_dtps: "tank",
};

const HIGHER_IS_BETTER: Readonly<Record<ForeverLogsMetric, boolean>> = {
  avg_dps: true,
  avg_hps: true,
  avg_dtps: false,
};

export function foreverLogsSpecKey(className: string, specName: string) {
  return `${className}::${specName}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isForeverLogsMetric(value: unknown): value is ForeverLogsMetric {
  return value === "avg_dps" || value === "avg_hps" || value === "avg_dtps";
}

/**
 * Converts one documented Forever Logs /statistics response into immutable raw observations.
 * It does not normalize, rank, infer roles, or repair malformed values.
 */
export function parseForeverLogsStatisticsPayload(
  payload: unknown,
  options: {
    readonly retrievedAt: Date;
    readonly sourceUrl?: string;
    readonly apiPath?: string;
  },
): ForeverLogsParseResult {
  const root = asRecord(payload);
  if (!root || root.success !== true) {
    return { observations: [], issues: [{ reason: "invalid_response" }] };
  }

  if (!isForeverLogsMetric(root.metric)) {
    return { observations: [], issues: [{ reason: "unsupported_metric" }] };
  }

  const phase = asFiniteNumber(root.phase);
  const location = typeof root.location === "string" ? root.location.trim() : "";
  const difficulty = typeof root.difficulty === "string" ? root.difficulty : "";
  const bracket = typeof root.bracket === "string" ? root.bracket : "";
  const damageMode = typeof root.damage_mode === "string" ? root.damage_mode : "";

  if (
    phase === null ||
    !Number.isInteger(phase) ||
    location.length === 0 ||
    difficulty.length === 0 ||
    bracket.length === 0 ||
    damageMode.length === 0
  ) {
    return { observations: [], issues: [{ reason: "missing_context" }] };
  }

  const statistics = asRecord(root.statistics);
  if (!statistics) {
    return { observations: [], issues: [] };
  }

  const observations: ForeverLogsObservation[] = [];
  const issues: ForeverLogsParseIssue[] = [];

  for (const [className, classValue] of Object.entries(statistics)) {
    const classRecord = asRecord(classValue);
    const specs = asRecord(classRecord?.specs);
    if (!specs) continue;

    for (const [specName, specValue] of Object.entries(specs)) {
      const spec = asRecord(specValue);
      const median = asFiniteNumber(spec?.median);
      const totalParses = asFiniteNumber(spec?.total_parses);

      if (
        !spec ||
        median === null ||
        totalParses === null ||
        !Number.isInteger(totalParses) ||
        totalParses < 0
      ) {
        issues.push({ className, specName, reason: "invalid_spec_statistics" });
        continue;
      }

      const percentileRecord = asRecord(spec.percentiles);
      const percentiles: Record<string, number> = {};
      if (percentileRecord) {
        for (const [name, value] of Object.entries(percentileRecord)) {
          const numeric = asFiniteNumber(value);
          if (numeric !== null) percentiles[name] = numeric;
        }
      }

      observations.push({
        source: "Forever Logs",
        sourceUrl: options.sourceUrl ?? "https://foreverlogs.gg",
        apiPath: options.apiPath ?? "/api/public/v1/statistics",
        retrievedAt: options.retrievedAt,
        phase,
        phaseName: typeof root.phase_name === "string" ? root.phase_name : null,
        location,
        difficulty,
        bracket,
        metric: root.metric,
        damageMode,
        className,
        specName,
        avg: asFiniteNumber(spec.avg),
        median,
        min: asFiniteNumber(spec.min),
        max: asFiniteNumber(spec.max),
        totalParses,
        percentiles,
      });
    }
  }

  return { observations, issues };
}

function isFinitePositive(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function medianOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? null;
  const left = sorted[middle - 1];
  const right = sorted[middle];
  return left === undefined || right === undefined ? null : (left + right) / 2;
}

function round(value: number, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function uniqueFlags(flags: readonly ForeverLogsObservationFlag[]) {
  return Array.from(new Set(flags));
}

export function processForeverLogsDataRanking(input: {
  readonly observations: readonly ForeverLogsObservation[];
  /**
   * The caller supplies the authoritative role catalog.
   * This deliberately avoids hardcoding game class/spec roles in the ranking algorithm.
   */
  readonly roleBySpec: Readonly<Record<string, ForeverLogsRole>>;
  readonly policy?: Partial<ForeverLogsRankingPolicy>;
}): ForeverLogsDataRankingItem[] {
  const policy: ForeverLogsRankingPolicy = {
    ...DEFAULT_FOREVER_LOGS_RANKING_POLICY,
    ...input.policy,
  };

  const preprocessed: Array<
    ForeverLogsProcessedObservation & {
      readonly targetRole: ForeverLogsRole;
    }
  > = input.observations.map((observation) => {
    const targetRole = METRIC_ROLE[observation.metric];
    const expectedRole =
      input.roleBySpec[foreverLogsSpecKey(observation.className, observation.specName)] ?? null;
    const flags: ForeverLogsObservationFlag[] = [];

    if (expectedRole !== targetRole) flags.push("wrong_role");
    if (!isFinitePositive(observation.median)) flags.push("invalid_metric");
    if (observation.totalParses < policy.minParsesPerLocation) {
      flags.push("insufficient_sample");
    }

    const p95 = observation.percentiles.p95;
    if (
      isFinitePositive(observation.median) &&
      isFinitePositive(p95) &&
      p95 / observation.median >= policy.extremeTailRatio
    ) {
      flags.push("extreme_tail");
    }

    const included =
      expectedRole === targetRole &&
      isFinitePositive(observation.median) &&
      observation.totalParses >= policy.minParsesPerLocation;

    return {
      ...observation,
      targetRole,
      expectedRole,
      included,
      normalizedScore: null,
      flags: uniqueFlags(flags),
    };
  });

  // Normalize within the same location + metric before cross-location aggregation.
  // Raw DPS/HPS/DTPS from different dungeons are not directly comparable.
  const benchmarks = new Map<string, number>();
  const benchmarkGroups = new Map<string, number[]>();

  for (const observation of preprocessed) {
    if (!observation.included) continue;
    const groupKey = `${observation.metric}::${observation.location}`;
    if (!benchmarkGroups.has(groupKey)) benchmarkGroups.set(groupKey, []);
    benchmarkGroups.get(groupKey)!.push(observation.median);
  }

  for (const [groupKey, values] of benchmarkGroups) {
    const benchmark = medianOf(values);
    if (benchmark !== null && benchmark > 0) benchmarks.set(groupKey, benchmark);
  }

  const normalized = preprocessed.map(
    (
      observation,
    ): ForeverLogsProcessedObservation & {
      targetRole: ForeverLogsRole;
    } => {
      if (!observation.included) return observation;
      const benchmark = benchmarks.get(`${observation.metric}::${observation.location}`);
      if (!benchmark || benchmark <= 0) {
        return {
          ...observation,
          included: false,
          normalizedScore: null,
          flags: uniqueFlags([...observation.flags, "invalid_metric"]),
        };
      }

      const normalizedScore = HIGHER_IS_BETTER[observation.metric]
        ? (observation.median / benchmark) * 100
        : (benchmark / observation.median) * 100;

      return {
        ...observation,
        normalizedScore: round(normalizedScore),
      };
    },
  );

  const groups = new Map<
    string,
    Array<ForeverLogsProcessedObservation & { targetRole: ForeverLogsRole }>
  >();

  for (const observation of normalized) {
    const key = `${observation.metric}::${observation.className}::${observation.specName}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(observation);
  }

  const rankings: ForeverLogsDataRankingItem[] = [];

  for (const observations of groups.values()) {
    const first = observations[0];
    if (!first) continue;

    const eligible = observations.filter(
      (observation) => observation.included && observation.normalizedScore !== null,
    );
    const sampleCount = eligible.reduce(
      (sum, observation) => sum + observation.totalParses,
      0,
    );
    const locationsIncluded = Array.from(
      new Set(eligible.map((observation) => observation.location)),
    ).sort();

    let weightedMedianScore: number | null = null;
    if (sampleCount > 0) {
      weightedMedianScore = round(
        eligible.reduce(
          (sum, observation) =>
            sum + (observation.normalizedScore ?? 0) * observation.totalParses,
          0,
        ) / sampleCount,
      );
    }

    let confidence: ForeverLogsRankingConfidence = "low";
    if (
      locationsIncluded.length < policy.minLocationsForRanking ||
      sampleCount < policy.minTotalParsesForRanking
    ) {
      confidence = "insufficient";
      weightedMedianScore = null;
    } else if (
      locationsIncluded.length >= policy.highConfidenceMinLocations &&
      sampleCount >= policy.highConfidenceMinParses
    ) {
      confidence = "high";
    } else if (sampleCount >= policy.mediumConfidenceMinParses) {
      confidence = "medium";
    }

    rankings.push({
      source: "Forever Logs",
      metric: first.metric,
      role: first.targetRole,
      className: first.className,
      specName: first.specName,
      weightedMedianScore,
      sampleCount,
      locationsIncluded,
      confidence,
      flags: uniqueFlags(observations.flatMap((observation) => observation.flags)),
      observations,
    });
  }

  return rankings.sort((a, b) => {
    if (a.metric !== b.metric) return a.metric.localeCompare(b.metric);
    if (a.confidence === "insufficient" && b.confidence !== "insufficient") return 1;
    if (a.confidence !== "insufficient" && b.confidence === "insufficient") return -1;
    return (b.weightedMedianScore ?? -Infinity) - (a.weightedMedianScore ?? -Infinity);
  });
}
