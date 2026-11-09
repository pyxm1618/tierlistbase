import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { snapshotDate } from "@/modules/dragon-traveler-tier-list";
import { metadataForRoute } from "@/platform/seo/metadata";
import { seoReviewFingerprint } from "@/platform/seo/route-registry";

import { getSeoDensityTargetConfigs } from "../../seo/keyword-density.config";

const route = "/dragon-traveler/tier-list";
const canonical = `https://www.tierlistbase.com${route}`;
const FROZEN_SECONDARY = [
  "dragon traveler pve tier list",
  "dragon traveler pvp tier list",
  "dragon traveler tier list taiwan",
] as const;
const REJECTED_SECONDARY = "dragon traveler taiwan tier list";
const PAGE_LAST_MODIFIED = "2026-11-09";
const EVIDENCE_SNAPSHOT_DATE = "2026-11-03";

// The neutral-product (clean setup) inventory does not register this game page.
// Guard on the Dragon Traveler route itself, never on an unrelated retired route.
const hasDragonRoute = routeRegistry.routes.some((entry) => entry.route === route);

function indexableDefinition() {
  const definition = routeRegistry.get(route);
  if (definition.class !== "public_indexable") {
    throw new Error("Dragon Traveler must be public_indexable");
  }
  return definition;
}

describe.skipIf(!hasDragonRoute)("Dragon Traveler production SEO release", () => {
  it("registers the frozen three-keyword secondary mapping", () => {
    const definition = indexableDefinition();
    const secondary = definition.secondaryKeywords ?? [];

    expect(definition.primaryKeyword).toBe("dragon traveler tier list");
    expect(secondary).toEqual([...FROZEN_SECONDARY]);
    expect(secondary).toHaveLength(3);
    expect(secondary).not.toContain(REJECTED_SECONDARY);
    expect(secondary).not.toContain(definition.primaryKeyword);
    expect(new Set(secondary).size).toBe(secondary.length);
  });

  it("keeps the rejected word-order variant outside the density gate targets", () => {
    const target = getSeoDensityTargetConfigs().find((config) => config.route === route);

    expect(target).toBeDefined();
    expect(target?.primaryKeyword).toBe("dragon traveler tier list");
    expect(target?.secondaryKeywords).toEqual([...FROZEN_SECONDARY]);
    expect(target?.secondaryKeywords).not.toContain(REJECTED_SECONDARY);
    expect(target?.configurationWarnings).toEqual([]);
  });

  it("keeps the reviewed TDH stable", () => {
    const definition = indexableDefinition();

    expect(definition.title).toBe("Dragon Traveler Tier List – Best Luminaries Ranked");
    expect(definition.h1).toBe("Dragon Traveler Tier List");
    expect(definition.description).toBe(
      "Compare the Dragon Traveler Tier List for Overall, PvE and PvP Luminary rankings, best teams, and account decisions across Global and Taiwan servers.",
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

  it("separates page lastModified from the ranking evidence snapshotDate", () => {
    const definition = indexableDefinition();

    expect(snapshotDate).toBe(EVIDENCE_SNAPSHOT_DATE);
    expect(definition.lastModified).toBe(PAGE_LAST_MODIFIED);
    expect(definition.lastModified).not.toBe(snapshotDate);

    const sitemap = routeRegistry.sitemapEntries().filter((entry) => entry.route === route);
    expect(sitemap).toHaveLength(1);
    expect(sitemap[0]?.lastModified).toBe(definition.lastModified);
    expect(sitemap[0]?.lastModified).toBe(PAGE_LAST_MODIFIED);
    expect(sitemap[0]?.lastModified).not.toBe(snapshotDate);
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
