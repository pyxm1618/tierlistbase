import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

describe("Wild Rift SEO route", () => {
  const route = routeRegistry.get("/wild-rift/tier-list");

  it("is a reviewed, indexable single canonical route", () => {
    expect(route.class).toBe("public_indexable");
    if (route.class !== "public_indexable") return;

    expect(route.primaryKeyword).toBe("wild rift tier list");
    expect(route.h1).toBe("Wild Rift Tier List");
    expect(route.title).toBe("Wild Rift Tier List – Best Champions by Role for Ranked");
    expect(route.description).toContain("Baron");
    expect(route.description).toContain("Jungle");
    expect(route.description).toContain("Mid");
    expect(route.description).toContain("Dragon");
    expect(route.description).toContain("Support");
    expect(routeRegistry.sitemapEntries().some((entry) => entry.route === route.route)).toBe(true);
  });

  it("emits production canonical/index/follow and keeps non-production noindex without canonical", () => {
    const production = metadataForRoute(routeRegistry, route.route, "production");
    const productionRobots = production.robots as { index?: boolean; follow?: boolean };

    expect(productionRobots.index).toBe(true);
    expect(productionRobots.follow).toBe(true);
    expect(String(production.alternates?.canonical)).toBe(
      new URL("/wild-rift/tier-list", routeRegistry.site.canonicalOrigin).toString(),
    );

    for (const environment of ["local", "test", "staging"] as const) {
      const metadata = metadataForRoute(routeRegistry, route.route, environment);
      const robots = metadata.robots as { index?: boolean; follow?: boolean };
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(false);
      expect(metadata.alternates?.canonical).toBeUndefined();
    }
  });

  it("builds valid WebApplication JSON-LD for the one canonical Wild Rift page", () => {
    if (route.class !== "public_indexable") throw new Error("route must stay indexable");

    const canonical = new URL(route.route, routeRegistry.site.canonicalOrigin).toString();
    const data = webApplicationJsonLd({
      name: "Wild Rift Tier List",
      url: canonical,
      description: route.description,
    });

    expect(() => JSON.parse(JSON.stringify(data))).not.toThrow();
    expect(data["@type"]).toBe("WebApplication");
    expect(data.url).toBe(canonical);
    expect(data.name).toBe("Wild Rift Tier List");
  });
});
