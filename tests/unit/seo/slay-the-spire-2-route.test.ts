import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { snapshot } from "@/modules/slay-the-spire-2-tier-list";
import { metadataForRoute } from "@/platform/seo/metadata";
import { seoReviewFingerprint } from "@/platform/seo/route-registry";

import {
  getSeoDensityTargetConfigs,
  SEO_DENSITY_TARGET_IDS,
} from "../../seo/keyword-density.config";

const route = "/slay-the-spire-2/tier-list";
const canonical = `https://www.tierlistbase.com${route}`;
const PRIMARY = "slay the spire 2 tier list";
const FROZEN_SECONDARY = [
  "slay the spire 2 card tier list",
  "slay the spire 2 relic tier list",
  "slay the spire 2 character tier list",
] as const;
const REJECTED_SECONDARY = "slay the spire 2 cards tier list";
const CONTENT_ONLY_SECONDARY = "slay the spire 2 potion tier list";
const PAGE_LAST_MODIFIED = "2026-11-10";
const EVIDENCE_SNAPSHOT_DATE = "2026-11-06";

function indexableDefinition() {
  const definition = routeRegistry.get(route);
  if (definition.class !== "public_indexable") {
    throw new Error("Slay the Spire 2 must be public_indexable");
  }
  return definition;
}

function secondaryKeywordsOf(definition: unknown): readonly string[] {
  return definition !== null && typeof definition === "object" && "secondaryKeywords" in definition
    ? ((definition as { secondaryKeywords?: readonly string[] }).secondaryKeywords ?? [])
    : [];
}

// The Slay the Spire 2 page is a production route. If it disappears from the registry this suite
// must fail, never skip: a silently skipped release contract is indistinguishable from a passing one.
describe("Slay the Spire 2 production SEO release", () => {
  it("keeps the route registered as a reviewed public page", () => {
    const registered = routeRegistry.routes.filter((entry) => entry.route === route);

    expect(registered).toHaveLength(1);
    const definition = indexableDefinition();
    expect(definition.reviewStatus).toBe("reviewed");
  });

  it("registers the frozen primary and exactly three approved secondaries", () => {
    const definition = indexableDefinition();
    const secondary = definition.secondaryKeywords ?? [];

    expect(definition.primaryKeyword).toBe(PRIMARY);
    expect(secondary).toEqual([...FROZEN_SECONDARY]);
    expect(secondary).toHaveLength(3);
    expect(secondary).not.toContain(definition.primaryKeyword);
    expect(new Set(secondary).size).toBe(secondary.length);
    for (const keyword of secondary) expect(keyword).not.toBe(REJECTED_SECONDARY);
  });

  it("keeps the rejected singular/plural duplicate outside every formal keyword surface", () => {
    const definition = indexableDefinition();
    const target = getSeoDensityTargetConfigs().find((config) => config.route === route);

    expect(target).toBeDefined();
    expect(target?.primaryKeyword).toBe(PRIMARY);
    expect(target?.secondaryKeywords).toEqual([...FROZEN_SECONDARY]);
    expect(target?.secondaryKeywords).not.toContain(REJECTED_SECONDARY);
    expect(target?.configurationWarnings).toEqual([]);
    expect(definition.secondaryKeywords ?? []).not.toContain(REJECTED_SECONDARY);

    // The rejected variant must not survive as a formal target anywhere in the registry.
    for (const entry of routeRegistry.routes) {
      expect(secondaryKeywordsOf(entry)).not.toContain(REJECTED_SECONDARY);
    }
  });

  it("keeps the potion intent in page content without promoting it to a formal secondary", () => {
    const definition = indexableDefinition();
    const secondary = definition.secondaryKeywords ?? [];

    expect(secondary).not.toContain(CONTENT_ONLY_SECONDARY);
    expect(definition.primaryKeyword).not.toBe(CONTENT_ONLY_SECONDARY);
    for (const entry of routeRegistry.routes) {
      expect(secondaryKeywordsOf(entry)).not.toContain(CONTENT_ONLY_SECONDARY);
    }
    for (const config of getSeoDensityTargetConfigs()) {
      expect(config.secondaryKeywords).not.toContain(CONTENT_ONLY_SECONDARY);
      expect(config.primaryKeyword).not.toBe(CONTENT_ONLY_SECONDARY);
    }

    // Potions remain part of the page's search intent and content, just not of the keyword set.
    expect(definition.searchIntent.toLowerCase()).toContain("potion");
  });

  it("scores the frozen keyword group through the shared density target", () => {
    const ids = SEO_DENSITY_TARGET_IDS.filter((id) => id === "slay-the-spire-2");
    const targets = getSeoDensityTargetConfigs().filter((config) => config.route === route);

    expect(ids).toEqual(["slay-the-spire-2"]);
    expect(targets).toHaveLength(1);
    expect(targets[0]?.id).toBe("slay-the-spire-2");

    const target = targets[0];
    if (!target) throw new Error("Slay the Spire 2 density target is missing");

    // The scored group is primary plus the three frozen secondaries: nothing else is counted,
    // so the rejected plural and the potion intent cannot inflate the density percentage.
    expect([target.primaryKeyword, ...target.secondaryKeywords]).toEqual([
      PRIMARY,
      ...FROZEN_SECONDARY,
    ]);
    expect(target.contentSelector.length).toBeGreaterThan(0);
  });

  it("keeps the reviewed TDH stable", () => {
    const definition = indexableDefinition();

    expect(definition.title).toBe("Slay the Spire 2 Tier List – Best Cards, Relics & Characters");
    expect(definition.h1).toBe("Slay the Spire 2 Tier List");
    expect(definition.description).toBe(
      "Compare the Slay the Spire 2 tier list for Main v0.107.1 across cards, relics, characters and potions, with contextual rankings and linked evidence.",
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
    expect(
      seoReviewFingerprint({
        ...definition,
        secondaryKeywords: [...FROZEN_SECONDARY, CONTENT_ONLY_SECONDARY],
      }),
    ).not.toBe(definition.reviewFingerprint);
  });

  it("separates the page lastModified from the main-only ranking snapshot date", () => {
    const definition = indexableDefinition();

    expect(snapshot.date).toBe(EVIDENCE_SNAPSHOT_DATE);
    expect(definition.lastModified).toBe(PAGE_LAST_MODIFIED);
    expect(definition.lastModified).not.toBe(snapshot.date);
    expect(definition.lastModified).not.toBe(snapshot.mainVersion);
    expect(definition.lastModified).not.toBe(snapshot.betaVersion);

    const sitemap = routeRegistry.sitemapEntries().filter((entry) => entry.route === route);
    expect(sitemap).toHaveLength(1);
    expect(sitemap[0]?.lastModified).toBe(definition.lastModified);
    expect(sitemap[0]?.lastModified).toBe(PAGE_LAST_MODIFIED);
    expect(sitemap[0]?.lastModified).not.toBe(snapshot.date);
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
