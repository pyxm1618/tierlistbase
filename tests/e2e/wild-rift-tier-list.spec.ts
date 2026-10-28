import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";

const route = "/wild-rift/tier-list";

test("Wild Rift uses the shared marketing shell, correct SEO metadata, and All Roles default", async ({
  page,
}) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Wild Rift Tier List – Best Champions by Role for Ranked");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Compare the current Wild Rift tier list across Baron, Jungle, Mid, Dragon and Support using ranked statistics, role-specific evidence, and reviewed meta context.",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wild Rift Tier List");
  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toHaveCount(1);
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toHaveCount(1);
  await expect(page.locator('main nav[aria-label="Primary navigation"]')).toHaveCount(0);
  await expect(page.locator("main footer")).toHaveCount(0);

  const roleNav = page.getByRole("tablist", { name: "Wild Rift role rankings" });
  await expect(roleNav.getByRole("tab", { name: "All Roles" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const overview = page.getByRole("tabpanel", { name: "All Roles Overview" });
  for (const role of ["Baron Lane", "Jungle", "Mid Lane", "Dragon Lane", "Support"]) {
    await expect(overview.getByRole("heading", { name: role, exact: true })).toBeVisible();
  }
  await expect(page.locator('[data-ia-section="role-tier-workspace"]')).toHaveCount(0);
  await expect(overview).toContainText("not a sixth overall champion tier list");

  expect(routeRegistry.sitemapEntries().map((entry) => entry.route)).toContain(route);
  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(structuredData.length).toBeGreaterThan(0);
  for (const value of structuredData) expect(() => JSON.parse(value)).not.toThrow();

  await expect(page.locator('[data-ia-section="faq"] details')).toHaveCount(6);
  await expect(page.locator('[data-ia-section="sources-evidence"]')).toContainText(
    "CN ladder statistics · Master+ · Ranked",
  );
  await expect(page.locator('[data-ia-section="sources-evidence"]')).toContainText(
    "not affiliated with, approved by, endorsed by, or partnered with Riot Games",
  );

  const audit = await new AxeBuilder({ page }).analyze();
  expect(
    audit.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);
});

test("all five frozen role tabs render their own Tier Board and preserve Champion × Role data", async ({
  page,
}) => {
  await page.goto(route);
  const roleNav = page.getByRole("tablist", { name: "Wild Rift role rankings" });

  for (const role of ["Baron Lane", "Jungle", "Mid Lane", "Dragon Lane", "Support"]) {
    const tab = roleNav.getByRole("tab", { name: new RegExp(`^${role}`) });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { level: 2, name: `${role} Tier List` })).toBeVisible();
    await expect(page.locator('[data-ia-section="role-tier-workspace"]')).toBeVisible();
    for (const tier of ["S+", "S", "A", "B", "C"]) {
      await expect(page.locator(`[data-ia-section="role-tier-workspace"] [data-tier="${tier}"]`).first()).toBeVisible();
    }
  }

  await roleNav.getByRole("tab", { name: /^Jungle$/ }).click();
  const nocturne = page.locator('[data-champion-id="nocturne"]');
  await expect(nocturne).toHaveAttribute("data-tier", "S+");
  await nocturne.click();
  const detail = page.getByRole("complementary", { name: "Champion Detail" });
  await expect(detail).toContainText("Nocturne");
  await expect(detail.locator('[data-tier="S+"]').first()).toBeVisible();
  await expect(detail).toContainText("52.7%");
  await expect(detail).toContainText("6.7%");
  await expect(detail).toContainText("67.4%");
});

test("Wild Rift filters, Other Viable Roles, and Quick Picks stay synchronized with the reviewed model", async ({
  page,
}) => {
  await page.goto(route);
  const roleNav = page.getByRole("tablist", { name: "Wild Rift role rankings" });

  await roleNav.getByRole("tab", { name: /^Baron Lane/ }).click();
  const search = page.getByRole("searchbox", { name: "Search Champions" });
  await search.fill("Garen");
  await page.getByRole("combobox", { name: "Tier" }).selectOption("C");
  await expect(page.locator("[data-champion-id]")).toHaveCount(1);
  await expect(page.locator('[data-champion-id="garen"]')).toBeVisible();

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("combobox", { name: "Tier" })).toHaveValue("All");
  await expect(page.getByRole("combobox", { name: "Rank Context" })).toBeDisabled();

  await page.locator('[data-champion-id="malphite"]').click();
  const detail = page.getByRole("complementary", { name: "Champion Detail" });
  await expect(detail.getByRole("heading", { name: "Other Viable Roles" })).toBeVisible();
  await expect(detail.getByRole("button", { name: /Mid Lane/ })).toBeVisible();
  await expect(detail.getByRole("button", { name: /Support/ })).toBeVisible();

  await page.getByRole("button", { name: "Mid Lane quick pick: Hwei, S+ tier" }).click();
  await expect(roleNav.getByRole("tab", { name: /^Mid Lane$/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("complementary", { name: "Champion Detail" })).toContainText("Hwei");
  await expect(page.locator('[data-champion-id="hwei"]')).toHaveAttribute("aria-pressed", "true");
});

test("mobile champion detail uses a modal dialog, traps focus, closes on Escape, and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);

  const roleNav = page.getByRole("tablist", { name: "Wild Rift role rankings" });
  await roleNav.getByRole("tab", { name: /^Jungle$/ }).click();
  const trigger = page.locator('[data-champion-id="nocturne"]');
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Nocturne" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close champion details" })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

  const audit = await new AxeBuilder({ page }).analyze();
  expect(
    audit.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

for (const width of [390, 768, 1024, 1440, 1920, 2560]) {
  test(`Wild Rift remains within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole("heading", { level: 1, name: "Wild Rift Tier List" })).toBeVisible();
  });
}
