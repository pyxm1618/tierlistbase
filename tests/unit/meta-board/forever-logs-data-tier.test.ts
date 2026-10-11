import { describe, expect, it } from "vitest";

import { deriveForeverLogsDataTier, type ForeverLogsDataRankingItem } from "@/modules/meta-board";

function item(
  score: number | null,
  confidence: ForeverLogsDataRankingItem["confidence"] = "medium",
  flags: ForeverLogsDataRankingItem["flags"] = [],
): ForeverLogsDataRankingItem {
  return {
    source: "Forever Logs",
    metric: "avg_dps",
    role: "dps",
    className: "Hunter",
    specName: "Beast Mastery",
    weightedMedianScore: score,
    sampleCount: 50,
    locationsIncluded: ["City of Dalaran", "Excavation Site: Wetlands"],
    confidence,
    flags,
    observations: [],
  };
}

describe("Forever Logs Data Tier", () => {
  it("uses fixed transparent score bands", () => {
    expect(deriveForeverLogsDataTier(item(120)).tier).toBe("S");
    expect(deriveForeverLogsDataTier(item(119.99)).tier).toBe("A");
    expect(deriveForeverLogsDataTier(item(105)).tier).toBe("A");
    expect(deriveForeverLogsDataTier(item(104.99)).tier).toBe("B");
    expect(deriveForeverLogsDataTier(item(90)).tier).toBe("B");
    expect(deriveForeverLogsDataTier(item(89.99)).tier).toBe("C");
  });

  it("keeps insufficient evidence Pending instead of fabricating a tier", () => {
    expect(deriveForeverLogsDataTier(item(null, "insufficient"))).toEqual({
      tier: "Pending",
      dataStatus: "unavailable",
      freshnessStatus: "preliminary",
      preliminary: true,
    });
  });

  it("marks low-confidence evidence as preliminary", () => {
    expect(deriveForeverLogsDataTier(item(125, "low"))).toMatchObject({
      tier: "S",
      dataStatus: "preliminary",
      freshnessStatus: "preliminary",
      preliminary: true,
    });
  });

  it("marks extreme-tail evidence as preliminary even with adequate samples", () => {
    expect(deriveForeverLogsDataTier(item(110, "medium", ["extreme_tail"]))).toMatchObject({
      tier: "A",
      dataStatus: "preliminary",
      freshnessStatus: "preliminary",
      preliminary: true,
    });
  });
});
