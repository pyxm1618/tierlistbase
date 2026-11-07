import { expect, test, type Page } from "@playwright/test";

import { calculateKeywordDensity } from "../seo/keyword-density";
import {
  assertSeoDensityResult,
  getSeoDensityTargetConfigs,
  parseSeoDensityMode,
  SEO_DENSITY_TARGET_IDS,
  type SeoDensityTargetId,
} from "../seo/keyword-density.config";

function selectedTargets(): Set<SeoDensityTargetId> {
  const raw = process.env.SEO_DENSITY_TARGETS?.trim();
  if (!raw) return new Set();
  if (raw === "all") return new Set(SEO_DENSITY_TARGET_IDS);

  const requested = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const unknown = requested.filter(
    (value): value is string => !SEO_DENSITY_TARGET_IDS.includes(value as SeoDensityTargetId),
  );
  if (unknown.length > 0) throw new Error(`Unknown SEO density targets: ${unknown.join(", ")}`);
  return new Set(requested as SeoDensityTargetId[]);
}

const selected = selectedTargets();
const mode = parseSeoDensityMode();

async function readVisibleSeoText(page: Page, selector: string): Promise<string> {
  const elements = page.locator(selector);
  const texts: string[] = [];

  for (let index = 0; index < (await elements.count()); index += 1) {
    const element = elements.nth(index);
    if (!(await element.isVisible())) continue;

    const text = await element.evaluate((root) => {
      const excluded =
        '[aria-hidden="true"],[hidden],script,style,template,button,input,select,textarea,[role="button"],[role="tab"],[role="dialog"],[role="tooltip"]';
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const parts: string[] = [];

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const parent = node.parentElement;
        if (!parent || parent.closest(excluded)) continue;

        let hiddenByStyle = false;
        for (
          let current: HTMLElement | null = parent;
          current && root.contains(current);
          current = current.parentElement
        ) {
          const style = getComputedStyle(current);
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            style.visibility === "collapse"
          ) {
            hiddenByStyle = true;
            break;
          }
        }
        if (hiddenByStyle || parent.getClientRects().length === 0) continue;

        const value = node.textContent?.replace(/\s+/g, " ").trim();
        if (value) parts.push(value);
      }

      return parts.join(" ");
    });

    if (text) texts.push(text);
  }

  return texts.join(" ");
}

test("SEO editorial reader excludes hidden and non-editorial UI", async ({ page }) => {
  test.skip(selected.size === 0, "SEO density audit not selected by changed-file scope");

  await page.setContent(`
    <main>
      <section id="editorial">
        <h1>Visible Editorial Heading</h1>
        <p>Visible editorial paragraph.</p>
        <span aria-hidden="true">ARIA HIDDEN COPY</span>
        <p hidden>HIDDEN ATTRIBUTE COPY</p>
        <p style="display:none">CSS HIDDEN COPY</p>
        <button type="button">CONTROL COPY</button>
        <div role="dialog">DYNAMIC DETAIL COPY</div>
      </section>
    </main>
  `);

  const text = await readVisibleSeoText(page, "#editorial");
  expect(text).toContain("Visible Editorial Heading");
  expect(text).toContain("Visible editorial paragraph.");
  expect(text).not.toContain("ARIA HIDDEN COPY");
  expect(text).not.toContain("HIDDEN ATTRIBUTE COPY");
  expect(text).not.toContain("CSS HIDDEN COPY");
  expect(text).not.toContain("CONTROL COPY");
  expect(text).not.toContain("DYNAMIC DETAIL COPY");
});

for (const config of getSeoDensityTargetConfigs()) {
  test(`SEO keyword density: ${config.label}`, async ({ page }) => {
    test.skip(!selected.has(config.id), "SEO density audit not selected by changed-file scope");

    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto(config.route, { waitUntil: "networkidle" });

    const textParts = [await readVisibleSeoText(page, config.contentSelector)];
    for (const view of config.additionalViews ?? []) {
      const trigger = page.locator(view.activateSelector);
      await expect(trigger).toBeVisible();
      await trigger.click();
      await expect(page.locator(view.contentSelector).first()).toBeVisible();
      textParts.push(await readVisibleSeoText(page, view.contentSelector));
    }
    const visibleText = textParts.filter(Boolean).join(" ");

    const result = calculateKeywordDensity(visibleText, {
      primaryKeyword: config.primaryKeyword,
      secondaryKeywords: config.secondaryKeywords,
    });

    const report = {
      target: config.label,
      route: config.route,
      mode,
      contentSelector: config.contentSelector,
      additionalViews: config.additionalViews ?? [],
      scopeDescription: config.scopeDescription,
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

    expect(result.visibleWordCount, `${config.label}: visible SEO word count`).toBeGreaterThan(0);
    assertSeoDensityResult(result, mode, config.label);
  });
}
