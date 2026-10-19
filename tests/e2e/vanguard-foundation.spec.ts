import { expect, test } from "@playwright/test";
for (const width of [390, 768, 1024, 1440, 1920]) {
  test(`Vanguard SSR foundation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let cameraRequests = 0;
    await page.exposeFunction("recordVanguardCameraRequest", () => {
      cameraRequests++;
    });
    await page.addInitScript(() => {
      if (navigator.mediaDevices)
        navigator.mediaDevices.getUserMedia = async () => {
          await (
            window as unknown as { recordVanguardCameraRequest: () => Promise<void> }
          ).recordVanguardCameraRequest();
          throw new DOMException("Denied", "NotAllowedError");
        };
    });
    const response = await page.goto("/wow-forever/vanguard?seat=WOW-W1-0001");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["permissions-policy"]).toContain("camera=(self)");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("8,016 days connect", { exact: false })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "WoW Forever Tier List", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("DEV PLACEHOLDER", { exact: false })).toBeVisible();
    expect(cameraRequests).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
test("camera remains disabled outside Vanguard", async ({ request }) => {
  const response = await request.get("/privacy");
  expect(response.headers()["permissions-policy"]).toContain("camera=()");
});
test("Vanguard class deep link selects the existing Tier List class", async ({ page }) => {
  await page.goto("/wow-forever/tier-list?class=Warrior");
  await expect(page.getByRole("button", { name: "Warrior", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
