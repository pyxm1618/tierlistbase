import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const route = "/wild-rift/tier-list";

test("Wild Rift uses the shared marketing shell and defaults to the All Roles overview", async ({
  page,
}) => {
  await page.goto(route);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wild Rift Tier List");
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Footer navigation" })).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator("main header")).toHaveCount(0);

  const allRoles = page.getByRole("tab", { name: "All Roles", exact: true });
  await expect(allRoles).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: /^View / })).toHaveCount(5);
  await expect(page.locator("[data-tier-row]")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Best Wild Rift Champions by Role", exact: true }),
  ).toBeVisible();

  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(structuredData.length).toBeGreaterThan(0);
  for (const value of structuredData) expect(() => JSON.parse(value)).not.toThrow();

  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
});

test("all five role tabs open independent tier boards", async ({ page }) => {
  await page.goto(route);

  for (const [tabName, heading] of [
    ["Baron Lane", "Baron Lane Tier List"],
    ["Jungle", "Jungle Tier List"],
    ["Mid Lane", "Mid Lane Tier List"],
    ["Dragon Lane", "Dragon Lane Tier List"],
    ["Support", "Support Tier List"],
  ] as const) {
    const tab = page.getByRole("tab", { name: new RegExp(`^${tabName}`) });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.locator("[data-tier-row]")).toHaveCount(5);
    expect(await page.locator("[data-champion-card]").count()).toBeGreaterThan(0);
  }
});

test("Champion detail, Other Viable Roles and filters stay consistent with the role ranking", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("tab", { name: /^Baron Lane/ }).click();

  const malphite = page.getByRole("button", { name: /^Malphite, Baron Lane, S\+ tier/ });
  await malphite.click();

  const detail = page.locator('[data-ia-section="champion-detail"]');
  await expect(detail.getByRole("heading", { name: "Malphite", exact: true })).toBeVisible();
  await expect(detail).toContainText("S+ Tier");
  await expect(detail).toContainText("Support");
  await expect(detail).toContainText("A");
  await expect(malphite).toHaveAttribute("aria-pressed", "true");

  const search = page.getByRole("searchbox", { name: "Search Champions" });
  await search.fill("Shen");
  await expect(page.locator("[data-champion-card]")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /^Shen, Baron Lane/ })).toBeVisible();

  const rankContext = page.getByRole("combobox", { name: "Rank Context" });
  await expect(rankContext).toBeDisabled();
  await expect(rankContext).toHaveValue("Diamond+");

  await page.getByRole("combobox", { name: "Tier", exact: true }).selectOption("S+");
  await expect(page.locator("[data-champion-card]")).toHaveCount(1);

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("combobox", { name: "Tier", exact: true })).toHaveValue("all");
  expect(await page.locator("[data-champion-card]").count()).toBeGreaterThan(1);
});

test("Quick Picks switch both role and selected champion", async ({ page }) => {
  await page.goto(route);

  await page
    .getByRole("button", { name: "Open Jungle and select Rammus, S+ tier", exact: true })
    .click();

  await expect(page.getByRole("tab", { name: "Jungle", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const detail = page.locator('[data-ia-section="champion-detail"]');
  await expect(detail.getByRole("heading", { name: "Rammus", exact: true })).toBeVisible();
  await expect(detail).toContainText("S+ Tier");
});

test("sources, methodology and FAQ expose the frozen evidence structure", async ({ page }) => {
  await page.goto(route);

  const sources = page.locator('[data-ia-section="sources"]');
  await expect(sources).toContainText("China server · Diamond+ · Ranked");
  await expect(sources).toContainText("independent third-party site");
  for (const link of await sources.locator('a[target="_blank"]').all()) {
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAttribute("href", /^https:\/\//);
  }

  const methodology = page.locator('[data-ia-section="methodology"]');
  await expect(methodology).toContainText("Win Rate alone does not determine Tier");
  for (const role of ["Baron Lane", "Jungle", "Mid Lane", "Dragon Lane", "Support"])
    await expect(methodology.getByRole("heading", { name: new RegExp(`^${role}`) })).toBeVisible();

  await expect(page.locator('[data-ia-section="faq"] details')).toHaveCount(6);

  const audit = await new AxeBuilder({ page }).analyze();
  expect(
    audit.violations.filter((issue) => issue.impact === "serious" || issue.impact === "critical"),
  ).toEqual([]);
});

test("mobile champion detail is modal, traps focus, closes with Escape and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await page.getByRole("tab", { name: /^Baron Lane/ }).click();

  const trigger = page.getByRole("button", { name: /^Malphite, Baron Lane, S\+ tier/ });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Malphite" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close champion details" })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

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
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

for (const width of [390, 768, 1024, 1440, 1920, 2560]) {
  test(`Wild Rift remains responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(
      page.getByRole("heading", { name: "Wild Rift Tier List", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "All Roles", exact: true })).toBeVisible();
  });
}
