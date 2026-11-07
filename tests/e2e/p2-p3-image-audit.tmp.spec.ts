import { expect, test, type Page } from "@playwright/test";

import { seedGenshinTestDatabase } from "../genshin-tier-list/database";
import { seedWowPresentationFixtures } from "../meta-board/wow-fixtures";

test.beforeAll(seedGenshinTestDatabase);
test.beforeAll(seedWowPresentationFixtures);
test.use({ deviceScaleFactor: 2 });

const coreRoutes = [
  { label: "WoW", path: "/wow-forever/tier-list" },
  { label: "Genshin", path: "/genshin-impact/tier-list" },
  { label: "WildRift", path: "/wild-rift/tier-list" },
] as const;

const healthRoutes = [
  { label: "AnimeExpeditions", path: "/anime-expeditions/tier-list" },
  { label: "PhantomBladeZero", path: "/phantom-blade-zero/tier-list" },
] as const;

const optimizerWidths = [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const;

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(innerHeight - 140, 360);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      scrollTo(0, y);
      await sleep(35);
    }
    scrollTo(0, document.body.scrollHeight);
    await sleep(180);
    scrollTo(0, 0);
    await sleep(180);
  });
  await page.waitForTimeout(350);
}

async function imageHealth(page: Page) {
  return page.locator("main img").evaluateAll((images) => ({
    total: images.length,
    broken: images.filter((image) => {
      const img = image as HTMLImageElement;
      return img.complete && img.naturalWidth === 0;
    }).length,
  }));
}

async function sampleImage(page: Page, selector: string) {
  const image = page.locator(selector).filter({ visible: true }).first();
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element) => {
        const img = element as HTMLImageElement;
        return img.complete && img.naturalWidth > 0;
      }),
    )
    .toBe(true);
  return image.evaluate((element) => {
    const img = element as HTMLImageElement;
    return {
      currentSrc: img.currentSrc,
      src: img.src,
      sizes: img.getAttribute("sizes"),
      loading: img.loading,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      renderedWidth: Math.round(img.getBoundingClientRect().width),
      renderedHeight: Math.round(img.getBoundingClientRect().height),
      dpr: devicePixelRatio,
    };
  });
}

async function optimizerBench(
  page: Page,
  directCurrentSrc: string,
  renderedWidth: number,
  dpr: number,
) {
  const source = new URL(directCurrentSrc);
  const target = Math.ceil(renderedWidth * dpr);
  const chosenWidth =
    optimizerWidths.find((width) => width >= target) ?? optimizerWidths.at(-1)!;
  const samples = [];
  for (const width of optimizerWidths) {
    const url = new URL("/_next/image", page.url());
    url.searchParams.set("url", source.pathname);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", "75");
    const response = await page.request.get(url.toString());
    samples.push({
      width,
      status: response.status(),
      bytes: (await response.body()).length,
      contentType: response.headers()["content-type"] ?? "",
    });
  }
  return {
    targetWidth: target,
    chosenWidth,
    chosen: samples.find((sample) => sample.width === chosenWidth) ?? null,
    samples,
  };
}

