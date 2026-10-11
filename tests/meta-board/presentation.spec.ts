import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";

import { createDatabaseClient } from "../../src/platform/database/client";
import {
  entities,
  games,
  gameVersions,
  rankingContexts,
  ratings,
  sources,
  sourceRatings,
  ratingChanges,
} from "../../src/modules/meta-board/db/schema";

// These synthetic records may only be written to a dedicated local presentation-test DB.
test.beforeAll(async () => {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is required for presentation fixtures");
  const target = new URL(url);
  if (
    !["localhost", "127.0.0.1"].includes(target.hostname) ||
    !target.pathname.startsWith("/tierlistbase_presentation_test")
  )
    throw new Error(
      "Presentation fixtures require a dedicated local tierlistbase_presentation_test database",
    );
  const database = createDatabaseClient(url);
  try {
    const existing = await database.db.select().from(games).where(eq(games.slug, "wow-forever"));
    if (existing.length > 0) {
      if (existing[0]?.id !== "presentation-test-game")
        throw new Error("Refusing to replace existing game data");
      return;
    }
    await database.db.transaction(async (db) => {
      await db.insert(games).values({
        id: "presentation-test-game",
        slug: "wow-forever",
        name: "Synthetic WoW Forever",
        publisher: "Synthetic test",
        status: "active",
      });
      await db.insert(gameVersions).values([
        {
          id: "presentation-version",
          gameId: "presentation-test-game",
          version: "synthetic-v1",
          build: "test-build-1",
          levelCap: 60,
          status: "current",
        },
        {
          id: "presentation-version-2",
          gameId: "presentation-test-game",
          version: "synthetic-v2",
          build: "test-build-2",
          levelCap: 60,
          status: "preliminary",
        },
      ]);
      await db
        .update(games)
        .set({ currentVersionId: "presentation-version" })
        .where(eq(games.id, "presentation-test-game"));
      await db.insert(entities).values({
        id: "presentation-mage",
        gameId: "presentation-test-game",
        name: "Synthetic Mage",
        slug: "synthetic-mage",
        entityType: "spec",
        role: "dps",
      });
      const contexts = [
        {
          id: "presentation-overall",
          slug: "test-overall",
          mode: "overall",
          role: "all",
          levelCap: 30,
          label: "Synthetic Overall Level 30",
        },
        {
          id: "presentation-pvp",
          slug: "test-pvp",
          mode: "pvp",
          role: "all",
          levelCap: 30,
          label: "Synthetic PvP Level 30",
        },
        {
          id: "presentation-dps",
          slug: "test-dps",
          mode: "overall",
          role: "dps",
          levelCap: 30,
          label: "Synthetic DPS Level 30",
        },
        {
          id: "presentation-60",
          slug: "test-60",
          mode: "overall",
          role: "all",
          levelCap: 60,
          label: "Synthetic Overall Level 60",
        },
      ];
      await db
        .insert(rankingContexts)
        .values(contexts.map((context) => ({ ...context, gameId: "presentation-test-game" })));
      await db.insert(ratings).values([
        ...contexts.map((context) => ({
          id: `rating-${context.id}`,
          entityId: "presentation-mage",
          rankingContextId: context.id,
          gameVersionId: "presentation-version",
          tier: context.mode === "pvp" ? "B" : "S",
          whyThisTier: context.label,
          strengths: "Synthetic strength",
          constraints: "Synthetic constraint",
          freshnessStatus: "current",
        })),
        {
          id: "rating-presentation-v2",
          entityId: "presentation-mage",
          rankingContextId: "presentation-overall",
          gameVersionId: "presentation-version-2",
          tier: "A",
          whyThisTier: "Synthetic new version rationale",
          freshnessStatus: "preliminary",
        },
      ]);
      await db.insert(sources).values([
        {
          id: "presentation-expert",
          name: "Synthetic Expert Source",
          url: "https://example.com/synthetic-expert",
          sourceType: "expert",
          publisher: "Synthetic fixture",
          freshnessStatus: "unconfigured",
        },
        {
          id: "presentation-data",
          name: "Synthetic Data Source",
          url: "https://example.com/synthetic-data",
          sourceType: "data",
          publisher: "Synthetic fixture",
          freshnessStatus: "preliminary",
        },
      ]);
      await db.insert(sourceRatings).values([
        {
          id: "presentation-sr1",
          sourceId: "presentation-expert",
          entityId: "presentation-mage",
          rankingContextId: "presentation-overall",
          gameVersionId: "presentation-version",
          rawTier: "S",
          normalizedTier: "S",
        },
        {
          id: "presentation-sr2",
          sourceId: "presentation-data",
          entityId: "presentation-mage",
          rankingContextId: "presentation-overall",
          gameVersionId: "presentation-version-2",
          rawTier: "A",
          normalizedTier: "A",
          rawRank: 2,
          rawScore: "0",
        },
      ]);
      await db.insert(ratingChanges).values({
        id: "presentation-change",
        entityId: "presentation-mage",
        rankingContextId: "presentation-overall",
        fromVersionId: "presentation-version",
        toVersionId: "presentation-version-2",
        previousTier: "S",
        newTier: "A",
        changeType: "demoted",
        reason: "Synthetic change reason",
        evidence: "Synthetic change evidence",
      });
    });
  } finally {
    await database.close();
  }
});

