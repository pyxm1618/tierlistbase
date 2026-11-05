import { expect, test } from "@playwright/test";
import { routeRegistry } from "@/config/routes.config";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(() => {
  test.skip(
    !routeRegistry.routes.some((entry) => entry.route === "/dragon-traveler/tier-list"),
    "The neutral product does not register the Dragon Traveler page",
  );
});
const route = "/dragon-traveler/tier-list";
const path = "/dragon-traveler/tier-list";

const dragonKeywordGroup = [
  "dragon traveler tier list",
  "dragon traveler pve tier list",
  "dragon traveler pvp tier list",
  "dragon traveler tier list taiwan",
  "dragon traveler taiwan tier list",
] as const;

function tokenize(value: string): string[] {
  return value.toLocaleLowerCase("en-US").match(/[\p{L}\p{N}]+/gu) ?? [];
}

function countPhrase(words: readonly string[], phrase: string): number {
  const wanted = tokenize(phrase);
  let count = 0;
  for (let index = 0; index <= words.length - wanted.length; index += 1) {
    if (wanted.every((word, offset) => words[index + offset] === word)) count += 1;
  }
  return count;
}
test("Dragon Traveler server contexts, filters and decisions", async ({ page }) => {
  await page.goto(path);
  await expect(
    page.getByRole("heading", { name: "Dragon Traveler Tier List", exact: true }),
  ).toHaveCount(1);
  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toBeVisible();
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  const server = page.getByRole("group", { name: "Server context" });
  await expect(server.getByRole("button", { name: "Global", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const modes = page.getByRole("tablist", { name: "Luminary ranking views" });
  await expect(modes.getByRole("tab", { name: "Overall", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("searchbox", { name: "Search Luminaries" }).fill("Athena");
  await expect(page.getByTestId("luminary-card")).toHaveCount(1);
  await modes.getByRole("tab", { name: "PvP", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("Athena");
  await page.getByLabel("Class", { exact: true }).selectOption("Mage");
  await expect(page.getByTestId("luminary-card")).toHaveCount(0);
  await page.getByLabel("Class", { exact: true }).selectOption("Guardian");
  await page.getByLabel("Faction", { exact: true }).selectOption("Sanctum Glory");
  await page.getByLabel("Rarity", { exact: true }).selectOption("SSR EX");
  await expect(page.getByTestId("luminary-card")).toHaveCount(1);
  await page.getByTestId("luminary-card").click();
  await expect(
    page.getByTestId("character-detail").getByRole("heading", { name: "Athena", exact: true }),
  ).toBeVisible();
  await server.getByRole("button", { name: "Taiwan", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("Athena");
  await expect(page.getByTestId("luminary-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByTestId("luminary-card")).toHaveCount(95);
  await page.getByRole("searchbox").fill("Zeus");
  await expect(page.getByTestId("luminary-card")).toHaveCount(1);
  await server.getByRole("button", { name: "Global", exact: true }).click();
  await expect(page.getByTestId("luminary-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByTestId("luminary-card")).toHaveCount(73);
  const teams = page.getByRole("tablist", { name: "Team ranking views" });
  await teams.getByRole("tab", { name: "PvP", exact: true }).click();
  await expect(page.getByTestId("featured-team")).toContainText("Arcane opening pressure");
  await expect(page.getByTestId("featured-team")).toContainText("Frontline");
  await expect(page.getByTestId("formation-cell")).toHaveCount(9);
  await page.getByRole("button", { name: /#2 Arcane protected carry/ }).click();
  await expect(page.getByTestId("featured-team")).toContainText("Arcane protected carry");
  await expect(page.locator('[data-position="Midline"][data-slot="Right"]')).toContainText(
    "Vivian",
  );
  await page
    .getByRole("tablist", { name: "Wishlist context" })
    .getByRole("tab", { name: "PvP", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Current Pull Priority" })).toBeVisible();

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
test("Dragon Traveler keyboard selection and responsive layout", async ({ page }) => {
  await page.goto(path);
  const card = page.getByRole("button", { name: "Select Venus", exact: true });
  await expect(
    page.getByTestId("character-detail").getByRole("heading", { name: "Poseidon", exact: true }),
  ).toBeVisible();
  await card.focus();
  await page.keyboard.press("Enter");
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByTestId("character-detail").getByRole("heading", { name: "Venus", exact: true }),
  ).toBeVisible();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.getByTestId("character-detail")).toBeVisible();
    const distortedPortraits = await page
      .locator('main img[class*="_portrait"]')
      .evaluateAll((images) =>
        images
          .filter((image) => {
            const bounds = image.getBoundingClientRect();
            return Math.abs(bounds.width - bounds.height) > 0.5;
          })
          .map((image) => image.getAttribute("src")),
      );
    expect(distortedPortraits).toEqual([]);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("Dragon Traveler preserves source-specific Arachne ratings and local portraits", async ({
  page,
}) => {
  await page.goto(path);
  const himiko = page
    .getByTestId("featured-team")
    .getByRole("img", { name: "Himiko portrait", exact: true });
  expect(
    await himiko.evaluate((img) => {
      const r = img.getBoundingClientRect();
      return r.width / r.height;
    }),
  ).toBeCloseTo(1, 1);
  await page.getByRole("button", { name: "Select Arachne", exact: true }).click();
  const detail = page.getByTestId("character-detail");
  await expect(detail.getByRole("heading", { name: "Arachne", exact: true })).toBeVisible();
  for (const view of ["Overall", "PvE", "PvP"]) {
    await page
      .getByRole("tablist", { name: "Luminary ranking views" })
      .getByRole("tab", { name: view, exact: true })
      .click();
    await expect(
      page
        .getByRole("button", { name: "Select Arachne", exact: true })
        .locator("xpath=ancestor::*[@data-tier]"),
    ).toHaveAttribute("data-tier", "S");
  }
  await page.evaluate(() =>
    document.querySelectorAll<HTMLImageElement>("main img").forEach((img) => {
      img.loading = "eager";
    }),
  );
  await expect
    .poll(() =>
      page
        .locator("main img")
        .evaluateAll((images) =>
          images.every(
            (img) =>
              (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
});

test("Dragon Traveler recommendations reveal the flowing mobile detail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 950 });
  await page.goto(path);
  await page.getByRole("button", { name: /Best New Player/ }).click();
  const detail = page.getByTestId("character-detail");
  await expect(detail.getByRole("heading", { name: "Fenrir", exact: true })).toBeVisible();
  await expect
    .poll(
      () =>
        detail.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return r.top >= 0 && r.top < 180;
        }),
      { timeout: 2000 },
    )
    .toBe(true);
  await expect(detail).toBeFocused();
  const reroll = page
    .getByRole("heading", { name: "Best Reroll Targets", exact: true })
    .locator("..");
  await reroll.getByRole("button", { name: /Medusa/ }).click();
  await expect(detail.getByRole("heading", { name: "Medusa", exact: true })).toBeVisible();
  await expect
    .poll(() =>
      detail.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= 0 && r.top < 180;
      }),
    )
    .toBe(true);
});

test("Dragon Traveler updates current pull priority at exact banner boundaries", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-28T12:00:00+08:00") });
  await page.clock.pauseAt(new Date("2026-10-29T04:59:59+08:00"));
  await page.goto(route);
  const priority = page.locator("[data-current-pull-priority]");
  await expect(priority).toContainText("Consider");
  await expect(priority).toContainText("Arachne");

  await page.getByRole("button", { name: "Taiwan", exact: true }).click();
  await expect(priority).toContainText("Consider");
  await page.clock.fastForward(2000);
  await expect(priority).toContainText("洛基");
  await expect(priority).toContainText("11/12 04:59");

  await page.getByRole("button", { name: "Global", exact: true }).click();
  await expect(priority).toContainText("Arachne");
  await page.clock.pauseAt(new Date("2026-10-29T04:59:59-05:00"));
  await expect(priority).toContainText("Arachne");
  await page.clock.fastForward(2000);
  await expect(priority).toContainText("Mythical Summon");
  await expect(priority).not.toContainText("Arachne");

  await page.getByRole("button", { name: "Taiwan", exact: true }).click();
  await page.clock.pauseAt(new Date("2026-11-05T04:59:59+08:00"));
  await expect(priority).toContainText("洛基");
  await expect(priority).toContainText("11/12 04:59");
  await page.clock.fastForward(2000);
  await expect(priority).toContainText("Wait for Testing");
  await expect(priority).toContainText("戀歌謬斯");
  await expect(priority).toContainText("11/19 04:59");
  await expect(priority).toContainText("remains active in parallel through 11/12 04:59");

  await page.clock.pauseAt(new Date("2026-11-12T04:59:59+08:00"));
  await expect(priority).toContainText("Wait for Testing");
  await page.clock.fastForward(2000);
  await expect(priority).toContainText("Wait for Testing");
  await expect(priority).toContainText("戀歌謬斯");

  await page.getByRole("button", { name: "Global", exact: true }).click();
  await page.clock.pauseAt(new Date("2026-11-12T04:59:59-05:00"));
  await expect(priority).toContainText("Mythical Summon");
  await page.clock.fastForward(2000);
  await expect(priority).toContainText("No verified current banner recommendation");

  await page.getByRole("button", { name: "Taiwan", exact: true }).click();
  await page.clock.pauseAt(new Date("2026-11-19T04:59:59+08:00"));
  await expect(priority).toContainText("Wait for Testing");
  await expect(priority).toContainText("戀歌謬斯");
  await page.clock.fastForward(2000);
  await expect(priority).toContainText("No verified current banner recommendation");
});

test("Dragon Traveler release controls expose the reviewed discovery actions", async ({ page }) => {
  await page.goto(route);
  const moreTeams = page.getByRole("link", { name: /View More Teams/ });
  const teamsUrl = "https://www.hideoutgacha.com/games/dragon-traveler/team-compositions";
  await expect(moreTeams).toHaveAttribute("href", teamsUrl);

  await page.context().route("https://www.hideoutgacha.com/**", async (request) => {
    await request.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<title>Teams</title>",
    });
  });
  const popupPromise = page.waitForEvent("popup");
  await moreTeams.click();
  const popup = await popupPromise;
  await popup.waitForURL(teamsUrl);
  await popup.close();

  const faq = page
    .getByRole("heading", { name: "FAQ" })
    .locator("xpath=ancestor::section[1]")
    .locator("details")
    .first();
  await faq.locator("summary").click();
  await expect(faq).toHaveAttribute("open", "");
});

test("Dragon Traveler captures the final 1440 visual audit surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route);
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    ),
  );

  const featuredMemberCells = page
    .getByTestId("featured-team")
    .locator('[data-testid="formation-cell"]:has(button)');
  await expect(featuredMemberCells).toHaveCount(6);
  const featuredMemberCellTops = await featuredMemberCells.evaluateAll((cells) =>
    cells.map((cell) => Math.round(cell.getBoundingClientRect().top)),
  );
  expect(
    Math.max(...featuredMemberCellTops) - Math.min(...featuredMemberCellTops),
  ).toBeLessThanOrEqual(2);

  async function logShot(name: string, target: ReturnType<typeof page.locator>) {
    const shot = await target.screenshot({
      type: "jpeg",
      quality: 40,
      animations: "disabled",
    });
    console.log(`DRAGON_VISUAL_${name}=${shot.toString("base64")}`);
  }

  const full = await page.screenshot({
    type: "jpeg",
    quality: 32,
    fullPage: true,
    animations: "disabled",
  });
  console.log(`DRAGON_VISUAL_FULL=${full.toString("base64")}`);

  await logShot(
    "HERO",
    page
      .getByRole("heading", { level: 1, name: "Dragon Traveler Tier List" })
      .locator("xpath=ancestor::section[1]"),
  );
  await logShot(
    "BOARD_DETAIL",
    page.getByRole("region", { name: "Luminary rankings and details" }),
  );
  await logShot(
    "TEAMS",
    page
      .getByRole("heading", { name: "Best Dragon Traveler Teams" })
      .locator("xpath=ancestor::section[1]"),
  );
  await logShot(
    "DECISIONS",
    page.getByRole("heading", { name: "Account Decisions" }).locator("xpath=ancestor::section[1]"),
  );
  await logShot(
    "LOWER",
    page
      .getByRole("heading", { name: "How We Rank Dragon Traveler Luminaries" })
      .locator("xpath=ancestor::div[contains(@class,'methodologySources')][1]"),
  );
  await logShot(
    "FAQ",
    page.getByRole("heading", { name: "FAQ" }).locator("xpath=ancestor::section[1]"),
  );
});

test("Dragon Traveler has no serious accessibility violations", async ({ page }) => {
  await page.goto(route);
  const result = await new AxeBuilder({ page }).include("[data-dragon-traveler-page]").analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole("button", { name: "Taiwan", exact: true }).click();
  const taiwan = await new AxeBuilder({ page }).include("[data-dragon-traveler-page]").analyze();
  expect(taiwan.violations).toEqual([]);
});

test("keeps the visible Dragon Traveler keyword group within the approved SEO range", async ({
  page,
}) => {
  await page.goto(route);

  const dragonPage = page.locator("[data-dragon-traveler-page]");
  await expect(dragonPage).toHaveCount(1);
  const visibleText = await dragonPage.innerText();
  const words = tokenize(visibleText);
  const phraseStats = dragonKeywordGroup.map((phrase) => {
    const occurrences = countPhrase(words, phrase);
    return {
      phrase,
      occurrences,
      densityPct: Number(((occurrences / Math.max(words.length, 1)) * 100).toFixed(3)),
    };
  });
  const primary = phraseStats[0]!;
  const secondary = phraseStats.slice(1);
  const combinedOccurrences = phraseStats.reduce((sum, phrase) => sum + phrase.occurrences, 0);
  const combinedDensityPct = Number(
    ((combinedOccurrences / Math.max(words.length, 1)) * 100).toFixed(3),
  );

  console.log(
    "DRAGON_TRAVELER_SEO_DENSITY " +
      JSON.stringify({
        measurementScope: "full visible Dragon Traveler page root innerText",
        visibleWords: words.length,
        primaryKeyword: primary.phrase,
        primaryCount: primary.occurrences,
        primaryDensity: primary.densityPct,
        secondaryCounts: Object.fromEntries(
          secondary.map((phrase) => [phrase.phrase, phrase.occurrences]),
        ),
        combinedCount: combinedOccurrences,
        combinedDensity: combinedDensityPct,
      }),
  );

  expect(words.length).toBeGreaterThan(0);
  expect(combinedDensityPct).toBeGreaterThanOrEqual(2.8);
  expect(combinedDensityPct).toBeLessThanOrEqual(3.5);
  expect(primary.occurrences).toBeGreaterThan(0);
  for (const phrase of secondary) {
    expect(phrase.occurrences).toBeGreaterThan(0);
    expect(primary.occurrences).toBeGreaterThan(phrase.occurrences);
  }
  expect(primary.occurrences / combinedOccurrences).toBeGreaterThanOrEqual(0.6);
});
