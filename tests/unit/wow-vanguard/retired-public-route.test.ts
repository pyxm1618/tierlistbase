import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { GET, HEAD } from "@/app/(marketing)/wow-forever/vanguard/route";

describe("retired Vanguard public route", () => {
  it("is absent from the public route registry and sitemap", () => {
    expect(routeRegistry.routes.some((route) => route.route === "/wow-forever/vanguard")).toBe(
      false,
    );
    expect(
      routeRegistry.sitemapEntries().some((entry) => entry.route === "/wow-forever/vanguard"),
    ).toBe(false);

    const homepage = routeRegistry.get("/");
    expect(homepage.class).toBe("public_indexable");
    if (homepage.class !== "public_indexable") return;
    expect(homepage.relatedRoutes).not.toContain("/wow-forever/vanguard");
  });

  it.each([
    ["GET", GET],
    ["HEAD", HEAD],
  ] as const)("returns permanent retirement semantics for %s", async (_method, handler) => {
    const response = handler();

    expect(response.status).toBe(410);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("content-type")).toContain("text/plain");
  });
});
