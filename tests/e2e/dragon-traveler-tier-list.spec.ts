import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";
import AxeBuilder from "@axe-core/playwright";

const route = "/dragon-traveler/tier-list";

test.beforeEach(() => {
  test.skip(
    !routeRegistry.routes.some((entry) => entry.route === route),
    "The neutral product does not register the Dragon Traveler page",
  );
});

test("Dragon Traveler keeps the frozen architecture and server-specific taxonomy", async ({
  page,
}) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Dragon Traveler Tier List – Best Luminaries Ranked");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toBeVisible();
  await expect(page.locator("[data-dragon-traveler-page] > header")).toHaveCount(0);
  await expect(page.locator("[data-dragon-traveler-page] > footer")).toHaveCount(0);

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
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }

  const faction = page.getByRole("combobox", { name: "Faction" });
  const rarity = page.getByRole("combobox", { name: "Rarity" });
  await expect(faction.locator("option")).toContainText([
    "All Factions",
    "Sanctum Glory",
    "Illusion Veil",
  ]);
  await expect(rarity.locator("option")).toContainText(["All Rarities", "SSR Ex", "SSR+", "N"]);

  const pvpTab = page.getByRole("tab", { name: "PvP", exact: true }).first();
  await pvpTab.click();
  await expect(pvpTab).toHaveAttribute("aria-selected", "true");

  await page.getByRole("button", { name: "Artemis, S+ tier" }).click();
  await expect(page.getByRole("complementary", { name: "Character Detail" })).toContainText(
    "Artemis",
  );

  const taiwan = page.getByRole("button", { name: "Taiwan", exact: true });
  await taiwan.click();
  await expect(taiwan).toHaveAttribute("aria-pressed", "true");
  await expect(faction.locator("option")).toContainText(["聖堂榮光", "曠野之靈", "幻境秘影"]);
  await expect(rarity.locator("option")).toContainText([
    "傳說·神話",
    "傳說+",
    "傳說",
    "史詩",
    "菁英",
    "普通",
  ]);

  const mainText = await page.locator("main").innerText();
  expect(mainText).not.toContain("Eternal Frost");
  expect(mainText).not.toContain("Mythic");
  expect(mainText).not.toContain("Legendary");
  expect(mainText).not.toContain("Boss Tier List");
  expect(mainText).not.toContain("Arena Tier List");
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

test("Dragon Traveler retires the Taiwan banner at its exact server-time boundary", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-28T12:00:00+08:00") });
  await page.clock.pauseAt(new Date("2026-10-29T04:59:59+08:00"));
  await page.goto(route);
  const priority = page.locator("[data-current-pull-priority]");
  await expect(priority).toContainText("No verified current banner recommendation");
  await page.getByRole("button", { name: "Taiwan", exact: true }).click();
  await expect(priority).toContainText("Consider");
  await page.clock.fastForward(2000);
  await expect(priority).toContainText("No verified current banner recommendation");
  await expect(priority).not.toContainText("Consider");
});

test("Dragon Traveler has no serious accessibility violations", async ({ page }) => {
  await page.goto(route);
  const result = await new AxeBuilder({ page }).include("[data-dragon-traveler-page]").analyze();
  expect(result.violations).toEqual([]);
});
