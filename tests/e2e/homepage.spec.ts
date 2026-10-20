import { seedGenshinTestDatabase } from "../genshin-tier-list/database";
import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";

test("homepage renders the approved game-discovery information architecture", async ({ page }) => {
  const home = routeRegistry.get("/");
  if (home.class !== "public_indexable") throw new Error("homepage must be indexable");

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(home.h1);
  await expect(page).toHaveTitle(home.title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    home.description,
  );
  await expect(page.getByRole("heading", { name: "Explore Tier Lists" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why TierListBase?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest Updates" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Popular Rankings" })).toBeVisible();
  await expect(page.locator("a[href='/wow-forever/tier-list']").first()).toBeVisible();
  await expect(page.locator("a[href='/genshin-impact/tier-list']").first()).toBeVisible();

  const primaryNav = page.getByRole("navigation", { name: "Primary navigation" });
  const wowNav = primaryNav.getByRole("link", { name: "World of Warcraft" });
  const genshinNav = primaryNav.getByRole("link", { name: "Genshin Impact" });
  await expect(wowNav).toBeVisible();
  await expect(genshinNav).toBeVisible();
  await expect(wowNav).not.toHaveAttribute("aria-current", "page");
  await expect(genshinNav).not.toHaveAttribute("aria-current", "page");
  expect(await wowNav.getAttribute("class")).not.toContain("border-b-2");
  expect(await genshinNav.getAttribute("class")).not.toContain("border-b-2");

  await expect(
    page.getByText("Explore current Genshin Impact character rankings backed by reviewed data."),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Open the Genshin Impact tier list page. Verified rankings will appear as reviewed data is published.",
    ),
  ).toHaveCount(0);

  const popular = page.locator("#popular-rankings");
  const readyRankings = popular.locator("a.tlb-popular-item");
  await expect(readyRankings).toHaveCount(2);
  await expect(popular.getByRole("link", { name: "Open WoW ranking: DPS" })).toHaveAttribute(
    "href",
    "/wow-forever/tier-list?mode=dungeon&role=dps&level=30",
  );
  await expect(
    popular.getByRole("link", { name: "Open Genshin ranking: Characters" }),
  ).toHaveAttribute("href", "/genshin-impact/tier-list");
  await expect(popular.getByLabel("WoW PvP: coming soon")).toBeVisible();
  await expect(popular.getByLabel("WoW Leveling: coming soon")).toBeVisible();
  await expect(popular.getByLabel("Spiral Abyss: coming soon")).toBeVisible();
  await expect(popular.getByLabel("Exploration : coming soon")).toBeVisible();

  const heroImage = page.locator(".tlb-hero-art img");
  await expect(heroImage).toHaveAttribute(
    "src",
    /images%2Fhome%2Fhero\.webp|images\/home\/hero\.webp/,
  );
  await expect(heroImage).toHaveAttribute("loading", "eager");
  await expect(heroImage).toHaveAttribute("fetchpriority", "high");
  await expect(heroImage).toHaveAttribute("srcset", /hero-768\.webp/);
  await expect(heroImage).toHaveAttribute("sizes", /\(max-width:\s*700px\)/);
  expect(await heroImage.getAttribute("src")).not.toContain("/_next/image");
  const heroCurrentSrc = await heroImage.evaluate((el) => (el as HTMLImageElement).currentSrc);
  expect(heroCurrentSrc).toMatch(/\/images\/home\/hero.*\.webp/);
  expect(heroCurrentSrc).not.toContain("/_next/image");

  const heroResponse = await page.request.get("/images/home/hero.webp");
  expect(heroResponse.status()).toBe(200);

  const imagePreloads = page.locator('link[rel="preload"][as="image"]');
  await expect(imagePreloads).toHaveCount(1);
  await expect(imagePreloads).toHaveAttribute(
    "imagesrcset",
    /images%2Fhome%2Fhero-768\.webp|images\/home\/hero-768\.webp/,
  );
  await expect(imagePreloads).toHaveAttribute("fetchpriority", "high");

  const gameImages = page.locator(".tlb-game-grid .tlb-card-image img");
  await expect(gameImages).toHaveCount(2);
  for (const gameImage of await gameImages.all()) {
    await expect(gameImage).toHaveAttribute("loading", "lazy");
    await expect(gameImage).not.toHaveAttribute("fetchpriority", "high");
    await expect(gameImage).toHaveAttribute("srcset", /384w/);
    await expect(gameImage).toHaveAttribute("sizes", /.+/);
    await expect(gameImage).toHaveAttribute("src", /images\/home\/(?:wow|genshin)\.webp/);
    expect(await gameImage.getAttribute("src")).not.toContain("/_next/image");
  }

  await expect(page.getByText(/best online tool/i)).toHaveCount(0);

  const html = await response?.text();
  expect(html).toContain("Explore Tier Lists");
});

