import { expect, test } from "@playwright/test";

import { routeRegistry } from "../../src/config/routes.config";

const route = "/limbus-company/tier-list";
const limbusRouteDefinition = routeRegistry.get(route);
if (limbusRouteDefinition.class !== "public_indexable") {
  throw new Error("Limbus route must be indexable");
}

const expectedTeamArtwork = [
  ["Sinking Team", "status-sinking"],
  ["Bleed Team", "status-bleed"],
  ["Burn Team", "status-burn"],
  ["Tremor Team", "status-tremor"],
  ["Rupture Team", "status-rupture"],
  ["Poise Team", "status-poise"],
  ["Charge Team", "status-charge"],
  ["Heishou Team", "heishou-pack-mao-branch-ryoshu"],
  ["The Middle Team", "the-middle-little-brother-meursault"],
  ["Dieci Discard Team", "dieci-assoc-south-section-4-rodion"],
  ["Envy Resonance Team", "mechanic-envy-resonance"],
  ["House of Spiders Hybrid Team", "blade-of-the-house-of-spiders-ryoshu"],
] as const;

const limbusKeywordGroup = [
  "limbus company tier list",
  "limbus tier list",
  "limbus company ego tier list",
  "ego tier list limbus",
] as const;

const limbusVisibleCopySelectors = [
  'section[aria-labelledby="limbus-title"] h1',
  'section[aria-labelledby="limbus-title"] p:not([aria-hidden="true"])',
  "#identity-tier-list > header h2",
  "#identity-tier-list > header p",
  "#best-identity-by-sinner > header h2",
  "#best-identity-by-sinner > header p",
  "#team-tier-list > header h2",
  "#team-tier-list > header p",
  "#ego-tier-list > header h2",
  "#ego-tier-list > header p",
  "#best-ego-by-sinner h2",
  'section[aria-labelledby="next-step-title"] h2',
  'section[aria-labelledby="next-step-title"] h3',
  'section[aria-labelledby="next-step-title"] p:not([aria-hidden="true"])',
] as const;

function tokenize(value: string): string[] {
  return value.toLocaleLowerCase("en-US").match(/[\p{L}\p{N}]+/gu) ?? [];
}

