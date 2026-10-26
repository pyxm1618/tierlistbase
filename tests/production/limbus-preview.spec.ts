import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";

test("production indexes the final Limbus route with canonical and sitemap inclusion", async ({
  page,
  request,
}) => {
  const route = "/limbus-company/tier-list";
  const canonical = `${routeRegistry.site.canonicalOrigin}${route}`;
  const response = await page.goto(route);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Limbus Company Tier List – Best Identities & E.G.O Ranked");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain(canonical);
});
