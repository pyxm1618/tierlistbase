import { expect, test } from "@playwright/test";

test.use({ deviceScaleFactor: 2 });

test("Wild Rift direct Hero is reused from cache by Tier Board", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.clearBrowserCache");

  const response = await page.goto("/wild-rift/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  const hero = page.locator('[data-ia-section="hero"] img').first();
  await expect(hero).toBeVisible();
  const currentSrc = await hero.evaluate((element) => (element as HTMLImageElement).currentSrc);
  expect(new URL(currentSrc).pathname).toBe("/images/wild-rift/hero.webp");

  const before = await page.evaluate(() =>
    (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
      .filter((entry) => decodeURIComponent(entry.name).includes("/images/wild-rift/hero.webp"))
      .map((entry) => ({
        url: entry.name,
        initiatorType: entry.initiatorType,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
      })),
  );

  await page.getByRole("tab", { name: /^Jungle$/ }).click();
  await expect(page.locator('[data-ia-section="role-tier-workspace"]')).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);

  const after = await page.evaluate(() =>
    (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
      .filter((entry) => decodeURIComponent(entry.name).includes("/images/wild-rift/hero.webp"))
      .map((entry) => ({
        url: entry.name,
        initiatorType: entry.initiatorType,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
      })),
  );

  const result = {
    before,
    after,
    requestCount: after.length,
    transferredBytes: after.reduce((sum, entry) => sum + entry.transferSize, 0),
    secondUseTransferredBytes: Math.max(
      0,
      after.reduce((sum, entry) => sum + entry.transferSize, 0) -
        before.reduce((sum, entry) => sum + entry.transferSize, 0),
    ),
  };
  console.log(`P2P3_WILD_CACHE_REUSE ${JSON.stringify(result)}`);

  expect(result.transferredBytes).toBeLessThanOrEqual(60_000);
  expect(result.secondUseTransferredBytes).toBe(0);
  expect(after.every((entry) => new URL(entry.url).pathname === "/images/wild-rift/hero.webp")).toBe(
    true,
  );

  await session.detach();
});
