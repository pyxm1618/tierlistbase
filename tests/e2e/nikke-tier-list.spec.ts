import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";
import { readSnapshotMetadata } from "@/modules/nikke-tier-list/snapshot";

const route = "/nikke/tier-list";
const hasProjectRouteInventory = routeRegistry.routes.some((entry) => entry.route === route);

const recordedSnapshot = (
  JSON.parse(readFileSync(path.join(process.cwd(), "nikke-real-data.json"), "utf8")) as {
    snapshot: { data_snapshot_date: string; game_version_if_confirmable: string };
  }
).snapshot;
const {
  date: snapshotDate,
  phase: snapshotPhase,
  version: snapshotVersion,
} = readSnapshotMetadata({
  dataSnapshotDate: recordedSnapshot.data_snapshot_date,
  gameVersion: recordedSnapshot.game_version_if_confirmable,
});

const CURRENT_RANKING_CLAIM =
  /\bcurrent (?:character |meta )?\w*rankings?\b|\blatest (?:character )?rankings?\b/i;

test("NIKKE keeps test-environment noindex with snapshot-framed metadata", async ({ page }) => {
  test.skip(
    !hasProjectRouteInventory,
    "project-specific SEO assertions are not part of the neutral clean setup",
  );

  await page.goto(route);

  await expect(page).toHaveTitle("NIKKE Tier List – Best Characters in Goddess of Victory");
  const description = page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute("content", new RegExp(snapshotVersion, "i"));
  await expect(description).toHaveAttribute("content", new RegExp(snapshotPhase, "i"));
  await expect(description).not.toHaveAttribute("content", /current|latest/i);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText("NIKKE Tier List");
});

test("NIKKE labels the recorded ranking snapshot next to the rankings", async ({ page }) => {
  await page.goto(route);

  const rankingContext = page.getByRole("note", { name: "Ranking snapshot context" });
  await expect(rankingContext).toBeVisible();
  await expect(rankingContext).toContainText(`Version ${snapshotVersion}`);
  await expect(rankingContext.locator("time")).toHaveAttribute("datetime", snapshotDate);
  await expect(rankingContext).toContainText(`${snapshotPhase} snapshot`);
  await expect(rankingContext).toContainText("not live rankings");

  const pageNav = page.locator('nav[aria-label="NIKKE page navigation"]');
  await expect(pageNav).toContainText(snapshotVersion);
  await expect(pageNav).toContainText(snapshotDate);

  const tierList = page.locator("#tier-list");
  await expect(tierList.getByRole("heading", { level: 2 })).toContainText("Tier List");

  await expect(page.getByRole("heading", { name: /Banner Advice/ })).toBeVisible();
});

test("NIKKE page framing never claims current rankings for the recorded snapshot", async ({
  page,
}) => {
  await page.goto(route);

  const framingSections = [
    'section[aria-label="NIKKE hero"]',
    'nav[aria-label="NIKKE page navigation"]',
    "#tier-list > div:first-child",
    "#methodology",
    "#changelog",
    "#banner-advice",
  ];

  for (const selector of framingSections) {
    const text = await page.locator(selector).innerText();
    expect(text, `${selector} must stay snapshot-framed`).not.toMatch(
      /\b(current|latest|real-time|up-to-date)\b/i,
    );
  }

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(CURRENT_RANKING_CLAIM);
  expect(bodyText).toContain(`${snapshotPhase} snapshot`);
});
