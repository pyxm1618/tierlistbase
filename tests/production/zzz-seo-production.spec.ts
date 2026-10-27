import { expect, test } from "@playwright/test";

const route = "/zenless-zone-zero/tier-list";
const canonical = `https://www.tierlistbase.com${route}`;
const title = "ZZZ Tier List – Best Zenless Zone Zero Characters Ranked";
const description =
  "Explore the Zenless Zone Zero Tier List with current character rankings, best characters and agents, team-building insights, and pull decisions.";

test("ZZZ production HTML, headers, sitemap and robots release the canonical URL", async ({
  request,
  page,
}) => {
  const response = await request.get(route);
  expect(response.status()).toBe(200);
  expect(response.headers()["x-robots-tag"] ?? "").not.toMatch(/noindex/i);
  const html = await response.text();
  expect(html).toContain(`<link rel="canonical" href="${canonical}"`);
  expect(html).toContain('<meta name="robots" content="index, follow"');
  await page.goto(route);
  await expect(page).toHaveTitle(title);
  await expect(page.locator("h1")).toHaveText("ZZZ Tier List");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml.split(`<loc>${canonical}</loc>`).length - 1).toBe(1);
  expect(xml).not.toContain("tierlistbase.vercel.app");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Allow: /");
  expect(await robots.text()).toContain("Sitemap: https://www.tierlistbase.com/sitemap.xml");
});

for (const width of [390, 1440]) {
  test(`ZZZ static editorial density and smoke at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    for (const name of ["Pull Advice Detail", "Team Detail"]) {
      const panel = page.getByRole("region", { name, exact: true });
      if (await panel.isVisible())
        await panel.getByRole("button", { name: `Close ${name}`, exact: true }).click();
    }
    const hero = page
      .getByRole("heading", { level: 1, name: "ZZZ Tier List", exact: true })
      .locator("..");
    const agents = page
      .getByRole("region", { name: "Agent Ranking", exact: true })
      .getByRole("heading", { level: 2, name: "ZZZ Character Tier List", exact: true })
      .locator("..");
    await expect(hero).toBeVisible();
    await expect(agents).toBeVisible();
    const texts = [await hero.innerText(), await agents.innerText()];
    await page
      .locator('nav[aria-label="Tier list primary sections"]')
      .getByRole("tab", { name: /^Teams/ })
      .click();
    const teams = page
      .getByRole("region", { name: "Team Ranking", exact: true })
      .getByRole("heading", { level: 2, name: "Team Ranking", exact: true })
      .locator("..");
    await expect(teams).toBeVisible();
    texts.push(await teams.innerText());
    // Existing visible static editorial inventory only, collected in each tab.
    // Persistent hero is counted once; all Pull Advice, business data and controls are excluded.
    const normalized = texts.join(" ").toLowerCase().replace(/\s+/g, " ").trim();
    const words = normalized.match(/[a-z0-9]+(?:[-'][a-z0-9]+)*/g) ?? [];
    const phrases = [
      "zzz tier list",
      "zzz character tier list",
      "zenless zone zero tier list",
      "zenless zone zero character tier list",
    ];
    const occurrences = phrases.map((phrase) => normalized.split(phrase).length - 1);
    const density = (occurrences.reduce((sum, count) => sum + count, 0) / words.length) * 100;
    expect(words).toHaveLength(101);
    expect(occurrences).toEqual([3, 1, 1, 0]);
    expect(density).toBeGreaterThanOrEqual(3);
    expect(density).toBeLessThanOrEqual(5);
    expect(occurrences[0]).toBeGreaterThan(Math.max(...occurrences.slice(1)));
    expect(normalized).not.toMatch(/mock|placeholder|production data later|2025/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
