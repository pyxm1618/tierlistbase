import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";
import { seoReviewFingerprint } from "@/platform/seo/route-registry";

const route = "/dragon-traveler/tier-list";
const canonical = `https://www.tierlistbase.com${route}`;
const hasProjectRouteInventory = routeRegistry.routes.some(
  (entry) => entry.route === "/wow-forever/vanguard",
);

describe("Dragon Traveler production SEO release", () => {
  it("registers the reviewed keyword group and release metadata", () => {
    if (!hasProjectRouteInventory) return;

    const definition = routeRegistry.get(route);
    expect(definition.class).toBe("public_indexable");
    if (definition.class !== "public_indexable") {
      throw new Error("Dragon Traveler must be indexable");
    }
    expect(definition.primaryKeyword).toBe("dragon traveler tier list");
    expect(definition.secondaryKeywords).toEqual([
      "dragon traveler pve tier list",
      "dragon traveler pvp tier list",
      "dragon traveler tier list taiwan",
      "dragon traveler taiwan tier list",
    ]);
    expect(definition.title).toBe("Dragon Traveler Tier List – Best Luminaries Ranked");
    expect(definition.h1).toBe("Dragon Traveler Tier List");
    expect(definition.description).toBe(
      "Compare the Dragon Traveler Tier List for Overall, PvE and PvP Luminary rankings, best teams, and account decisions across Global and Taiwan servers.",
    );
    expect(definition.reviewStatus).toBe("reviewed");
    expect(definition.reviewFingerprint).toBe(seoReviewFingerprint(definition));
    expect(definition.lastModified).toBe("2026-11-03");
    expect(routeRegistry.sitemapEntries().filter((entry) => entry.route === route)).toHaveLength(1);
  });

  it("uses production index/follow and canonical", () => {
    if (!hasProjectRouteInventory) return;

    const metadata = metadataForRoute(routeRegistry, route, "production");
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(canonical);
  });

  it.each(["local", "test", "staging"] as const)(
    "preserves noindex and no canonical in %s",
    (environment) => {
      if (!hasProjectRouteInventory) return;

      const metadata = metadataForRoute(routeRegistry, route, environment);
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(metadata.alternates).toBeUndefined();
    },
  );
});
