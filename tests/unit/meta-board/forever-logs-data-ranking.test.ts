import { describe, expect, it } from "vitest";

import {
  foreverLogsSpecKey,
  parseForeverLogsStatisticsPayload,
  processForeverLogsDataRanking,
  type ForeverLogsObservation,
  type ForeverLogsRole,
} from "@/modules/meta-board";

const retrievedAt = new Date("2026-10-11T03:50:35.349Z");

const roleBySpec: Readonly<Record<string, ForeverLogsRole>> = {
  [foreverLogsSpecKey("Priest", "Discipline")]: "healer",
  [foreverLogsSpecKey("Priest", "Shadow")]: "dps",
  [foreverLogsSpecKey("Hunter", "Beast Mastery")]: "dps",
  [foreverLogsSpecKey("Rogue", "Combat")]: "dps",
  [foreverLogsSpecKey("Paladin", "Protection")]: "tank",
  [foreverLogsSpecKey("Warrior", "Protection")]: "tank",
};

function observation(
  overrides: Partial<ForeverLogsObservation> & Pick<ForeverLogsObservation, "metric" | "className" | "specName" | "location" | "median" | "totalParses">,
): ForeverLogsObservation {
  return {
    source: "Forever Logs",
    sourceUrl: "https://foreverlogs.gg",
    apiPath: "/api/public/v1/statistics",
    retrievedAt,
    phase: 1,
    phaseName: "Beta",
    difficulty: "all",
    bracket: "all",
    damageMode: "standard",
    avg: overrides.median,
    min: null,
    max: null,
    percentiles: {},
    ...overrides,
  };
}

describe("Forever Logs Data Ranking", () => {
  it("filters HPS rows from non-healer specs instead of treating self-healing as healer evidence", () => {
    const result = processForeverLogsDataRanking({
      observations: [
        observation({
          metric: "avg_hps",
          className: "Priest",
          specName: "Discipline",
          location: "City of Dalaran",
          median: 75,
          totalParses: 30,
        }),
        observation({
          metric: "avg_hps",
          className: "Priest",
          specName: "Shadow",
          location: "City of Dalaran",
          median: 55,
          totalParses: 30,
        }),
      ],
      roleBySpec,
    });

    const shadow = result.find((item) => item.specName === "Shadow");
    expect(shadow?.confidence).toBe("insufficient");
    expect(shadow?.weightedMedianScore).toBeNull();
    expect(shadow?.flags).toContain("wrong_role");
    expect(shadow?.observations[0]?.included).toBe(false);
  });

  it("excludes a per-location observation below the sample threshold", () => {
    const result = processForeverLogsDataRanking({
      observations: [
        observation({
          metric: "avg_dps",
          className: "Hunter",
          specName: "Beast Mastery",
          location: "City of Dalaran",
          median: 120,
          totalParses: 4,
        }),
      ],
      roleBySpec,
    });

    expect(result[0]?.sampleCount).toBe(0);
    expect(result[0]?.weightedMedianScore).toBeNull();
    expect(result[0]?.flags).toContain("insufficient_sample");
  });

  it("normalizes within each dungeon before aggregating across dungeons", () => {
    const result = processForeverLogsDataRanking({
      observations: [
        observation({
          metric: "avg_dps",
          className: "Hunter",
          specName: "Beast Mastery",
          location: "Dungeon A",
          median: 200,
          totalParses: 20,
        }),
        observation({
          metric: "avg_dps",
          className: "Rogue",
          specName: "Combat",
          location: "Dungeon A",
          median: 100,
          totalParses: 20,
        }),
        observation({
          metric: "avg_dps",
          className: "Hunter",
          specName: "Beast Mastery",
          location: "Dungeon B",
          median: 20,
          totalParses: 20,
        }),
        observation({
          metric: "avg_dps",
          className: "Rogue",
          specName: "Combat",
          location: "Dungeon B",
          median: 10,
          totalParses: 20,
        }),
      ],
      roleBySpec,
      policy: { minTotalParsesForRanking: 1 },
    });

    const hunter = result.find((item) => item.specName === "Beast Mastery");
    const rogue = result.find((item) => item.specName === "Combat");
    expect(hunter?.weightedMedianScore).toBeCloseTo(133.3333, 3);
    expect(rogue?.weightedMedianScore).toBeCloseTo(66.6667, 3);
  });

  it("weights included locations by real parse count", () => {
    const result = processForeverLogsDataRanking({
      observations: [
        observation({
          metric: "avg_dps",
          className: "Hunter",
          specName: "Beast Mastery",
          location: "Dungeon A",
          median: 150,
          totalParses: 30,
        }),
        observation({
          metric: "avg_dps",
          className: "Rogue",
          specName: "Combat",
          location: "Dungeon A",
          median: 100,
          totalParses: 30,
        }),
        observation({
          metric: "avg_dps",
          className: "Hunter",
          specName: "Beast Mastery",
          location: "Dungeon B",
          median: 80,
          totalParses: 10,
        }),
        observation({
          metric: "avg_dps",
          className: "Rogue",
          specName: "Combat",
          location: "Dungeon B",
          median: 120,
          totalParses: 10,
        }),
      ],
      roleBySpec,
      policy: { minTotalParsesForRanking: 1 },
    });

    const hunter = result.find((item) => item.specName === "Beast Mastery");
    expect(hunter?.sampleCount).toBe(40);
    // Dungeon A score = 120, Dungeon B score = 80; sample-weighted = 110.
    expect(hunter?.weightedMedianScore).toBe(110);
  });

  it("flags extreme p95 tails without rewriting or silently dropping the raw median", () => {
    const result = processForeverLogsDataRanking({
      observations: [
        observation({
          metric: "avg_dps",
          className: "Hunter",
          specName: "Beast Mastery",
          location: "Dungeon A",
          median: 100,
          totalParses: 20,
          percentiles: { p95: 1_000 },
        }),
        observation({
          metric: "avg_dps",
          className: "Rogue",
          specName: "Combat",
          location: "Dungeon A",
          median: 100,
          totalParses: 20,
          percentiles: { p95: 130 },
        }),
      ],
      roleBySpec,
    });

    const hunter = result.find((item) => item.specName === "Beast Mastery");
    expect(hunter?.flags).toContain("extreme_tail");
    expect(hunter?.observations[0]?.median).toBe(100);
    expect(hunter?.observations[0]?.included).toBe(true);
  });

  it("treats lower DTPS as better within a location", () => {
    const result = processForeverLogsDataRanking({
      observations: [
        observation({
          metric: "avg_dtps",
          className: "Paladin",
          specName: "Protection",
          location: "Dungeon A",
          median: 20,
          totalParses: 20,
        }),
        observation({
          metric: "avg_dtps",
          className: "Warrior",
          specName: "Protection",
          location: "Dungeon A",
          median: 40,
          totalParses: 20,
        }),
      ],
      roleBySpec,
    });

    const paladin = result.find((item) => item.className === "Paladin");
    const warrior = result.find((item) => item.className === "Warrior");
    expect(paladin?.observations[0]?.normalizedScore).toBe(150);
    expect(warrior?.observations[0]?.normalizedScore).toBe(75);
  });

  it("does not publish a ranking score when coverage is too thin", () => {
    const result = processForeverLogsDataRanking({
      observations: [
        observation({
          metric: "avg_dps",
          className: "Hunter",
          specName: "Beast Mastery",
          location: "The Hall of Thanes",
          median: 130,
          totalParses: 6,
        }),
      ],
      roleBySpec,
    });

    expect(result[0]?.confidence).toBe("insufficient");
    expect(result[0]?.weightedMedianScore).toBeNull();
    expect(result[0]?.locationsIncluded).toEqual(["The Hall of Thanes"]);
  });
});


