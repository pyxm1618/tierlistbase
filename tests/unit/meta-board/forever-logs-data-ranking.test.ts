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
  overrides: Partial<ForeverLogsObservation> &
    Pick<
      ForeverLogsObservation,
      "metric" | "className" | "specName" | "location" | "median" | "totalParses"
    >,
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

    const shadow = result.find((item) =...[truncated]