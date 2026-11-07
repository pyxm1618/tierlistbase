import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";
import { localePath } from "@/platform/i18n/routing";
import { calculateKeywordDensity, tokenizeSeoVisibleText } from "../seo/keyword-density";
import { seedWowPresentationFixtures } from "../meta-board/wow-fixtures";

test.beforeAll(async () => {
  if (process.env.TEST_DATABASE_URL) {
    await seedWowPresentationFixtures();
  }
});

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

test("production rendered SEO matches the route registry", async ({ page }) => {
  const sitemapEntries = new Map(
    routeRegistry.sitemapEntries().map((entry) => [entry.route, entry.canonical] as const),
  );

  for (const route of routeRegistry.indexable()) {
    const response = await page.goto(route.route, { waitUntil: "networkidle" });
    expect(response?.status(), `${route.route}: HTTP status`).toBe(200);
    const xRobotsTag = response?.headers()["x-robots-tag"]?.toLowerCase() ?? "";
    const headerMessage = `${route.route}: production indexable route must not emit HTTP noindex/nofollow`;
    expect(xRobotsTag, headerMessage).not.toMatch(/\b(noindex|nofollow)\b/);

    const canonical = sitemapEntries.get(route.route);
    expect(canonical, `${route.route}: sitemap canonical exists`).toBeTruthy();
    const renderedCanonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(renderedCanonical, `${route.route}: canonical exists`).toBeTruthy();
    expect(new URL(renderedCanonical!).toString()).toBe(new URL(canonical!).toString());

    const robots = (await page.locator('meta[name="robots"]').getAttribute("content")) ?? "";
    expect(
      robots.toLocaleLowerCase("en-US"),
      `${route.route}: must remain indexable`,
    ).not.toContain("noindex");

    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      route.description,
    );

    const h1 = page.locator("h1");
    await expect(h1, `${route.route}: exactly one H1`).toHaveCount(1);
    await expect(h1).toHaveText(route.h1);

    const headings = await page.locator("h1,h2,h3,h4,h5,h6").allTextContents();
    expect(
      headings.every((heading) => heading.trim().length > 0),
      `${route.route}: headings must not be empty UI placeholders`,
    ).toBe(true);

    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(schemas.length, `${route.route}: structured data exists`).toBeGreaterThan(0);
    for (const schema of schemas) expect(() => JSON.parse(schema)).not.toThrow();

    const visibleText = await page.locator("body").innerText();
    const visibleWords = tokenizeSeoVisibleText(visibleText);
    const keywordWords = [...new Set(tokenizeSeoVisibleText(route.primaryKeyword))];
    const visibleWordSet = new Set(visibleWords);
    const coveredKeywordWords = keywordWords.filter((word) => visibleWordSet.has(word));
    const coverage =
      keywordWords.length === 0 ? 0 : coveredKeywordWords.length / keywordWords.length;
    const primaryAudit = calculateKeywordDensity(visibleText, {
      primaryKeyword: route.primaryKeyword,
      secondaryKeywords: [],
    });
    const exactOccurrences = primaryAudit.primaryOccurrences;
    const densityPct = Number(primaryAudit.keywordGroupDensityPct.toFixed(3));

    console.log(
      JSON.stringify({
        event: "rendered_seo_topic_audit",
        route: route.route,
        primaryKeyword: route.primaryKeyword,
        visibleWords: visibleWords.length,
        exactOccurrences,
        densityPct,
        tokenCoverage: coverage,
      }),
    );
    expect(
      coverage,
      `${route.route}: primary keyword tokens must be present in visible content`,
    ).toBe(1);

    const renderedInternalPaths = new Set(
      await page.locator('a[href^="/"]').evaluateAll((links) =>
        links.flatMap((link) => {
          const href = link.getAttribute("href");
          if (!href) return [];
          return [new URL(href, location.origin).pathname];
        }),
      ),
    );
    for (const relatedRoute of route.relatedRoutes) {
      const related = routeRegistry.get(relatedRoute);
      if (related.class !== "public_indexable") continue;
      expect(
        renderedInternalPaths.has(related.route),
        `${route.route}: declared indexable related route must be rendered: ${related.route}`,
      ).toBe(true);
    }

    const csp = response?.headers()["content-security-policy"] ?? "";
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(response?.headers()["strict-transport-security"]).toBe(
      "max-age=31536000; includeSubDomains",
    );
  }
});

