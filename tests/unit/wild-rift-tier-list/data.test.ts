import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import {
  championForId,
  champions,
  changes,
  expectedRoleCounts,
  otherViableRoles,
  quickInsights,
  quickPickChampionIds,
  rankingFor,
  rankings,
  rankingsForRole,
  roleKeys,
  snapshot,
  sources,
  tiers,
} from "@/modules/wild-rift-tier-list";
import { metadataForRoute } from "@/platform/seo/metadata";
import { serializeJsonLd, webApplicationJsonLd } from "@/platform/seo/structured-data";

const roleSet = new Set(roleKeys);
const tierSet = new Set(tiers);
const championIds = new Set(champions.map((champion) => champion.id));
const sourceIds = new Set(sources.map((source) => source.id));

describe("Wild Rift reviewed snapshot", () => {
  it("uses the reviewed 7.3c game / 7.3b Ranked context with explicit source scope", () => {
    expect(snapshot).toEqual({
      gameVersion: "7.3c",
      latestRankedBalance: "7.3b",
      snapshotDate: "2026-10-26",
      reviewedAt: "2026-10-28",
      region: "CN",
      rankContext: "Master+",
      queueContext: "Ranked",
      focus: "Solo Queue Focus",
    });
    expect(sources.some((source) => source.type === "official_patch")).toBe(true);
    expect(sources.some((source) => source.type === "ranked_statistics")).toBe(true);
    expect(sources.some((source) => source.type === "editorial_review")).toBe(true);
  });

  it("keeps champion ids and Champion × Role placements unique and valid", () => {
    expect(championIds.size).toBe(142);
    expect(champions).toHaveLength(142);
    expect(rankings).toHaveLength(208);

    const placements = new Set<string>();
    for (const ranking of rankings) {
      expect(championIds.has(ranking.championId)).toBe(true);
      expect(roleSet.has(ranking.role)).toBe(true);
      expect(tierSet.has(ranking.tier)).toBe(true);
      const key = `${ranking.championId}:${ranking.role}`;
      expect(placements.has(key)).toBe(false);
      placements.add(key);

      const metrics = [ranking.winRate, ranking.pickRate, ranking.banRate];
      const missingMetrics = metrics.filter((value) => value === null);
      expect(missingMetrics.length === 0 || missingMetrics.length === 3).toBe(true);
      for (const value of metrics) {
        if (value === null) continue;
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
      if (missingMetrics.length) {
        expect(ranking.whyThisTier).toContain("without inventing missing statistics");
      }

      expect(ranking.whyThisTier.trim()).not.toBe("");
      expect(ranking.strengths.length).toBeGreaterThanOrEqual(2);
      expect(ranking.limitations.length).toBeGreaterThanOrEqual(2);
      expect(ranking.patchImpact.trim()).not.toBe("");
      expect(ranking.sourceIds.length).toBeGreaterThanOrEqual(2);
      for (const sourceId of ranking.sourceIds) expect(sourceIds.has(sourceId)).toBe(true);
    }
  });

  it("contains exactly the five frozen Role Tier Lists and no Overall ranking dataset", () => {
    expect(roleKeys).toEqual(["baron", "jungle", "mid", "dragon", "support"]);
    for (const role of roleKeys) {
      const roleRankings = rankingsForRole(role);
      expect(roleRankings).toHaveLength(expectedRoleCounts[role]);
      expect(new Set(roleRankings.map((ranking) => ranking.tier))).toEqual(new Set(tiers));
    }
    expect(rankings.every((ranking) => roleSet.has(ranking.role))).toBe(true);
    expect(
      rankings.some(
        (ranking) => (ranking.role as string) === "all" || (ranking.role as string) === "overall",
      ),
    ).toBe(false);
  });

  it("derives Quick Picks and Other Viable Roles from the same ranking model", () => {
    for (const role of roleKeys) {
      const championId = quickPickChampionIds[role];
      expect(championIds.has(championId)).toBe(true);
      const quickPick = rankingFor(championId, role);
      expect(quickPick).toBeDefined();
      expect(rankingsForRole(role)).toContain(quickPick);

      const otherRoles = otherViableRoles(championId, role);
      for (const other of otherRoles) {
        expect(other.championId).toBe(championId);
        expect(other.role).not.toBe(role);
        expect(rankings).toContain(other);
      }
    }
  });

  it("keeps Quick Insights and dated changes tied to valid Champion × Role rankings", () => {
    for (const role of roleKeys) {
      expect(quickInsights[role]).toHaveLength(4);
      for (const insight of quickInsights[role]) {
        expect(rankingFor(insight.championId, role)).toBeDefined();
        expect(insight.reason.trim()).not.toBe("");
      }
    }

    for (const change of changes) {
      expect(championForId(change.championId).id).toBe(change.championId);
      expect(roleSet.has(change.role)).toBe(true);
      expect(tierSet.has(change.from)).toBe(true);
      expect(tierSet.has(change.to)).toBe(true);
      expect(rankingFor(change.championId, change.role)?.tier).toBe(change.to);
      expect(Number.isNaN(Date.parse(`${change.date}T00:00:00Z`))).toBe(false);
      expect(change.reason.trim()).not.toBe("");
    }
  });
});

describe("Wild Rift SEO contract", () => {
  const route = "/wild-rift/tier-list";

  it("registers one public indexable canonical route with the frozen search intent", () => {
    const definition = routeRegistry.get(route);
    expect(definition.class).toBe("public_indexable");
    if (definition.class !== "public_indexable") throw new Error("Wild Rift route must be indexable");

    expect(definition.primaryKeyword).toBe("wild rift tier list");
    expect(definition.secondaryKeywords).toEqual([
      "wild rift champion tier list",
      "wild rift champions tier list",
    ]);
    expect(definition.h1).toBe("Wild Rift Tier List");
    expect(definition.title).toBe("Wild Rift Tier List – Best Champions by Role for Ranked");
    expect(definition.relatedRoutes).not.toContain("/wild-rift/jungle-tier-list");
    expect(routeRegistry.sitemapEntries().map((entry) => entry.route)).toContain(route);
  });

  it("uses production canonical/index-follow and non-production noindex without canonical", () => {
    const production = metadataForRoute(routeRegistry, route, "production");
    expect(production.robots).toMatchObject({ index: true, follow: true });
    expect(production.alternates?.canonical?.toString()).toBe(
      `${routeRegistry.site.canonicalOrigin}${route}`,
    );

    for (const environment of ["local", "test", "staging"] as const) {
      const metadata = metadataForRoute(routeRegistry, route, environment);
      expect(metadata.robots).toMatchObject({ index: false, follow: false });
      expect(metadata.alternates).toBeUndefined();
    }
  });

  it("produces valid WebApplication JSON-LD for the canonical route", () => {
    const definition = routeRegistry.get(route);
    if (definition.class !== "public_indexable") throw new Error("Wild Rift route must be indexable");
    const value = webApplicationJsonLd({
      name: "Wild Rift Tier List",
      url: `${routeRegistry.site.canonicalOrigin}${route}`,
      description: definition.description,
    });
    const parsed = JSON.parse(serializeJsonLd(value)) as Record<string, unknown>;
    expect(parsed["@type"]).toBe("WebApplication");
    expect(parsed.name).toBe("Wild Rift Tier List");
    expect(parsed.url).toBe(`${routeRegistry.site.canonicalOrigin}${route}`);
  });
});