function countPhrase(words: readonly string[], phrase: string): number {
  const wanted = tokenize(phrase);
  if (wanted.length === 0 || wanted.length > words.length) return 0;
  let count = 0;
  for (let index = 0; index <= words.length - wanted.length; index += 1) {
    if (wanted.every((word, offset) => words[index + offset] === word)) count += 1;
  }
  return count;
}

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
      await expect(teamDetail.getByRole("heading", { level: 3 })).toHaveText("Bleed Team");
      await expect(teamDetail).toContainText("TEAM DETAILS");
      await expect(teamDetail).not.toContainText("TEAM DETAILS (EXAMPLE)");
      await expect(teamDetail).not.toContainText("Core A");
      await expect(teamDetail).not.toContainText("Member A");

      // Verify all 12 teams have selectable buttons
      const teamSelectButtons = page.locator("#team-tier-list tbody tr button");
      await expect(teamSelectButtons).toHaveCount(12);

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

    test("supports selecting all 12 teams and dynamically switches details and 4 tab panels", async ({
      page,
    }) => {
      await page.goto(route);
      const teamDetail = page.locator("#team-details");
      const teamTable = page.locator("#team-tier-list tbody tr");

      await expect(teamTable).toHaveCount(12);
      const selectButtons = teamTable.locator("button");
      await expect(selectButtons).toHaveCount(12);

      // 默认选中 Bleed Team
      await expect(teamDetail.getByRole("heading", { level: 3 })).toHaveText("Bleed Team");
      await expect(teamDetail).toContainText("TEAM DETAILS");
      await expect(teamDetail).not.toContainText("TEAM DETAILS (EXAMPLE)");

      // 4 个 Tabs 控件
      const overviewTab = page.getByRole("tab", { name: "Overview" });
      const coreTeamTab = page.getByRole("tab", { name: "Core & Team" });
      const egoTab = page.getByRole("tab", { name: "Key E.G.O" });
      const nextTab = page.getByRole("tab", { name: "What to Get Next" });

      const overviewPanel = page.locator("#team-detail-panel-0");
      const coreTeamPanel = page.locator("#team-detail-panel-1");
      const egoPanel = page.locator("#team-detail-panel-2");
      const nextPanel = page.locator("#team-detail-panel-3");

      // 1. Overview 默认显示
      await expect(overviewPanel).toBeVisible();
      await expect(coreTeamPanel).toBeHidden();
      await expect(egoPanel).toBeHidden();
      await expect(nextPanel).toBeHidden();
      await expect(overviewPanel).toContainText("Power Tier");
      await expect(overviewPanel).toContainText("Build Cost");

      // 2. Core & Team 切换
      await coreTeamTab.click();
      await expect(overviewPanel).toBeHidden();
      await expect(coreTeamPanel).toBeVisible();
      await expect(egoPanel).toBeHidden();
      await expect(nextPanel).toBeHidden();
      await expect(coreTeamPanel).toContainText("Core Members");
      await expect(coreTeamPanel).toContainText("Recommended Team");
      await expect(coreTeamPanel).toContainText("Substitutes / Alternatives");
      await expect(coreTeamPanel.locator("img")).toHaveCount(12);

      // 3. Key E.G.O 切换
      await egoTab.click();
      await expect(overviewPanel).toBeHidden();
      await expect(coreTeamPanel).toBeHidden();
      await expect(egoPanel).toBeVisible();
      await expect(nextPanel).toBeHidden();
      await expect(egoPanel).toContainText("Key E.G.O");
      await expect(egoPanel.locator("img")).toHaveCount(4);

      // 4. What to Get Next 切换
      await nextTab.click();
      await expect(overviewPanel).toBeHidden();
      await expect(coreTeamPanel).toBeHidden();
      await expect(egoPanel).toBeHidden();
      await expect(nextPanel).toBeVisible();
      await expect(nextPanel).toContainText("Missing One / What to Get Next");
      const bleedNextText = await nextPanel.innerText();

      // 切换另外 3 个队伍：Sinking Team, Burn Team, Tremor Team
      const targetTeams = [
        { name: "Sinking Team", expectedIdentities: 12, expectedEgo: 4 },
        { name: "Burn Team", expectedIdentities: 11, expectedEgo: 4 },
        { name: "Tremor Team", expectedIdentities: 11, expectedEgo: 3 },
      ];

      for (const target of targetTeams) {
        const teamBtn = teamTable.locator("button").filter({ hasText: target.name });
        await teamBtn.click();
        await expect(teamBtn).toHaveAttribute("aria-pressed", "true");
        await expect(teamDetail.getByRole("heading", { level: 3 })).toHaveText(target.name);

        // 验证 What to Get Next 内容随队伍切换而改变
        await nextTab.click();
        await expect(nextPanel).toBeVisible();
        const nextContent = await nextPanel.innerText();
        expect(nextContent).not.toEqual(bleedNextText);

        // 验证 Core & Team 角色图片渲染
        await coreTeamTab.click();
        await expect(coreTeamPanel).toBeVisible();
        await expect(coreTeamPanel.locator("img")).toHaveCount(target.expectedIdentities);

        // 验证 Key E.G.O 存在
        await egoTab.click();
        await expect(egoPanel).toBeVisible();
        await expect(egoPanel.locator("img")).toHaveCount(target.expectedEgo);

        // 验证 Overview 指标切换
        await overviewTab.click();
        await expect(overviewPanel).toBeVisible();
      }
    });

    test(
      "renders local Identity, E.G.O, and Team artwork without broken or hotlinked images",
      async ({ page }) => {
        await page.goto(route);

        // 名称列（第 3 列）全部替换为本地素材
        const identityArt = page.locator("#identity-tier-list tbody tr td:nth-child(3) img");
        const egoArt = page.locator("#ego-tier-list tbody tr td:nth-child(3) img");
        const teamArt = page.locator("#team-tier-list tbody tr td:nth-child(3) img");
        await expect(identityArt).toHaveCount(190);
        await expect(egoArt).toHaveCount(116);
        await expect(teamArt).toHaveCount(12);

        // Team Details 图片验证（切换 Tab 确认无破图）
        await expect(page.locator("#team-details img")).toHaveCount(1); // Overview banner
        await page.getByRole("tab", { name: "Core & Team" }).click();
        await expect(page.locator("#team-details img")).toHaveCount(13); // banner + 12 identities
        await page.getByRole("tab", { name: "Key E.G.O" }).click();
        await expect(page.locator("#team-details img")).toHaveCount(5); // banner + 4 ego

        // Team Tier List 的 12 个 ICON placeholder 全部由 PR #98 的固定映射替换。
        await expect(page.locator('[aria-label="Artwork asset required"]')).toHaveCount(0);
        await expect(page.getByText("ART", { exact: true })).toHaveCount(0);
        await expect(page.getByText("EGO", { exact: true })).toHaveCount(0);
        await expect(page.getByText("ICON", { exact: true })).toHaveCount(0);

        for (const [team, assetStem] of expectedTeamArtwork) {
          const row = page.locator("#team-tier-list tbody tr").filter({ hasText: team });
          await expect(row).toHaveCount(1);
          const src = await row.locator("td:nth-child(3) img").getAttribute("src");
          expect(decodeURIComponent(src ?? "")).toContain(assetStem);
        }

        // Identity / E.G.O / Team artwork 均为同源交付，无外链 hotlink。
        const srcs = await page
          .locator(
            "#identity-tier-list tbody tr td:nth-child(3) img, #ego-tier-list tbody tr td:nth-child(3) img, #team-tier-list tbody tr td:nth-child(3) img",
          )
          .evaluateAll((images) =>
            images.map((image) => (image as HTMLImageElement).getAttribute("src") ?? ""),
          );
        expect(srcs).toHaveLength(318);
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
      },
    );
  });
}

