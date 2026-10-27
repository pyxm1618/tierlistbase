import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";
import { seoReviewFingerprint } from "@/platform/seo/route-registry";

const route = "/zenless-zone-zero/tier-list";
const canonical = `https://www.tierlistbase.com${route}`;
const hasProjectRoutes = routeRegistry.routes.some(
  (entry) => entry.route === "/wow-forever/vanguard",
);

describe("ZZZ production SEO release", () => {
  it("registers the reviewed keyword group and existing metadata", () => {
    if (!hasProjectRoutes) return;
    const definition = routeRegistry.get(route);
    expect(definition.class).toBe("public_indexable");
    if (definition.class !== "public_indexable") throw new Error("ZZZ must be indexable");
    expect(definition.primaryKeyword).toBe("zzz tier list");
    expect(definition.secondaryKeywords).toEqual([
      "zzz character tier list",
      "zenless zone zero tier list",
      "zenless zone zero character tier list",
    ]);
    expect(definition.title).toBe("ZZZ Tier List – Best Zenless Zone Zero Characters Ranked");
    expect(definition.h1).toBe("ZZZ Tier List");
    expect(definition.description).toBe(
      "Explore the Zenless Zone Zero Tier List with current character rankings, best characters and agents, team-building insights, and pull decisions.",
    );
    expect(definition.reviewStatus).toBe("reviewed");
    expect(definition.reviewFingerprint).toBe(seoReviewFingerprint(definition));
    expect(definition.lastModified).toBe("2026-10-27");
    expect(routeRegistry.sitemapEntries().filter((entry) => entry.route === route)).toHaveLength(1);
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
