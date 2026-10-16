import { expect, test } from "@playwright/test";

import { legalConfig } from "../../src/config/legal.config";

const legalRoutes = [
  { route: "/privacy", document: "privacy" },
  { route: "/terms", document: "terms" },
  { route: "/acceptable-use", document: "acceptable_use" },
  { route: "/refund-policy", document: "refund_policy" },
  { route: "/account-deletion", document: "account_deletion" },
] as const;

for (const { route, document } of legalRoutes) {
  test(`${route} is reachable, versioned and noindex`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);

    const expectedDocument = legalConfig.documents[document];
    await expect(
      page.getByText(
        `Version ${expectedDocument.version} · Effective ${expectedDocument.effectiveDate} · ${expectedDocument.reviewStatus}`,
        { exact: true },
      ),
    ).toBeVisible();

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
}

test("active V1 legal routes are linked from the footer", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  for (const route of ["/privacy", "/terms", "/acceptable-use", "/contact"]) {
    await expect(footer.locator(`a[href='${route}']`)).toHaveCount(1);
  }

  await expect(footer.locator("a[href='/refund-policy']")).toHaveCount(0);
  await expect(footer.locator("a[href='/account-deletion']")).toHaveCount(0);
});
