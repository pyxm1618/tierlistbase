import sharp from "sharp";
import { expect, test, type Locator, type Page } from "@playwright/test";

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

async function loadedImage(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible();
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const image = element as HTMLImageElement;
        return image.complete && image.naturalWidth > 0;
      }),
    )
    .toBe(true);
  return locator.evaluate((element) => {
    const image = element as HTMLImageElement;
    const timing = (
      performance.getEntriesByType("resource") as PerformanceResourceTiming[]
    ).find((entry) => entry.name === image.currentSrc);
    const url = new URL(image.currentSrc);
    return {
      currentSrc: image.currentSrc,
      sizes: image.getAttribute("sizes"),
      loading: image.loading,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedWidth: Math.round(image.getBoundingClientRect().width),
      renderedHeight: Math.round(image.getBoundingClientRect().height),
      candidateWidth: Number(url.searchParams.get("w")) || null,
      encodedBodySize: timing?.encodedBodySize ?? null,
      transferSize: timing?.transferSize ?? null,
      dpr: devicePixelRatio,
    };
  });
}

async function fidelity(page: Page, currentSrc: string) {
  const optimizedUrl = new URL(currentSrc);
  if (optimizedUrl.pathname !== "/_next/image") return null;
  const sourcePath = optimizedUrl.searchParams.get("url");
  if (!sourcePath) return null;

  const headers = {
    accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  };
  const [sourceResponse, optimizedResponse] = await Promise.all([
    page.request.get(new URL(sourcePath, page.url()).toString()),
    page.request.get(currentSrc, { headers }),
  ]);
  expect(sourceResponse.status()).toBe(200);
  expect(optimizedResponse.status()).toBe(200);

  const sourceBuffer = await sourceResponse.body();
  const optimizedBuffer = await optimizedResponse.body();
  const optimizedMetadata = await sharp(optimizedBuffer).metadata();
  expect(optimizedMetadata.width).toBeGreaterThan(0);
  expect(optimizedMetadata.height).toBeGreaterThan(0);

  const width = optimizedMetadata.width!;
  const height = optimizedMetadata.height!;
  const reference = await sharp(sourceBuffer)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer();
  const candidate = await sharp(optimizedBuffer)
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer();

  expect(candidate.length).toBe(reference.length);
  let squaredError = 0;
  for (let index = 0; index < reference.length; index += 1) {
    const delta = reference[index]! - candidate[index]!;
    squaredError += delta * delta;
  }
  const mse = squaredError / reference.length;
  const psnr = mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse);
  return {
    width,
    height,
    bytes: optimizedBuffer.length,
    contentType: optimizedResponse.headers()["content-type"] ?? "",
    psnr,
  };
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
      if (
        message.type() === "error" &&
        /(image|img|_next\/image|\.png|\.webp)/i.test(message.text())
      ) {
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
          const shift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
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
            entry.initiatorType === "css" ||
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
      (current, entry) =>
        entry.transferSize > current.transferSize ? entry : current,
      { url: "", initiatorType: "", encodedBodySize: 0, transferSize: 0 },
    );

    const details: Record<string, unknown> = {};
    if (label === "WoW") {
      const hero = await loadedImage(page.locator("[data-wow-hero] img"));
      details.hero = hero;
      details.heroFidelity = await fidelity(page, hero.currentSrc);
      details.specIcon = await loadedImage(
        page.locator("[data-spec-id] img").first(),
      );
      details.preloads = await page
        .locator('link[rel="preload"][as="image"]')
        .evaluateAll((links) =>
          links.map((link) => ({
            href: link.getAttribute("href"),
            imageSrcSet: link.getAttribute("imagesrcset"),
            imageSizes: link.getAttribute("imagesizes"),
          })),
        );
    }

    if (label === "Genshin") {
      const hero = await loadedImage(
        page.locator('[data-ia-section="page-header"] img'),
      );
      details.hero = hero;
      details.heroFidelity = await fidelity(page, hero.currentSrc);
      details.preloads = await page
        .locator('link[rel="preload"][as="image"]')
        .evaluateAll((links) =>
          links.map((link) => ({
            href: link.getAttribute("href"),
            imageSrcSet: link.getAttribute("imagesrcset"),
            imageSizes: link.getAttribute("imagesizes"),
          })),
        );

      const search = page.getByRole("searchbox", { name: "Search characters" });
      await search.fill("Nahida");
      const nahida = page.getByRole("button", { name: /Nahida, Dendro/ });
      await expect(nahida).toBeVisible();
      details.remoteBoardAvatar = await loadedImage(
        nahida.locator('[data-avatar="board"] img'),
      );
      await nahida.click();
      details.remoteDetailAvatar = await loadedImage(
        page
          .locator('[data-ia-section="character-detail"] [data-avatar="detail"] img')
          .filter({ visible: true })
          .first(),
      );
    }

    if (label === "WildRift") {
      details.hero = await loadedImage(
        page.locator('[data-ia-section="hero"] img').first(),
      );
      const heroResources = resources.filter((entry) =>
        decodeURIComponent(entry.url).includes("/images/wild-rift/hero.webp"),
      );
      details.heroResources = heroResources;
      details.rawHeroTransfers = heroResources.filter(
        (entry) => new URL(entry.url).pathname === "/images/wild-rift/hero.webp",
      ).length;
      details.smallPortrait = await loadedImage(
        page.locator('[data-ia-section="all-roles-overview"] img').first(),
      );
      const card = page.locator("[data-champion-id]").first();
      details.cardPortrait = await loadedImage(card.locator("img"));
      await card.click();
      const detailRoot =
        width <= 700
          ? page.getByRole("dialog").filter({ visible: true }).first()
          : page
              .getByRole("complementary", { name: "Champion Detail" })
              .filter({ visible: true })
              .first();
      details.detailPortrait = await loadedImage(detailRoot.locator("img").first());
    }

    const result = {
      event: "P2P3_IMAGE_FINAL_PROBE",
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
      imageTransferredBytes: resources.reduce(
        (sum, entry) => sum + entry.transferSize,
        0,
      ),
      largestImageResponseBytes: largest.transferSize,
      largestImageResponseUrl: largest.url,
      details,
    };
    console.log(`P2P3_IMAGE_FINAL_PROBE ${JSON.stringify(result)}`);

    expect(httpStatus).toBe(200);
    expect(health.broken).toBe(0);
    expect(imageConsoleErrors).toEqual([]);
    expect(horizontalOverflow).toBe(0);
    expect(cls).toBeLessThanOrEqual(0.1);
    expect(imageResponses.filter((item) => item.status >= 400)).toEqual([]);

    if (label === "WoW" || label === "Genshin") {
      const hero = details.hero as Awaited<ReturnType<typeof loadedImage>>;
      expect(new URL(hero.currentSrc).pathname).toBe("/_next/image");
      const quality = details.heroFidelity as Awaited<ReturnType<typeof fidelity>>;
      expect(quality?.psnr ?? 0).toBeGreaterThanOrEqual(30);
    }
    if (label === "WildRift") {
      expect(details.rawHeroTransfers).toBe(0);
      for (const key of ["smallPortrait", "cardPortrait", "detailPortrait"]) {
        const portrait = details[key] as Awaited<ReturnType<typeof loadedImage>>;
        expect(new URL(portrait.currentSrc).pathname).toBe("/_next/image");
      }
    }

    page.off("response", onResponse);
    page.off("console", onConsole);
  }

  await session.detach();
}

for (const route of coreRoutes) {
  test(`${route.label} P2 P3 final matrix`, async ({ page }) => {
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