test("serves final Limbus SEO copy while respecting the test-environment noindex policy", async ({
  page,
  request,
}) => {
  const response = await page.goto(route);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(limbusRouteDefinition.title);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(limbusRouteDefinition.h1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    limbusRouteDefinition.description,
  );

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, nofollow/i,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  const canonical = `${routeRegistry.site.canonicalOrigin}${route}`;
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain(canonical);
  expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
});

test("keeps the visible Limbus keyword group within the approved SEO range", async ({ page }) => {
  await page.goto(route);
  const visibleCopy: string[] = [];
  for (const selector of limbusVisibleCopySelectors) {
    const texts = await page.locator(selector).allInnerTexts();
    visibleCopy.push(...texts.map((text) => text.trim()).filter(Boolean));
  }

  const words = tokenize(visibleCopy.join(" "));
  const phraseStats = limbusKeywordGroup.map((phrase) => {
    const occurrences = countPhrase(words, phrase);
    return {
      phrase,
      occurrences,
      densityPct: Number(((occurrences / Math.max(words.length, 1)) * 100).toFixed(3)),
    };
  });
  const combinedOccurrences = phraseStats.reduce((sum, phrase) => sum + phrase.occurrences, 0);
  const combinedDensityPct = Number(
    ((combinedOccurrences / Math.max(words.length, 1)) * 100).toFixed(3),
  );

  console.log(
    JSON.stringify({
      event: "limbus_keyword_group_audit",
      visibleMainContentWords: words.length,
      phraseStats,
      combinedOccurrences,
      combinedDensityPct,
    }),
  );

  expect(combinedDensityPct).toBeGreaterThanOrEqual(3);
  expect(combinedDensityPct).toBeLessThanOrEqual(5);
  expect(phraseStats[0]!.occurrences).toBeGreaterThan(phraseStats[1]!.occurrences);
  expect(phraseStats[1]!.occurrences).toBeGreaterThan(phraseStats[2]!.occurrences);
  expect(phraseStats[1]!.occurrences).toBeGreaterThan(phraseStats[3]!.occurrences);
});

test("keeps shared navigation on public game pages and hides remaining preview routes from header", async ({
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
    for (const previewRoute of ["/nikke/tier-list", "/zenless-zone-zero/tier-list"]) {
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
