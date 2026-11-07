import { expect, test } from "@playwright/test";

const routes = [
  { label: "ZZZ", path: "/zenless-zone-zero/tier-list" },
  { label: "NIKKE", path: "/nikke/tier-list" },
] as const;
const viewports = [390, 768, 1440, 1920] as const;

for (const route of routes) {
  for (const width of viewports) {
    test(`${route.label} P0 image final audit at ${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 900 });

      const imageRequests: string[] = [];
      const imageResponses: Array<{ url: string; status: number; bytes: number }> = [];
      const imageConsoleErrors: string[] = [];

      page.on("request", (request) => {
        if (request.resourceType() === "image") imageRequests.push(request.url());
      });
      page.on("response", (response) => {
        if (response.request().resourceType() !== "image") return;
        imageResponses.push({
          url: response.url(),
          status: response.status(),
          bytes: Number(response.headers()["content-length"] ?? 0),
        });
      });
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        if (/(image|img|_next\/image|\.png|\.webp)/i.test(message.text())) {
          imageConsoleErrors.push(message.text());
        }
      });

      const response = await page.goto(route.path, { waitUntil: "load" });
      expect(response?.status()).toBe(200);
      await expect(page.locator("main")).toBeVisible();
      expect(await page.evaluate(() => document.readyState)).toBe("complete");

      await page.evaluate(async () => {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        for (let y = 0; y < document.body.scrollHeight; y += Math.max(innerHeight - 120, 300)) {
          scrollTo(0, y);
          await sleep(40);
        }
        scrollTo(0, 0);
        await sleep(200);
      });

      const imageHealth = await page.locator("main img").evaluateAll((images) => ({
        total: images.length,
        loaded: images.filter((image) => {
          const img = image as HTMLImageElement;
          return img.complete && img.naturalWidth > 0;
        }).length,
        broken: images.filter((image) => {
          const img = image as HTMLImageElement;
          return img.complete && img.naturalWidth === 0;
        }).length,
      }));
      expect(imageHealth.total).toBeGreaterThan(0);
      expect(imageHealth.loaded).toBeGreaterThan(0);
      expect(imageHealth.broken).toBe(0);
      expect(imageConsoleErrors).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );

      const nextImageResponses = imageResponses.filter((item) => item.url.includes("/_next/image"));
      expect(nextImageResponses.length).toBeGreaterThan(0);
      expect(nextImageResponses.filter((item) => item.status !== 200)).toEqual([]);

      const oldPngRequests = imageRequests.filter((requestUrl) => {
        const url = new URL(requestUrl);
        const source =
          url.pathname === "/_next/image" ? (url.searchParams.get("url") ?? "") : url.pathname;
        return /\.png(?:$|\?)/i.test(source);
      });
      expect(oldPngRequests).toEqual([]);

      const hugeDirectAssets = imageResponses.filter(
        (item) => !item.url.includes("/_next/image") && item.bytes > 600 * 1024,
      );
      expect(hugeDirectAssets).toEqual([]);

      if (route.label === "NIKKE") {
        const feature = await page
          .locator('main div[aria-label$=" avatar"]')
          .evaluateAll((containers) => {
            const container = containers.find((candidate) => {
              const box = candidate.getBoundingClientRect();
              return box.width >= 131 && box.width <= 133;
            });
            const image = container?.querySelector("img") as HTMLImageElement | null;
            return container && image
              ? { width: container.getBoundingClientRect().width, currentSrc: image.currentSrc }
              : null;
          });
        expect(feature).not.toBeNull();
        expect(feature?.width).toBeGreaterThanOrEqual(131);
        expect(feature?.width).toBeLessThanOrEqual(133);
        expect(feature?.currentSrc).toContain("/_next/image");
        const source = new URL(feature!.currentSrc).searchParams.get("url");
        expect(source).toContain(".webp");
      }
    });
  }
}