test("WoW production SEO keeps the approved registry and structured data contracts", async ({
  page,
}) => {
  const wow = routeRegistry.get("/wow-forever/tier-list");
  if (wow.class !== "public_indexable") throw new Error("WoW route must remain indexable");
  expect(wow.primaryKeyword).toBe("wow tier list");
  expect(wow.secondaryKeywords).toContain("wow forever tier list");
  expect(wow.title).toBe("WoW Tier List – WoW Forever Dungeon Spec Rankings");
  expect(wow.h1).toBe("WoW Tier List");

  await page.goto("/wow-forever/tier-list", { waitUntil: "networkidle" });

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(JSON.stringify(schemas.map((schema) => JSON.parse(schema)))).toContain(
    '"name":"WoW Tier List"',
  );
});

test("NIKKE production SEO is indexable", async ({ page, request }) => {
  const nikke = routeRegistry.get("/nikke/tier-list");
  expect(nikke.class).toBe("public_indexable");
  if (nikke.class !== "public_indexable") throw new Error("NIKKE route must be indexable");
  expect(nikke.primaryKeyword).toBe("nikke tier list");
  expect(nikke.secondaryKeywords).toEqual([
    "nikke character tier list",
    "goddess of victory nikke tier list",
    "goddess of victory nikke character tier list",
  ]);
  expect(nikke.title).toBe("NIKKE Tier List – Best Characters in Goddess of Victory: NIKKE");
  expect(nikke.description).toBe(
    "Explore the Goddess of Victory: NIKKE tier list with current character rankings, tier explanations, strengths, limitations, and team context for the best NIKKE characters.",
  );
  expect(nikke.h1).toBe("NIKKE Tier List");

  const response = await page.goto("/nikke/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("NIKKE Tier List – Best Characters in Goddess of Victory: NIKKE");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Explore the Goddess of Victory: NIKKE tier list with current character rankings, tier explanations, strengths, limitations, and team context for the best NIKKE characters.",
  );
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("NIKKE Tier List");

  const robots = (
    (await page.locator('meta[name="robots"]').getAttribute("content")) ?? ""
  ).toLocaleLowerCase("en-US");
  expect(robots).not.toContain("noindex");
  expect(robots).toContain("index");
  expect(robots).toContain("follow");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.tierlistbase.com/nikke/tier-list",
  );

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schemas.length).toBeGreaterThan(0);
  const serializedSchemas = JSON.stringify(schemas.map((schema) => JSON.parse(schema)));
  expect(serializedSchemas).toContain('"@type":"WebApplication"');
  expect(serializedSchemas).not.toMatch(/AggregateRating|Review|Offer|FAQPage|BreadcrumbList/);

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(
    /Mock summary|Mock date|Coming Soon|layout validation|placeholder ranking/i,
  );

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://www.tierlistbase.com/nikke/tier-list");
});

test("production sitemap is exactly the registered localized indexable surface", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const contentType = response.headers()["content-type"]?.toLowerCase() ?? "";
  expect(contentType).toContain("application/xml");
  const xRobotsTag = response.headers()["x-robots-tag"]?.toLowerCase() ?? "";
  const sitemapHeaderMessage = "production sitemap must not emit HTTP noindex/nofollow";
  expect(xRobotsTag, sitemapHeaderMessage).not.toMatch(/\b(noindex|nofollow)\b/);
  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => decodeXml(match[1]!))
    .sort();
  const origin = routeRegistry.site.canonicalOrigin.replace(/\/+$/, "");
  const expected = routeRegistry
    .sitemapEntries()
    .flatMap((entry) =>
      routeRegistry.site.supportedLocales.map(
        (locale) => `${origin}${localePath(routeRegistry.site, locale, entry.route)}`,
      ),
    )
    .sort();
  expect(locs).toEqual(expected);
});

test("production legal surfaces remain noindex and outside the sitemap", async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const legalNoindexRoutes = routeRegistry.routes.filter(
    (route) => route.class === "public_noindex" && route.pageType === "Legal",
  );

  for (const route of legalNoindexRoutes) {
    const response = await page.goto(route.route, { waitUntil: "networkidle" });
    expect(response?.status(), `${route.route}: HTTP status`).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
    expect(sitemap, `${route.route}: must not enter sitemap`).not.toContain(
      `${routeRegistry.site.canonicalOrigin}${route.route}`,
    );
  }
});

test("WoW query filters preserve the base canonical and fixed Beta scope", async ({ page }) => {
  await page.goto("/wow-forever/tier-list");
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toBeTruthy();
  await page.goto("/wow-forever/tier-list?role=tank&mode=pvp&level=60&build=old");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical!);
  await expect(page.locator("h1")).toHaveText("WoW Tier List");
  await expect(page.locator("main")).toContainText("Level 30 Beta");
  await expect(page.locator("main")).not.toContainText("Level 60");
});
