import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";

import { routeRegistry as exampleRegistry } from "../../../examples/neutral-product/routes.config";

const route = "/limbus-company/tier-list";
const hasProjectRouteInventory = routeRegistry.routes.some(
  (entry) => entry.route === "/wow-forever/vanguard",
);

describe("project Limbus SEO launch", () => {
  it("publishes the reviewed Limbus route as indexable with final SEO copy", () => {
    if (!hasProjectRouteInventory) return;

    const definition = routeRegistry.get(route);
    expect(definition.class).toBe("public_indexable");
    if (definition.class !== "public_indexable") throw new Error("Limbus route must be indexable");
    expect(definition.primaryKeyword).toBe("limbus company tier list");
    expect(definition.title).toBe("Limbus Company Tier List – Best Identities & E.G.O Ranked");
    expect(definition.description).toBe(
      "Use the Limbus Company Tier List to compare Identity, team, and E.G.O rankings, identify the strongest options, and decide what is worth building for your account.",
    );
    expect(definition.h1).toBe("LIMBUS COMPANY TIER LIST");
  });

  it("includes Limbus in the project indexable surface and sitemap", () => {
    if (!hasProjectRouteInventory) return;
    expect(routeRegistry.indexable().map((entry) => entry.route)).toContain(route);
    expect(routeRegistry.sitemapEntries().map((entry) => entry.route)).toContain(route);
  });

  it("emits canonical indexable metadata in production", () => {
    if (!hasProjectRouteInventory) return;
    const definition = routeRegistry.get(route);
    if (definition.class !== "public_indexable") throw new Error("Limbus route must be indexable");
    const metadata = metadataForRoute(routeRegistry, route, "production");

    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(`${routeRegistry.site.canonicalOrigin}${route}`);
    expect(metadata.title).toEqual({ absolute: definition.title });
    expect(metadata.description).toBe(definition.description);
  });

  it.each(["staging", "test", "local"] as const)(
    "keeps the indexable route noindex outside production in %s",
    (environment) => {
      if (!hasProjectRouteInventory) return;
      const metadata = metadataForRoute(routeRegistry, route, environment);
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(metadata.alternates).toBeUndefined();
    },
  );
});

describe("clean setup Limbus registry", () => {
  it("keeps the template Limbus route out of the indexable surface and sitemap", () => {
    expect(exampleRegistry.get(route).class).toBe("public_noindex");
    expect(exampleRegistry.indexable().map((entry) => entry.route)).not.toContain(route);
    expect(exampleRegistry.sitemapEntries().map((entry) => entry.route)).not.toContain(route);
  });

  it.each(["production", "staging", "test", "local"] as const)(
    "emits noindex without canonical in %s, following only environment policy",
    (environment) => {
      const definition = exampleRegistry.get(route);
      const metadata = metadataForRoute(exampleRegistry, route, environment);
      expect(metadata.robots).toEqual({ index: false, follow: environment === "production" });
      expect(metadata.alternates).toBeUndefined();
      expect(metadata.title).toEqual({ absolute: definition.title });
      expect(metadata.description).toBe(definition.description);
    },
  );
});
