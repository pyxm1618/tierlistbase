import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";

import { routeRegistry as exampleRegistry } from "../../../examples/neutral-product/routes.config";

const route = "/limbus-company/tier-list";

describe("project Limbus SEO copy", () => {
  it("keeps the final SEO copy ready while the route remains noindex", () => {
    const definition = routeRegistry.get(route);
    expect(definition.class).toBe("public_noindex");
    expect(definition.title).toBe("Limbus Company Tier List – Best Identities & E.G.O Ranked");
    expect(definition.description).toBe(
      "Use the Limbus Company Tier List to compare Identity, team, and E.G.O rankings, identify the strongest options, and decide what is worth building for your account.",
    );
  });
});

describe.each([
  ["project", routeRegistry],
  ["clean setup", exampleRegistry],
] as const)("%s Limbus registry", (_name, registry) => {
  it("keeps the noindex Limbus route out of the indexable surface and sitemap", () => {
    expect(registry.get(route).class).toBe("public_noindex");
    expect(registry.indexable().map((entry) => entry.route)).not.toContain(route);
    expect(registry.sitemapEntries().map((entry) => entry.route)).not.toContain(route);
  });

  it.each(["production", "staging", "test", "local"] as const)(
    "emits noindex without canonical in %s, following only environment policy",
    (environment) => {
      const definition = registry.get(route);
      const metadata = metadataForRoute(registry, route, environment);
      expect(metadata.robots).toEqual({ index: false, follow: environment === "production" });
      expect(metadata.alternates).toBeUndefined();
      expect(metadata.title).toEqual({ absolute: definition.title });
      expect(metadata.description).toBe(definition.description);
    },
  );
});
