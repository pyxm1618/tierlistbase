import { expect, test } from "@playwright/test";

test.use({ deviceScaleFactor: 2 });

test("Wild Rift Tier Board hero duplicate transfer probe", async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setCacheDisabled", { cacheDisabled: true });
  await session.send("Network.clearBrowserCache");

  const response = await page.goto("/wild-rift/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

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
  await page.waitForTimeout(500);

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

  const raw = after.filter((entry) => new URL(entry.url).pathname === "/images/wild-rift/hero.webp");
  const optimized = after.filter((entry) => new URL(entry.url).pathname === "/_next/image");
  const result = {
    before,
    after,
    rawRequestCount: raw.length,
    rawTransferredBytes: raw.reduce((sum, entry) => sum + entry.transferSize, 0),
    optimizedRequestCount: optimized.length,
    totalHeroTransferredBytes: after.reduce((sum, entry) => sum + entry.transferSize, 0),
  };
  console.log(`P2P3_WILD_DUPLICATE_PROBE ${JSON.stringify(result)}`);

  expect(
    await page.locator("main img").evaluateAll((images) =>
      images.filter((image) => {
        const img = image as HTMLImageElement;
        return img.complete && img.naturalWidth === 0;
      }).length,
    ),
  ).toBe(0);

  await session.detach();
});
