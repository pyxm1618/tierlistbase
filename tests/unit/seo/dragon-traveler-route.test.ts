import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";

const route = "/dragon-traveler/tier-list";
const hasProjectRouteInventory = routeRegistry.routes.some(
  (entry) => entry.route === "/wow-forever/vanguard",
);

describe("Dragon Traveler release SEO policy", () => {
  it("stays public noindex until the route receives an explicit reviewed SEO release", () => {
    if (!hasProjectRouteInventory) return;

    const definition = routeRegistry.get(route);
    expect(definition.class).toBe("public_noindex");
    expect(definition.title).toBe("Dragon Traveler Tier List – Best Luminaries Ranked");
    expect(definition.description).toBe(
      "Compare current Dragon Traveler Luminary rankings across Global and Taiwan server contexts, with PvE, PvP, teams, account decisions, changes, and source methodology.",
    );
    expect(routeRegistry.sitemapEntries().map((entry) => entry.route)).not.toContain(route);
  });

  it("emits no canonical and cannot become indexable by environment alone", () => {
    if (!hasProjectRouteInventory) return;

    const production = metadataForRoute(routeRegistry, route, "production");
    expect(production.robots).toMatchObject({ index: false });
    expect(production.alternates).toBeUndefined();

    for (const environment of ["local", "test", "staging"] as const) {
      const metadata = metadataForRoute(routeRegistry, route, environment);
      expect(metadata.robots).toMatchObject({ index: false });
      expect(metadata.alternates).toBeUndefined();
    }
  });
});
