import { expect, test, type Page } from "@playwright/test";

import { calculateKeywordDensity } from "../seo/keyword-density";
import {
  getSeoDensityGameConfigs,
  SEO_DENSITY_GAME_IDS,
  type SeoDensityGameId,
} from "../seo/keyword-density.config";

function selectedGames(): Set<SeoDensityGameId> {
  const raw = process.env.SEO_DENSITY_TARGETS?.trim();
  if (!raw) return new Set();
  if (raw === "all") return new Set(SEO_DENSITY_GAME_IDS);

  const requested = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const unknown = requested.filter(
    (value): value is string => !SEO_DENSITY_GAME_IDS.includes(value as SeoDensityGameId),
  );
  if (unknown.length > 0) throw new Error(`Unknown SEO density targets: ${unknown.join(", ")}`);
  return new Set(requested as SeoDensityGameId[]);
}

const selected = selectedGames();

async function readVisibleSeoText(page: Page, selector: string): Promise<string> {
  const elements = page.locator(selector);
  const texts: string[] = [];
  for (let index = 0; index < (await elements.count()); index += 1) {
    const element = elements.nth(index);
    if (await element.isVisible()) texts.push(await element.innerText());
  }
  return texts.join(" ");
}

for (const config of getSeoDensityGameConfigs()) {
  test(`SEO keyword density: ${config.game}`, async ({ page }) => {
    test.skip(!selected.has(config.id), "SEO density audit not selected by changed-file scope");

    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto(config.route, { waitUntil: "networkidle" });

    const content = page.locator(config.contentSelector);
    await expect(
      content.first(),
      `${config.game}: configured SEO content must exist`,
    ).toBeVisible();
    const visibleText = await readVisibleSeoText(page, config.contentSelector);

    const result = calculateKeywordDensity(visibleText, {
      primaryKeyword: config.primaryKeyword,
      secondaryKeywords: config.secondaryKeywords,
    });

    const report = {
      game: config.game,
      route: config.route,
      visibleWordCount: result.visibleWordCount,
      primaryKeyword: result.primaryKeyword,
      primaryOccurrences: result.primaryOccurrences,
      secondaryKeywords: config.secondaryKeywords,
      secondaryOccurrences: result.secondaryOccurrences,
      keywordGroupOccurrences: result.keywordGroupOccurrences,
      keywordGroupDensityPct: Number(result.keywordGroupDensityPct.toFixed(3)),
      primaryDominance: result.primaryDominance ? "PASS" : "FAIL",
      densityGate: result.densityGate ? "PASS" : "FAIL",
      verdict: result.pass ? "PASS" : "FAIL",
      configurationWarnings: config.configurationWarnings,
    };

    console.log(`SEO_KEYWORD_DENSITY ${JSON.stringify(report)}`);

    expect(result.visibleWordCount, `${config.game}: visible SEO word count`).toBeGreaterThan(0);
    expect(
      result.primaryDominance,
      `${config.game}: primary occurrences must exceed every secondary keyword`,
    ).toBe(true);
    expect(
      result.densityGate,
      `${config.game}: keyword-group density must be between 3% and 5%`,
    ).toBe(true);
  });
}
