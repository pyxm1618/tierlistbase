export const SEO_KEYWORD_DENSITY_MIN_PCT = 3;
export const SEO_KEYWORD_DENSITY_MAX_PCT = 5;

export type KeywordDensityInput = {
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
};

export type KeywordDensityResult = {
  visibleWordCount: number;
  primaryKeyword: string;
  primaryOccurrences: number;
  secondaryOccurrences: Record<string, number>;
  keywordGroupOccurrences: number;
  keywordGroupDensityPct: number;
  primaryDominance: boolean;
  densityGate: boolean;
  pass: boolean;
};

export function tokenizeSeoVisibleText(value: string): string[] {
  return value.toLocaleLowerCase("en-US").match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function calculateKeywordDensity(
  visibleText: string,
  input: KeywordDensityInput,
): KeywordDensityResult {
  const words = tokenizeSeoVisibleText(visibleText);
  const phrases = [input.primaryKeyword, ...input.secondaryKeywords];
  const candidates = phrases
    .map((phrase, order) => ({
      phrase,
      order,
      words: tokenizeSeoVisibleText(phrase),
    }))
    .filter((candidate) => candidate.words.length > 0)
    .sort((a, b) => b.words.length - a.words.length || a.order - b.order);

  const counts = Object.fromEntries(phrases.map((phrase) => [phrase, 0])) as Record<string, number>;

  for (let index = 0; index < words.length; ) {
    const match = candidates.find(
      (candidate) =>
        candidate.words.length <= words.length - index &&
        candidate.words.every((word, offset) => words[index + offset] === word),
    );

    if (!match) {
      index += 1;
      continue;
    }

    counts[match.phrase] = (counts[match.phrase] ?? 0) + 1;
    index += match.words.length;
  }

  const primaryOccurrences = counts[input.primaryKeyword] ?? 0;
  const secondaryOccurrences = Object.fromEntries(
    input.secondaryKeywords.map((keyword) => [keyword, counts[keyword] ?? 0]),
  );
  const keywordGroupOccurrences =
    primaryOccurrences +
    Object.values(secondaryOccurrences).reduce((sum, occurrences) => sum + occurrences, 0);
  const keywordGroupDensityPct =
    words.length === 0 ? 0 : (keywordGroupOccurrences / words.length) * 100;
  const primaryDominance = Object.values(secondaryOccurrences).every(
    (occurrences) => primaryOccurrences > occurrences,
  );
  const densityGate =
    keywordGroupDensityPct >= SEO_KEYWORD_DENSITY_MIN_PCT &&
    keywordGroupDensityPct <= SEO_KEYWORD_DENSITY_MAX_PCT;

  return {
    visibleWordCount: words.length,
    primaryKeyword: input.primaryKeyword,
    primaryOccurrences,
    secondaryOccurrences,
    keywordGroupOccurrences,
    keywordGroupDensityPct,
    primaryDominance,
    densityGate,
    pass: primaryDominance && densityGate,
  };
}
