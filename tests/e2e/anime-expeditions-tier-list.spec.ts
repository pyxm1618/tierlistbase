import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const route = "/anime-expeditions/tier-list";
test("shared shell, frozen three-system architecture and evidence-safe SEO", async ({ page }) => {
  await page.goto(route);
  await expect(page.locator("body > div > header")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  await expect(
    page.getByRole("navigation", { name: "Primary navigation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Footer navigation", exact: true }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveText("Anime Expeditions Tier List");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const nav = page.getByRole("navigation", { name: "Ranking systems" });
  for (const name of ["Units", "Traits", "Equipment"])
    await expect(nav.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  for (const id of [
    "traits",
    "equipment",
    "teams",
    "evolution",
    "changes",
    "sources",
    "methodology",
    "faq",
  ])
    await expect(page.locator(`#${id}`)).toBeAttached();
  expect(await page.locator("#traits").evaluate((e) => e.getBoundingClientRect().width)).toBe(
    await page.locator("#equipment").evaluate((e) => e.getBoundingClientRect().width),
  );
  await expect(page.locator("#changes")).toContainText("No verified prior comparison available");
});
test("five views change actual placements and support arrow-key tabs", async ({ page }) => {
  await page.goto(route);
  const card = page.locator('[data-unit-id="fallen-angel"]');
  await expect(card).toHaveAttribute("aria-label", /S\+ tier/);
  await page.getByRole("tab", { name: "DPS", exact: true }).click();
  await expect(card).toHaveAttribute("aria-label", /A tier/);
  for (const name of ["Overall", "DPS", "Utility", "Support", "Crowd Control"]) {
    const tab = page.getByRole("tab", { name, exact: true });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
  }
  await page.getByRole("tab", { name: "Overall", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "DPS", exact: true })).toBeFocused();
  await expect(page.getByRole("tab", { name: "DPS", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
test("all identity filters combine on a real unit, with honest mode context and empty state", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("searchbox", { name: "Search units" }).fill("Crimson Captain");
  for (const [label, value] of [
    ["Role", "DPS"],
    ["Element", "Flame"],
    ["Archetype", "Magical"],
    ["Rarity", "Secret"],
    ["Availability", "Needs Review"],
    ["Evolution", "Evolved"],
  ])
    await page.getByRole("combobox", { name: label!, exact: true }).selectOption(value!);
  await expect(page.locator('[data-unit-id="crimson-captain"]')).toBeVisible();
  await expect(page.locator("[data-unit-id]")).toHaveCount(1);
  await page.getByRole("combobox", { name: "Mode Context" }).selectOption("Raid");
  await expect(
    page.getByRole("status").filter({ hasText: "canonical tiers stay unchanged" }),
  ).toBeVisible();
  await page.getByRole("searchbox", { name: "Search units" }).fill("not-a-unit");
  await expect(page.getByRole("button", { name: "Reset filters" })).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator("[data-unit-id]")).toHaveCount(64);
});
test("unit selection updates identity, reasons, build, investment and team fit", async ({
  page,
}) => {
  await page.goto(route);
  await page.locator('[data-unit-id="cubert"]').click();
  const detail = page.getByRole("complementary", { name: "Unit Detail" });
  await expect(detail.getByRole("heading", { name: "Cubert", exact: true })).toBeVisible();
  for (const name of ["Why This Tier", "Best Build", "Investment", "Team Fit"])
    await expect(detail.getByRole("heading", { name, exact: true })).toBeAttached();
  await expect(detail).toContainText("Cube Link");
  await expect(detail.getByRole("link", { name: "View Team Comps" })).toHaveAttribute(
    "href",
    "#teams",
  );
});
test("traits, Standard-only equipment, compositions and all evolution groups use source records", async ({
  page,
}) => {
  await page.goto(route);
  await expect(page.locator("[data-trait-board]")).toContainText("Unbound");
  await expect(page.locator("[data-trait-board]")).toContainText("120%");
  const standard = page.locator("[data-standard-board]");
  await expect(standard).toContainText("Magic Book");
  await expect(standard).not.toContainText("Illusion Crow");
  await expect(page.getByRole("region", { name: "Best Equipment by Unit" })).toContainText(
    "Illusion Crow",
  );
  await expect(page.locator("#teams")).toContainText("Sovereign (Djinn)");
  await expect(page.locator("#teams")).toContainText("capacity is unconfirmed");
  for (const name of ["High Priority", "Worth Evolving", "Situational"])
    await expect(
      page.locator("#evolution").getByRole("heading", { name, exact: true }),
    ).toBeVisible();
});
for (const width of [390, 1440, 1920, 2560])
  test(`responsive ${width}px has no overflow or serious accessibility violations`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.waitForFunction(() =>
      Array.from(document.images)
        .filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
        })
        .every((image) => image.complete && image.naturalWidth > 0),
    );
    await page.screenshot({ path: test.info().outputPath(`anime-${width}-hero.png`) });
    for (const id of ["units", "traits", "equipment", "teams", "evolution", "faq"]) {
      await page
        .locator(`#${id}`)
        .evaluate((element) => element.scrollIntoView({ block: "start" }));
      await page.waitForFunction(() =>
        Array.from(document.images)
          .filter((image) => {
            const rect = image.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
          })
          .every((image) => image.complete && image.naturalWidth > 0),
      );
      await page.screenshot({ path: test.info().outputPath(`anime-${width}-${id}.png`) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual(
      [],
    );
  });
test("mobile native dialog traps focus, Escape closes and focus returns", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  const card = page.locator('[data-unit-id="crimson-captain"]');
  await card.click();
  const dialog = page.getByRole("dialog", { name: "Unit Detail" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close Unit Detail" })).toBeFocused();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual(
    [],
  );
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(card).toBeFocused();
  await card.click();
  await dialog.getByRole("button", { name: "Close Unit Detail" }).click();
  await expect(card).toBeFocused();
});

test("Quick Picks use the chosen view and the mobile team link dismisses detail", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await page.getByRole("button", { name: /^Best DPS/ }).click();
  const dialog = page.getByRole("dialog", { name: "Unit Detail" });
  await expect(dialog.getByRole("heading", { name: "Devil (Hero)", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "DPS", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(dialog.locator("[data-tier]").first()).toHaveText("S+");
  await dialog.getByRole("link", { name: "View Team Comps" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/#teams$/);
  await expect(
    page.getByRole("heading", { name: "Best Anime Expeditions Team Comps", exact: true }),
  ).toBeInViewport();
});
