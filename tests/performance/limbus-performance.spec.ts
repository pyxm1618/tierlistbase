import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __limbusCwv?: { cls: number; inp: number; lcp: number };
  }
}

test("Limbus page uses shared shell and stays within page performance budgets", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.addInitScript(() => {
    window.__limbusCwv = { cls: 0, inp: 0, lcp: 0 };

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) window.__limbusCwv!.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) window.__limbusCwv!.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const interaction = entry as PerformanceEntry & {
          duration?: number;
          interactionId?: number;
        };
        if ((interaction.interactionId ?? 0) > 0) {
          window.__limbusCwv!.inp = Math.max(
            window.__limbusCwv!.inp,
            interaction.duration ?? 0,
          );
        }
      }
    }).observe({
      type: "event",
      buffered: true,
      durationThreshold: 16,
    } as PerformanceObserverInit & { durationThreshold: number });
  });

  const response = await page.goto("/limbus-company/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  // The Limbus page must use the existing marketing shell instead of duplicating site chrome.
  await expect(page.locator("body > div > header")).toHaveCount(1);
  await expect(page.locator("body > div > footer")).toHaveCount(1);
  await expect(page.locator("[data-limbus-page] > header")).toHaveCount(0);

  // Create a real measurable interaction without adding page-specific client hydration.
  const filter = page.getByRole("button", { name: "All Identities", exact: true });
  await filter.evaluate((element) => {
    element.addEventListener(
      "click",
      () => {
        const until = performance.now() + 20;
        while (performance.now() < until) {
          // Lab-only interaction workload so INP is measurable.
        }
      },
      { once: true },
    );
  });
  await filter.click();
  await page.waitForTimeout(100);

  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const scripts = resources.filter((resource) => resource.initiatorType === "script");
    const images = resources.filter((resource) => resource.initiatorType === "img");

    return {
      cls: window.__limbusCwv?.cls ?? 0,
      inp: window.__limbusCwv?.inp ?? 0,
      lcp: window.__limbusCwv?.lcp ?? 0,
      scriptBytes: scripts.reduce((sum, item) => sum + item.encodedBodySize, 0),
      scriptCount: scripts.length,
      oversizedImages: images
        .filter((image) => image.encodedBodySize > 500_000)
        .map((image) => ({ name: image.name, bytes: image.encodedBodySize })),
    };
  });

  await test.info().attach("limbus-performance-metrics", {
    body: JSON.stringify(metrics, null, 2),
    contentType: "application/json",
  });

  expect(consoleErrors).toEqual([]);
  expect(metrics.cls).toBeLessThanOrEqual(0.1);
  expect(metrics.lcp).toBeGreaterThan(0);
  expect(metrics.lcp).toBeLessThanOrEqual(2500);
  expect(metrics.inp).toBeGreaterThan(0);
  expect(metrics.inp).toBeLessThanOrEqual(200);
  expect(metrics.scriptBytes).toBeLessThanOrEqual(350_000);
  expect(metrics.scriptCount).toBeLessThanOrEqual(20);
  expect(metrics.oversizedImages).toEqual([]);
});
