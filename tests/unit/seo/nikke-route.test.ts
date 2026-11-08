import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";
import { seoReviewFingerprint } from "@/platform/seo/route-registry";

const route = "/nikke/tier-list";
const canonical = `https://www.tierlistbase.com${route}`;
const hasProjectRoutes = routeRegistry.routes.some(
  (entry) => entry.route === "/wow-forever/vanguard",
);

const TITLE = "NIKKE Tier List – Best Characters in Goddess of Victory";
const DESCRIPTION =
  "Review the Goddess of Victory NIKKE tier list as a v122.8 pre-anniversary character ranking snapshot from October 25, 2026, with Campaign, Boss and PvP tiers.";

describe("NIKKE production SEO release", () => {
  it("registers the frozen keyword group and snapshot-framed metadata", () => {
    if (!hasProjectRoutes) return;
    const definition = routeRegistry.get(route);
    expect(definition.class).toBe("public_indexable");
    if (definition.class !== "public_indexable") throw new Error("NIKKE must be indexable");

    expect(definition.primaryKeyword).toBe("nikke tier list");
    expect(definition.secondaryKeywords).toEqual([
      "goddess of victory nikke tier list",
      "nikke character tier list",
    ]);
    expect(definition.secondaryKeywords).not.toContain(
      "goddess of victory nikke character tier list",
    );

    expect(definition.title).toBe(TITLE);
    expect(definition.h1).toBe("NIKKE Tier List");
    expect(definition.description).toBe(DESCRIPTION);

    expect(definition.reviewStatus).toBe("reviewed");
    expect(definition.reviewFingerprint).toBe(seoReviewFingerprint(definition));
    expect(definition.lastModified).toBe("2026-11-07");
    expect(routeRegistry.sitemapEntries().filter((entry) => entry.route === route)).toHaveLength(1);
  });

  it("keeps the title front-loaded, inside 40-60 characters and free of repeated NIKKE", () => {
    if (!hasProjectRoutes) return;
    const definition = routeRegistry.get(route);
    if (definition.class !== "public_indexable") throw new Error("NIKKE must be indexable");

    expect(definition.title.startsWith("NIKKE Tier List")).toBe(true);
    expect(definition.title).toContain("Goddess of Victory");
    expect(definition.title.length).toBeGreaterThanOrEqual(40);
    expect(definition.title.length).toBeLessThanOrEqual(60);
    expect(definition.title.match(/NIKKE/g) ?? []).toHaveLength(1);
  });

  it("uses the existing production canonical and robots policy", () => {
    if (!hasProjectRoutes) return;
    const metadata = metadataForRoute(routeRegistry, route, "production");
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(canonical);
  });

  it.each(["local", "test", "staging"] as const)(
    "preserves noindex and no canonical in %s",
    (environment) => {
      if (!hasProjectRoutes) return;
      const metadata = metadataForRoute(routeRegistry, route, environment);
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(metadata.alternates).toBeUndefined();
    },
  );
});
