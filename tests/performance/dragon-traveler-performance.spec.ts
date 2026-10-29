import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __dragonTravelerCwv?: { cls: number; inp: number; lcp: number };
  }
}

test("Dragon Traveler uses the shared shell and stays within performance budgets", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.addInitScript(() => {
    window.__dragonTravelerCwv = { cls: 0, inp: 0, lcp: 0 };

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) window.__dragonTravelerCwv!.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) window.__dragonTravelerCwv!.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const interaction = entry as PerformanceEntry & {
          duration?: number;
          interactionId?: number;
        };
        if ((interaction.interactionId ?? 0) > 0) {
          window.__dragonTravelerCwv!.inp = Math.max(
            window.__dragonTravelerCwv!.inp,
            interaction.duration ?? 0,
          );
        }
      }
    }).observe({
      type: "event",
      buffered: true,
      durationThreshold: 16,
    } as PerformanceObserverInit & {
      durationThreshold: number;
    });
  });

  const response = await page.goto("/dragon-traveler/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  await expect(page.locator("body > div > header")).toHaveCount(1);
  await expect(page.locator("body > div > footer")).toHaveCount(1);
  await expect(page.locator("[data-dragon-traveler-page] > header")).toHaveCount(0);
  await expect(page.locator("[data-dragon-traveler-page] > footer")).toHaveCount(0);

  const taiwan = page.getByRole("button", { name: "Taiwan", exact: true });
  await taiwan.click();
  await expect(taiwan).toHaveAttribute("aria-pressed", "true");

  const rarity = page.getByRole("combobox", { name: "Rarity" });
  await rarity.selectOption("SSR EX");
  await expect(rarity).toHaveValue("SSR EX");

  const pvp = page
    .getByRole("group", { name: "Luminary ranking views" })
    .getByRole("button", { name: "PvP", exact: true });
  await pvp.click();
  await expect(pvp).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(120);

  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const scripts = resources.filter((resource) => resource.initiatorType === "script");
    const images = resources.filter((resource) => resource.initiatorType === "img");

    return {
      cls: window.__dragonTravelerCwv?.cls ?? 0,
      inp: window.__dragonTravelerCwv?.inp ?? 0,
      lcp: window.__dragonTravelerCwv?.lcp ?? 0,
      scriptBytes: scripts.reduce((sum, item) => sum + item.encodedBodySize, 0),
      scriptCount: scripts.length,
      oversizedImages: images
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