for (const width of [390, 768, 1024, 1440, 1920, 2560]) {
  test(
    "homepage " + width + "px viewport uses a fluid layout without horizontal overflow",
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto("/");
      expect(response?.status()).toBe(200);

      const dimensions = await page.evaluate(() => {
        const shell = document.querySelector(".tlb-shell");
        if (!shell) throw new Error("homepage shell missing");
        return {
          documentWidth: document.documentElement.scrollWidth,
          shellWidth: shell.getBoundingClientRect().width,
        };
      });
      expect(dimensions.documentWidth).toBeLessThanOrEqual(width + 1);
      expect(dimensions.shellWidth).toBeGreaterThan(
        width >= 2560 ? 1700 : width >= 1920 ? 1500 : width * 0.8,
      );
    },
  );
}

test("WoW route remains navigable and ranked content remains intact", async ({ page }) => {
  await page.goto("/");
  const link = page.locator("a[href='/wow-forever/tier-list']").first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/wow-forever\/tier-list/);

  const target = routeRegistry.get("/wow-forever/tier-list");
  if (target.class !== "public_indexable") throw new Error("target route must be indexable");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(target.h1);
  await expect(page.getByRole("heading", { name: "Quick Insights" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources & Evidence" })).toBeVisible();
});

test("game navigation active state follows pathname only", async ({ page }) => {
  const primaryNav = page.getByRole("navigation", { name: "Primary navigation" });
  const wowNav = primaryNav.getByRole("link", { name: "World of Warcraft" });
  const genshinNav = primaryNav.getByRole("link", { name: "Genshin Impact" });

  await page.goto("/");
  await expect(wowNav).not.toHaveAttribute("aria-current", "page");
  await expect(genshinNav).not.toHaveAttribute("aria-current", "page");

  await page.goto("/wow-forever/tier-list?mode=dungeon&role=dps&level=30");
  await expect(wowNav).toHaveAttribute("aria-current", "page");
  await expect(genshinNav).not.toHaveAttribute("aria-current", "page");

  await page.goto("/genshin-impact/tier-list?mode=spiral-abyss");
  await expect(wowNav).not.toHaveAttribute("aria-current", "page");
  await expect(genshinNav).toHaveAttribute("aria-current", "page");
});

test("Genshin tier-list route remains public and clickable", async ({ page }) => {
  await seedGenshinTestDatabase();

  const response = await page.goto("/genshin-impact/tier-list");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Genshin Tier List");
  await expect(page.getByText("Current Genshin Tier List", { exact: true })).toBeVisible();
});

test("cross-route prefetch isolation: Genshin and WoW pages do not leak Home Hero preload or requests", async ({
  page,
}) => {
  if (process.env.TEST_DATABASE_URL) {
    await seedGenshinTestDatabase();
  }

  // B. Directly visit /genshin-impact/tier-list
  const genshinRequests: string[] = [];
  page.on("request", (req) => genshinRequests.push(req.url()));
  await page.goto("/genshin-impact/tier-list", { waitUntil: "networkidle" });

  const genshinPreloads = page.locator('link[rel="preload"][as="image"]');
  if (process.env.TEST_DATABASE_URL) {
    await expect(genshinPreloads).toHaveCount(1);
    await expect(genshinPreloads).toHaveAttribute("href", /hero-f958fb67df/);
  }
  await expect(
    page.locator('head link[rel="preload"][imagesrcset*="/images/home/hero-"]'),
  ).toHaveCount(0);

  const genshinTimings = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((url) => url.includes("/images/home/hero-")),
  );
  expect(genshinTimings).toEqual([]);
  expect(genshinRequests.filter((url) => url.includes("/images/home/hero-"))).toEqual([]);

  // C. Directly visit /wow-forever/tier-list
  const wowRequests: string[] = [];
  page.on("request", (req) => wowRequests.push(req.url()));
  await page.goto("/wow-forever/tier-list", { waitUntil: "networkidle" });

  const wowPreloads = page.locator('link[rel="preload"][as="image"]');
  await expect(wowPreloads).toHaveCount(1);
  await expect(wowPreloads).toHaveAttribute("href", /hero-3b7bb10711/);
  await expect(
    page.locator('head link[rel="preload"][imagesrcset*="/images/home/hero-"]'),
  ).toHaveCount(0);

  const wowTimings = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((url) => url.includes("/images/home/hero-")),
  );
  expect(wowTimings).toEqual([]);
  expect(wowRequests.filter((url) => url.includes("/images/home/hero-"))).toEqual([]);
});

