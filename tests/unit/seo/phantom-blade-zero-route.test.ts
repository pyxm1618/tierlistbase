import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import {
  PHANTOM_BLADE_ZERO_ROUTE,
  PHANTOM_BLADE_ZERO_SEO,
} from "@/modules/phantom-blade-zero-tier-list";
import { metadataForRoute } from "@/platform/seo/metadata";

describe("Phantom Blade Zero preview SEO", () => {
  it("keeps the frozen TDH1 strategy while the route remains public_noindex", () => {
    const route = routeRegistry.get(PHANTOM_BLADE_ZERO_ROUTE);
    expect(route.class).toBe("public_noindex");
    expect(route.title).toBe(PHANTOM_BLADE_ZERO_SEO.title);
    expect(route.description).toBe(PHANTOM_BLADE_ZERO_SEO.description);
    expect(PHANTOM_BLADE_ZERO_SEO.primaryKeyword).toBe("phantom blade zero tier list");
    expect(PHANTOM_BLADE_ZERO_SEO.h1).toBe("Phantom Blade Zero Tier List");
    expect(PHANTOM_BLADE_ZERO_SEO.secondaryKeywords).toEqual([
      "phantom blade zero tier list",
      "phantom blade zero weapon tier list",
      "phantom blade zero weapons tier list",
      "phantom blade zero phantom edge tier list",
      "phantom blade zero phantom edges tier list",
    ]);
  });

  it("stays out of indexable routes and sitemap", () => {
    expect(routeRegistry.indexable().map((route) => route.route)).not.toContain(
      PHANTOM_BLADE_ZERO_ROUTE,
    );
    expect(routeRegistry.sitemapEntries().map((route) => route.route)).not.toContain(
      PHANTOM_BLADE_ZERO_ROUTE,
    );
  });

  it.each(["production", "staging", "test", "local"] as const)(
    "emits noindex and no canonical in %s",
    (environment) => {
      const metadata = metadataForRoute(routeRegistry, PHANTOM_BLADE_ZERO_ROUTE, environment);
      expect(metadata.robots?.index).toBe(false);
      expect(metadata.alternates).toBeUndefined();
      expect(metadata.title).toEqual({ absolute: PHANTOM_BLADE_ZERO_SEO.title });
      expect(metadata.description).toBe(PHANTOM_BLADE_ZERO_SEO.description);
    },
  );
});