test("SSR contains all modules in order, stays responsive, and preserves unknowns", async ({
  page,
  request,
}, testInfo) => {
  const response = await request.get("/wow-forever/tier-list?level=30");
  const html = await response.text();
  for (const text of [
    "WoW Forever Tier List",
    "Synthetic Mage",
    "Evidence &amp; Trust",
    "Current Sources",
    "FAQ / Methodology",
  ])
    expect(html).toContain(text);
  await page.goto("/wow-forever/tier-list?level=30");
  await expect(page.locator("main h2")).toHaveText([
    "Quick Insights",
    "What Changed",
    "Evidence & Trust",
    "Expert / Data View",
    "Current Sources",
    "FAQ / Methodology",
  ]);
  await expect(page.locator("header").filter({ has: page.locator("h1") })).toContainText(
    "Level Cap: 30",
  );
  await expect(page.locator("#sources-heading").locator("..")).toContainText(
    "Patch / Build match: Unknown",
  );
  await expect(page.getByRole("button", { name: /Agree|Disagree|Vote/ })).toHaveCount(0);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath("board-light.png"), fullPage: true });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== "running"),
  );
  await page.screenshot({ path: testInfo.outputPath("board-dark.png"), fullPage: true });
  const audit = await new AxeBuilder({ page }).analyze();
  expect(
    audit.violations.filter((issue) => issue.impact === "critical" || issue.impact === "serious"),
  ).toEqual([]);
});

test("drawer traps focus, handles Escape and backdrop, restores focus and scroll", async ({
  page,
}, testInfo) => {
  await page.goto("/wow-forever/tier-list?level=30");
  const card = page.getByRole("button", { name: /Synthetic Mage/ });
  await page.setViewportSize({ width: 320, height: 900 });
  await card.click();
  const dialog = page.getByRole("dialog", { name: "Synthetic Mage" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await expect(dialog.getByRole("button", { name: "Close detail drawer" })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  const audit = await new AxeBuilder({ page }).analyze();
  expect(
    audit.violations.filter((issue) => issue.impact === "critical" || issue.impact === "serious"),
  ).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("drawer.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await card.click();
  await dialog.getByRole("button", { name: "Close detail drawer" }).click();
  await expect(card).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 900 });
  await card.click();
  await page.mouse.click(20, 300);
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
});

test("filters navigate real contexts, expose pending feedback, and isolate evidence", async ({
  page,
}) => {
  await page.goto("/wow-forever/tier-list?level=30");
  await page.route("**/wow-forever/tier-list?*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.continue();
  });
  const card = page.getByRole("button", { name: /Synthetic Mage/ });
  await page.getByRole("button", { name: "pvp", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Loading ranking context…");
  await expect(page.getByRole("button", { name: "pvp", exact: true })).toBeDisabled();
  await expect(page.locator('[aria-label="Tier Board"] [aria-hidden="true"]')).toBeVisible();
  await expect(page).toHaveURL(/mode=pvp/);
  await expect(card).toContainText("Synthetic PvP Level 30");
  await expect(page.locator("#sources-heading").locator("..")).toContainText(
    "No reviewed sources published",
  );
  await page.getByRole("button", { name: "overall", exact: true }).click();
  await expect(card).toContainText("Synthetic Overall Level 30");
  await page.getByRole("button", { name: "dps", exact: true }).click();
  await expect(card).toContainText("Synthetic DPS Level 30");
  await page.getByRole("button", { name: "all", exact: true }).click();
  await expect(card).toContainText("Synthetic Overall Level 30");
  await page.getByRole("button", { name: "Lv 60", exact: true }).click();
  await expect(card).toContainText("Synthetic Overall Level 60");
  await page.getByRole("button", { name: "Lv 30", exact: true }).click();
  await expect(card).toContainText("Synthetic Overall Level 30");
  await page.getByRole("button", { name: "test-build-2", exact: true }).click();
  await expect(page).toHaveURL(/build=test-build-2/);
  await expect(card).toContainText("Synthetic new version rationale");
  await expect(page.locator("#sources-heading").locator("..")).toContainText(
    "Synthetic Data Source",
  );
  await expect(page.locator("#sources-heading").locator("..")).not.toContainText(
    "Synthetic Expert Source",
  );
  await expect(page.getByRole("region", { name: "What Changed" })).toContainText(
    "Synthetic change reason",
  );
  await card.click();
  await expect(page.getByRole("dialog")).toContainText("Recorded Change History");
  await expect(page.getByRole("dialog")).toContainText("Synthetic change reason");
  await page.keyboard.press("Escape");
  await page.goto("/wow-forever/tier-list?mode=unknown");
  await expect(page.getByText("No reviewed ranking data published yet")).toBeVisible();
  await expect(page.locator("#sources-heading").locator("..")).not.toContainText(
    "Synthetic Data Source",
  );
});
