import { expect, test } from "@playwright/test";
import { routeRegistry } from "@/config/routes.config";
for (const width of [390, 768, 1024, 1440, 1920]) {
  test(`Vanguard SSR foundation at ${width}px`, async ({ page }) => {
    test.skip(
      !routeRegistry.routes.some((route) => route.route === "/wow-forever/vanguard"),
      "The neutral product does not register the Vanguard page",
    );
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
    const response = await page.goto("/wow-forever/vanguard");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["permissions-policy"]).toContain("camera=(self)");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Monument Stage", exact: true })
        .getByText("8,016 days connect", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "WoW Forever Tier List", exact: true }).first(),
    ).toBeVisible();
    await expect(
      page
        .locator('img[src="/wow-forever/vanguard/monument/vanguard-hero-base-desktop.png"]')
        .first(),
    ).toBeVisible();
    await expect(page.locator("[data-monument-stage]")).toHaveCount(1);
    await expect(page.locator("canvas")).toHaveCount(0);
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
test("manifest returns a compact public ETag representation and 304", async ({ request }) => {
  const response = await request.get("/api/vanguard/manifest");
  expect(response.status()).toBe(200);
  const etag = response.headers().etag;
  expect(etag).toMatch(/^"[a-f0-9]{64}"$/);
  expect(response.headers()["cache-control"]).toBe("public, max-age=5, must-revalidate");
  const payload = await response.json();
  expect(JSON.stringify(payload)).not.toMatch(/email|user_id|google|displayName|guildName/);
  const unchanged = await request.get("/api/vanguard/manifest", {
    headers: { "If-None-Match": etag! },
  });
  expect(unchanged.status()).toBe(304);
});
test("final supplied WAV is served directly with immutable cache", async ({ request }) => {
  const response = await request.get("/wow-forever/vanguard/audio/vanguard-focus-open.wav");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
  expect((await response.body()).subarray(0, 4).toString()).toBe("RIFF");
});
