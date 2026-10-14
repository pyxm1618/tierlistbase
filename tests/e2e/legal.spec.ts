import { expect, test } from "@playwright/test";

const legalRoutes = [
  { route: "/privacy", version: "draft-2" },
  { route: "/terms", version: "draft-1" },
  { route: "/acceptable-use", version: "draft-1" },
  { route: "/refund-policy", version: "draft-1" },
  { route: "/account-deletion", version: "draft-1" },
] as const;

for (const { route, version } of legalRoutes) {
  test(`${route} is reachable, versioned and noindex`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText(new RegExp(`Version ${version}`, "i"))).toBeVisible();
    await expect(page.getByText(/ · draft$/i)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
}

test("every legal route is linked from the footer", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  for (const { route } of legalRoutes) {
    await expect(footer.locator(`a[href='${route}']`)).toHaveCount(1);
  }
  await expect(footer.locator("a[href='/contact']")).toHaveCount(1);
});
