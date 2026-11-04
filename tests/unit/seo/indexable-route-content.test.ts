import { describe, expect, it } from "vitest";

import {
  dedicatedMarketingPagePath,
  hasDedicatedMarketingPage,
} from "../../../scripts/lib/indexable-route-content";

describe("indexable route content discovery", () => {
  it("maps public routes to the dedicated marketing page source tree", () => {
    expect(dedicatedMarketingPagePath("/genshin-impact/tier-list")).toBe(
      "src/app/(marketing)/genshin-impact/tier-list/page.tsx",
    );
    expect(dedicatedMarketingPagePath("/about")).toBe("src/app/(marketing)/about/page.tsx");
  });

  it("detects dedicated marketing pages without a duplicated route whitelist", async () => {
    await expect(hasDedicatedMarketingPage("/genshin-impact/tier-list")).resolves.toBe(true);
    await expect(hasDedicatedMarketingPage("/definitely-not-a-real-route")).resolves.toBe(false);
  });

  it("rejects unsafe route traversal", () => {
    expect(() => dedicatedMarketingPagePath("/../secret")).toThrow("invalid public route");
  });
});
