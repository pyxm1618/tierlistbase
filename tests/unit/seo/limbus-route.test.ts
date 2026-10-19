import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";

import { routeRegistry as exampleRegistry } from "../../../examples/neutral-product/routes.config";

const route = "/limbus-company/tier-list";

describe.each([
  ["project", routeRegistry],
  ["clean setup", exampleRegistry],
] as const)("%s Limbus registry", (_name, registry) => {
  it("keeps the mock Limbus preview out of the indexable surface and sitemap", () => {
    expect(registry.get(route).class).toBe("public_noindex");
    expect(registry.indexable().map((entry) => entry.route)).not.toContain(route);
    expect(registry.sitemapEntries().map((entry) => entry.route)).not.toContain(route);
  });

  it.each(["production", "staging", "test", "local"] as const)(
    "emits noindex without canonical in %s, following only environment policy",
    (environment) => {
      const metadata = metadataForRoute(registry, route, environment);
      expect(metadata.robots).toEqual({ index: false, follow: environment === "production" });
      expect(metadata.alternates).toBeUndefined();
      expect(metadata.title).toEqual({
        absolute: "Limbus Company Tier List Preview | TierListBase",
      });
      expect(metadata.description).toContain("Preview the TierListBase Limbus Company");
    },
  );
});
