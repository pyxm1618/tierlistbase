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

    test("renders full master dataset and filters every dimension using live values", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(route);
      const rows = page.locator("#identity-tier-list tbody tr");
      const filters = page.getByLabel("Identity filters", { exact: true });
      const search = page.getByRole("searchbox", { name: "Search Identity" });
      await expect(rows).toHaveCount(190);

      // Verify other dataset sections
      const teamRows = page.locator("#team-tier-list tbody tr");
      await expect(teamRows).toHaveCount(12);

      const egoRows = page.locator("#ego-tier-list tbody tr");
      await expect(egoRows).toHaveCount(116);

      const sinnerIdentityCards = page.locator("#best-identity-by-sinner article");
      await expect(sinnerIdentityCards).toHaveCount(12);

      const egoColumns = page.locator("#best-ego-by-sinner article");
      await expect(egoColumns).toHaveCount(12);

      // Verify featured team details has no placeholder text
      const teamDetail = page.locator("#team-details");
      await expect(teamDetail).toContainText("Bleed Team");
      await expect(teamDetail).not.toContainText("Core A");
      await expect(teamDetail).not.toContainText("Member A");

      const cases = [
        ["Sinner", "Yi Sang", 16, "Effloresced E.G.O::Spicebush Yi Sang"],
        ["Rarity", "000", 127, "Effloresced E.G.O::Spicebush Yi Sang"],
        ["Role", "Support", 16, "The One Who Grips Faust"],
        ["Team / Archetype", "Tremor", 9, "T Corp. Class 3 Collection Staff Don Quixote"],
        ["Damage Type", "Pierce", 47, "The Ring Pointillist Student Yi Sang"],
        ["Sin Affinity", "Envy", 80, "Heishou Pack - Wu Branch Adept Yi Sang"],
        ["Generalist Value", "B", 87, "The Pequod First Mate Yi Sang"],
        ["Beginner Friendly", "A", 18, "The One Who Grips Faust"],
        ["Team Dependency", "Low", 38, "The Ring Pointillist Student Yi Sang"],
        ["Availability", "Shardable", 25, "Heishou Pack - Wu Branch Adept Yi Sang"],
      ] as const;

      for (const [dimension, value, count, identity] of cases) {
        await filters.getByRole("button", { name: dimension, exact: true }).click();
        const values = filters.getByRole("combobox", { name: `${dimension} value`, exact: true });
        await values.selectOption(value);
        await expect(rows).toHaveCount(count);
        await expect(rows.first()).toContainText(identity);
      }

      await search.fill("Wu Branch");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("Heishou Pack - Wu Branch Adept Yi Sang");

      await search.fill("Manager of La Manchaland");
      await expect(
        page.getByText("No Identity rows match this search.", { exact: true }),
      ).toBeVisible();

      await filters.getByRole("button", { name: "All Identities", exact: true }).click();
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("The Manager of La Manchaland Don Quixote");

      await search.fill("");
      await expect(rows).toHaveCount(190);

      await filters.getByRole("button", { name: "Sinner", exact: true }).click();
      const sinners = filters.getByRole("combobox", { name: "Sinner value", exact: true });
      await expect(sinners.locator("option")).toHaveText([
        "All values",
        "Yi Sang",
        "Faust",
        "Don Quixote",
        "Ryōshū",
        "Meursault",
        "Hong Lu",
        "Heathcliff",
        "Ishmael",
        "Rodion",
        "Sinclair",
        "Outis",
        "Gregor",
      ]);
      await sinners.selectOption("Hong Lu");
      await expect(rows).toHaveCount(16);
      await sinners.selectOption("");
      await expect(rows).toHaveCount(190);
      expect(errors).toEqual([]);
    });

    test("renders local Identity and E.G.O artwork without broken or hotlinked images", async ({
      page,
    }) => {
      await page.goto(route);

      // 名称列（第 3 列）全部替换为本地素材
      const identityArt = page.locator("#identity-tier-list tbody tr td:nth-child(3) img");
      const egoArt = page.locator("#ego-tier-list tbody tr td:nth-child(3) img");
      await expect(identityArt).toHaveCount(190);
      await expect(egoArt).toHaveCount(116);

      // Team Details：1 张 banner + core 3 + recommended 6 + keyEgo 4 + substitutes 3
      await expect(page.locator("#team-details img")).toHaveCount(17);

      // 占位符只剩 Team Tier List 的 12 个 ICON
      await expect(page.locator('[aria-label="Artwork asset required"]')).toHaveCount(12);
      await expect(page.getByText("ART", { exact: true })).toHaveCount(0);
      await expect(page.getByText("EGO", { exact: true })).toHaveCount(0);
      await expect(page.getByText("ICON", { exact: true })).toHaveCount(12);

      // 同源交付，无外链 hotlink
      const srcs = await identityArt.evaluateAll((images) =>
        images.map((image) => (image as HTMLImageElement).getAttribute("src") ?? ""),
      );
      expect(srcs).toHaveLength(190);
      for (const src of srcs) {
        expect(src.startsWith("/_next/image?url=")).toBe(true);
        expect(src).not.toMatch(/^https?:\/\//);
      }

      // 首行图片必须真正解码成功
      await expect
        .poll(() =>
          page
            .locator("#identity-tier-list tbody tr")
            .first()
            .locator("td")
            .nth(2)
            .locator("img")
            .evaluate((image) => (image as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);

      // 向下滚动触发懒加载后，不得存在 load 失败（complete 但 naturalWidth=0）的图片
      for (let step = 0; step < 8; step += 1) {
        await page.mouse.wheel(0, 1200);
        await page.waitForTimeout(80);
      }
      await expect
        .poll(() =>
          page.locator("img").evaluateAll(
            (images) =>
              images.filter((image) => {
                const element = image as HTMLImageElement;
                return element.complete && element.naturalWidth === 0;
              }).length,
          ),
        )
        .toBe(0);
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

test("keeps shared navigation on public game pages and hides unfinished preview routes from header", async ({
  page,
}) => {
  const labels = ["World of Warcraft", "Genshin Impact"];
  const registeredGameRoutes = ["/wow-forever/tier-list", "/genshin-impact/tier-list"].filter(
    (path) => routeRegistry.routes.some((entry) => entry.route === path),
  );
  // The clean-setup template deliberately exposes a smaller registered route inventory.
  for (const path of registeredGameRoutes) {
    await page.goto(path);
    const nav = page.locator('header nav[aria-label="Primary navigation"]');
    await expect(nav.getByRole("link")).toHaveText(labels);
    const mobileNav = page.locator('header nav[aria-label="Mobile navigation"]');
    for (const previewRoute of [
      "/nikke/tier-list",
      "/zenless-zone-zero/tier-list",
      "/limbus-company/tier-list",
    ]) {
      await expect(mobileNav.locator(`a[href="${previewRoute}"]`)).toHaveCount(0);
    }
  }
  await page.goto(route);
  await expect(page).toHaveURL(new RegExp(`${route}$`));
  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toContainText("Games");
  await page
    .locator('header nav[aria-label="Primary navigation"]')
    .getByRole("link", { name: "Games", exact: true })
    .click();
  await expect(
    page.locator('header nav[aria-label="Primary navigation"]').getByRole("link"),
  ).toHaveText(labels);
});
