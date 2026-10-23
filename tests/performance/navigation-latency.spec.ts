import { expect, test } from "@playwright/test";
import { seedWowPresentationFixtures } from "../meta-board/wow-fixtures";

test.describe("Real Navigation Latency", () => {
  test("Home to WoW Forever Tier List navigates smoothly within budget", async ({
    page,
    isMobile,
  }) => {
    await seedWowPresentationFixtures();
    await page.goto("/", { waitUntil: "networkidle" });

    let link = page.locator(
      'header nav[aria-label="Primary navigation"] a[href="/wow-forever/tier-list"]',
    );
    if (isMobile) {
      await page.locator("header details summary").click();
      link = page.locator(
        'header nav[aria-label="Mobile navigation"] a[href="/wow-forever/tier-list"]',
      );
    }
    await expect(link).toBeVisible();

    const start = performance.now();
    await link.click();

    await page.waitForURL("**/wow-forever/tier-list");
    const board = page.locator('section[aria-label="Tier Board"]');
    await expect(board).toBeVisible();
    const duration = performance.now() - start;

    expect(duration).toBeLessThanOrEqual(500);
  });

  test("Home to Genshin Impact Tier List navigates smoothly within budget", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    let link = page.locator(
      'header nav[aria-label="Primary navigation"] a[href="/genshin-impact/tier-list"]',
    );
    if (isMobile) {
      await page.locator("header details summary").click();
      link = page.locator(
        'header nav[aria-label="Mobile navigation"] a[href="/genshin-impact/tier-list"]',
      );
    }
    await expect(link).toBeVisible();

    const start = performance.now();
    await link.click();

    await page.waitForURL("**/genshin-impact/tier-list");
    const board = page.locator('section[aria-label="Genshin Impact Tier List"]');
    await expect(board).toBeVisible();
    const duration = performance.now() - start;

    expect(duration).toBeLessThanOrEqual(500);
  });
});
