import { expect, test } from "@playwright/test";

const route = "/dragon-traveler/tier-list";

test("Dragon Traveler preserves noindex and the existing shared marketing shell", async ({
  page,
}) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Dragon Traveler Tier List – Best Luminaries Ranked");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /Global and Taiwan/,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);

  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toBeVisible();
  await expect(page.locator("body > div > header")).toHaveCount(1);
  await expect(page.locator("body > div > footer")).toHaveCount(1);
  await expect(page.locator("[data-dragon-traveler-page] > header")).toHaveCount(0);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dragon Traveler Tier List");
  for (const heading of [
    "Quick Picks",
    "Luminary Tier List",
    "Best Teams",
    "Account Decisions",
    "What Changed",
    "Methodology & Sources",
    "FAQ",
  ]) {
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("complementary", { name: "Character Detail" })).toBeVisible();
});

test("Dragon Traveler server context swaps taxonomy instead of sharing fake faction or rarity keys", async ({
  page,
}) => {
  await page.goto(route);

  const rarity = page.getByRole("combobox", { name: "Rarity" });
  const faction = page.getByRole("combobox", { name: "Faction" });

  for (const label of ["SSR Ex", "SSR+", "SSR", "SR", "R", "N"]) {
    await expect(rarity).toContainText(label);
  }
  await expect(faction).toContainText("Sanctum Glory");
  await expect(faction).toContainText("Otherworld Return");

  await page.getByRole("tab", { name: "Taiwan", exact: true }).click();
  for (const label of ["傳說‧神話", "傳說+", "傳說", "史詩", "菁英", "普通"]) {
    await expect(rarity).toContainText(label);
  }
  await expect(rarity).not.toContainText("SSR Ex");
  await expect(faction).toContainText("Sanctum Glory · 聖堂榮光");
  await expect(faction).toContainText("Otherworld Return · 彼岸再臨");
});

test("Dragon Traveler ranking views, filters and detail panel remain functional", async ({
  page,
}) => {
  await page.goto(route);

  const search = page.getByRole("searchbox", { name: "Search Luminaries" });
  await search.fill("Arachne");
  await expect(page.getByRole("button", { name: /Arachne, S tier/ })).toBeVisible();

  await page.getByRole("button", { name: /Arachne, S tier/ }).click();
  const detail = page.getByRole("complementary", { name: "Character Detail" });
  await expect(detail).toContainText("Arachne");
  await expect(detail).toContainText("Illusion Veil");

  await page.getByRole("tab", { name: "PvP", exact: true }).first().click();
  await expect(page.getByRole("button", { name: /Arachne, S tier/ })).toBeVisible();

  await search.fill("");
  await page.getByRole("combobox", { name: "Class" }).selectOption("Priest");
  await expect(page.getByRole("button", { name: /Hela, S\+ tier/ })).toBeVisible();

  const teamTabs = page.getByRole("tablist", { name: "Best Teams modes" });
  await teamTabs.getByRole("tab", { name: "PvP", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Mythic control pressure" })).toBeVisible();
});

for (const width of [390, 1440]) {
  test(`Dragon Traveler remains within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
