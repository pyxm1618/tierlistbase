import { seedGenshinTestDatabase } from "../genshin-tier-list/database";
import { seedWowPresentationFixtures } from "../meta-board/wow-fixtures";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeAll(seedGenshinTestDatabase);
test.beforeAll(seedWowPresentationFixtures);

const browserImageHeaders = {
  accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
};

const WOW_HERO_SOURCE = { width: 2172, height: 724, directBytes: 299_436 } as const;
const GENSHIN_HERO_SOURCE = { width: 2131, height: 738, directBytes: 330_538 } as const;

function requiredCoverCssWidth(
  renderedWidth: number,
  renderedHeight: number,
  sourceAspectRatio: number,
) {
  return Math.max(renderedWidth, renderedHeight * sourceAspectRatio);
}

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
  "/nikke/tier-list",
  "/zenless-zone-zero/tier-list",
  "/phantom-blade-zero/tier-list",
  "/dragon-traveler/tier-list",
  "/wild-rift/tier-list",
  "/anime-expeditions/tier-list",
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

    const title = await page.title();
    expect(title.trim().length).toBeGreaterThanOrEqual(20);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.trim().length ?? 0).toBeGreaterThanOrEqual(70);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    if (route !== "/nikke/tier-list" && route !== "/dragon-traveler/tier-list") {
      expect(structuredData.length).toBeGreaterThan(0);
      for (const value of structuredData) expect(() => JSON.parse(value)).not.toThrow();
    }

    const imageProblems = await page.locator("img").evaluateAll((images) =>
      images.flatMap((image) => {
        const width = Number(image.getAttribute("width"));
        const height = Number(image.getAttribute("height"));
        if (width > 0 && height > 0) return [];
        const parent = image.parentElement;
        const isFillLayout =
          (image.getAttribute("data-nimg") === "fill" ||
            getComputedStyle(image).position === "absolute") &&
          parent &&
          getComputedStyle(parent).position !== "static" &&
          parent.getBoundingClientRect().height > 0;
        if (isFillLayout) {
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

    let measuredWowSpec = false;
    if (route.startsWith("/wow-forever/tier-list")) {
      const card = page.locator("[data-spec-id]").first();
      if (await card.count()) {
        await card.click();
        measuredWowSpec = true;
        await page.getByRole("tab", { name: "Performance", exact: true }).click();
        if (await page.getByRole("dialog").count()) await page.keyboard.press("Escape");
        await page.waitForTimeout(100);
      }
    }

    const firstLink = page.locator('a[href^="/"]').first();
    if (
      route !== "/genshin-impact/tier-list" &&
      !measuredWowSpec &&
      (await firstLink.count()) > 0
    ) {
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

const coreImageRoutes = [
  "/wow-forever/tier-list",
  "/genshin-impact/tier-list",
  "/wild-rift/tier-list",
] as const;

for (const route of coreImageRoutes) {
  for (const width of [390, 768, 1440, 1920]) {
    test(`${route} image browser matrix stays healthy at ${width}px`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(() => {
        window.__cwv = { cls: 0, inp: 0, lcp: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!shift.hadRecentInput) window.__cwv!.cls += shift.value ?? 0;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });

      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      await page.waitForTimeout(100);

      const metrics = await page.evaluate(() => ({
        brokenImages: [...document.images]
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
        overflow: document.documentElement.scrollWidth > innerWidth,
        cls: window.__cwv?.cls ?? 0,
      }));

      expect(metrics.brokenImages).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(metrics.overflow).toBe(false);
      expect(metrics.cls).toBeLessThanOrEqual(0.1);
    });
  }
}

for (const width of [390, 1440]) {
  test(`Anime Expeditions image health stays clean at ${width}px`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      window.__cwv = { cls: 0, inp: 0, lcp: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) window.__cwv!.cls += shift.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    const response = await page.goto("/anime-expeditions/tier-list", {
      waitUntil: "networkidle",
    });
    expect(response?.status()).toBe(200);
    await page.waitForTimeout(100);

    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const animeImages = resources.filter((resource) =>
        decodeURIComponent(resource.name).includes("/images/anime-expeditions/"),
      );
      return {
        brokenImages: [...document.images]
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
        overflow: document.documentElement.scrollWidth > innerWidth,
        cls: window.__cwv?.cls ?? 0,
        giantImages: animeImages
          .filter((image) => Math.max(image.encodedBodySize, image.transferSize) > 500_000)
          .map((image) => ({ name: image.name, bytes: image.encodedBodySize })),
        directLargeImages: animeImages
          .filter((image) => {
            const url = new URL(image.name);
            return (
              url.pathname.startsWith("/images/anime-expeditions/") &&
              Math.max(image.encodedBodySize, image.transferSize) > 150_000
            );
          })
          .map((image) => ({ name: image.name, bytes: image.encodedBodySize })),
      };
    });

    expect(metrics.brokenImages).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(metrics.overflow).toBe(false);
    expect(metrics.cls).toBeLessThanOrEqual(0.1);
    expect(metrics.giantImages).toEqual([]);
    expect(metrics.directLargeImages).toEqual([]);
  });
}

test("Core image network benchmark @1440 DPR2", async ({ browser }) => {
  const results = [];

  for (const route of coreImageRoutes) {
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:3000",
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);

    await page.evaluate(async () => {
      const step = 700;
      for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
        scrollTo(0, top);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(100);

    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const images = resources.filter((resource) => {
        const url = new URL(resource.name);
        return (
          resource.initiatorType === "img" ||
          url.pathname === "/_next/image" ||
          /\.(?:avif|webp|png|jpe?g)$/i.test(url.pathname)
        );
      });
      return {
        route: location.pathname,
        imageRequestCount: images.length,
        imageTransferredBytes: images.reduce((sum, image) => sum + image.transferSize, 0),
        largestImageResponse: images.reduce(
          (largest, image) => Math.max(largest, image.transferSize),
          0,
        ),
      };
    });

    results.push(metrics);
    await context.close();
  }

  await test.info().attach("core-image-network-1440-dpr2", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });

  expect(results).toHaveLength(3);
  for (const result of results) expect(result.imageRequestCount).toBeGreaterThan(0);
});

