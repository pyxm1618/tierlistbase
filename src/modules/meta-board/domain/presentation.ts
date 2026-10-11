import type { MetaBoardData, SourceEvidenceItem } from "../db/queries";

export function evidenceDate(value: Date | null): string {
  return value ? new Date(value).toISOString().slice(0, 10) : "Unknown";
}

// Presentation counts come from the same evidence shown in the drawer, not cached totals.
export function summarizeBoardEvidence(data: MetaBoardData) {
  const entities = data.tiers.flatMap((group) => group.items);
  const sourcesById = new Map<string, SourceEvidenceItem>();
  let ratingCount = 0;
  let agreeingRatingCount = 0;
  let unmappedRatingCount = 0;
  for (const entity of entities) {
    for (const source of entity.sources) {
      sourcesById.set(source.sourceId, source);
      ratingCount++;
      if (!source.normalizedTier) unmappedRatingCount++;
      else if (source.normalizedTier.toUpperCase() === entity.tier.toUpperCase())
        agreeingRatingCount++;
    }
  }
  const sources = [...sourcesById.values()];
  const freshnessCounts = { current: 0, preliminary: 0, stale: 0, unknown: 0 };
  for (const source of sources) {
    switch (source.sourceFreshness) {
      case "current":
        freshnessCounts.current++;
        break;
      case "preliminary":
        freshnessCounts.preliminary++;
        break;
      case "stale":
        freshnessCounts.stale++;
        break;
      default:
        freshnessCounts.unknown++;
    }
  }
  const status =
    data.version?.status === "stale" ||
    freshnessCounts.stale > 0 ||
    entities.some((entity) => entity.freshnessStatus === "stale")
      ? "stale"
      : data.hasData &&
          data.version?.status === "current" &&
          sources.length > 0 &&
          freshnessCounts.current === sources.length &&
          entities.every((entity) => entity.freshnessStatus === "current")
        ? "current"
        : "preliminary";
  const latestTimestamp =
    entities.length > 0
      ? Math.max(...entities.map((entity) => new Date(entity.lastUpdated).getTime()))
      : null;
  return {
    entities,
    sources,
    ratingCount,
    agreeingRatingCount,
    unmappedRatingCount,
    differingRatingCount: ratingCount - agreeingRatingCount - unmappedRatingCount,
    dataSourceCount: sources.filter((source) => source.sourceType === "data").length,
    freshnessCounts,
    status,
    lastUpdated: latestTimestamp === null ? null : new Date(latestTimestamp),
  };
}
