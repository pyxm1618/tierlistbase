import { readFile } from "node:fs/promises";
import postgres from "postgres";
import approvedRatings from "../../data/editorial/genshin-impact/7.1/ratings.json" with { type: "json" };
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { genshinTestDatabaseUrl, seedGenshinTestDatabase } from "../genshin-tier-list/database";

test.beforeAll(seedGenshinTestDatabase);

const route = "/genshin-impact/tier-list";

test("Genshin V1 preserves the complete architecture, local filters and reviewed database state", async ({
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
  await expect(page.locator("[data-character-card]")).toHaveCount(121);
  await expect(page.locator("[data-character-card][aria-pressed=true]")).toHaveCount(0);
  await expect(page.locator('[data-ia-section="ranking-context"]')).toContainText("7.1");
  await expect(page.locator('[data-ia-section="sources"]')).toContainText(
    "4 evidence-linked sources · 130 verified evidence observations",
  );
  await expect(page.locator('[data-ia-section="changes"]')).toContainText("Vesna");
  await expect(page.locator('[data-ia-section="changes"]')).toContainText("Vodyanitsa");
  await expect(page.locator('[data-ia-section="changes"]')).toContainText(
    "No published tier changes recorded",
  );
  await expect(page.locator('[data-ia-section="changes"]')).not.toContainText("→");
  await expect(page.locator("main")).not.toContainText(
    /Mock \/ Placeholder|MOCK RATING|mock characters|Pending verification|No reviewed ranking data published yet/i,
  );
  const distribution = {
    S: 9,
    "A+": 21,
    A: 26,
    "B+": 29,
    B: 16,
    C: 15,
    D: 2,
    E: 3,
    F: 0,
    "Pending Evaluation": 0,
  };
  for (const [tier, count] of Object.entries(distribution))
    await expect(page.locator(`[data-tier="${tier}"] [data-character-card]`)).toHaveCount(count);
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
  await expect(page.locator('[data-ia-section="sources"] ol li')).toHaveCount(3);
  await expect(page.locator('[data-ia-section="sources"] ul li')).toHaveCount(4);
  for (const name of ["Genshin Builds", "Icy Veins", "KeqingMains", "Mobalytics"]) {
    const link = page.locator('[data-ia-section="sources"] ul').getByRole("link", { name });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAttribute("href", /^https:\/\//);
  }
  await expect(page.locator('[data-ia-section="sources"]')).toContainText(
    "Genshin Impact and related intellectual property are owned by COGNOSPHERE PTE. LTD. TierListBase is an independent site and is not affiliated with or endorsed by COGNOSPHERE or HoYoverse.",
  );
  const before = requests.length;
  const roleGroup = page.getByRole("group", { name: "Role", exact: true });
  const elementGroup = page.getByRole("group", { name: "Element", exact: true });
  await roleGroup.getByRole("button", { name: "Main DPS", exact: true }).click();
  expect(await page.locator("[data-character-card]").count()).toBeGreaterThan(0);
  for (const card of await page.locator("[data-character-card]").all())
    await expect(card).toHaveAttribute("aria-label", /Main DPS/);
  await roleGroup.getByRole("button", { name: "All", exact: true }).click();
  await elementGroup.getByRole("button", { name: "Pyro", exact: true }).click();
  expect(await page.locator("[data-character-card]").count()).toBeGreaterThan(0);
  for (const card of await page.locator("[data-character-card]").all())
    await expect(card).toHaveAttribute("aria-label", /Pyro/);
  await elementGroup.getByRole("button", { name: "All", exact: true }).click();

  await page.getByRole("searchbox", { name: "Search characters" }).fill("  NAH  ");
  await page.getByRole("button", { name: "Support", exact: true }).click();
  await page.getByRole("button", { name: "Dendro", exact: true }).click();
  await expect(page.locator("[data-character-card]")).toHaveCount(1);
  const selectedCard = page.getByRole("button", { name: /Nahida, Dendro/ });
  await selectedCard.focus();
  await page.keyboard.press("Enter");
  const detail = page.locator('[data-ia-section="character-detail"]');
  for (const heading of [
    "Why this Tier",
    "Strengths",
    "Limitations",
    "Best-use Context",
    "Ranking Assumption",
    "Evidence Summary",
    "Evidence Sources",
  ])
    await expect(detail.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  const detailSourceLinks = detail.locator("ul").last().getByRole("link");
  expect(await detailSourceLinks.count()).toBeGreaterThan(0);
  for (const link of await detailSourceLinks.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAttribute("href", /^https:\/\//);
  }
  const nahida = approvedRatings.find((rating) => rating.entitySlug === "nahida")!;
  for (const value of [
    nahida.whyThisTier,
    nahida.bestUseContext,
    nahida.rankingAssumption,
    nahida.evidenceSummary,
    ...nahida.strengths,
    ...nahida.limitations,
  ])
    await expect(detail).toContainText(value);
  await expect(detail).not.toContainText('["');
  await expect(detail).toContainText("C0 / No Signature Weapon");
  await expect(detail).toContainText("Last Updated (ranking data)");
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
    if ([390, 768, 1024, 1440, 1920].includes(width))
      await page.screenshot({ path: testInfo.outputPath(`genshin-${width}.png`), fullPage: true });
  });
}

test("a failed detail avatar does not hide the next character's valid avatar", async ({ page }) => {
  const database = postgres(genshinTestDatabaseUrl(), { max: 1 });
  const previous = await database`select ep.entity_id, ep.avatar, e.slug from entity_profiles ep
    join entities e on e.id = ep.entity_id join games g on g.id = e.game_id
    where g.slug = 'genshin-impact' and e.slug in ('nahida', 'bennett')`;
  try {
    expect(previous).toHaveLength(2);
    for (const row of previous) {
      const id = row.slug;
      const avatar = {
        128: `https://media.tierlistbase.com/genshin/characters/${id}/avatar-128.webp`,
        256: `https://media.tierlistbase.com/genshin/characters/${id}/avatar-256.webp`,
      };
      await database`update entity_profiles set avatar = ${database.json(avatar)}::jsonb where entity_id = ${row.entity_id}`;
    }
    const image = await readFile(
      "src/modules/genshin-tier-list/assets/mock-avatar-1914c60a0f.webp",
    );
    await page.route("**/_next/image?**", async (route) => {
      const source = new URL(route.request().url()).searchParams.get("url") ?? "";
      if (source.includes("media.tierlistbase.com") && source.includes("/nahida/"))
        await route.abort();
      else await route.fulfill({ status: 200, contentType: "image/webp", body: image });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    await page.getByRole("button", { name: /Nahida, Dendro/ }).click();
    const detail = page.locator('[data-ia-section="character-detail"] [data-avatar="detail"]');
    await expect(detail.locator('img[alt=""]')).toBeVisible();
    await page.getByRole("button", { name: /Bennett, Pyro/ }).click();
    await expect(detail.getByRole("img", { name: "Bennett", exact: true })).toBeVisible();
  } finally {
    for (const row of previous) {
      await database`update entity_profiles set avatar = ${row.avatar === null ? null : database.json(row.avatar)}::jsonb where entity_id = ${row.entity_id}`;
    }
    await database.end();
  }
});
