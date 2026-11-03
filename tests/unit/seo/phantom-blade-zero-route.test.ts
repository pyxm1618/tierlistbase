import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import {
  PHANTOM_BLADE_ZERO_ROUTE,
  PHANTOM_BLADE_ZERO_SEO,
} from "@/modules/phantom-blade-zero-tier-list";
import { metadataForRoute } from "@/platform/seo/metadata";

describe("Phantom Blade Zero release SEO", () => {
  it("publishes the reviewed TDH strategy as public_indexable", () => {
    const route = routeRegistry.get(PHANTOM_BLADE_ZERO_ROUTE);
    expect(route.class).toBe("public_indexable");
    if (route.class !== "public_indexable") throw new Error("route must be indexable");

    expect(route.primaryKeyword).toBe(PHANTOM_BLADE_ZERO_SEO.primaryKeyword);
    expect(route.secondaryKeywords).toEqual(PHANTOM_BLADE_ZERO_SEO.secondaryKeywords);
    expect(route.title).toBe(PHANTOM_BLADE_ZERO_SEO.title);
    expect(route.title.length).toBeLessThanOrEqual(60);
    expect(route.description).toBe(PHANTOM_BLADE_ZERO_SEO.description);
    expect(route.h1).toBe(PHANTOM_BLADE_ZERO_SEO.h1);
    expect(route.reviewStatus).toBe("reviewed");
    expect(route.reviewFingerprint).toBe(
      "2760712d550f0796a0fe97048cff212781e4ddd6cda582f58cdd91a3f94cca4c",
    );
  });

  it("is emitted through the existing sitemap registry", () => {
    expect(routeRegistry.indexable().map((route) => route.route)).toContain(
      PHANTOM_BLADE_ZERO_ROUTE,
    );
    expect(routeRegistry.sitemapEntries().map((route) => route.route)).toContain(
      PHANTOM_BLADE_ZERO_ROUTE,
    );
  });

  it("emits canonical index metadata only in production", () => {
    const production = metadataForRoute(
      routeRegistry,
      PHANTOM_BLADE_ZERO_ROUTE,
      "production",
    );
    expect(production.robots).toEqual({ index: true, follow: true });
    expect(production.alternates?.canonical).toContain(PHANTOM_BLADE_ZERO_ROUTE);
    expect(production.title).toEqual({ absolute: PHANTOM_BLADE_ZERO_SEO.title });
    expect(production.description).toBe(PHANTOM_BLADE_ZERO_SEO.description);

    for (const environment of ["staging", "test", "local"] as const) {
      const metadata = metadataForRoute(routeRegistry, PHANTOM_BLADE_ZERO_ROUTE, environment);
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(metadata.alternates).toBeUndefined();
    }
  });
});
