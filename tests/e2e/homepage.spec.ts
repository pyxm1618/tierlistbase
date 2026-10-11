import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";

test("homepage renders the approved game-discovery information architecture", async ({ page }) => {
  const home = routeRegistry.get("/");
  if (home.class !== "public_indexable") throw new Error("homepage must be indexable");

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(home.h1);
  await expect(page.getByRole("heading", { name: "Explore Tier Lists" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why TierListBase?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest Updates" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Popular Rankings" })).toBeVisible();
  await expect(page.locator("a[href='/wow-forever/tier-list']").first()).toBeVisible();
  await expect(page.locator("a[href^='/genshin']")).toHaveCount(0);
  await expect(page.getByText(/best online tool/i)).toHaveCount(0);

  const html = await response?.text();
  expect(html).toContain("Explore Tier Lists");
  expect(html).toContain("Game Meta.");
});

for (const width of [390, 768, 1024, 1440, 1920, 2560]) {
  test(
    "homepage " + width + "px viewport uses a fluid layout without horizontal overflow",
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto("/");
      expect(response?.status()).toBe(200);

      const dimensions = await page.evaluate(() => {
        const shell = document.querySelector(".tlb-shell");
        if (!shell) throw new Error("homepage shell missing");
        return {
          documentWidth: document.documentElement.scrollWidth,
          shellWidth: shell.getBoundingClientRect().width,
        };
      });
      expect(dimensions.documentWidth).toBeLessThanOrEqual(width + 1);
      expect(dimensions.shellWidth).toBeGreaterThan(
        width >= 2560 ? 1700 : width >= 1920 ? 1500 : width * 0.8,
      );
    },
  );
}

test("WoW route remains navigable and ranked content remains intact", async ({ page }) => {
  await page.goto("/");
  const link = page.locator("a[href='/wow-forever/tier-list']").first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/wow-forever\/tier-list/);

  const target = routeRegistry.get("/wow-forever/tier-list");
  if (target.class !== "public_indexable") throw new Error("target route must be indexable");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(target.h1);
});
