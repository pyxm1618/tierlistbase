import { expect, test } from "@playwright/test";

const route = "/zenless-zone-zero/tier-list";

test("ZZZ uses the shared marketing shell and preserves the frozen decision architecture", async ({
  page,
}) => {
  await page.goto(route);

  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toBeVisible();
  await expect(page.locator('nav[aria-label="ZZZ page utility navigation"]')).toHaveCount(0);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/TIER\s+LIST/);

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
  await expect(page.getByRole("button", { name: /Miyabi, S\+ tier/ })).toBeVisible();

  await page.getByRole("combobox", { name: "Attribute" }).selectOption("Frost");
  await expect(page.getByRole("button", { name: /Miyabi, S\+ tier/ })).toBeVisible();

  await teamsTab.click();
  await expect(teamsTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("region", { name: "Team Ranking", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Agent Ranking", exact: true })).toHaveCount(0);

  const teamDetail = page.getByRole("region", { name: "Team Detail", exact: true });
  await expect(teamDetail).toBeVisible();
  await teamDetail.getByRole("button", { name: "Close Team Detail" }).click();
  await page.locator("button").filter({ hasText: "Evelyn Hypercarry" }).first().click();
  await expect(teamDetail).toBeVisible();
  await expect(teamDetail).toContainText("Evelyn Hypercarry");
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
