import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";
import { localePath } from "@/platform/i18n/routing";

function tokenize(value: string): string[] {
  return value.toLocaleLowerCase("en-US").match(/[\p{L}\p{N}]+/gu) ?? [];
}

function countPhrase(words: readonly string[], phrase: string): number {
  const wanted = tokenize(phrase);
  if (wanted.length === 0 || wanted.length > words.length) return 0;
  let count = 0;
  for (let index = 0; index <= words.length - wanted.length; index += 1) {
    if (wanted.every((word, offset) => words[index + offset] === word)) count += 1;
  }
  return count;
}

const genshinKeywordGroup = [
  "genshin tier list",
  "genshin impact tier list",
  "genshin character tier list",
  "genshin impact character tier list",
] as const;

const genshinVisibleCopySelectors = [
  '[data-ia-section="page-header"] h1',
  '[data-ia-section="page-header"] p',
  '[data-ia-section="tier-board"] h2',
  '[data-ia-section="changes"] h2',
  '[data-ia-section="changes"] > p',
  '[data-ia-section="methodology"] h2',
  '[data-ia-section="methodology"] > p',
  '[data-ia-section="methodology"] li',
  '[data-ia-section="sources"] h2',
  '[data-ia-section="sources"] > p',
  '[data-ia-section="sources"] ol li',
  '[data-ia-section="tier-definitions"] h2',
  '[data-ia-section="tier-definitions"] > p',
  '[data-ia-section="tier-definitions"] dt',
  '[data-ia-section="tier-definitions"] dd',
  '[data-ia-section="faq"] h2',
  '[data-ia-section="faq"] summary',
] as const;

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
    const visibleWords = tokenize(visibleText);
    const keywordWords = [...new Set(tokenize(route.primaryKeyword))];
    const visibleWordSet = new Set(visibleWords);
    const coveredKeywordWords = keywordWords.filter((word) => visibleWordSet.has(word));
    const coverage =
      keywordWords.length === 0 ? 0 : coveredKeywordWords.length / keywordWords.length;
    const exactOccurrences = countPhrase(visibleWords, route.primaryKeyword);
    const densityPct = Number(
      ((exactOccurrences / Math.max(visibleWords.length, 1)) * 100).toFixed(3),
    );

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

    if (route.route === "/genshin-impact/tier-list") {
      const visibleCopy: string[] = [];
      for (const selector of genshinVisibleCopySelectors) {
        const texts = await page.locator(selector).allInnerTexts();
        visibleCopy.push(...texts.map((text) => text.trim()).filter(Boolean));
      }
      const visibleMainWords = tokenize(visibleCopy.join(" "));
      const phraseStats = genshinKeywordGroup.map((phrase) => {
        const occurrences = countPhrase(visibleMainWords, phrase);
        return {
          phrase,
          occurrences,
          densityPct: Number(
            ((occurrences / Math.max(visibleMainWords.length, 1)) * 100).toFixed(3),
          ),
        };
      });
      const combinedOccurrences = phraseStats.reduce((sum, phrase) => sum + phrase.occurrences, 0);
      const combinedDensityPct = Number(
        ((combinedOccurrences / Math.max(visibleMainWords.length, 1)) * 100).toFixed(3),
      );

      console.log(
        JSON.stringify({
          event: "genshin_keyword_group_audit",
          visibleMainContentWords: visibleMainWords.length,
          phraseStats,
          combinedOccurrences,
          combinedDensityPct,
        }),
      );

      expect(
        combinedDensityPct,
        "Genshin keyword group density must be at least 3%",
      ).toBeGreaterThanOrEqual(3);
      expect(
        combinedDensityPct,
        "Genshin keyword group density must not exceed 5%",
      ).toBeLessThanOrEqual(5);
      const primaryOccurrences = phraseStats[0]!.occurrences;
      for (const variant of phraseStats.slice(1)) {
        expect(
          primaryOccurrences,
          `primary keyword must outrank ${variant.phrase}`,
        ).toBeGreaterThan(variant.occurrences);
      }
    }

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

test("WoW visible main-content keyword group stays within the approved SEO range", async ({
  page,
}) => {
  const wow = routeRegistry.get("/wow-forever/tier-list");
  if (wow.class !== "public_indexable") throw new Error("WoW route must remain indexable");
  expect(wow.primaryKeyword).toBe("wow tier list");
  expect(wow.secondaryKeywords).toContain("wow forever tier list");
  expect(wow.title).toBe("WoW Tier List – WoW Forever Dungeon Spec Rankings");
  expect(wow.h1).toBe("WoW Tier List");

  await page.goto("/wow-forever/tier-list", { waitUntil: "networkidle" });
  const words = tokenize(await page.locator("main").innerText());
  const primaryOccurrences = countPhrase(words, "wow tier list");
  const variantOccurrences = countPhrase(words, "wow forever tier list");
  const primaryDensity = (primaryOccurrences / Math.max(words.length, 1)) * 100;
  const variantDensity = (variantOccurrences / Math.max(words.length, 1)) * 100;
  console.log(
    JSON.stringify({
      event: "wow_visible_main_keyword_group_audit",
      visibleWords: words.length,
      primaryOccurrences,
      primaryDensityPct: Number(primaryDensity.toFixed(3)),
      variantOccurrences,
      variantDensityPct: Number(variantDensity.toFixed(3)),
      combinedDensityPct: Number((primaryDensity + variantDensity).toFixed(3)),
    }),
  );
  const combinedDensity = primaryDensity + variantDensity;
  expect(words.length).toBeGreaterThan(0);
  expect(combinedDensity).toBeGreaterThanOrEqual(3);
  expect(combinedDensity).toBeLessThanOrEqual(5);
  expect(primaryDensity).toBeGreaterThan(variantDensity);

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(JSON.stringify(schemas.map((schema) => JSON.parse(schema)))).toContain(
    '"name":"WoW Tier List"',
  );
});

test("production sitemap is exactly the registered localized indexable surface", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
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
