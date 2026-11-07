import sharp from "sharp";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { seedGenshinTestDatabase } from "../genshin-tier-list/database";
import { seedWowPresentationFixtures } from "../meta-board/wow-fixtures";

test.beforeAll(seedGenshinTestDatabase);
test.beforeAll(seedWowPresentationFixtures);
test.use({ deviceScaleFactor: 2 });

async function loadedImage(locator: Locator) {
  await expect(locator).toBeVisible({ timeout: 30_000 });
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

  return locator.evaluate((element) => {
    const image = element as HTMLImageElement;
    const url = new URL(image.currentSrc);
    const timing = (
      performance.getEntriesByType("resource") as PerformanceResourceTiming[]
    ).find((entry) => entry.name === image.currentSrc);
    return {
      currentSrc: image.currentSrc,
      source: decodeURIComponent(url.searchParams.get("url") ?? ""),
      candidateWidth: Number(url.searchParams.get("w")) || null,
      quality: url.searchParams.get("q"),
      transferSize: timing?.transferSize ?? null,
      renderedWidth: Math.round(image.getBoundingClientRect().width),
      renderedHeight: Math.round(image.getBoundingClientRect().height),
    };
  });
}

async function psnrForCurrentSrc(page: Page, currentSrc: string) {
  const optimized = new URL(currentSrc);
  const sourcePath = optimized.searchParams.get("url");
  expect(sourcePath).toBeTruthy();

  const headers = {
    accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  };
  const [sourceResponse, optimizedResponse] = await Promise.all([
    page.request.get(new URL(sourcePath!, page.url()).toString()),
    page.request.get(currentSrc, { headers }),
  ]);
  expect(sourceResponse.status()).toBe(200);
  expect(optimizedResponse.status()).toBe(200);

  const source = await sourceResponse.body();
  const candidate = await optimizedResponse.body();
  const meta = await sharp(candidate).metadata();
  expect(meta.width).toBeGreaterThan(0);
  expect(meta.height).toBeGreaterThan(0);

  const referenceRaw = await sharp(source)
    .resize(meta.width!, meta.height!, { fit: "fill" })
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer();
  const candidateRaw = await sharp(candidate)
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer();

  let squaredError = 0;
  for (let index = 0; index < referenceRaw.length; index += 1) {
    const delta = referenceRaw[index]! - candidateRaw[index]!;
    squaredError += delta * delta;
  }
  const mse = squaredError / referenceRaw.length;
  return {
    psnr: mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse),
    bytes: candidate.length,
    width: meta.width,
    height: meta.height,
    contentType: optimizedResponse.headers()["content-type"] ?? "",
  };
}

async function routeNetwork(page: Page) {
  return page.evaluate(() => {
    const images = (
      performance.getEntriesByType("resource") as PerformanceResourceTiming[]
    ).filter((entry) => {
      const url = decodeURIComponent(entry.name);
      return entry.initiatorType === "img" || url.includes("/_next/image?");
    });
    const largest = images.reduce(
      (current, entry) =>
        entry.transferSize > current.transferSize ? entry : current,
      { name: "", transferSize: 0 } as { name: string; transferSize: number },
    );
    return {
      requestCount: images.length,
      transferredBytes: images.reduce((sum, entry) => sum + entry.transferSize, 0),
      largestImageResponseBytes: largest.transferSize,
      largestImageResponseUrl: largest.name,
    };
  });
}

for (const route of [
  { label: "WoW", path: "/wow-forever/tier-list", selector: "[data-wow-hero] img" },
  {
    label: "Genshin",
    path: "/genshin-impact/tier-list",
    selector: '[data-ia-section="page-header"] img',
  },
] as const) {
  test(`${route.label} responsive hero four-viewport quality and network`, async ({ page }) => {
    test.setTimeout(300_000);
    const results = [];

    for (const width of [390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(route.path, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);

      const hero = await loadedImage(page.locator(route.selector).first());
      expect(new URL(hero.currentSrc).pathname).toBe("/_next/image");
      expect(hero.quality).toBe(route.label === "Genshin" ? "90" : "85");
      const quality = await psnrForCurrentSrc(page, hero.currentSrc);
      expect(quality.psnr).toBeGreaterThanOrEqual(30);

      const health = await page.locator("main img").evaluateAll((images) => ({
        broken: images.filter((image) => {
          const img = image as HTMLImageElement;
          return img.complete && img.naturalWidth === 0;
        }).length,
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      }));
      expect(health.broken).toBe(0);
      expect(health.overflow).toBe(0);

      results.push({ width, hero, quality, network: await routeNetwork(page) });
    }

    console.log(
      `P2P3_FINAL_HERO_OK ${JSON.stringify({ label: route.label, results })}`,
    );
  });
}