async function auditRoute(
  page: Page,
  label: string,
  path: string,
  widths: readonly number[],
) {
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setCacheDisabled", { cacheDisabled: true });

  for (const width of widths) {
    await session.send("Network.clearBrowserCache");
    await page.setViewportSize({ width, height: 900 });

    const imageResponses: Array<{ url: string; status: number }> = [];
    const imageConsoleErrors: string[] = [];
    const onResponse = (response: import("@playwright/test").Response) => {
      if (response.request().resourceType() === "image") {
        imageResponses.push({ url: response.url(), status: response.status() });
      }
    };
    const onConsole = (message: import("@playwright/test").ConsoleMessage) => {
      if (message.type() === "error" && /(image|img|_next\/image|\.png|\.webp)/i.test(message.text())) {
        imageConsoleErrors.push(message.text());
      }
    };

    page.on("response", onResponse);
    page.on("console", onConsole);

    await page.addInitScript(() => {
      performance.setResourceTimingBufferSize(5000);
      const state = window as Window & { __p2p3Cls?: number };
      state.__p2p3Cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) state.__p2p3Cls! += shift.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    const response = await page.goto(path, { waitUntil: "networkidle" });
    const httpStatus = response?.status() ?? 0;
    await autoScroll(page);

    const health = await imageHealth(page);
    const horizontalOverflow = await page.evaluate(
      () => Math.max(0, document.documentElement.scrollWidth - innerWidth),
    );
    const cls = await page.evaluate(
      () => (window as Window & { __p2p3Cls?: number }).__p2p3Cls ?? 0,
    );
    const resources = await page.evaluate(() =>
      (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
        .filter((entry) => {
          const name = decodeURIComponent(entry.name);
          return (
            entry.initiatorType === "img" ||
            /\.(?:png|webp|avif)(?:\?|$)/i.test(name) ||
            name.includes("/_next/image?")
          );
        })
        .map((entry) => ({
          url: entry.name,
          initiatorType: entry.initiatorType,
          encodedBodySize: entry.encodedBodySize,
          transferSize: entry.transferSize,
        })),
    );
    const largest = resources.reduce(
      (current, entry) => (entry.transferSize > current.transferSize ? entry : current),
      { url: "", initiatorType: "", encodedBodySize: 0, transferSize: 0 },
    );

    const details: Record<string, unknown> = {};
    if (label === "WoW") {
      const hero = await sampleImage(page, "[data-wow-hero] img");
      details.hero = hero;
      details.optimizer = await optimizerBench(page, hero.currentSrc, hero.renderedWidth, hero.dpr);
      const spec = page.locator("[data-spec-id] img").filter({ visible: true }).first();
      if (await spec.count()) details.specIcon = await sampleImage(page, "[data-spec-id] img");
    }
    if (label === "Genshin") {
      const hero = await sampleImage(page, '[data-ia-section="page-header"] img');
      details.hero = hero;
      details.optimizer = await optimizerBench(page, hero.currentSrc, hero.renderedWidth, hero.dpr);
      const board = page.locator('[data-avatar="board"] img').filter({ visible: true }).first();
      if (await board.count()) details.boardAvatar = await sampleImage(page, '[data-avatar="board"] img');
    }
    if (label === "WildRift") {
      details.hero = await sampleImage(page, '[data-ia-section="hero"] img');
      const heroResources = resources.filter((entry) =>
        decodeURIComponent(entry.url).includes("/images/wild-rift/hero.webp"),
      );
      details.heroResources = heroResources;
      for (const [name, selector] of [
        ["quick", '[class*="quickPickPortrait"] img'],
        ["card", '[class*="cardPortrait"] img'],
        ["detail", '[class*="detailPortrait"] img'],
      ] as const) {
        const locator = page.locator(selector).filter({ visible: true }).first();
        if (await locator.count()) details[name] = await sampleImage(page, selector);
      }
    }

    const result = {
      event: "P2P3_IMAGE_BASELINE",
      label,
      path,
      viewportWidth: width,
      dpr: 2,
      cache: "disabled-cold",
      httpStatus,
      brokenImages: health.broken,
      consoleImageErrors: imageConsoleErrors.length,
      horizontalOverflow,
      cls,
      imageRequestCount: imageResponses.length,
      imageTransferredBytes: resources.reduce((sum, entry) => sum + entry.transferSize, 0),
      largestImageResponseBytes: largest.transferSize,
      largestImageResponseUrl: largest.url,
      details,
    };
    console.log(`P2P3_IMAGE_BASELINE ${JSON.stringify(result)}`);

    expect(httpStatus).toBe(200);
    expect(health.broken).toBe(0);
    expect(imageConsoleErrors).toEqual([]);
    expect(horizontalOverflow).toBe(0);
    expect(cls).toBeLessThanOrEqual(0.1);
    expect(imageResponses.filter((item) => item.status >= 400)).toEqual([]);

    page.off("response", onResponse);
    page.off("console", onConsole);
  }

  await session.detach();
}

for (const route of coreRoutes) {
  test(`${route.label} P2 P3 baseline matrix`, async ({ page }) => {
    test.setTimeout(600000);
    await auditRoute(page, route.label, route.path, [390, 768, 1440, 1920]);
  });
}

for (const route of healthRoutes) {
  test(`${route.label} P2 P3 health review`, async ({ page }) => {
    test.setTimeout(600000);
    await auditRoute(page, route.label, route.path, [390, 1440]);
  });
}
