import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { seoReviewFingerprint } from "@/platform/seo/route-registry";

describe("Genshin Impact SEO route", () => {
  it("keeps the frozen keyword mapping, Title and H1", () => {
    const route = routeRegistry.get("/genshin-impact/tier-list");
    if (route.class !== "public_indexable") throw new Error("Genshin route must be indexable");

    expect(route.primaryKeyword).toBe("genshin tier list");
    expect(route.secondaryKeywords).toEqual([
      "genshin impact tier list",
      "genshin character tier list",
      "genshin impact character tier list",
    ]);
    expect(route.title).toBe("Genshin Tier List – Best Genshin Impact Characters Ranked");
    expect(route.h1).toBe("Genshin Tier List");
  });

  it("labels the reviewed 7.1 data as archived and keeps review integrity valid", () => {
    const route = routeRegistry.get("/genshin-impact/tier-list");
    if (route.class !== "public_indexable") throw new Error("Genshin route must be indexable");

    expect(route.searchIntent).toMatch(/archived.*Version 7\.1/i);
    expect(route.description).toMatch(/archived Version 7\.1/i);
    expect(route.description).not.toMatch(/current|latest/i);
    expect(route.lastModified).toBe("2026-11-07");
    expect(route.reviewStatus).toBe("reviewed");
    expect(route.reviewFingerprint).toBe(seoReviewFingerprint(route));
  });
});
