import { seedGenshinTestDatabase } from "../genshin-tier-list/database";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeAll(seedGenshinTestDatabase);

declare global {
  interface Window {
    __cwv?: { cls: number; inp: number; lcp: number };
  }
}

const routes = [
  "/",
  "/wow-forever/tier-list",
  "/wow-forever/tier-list?level=30",
  "/genshin-impact/tier-list",
] as const;

for (const route of routes) {
  test(`${route} stays within marketing release budgets`, async ({ page, request }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.addInitScript(() => {
      window.__cwv = { cls: 0, inp: 0, lcp: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) window.__cwv!.cls += shift.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last) window.__cwv!.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const interaction = entry as PerformanceEntry & {
            duration?: number;
            interactionId?: number;
          };
          if ((interaction.interactionId ?? 0) > 0) {
            window.__cwv!.inp = Math.max(window.__cwv!.inp, interaction.duration ?? 0);
          }
        }
      }).observe({
        type: "event",
        buffered: true,
        durationThreshold: 16,
      } as PerformanceObserverInit & { durationThreshold: number });
    });

    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    expect(response?.headers()["x-robots-tag"]).toContain("noindex");

    const title = await page.title();
    expect(title.trim().length).toBeGreaterThanOrEqual(20);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.trim().length ?? 0).toBeGreaterThanOrEqual(70);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(structuredData.length).toBeGreaterThan(0);
    for (const value of structuredData) expect(() => JSON.parse(value)).not.toThrow();

    const imageProblems = await page.locator("img").evaluateAll((images) =>
      images.flatMap((image) => {
        const width = Number(image.getAttribute("width"));
        const height = Number(image.getAttribute("height"));
        if (width > 0 && height > 0) return [];
        const parent = image.parentElement;
        if (
          image.getAttribute("data-nimg") === "fill" &&
          parent &&
          getComputedStyle(parent).position !== "static" &&
          parent.getBoundingClientRect().height > 0
        ) {
          return [];
        }
        return [image.getAttribute("src") ?? "unknown-image"];
      }),
    );
    expect(imageProblems).toEqual([]);

    const internalLinks = await page
      .locator('a[href^="/"]')
      .evaluateAll(
        (links) =>
          [...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean))] as string[],
      );
    for (const href of internalLinks) {
      if (href.startsWith("/api/")) continue;
      const linked = await request.get(href, { maxRedirects: 0 });
      expect(linked.status(), `broken internal link: ${href}`).toBeLessThan(400);
    }

    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(
      accessibility.violations.filter(
        (violation) => violation.impact === "critical" || violation.impact === "serious",
      ),
    ).toEqual([]);

    if (route === "/genshin-impact/tier-list") {
      await page.getByRole("searchbox", { name: "Search characters" }).fill("Nahida");
      await page.getByRole("button", { name: "Support", exact: true }).click();
      await page.getByRole("button", { name: "Dendro", exact: true }).click();
      await page.getByRole("button", { name: /Nahida, Dendro/ }).click();
      await expect(
        page.getByRole("heading", { name: "Why this Tier", exact: true }).filter({ visible: true }),
      ).toBeVisible();
      await page.waitForTimeout(100);
    }

    const firstLink = page.locator('a[href^="/"]').first();
    if (route !== "/genshin-impact/tier-list" && (await firstLink.count()) > 0) {
      await firstLink.evaluate((element) => {
        element.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            const until = performance.now() + 20;
            while (performance.now() < until) {
              // Deliberately create a measurable lab interaction without navigation.
            }
          },
          { once: true },
        );
      });
      await firstLink.click();
      await page.waitForTimeout(100);
    }

    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const scripts = resources.filter((resource) => resource.initiatorType === "script");
      const images = resources.filter((resource) => resource.initiatorType === "img");
      return {
        cls: window.__cwv?.cls ?? 0,
        inp: window.__cwv?.inp ?? 0,
        lcp: window.__cwv?.lcp ?? 0,
        scriptBytes: scripts.reduce((sum, item) => sum + item.encodedBodySize, 0),
        scriptCount: scripts.length,
        oversizedImages: images
          .filter((image) => image.encodedBodySize > 500_000)
          .map((image) => ({ name: image.name, bytes: image.encodedBodySize })),
      };
    });

    await test.info().attach("marketing-performance-metrics", {
      body: JSON.stringify({ route, ...metrics }, null, 2),
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
}

for (const width of [390, 1920, 2560]) {
  test(`Genshin image candidates at ${width}px match DPR without avatar preloads`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/genshin-impact/tier-list", { waitUntil: "networkidle" });
    const preloads = page.locator('link[rel="preload"][as="image"]');
    await expect(preloads).toHaveCount(1);
    await expect(preloads).toHaveAttribute("imagesrcset", /hero-f958fb67df/);
    const card = page.getByRole("button", { name: /Nahida, Dendro/ });
    await card.click();
    const samples = [];
    for (const [name, selector] of [
      ["hero", '[data-ia-section="page-header"] img'],
      ["board", '[data-avatar="board"] img'],
      ["detail", '[data-avatar="detail"] img'],
    ] as const) {
      const image = page.locator(selector).filter({ visible: true }).first();
      await expect(image).toBeVisible();
      await expect(image).toHaveJSProperty("complete", true);
      await expect(image).toHaveAttribute("sizes", /.+/);
      const sample = await image.evaluate((element) => {
        const image = element as HTMLImageElement;
        const timing = (
          performance.getEntriesByType("resource") as PerformanceResourceTiming[]
        ).find((entry) => entry.name === image.currentSrc);
        return {
          currentSrc: image.currentSrc,
          naturalWidth: image.naturalWidth,
          renderedWidth: image.getBoundingClientRect().width,
          encodedBodySize: timing?.encodedBodySize ?? null,
          dpr: devicePixelRatio,
        };
      });
      expect(sample.naturalWidth).toBeGreaterThan(0);
      expect(sample.renderedWidth).toBeGreaterThan(0);
      expect(sample.currentSrc).toContain("/_next/image?");
      expect(sample.currentSrc).toContain(".webp");
      const response = await request.get(sample.currentSrc);
      expect(response.status()).toBe(200);
      const bytes = (await response.body()).length;
      expect(bytes).toBeLessThan(name === "hero" ? 500_000 : 50_000);
      if (name !== "hero") {
        await expect(image).toHaveAttribute("loading", "lazy");
        const candidateWidth = Number(new URL(sample.currentSrc).searchParams.get("w"));
        expect(candidateWidth).toBeLessThanOrEqual(384);
        expect(candidateWidth).toBeGreaterThanOrEqual(
          Math.min(256, sample.renderedWidth * sample.dpr),
        );
      }
      samples.push({ name, ...sample, responseBodyBytes: bytes });
    }
    await test.info().attach(`genshin-image-evidence-${width}px`, {
      body: JSON.stringify(samples, null, 2),
      contentType: "application/json",
    });
  });
}
