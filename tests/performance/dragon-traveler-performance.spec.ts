import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __dragonCwv?: { cls: number; inp: number; lcp: number };
  }
}

test("Dragon Traveler uses shared shell and stays within page performance budgets", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.addInitScript(() => {
    window.__dragonCwv = { cls: 0, inp: 0, lcp: 0 };

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) window.__dragonCwv!.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) window.__dragonCwv!.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const interaction = entry as PerformanceEntry & {
          duration?: number;
          interactionId?: number;
        };
        if ((interaction.interactionId ?? 0) > 0) {
          window.__dragonCwv!.inp = Math.max(window.__dragonCwv!.inp, interaction.duration ?? 0);
        }
      }
    }).observe({
      type: "event",
      buffered: true,
      durationThreshold: 16,
    } as PerformanceObserverInit & { durationThreshold: number });
  });

  const response = await page.goto("/dragon-traveler/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  await expect(page.locator("body > div > header")).toHaveCount(1);
  await expect(page.locator("body > div > footer")).toHaveCount(1);
  await expect(page.locator("[data-dragon-traveler-page] > header")).toHaveCount(0);

  const search = page.getByRole("searchbox", { name: "Search Luminaries" });
  await search.fill("Arachne");
  await expect(page.getByRole("button", { name: /Arachne, S tier/ })).toBeVisible();
  await page.getByRole("tab", { name: "PvP", exact: true }).first().click();
  await page.getByRole("tab", { name: "Taiwan", exact: true }).click();
  await search.fill("Hypnos");
  await expect(page.getByRole("button", { name: /Hypnos, S tier/ })).toBeVisible();
  await page.waitForTimeout(100);

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const scripts = resources.filter((resource) => resource.initiatorType === "script");
    const imageLike = resources.filter(
      (resource) =>
        resource.initiatorType === "img" ||
        /\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?|$)/i.test(resource.name),
    );

    return {
      cls: window.__dragonCwv?.cls ?? 0,
      inp: window.__dragonCwv?.inp ?? 0,
      lcp: window.__dragonCwv?.lcp ?? 0,
      scriptBytes: scripts.reduce((sum, item) => sum + item.encodedBodySize, 0),
      scriptCount: scripts.length,
      oversizedImages: imageLike
        .filter((image) => image.encodedBodySize > 500_000)
        .map((image) => ({ name: image.name, bytes: image.encodedBodySize })),
    };
  });

  await test.info().attach("dragon-traveler-performance-metrics", {
    body: JSON.stringify(metrics, null, 2),
    contentType: "application/json",
  });

  expect(consoleErrors).toEqual([]);
  expect(metrics.cls).toBeLessThanOrEqual(0.1);
  expect(metrics.lcp).toBeGreaterThan(0);
  expect(metrics.lcp).toBeLessThanOrEqual(2500);
  expect(metrics.inp).toBeGreaterThanOrEqual(0);
  expect(metrics.inp).toBeLessThanOrEqual(200);
  expect(metrics.scriptBytes).toBeLessThanOrEqual(350_000);
  expect(metrics.scriptCount).toBeLessThanOrEqual(20);
  expect(metrics.oversizedImages).toEqual([]);
});
