import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { coverage, snapshot } from "@/modules/wild-rift-tier-list";
import { metadataForRoute } from "@/platform/seo/metadata";
import { seoReviewFingerprint } from "@/platform/seo/route-registry";

import { getSeoDensityTargetConfigs } from "../../seo/keyword-density.config";

const route = "/wild-rift/tier-list";
const canonical = `https://www.tierlistbase.com${route}`;
const PRIMARY = "wild rift tier list";
const FROZEN_SECONDARY = ["wild rift champion tier list"] as const;
const REJECTED_SECONDARY = "wild rift champions tier list";
const PAGE_LAST_MODIFIED = "2026-11-09";
const EVIDENCE_SNAPSHOT_DATE = "2026-11-07";
const SOURCE_REVIEW_DATE = "2026-11-09";

// The neutral-product (clean setup) inventory does not register this game page.
const hasWildRiftRoute = routeRegistry.routes.some((entry) => entry.route === route);

function indexableDefinition() {
  const definition = routeRegistry.get(route);
  if (definition.class !== "public_indexable") {
    throw new Error("Wild Rift must be public_indexable");
  }
  return definition;
}

describe.skipIf(!hasWildRiftRoute)("Wild Rift production SEO release", () => {
  it("registers the frozen primary and the single approved secondary", () => {
    const definition = indexableDefinition();
    const secondary = definition.secondaryKeywords ?? [];

    expect(definition.primaryKeyword).toBe(PRIMARY);
    expect(secondary).toEqual([...FROZEN_SECONDARY]);
    expect(secondary).toHaveLength(1);
    expect(secondary).not.toContain(REJECTED_SECONDARY);
    expect(secondary).not.toContain(definition.primaryKeyword);
    expect(new Set(secondary).size).toBe(secondary.length);
  });

  it("keeps the rejected singular/plural duplicate outside every formal keyword surface", () => {
    const target = getSeoDensityTargetConfigs().find((config) => config.route === route);

    expect(target).toBeDefined();
    expect(target?.primaryKeyword).toBe(PRIMARY);
    expect(target?.secondaryKeywords).toEqual([...FROZEN_SECONDARY]);
    expect(target?.secondaryKeywords).not.toContain(REJECTED_SECONDARY);
    expect(target?.configurationWarnings).toEqual([]);

    // The rejected variant must not survive as a formal target anywhere in the registry.
    for (const entry of routeRegistry.routes) {
      const secondaries = "secondaryKeywords" in entry ? (entry.secondaryKeywords ?? []) : [];
      expect(secondaries).not.toContain(REJECTED_SECONDARY);
    }
  });

  it("keeps the reviewed TDH stable", () => {
    const definition = indexableDefinition();

    expect(definition.title).toBe("Wild Rift Tier List – Best Champions by Role for Ranked");
    expect(definition.h1).toBe("Wild Rift Tier List");
    expect(definition.description).toBe(
      "Compare the current Wild Rift tier list across Baron, Jungle, Mid, Dragon and Support using ranked statistics, role-specific evidence, and reviewed meta context.",
    );
  });

  it("matches the route-level review fingerprint for the final metadata", () => {
    const definition = indexableDefinition();

    expect(definition.reviewStatus).toBe("reviewed");
    expect(definition.reviewFingerprint).toBe(seoReviewFingerprint(definition));

    // The recorded fingerprint must be bound to this metadata, not a stale constant.
    expect(seoReviewFingerprint({ ...definition, lastModified: EVIDENCE_SNAPSHOT_DATE })).not.toBe(
      definition.reviewFingerprint,
    );
    expect(
      seoReviewFingerprint({
        ...definition,
        secondaryKeywords: [...FROZEN_SECONDARY, REJECTED_SECONDARY],
      }),
    ).not.toBe(definition.reviewFingerprint);
  });

  it("separates page lastModified from the statistics snapshot and the source review date", () => {
    const definition = indexableDefinition();

    expect(snapshot.snapshotDate).toBe(EVIDENCE_SNAPSHOT_DATE);
    expect(snapshot.reviewedAt).toBe(SOURCE_REVIEW_DATE);
    expect(definition.lastModified).toBe(PAGE_LAST_MODIFIED);
    expect(definition.lastModified).not.toBe(snapshot.snapshotDate);
    expect(definition.lastModified).not.toBe(snapshot.gameVersion);

    const sitemap = routeRegistry.sitemapEntries().filter((entry) => entry.route === route);
    expect(sitemap).toHaveLength(1);
    expect(sitemap[0]?.lastModified).toBe(definition.lastModified);
    expect(sitemap[0]?.lastModified).toBe(PAGE_LAST_MODIFIED);
    expect(sitemap[0]?.lastModified).not.toBe(snapshot.snapshotDate);
  });

  it("keeps the published coverage claim inside the verified evidence", () => {
    expect(coverage.statisticsBackedPlacements).toBe(180);
    expect(coverage.editorialPlacements).toBe(29);
    expect(coverage.statisticsBackedPlacements + coverage.editorialPlacements).toBe(209);
    expect(coverage.sourceRoleRows).toBe(coverage.statisticsBackedPlacements);
    expect(coverage.distinctStatisticsChampions).toBeLessThanOrEqual(
      coverage.sourceObservedChampions,
    );
  });

  it("uses production index/follow and canonical", () => {
    const metadata = metadataForRoute(routeRegistry, route, "production");
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(canonical);
  });

  it.each(["local", "test", "staging"] as const)(
    "preserves noindex and no canonical in %s",
    (environment) => {
      const metadata = metadataForRoute(routeRegistry, route, environment);
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(metadata.alternates).toBeUndefined();
    },
  );
});
