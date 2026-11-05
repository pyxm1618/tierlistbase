import { expect, test, type Page } from "@playwright/test";

const route = "/anime-expeditions/tier-list";

async function loadLazyImages(page: Page) {
  await page.evaluate(async () => {
    const delay = (milliseconds: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
    const step = Math.max(600, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await delay(90);
    }
    window.scrollTo(0, 0);
    await delay(400);
  });
  await page.waitForFunction(
    () =>
      Array.from(document.images).every(
        (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
      ),
    undefined,
    { timeout: 15_000 },
  );
}

test.setTimeout(90_000);

test("captures the temporary Anime Expeditions frozen-design acceptance frames", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route, { waitUntil: "networkidle" });
  await loadLazyImages(page);
  const desktop = await page.screenshot({
    type: "jpeg",
    quality: 32,
    fullPage: true,
    animations: "disabled",
    scale: "css",
  });
  process.stdout.write(`ANIME_VISUAL_1440 ${desktop.toString("base64")}\n`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route, { waitUntil: "networkidle" });
  await loadLazyImages(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
    true,
  );
  const mobile = await page.screenshot({
    type: "jpeg",
    quality: 32,
    fullPage: true,
    animations: "disabled",
    scale: "css",
  });
  process.stdout.write(`ANIME_VISUAL_390 ${mobile.toString("base64")}\n`);
});
