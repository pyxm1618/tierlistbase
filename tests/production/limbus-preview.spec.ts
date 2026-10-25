import { expect, test } from "@playwright/test";

test("production keeps the staged Limbus route noindex follow without canonical or sitemap inclusion", async ({
  page,
  request,
}) => {
  const route = "/limbus-company/tier-list";
  const response = await page.goto(route);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Limbus Company Tier List – Best Identities & E.G.O Ranked");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).not.toContain(route);
});
