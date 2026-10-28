import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";

const route = "/dragon-traveler/tier-list";
const hasProjectRoutes = routeRegistry.routes.some(
  (entry) => entry.route === "/wow-forever/vanguard",
);

describe("Dragon Traveler route review policy", () => {
  it("registers the route as public noindex until explicit SEO review promotes it", () => {
    if (!hasProjectRoutes) return;
    const definition = routeRegistry.get(route);
    expect(definition.class).toBe("public_noindex");
    expect(definition.title).toBe("Dragon Traveler Tier List – Best Luminaries Ranked");
    expect(definition.description).toContain("Global and Taiwan");
    expect(routeRegistry.sitemapEntries().map((entry) => entry.route)).not.toContain(route);
  });

  it("does not emit a production canonical or index directive before review", () => {
    if (!hasProjectRoutes) return;
    const metadata = metadataForRoute(routeRegistry, route, "production");
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates).toBeUndefined();
  });
});
