import { describe, expect, test } from "vitest";

import {
  calculateKeywordDensity,
  SEO_KEYWORD_DENSITY_MAX_PCT,
  SEO_KEYWORD_DENSITY_MIN_PCT,
} from "../../seo/keyword-density";

function hundredWords(keyword: string, occurrences: number): string {
  return [
    ...Array.from({ length: occurrences }, () => keyword),
    ...Array.from({ length: 100 - occurrences }, (_, index) => `filler${index}`),
  ].join(" ");
}

describe("SEO keyword density calculator", () => {
  test("matches case-insensitively", () => {
    const result = calculateKeywordDensity("GENSHIN TIER LIST is useful", {
      primaryKeyword: "genshin tier list",
      secondaryKeywords: [],
    });
    expect(result.primaryOccurrences).toBe(1);
  });

  test("requires exact consecutive phrase tokens", () => {
    const result = calculateKeywordDensity("genshin amazing tier list", {
      primaryKeyword: "genshin tier list",
      secondaryKeywords: [],
    });
    expect(result.primaryOccurrences).toBe(0);
  });

  test("uses longest-match-first with non-overlapping matches", () => {
    const result = calculateKeywordDensity("game tier list tier list", {
      primaryKeyword: "tier list",
      secondaryKeywords: ["game tier list"],
    });
    expect(result.primaryOccurrences).toBe(1);
    expect(result.secondaryOccurrences["game tier list"]).toBe(1);
    expect(result.keywordGroupOccurrences).toBe(2);
  });

  test("does not token-weight a four-word keyword", () => {
    const result = calculateKeywordDensity("wild rift champion tier list filler", {
      primaryKeyword: "wild rift champion tier list",
      secondaryKeywords: [],
    });
    expect(result.primaryOccurrences).toBe(1);
    expect(result.keywordGroupOccurrences).toBe(1);
    expect(result.keywordGroupDensityPct).toBeCloseTo(100 / 6);
  });

  test("primary dominance compares primary against every secondary", () => {
    const result = calculateKeywordDensity("alpha alpha beta gamma", {
      primaryKeyword: "alpha",
      secondaryKeywords: ["beta", "gamma"],
    });
    expect(result.primaryDominance).toBe(true);
  });

  test("accepts the inclusive 3 percent lower boundary", () => {
    const result = calculateKeywordDensity(hundredWords("alpha", 3), {
      primaryKeyword: "alpha",
      secondaryKeywords: [],
    });
    expect(result.keywordGroupDensityPct).toBe(SEO_KEYWORD_DENSITY_MIN_PCT);
    expect(result.densityGate).toBe(true);
  });

  test("accepts the inclusive 5 percent upper boundary", () => {
    const result = calculateKeywordDensity(hundredWords("alpha", 5), {
      primaryKeyword: "alpha",
      secondaryKeywords: [],
    });
    expect(result.keywordGroupDensityPct).toBe(SEO_KEYWORD_DENSITY_MAX_PCT);
    expect(result.densityGate).toBe(true);
  });

  test("fails below 3 percent", () => {
    const result = calculateKeywordDensity(hundredWords("alpha", 2), {
      primaryKeyword: "alpha",
      secondaryKeywords: [],
    });
    expect(result.densityGate).toBe(false);
  });

  test("fails above 5 percent", () => {
    const result = calculateKeywordDensity(hundredWords("alpha", 6), {
      primaryKeyword: "alpha",
      secondaryKeywords: [],
    });
    expect(result.densityGate).toBe(false);
  });

  test("reports zero occurrences without division errors", () => {
    const result = calculateKeywordDensity("one two three", {
      primaryKeyword: "missing",
      secondaryKeywords: ["also missing"],
    });
    expect(result.keywordGroupOccurrences).toBe(0);
    expect(result.keywordGroupDensityPct).toBe(0);
    expect(result.pass).toBe(false);
  });

  test("handles multiple secondary keywords under one shared matcher", () => {
    const result = calculateKeywordDensity("alpha alpha beta gamma delta", {
      primaryKeyword: "alpha",
      secondaryKeywords: ["beta", "gamma", "delta"],
    });
    expect(result.secondaryOccurrences).toEqual({ beta: 1, gamma: 1, delta: 1 });
    expect(result.primaryDominance).toBe(true);
  });
});
