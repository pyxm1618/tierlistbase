import { expect, test } from "@playwright/test";
import { routeRegistry } from "@/config/routes.config";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(() => {
  test.skip(
    !routeRegistry.routes.some((entry) => entry.route === "/dragon-traveler/tier-list"),
    "The neutral product does not register the Dragon Traveler page",
  );
});
const route = "/dragon-traveler/tier-list";
const path = "/dragon-traveler/tier-list";
test("Dragon Traveler server contexts, filters and decisions", async ({ page }) => {
  await page.goto(path);
  await expect(
    page.getByRole("heading", { name: "Dragon Traveler Tier List", exact: true }),
  ).toHaveCount(1);
  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toBeVisible();
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  const server = page.getByRole("group", { name: "Server context" });
  await expect(server.getByRole("button", { name: "Global", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const modes = page.getByRole("group", { name: "Luminary ranking views" });
  await expect(modes.getByRole("button", { name: "Overall", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("searchbox", { name: "Search Luminaries" }).fill("Athena");
  await expect(page.getByTestId("luminary-card")).toHaveCount(1);
  await modes.getByRole("button", { name: "PvP", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("Athena");
  await page.getByLabel("Class", { exact: true }).selectOption("Mage");
  await expect(page.getByTestId("luminary-card")).toHaveCount(0);
  await page.getByLabel("Class", { exact: true }).selectOption("Guardian");
  await page.getByLabel("Faction", { exact: true }).selectOption("Sanctum Glory");
  await page.getByLabel("Rarity", { exact: true }).selectOption("SSR EX");
  await expect(page.getByTestId("luminary-card")).toHaveCount(1);
  await page.getByTestId("luminary-card").click();
  await expect(
    page.getByTestId("character-detail").getByRole("heading", { name: "Athena", exact: true }),
  ).toBeVisible();
  await server.getByRole("button", { name: "Taiwan", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("Athena");
  await expect(page.getByTestId("luminary-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByTestId("luminary-card")).toHaveCount(95);
  await page.getByRole("searchbox").fill("Zeus");
  await expect(page.getByTestId("luminary-card")).toHaveCount(1);
  await server.getByRole("button", { name: "Global", exact: true }).click();
  await expect(page.getByTestId("luminary-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByTestId("luminary-card")).toHaveCount(73);
  const teams = page.getByRole("group", { name: "Team ranking views" });
  await teams.getByRole("button", { name: "PvP", exact: true }).click();
  await expect(page.getByTestId("featured-team")).toContainText("Arcane opening pressure");
  await expect(page.getByTestId("featured-team")).toContainText("Frontline");
  await expect(page.getByTestId("formation-cell")).toHaveCount(9);
  await page.getByRole("button", { name: /#2 Arcane protected carry/ }).click();
  await expect(page.getByTestId("featured-team")).toContainText("Arcane protected carry");
  await expect(page.locator('[data-position="Midline"][data-slot="Right"]')).toContainText(
    "Vivian",
  );
  await page
    .getByRole("group", { name: "Wishlist context" })
    .getByRole("button", { name: "PvP", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Current Pull Priority" })).toBeVisible();

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
test("Dragon Traveler keyboard selection and responsive layout", async ({ page }) => {
  await page.goto(path);
  const card = page.getByRole("button", { name: "Select Venus", exact: true });
  await expect(
    page.getByTestId("character-detail").getByRole("heading", { name: "Poseidon", exact: true }),
  ).toBeVisible();
  await card.focus();
  await page.keyboard.press("Enter");
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByTestId("character-detail").getByRole("heading", { name: "Venus", exact: true }),
  ).toBeVisible();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.getByTestId("character-detail")).toBeVisible();
    const distortedPortraits = await page
      .locator('main img[class*="_portrait"]')
      .evaluateAll((images) =>
        images
          .filter((image) => {
            const bounds = image.getBoundingClientRect();
            return Math.abs(bounds.width - bounds.height) > 0.5;
          })
          .map((image) => image.getAttribute("src")),
      );
    expect(distortedPortraits).toEqual([]);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("Dragon Traveler preserves source-specific Arachne ratings and local portraits", async ({
  page,
}) => {
  await page.goto(path);
  const himiko = page
    .getByTestId("featured-team")
    .getByRole("img", { name: "Himiko portrait", exact: true });
  expect(
    await himiko.evaluate((img) => {
      const r = img.getBoundingClientRect();
      return r.width / r.height;
    }),
  ).toBeCloseTo(1, 1);
  await page.getByRole("button", { name: "Select Arachne", exact: true }).click();
  const detail = page.getByTestId("character-detail");
  await expect(detail.getByRole("heading", { name: "Arachne", exact: true })).toBeVisible();
  for (const view of ["Overall", "PvE", "PvP"]) {
    await page
      .getByRole("group", { name: "Luminary ranking views" })
      .getByRole("button", { name: view, exact: true })
      .click();
    await expect(
      page
        .getByRole("button", { name: "Select Arachne", exact: true })
        .locator("xpath=ancestor::*[@data-tier]"),
    ).toHaveAttribute("data-tier", "S");
  }
  await page.evaluate(() =>
    document.querySelectorAll<HTMLImageElement>("main img").forEach((img) => {
      img.loading = "eager";
    }),
  );
  await expect
    .poll(() =>
      page
        .locator("main img")
        .evaluateAll((images) =>
          images.every(
            (img) =>
              (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
});

test("Dragon Traveler recommendations reveal the flowing mobile detail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 950 });
  await page.goto(path);
  await page.getByRole("button", { name: /Best New Player/ }).click();
  const detail = page.getByTestId("character-detail");
  await expect(detail.getByRole("heading", { name: "Fenrir", exact: true })).toBeVisible();
  await expect
    .poll(
      () =>
        detail.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return r.top >= 0 && r.top < 180;
        }),
      { timeout: 2000 },
    )
    .toBe(true);
  await expect(detail).toBeFocused();
  const reroll = page
    .getByRole("heading", { name: "Best Reroll Targets", exact: true })
    .locator("..");
  await reroll.getByRole("button", { name: /Medusa/ }).click();
  await expect(detail.getByRole("heading", { name: "Medusa", exact: true })).toBeVisible();
  await expect
    .poll(() =>
      detail.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= 0 && r.top < 180;
      }),
    )
    .toBe(true);
});

test("Dragon Traveler retires both banners at their exact server-time boundaries", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-28T12:00:00+08:00") });
  await page.clock.pauseAt(new Date("2026-10-29T04:59:59+08:00"));
  await page.goto(route);
  const priority = page.locator("[data-current-pull-priority]");
  await expect(priority).toContainText("Consider");
  await expect(priority).toContainText("Arachne");
  await page.getByRole("button", { name: "Taiwan", exact: true }).click();
  await expect(priority).toContainText("Consider");
  await page.clock.fastForward(2000);
  await expect(priority).toContainText("No verified current banner recommendation");
  await expect(priority).not.toContainText("Consider");
  await page.getByRole("button", { name: "Global", exact: true }).click();
  await expect(priority).toContainText("Arachne");
  await page.clock.pauseAt(new Date("2026-11-05T04:59:59-05:00"));
  await expect(priority).toContainText("Consider");
  await page.clock.fastForward(2000);
  await expect(priority).toContainText("No verified current banner recommendation");
});

test("Dragon Traveler has no serious accessibility violations", async ({ page }) => {
  await page.goto(route);
  const result = await new AxeBuilder({ page }).include("[data-dragon-traveler-page]").analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole("button", { name: "Taiwan", exact: true }).click();
  const taiwan = await new AxeBuilder({ page }).include("[data-dragon-traveler-page]").analyze();
  expect(taiwan.violations).toEqual([]);
});
