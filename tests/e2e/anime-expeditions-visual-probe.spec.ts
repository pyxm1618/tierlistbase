import { expect, test } from "@playwright/test";

const route = "/anime-expeditions/tier-list";

async function waitForImages(page: Parameters<typeof test>[0] extends never ? never : any) {
  await page.waitForFunction(() =>
    Array.from(document.images)
      .filter((image) => {
        const rect = image.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .every((image) => image.complete && image.naturalWidth > 0),
  );
}

test("captures the temporary Anime Expeditions frozen-design acceptance frames", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route, { waitUntil: "networkidle" });
  await waitForImages(page);
  const desktop = await page.screenshot({
    type: "jpeg",
    quality: 36,
    fullPage: true,
    animations: "disabled",
  });
  process.stdout.write(`ANIME_VISUAL_1440 ${desktop.toString("base64")}\n`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route, { waitUntil: "networkidle" });
  await waitForImages(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const mobile = await page.screenshot({
    type: "jpeg",
    quality: 36,
    fullPage: true,
    animations: "disabled",
  });
  process.stdout.write(`ANIME_VISUAL_390 ${mobile.toString("base64")}\n`);
});
