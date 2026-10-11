import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  summarizeBoardEvidence,
  type MetaBoardData,
  type BoardEntityItem,
} from "@/modules/meta-board";
import {
  EvidenceSummary,
  ExpertDataView,
  MetaBoardHeader,
  QuickInsights,
  SourceOverview,
  MetaBoardFaq,
} from "@/modules/meta-board";

// Synthetic fixtures are limited to tests; no production source ingestion.
const empty: MetaBoardData = {
  game: null,
  version: null,
  activeContext: null,
  availableModes: [],
  availableRoles: [],
  availableLevels: [],
  availableBuilds: [],
  tiers: [],
  hasData: false,
};

const source = {
  sourceId: "synthetic-source",
  sourceName: "Synthetic Expert",
  sourceUrl: "https://example.com/test",
  sourceType: "expert",
  publisher: "Test",
  publishedAt: null,
  updatedAtSource: null,
  checkedAt: new Date("2026-10-10T00:00:00Z"),
  rawTier: "S",
  rawRank: null,
  rawScore: null,
  normalizedTier: "S",
  normalizedScore: null,
  sourceFreshness: "unconfigured",
  versionMatch: true,
  notes: null,
};
const entity: BoardEntityItem = {
  entityId: "synthetic-entity",
  entityName: "Synthetic Class",
  entitySlug: "synthetic-class",
  entityType: "class",
  role: "dps",
  tier: "S",
  currentContextLabel: "Synthetic Overall",
  versionString: "synthetic",
  buildString: null,
  consensusScore: null,
  sourceCount: 99,
  agreeingSourceCount: 99,
  agreementRatio: 1,
  disagreementLevel: "unconfigured",
  dataStatus: "available",
  freshnessStatus: "current",
  whyThisTier: null,
  strengths: null,
  constraints: null,
  lastUpdated: new Date("2026-10-09T00:00:00Z"),
  latestTierChange: null,
  tierChanges: [],
  sources: [source],
};
const populated: MetaBoardData = {
  ...empty,
  hasData: true,
  version: {
    id: "synthetic-version",
    version: "synthetic",
    build: null,
    levelCap: 60,
    status: "current",
  },
  activeContext: {
    id: "synthetic-context",
    slug: "synthetic",
    mode: "overall",
    role: "all",
    levelCap: 30,
    label: "Synthetic Overall",
  },
  tiers: [
    {
      tier: "S",
      items: [
        entity,
        { ...entity, entityId: "second-entity", sources: [{ ...source, normalizedTier: null }] },
      ],
    },
  ],
};

describe("Meta board presentation evidence", () => {
  it("counts unique sources separately from ratings and never inflates counts from stored badges", () => {
    const summary = summarizeBoardEvidence(populated);
    expect(summary.sources).toHaveLength(1);
    expect(summary.ratingCount).toBe(2);
    expect(summary.agreeingRatingCount).toBe(1);
    expect(summary.unmappedRatingCount).toBe(1);
    expect(summary.dataSourceCount).toBe(0);
    expect(summary.status).toBe("preliminary");
  });

  it("does not equate missing sources with current evidence or available statistical data", () => {
    const summary = summarizeBoardEvidence({
      ...populated,
      tiers: [{ tier: "S", items: [{ ...entity, sources: [] }] }],
    });
    expect(summary.status).toBe("preliminary");
    expect(summary.dataSourceCount).toBe(0);
  });

  it("preserves stale evidence and only marks fully current evidence Current", () => {
    const board = (sourceFreshness: string) => ({
      ...populated,
      tiers: [{ tier: "S", items: [{ ...entity, sources: [{ ...source, sourceFreshness }] }] }],
    });
    expect(summarizeBoardEvidence(board("stale")).status).toBe("stale");
    expect(summarizeBoardEvidence(board("current")).status).toBe("current");
  });

  it("renders honest empty states and all presentation sections in server HTML", () => {
    const html = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(MetaBoardHeader, { data: empty }),
        createElement(QuickInsights),
        createElement(EvidenceSummary, { data: empty }),
        createElement(ExpertDataView, { data: empty }),
        createElement(SourceOverview, { data: empty }),
        createElement(MetaBoardFaq),
      ),
    );
    for (const text of [
      "Quick Insights",
      "Most Stable",
      "Strong for Leveling",
      "Most Disputed",
      "Biggest Mover",
      "Evidence &amp; Trust",
      "Expert / Data View",
      "Not available yet",
      "Current Sources",
      "No reviewed sources published for this context yet.",
      "FAQ / Methodology",
    ])
      expect(html).toContain(text);
    expect(html).not.toContain("82.7");
  });

  it("shows actual source ratings while keeping unverified Patch/Build match unknown", () => {
    const html = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(MetaBoardHeader, { data: populated }),
        createElement(ExpertDataView, { data: populated }),
        createElement(SourceOverview, { data: populated }),
      ),
    );
    expect(html).toContain("Level Cap: 30");
    expect(html).toContain("Synthetic Expert");
    expect(html.replace(/<[^>]+>/g, "")).toContain("Patch / Build match: Unknown");
    expect(html).toContain("Not available yet");
  });
});
