import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { seedWowPresentationFixtures } from "./wow-fixtures";

function tokenizeSeo(value: string): string[] {
  return value.toLocaleLowerCase("en-US").match(/[\p{L}\p{N}]+/gu) ?? [];
}

function countSeoPhrase(words: readonly string[], phrase: string): number {
  const wanted = tokenizeSeo(phrase);
  if (wanted.length === 0 || wanted.length > words.length) return 0;
  let count = 0;
  for (let index = 0; index <= words.length - wanted.length; index += 1) {
    if (wanted.every((word, offset) => words[index + offset] === word)) count += 1;
  }
  return count;
}

// Scope changed from the old generic PvP/Overall/Level-60 board to the approved Dungeon/30 page.
// Preserve SSR, context isolation, unknown states, responsive and full drawer accessibility coverage.
test.beforeAll(seedWowPresentationFixtures);

test("records rendered WoW SEO keyword density baseline", async ({ page }) => {
  await page.goto("/wow-forever/tier-list", { waitUntil: "networkidle" });
  const visibleText = await page.locator("main").innerText();
  const words = tokenizeSeo(visibleText);
  const primary = countSeoPhrase(words, "wow tier list");
  const variant = countSeoPhrase(words, "wow forever tier list");
  const primaryDensity = (primary / Math.max(words.length, 1)) * 100;
  const variantDensity = (variant / Math.max(words.length, 1)) * 100;
  console.log(
    JSON.stringify({
      event: "wow_seo_density_baseline",
      visibleWords: words.length,
      primaryOccurrences: primary,
      primaryDensityPct: Number(primaryDensity.toFixed(3)),
      variantOccurrences: variant,
      variantDensityPct: Number(variantDensity.toFixed(3)),
      combinedDensityPct: Number((primaryDensity + variantDensity).toFixed(3)),
    }),
  );
  expect(words.length).toBeGreaterThan(0);
});
test("SSR contains default dungeon ranking and modules in order without foreign data", async ({
  request,
  page,
}) => {
  const response = await request.get("/wow-forever/tier-list");
  expect(response.status()).toBe(200);
  const html = await response.text();
  for (const text of [
    "World of Warcraft: Forever Tier List",
    "Arms Warrior",
    "Quick Insights",
    "What Changed",
    "Sources &amp; Evidence",
    "Methodology &amp; FAQ",
  ])
    expect(html).toContain(text);
  for (const text of [
    "FOREIGN SOURCE",
    "FOREIGN CHANGE",
    "FOREIGN EVIDENCE",
    "Community Data",
    "sources agree",
    "Level 60",
    "Best for New Players",
    "Strong for Leveling",
  ])
    expect(html).not.toContain(text);
  const order = [
    "wow-board-heading",
    "wow-insights-heading",
    "wow-changes-heading",
    "wow-sources-heading",
    "wow-methodology-heading",
  ].map((id) => html.indexOf(`id="${id}"`));
  expect(order.every((value, index) => index === 0 || value > order[index - 1]!)).toBe(true);
  await page.goto("/wow-forever/tier-list");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Arms Warrior, DPS, S tier/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Frost Mage, DPS, Pending tier/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Agree|Disagree|Vote/ })).toHaveCount(0);
});
test("role links navigate real contexts and isolate spec performance, evidence and history", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/wow-forever/tier-list");
  await page.getByRole("link", { name: "TANK", exact: true }).click();
  await expect(page).toHaveURL(/role=tank/);
  await expect(page.getByRole("button", { name: /Earthen Guardian Shaman, TANK/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Arms Warrior/ })).toHaveCount(0);
  await expect(page.locator("#wow-changes-heading").locator("..")).toContainText(
    "No recorded tier changes yet",
  );
  await page.getByRole("link", { name: "HEALER", exact: true }).click();
  await expect(page.getByRole("button", { name: /Holy Priest, HEALER/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Earthen Guardian/ })).toHaveCount(0);
  await page.getByRole("link", { name: "DPS", exact: true }).click();
  await expect(page.getByRole("button", { name: /Arms Warrior/ })).toBeVisible();
  await expect(page.locator("#wow-changes-heading").locator("..")).toContainText("Fury Warrior");
  await expect(page.locator("main")).not.toContainText(/FOREIGN/);
});
test("Class filtering is local and preserves global rank and selected Detail", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/wow-forever/tier-list");
  await page.waitForLoadState("networkidle");
  let navigations = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/wow-forever/tier-list") navigations++;
  });
  await page
    .getByRole("navigation", { name: "Class Navigator" })
    .getByRole("button", { name: "Mage", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /Fire Mage, DPS/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Arms Warrior, DPS/ })).toHaveCount(0);
  await expect(page.locator("#desktop-spec-title")).toHaveText("Fire");
  const card = page.getByRole("button", { name: /Fire Mage, DPS/ });
  await expect(card).toContainText("#2");
  await card.click();
  await expect(page.locator("#desktop-spec-title")).toHaveText("Fire");
  await page.getByRole("tab", { name: "Performance", exact: true }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("126.0");
  await expect(panel).toContainText("120");
  await expect(panel).toContainText("207");
  await expect(panel).toContainText("N/A");
  expect(navigations).toBe(0);
  await page
    .getByRole("navigation", { name: "Class Navigator" })
    .getByRole("button", { name: "All Classes", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /Arms Warrior, DPS/ })).toBeVisible();
});
test("pending remains unranked with real low sample and N/A score", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/wow-forever/tier-list");
  await page.getByRole("button", { name: /Frost Mage, DPS, Pending/ }).click();
  await page.getByRole("tab", { name: "Performance", exact: true }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("Pending");
  await expect(panel).toContainText("N/A");
  await expect(panel).toContainText("Insufficient sample / excluded");
  await expect(panel).not.toContainText("126.0");
});
test("unsupported query dimensions cannot introduce another scope and invalid role stays unavailable", async ({
  page,
}) => {
  await page.goto("/wow-forever/tier-list?mode=pvp&level=60&build=historical");
  await expect(page.getByRole("button", { name: /Arms Warrior, DPS/ })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/Level 60|Historical|PvP|FOREIGN/);
  await page.goto("/wow-forever/tier-list?role=unknown");
  await expect(
    page.getByText("No recorded data for this Ranking Context.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "DPS", exact: true }).click();
  await expect(page.getByRole("button", { name: /Arms Warrior/ })).toBeVisible();
});
test("drawer traps focus, closes with Escape/backdrop, restores focus and body scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/wow-forever/tier-list");
  const card = page.getByRole("button", { name: /Arms Warrior, DPS/ });
  await card.click();
  const dialog = page.getByRole("dialog", { name: "Arms", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close Spec Detail" })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  for (const key of ["Shift+Tab", "Tab", "Tab", "Tab"]) {
    await page.keyboard.press(key);
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await card.click();
  await page.mouse.click(10, 400);
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
  await card.click();
  await dialog.getByRole("button", { name: "Close Spec Detail" }).click();
  await expect(card).toBeFocused();
});
test("detail tab keyboard navigation and source attribution remain accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/wow-forever/tier-list");
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Performance", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tabpanel")).toContainText("1 performance data source");
  await expect(
    page.getByRole("tabpanel").getByRole("link", { name: "Synthetic Forever Logs fixture" }),
  ).toHaveAttribute("href", "https://foreverlogs.gg/");
  await expect(page.locator("main")).not.toContainText("sources agree");
  const audit = await new AxeBuilder({ page }).analyze();
  expect(audit.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual(
    [],
  );
  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByRole("button", { name: /Arms Warrior, DPS/ }).click();
  const modalAudit = await new AxeBuilder({ page }).analyze();
  expect(
    modalAudit.violations.filter((v) => v.impact === "critical" || v.impact === "serious"),
  ).toEqual([]);
});
for (const width of [390, 768, 1024, 1280, 1440, 1920, 2560])
  test(`approved layout and image strategy at ${width}px`, async ({ page, request }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/wow-forever/tier-list", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.getByRole("navigation", { name: "Class Navigator" })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Selected Spec Detail" }))[
      width >= 1280 ? "toBeVisible" : "toBeHidden"
    ]();
    const preloads = page.locator('link[rel="preload"][as="image"]');
    await expect(preloads).toHaveCount(1);
    await expect(preloads).toHaveAttribute("imagesrcset", /hero-3b7bb10711/);
    const hero = page.locator("[data-wow-hero] img");
    await expect(hero).toHaveJSProperty("complete", true);
    const image = await hero.evaluate((img: HTMLImageElement) => {
      const r = (performance.getEntriesByType("resource") as PerformanceResourceTiming[]).find(
        (r) => r.name === img.currentSrc,
      );
      return {
        currentSrc: img.currentSrc,
        naturalWidth: img.naturalWidth,
        renderedWidth: img.getBoundingClientRect().width,
        encodedBodySize: r?.encodedBodySize,
        dpr: devicePixelRatio,
      };
    });
    expect(image.naturalWidth).toBeGreaterThan(0);
    expect(Number(new URL(image.currentSrc).searchParams.get("w"))).toBeGreaterThanOrEqual(
      Math.min(2172, image.renderedWidth * image.dpr),
    );
    const resource = await request.get(image.currentSrc);
    expect((await resource.body()).length).toBeLessThan(500000);
    await testInfo.attach("hero-image-evidence", {
      body: JSON.stringify(image),
      contentType: "application/json",
    });
    const icons = page.locator('img[alt$=" icon"]');
    for (const icon of await icons.all()) await expect(icon).toHaveAttribute("loading", "lazy");
    if (width < 1280) {
      await page.getByRole("button", { name: /Arms Warrior, DPS/ }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
    }
    if ([390, 1440, 1920].includes(width)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath(`wow-${width}.png`), fullPage: true });
    }
    expect(errors).toEqual([]);
  });

test("detail icon renderedWidth does not exceed naturalWidth", async ({ page }, testInfo) => {
  await page.goto("/wow-forever/tier-list", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Arms Warrior, DPS/ }).click();
  const icon = page
    .locator('dialog[open] header img[alt="Arms icon"], aside header img[alt="Arms icon"]')
    .locator("visible=true")
    .first();
  await expect(icon).toBeVisible();
  await expect(icon).toHaveJSProperty("complete", true);
  const info = await icon.evaluate((img: HTMLImageElement) => ({
    currentSrc: img.currentSrc,
    renderedWidth: img.getBoundingClientRect().width,
    naturalWidth: img.naturalWidth,
  }));
  console.log(`[${testInfo.project.name}] Detail icon:`, JSON.stringify(info));
  expect(info.renderedWidth).toBeLessThanOrEqual(info.naturalWidth);
});
