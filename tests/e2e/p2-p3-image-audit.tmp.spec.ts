import sharp from "sharp";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { seedGenshinTestDatabase } from "../genshin-tier-list/database";
import { seedWowPresentationFixtures } from "../meta-board/wow-fixtures";

test.beforeAll(seedGenshinTestDatabase);
test.beforeAll(seedWowPresentationFixtures);
test.use({ deviceScaleFactor: 2 });

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
    const url = new URL(image.currentSrc);
    return {
      currentSrc: image.currentSrc,
      source: decodeURIComponent(url.searchParams.get("url") ?? ""),
      candidateWidth: Number(url.searchParams.get("w")) || null,
      sizes: image.getAttribute("sizes"),
      loading: image.loading,
      renderedWidth: Math.round(image.getBoundingClientRect().width),
      renderedHeight: Math.round(image.getBoundingClientRect().height),
      dpr: devicePixelRatio,
    };
  });
}

async function psnrForCurrentSrc(page: Page, currentSrc: string) {
  const optimized = new URL(currentSrc);
  expect(optimized.pathname).toBe("/_next/image");
  const sourcePath = optimized.searchParams.get("url");
  expect(sourcePath).toBeTruthy();

  const imageAccept = {
    accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  };
  const [sourceResponse, optimizedResponse] = await Promise.all([
    page.request.get(new URL(sourcePath!, page.url()).toString()),
    page.request.get(currentSrc, { headers: imageAccept }),
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
  expect(candidateRaw.length).toBe(referenceRaw.length);

  let squaredError = 0;
  for (let index = 0; index < referenceRaw.length; index += 1) {
    const delta = referenceRaw[index]! - candidateRaw[index]!;
    squaredError += delta * delta;
  }
  const mse = squaredError / referenceRaw.length;
  return {
    psnr: mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse),
    bytes: candidate.length,
    contentType: optimizedResponse.headers()["content-type"] ?? "",
    width: meta.width,
    height: meta.height,
  };
}

for (const route of [
  { label: "WoW", path: "/wow-forever/tier-list", selector: "[data-wow-hero] img" },
  {
    label: "Genshin",
    path: "/genshin-impact/tier-list",
    selector: '[data-ia-section="page-header"] img',
  },
] as const) {
  test(`${route.label} optimized Hero visual fidelity at four viewports`, async ({ page }) => {
    test.setTimeout(300000);
    const results = [];

    for (const width of [390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(route.path, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      const hero = await loadedImage(page.locator(route.selector).first());
      expect(hero.currentSrc).toContain("/_next/image?");
      expect(hero.source).toContain(".webp");
      const quality = await psnrForCurrentSrc(page, hero.currentSrc);
      expect(quality.psnr).toBeGreaterThanOrEqual(30);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(0);
      results.push({ width, hero, quality });
    }

    console.log(`P2P3_VISUAL_FIDELITY ${JSON.stringify({ label: route.label, results })}`);
  });
}

test("Genshin remote avatars remain optimized and healthy", async ({ page }) => {
  const imageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /(image|img|_next\/image)/i.test(message.text())) {
      imageErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto("/genshin-impact/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await page.getByRole("searchbox", { name: "Search characters" }).fill("Nahida");
  const nahida = page.getByRole("button", { name: /Nahida, Dendro/ });
  await expect(nahida).toBeVisible();

  const board = await loadedImage(nahida.locator('[data-avatar="board"] img'));
  expect(board.currentSrc).toContain("/_next/image?");
  expect(board.source).toContain("https://media.tierlistbase.com/");
  await nahida.click();
  const detail = await loadedImage(
    page
      .locator('[data-ia-section="character-detail"] [data-avatar="detail"] img')
      .filter({ visible: true })
      .first(),
  );
  expect(detail.currentSrc).toContain("/_next/image?");
  expect(detail.source).toContain("https://media.tierlistbase.com/");
  expect(imageErrors).toEqual([]);

  console.log(`P2P3_GENSHIN_REMOTE ${JSON.stringify({ board, detail })}`);
});

for (const width of [390, 1440]) {
  test(`Wild Rift portrait paths and Hero transfer at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto("/wild-rift/tier-list", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);

    const small = await loadedImage(
      page.locator('[data-ia-section="all-roles-overview"] img').first(),
    );
    const cardButton = page.locator("[data-champion-id]").first();
    const card = await loadedImage(cardButton.locator("img"));
    await cardButton.click();

    const detailRoot =
      width <= 700
        ? page.getByRole("dialog").filter({ visible: true }).first()
        : page
            .getByRole("complementary", { name: "Champion Detail" })
            .filter({ visible: true })
            .first();
    const detail = await loadedImage(detailRoot.locator("img").first());

    for (const portrait of [small, card, detail]) {
      expect(new URL(portrait.currentSrc).pathname).toBe("/_next/image");
      expect(portrait.source).toContain("/images/wild-rift/champions/");
      expect(portrait.source).toContain(".png");
      expect(portrait.candidateWidth).toBeTruthy();
    }

    const heroResources = await page.evaluate(() =>
      (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
        .filter((entry) => decodeURIComponent(entry.name).includes("/images/wild-rift/hero.webp"))
        .map((entry) => ({
          url: entry.name,
          transferSize: entry.transferSize,
          initiatorType: entry.initiatorType,
        })),
    );
    expect(heroResources).toHaveLength(1);
    expect(new URL(heroResources[0]!.url).pathname).toBe("/_next/image");

    console.log(
      `P2P3_WILD_SUPPLEMENT ${JSON.stringify({ width, small, card, detail, heroResources })}`,
    );
  });
}
