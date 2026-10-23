import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __vanguardHeroVitals?: { cls: number; lcp: number };
  }
}

const profiles = [
  {
    name: "Fast 4G",
    latency: 20,
    downloadThroughput: 4_000_000 / 8,
    uploadThroughput: 3_000_000 / 8,
    lcpBudget: 2500,
  },
  {
    name: "Slow 4G",
    latency: 150,
    downloadThroughput: 1_600_000 / 8,
    uploadThroughput: 750_000 / 8,
    lcpBudget: 4000,
  },
] as const;

for (const profile of profiles) {
  test(`Vanguard 390x844 Hero on ${profile.name}`, async ({ page, context }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Vanguard Hero network profile is mobile-only.");
    await page.setViewportSize({ width: 390, height: 844 });
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.latency,
      downloadThroughput: profile.downloadThroughput,
      uploadThroughput: profile.uploadThroughput,
      connectionType: "cellular4g",
    });
    await page.addInitScript(() => {
      window.__vanguardHeroVitals = { cls: 0, lcp: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) window.__vanguardHeroVitals!.cls += shift.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) window.__vanguardHeroVitals!.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });

    const response = await page.goto("/wow-forever/vanguard", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const hero = page.locator("img.vanguard-heroArtwork").first();
    await expect(hero).toBeVisible();
    await expect(hero).toHaveJSProperty("complete", true);
    await page.waitForTimeout(250);

    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const heroResource = resources.find(
        (entry) =>
          entry.name.includes("/vanguard-") && entry.name.includes("hero-base-mobile.webp"),
      );
      return {
        lcp: window.__vanguardHeroVitals?.lcp ?? 0,
        cls: window.__vanguardHeroVitals?.cls ?? 0,
        heroResourceName: heroResource?.name ?? "",
        heroLoadTime: heroResource?.duration ?? 0,
        heroBytes: heroResource?.encodedBodySize || heroResource?.transferSize || 0,
        transferredBytes: resources.reduce(
          (sum, entry) => sum + (entry.encodedBodySize || entry.transferSize || 0),
          0,
        ),
      };
    });

    console.log(
      "VANGUARD_MOBILE_HERO_METRICS",
      JSON.stringify({ profile: profile.name, viewport: "390x844", ...metrics }),
    );
    await test.info().attach("vanguard-mobile-hero-metrics", {
      body: JSON.stringify({ profile: profile.name, viewport: "390x844", ...metrics }, null, 2),
      contentType: "application/json",
    });

    expect(metrics.heroResourceName).toContain("hero-base-mobile.webp");
    expect(metrics.heroBytes).toBeGreaterThan(0);
    expect(metrics.lcp).toBeGreaterThan(0);
    expect(metrics.cls).toBeLessThanOrEqual(0.1);
    expect(metrics.lcp).toBeLessThanOrEqual(profile.lcpBudget);
  });
}
