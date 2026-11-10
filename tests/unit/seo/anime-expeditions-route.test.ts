import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { snapshot } from "@/modules/anime-expeditions-tier-list";
import { evidenceCoverage, tierEvidence } from "@/modules/anime-expeditions-tier-list/evidence";
import { metadataForRoute } from "@/platform/seo/metadata";
import { seoReviewFingerprint } from "@/platform/seo/route-registry";

import { getSeoDensityTargetConfigs } from "../../seo/keyword-density.config";

const route = "/anime-expeditions/tier-list";
const canonical = `https://www.tierlistbase.com${route}`;
const PRIMARY = "anime expeditions tier list";
const FROZEN_SECONDARY = [
  "anime expeditions unit tier list",
  "anime expeditions best units",
  "anime expeditions trait tier list",
  "anime expeditions equipment tier list",
] as const;
const PAGE_LAST_MODIFIED = "2026-11-10";
const EVIDENCE_SNAPSHOT_DATE = "2026-11-08";
const SOURCE_REVIEW_DATE = "2026-11-10";

function indexableDefinition() {
  const definition = routeRegistry.get(route);
  if (definition.class !== "public_indexable") {
    throw new Error("Anime Expeditions must be public_indexable");
  }
  return definition;
}

// The Anime Expeditions page is a production route. If it leaves the registry this suite
// must fail, never skip: a silently skipped release contract looks exactly like a passing one.
describe("Anime Expeditions production SEO release", () => {
  it("keeps the route registered as a reviewed public page", () => {
    const registered = routeRegistry.routes.filter((entry) => entry.route === route);

    expect(registered).toHaveLength(1);
    expect(indexableDefinition().reviewStatus).toBe("reviewed");
  });

  it("keeps the frozen keyword mapping untouched by the evidence remediation", () => {
    const definition = indexableDefinition();
    const secondary = definition.secondaryKeywords ?? [];

    expect(definition.primaryKeyword).toBe(PRIMARY);
    expect(secondary).toEqual([...FROZEN_SECONDARY]);
    expect(secondary).toHaveLength(4);
    expect(secondary).not.toContain(PRIMARY);
    expect(new Set(secondary).size).toBe(secondary.length);

    const target = getSeoDensityTargetConfigs().find((config) => config.route === route);
    expect(target).toBeDefined();
    expect(target?.primaryKeyword).toBe(PRIMARY);
    expect(target?.secondaryKeywords).toEqual([...FROZEN_SECONDARY]);
    expect(target?.configurationWarnings).toEqual([]);
  });

  it("keeps the reviewed TDH stable", () => {
    const definition = indexableDefinition();

    expect(definition.title).toBe("Anime Expeditions Tier List – Best Units, Traits & Equipment");
    expect(definition.h1).toBe("Anime Expeditions Tier List");
    expect(definition.description).toBe(
      "Use the Anime Expeditions Tier List to compare the best units across Overall, DPS, Utility, Support and Crowd Control, plus traits, equipment, teams and evolution priorities.",
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
  });

  it("separates page lastModified from the evidence snapshot and the source review date", () => {
    const definition = indexableDefinition();

    expect(snapshot.date).toBe(EVIDENCE_SNAPSHOT_DATE);
    expect(snapshot.reviewedAt).toBe(SOURCE_REVIEW_DATE);
    expect(tierEvidence.source.revisionDate).toBe(EVIDENCE_SNAPSHOT_DATE);
    expect(definition.lastModified).toBe(PAGE_LAST_MODIFIED);
    expect(definition.lastModified).not.toBe(snapshot.date);

    const sitemap = routeRegistry.sitemapEntries().filter((entry) => entry.route === route);
    expect(sitemap).toHaveLength(1);
    expect(sitemap[0]?.lastModified).toBe(definition.lastModified);
    expect(sitemap[0]?.lastModified).toBe(PAGE_LAST_MODIFIED);
    // The sitemap must carry the real page date, never the evidence date.
    expect(sitemap[0]?.lastModified).not.toBe(snapshot.date);
  });

  it("never publishes a reconciliation claim larger than the capture supports", () => {
    expect(evidenceCoverage.disagreeing).toBe(0);
    expect(evidenceCoverage.overallReconciled).toBeLessThanOrEqual(evidenceCoverage.totalUnits);
    expect(evidenceCoverage.overallReconciled).toBe(tierEvidence.reconciliation.agreeing);
    expect(evidenceCoverage.overallReconciled + evidenceCoverage.editorialOnly).toBe(
      evidenceCoverage.totalUnits,
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
