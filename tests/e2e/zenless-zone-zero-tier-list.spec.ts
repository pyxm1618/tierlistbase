import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";
import { gameVersion, snapshotDate } from "@/modules/zenless-zone-zero-tier-list/data";

const route = "/zenless-zone-zero/tier-list";
const hasProjectRouteInventory = routeRegistry.routes.some(
  (entry) => entry.route === "/wow-forever/vanguard",
);

test("ZZZ preserves test-environment noindex with the approved release metadata", async ({
  page,
}) => {
  test.skip(
    !hasProjectRouteInventory,
    "project-specific SEO assertions are not part of the neutral clean setup",
  );
  await page.goto(route);

  await expect(page).toHaveTitle("ZZZ Tier List – Best Zenless Zone Zero Characters Ranked");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Explore the Zenless Zone Zero Tier List with current character rankings, best characters and agents, team-building insights, and pull decisions.",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText("ZZZ Tier List");

  const sitemapEntries = routeRegistry.sitemapEntries();
  const sitemapRoutes = sitemapEntries.map((entry) => entry.route);
  expect(sitemapRoutes).toContain(route);
});

test("ZZZ uses the shared marketing shell and preserves the frozen decision architecture", async ({
  page,
}) => {
  await page.goto(route);

  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toBeVisible();
  await expect(page.locator('nav[aria-label="ZZZ page utility navigation"]')).toHaveCount(0);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ZZZ Tier List");

  const rankingContext = page.getByRole("note", { name: "Agent ranking context" });
  await expect(rankingContext).toBeVisible();
  await expect(rankingContext).toContainText(`Version ${gameVersion}`);
  await expect(rankingContext.locator("time")).toHaveAttribute("datetime", snapshotDate);
  await expect(rankingContext).toContainText("Source · TierListBase editorial data");
  await expect(rankingContext).toContainText("mode-specific tiers");

  const primary = page.locator('nav[aria-label="Tier list primary sections"]');
  const agentsTab = primary.getByRole("tab", { name: /^Agents/ });
  const teamsTab = primary.getByRole("tab", { name: /^Teams/ });
  const pullTab = primary.getByRole("tab", { name: /^Pull Advice/ });

  await expect(agentsTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("region", { name: "Agent Ranking", exact: true })).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Agent Detail", exact: true }),
  ).toBeVisible();

  await page.getByRole("searchbox", { name: "Search agents" }).fill("Miyabi");
  await expect(page.getByRole("button", { name: /Miyabi, S tier/ })).toBeVisible();

  await page.getByRole("combobox", { name: "Attribute" }).selectOption("Frost");
  await expect(page.getByRole("button", { name: /Miyabi, S tier/ })).toBeVisible();

  await teamsTab.click();
  await expect(teamsTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("region", { name: "Team Ranking", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Agent Ranking", exact: true })).toHaveCount(0);

  const teamDetail = page.getByRole("region", { name: "Team Detail", exact: true });
  await expect(teamDetail).toBeVisible();
  await teamDetail.getByRole("button", { name: "Close Team Detail" }).click();
  await page.locator("button").filter({ hasText: "Phoenix Vortex" }).first().click();
  await expect(teamDetail).toBeVisible();
  await expect(teamDetail).toContainText("Phoenix Vortex");
  await expect(teamDetail).toContainText("Team Compositions");
  await expect(teamDetail).toContainText("Best Bangboo");
  await teamDetail.getByRole("button", { name: "Close Team Detail" }).click();

  await pullTab.click();
  await expect(pullTab).toHaveAttribute("aria-selected", "true");
  const pullDetail = page.getByRole("region", { name: "Pull Advice Detail", exact: true });
  await expect(pullDetail).toBeVisible();
  await expect(pullDetail).toContainText("Pull If");
  await expect(pullDetail).toContainText("Best For Which Accounts");

  await pullDetail.getByRole("tab", { name: "Investment", exact: true }).click();
  await expect(pullDetail).toContainText("Signature W-Engine Importance");

  await pullDetail.getByRole("tab", { name: "Alternatives", exact: true }).click();
  await expect(pullDetail).toContainText("Alternatives");
});

for (const width of [390, 1440]) {
  test(`ZZZ remains within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
