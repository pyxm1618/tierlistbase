import { expect, test } from "@playwright/test";

import { routeRegistry } from "../../src/config/routes.config";

const route = "/limbus-company/tier-list";

for (const width of [390, 1440]) {
  test.describe(`Limbus closeout at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("uses the Limbus header without overflowing or duplicating site chrome", async ({
      page,
    }) => {
      await page.goto(route);
      const header = page.locator("body > div > header");
      await expect(header).toHaveCount(1);
      await expect(header.getByRole("link", { name: "TierListBase home" })).toBeVisible();
      const nav = header.getByRole("navigation", { name: "Primary navigation", exact: true });
      await expect(nav).toBeVisible();
      const headerBox = await header.boundingBox();
      const navBox = await nav.boundingBox();
      expect(navBox!.y + navBox!.height).toBeLessThanOrEqual(headerBox!.y + headerBox!.height);

      for (const label of ["Games", "Tier Lists", "Guides", "Tools"]) {
        await expect(nav.getByText(label, { exact: true })).toBeVisible();
      }
      await expect(header.getByRole("button", { name: "Search", exact: true })).toBeVisible();
      await expect(header.getByText("EN", { exact: true })).toBeVisible();
      await expect(header.getByRole("button", { name: "Theme", exact: true })).toBeVisible();
      await expect(header.getByText("World of Warcraft", { exact: true })).toHaveCount(0);
      expect(await header.evaluate((element) => element.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });

    test("filters every dimension using current values and combines search with the selection", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(route);
      const rows = page.locator("#identity-tier-list tbody tr");
      const filters = page.getByLabel("Identity filters", { exact: true });
      const search = page.getByRole("searchbox", { name: "Search Identity" });
      await expect(rows).toHaveCount(5);
      const cases = [
        ["Sinner", "Yi Sang", 1, "W Corp. L3 Cleanup"],
        ["Rarity", "000", 5, "The Priestess of La Manchaland"],
        ["Role", "Support", 1, "Dieci Assoc. South Section 4"],
        ["Team / Archetype", "Tremor", 1, "T Corp. Class 3"],
        ["Damage Type", "Pierce", 1, "W Corp. L3 Cleanup"],
        ["Sin Affinity", "Envy", 1, "N Corp. Großhammer"],
        ["Generalist Value", "B", 1, "Dieci Assoc. South Section 4"],
        ["Beginner Friendly", "C", 1, "W Corp. L3 Cleanup"],
        ["Team Dependency", "Low", 1, "Dieci Assoc. South Section 4"],
        ["Availability", "Shardable", 1, "T Corp. Class 3"],
      ] as const;
      for (const [dimension, value, count, identity] of cases) {
        await filters.getByRole("button", { name: dimension, exact: true }).click();
        const values = filters.getByRole("combobox", { name: `${dimension} value`, exact: true });
        await values.selectOption(value);
        await expect(rows).toHaveCount(count);
        await expect(rows.first()).toContainText(identity);
      }
      await search.fill("Class 3");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("T Corp. Class 3");
      await search.fill("Priestess");
      await expect(
        page.getByText("No mock Identity rows match this search.", { exact: true }),
      ).toBeVisible();
      await filters.getByRole("button", { name: "All Identities", exact: true }).click();
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("The Priestess of La Manchaland");
      await search.fill("");
      await expect(rows).toHaveCount(5);
      await filters.getByRole("button", { name: "Sinner", exact: true }).click();
      const sinners = filters.getByRole("combobox", { name: "Sinner value", exact: true });
      await expect(sinners.locator("option")).toHaveText([
        "All values",
        "Don Quixote",
        "Yi Sang",
        "Hong Lu",
        "Ryōshū",
        "Heathcliff",
      ]);
      await sinners.selectOption("Hong Lu");
      await expect(rows).toHaveCount(1);
      await sinners.selectOption("");
      await expect(rows).toHaveCount(5);
      expect(errors).toEqual([]);
    });
  });
}

test("serves registered noindex metadata without canonical or a sitemap entry", async ({
  page,
  request,
}) => {
  await page.goto(route);
  await expect(page).toHaveTitle("Limbus Company Tier List Preview | TierListBase");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /Preview the TierListBase Limbus Company/,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain(route);
});

test("keeps shared navigation on registered game pages and after client navigation", async ({
  page,
}) => {
  const labels = [
    "World of Warcraft",
    "Genshin Impact",
    "NIKKE",
    "Zenless Zone Zero",
    "Limbus Company",
  ];
  const registeredGameRoutes = [
    "/wow-forever/tier-list",
    "/genshin-impact/tier-list",
    "/nikke/tier-list",
    "/zenless-zone-zero/tier-list",
  ].filter((path) => routeRegistry.routes.some((entry) => entry.route === path));
  // The clean-setup template deliberately exposes a smaller registered route inventory.
  for (const path of registeredGameRoutes) {
    await page.goto(path);
    const nav = page.locator('header nav[aria-label="Primary navigation"]');
    await expect(nav.getByRole("link")).toHaveText(labels);
  }
  await page
    .locator('header nav[aria-label="Primary navigation"]')
    .getByRole("link", { name: "Limbus Company", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`${route}$`));
  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toContainText("Games");
  await page.goBack();
  await expect(
    page.locator('header nav[aria-label="Primary navigation"]').getByRole("link"),
  ).toHaveText(labels);
});
