import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";

const route = "/zenless-zone-zero/tier-list";
const hasProjectRouteInventory = routeRegistry.routes.some(
  (entry) => entry.route === "/wow-forever/vanguard",
);

function keywordOccurrences(text: string, phrase: string) {
  return text.split(phrase).length - 1;
}

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

test("ZZZ page-level SEO copy keeps the approved keyword group density", async ({ page }) => {
  test.skip(
    !hasProjectRouteInventory,
    "project-specific SEO assertions are not part of the neutral clean setup",
  );
  await page.goto(route);

  // Audit only existing static editorial text. Business data, all Pull Advice, and controls are excluded.
  for (const name of ["Pull Advice Detail", "Team Detail"]) {
    const panel = page.getByRole("region", { name, exact: true });
    if (await panel.isVisible())
      await panel.getByRole("button", { name: `Close ${name}`, exact: true }).click();
  }

  const heroHeading = page.getByRole("heading", { level: 1, name: "ZZZ Tier List" });
  const heroCopy = await heroHeading.locator("..").innerText();

  const agentRegion = page.getByRole("region", { name: "Agent Ranking", exact: true });
  const agentHeading = agentRegion.getByRole("heading", {
    level: 2,
    name: "ZZZ Character Tier List",
  });
  const agentCopy = await agentHeading.locator("..").innerText();

  const primary = page.locator('nav[aria-label="Tier list primary sections"]');
  await primary.getByRole("tab", { name: /^Teams/ }).click();
  const teamRegion = page.getByRole("region", { name: "Team Ranking", exact: true });
  const teamHeading = teamRegion.getByRole("heading", { level: 2, name: "Team Ranking" });
  const teamCopy = await teamHeading.locator("..").innerText();

  const visibleMainCopy = [heroCopy, agentCopy, teamCopy]
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  const words = visibleMainCopy.match(/[a-z0-9]+(?:[-'][a-z0-9]+)*/g);
  const wordCount = words?.length ?? 0;

  const primaryCount = keywordOccurrences(visibleMainCopy, "zzz tier list");
  const characterCount = keywordOccurrences(visibleMainCopy, "zzz character tier list");
  const fullCount = keywordOccurrences(visibleMainCopy, "zenless zone zero tier list");
  const fullCharacterCount = keywordOccurrences(
    visibleMainCopy,
    "zenless zone zero character tier list",
  );
  const combinedOccurrences = primaryCount + characterCount + fullCount + fullCharacterCount;
  const combinedDensity = (combinedOccurrences / wordCount) * 100;

  expect(wordCount).toBeGreaterThan(80);
  expect(primaryCount).toBe(3);
  expect(characterCount).toBe(1);
  expect(fullCount).toBe(1);
  expect(fullCharacterCount).toBe(0);
  expect(combinedDensity).toBeGreaterThanOrEqual(3);
  expect(combinedDensity).toBeLessThanOrEqual(5);
  expect(primaryCount).toBeGreaterThan(characterCount);
  expect(primaryCount).toBeGreaterThan(fullCount);
  expect(primaryCount).toBeGreaterThan(fullCharacterCount);
});

test("ZZZ uses the shared marketing shell and preserves the frozen decision architecture", async ({
  page,
}) => {
  await page.goto(route);

  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toBeVisible();
  await expect(page.locator('nav[aria-label="ZZZ page utility navigation"]')).toHaveCount(0);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ZZZ Tier List");

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
