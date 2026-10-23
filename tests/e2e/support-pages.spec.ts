import { expect, test } from "@playwright/test";

const viewports = [390, 768, 1024, 1440, 1920] as const;

test("support artwork assets resolve", async ({ request }) => {
  for (const path of [
    "/images/support/about-hero.webp",
    "/images/support/404-hero.webp",
    "/images/support/error-hero.webp",
  ] as const) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});

test("About page uses shared site chrome and links to both live tier lists", async ({ page }) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About TierListBase");
  await expect(page).toHaveTitle("About TierListBase");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /clear, context-aware tier rankings/i,
  );
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  const schema = await page.locator('main script[type="application/ld+json"]').textContent();
  expect(JSON.parse(schema ?? "null")).toMatchObject({
    "@type": "AboutPage",
    name: "About TierListBase",
  });

  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");

  await expect(page.getByRole("link", { name: /World of Warcraft: Forever/ })).toHaveAttribute(
    "href",
    "/wow-forever/tier-list",
  );
  await expect(page.getByRole("link", { name: /Genshin Impact/ }).last()).toHaveAttribute(
    "href",
    "/genshin-impact/tier-list",
  );

  const heroArtwork = page.locator("main img").first();
  await expect(heroArtwork).toBeVisible();
  await expect(heroArtwork).toHaveAttribute("alt", "");
  await expect(heroArtwork).toHaveAttribute(
    "src",
    /images%2Fsupport%2Fabout-hero\.webp|images\/support\/about-hero\.webp/,
  );
});

test("unknown route renders branded 404 with a real 404 response", async ({ page }) => {
  const path = "/__tierlistbase_not_found_test__";
  const response = await page.goto(path);
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page Not Found");
  await expect(
    page.getByText("The page you're looking for doesn't exist or may have moved."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  const artwork = page.locator("main img").first();
  await expect(artwork).toHaveAttribute("alt", "");
  await expect(artwork).toHaveAttribute(
    "src",
    /images%2Fsupport%2F404-hero\.webp|images\/support\/404-hero\.webp/,
  );
});

for (const width of viewports) {
  test(`About and branded 404 remain fluid at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });

    const aboutResponse = await page.goto("/about");
    expect(aboutResponse?.status()).toBe(200);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /World of Warcraft: Forever/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Genshin Impact/ }).last()).toBeVisible();

    const notFoundResponse = await page.goto("/__tierlistbase_not_found_test__");
    expect(notFoundResponse?.status()).toBe(404);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible();
  });
}
