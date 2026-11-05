import { expect, test, type Locator, type Page } from "@playwright/test";

const route = "/anime-expeditions/tier-list";

async function primePage(page: Page) {
  await page.evaluate(async () => {
    const delay = (milliseconds: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
    const step = Math.max(600, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await delay(90);
    }
    window.scrollTo(0, 0);
    await delay(1200);
  });
}

function emitScreenshot(label: string, data: Buffer) {
  const base64 = data.toString("base64");
  const size = 24000;
  const total = Math.ceil(base64.length / size);
  for (let index = 0; index < total; index += 1) {
    process.stdout.write(
      `ANIME_VISUAL_${label}_PART ${index + 1}/${total} ${base64.slice(index * size, (index + 1) * size)}\n`,
    );
  }
}

async function capture(label: string, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  const data = await locator.screenshot({
    type: "jpeg",
    quality: 58,
    animations: "disabled",
    scale: "css",
  });
  emitScreenshot(label, data);
}

test.setTimeout(120_000);

test("captures temporary Anime Expeditions frozen-design acceptance sections", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route, { waitUntil: "networkidle" });
  await primePage(page);

  await capture("HERO", page.locator("main > section").first());
  await capture("QUICK", page.locator('section[aria-labelledby="quick-title"]'));
  await capture("RANKING_NAV", page.getByRole("navigation", { name: "Ranking systems" }));
  await capture("UNITS", page.locator("#units"));
  await capture("TRAITS", page.locator("#traits"));
  await capture("EQUIPMENT", page.locator("#equipment"));
  await capture("TEAMS", page.locator("#teams"));
  await capture("EVOLUTION", page.locator("#evolution"));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route, { waitUntil: "networkidle" });
  await primePage(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await capture("MOBILE_HERO", page.locator("main > section").first());
  await capture("MOBILE_UNITS", page.locator("#units"));
});
