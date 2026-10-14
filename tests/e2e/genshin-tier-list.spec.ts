import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const route = "/genshin-impact/tier-list";

test("Genshin V1 preserves the complete architecture, local filters and explicit mock state", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "fetch") requests.push(request.url());
  });
  await page.goto(route);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByText("Select a character to view details", { exact: true })).toBeVisible();
  expect(
    await page
      .locator("[data-ia-section]")
      .evaluateAll((sections) =>
        sections.map((section) => section.getAttribute("data-ia-section")),
      ),
  ).toEqual([
    "page-header",
    "ranking-context",
    "search-filters",
    "tier-board",
    "character-detail",
    "changes",
    "methodology",
    "sources",
    "tier-definitions",
    "faq",
  ]);
  const rows = page.locator("[data-tier]");
  expect(
    await rows.evaluateAll((rows) => rows.map((row) => row.getAttribute("data-tier"))),
  ).toEqual(["S", "A+", "A", "B+", "B", "C", "D", "E", "F", "Pending Evaluation"]);
  for (const row of await rows.all()) {
    const names = await row.locator("[data-character-name]").allTextContents();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
  }
  await expect(page.locator('[data-ia-section="faq"] details')).toHaveCount(6);
  await expect(page.locator('[data-ia-section="methodology"] li')).toHaveCount(5);
  await expect(page.locator('[data-ia-section="sources"] li')).toHaveCount(3);
  const before = requests.length;
  await page.getByRole("searchbox", { name: "Search characters" }).fill("  NAH  ");
  await page.getByRole("button", { name: "Support", exact: true }).click();
  await page.getByRole("button", { name: "Dendro", exact: true }).click();
  await expect(page.locator("[data-character-card]")).toHaveCount(1);
  await page.getByRole("button", { name: /Nahida, Dendro/ }).click();
  const detail = page.locator('[data-ia-section="character-detail"]');
  for (const heading of [
    "Why this Tier",
    "Strengths",
    "Limitations",
    "Best-use Context",
    "Ranking Assumption",
    "Evidence Summary",
  ])
    await expect(detail.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  await expect(detail).toContainText("Mock");
  await expect(detail).toContainText("Last Updated");
  await page.getByRole("searchbox").fill("not-a-character");
  await expect(page.getByText("No characters match these filters.")).toBeVisible();
  expect(requests.length).toBe(before);
  const audit = await new AxeBuilder({ page }).analyze();
  expect(
    audit.violations.filter((issue) => issue.impact === "serious" || issue.impact === "critical"),
  ).toEqual([]);
});

test("mobile detail is modal, traps focus and restores the trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  const trigger = page.getByRole("button", { name: /Nahida, Dendro/ });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Nahida" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close character details" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  const audit = await new AxeBuilder({ page }).analyze();
  expect(
    audit.violations.filter((issue) => issue.impact === "serious" || issue.impact === "critical"),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await trigger.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('[data-ia-section="character-detail"]')).toContainText("Nahida");
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

for (const width of [390, 768, 1024, 1440, 1920, 2560]) {
  test(`Genshin remains responsive at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.locator("[data-character-card]").first()).toBeVisible();
    if ([390, 1440, 1920].includes(width))
      await page.screenshot({ path: testInfo.outputPath(`genshin-${width}.png`), fullPage: true });
  });
}
