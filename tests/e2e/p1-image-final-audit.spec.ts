import { expect, test, type Locator, type Page } from "@playwright/test";

const viewports = [390, 768, 1440, 1920] as const;
const clsBudget = 0.1;
const benchmarkBudgets = {
  Limbus: 2_500_000,
  Dragon: 1_000_000,
  Slay: 3_000_000,
} as const;

type RouteLabel = keyof typeof benchmarkBudgets;
type ImageResponse = { url: string; status: number };
type KeySource = { currentSrc: string; status: number };

test.use({ deviceScaleFactor: 2 });

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(innerHeight - 140, 360);
    let y = 0;
    while (y < document.body.scrollHeight) {
      scrollTo(0, y);
      await sleep(35);
      y += step;
    }
    scrollTo(0, document.body.scrollHeight);
    await sleep(180);
    scrollTo(0, 0);
    await sleep(180);
  });
  await page.waitForTimeout(500);
}

async function loadedCurrentSrc(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await expect
    .poll(
      () =>
        locator.evaluate((element) => {
          const image = element as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      { timeout: 30_000 },
    )
    .toBe(true);
  return locator.evaluate((element) => (element as HTMLImageElement).currentSrc);
}

function responseStatus(currentSrc: string, responses: ImageResponse[]) {
  return responses.find((response) => response.url === currentSrc)?.status ?? 0;
}

async function optimizedImage(locator: Locator, responses: ImageResponse[]): Promise<KeySource> {
  const currentSrc = await loadedCurrentSrc(locator);
  expect(new URL(currentSrc).pathname).toBe("/_next/image");
  const status = responseStatus(currentSrc, responses);
  expect(status).toBe(200);
  return { currentSrc, status };
}

async function directWebp(locator: Locator, responses: ImageResponse[]): Promise<KeySource> {
  const currentSrc = await loadedCurrentSrc(locator);
  const url = new URL(currentSrc);
  expect(url.pathname).not.toBe("/_next/image");
  expect(url.pathname).toMatch(/\.webp$/);
  const status = responseStatus(currentSrc, responses);
  expect(status).toBe(200);
  return { currentSrc, status };
}

async function imageHealth(page: Page) {
  return page.locator("main img").evaluateAll((images) => ({
    total: images.length,
    loaded: images.filter((image) => {
      const img = image as HTMLImageElement;
      return img.complete && img.naturalWidth > 0;
    }).length,
    broken: images.filter((image) => {
      const img = image as HTMLImageElement;
      return img.complete && img.naturalWidth === 0;
    }).length,
  }));
}

async function exerciseRoute(
  label: RouteLabel,
  page: Page,
  responses: ImageResponse[],
): Promise<{
  keySources: Record<string, KeySource>;
  brokenImages: number;
  staleLimbusPngRequests: number;
}> {
  const keySources: Record<string, KeySource> = {};
  let brokenImages = 0;
  let staleLimbusPngRequests = 0;

  if (label === "Limbus") {
    const identity = page.locator("#identity-tier-list tbody tr td:nth-child(3) img").first();
    const ego = page.locator("#ego-tier-list tbody tr td:nth-child(3) img").first();
    keySources.identity = await optimizedImage(identity, responses);
    keySources.ego = await optimizedImage(ego, responses);

    const tableSources = await page
      .locator(
        "#identity-tier-list tbody tr td:nth-child(3) img, #ego-tier-list tbody tr td:nth-child(3) img",
      )
      .evaluateAll((images) =>
        images.map((element) => {
          const image = element as HTMLImageElement;
          return image.currentSrc || image.src;
        }),
      );
    expect(tableSources).toHaveLength(306);
    staleLimbusPngRequests = tableSources.filter((currentSrc) => {
      const url = new URL(currentSrc);
      if (url.pathname !== "/_next/image") return true;
      return !/\.webp(?:$|\?)/i.test(url.searchParams.get("url") ?? "");
    }).length;
    expect(staleLimbusPngRequests).toBe(0);

    brokenImages += (await imageHealth(page)).broken;
  }

  if (label === "Dragon") {
    keySources.portrait = await optimizedImage(
      page.getByTestId("luminary-card").first().locator('img[class*="_portrait"]').first(),
      responses,
    );
    keySources.detail = await optimizedImage(
      page.getByTestId("character-detail").locator('img[class*="detailPortrait"]').first(),
      responses,
    );
    keySources.hero = await directWebp(page.locator('img[class*="heroArt"]').first(), responses);
    keySources.tinyIcon = await directWebp(page.locator('main img[width="14"]').first(), responses);
    brokenImages += (await imageHealth(page)).broken;
  }

  if (label === "Slay") {
    keySources.card = await optimizedImage(page.locator("[data-card-id] img").first(), responses);
    keySources.cardDetail = await optimizedImage(
      page.locator("[data-card-detail] img").first(),
      responses,
    );
    brokenImages += (await imageHealth(page)).broken;

    const tabs = page.getByRole("tablist", { name: "Slay the Spire 2 ranking systems" });

    await tabs.getByRole("tab", { name: /^Relics/ }).click();
    keySources.relic = await optimizedImage(page.locator("[data-relic-tier] img").first(), responses);
    brokenImages += (await imageHealth(page)).broken;

    await tabs.getByRole("tab", { name: /^Characters/ }).click();
    keySources.character = await optimizedImage(
      page.locator("[data-character-id] img").first(),
      responses,
    );
    brokenImages += (await imageHealth(page)).broken;

    await tabs.getByRole("tab", { name: /^Potions/ }).click();
    keySources.potion = await optimizedImage(
      page.locator("[data-potion-tier] img").first(),
      responses,
    );
    brokenImages += (await imageHealth(page)).broken;
  }

  return { keySources, brokenImages, staleLimbusPngRequests };
}

const routes = [
  { label: "Limbus" as const, path: "/limbus-company/tier-list" },
  { label: "Dragon" as const, path: "/dragon-traveler/tier-list" },
  { label: "Slay" as const, path: "/slay-the-spire-2/tier-list" },
];

for (const route of routes) {
  test(`${route.label} P1 final browser and network audit`, async ({ page }) => {
    test.setTimeout(600_000);

    await page.addInitScript(() => {
      performance.setResourceTimingBufferSize(5_000);
      const state = window as Window & { __p1ImageAuditCls?: number };
      state.__p1ImageAuditCls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) state.__p1ImageAuditCls! += shift.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    const session = await page.context().newCDPSession(page);
    await session.send("Network.enable");
    await session.send("Network.setCacheDisabled", { cacheDisabled: true });

    for (const width of viewports) {
      await session.send("Network.clearBrowserCache");
      await page.setViewportSize({ width, height: 900 });

      const imageRequests: string[] = [];
      const imageResponses: ImageResponse[] = [];
      const imageConsoleErrors: string[] = [];

      const onRequest = (request: import("@playwright/test").Request) => {
        if (request.resourceType() === "image") imageRequests.push(request.url());
      };
      const onResponse = (response: import("@playwright/test").Response) => {
        if (response.request().resourceType() !== "image") return;
        imageResponses.push({ url: response.url(), status: response.status() });
      };
      const onConsole = (message: import("@playwright/test").ConsoleMessage) => {
        if (message.type() !== "error") return;
        if (/(image|img|_next\/image|\.png|\.webp|spire-codex)/i.test(message.text())) {
          imageConsoleErrors.push(message.text());
        }
      };

      page.on("request", onRequest);
      page.on("response", onResponse);
      page.on("console", onConsole);

      const response = await page.goto(route.path, { waitUntil: "load" });
      const httpStatus = response?.status() ?? 0;
      expect(httpStatus).toBe(200);
      expect(await page.evaluate(() => devicePixelRatio)).toBe(2);
      await expect(page.locator("main")).toBeVisible();

      await autoScroll(page);
      const routeEvidence = await exerciseRoute(route.label, page, imageResponses);
      await page.waitForTimeout(500);

      const network = await page.evaluate(() => {
        const entries = (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
          .filter((entry) => entry.initiatorType === "img")
          .map((entry) => ({
            url: entry.name,
            encodedBodySize: entry.encodedBodySize,
            transferSize: entry.transferSize,
          }));
        const largest = entries.reduce(
          (current, entry) =>
            entry.encodedBodySize > current.encodedBodySize ? entry : current,
          { url: "", encodedBodySize: 0, transferSize: 0 },
        );
        return {
          requestCount: entries.length,
          transferredBytes: entries.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
          largestResponseBytes: largest.encodedBodySize,
          largestResponseUrl: largest.url,
        };
      });

      const cls = await page.evaluate(
        () => (window as Window & { __p1ImageAuditCls?: number }).__p1ImageAuditCls ?? 0,
      );
      const horizontalOverflow = await page.evaluate(() =>
        Math.max(0, document.documentElement.scrollWidth - innerWidth),
      );
      const imageErrorStatuses = imageResponses.filter((item) => item.status >= 400);
      const directSpireRequests = imageRequests.filter((requestUrl) => {
        const hostname = new URL(requestUrl).hostname;
        return hostname === "spire-codex.com" || hostname === "cdn.spire-codex.com";
      });

      expect(routeEvidence.brokenImages).toBe(0);
      expect(imageConsoleErrors).toEqual([]);
      expect(horizontalOverflow).toBe(0);
      expect(cls).toBeLessThanOrEqual(clsBudget);
      expect(imageErrorStatuses).toEqual([]);
      expect(network.requestCount).toBeGreaterThan(0);
      expect(network.transferredBytes).toBeGreaterThan(0);
      expect(network.largestResponseBytes).toBeGreaterThan(0);

      if (route.label === "Slay") expect(directSpireRequests).toEqual([]);
      if (width === 1440) {
        expect(network.transferredBytes).toBeLessThanOrEqual(benchmarkBudgets[route.label]);
      }

      const result = {
        event: "P1_FINAL_IMAGE_AUDIT",
        route: route.path,
        label: route.label,
        viewportWidth: width,
        dpr: 2,
        cache: "disabled-cold",
        measurement:
          "fresh navigation; load; default page full-scroll; representative hidden image tabs exercised; encodedBodySize for browser img resources",
        httpStatus,
        brokenImageCount: routeEvidence.brokenImages,
        consoleImageErrorCount: imageConsoleErrors.length,
        horizontalOverflow,
        cls,
        clsBudget,
        imageRequestCount: network.requestCount,
        imageTransferredBytes: network.transferredBytes,
        largestImageResponseBytes: network.largestResponseBytes,
        largestImageResponseUrl: network.largestResponseUrl,
        imageErrorStatusCount: imageErrorStatuses.length,
        staleLimbusPngRequests: routeEvidence.staleLimbusPngRequests,
        directSpireImageRequests: directSpireRequests.length,
        keyCurrentSrc: routeEvidence.keySources,
        benchmarkBudgetBytes: width === 1440 ? benchmarkBudgets[route.label] : null,
      };
      console.log(`P1_FINAL_IMAGE_AUDIT ${JSON.stringify(result)}`);

      page.off("request", onRequest);
      page.off("response", onResponse);
      page.off("console", onConsole);
    }

    await session.detach();
  });
}
