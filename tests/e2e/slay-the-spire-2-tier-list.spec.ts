import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const route = "/slay-the-spire-2/tier-list";

test("Slay the Spire 2 uses the shared shell, real snapshot and complete ranking systems", async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Slay the Spire 2 Tier List");
  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toHaveCount(1);
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toHaveCount(1);
  await expect(page.locator('main nav[aria-label="Primary navigation"]')).toHaveCount(0);
  await expect(page.locator("main footer")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("v0.107.1");
  await expect(page.locator("main")).toContainText("v0.111.0");
  await expect(page.locator("main")).toContainText("Tier does not mean automatic pick");

  const tabs = page.getByRole("tablist", { name: "Slay the Spire 2 ranking systems" });
  for (const name of ["Cards", "Relics", "Characters", "Potions"])
    await expect(tabs.getByRole("tab", { name: new RegExp(`^${name}`) })).toBeVisible();

  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(structuredData.length).toBeGreaterThanOrEqual(2);
  for (const value of structuredData) expect(() => JSON.parse(value)).not.toThrow();
  await expect(page.locator('[data-ia-section="faq"] details')).toHaveCount(6);
});

test("card pool tabs, search, filters, sort and selection stay synchronized", async ({ page }) => {
  await page.goto(route);

  const poolTabs = page.getByRole("tablist", { name: "Slay the Spire 2 card pools" });
  await expect(poolTabs.getByRole("tab", { name: /^Ironclad/ })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("searchbox", { name: "Search cards" }).fill("Offering");
  await expect(page.locator('[data-card-id="offering"]')).toHaveCount(1);
  await page.locator('[data-card-id="offering"]').click();
  await expect(page.getByRole("complementary", { name: "Card Detail" })).toContainText("Offering");
  await expect(page.getByRole("complementary", { name: "Card Detail" })).toContainText("Lose 6 HP");
  await expect(page.getByRole("complementary", { name: "Card Detail" })).not.toContainText("28.4%");

  await page.getByRole("searchbox", { name: "Search cards" }).fill("");
  await page.getByRole("combobox", { name: "Type" }).selectOption("Skill");
  await page.getByRole("combobox", { name: "Rarity" }).selectOption("Rare");
  await expect(page.locator('[data-card-id="offering"]')).toBeVisible();
  await page.getByRole("combobox", { name: "Sort" }).selectOption("name");

  await poolTabs.getByRole("tab", { name: /^Colorless/ }).click();
  await expect(page.locator('[data-tier-row="Needs Review"]')).toBeVisible();
  await expect(page.locator('[data-card-id="alchemize"]')).toHaveAttribute("data-tier", "Needs Review");

  await poolTabs.getByRole("tab", { name: /^Ironclad/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(poolTabs.getByRole("tab", { name: /^Silent/ })).toBeFocused();
  await expect(poolTabs.getByRole("tab", { name: /^Silent/ })).toHaveAttribute("aria-selected", "true");
});

test("secondary ranking systems use source-native labels and real current objects", async ({ page }) => {
  await page.goto(route);
  const tabs = page.getByRole("tablist", { name: "Slay the Spire 2 ranking systems" });

  await tabs.getByRole("tab", { name: /^Relics/ }).click();
  await expect(page.locator('[data-relic-tier="S"]')).toContainText("Lantern");
  await expect(page.locator('[data-relic-tier="G"]')).toContainText("Burning Blood");
  await expect(page.locator('[data-relic-tier="Needs Review"]')).toContainText("Big Mushroom");

  await tabs.getByRole("tab", { name: /^Characters/ }).click();
  await expect(page.locator('[data-character-id="silent"]')).toContainText("The Silent");
  await expect(page.locator('[data-character-id="defect"]')).toContainText("Last");

  await tabs.getByRole("tab", { name: /^Potions/ }).click();
  await expect(page.locator('[data-potion-tier="S"]')).toContainText("Vulnerable Potion");
  await expect(page.locator('[data-potion-tier="F"]')).toContainText("Glowwater Potion");
});

for (const width of [390, 768, 1440, 1920]) {
  test(`Slay the Spire 2 remains within the viewport at ${width}px and has no serious accessibility violations`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(
      axe.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      ),
    ).toEqual([]);
  });
}

test("visible copy covers the single Slay the Spire 2 tier-list keyword family without fake statistics", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route);
  const text = (await page.locator("main").innerText()).toLowerCase();
  for (const phrase of [
    "slay the spire 2 tier list",
    "slay the spire 2 card tier list",
    "slay the spire 2 cards tier list",
    "slay the spire 2 relic tier list",
    "slay the spire 2 character tier list",
  ]) expect(text).toContain(phrase);
  expect(text).not.toContain("28.4% pick rate");
  expect(text).not.toContain("24,831 runs");
});
