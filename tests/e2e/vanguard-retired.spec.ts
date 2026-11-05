import { expect, test } from "@playwright/test";

test("retired Vanguard public URL is gone and undiscoverable", async ({ page, request }) => {
  const getResponse = await request.get("/wow-forever/vanguard");
  expect(getResponse.status()).toBe(410);
  expect(getResponse.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(await getResponse.text()).toBe("Gone");

  const headResponse = await request.head("/wow-forever/vanguard");
  expect(headResponse.status()).toBe(410);
  expect(headResponse.headers()["x-robots-tag"]).toBe("noindex, nofollow");

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Vanguard Monument", exact: true })).toHaveCount(0);
});
