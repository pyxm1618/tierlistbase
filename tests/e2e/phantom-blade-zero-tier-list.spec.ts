import { expect, test } from "@playwright/test";

test.describe("Phantom Blade Zero tier list release", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/phantom-blade-zero/tier-list");
  });

  test("switches ranking modes and updates detail content", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Phantom Blade Zero Tier List",
    );
    await expect(page.getByTestId("p0-release-gate")).toContainText("36/36 verified locally");
    await expect(page.getByTestId("p0-release-gate")).toContainText("0 missing");

    await page.getByRole("tab", { name: "Phantom Edges" }).click();
    await page.getByRole("button", { name: /Dread Axe/ }).click();
    await expect(page.getByRole("heading", { name: "Dread Axe" })).toBeVisible();
    await expect(page.getByText("Iron Chain Breaker", { exact: true })).toBeVisible();
  });

  test("supports search, category filtering, clear, and Pending", async ({ page }) => {
    await page.getByRole("searchbox", { name: "Search main weapons" }).fill("Seamless");
    await expect(page.getByRole("button", { name: /Seamless Death/ })).toBeVisible();
    // Two independent rankings now cover Seamless Death, so it leaves Pending.
    await expect(page.locator('[aria-label="B tier"]')).toBeVisible();
    await expect(page.locator('[aria-label="Pending tier"]')).toHaveCount(0);

    await page.getByRole("button", { name: "Clear filters" }).click();
    await page.getByRole("tab", { name: "Phantom Edges" }).click();
    await page.getByRole("searchbox", { name: "Search Phantom Edges" }).fill("Hunter");
    await expect(page.getByRole("button", { name: /Hunter’s Chain Sickle/ })).toBeVisible();

    await page.getByLabel("Filter by category").selectOption("Martial");
    await expect(page.getByRole("button", { name: /Hunter’s Chain Sickle/ })).toBeVisible();
    await expect(page.locator('[aria-label="Pending tier"]')).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByRole("button", { name: /Thunder Spear/ })).toBeVisible();
  });

  test("keeps keyboard interaction and mobile layout usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("tab", { name: "Phantom Edges" }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: /Thunder Spear/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Thunder Spear" })).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
  });

  for (const width of [390, 768, 1440]) {
    test(
      "has no horizontal overflow and captures release evidence at " + width + "px",
      async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.reload({ waitUntil: "networkidle" });
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
          false,
        );
        await testInfo.attach("phantom-blade-zero-" + width + "px", {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
      },
    );
  }

  test("emits valid structured data", async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(scripts.length).toBeGreaterThan(0);
    for (const value of scripts) expect(() => JSON.parse(value)).not.toThrow();
  });

  test("loads every P0 image locally without broken requests", async ({ page }) => {
    const failedImages: string[] = [];
    page.on("response", (response) => {
      if (response.request().resourceType() === "image" && response.status() >= 400) {
        failedImages.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.reload();

    const hero = page.locator('img[data-p0-role="hero"]');
    await expect(hero).toHaveCount(1);
    await expect
      .poll(() =>
        hero.evaluate((image: HTMLImageElement) => ({
          complete: image.complete,
          width: image.naturalWidth,
          height: image.naturalHeight,
        })),
      )
      .toMatchObject({ complete: true, width: expect.any(Number), height: expect.any(Number) });
    expect(await hero.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    expect(await hero.evaluate((image: HTMLImageElement) => image.naturalHeight)).toBeGreaterThan(
      0,
    );

    async function assertTierImages(expectedCount: number) {
      const slots = page.locator("[data-tier-image-slot]");
      await expect(slots).toHaveCount(expectedCount);

      for (let index = 0; index < expectedCount; index += 1) {
        const slot = slots.nth(index);
        await slot.scrollIntoViewIfNeeded();
        await expect.poll(() => slot.locator('img[data-p0-role="tier-icon"]').count()).toBe(1);
      }

      const images = page.locator('img[data-p0-role="tier-icon"]');
      await expect(images).toHaveCount(expectedCount);
      await expect
        .poll(() =>
          images.evaluateAll((items) =>
            items.every((item) => {
              const image = item as HTMLImageElement;
              return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
            }),
          ),
        )
        .toBe(true);

      const sameOrigin = await images.evaluateAll((items) =>
        items.every((item) => {
          const image = item as HTMLImageElement;
          return (
            new URL(image.currentSrc || image.src, window.location.href).origin === location.origin
          );
        }),
      );
      expect(sameOrigin).toBe(true);
    }

    await assertTierImages(21);
    await page.getByRole("tab", { name: "Phantom Edges" }).click();
    await assertTierImages(14);

    await expect(page.getByText(/image is intentionally omitted/i)).toHaveCount(0);
    expect(failedImages).toEqual([]);
  });
});