describe("Forever Logs Statistics Parser", () => {
  it("preserves documented raw fields and provenance from /statistics", () => {
    const parsed = parseForeverLogsStatisticsPayload(
      {
        success: true,
        phase: 1,
        phase_name: "Beta",
        location: "City of Dalaran",
        difficulty: "all",
        bracket: "all",
        metric: "avg_dps",
        damage_mode: "standard",
        statistics: {
          Hunter: {
            specs: {
              "Beast Mastery": {
                avg: 130,
                median: 126.88,
                min: 80,
                max: 250,
                total_parses: 18,
                percentiles: { p95: 185.68, p50: 126.88 },
              },
            },
          },
        },
      },
      { retrievedAt },
    );

    expect(parsed.issues).toEqual([]);
    expect(parsed.observations).toHaveLength(1);
    expect(parsed.observations[0]).toMatchObject({
      source: "Forever Logs",
      sourceUrl: "https://foreverlogs.gg",
      apiPath: "/api/public/v1/statistics",
      retrievedAt,
      phase: 1,
      phaseName: "Beta",
      location: "City of Dalaran",
      metric: "avg_dps",
      className: "Hunter",
      specName: "Beast Mastery",
      median: 126.88,
      totalParses: 18,
      percentiles: { p95: 185.68, p50: 126.88 },
    });
  });

  it("rejects unsupported metrics instead of guessing how to rank them", () => {
    const parsed = parseForeverLogsStatisticsPayload(
      {
        success: true,
        phase: 1,
        phase_name: "Beta",
        location: "City of Dalaran",
        difficulty: "all",
        bracket: "all",
        metric: "unknown_metric",
        damage_mode: "standard",
        statistics: {},
      },
      { retrievedAt },
    );

    expect(parsed.observations).toEqual([]);
    expect(parsed.issues).toEqual([{ reason: "unsupported_metric" }]);
  });

  it("reports malformed spec rows instead of silently repairing them", () => {
    const parsed = parseForeverLogsStatisticsPayload(
      {
        success: true,
        phase: 1,
        phase_name: "Beta",
        location: "City of Dalaran",
        difficulty: "all",
        bracket: "all",
        metric: "avg_dps",
        damage_mode: "standard",
        statistics: {
          Hunter: {
            specs: {
              "Beast Mastery": {
                median: null,
                total_parses: 18,
                percentiles: {},
              },
            },
          },
        },
      },
      { retrievedAt },
    );

    expect(parsed.observations).toEqual([]);
    expect(parsed.issues).toEqual([
      {
        className: "Hunter",
        specName: "Beast Mastery",
        reason: "invalid_spec_statistics",
      },
    ]);
  });
});
