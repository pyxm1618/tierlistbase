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
      "84593b90ce92e7af3fc6403a1d441ff114bf083adfd31b1530185d78611ee96c",
    );
  });

  it("keeps the frozen keyword mapping free of duplicates and plural variants", () => {
    const route = routeRegistry.get(PHANTOM_BLADE_ZERO_ROUTE);
    if (route.class !== "public_indexable") throw new Error("route must be indexable");

    expect(PHANTOM_BLADE_ZERO_SEO.primaryKeyword).toBe("phantom blade zero tier list");
    expect(PHANTOM_BLADE_ZERO_SEO.secondaryKeywords).toEqual([
      "phantom blade zero weapon tier list",
      "phantom blade zero phantom edge tier list",
    ]);

    expect(route.primaryKeyword).toBe("phantom blade zero tier list");

    const secondaryKeywords = route.secondaryKeywords ?? [];
    expect(secondaryKeywords).toEqual([
      "phantom blade zero weapon tier list",
      "phantom blade zero phantom edge tier list",
    ]);

    // The primary keyword must never be repeated inside the secondary list.
    expect(secondaryKeywords).not.toContain(route.primaryKeyword);

    // Plural variants are removed so a single canonical form owns each secondary intent.
    expect(secondaryKeywords).not.toContain("phantom blade zero weapons tier list");
    expect(secondaryKeywords).not.toContain("phantom blade zero phantom edges tier list");
    for (const keyword of secondaryKeywords) {
      expect(keyword.endsWith("weapons tier list")).toBe(false);
      expect(keyword.endsWith("phantom edges tier list")).toBe(false);
    }

    // A duplicated primary would otherwise register as a second "secondary" and break dominance.
    expect(secondaryKeywords.length).toBe(new Set(secondaryKeywords).size);
  });

  it("keeps the reviewed TDH fields stable across the keyword cleanup", () => {
    const route = routeRegistry.get(PHANTOM_BLADE_ZERO_ROUTE);
    if (route.class !== "public_indexable") throw new Error("route must be indexable");

    expect(route.title).toBe("Phantom Blade Zero Tier List – Weapons & Phantom Edges");
    expect(route.h1).toBe("Phantom Blade Zero Tier List");
    expect(route.lastModified).toBe("2026-11-08");
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
    const production = metadataForRoute(routeRegistry, PHANTOM_BLADE_ZERO_ROUTE, "production");
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
