import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import {
  calculateConsensus,
  calculateFreshness,
  detectRatingChange,
  normalizeSourceRating,
  type SourceMappingRule,
} from "@/modules/meta-board";

describe("TierListBase Ranking Domain", () => {
  describe("Source Normalization Mechanism", () => {
    // Explicitly labeled synthetic test fixture
    const syntheticTestMappingRule: SourceMappingRule = {
      sourceName: "synthetic-editorial-provider",
      gradeMapping: {
        "S+": { tier: "S", score: 95 },
        S: { tier: "S", score: 90 },
        A: { tier: "A", score: 80 },
        B: { tier: "B", score: 70 },
      },
    };

    it("leaves rating unconfigured when mapping rule is omitted", () => {
      const result = normalizeSourceRating("S+");
      expect(result.unconfigured).toBe(true);
      expect(result.normalizedTier).toBeNull();
      expect(result.normalizedScore).toBeNull();
    });

    it("normalizes tiers correctly when explicit rule is provided", () => {
      const result = normalizeSourceRating("S+", syntheticTestMappingRule);
      expect(result.unconfigured).toBe(false);
      expect(result.normalizedTier).toBe("S");
      expect(result.normalizedScore).toBe(95);
    });

    it("handles whitespace and case tolerance", () => {
      const result = normalizeSourceRating("  s  ", syntheticTestMappingRule);
      expect(result.normalizedTier).toBe("S");
      expect(result.normalizedScore).toBe(90);
    });

    it("marks unrecognized grades as unconfigured rather than fabricating ranks", () => {
      const result = normalizeSourceRating("UnknownTier", syntheticTestMappingRule);
      expect(result.unconfigured).toBe(true);
      expect(result.normalizedTier).toBeNull();
    });
  });

  describe("Consensus & Disagreement Calculation", () => {
    it("returns null consensus when no valid ratings exist", () => {
      const result = calculateConsensus({
        entityId: "entity-paladin",
        sourceRatings: [],
      });
      expect(result.sourceCount).toBe(0);
      expect(result.agreeingSourceCount).toBe(0);
      expect(result.agreementRatio).toBe(0);
      expect(result.consensusTier).toBeNull();
      expect(result.disagreementLevel).toBe("none");
      expect(result.isTie).toBe(false);
    });

    it("calculates unanimous consensus without disagreement", () => {
      const result = calculateConsensus({
        entityId: "entity-mage",
        sourceRatings: [
          { sourceId: "src-1", rawTier: "S", normalizedTier: "S", normalizedScore: 90 },
          { sourceId: "src-2", rawTier: "S", normalizedTier: "S", normalizedScore: 90 },
          { sourceId: "src-3", rawTier: "S", normalizedTier: "S", normalizedScore: 90 },
        ],
      });
      expect(result.sourceCount).toBe(3);
      expect(result.agreeingSourceCount).toBe(3);
      expect(result.agreementRatio).toBe(1);
      expect(result.consensusTier).toBe("S");
      expect(result.disagreementLevel).toBe("none");
      expect(result.consensusScore).toBe(90);
      expect(result.isTie).toBe(false);
    });

    it("resolves plurality tie to null consensusTier without picking arbitrary tier", () => {
      const result = calculateConsensus({
        entityId: "entity-druid",
        sourceRatings: [
          { sourceId: "src-1", rawTier: "S", normalizedTier: "S", normalizedScore: 95 },
          { sourceId: "src-2", rawTier: "S", normalizedTier: "S", normalizedScore: 95 },
          { sourceId: "src-3", rawTier: "A", normalizedTier: "A", normalizedScore: 85 },
          { sourceId: "src-4", rawTier: "A", normalizedTier: "A", normalizedScore: 85 },
        ],
      });
      expect(result.sourceCount).toBe(4);
      expect(result.agreeingSourceCount).toBe(2);
      expect(result.isTie).toBe(true);
      expect(result.consensusTier).toBeNull();
      expect(result.tierDistribution).toEqual({ S: 2, A: 2 });
    });

    it("returns unconfigured disagreement when business rules are not explicitly configured", () => {
      const result = calculateConsensus({
        entityId: "entity-rogue",
        sourceRatings: [
          { sourceId: "src-1", rawTier: "S", normalizedTier: "S", normalizedScore: 90 },
          { sourceId: "src-2", rawTier: "A", normalizedTier: "A", normalizedScore: 80 },
          { sourceId: "src-3", rawTier: "B", normalizedTier: "B", normalizedScore: 70 },
          { sourceId: "src-4", rawTier: "C", normalizedTier: "C", normalizedScore: 60 },
        ],
      });
      expect(result.sourceCount).toBe(4);
      expect(result.agreeingSourceCount).toBe(1);
      expect(result.disagreementLevel).toBe("unconfigured");
      expect(result.tierDistribution).toEqual({ S: 1, A: 1, B: 1, C: 1 });
    });

    it("classifies disagreement level when explicit rule is supplied", () => {
      const syntheticRule = {
        classify: (ratio: number) => (ratio < 0.5 ? ("high" as const) : ("low" as const)),
      };
      const result = calculateConsensus({
        entityId: "entity-rogue",
        sourceRatings: [
          { sourceId: "src-1", rawTier: "S", normalizedTier: "S", normalizedScore: 90 },
          { sourceId: "src-2", rawTier: "A", normalizedTier: "A", normalizedScore: 80 },
        ],
        disagreementRule: syntheticRule,
      });
      expect(result.disagreementLevel).toBe("low");
    });
  });

  describe("Freshness Calculation", () => {
    const referenceDate = new Date("2026-10-09T00:00:00Z");

    it("returns preliminary when source date is missing", () => {
      const status = calculateFreshness({
        sourceDate: null,
        checkedAt: referenceDate,
      });
      expect(status).toBe("preliminary");
    });

    it("returns unconfigured when explicit current threshold is not configured", () => {
      const status = calculateFreshness({
        sourceDate: new Date("2026-10-01T00:00:00Z"),
        checkedAt: referenceDate,
      });
      expect(status).toBe("unconfigured");
    });

    it("returns current when within configured explicit threshold", () => {
      const status = calculateFreshness({
        sourceDate: new Date("2026-10-01T00:00:00Z"), // 8 days ago
        checkedAt: referenceDate,
        thresholds: { currentMaxDays: 30, preliminaryMaxDays: 90 },
      });
      expect(status).toBe("current");
    });

    it("marks stale when strict build match is required and builds differ", () => {
      const status = calculateFreshness({
        sourceDate: new Date("2026-10-05T00:00:00Z"),
        checkedAt: referenceDate,
        sourceBuild: "1.15.2",
        targetBuild: "1.15.3",
        thresholds: { buildMustMatch: true },
      });
      expect(status).toBe("stale");
    });
  });

  describe("Rating Change Tracking", () => {
    it("returns null when tier remains identical", () => {
      const change = detectRatingChange({
        entityId: "ent-warrior",
        rankingContextId: "ctx-overall",
        previousTier: "A",
        newTier: "A",
        toVersionId: "v-2",
      });
      expect(change).toBeNull();
    });

    it("classifies new entity ranking correctly", () => {
      const change = detectRatingChange({
        entityId: "ent-warrior",
        rankingContextId: "ctx-overall",
        previousTier: null,
        newTier: "S",
        toVersionId: "v-2",
      });
      expect(change?.changeType).toBe("new");
      expect(change?.previousTier).toBe("Unranked");
      expect(change?.newTier).toBe("S");
    });

    it("returns reclassified when no explicit tierRankOrder is supplied", () => {
      const change = detectRatingChange({
        entityId: "ent-priest",
        rankingContextId: "ctx-overall",
        previousTier: "B",
        newTier: "A",
        fromVersionId: "v-1",
        toVersionId: "v-2",
      });
      expect(change?.changeType).toBe("reclassified");
    });

    it("detects promotion when explicit tierRankOrder is supplied", () => {
      const change = detectRatingChange({
        entityId: "ent-priest",
        rankingContextId: "ctx-overall",
        previousTier: "B",
        newTier: "A",
        fromVersionId: "v-1",
        toVersionId: "v-2",
        tierRankOrder: ["S", "A", "B", "C"],
        reason: "Patch buff to healing output",
      });
      expect(change?.changeType).toBe("promoted");
      expect(change?.previousTier).toBe("B");
      expect(change?.newTier).toBe("A");
      expect(change?.reason).toBe("Patch buff to healing output");
    });

    it("detects demotion when explicit tierRankOrder is supplied", () => {
      const change = detectRatingChange({
        entityId: "ent-hunter",
        rankingContextId: "ctx-overall",
        previousTier: "S",
        newTier: "B",
        fromVersionId: "v-1",
        toVersionId: "v-2",
        tierRankOrder: ["S", "A", "B", "C"],
      });
      expect(change?.changeType).toBe("demoted");
      expect(change?.previousTier).toBe("S");
      expect(change?.newTier).toBe("B");
    });
  });

  describe("SEO Whitelist & Filter Policy", () => {
    it("strictly limits indexable routes and rejects query parameters", () => {
      // indexable routes must never contain query parameter variants
      const hasQueryRoutes = routeRegistry.indexable().some((r) => r.route.includes("?"));
      expect(hasQueryRoutes).toBe(false);

      // unvalidated prospective sub-routes are strictly rejected
      expect(() => routeRegistry.get("/wow-forever/dps-tier-list")).toThrow();
      expect(() => routeRegistry.get("/wow-forever/pvp-tier-list")).toThrow();
    });

    it("configures target keyword when tier board route is registered", () => {
      const wowRoute = routeRegistry.routes.find((r) => r.route === "/wow-forever/tier-list");
      if (wowRoute) {
        expect(wowRoute.class).toBe("public_indexable");
        if (wowRoute.class === "public_indexable") {
          expect(wowRoute.primaryKeyword).toBe("wow forever tier list");
        }
      }
    });
  });
});