test("homepage critical CSS delivers only required layout and page styles without meta-board leakage", async ({
  page,
  request,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const cssLinks = await page
    .locator('head link[rel="stylesheet"]')
    .evaluateAll((elements) => elements.map((el) => (el as HTMLLinkElement).href));

  // Marketing layout provides globals.css and homepage provides game-home.css.
  // The leaked 35KB wow-tier-list / meta-board CSS must never appear.
  expect(cssLinks.length, `homepage stylesheets:\n${cssLinks.join("\n")}`).toBeLessThanOrEqual(2);

  for (const href of cssLinks) {
    const res = await request.get(href);
    expect(res.status()).toBe(200);
    const cssText = await res.text();
    // Verify no leaked WoW tier board or spec card rules
    expect(cssText).not.toContain("wow-tier-list");
    expect(cssText).not.toContain("specCard");
    expect(cssText).not.toContain("methodology");
  }

  // Header logo verification
  const logo = page.locator("header img").first();
  await expect(logo).toBeVisible();
  const logoSrc = await logo.getAttribute("src");
  expect(logoSrc).toMatch(/\/brand\/tierlistbase-mark-[a-f0-9]+\.webp/);
  await expect(logo).toHaveAttribute("srcset", /72w.*108w/);
  await expect(logo).toHaveAttribute("sizes", "36px");

  const logoResponse = await request.get(logoSrc!);
  expect(logoResponse.status()).toBe(200);
  const logoBytes = (await logoResponse.body()).length;
  // Optimized logo must be strictly under 5KB (down from 10.6KB)
  expect(logoBytes).toBeLessThan(5000);
});

test("header logo delivers dual-tier responsive candidates matching DPR (72w on mobile DPR 1.75 and 108w on DPR 3)", async ({
  browser,
  request,
}) => {
  // 1. Static asset verification: both hashed candidates exist with controlled bytes
  const res72 = await request.get("/brand/tierlistbase-mark-b3364d1d87.webp");
  expect(res72.status()).toBe(200);
  const bytes72 = (await res72.body()).length;
  expect(bytes72).toBeLessThan(4500);

  const res108 = await request.get("/brand/tierlistbase-mark-2c18ba5849.webp");
  expect(res108.status()).toBe(200);
  const bytes108 = (await res108.body()).length;
  expect(bytes108).toBeLessThan(6500);

  // 2. Lighthouse Mobile context (DPR ≈ 1.75) must select 72w candidate
  const mobileContext = await browser.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("/", { waitUntil: "domcontentloaded" });
  const mobileLogo = mobilePage.locator("header img").first();
  await expect(mobileLogo).toHaveAttribute("srcset", /72w.*108w/);
  await expect(mobileLogo).toHaveAttribute("sizes", "36px");
  const mobileCurrentSrc = await mobileLogo.evaluate((el) => (el as HTMLImageElement).currentSrc);
  expect(mobileCurrentSrc).toContain("tierlistbase-mark-b3364d1d87.webp");
  await mobileContext.close();

  // 3. Super Retina / 3x DPR context must select 108w candidate
  const retinaContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3.0,
  });
  const retinaPage = await retinaContext.newPage();
  await retinaPage.goto("/", { waitUntil: "domcontentloaded" });
  const retinaLogo = retinaPage.locator("header img").first();
  const retinaCurrentSrc = await retinaLogo.evaluate((el) => (el as HTMLImageElement).currentSrc);
  expect(retinaCurrentSrc).toContain("tierlistbase-mark-2c18ba5849.webp");
  await retinaContext.close();
});
