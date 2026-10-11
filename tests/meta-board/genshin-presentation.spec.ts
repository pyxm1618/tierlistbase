import { expect, test } from "@playwright/test";

test("Genshin Tier List implements the frozen V1 information architecture", async ({ page }) => {
  await page.goto("/genshin-impact/tier-list");

  await expect(page.getByRole("heading", { level: 1, name: "Genshin Impact Tier List" })).toBeVisible();
  await expect(page.getByText("演示数据", { exact: true })).toBeVisible();

  const sections = [
    "ranking-context",
    "game-specific-filters",
    "tier-board",
    "selected-entity-detail",
    "quick-insights",
    "version-changes",
    "sources-evidence",
    "methodology-faq",
  ];

  for (const section of sections) {
    await expect(page.locator('[data-ia-section="' + section + '"]')).toBeVisible();
  }

  const names = await page.locator("[data-character-name]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-character-name")),
  );
  expect(new Set(names).size).toBe(names.length);

  await page.getByLabel("元素").selectOption("水");
  await expect(page.getByRole("button", { name: /那维莱特/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /雷电将军/ })).toHaveCount(0);

  await page.getByRole("button", { name: /芙宁娜/ }).click();
  await expect(page.locator('[data-ia-section="selected-entity-detail"]')).toContainText("芙宁娜");

  await page.getByLabel("元素").selectOption("all");
  await page.getByLabel("游戏模式").selectOption("overworld");
  await expect(page.locator('[data-ia-section="version-changes"]')).toContainText("夜兰");

  await expect(page.getByText(/站内投票|玩家评论|论坛/)).toHaveCount(0);
});

test("Genshin Tier List remains usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/genshin-impact/tier-list");

  await expect(page.getByRole("heading", { level: 1, name: "Genshin Impact Tier List" })).toBeVisible();
  await expect(page.locator('[data-ia-section="tier-board"]')).toBeVisible();

  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});
