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
  await expect(page.locator("a[href='/genshin-impact/tier-list']").first()).toBeVisible();

  const primaryNav = page.getByRole("navigation", { name: "Primary navigation" });
  const wowNav = primaryNav.getByRole("link", { name: "World of Warcraft" });
  const genshinNav = primaryNav.getByRole("link", { name: "Genshin Impact" });
  await expect(wowNav).toBeVisible();
  await expect(genshinNav).toBeVisible();
  await expect(wowNav).not.toHaveAttribute("aria-current", "page");
  await expect(genshinNav).not.toHaveAttribute("aria-current", "page");
  expect(await wowNav.getAttribute("class")).not.toContain("border-b-2");
  expect(await genshinNav.getAttribute("class")).not.toContain("border-b-2");

  const popular = page.locator("#popular-rankings");
  const readyRankings = popular.locator("a.tlb-popular-item");
  await expect(readyRankings).toHaveCount(1);
  await expect(readyRankings).toHaveAttribute(
    "href",
    "/wow-forever/tier-list?mode=dungeon&role=dps&level=30",
  );
  await expect(popular.getByLabel("WoW PvP: coming soon")).toBeVisible();
  await expect(popular.getByLabel("WoW Leveling: coming soon")).toBeVisible();
  await expect(popular.getByLabel("Genshin Characters: coming soon")).toBeVisible();
  await expect(popular.getByLabel("Spiral Abyss: coming soon")).toBeVisible();
  await expect(popular.getByLabel("Exploration : coming soon")).toBeVisible();

  const heroImage = page.locator(".tlb-hero-art img");
  await expect(heroImage).toHaveAttribute("src", /images%2Fhome%2Fhero\.webp|images\/home\/hero\.webp/);
  const gameImages = page.locator(".tlb-game-grid .tlb-card-image img");
  await expect(gameImages).toHaveCount(2);
  await expect(gameImages.nth(0)).toHaveAttribute("loading", "lazy");
  await expect(gameImages.nth(1)).toHaveAttribute("loading", "lazy");

  await expect(page.getByText(/best online tool/i)).toHaveCount(0);

  const html = await response?.text();
  expect(html).toContain("Explore Tier Lists");
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
  await expect(page.getByRole("heading", { name: "Quick Insights" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources & Evidence" })).toBeVisible();
});

test("game navigation active state follows pathname only", async ({ page }) => {
  const primaryNav = page.getByRole("navigation", { name: "Primary navigation" });
  const wowNav = primaryNav.getByRole("link", { name: "World of Warcraft" });
  const genshinNav = primaryNav.getByRole("link", { name: "Genshin Impact" });

  await page.goto("/");
  await expect(wowNav).not.toHaveAttribute("aria-current", "page");
  await expect(genshinNav).not.toHaveAttribute("aria-current", "page");

  await page.goto("/wow-forever/tier-list?mode=dungeon&role=dps&level=30");
  await expect(wowNav).toHaveAttribute("aria-current", "page");
  await expect(genshinNav).not.toHaveAttribute("aria-current", "page");

  await page.goto("/genshin-impact/tier-list?mode=spiral-abyss");
  await expect(wowNav).not.toHaveAttribute("aria-current", "page");
  await expect(genshinNav).toHaveAttribute("aria-current", "page");
});

test("Genshin tier-list route is public, clickable, and noindex until reviewed data exists", async ({
  page,
}) => {
  const target = routeRegistry.get("/genshin-impact/tier-list");
  expect(target.class).toBe("public_noindex");

  const response = await page.goto("/genshin-impact/tier-list");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Genshin Impact Tier List");
  await expect(page.getByText("No reviewed ranking data published yet")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