for (const width of [390, 768, 1440]) {
  test(`Phantom Blade Zero P0 images stay within budgets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      window.__cwv = { cls: 0, inp: 0, lcp: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) window.__cwv!.cls += shift.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) window.__cwv!.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });

    const response = await page.goto("/phantom-blade-zero/tier-list", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await page.waitForTimeout(100);

    const metrics = await page.evaluate(() => {
      const imageResources = (
        performance.getEntriesByType("resource") as PerformanceResourceTiming[]
      ).filter((resource) => resource.initiatorType === "img");
      const p0Images = imageResources.filter((resource) =>
        decodeURIComponent(resource.name).includes("/images/phantom-blade-zero/"),
      );
      return {
        cls: window.__cwv?.cls ?? 0,
        lcp: window.__cwv?.lcp ?? 0,
        imageRequests: p0Images.length,
        imageBytes: p0Images.reduce((sum, image) => sum + image.encodedBodySize, 0),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });

    await test.info().attach(`phantom-blade-zero-image-performance-${width}px`, {
      body: JSON.stringify(metrics, null, 2),
      contentType: "application/json",
    });

    expect(metrics.cls).toBeLessThanOrEqual(0.1);
    expect(metrics.lcp).toBeGreaterThan(0);
    expect(metrics.lcp).toBeLessThanOrEqual(2500);
    expect(metrics.overflow).toBe(false);
    expect(metrics.imageRequests).toBeGreaterThanOrEqual(1);
    expect(metrics.imageRequests).toBeLessThan(22);
    expect(metrics.imageBytes).toBeLessThanOrEqual(500_000);
  });
}

for (const width of [390, 768, 1440, 1920]) {
  test(`WoW Hero at ${width}px uses responsive Next Image while tiny spec icons stay direct`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/wow-forever/tier-list", { waitUntil: "networkidle" });

    const hero = page.locator("[data-wow-hero] img").first();
    await expect(hero).toBeVisible();
    await expect(hero).toHaveJSProperty("complete", true);
    await expect(hero).toHaveAttribute(
      "sizes",
      "(max-width: 767px) 640px, (max-width: 1640px) calc(100vw - 48px), 1592px",
    );

    const heroSample = await hero.evaluate((element) => {
      const image = element as HTMLImageElement;
      return {
        currentSrc: image.currentSrc,
        renderedWidth: image.getBoundingClientRect().width,
        dpr: devicePixelRatio,
      };
    });
    const heroUrl = new URL(heroSample.currentSrc);
    expect(heroUrl.pathname).toBe("/_next/image");
    expect(heroUrl.searchParams.get("q")).toBe("85");
    expect(decodeURIComponent(heroUrl.searchParams.get("url") ?? "")).toMatch(
      /hero-3b7bb10711.*\.webp$/,
    );
    const heroCandidateWidth = Number(heroUrl.searchParams.get("w"));
    expect(heroCandidateWidth).toBeLessThanOrEqual(3840);

    const heroResponse = await request.get(heroSample.currentSrc, {
      headers: browserImageHeaders,
    });
    expect(heroResponse.status()).toBe(200);
    const heroBytes = (await heroResponse.body()).length;
    expect(heroBytes).toBeLessThan(260_000);
    if (width <= 390) expect(heroBytes).toBeLessThan(125_000);
    else if (width <= 768) expect(heroBytes).toBeLessThan(220_000);

    const specIcon = page.locator("[data-spec-id] img").first();
    await expect(specIcon).toBeVisible();
    await expect(specIcon).toHaveAttribute("loading", "lazy");
    const specCurrentSrc = await specIcon.evaluate(
      (element) => (element as HTMLImageElement).currentSrc,
    );
    expect(new URL(specCurrentSrc).pathname).not.toBe("/_next/image");
    expect(specCurrentSrc).toContain(".webp");
    const specResponse = await request.get(specCurrentSrc);
    expect(specResponse.status()).toBe(200);
    expect((await specResponse.body()).length).toBeLessThan(10_000);
  });
}

for (const width of [390, 768, 1440, 1920]) {
  test(`WoW Hero cover geometry stays sharp at ${width}px DPR2`, async ({ browser, request }) => {
    test.skip(test.info().project.name !== "desktop", "Run the controlled DPR2 contract once.");

    const consoleErrors: string[] = [];
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:3000",
      viewport: { width, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    try {
      await page.addInitScript(() => {
        window.__cwv = { cls: 0, inp: 0, lcp: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!shift.hadRecentInput) window.__cwv!.cls += shift.value ?? 0;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });

      const response = await page.goto("/wow-forever/tier-list", { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      await page.waitForTimeout(100);

      const hero = page.locator("[data-wow-hero] img").first();
      await expect(hero).toBeVisible();
      await expect(hero).toHaveJSProperty("complete", true);
      const sample = await hero.evaluate(async (element) => {
        const image = element as HTMLImageElement;
        const rect = image.getBoundingClientRect();
        const decoded = new Image();
        decoded.src = image.currentSrc;
        await decoded.decode();
        return {
          currentSrc: image.currentSrc,
          renderedWidth: rect.width,
          renderedHeight: rect.height,
          decodedWidth: decoded.naturalWidth,
          decodedHeight: decoded.naturalHeight,
          dpr: devicePixelRatio,
          brokenImages: [...document.images]
            .filter((candidate) => candidate.complete && candidate.naturalWidth === 0)
            .map((candidate) => candidate.currentSrc || candidate.src),
          overflow: document.documentElement.scrollWidth > innerWidth,
          cls: window.__cwv?.cls ?? 0,
        };
      });

      const candidateUrl = new URL(sample.currentSrc);
      const candidateWidth = Number(candidateUrl.searchParams.get("w"));
      const sourceAspectRatio = WOW_HERO_SOURCE.width / WOW_HERO_SOURCE.height;
      const requiredWidth = requiredCoverCssWidth(
        sample.renderedWidth,
        sample.renderedHeight,
        sourceAspectRatio,
      );
      const heroResponse = await request.get(sample.currentSrc, { headers: browserImageHeaders });
      expect(heroResponse.status()).toBe(200);
      const bytes = (await heroResponse.body()).length;

      const evidence = {
        viewport: width,
        renderedWidth: sample.renderedWidth,
        renderedHeight: sample.renderedHeight,
        sourceAspectRatio,
        requiredCoverCssWidth: requiredWidth,
        currentSrc: sample.currentSrc,
        candidateWidth,
        decodedWidth: sample.decodedWidth,
        decodedHeight: sample.decodedHeight,
        responseBytes: bytes,
        quality: candidateUrl.searchParams.get("q"),
        dpr: sample.dpr,
      };
      console.log("WOW_HERO_COVER_EVIDENCE", JSON.stringify(evidence));
      await test.info().attach(`wow-hero-cover-${width}px-dpr2`, {
        body: JSON.stringify(evidence, null, 2),
        contentType: "application/json",
      });

      expect(candidateUrl.pathname).toBe("/_next/image");
      expect(candidateUrl.searchParams.get("q")).toBe("85");
      expect(candidateWidth).toBeGreaterThanOrEqual(Math.ceil(requiredWidth));
      expect(sample.decodedWidth).toBeGreaterThanOrEqual(Math.ceil(requiredWidth));
      expect(sample.decodedHeight).toBeGreaterThanOrEqual(Math.ceil(sample.renderedHeight));
      expect(bytes).toBeLessThan(260_000);
      if (width === 390) expect(bytes).toBeLessThan(WOW_HERO_SOURCE.directBytes);
      expect(sample.brokenImages).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(sample.overflow).toBe(false);
      expect(sample.cls).toBeLessThanOrEqual(0.1);
    } finally {
      await context.close();
    }
  });
}

test("Wild Rift Hero reuses one direct WebP across header and Tier Board", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto("/wild-rift/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  const hero = page.locator('[data-ia-section="hero"] img').first();
  await expect(hero).toBeVisible();
  await expect(hero).toHaveJSProperty("complete", true);
  const currentSrc = await hero.evaluate((element) => (element as HTMLImageElement).currentSrc);
  expect(new URL(currentSrc).pathname).toBe("/images/wild-rift/hero.webp");

  const sourceResponse = await request.get(currentSrc);
  expect(sourceResponse.status()).toBe(200);
  expect(sourceResponse.headers()["content-type"]).toContain("image/webp");
  expect((await sourceResponse.body()).length).toBeLessThan(60_000);

  const heroResources = () =>
    page.evaluate(() =>
      (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
        .filter((entry) => decodeURIComponent(entry.name).includes("/images/wild-rift/hero.webp"))
        .map((entry) => ({
          url: entry.name,
          transferSize: entry.transferSize,
        })),
    );

  const before = await heroResources();
  const beforeBytes = before.reduce((sum, entry) => sum + entry.transferSize, 0);

  await page.getByRole("tab", { name: /^Jungle$/ }).click();
  await expect(page.locator('[data-ia-section="role-tier-workspace"]')).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(100);

  const after = await heroResources();
  const afterBytes = after.reduce((sum, entry) => sum + entry.transferSize, 0);
  expect(after.length).toBeGreaterThanOrEqual(1);
  expect(
    after.every((entry) => new URL(entry.url).pathname === "/images/wild-rift/hero.webp"),
  ).toBe(true);
  expect(new Set(after.map((entry) => entry.url)).size).toBe(1);
  expect(afterBytes).toBeLessThanOrEqual(60_000);
  expect(afterBytes - beforeBytes).toBe(0);
});

test("Wild Rift Champion portraits stay on Next Image without direct PNG requests", async ({
  page,
}) => {
  const directChampionPngRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/images/wild-rift/champions/") && url.pathname.endsWith(".png")) {
      directChampionPngRequests.push(request.url());
    }
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto("/wild-rift/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  const samples: { name: string; currentSrc: string }[] = [];
  const assertOptimizedPortrait = async (name: string, image: ReturnType<typeof page.locator>) => {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect(image).toHaveJSProperty("complete", true);
    const currentSrc = await image.evaluate((element) => (element as HTMLImageElement).currentSrc);
    expect(new URL(currentSrc).pathname).toBe("/_next/image");
    samples.push({ name, currentSrc });
  };

  await assertOptimizedPortrait(
    "small",
    page.locator('[data-ia-section="all-roles-overview"] img').first(),
  );

  await page.getByRole("tab", { name: /^Jungle$/ }).click();
  await expect(page.locator('[data-ia-section="role-tier-workspace"]')).toBeVisible();
  const nocturne = page.locator('[data-champion-id="nocturne"]');
  await assertOptimizedPortrait("card", nocturne.locator("img").first());

  await nocturne.click();
  const detail = page.getByRole("complementary", { name: "Champion Detail" });
  await assertOptimizedPortrait("detail", detail.locator("img").first());

  await test.info().attach("wild-rift-champion-image-evidence", {
    body: JSON.stringify(samples, null, 2),
    contentType: "application/json",
  });

  expect(directChampionPngRequests).toEqual([]);
});

for (const width of [390, 768, 1440, 1920]) {
  test(`Genshin image candidates at ${width}px match DPR without avatar preloads`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/genshin-impact/tier-list", { waitUntil: "networkidle" });
    const preloads = page.locator('link[rel="preload"][as="image"]');
    await expect(preloads).toHaveCount(1);
    const heroPreload = preloads.first();
    const preloadTarget = [
      (await heroPreload.getAttribute("href")) ?? "",
      (await heroPreload.getAttribute("imagesrcset")) ?? "",
    ].join(" ");
    expect(decodeURIComponent(preloadTarget)).toContain("hero-f958fb67df");
    expect(preloadTarget).toContain("/_next/image?");
    await expect(
      page.locator('head link[rel="preload"][imagesrcset*="/images/home/hero-"]'),
    ).toHaveCount(0);
    const homeHeroTimings = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((url) => url.includes("/images/home/hero-")),
    );
    expect(homeHeroTimings).toEqual([]);
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
      const response = await request.get(sample.currentSrc, {
        headers: browserImageHeaders,
      });
      expect(response.status()).toBe(200);
      const bytes = (await response.body()).length;
      expect(bytes).toBeLessThan(name === "hero" ? 280_000 : 50_000);
      const candidateUrl = new URL(sample.currentSrc);
      const candidateWidth = Number(candidateUrl.searchParams.get("w"));
      if (name === "hero") {
        expect(candidateUrl.searchParams.get("q")).toBe("90");
        expect(
          decodeURIComponent(new URL(sample.currentSrc).searchParams.get("url") ?? ""),
        ).toMatch(/hero-f958fb67df.*\.webp$/);
        expect(candidateWidth).toBeLessThanOrEqual(3840);
      } else {
        await expect(image).toHaveAttribute("loading", "lazy");
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

for (const width of [390, 768, 1440, 1920]) {
  test(`Genshin Hero cover geometry stays sharp at ${width}px DPR2`, async ({
    browser,
    request,
  }) => {
    test.skip(test.info().project.name !== "desktop", "Run the controlled DPR2 contract once.");

    const consoleErrors: string[] = [];
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:3000",
      viewport: { width, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    try {
      await page.addInitScript(() => {
        window.__cwv = { cls: 0, inp: 0, lcp: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!shift.hadRecentInput) window.__cwv!.cls += shift.value ?? 0;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });

      const response = await page.goto("/genshin-impact/tier-list", { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      await page.waitForTimeout(100);

      const hero = page.locator('[data-ia-section="page-header"] img').first();
      await expect(hero).toBeVisible();
      await expect(hero).toHaveJSProperty("complete", true);
      const sample = await hero.evaluate(async (element) => {
        const image = element as HTMLImageElement;
        const rect = image.getBoundingClientRect();
        const decoded = new Image();
        decoded.src = image.currentSrc;
        await decoded.decode();
        return {
          currentSrc: image.currentSrc,
          renderedWidth: rect.width,
          renderedHeight: rect.height,
          decodedWidth: decoded.naturalWidth,
          decodedHeight: decoded.naturalHeight,
          dpr: devicePixelRatio,
          brokenImages: [...document.images]
            .filter((candidate) => candidate.complete && candidate.naturalWidth === 0)
            .map((candidate) => candidate.currentSrc || candidate.src),
          overflow: document.documentElement.scrollWidth > innerWidth,
          cls: window.__cwv?.cls ?? 0,
        };
      });

      const candidateUrl = new URL(sample.currentSrc);
      const candidateWidth = Number(candidateUrl.searchParams.get("w"));
      const sourceAspectRatio = GENSHIN_HERO_SOURCE.width / GENSHIN_HERO_SOURCE.height;
      const requiredWidth = requiredCoverCssWidth(
        sample.renderedWidth,
        sample.renderedHeight,
        sourceAspectRatio,
      );
      const heroResponse = await request.get(sample.currentSrc, { headers: browserImageHeaders });
      expect(heroResponse.status()).toBe(200);
      const bytes = (await heroResponse.body()).length;

      const evidence = {
        viewport: width,
        renderedWidth: sample.renderedWidth,
        renderedHeight: sample.renderedHeight,
        sourceAspectRatio,
        requiredCoverCssWidth: requiredWidth,
        currentSrc: sample.currentSrc,
        candidateWidth,
        decodedWidth: sample.decodedWidth,
        decodedHeight: sample.decodedHeight,
        responseBytes: bytes,
        quality: candidateUrl.searchParams.get("q"),
        dpr: sample.dpr,
      };
      console.log("GENSHIN_HERO_COVER_EVIDENCE", JSON.stringify(evidence));
      await test.info().attach(`genshin-hero-cover-${width}px-dpr2`, {
        body: JSON.stringify(evidence, null, 2),
        contentType: "application/json",
      });

      expect(candidateUrl.pathname).toBe("/_next/image");
      expect(candidateUrl.searchParams.get("q")).toBe("90");
      expect(candidateWidth).toBeGreaterThanOrEqual(Math.ceil(requiredWidth));
      expect(sample.decodedWidth).toBeGreaterThanOrEqual(Math.ceil(requiredWidth));
      expect(sample.decodedHeight).toBeGreaterThanOrEqual(Math.ceil(sample.renderedHeight));
      expect(bytes).toBeLessThan(280_000);
      if (width === 390) expect(bytes).toBeLessThan(GENSHIN_HERO_SOURCE.directBytes);
      expect(sample.brokenImages).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(sample.overflow).toBe(false);
      expect(sample.cls).toBeLessThanOrEqual(0.1);
    } finally {
      await context.close();
    }
  });
}

for (const width of [390, 768, 1024, 1440, 1920, 2560]) {
  test(`Homepage image candidates at ${width}px deliver direct static WebP within responsive size budgets`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    const preloads = page.locator('link[rel="preload"][as="image"]');
    await expect(preloads).toHaveCount(1);
    await expect(preloads).toHaveAttribute("imagesrcset", /hero-768\.webp/);
    await expect(preloads).toHaveAttribute("fetchpriority", "high");

    const samples = [];
    for (const [name, selector] of [
      ["hero", ".tlb-hero-art img"],
      ["wow", ".tlb-game-grid .tlb-wow .tlb-card-image img"],
      ["genshin", ".tlb-game-grid .tlb-genshin .tlb-card-image img"],
    ] as const) {
      const image = page.locator(selector).first();
      await expect(image).toBeVisible();
      await expect(image).toHaveJSProperty("complete", true);

      const sample = await image.evaluate((element) => {
        const image = element as HTMLImageElement;
        const timing = (
          performance.getEntriesByType("resource") as PerformanceResourceTiming[]
        ).find((entry) => entry.name === image.currentSrc);
        return {
          currentSrc: image.currentSrc,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          renderedWidth: Math.round(image.getBoundingClientRect().width),
          renderedHeight: Math.round(image.getBoundingClientRect().height),
          encodedBodySize: timing?.encodedBodySize ?? null,
          dpr: devicePixelRatio,
        };
      });

      expect(sample.naturalWidth).toBeGreaterThan(0);
      expect(sample.renderedWidth).toBeGreaterThan(0);
      expect(sample.currentSrc).not.toContain("/_next/image?");
      expect(sample.currentSrc).toContain(".webp");

      const response = await request.get(sample.currentSrc);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/webp");
      const bytes = (await response.body()).length;

      if (name === "hero") {
        await expect(image).toHaveAttribute("loading", "eager");
        await expect(image).toHaveAttribute("fetchpriority", "high");
        if (width <= 768) {
          // Mobile & tablet must never download the 2172px 484KB original image
          expect(sample.naturalWidth).toBeLessThan(2172);
          expect(bytes).toBeLessThan(sample.dpr > 1 ? 250_000 : 90_000);
        }
      } else {
        await expect(image).toHaveAttribute("loading", "lazy");
        await expect(image).not.toHaveAttribute("fetchpriority", "high");
        if (width <= 768) {
          // Mobile & tablet must never download original 372KB/291KB card images
          const originalWidth = name === "wow" ? 2048 : 1774;
          expect(sample.naturalWidth).toBeLessThan(originalWidth);
          expect(bytes).toBeLessThan(sample.dpr > 1 ? 160_000 : 95_000);
        }
      }

      samples.push({ name, ...sample, responseBodyBytes: bytes });
    }

    await test.info().attach(`homepage-image-evidence-${width}px`, {
      body: JSON.stringify(samples, null, 2),
      contentType: "application/json",
    });
  });
}
