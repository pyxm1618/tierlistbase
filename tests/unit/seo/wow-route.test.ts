import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { seoReviewFingerprint } from "@/platform/seo/route-registry";

describe("WoW Forever SEO route", () => {
  it("keeps the frozen primary while mapping the approved secondary keywords", () => {
    const route = routeRegistry.get("/wow-forever/tier-list");
    if (route.class !== "public_indexable") throw new Error("WoW route must be indexable");

    expect(route.primaryKeyword).toBe("wow tier list");
    expect(route.secondaryKeywords).toEqual(["wow dps tier list", "wow forever tier list"]);
    expect(route.title).toBe("WoW Tier List – WoW Forever Dungeon Spec Rankings");
    expect(route.h1).toBe("WoW Tier List");
  });

  it("describes the Beta data as archived and keeps review integrity valid", () => {
    const route = routeRegistry.get("/wow-forever/tier-list");
    if (route.class !== "public_indexable") throw new Error("WoW route must be indexable");

    expect(route.searchIntent).toMatch(/archived/i);
    expect(route.description).toMatch(/archived Level 30 Beta/i);
    expect(route.description).not.toMatch(/current|latest/i);
    expect(route.reviewStatus).toBe("reviewed");
    expect(route.reviewFingerprint).toBe(seoReviewFingerprint(route));
  });
});
