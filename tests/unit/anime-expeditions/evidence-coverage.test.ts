import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  RANKED_PATCH_BASELINE,
  authorityClaim,
  editorialViews,
  evidenceClassFor,
  evidenceCoverage,
  reviewStatusByEvidenceClass,
  reviewStatusMarkerByEvidenceClass,
  sourceEvidenceRoles,
  tierEvidence,
  unitEvidenceFor,
  units,
  unitViews,
  snapshot,
} from "@/modules/anime-expeditions-tier-list";

const moduleDir = path.join(process.cwd(), "src/modules/anime-expeditions-tier-list");

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(moduleDir, file), "utf8")) as T;
}

const review = readJson<{
  checked: string;
  boundary: string;
  ledger: {
    total: number;
    sourceReview: { pass: number; deferred: number; reject: number; unknown: number };
    directLiveTest: { claimed: number; notClaimed: number };
    unitEvidence: Record<string, number>;
  };
  records: {
    kind: string;
    unitId?: string;
    name: string;
    evidenceClass?: string;
    overallReconciled?: boolean;
    sourceOverallTier?: string | null;
    publishedOverallTier?: string;
    roleViewsEditorial?: boolean;
    sourceIds?: string[];
  }[];
}>("review-metadata.json");

const freshness = JSON.parse(
  readFileSync(path.join(process.cwd(), "docs/anime-expeditions/freshness-audit.json"), "utf8"),
) as {
  assessedAt: string;
  currentGameVersion: string;
  rankedPatchBaseline: string;
  evidenceSnapshotBefore: string;
  evidenceSnapshotAfter: string;
  sourceReviewDate: string;
  updateSixFound: boolean;
  rankingImpact: string;
  sources: {
    id: string;
    previousRevision: string;
    currentRevision: string;
    rankingImpact: string;
  }[];
  whatChangedOnPage: string[];
};

const unitRecords = review.records.filter((record) => record.kind === "unit");

describe("AE-01 evidence coverage cannot overclaim", () => {
  it("exposes exactly one reconcilable view and keeps the rest editorial", () => {
    // The Overall view is the only one whose scale matches a published tier list.
    expect([...unitViews]).toEqual(["Overall", "DPS", "Utility", "Support", "Crowd Control"]);
    expect([...editorialViews]).toEqual(["DPS", "Utility", "Support", "Crowd Control"]);
    expect(editorialViews).not.toContain("Overall");

    // The capture stores a single source tier, so there is no structure through
    // which a role sub-grade could be presented as a publisher placement.
    for (const record of tierEvidence.records) {
      expect(Object.keys(record).sort()).toEqual(
        ["agrees", "currentForm", "publishedOverall", "sourceLabel", "sourceTier", "unitId"].sort(),
      );
    }
  });

  it("recomputes every captured agreement from the snapshot instead of trusting the flag", () => {
    const byId = new Map(units.map((unit) => [unit.id, unit]));

    for (const record of tierEvidence.records) {
      const unit = byId.get(record.unitId);
      expect(unit, `captured unit is missing from the roster: ${record.unitId}`).toBeDefined();
      // Recompute from two independent records; never read `record.agrees` here.
      expect(unit!.viewTiers.Overall).toBe(record.publishedOverall);
      expect(record.publishedOverall === record.sourceTier).toBe(record.agrees);
    }

    expect(tierEvidence.reconciliation.agreeing).toBe(
      tierEvidence.records.filter(
        (record) => byId.get(record.unitId)!.viewTiers.Overall === record.sourceTier,
      ).length,
    );
    expect(tierEvidence.reconciliation.disagreeing).toBe(
      tierEvidence.records.length - tierEvidence.reconciliation.agreeing,
    );
  });

  it("accounts for the whole roster across ranked and unranked captures", () => {
    const captured = new Set(tierEvidence.records.map((record) => record.unitId));
    expect(captured.size).toBe(tierEvidence.records.length);
    expect(captured.size + tierEvidence.notRanked.length).toBe(units.length);

    for (const entry of tierEvidence.notRanked) {
      expect(units.some((unit) => unit.id === entry.unitId)).toBe(true);
      expect(captured.has(entry.unitId)).toBe(false);
    }
    const uncaptured = units.filter(
      (unit) => !captured.has(unit.id) && !tierEvidence.notRanked.some((e) => e.unitId === unit.id),
    );
    expect(uncaptured).toEqual([]);
  });

  it("derives the published authority numbers from the capture, not from prose", () => {
    expect(evidenceCoverage.overallReconciled).toBe(tierEvidence.reconciliation.agreeing);
    expect(evidenceCoverage.editorialOnly).toBe(tierEvidence.notRanked.length);
    expect(evidenceCoverage.roleViewsEditorial).toBe(units.length);
    expect(evidenceCoverage.disagreeing).toBe(0);
    expect(authorityClaim.overallReconciled).toBe(evidenceCoverage.overallReconciled);

    // The rendered claim must carry the derived figures; a hand-edited number fails here.
    expect(authorityClaim.short).toContain(String(evidenceCoverage.overallReconciled));
    expect(authorityClaim.short).toContain(String(evidenceCoverage.totalUnits));
    expect(authorityClaim.detailed).toContain(String(evidenceCoverage.editorialOnly));
  });

  it("marks each unit truthfully and refuses the old blanket current-meta label", () => {
    for (const unit of units) {
      const evidence = unitEvidenceFor(unit);
      const marker = reviewStatusMarkerByEvidenceClass[evidence.evidenceClass];

      expect(unit.reviewStatus).toContain("Source-reviewed");
      expect(unit.reviewStatus).toContain(marker);
      // The defect this round closes: a factual-only record must never imply a
      // current publisher ranking.
      if (evidence.evidenceClass === "factual-only") {
        expect(unit.reviewStatus).not.toContain("current ranking");
        expect(unit.reviewStatus).not.toContain("Overall reconciled");
      }
      expect(unit.reviewStatus).not.toMatch(/current meta/i);
    }
  });

  it("labels a factual-only record as editorial even when asked directly", () => {
    const unranked = tierEvidence.notRanked[0];
    expect(unranked, "the capture must record at least one unranked unit").toBeDefined();
    const unit = units.find((candidate) => candidate.id === unranked!.unitId);
    expect(unit).toBeDefined();

    expect(evidenceClassFor(unit!)).toBe("factual-only");
    expect(reviewStatusByEvidenceClass["factual-only"]).toContain("no ranking source");
    expect(reviewStatusByEvidenceClass["factual-only"]).not.toContain("Overall reconciled");
  });

  it("classifies every source the roster cites, so no source hides from the model", () => {
    for (const unit of units) {
      for (const id of unit.sourceIds) {
        expect(sourceEvidenceRoles[id], `unclassified source id: ${id}`).toBeDefined();
      }
    }
    expect(tierEvidence.source.id).toBe("pgg-update5");
    expect(sourceEvidenceRoles[tierEvidence.source.id]?.role).toBe("comparative-ranking");
  });

  it("keeps the review ledger reconciled with the derived coverage", () => {
    expect(review.ledger.total).toBe(review.records.length);
    expect(unitRecords).toHaveLength(units.length);
    expect(review.ledger.unitEvidence.overallReconciled).toBe(evidenceCoverage.overallReconciled);
    expect(review.ledger.unitEvidence.editorialOnly).toBe(evidenceCoverage.editorialOnly);
    expect(review.ledger.unitEvidence.roleViewsEditorial).toBe(units.length);
    expect(review.ledger.unitEvidence.disagreeingWithSource).toBe(0);
    expect(review.ledger.unitEvidence.rankedBySource).toBe(tierEvidence.records.length);

    const byId = new Map(units.map((unit) => [unit.id, unit]));
    for (const record of unitRecords) {
      const unit = byId.get(record.unitId!)!;
      expect(unit, `ledger record without a unit: ${record.unitId}`).toBeDefined();
      expect(record.evidenceClass).toBe(evidenceClassFor(unit));
      expect(record.publishedOverallTier).toBe(unit.viewTiers.Overall);
      expect(record.overallReconciled).toBe(evidenceClassFor(unit) === "comparative-current");
      expect(record.roleViewsEditorial).toBe(true);
    }

    // The boundary text must not resurrect a roster-wide ranking claim.
    expect(review.boundary).not.toMatch(/current meta/i);
    expect(review.boundary).toContain("editorial");
  });
});

describe("AE-02 freshness is verifiable and dated honestly", () => {
  it("keeps the three dates distinct and ordered", () => {
    expect(snapshot.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(snapshot.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(snapshot.date).not.toBe(snapshot.reviewedAt);
    // The review happens on or after the evidence cutoff.
    expect(snapshot.reviewedAt >= snapshot.date).toBe(true);
    // The ledger is stamped with the review date, not with the snapshot date.
    expect(review.checked).toBe(snapshot.reviewedAt);
  });

  it("refuses a snapshot older than the ranking revision it cites", () => {
    expect(tierEvidence.source.revisionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tierEvidence.source.revisionDate >= RANKED_PATCH_BASELINE).toBe(true);
    // A page claiming "current" while its snapshot predates the source revision is stale.
    expect(snapshot.date >= tierEvidence.source.revisionDate).toBe(true);
    expect(tierEvidence.source.capturedAt >= tierEvidence.source.revisionDate).toBe(true);
  });

  it("binds the freshness audit to the page snapshot and records the real outcome", () => {
    expect(freshness.evidenceSnapshotAfter).toBe(snapshot.date);
    expect(freshness.sourceReviewDate).toBe(snapshot.reviewedAt);
    expect(freshness.assessedAt).toBe(snapshot.reviewedAt);
    expect(freshness.sourceReviewDate >= freshness.evidenceSnapshotAfter).toBe(true);
    expect(freshness.rankedPatchBaseline).toBe(RANKED_PATCH_BASELINE);
    expect(freshness.currentGameVersion).toBe(snapshot.version.label);
    expect(freshness.evidenceSnapshotBefore < freshness.evidenceSnapshotAfter).toBe(true);
    expect(["YES", "NO"]).toContain(freshness.rankingImpact);
    expect(freshness.whatChangedOnPage.length).toBeGreaterThan(0);
  });

  it("proves the no-impact conclusion instead of asserting it", () => {
    // A recorded "no impact" is only allowed when every reconciliation actually agrees.
    if (freshness.rankingImpact === "NO") {
      expect(tierEvidence.reconciliation.disagreeing).toBe(0);
      expect(evidenceCoverage.disagreeing).toBe(0);
      expect(tierEvidence.reconciliation.agreeing).toBe(tierEvidence.records.length);
    }
    // Every source recorded as reviewed must carry a real revision pair.
    for (const source of freshness.sources) {
      expect(source.previousRevision).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.currentRevision).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.currentRevision >= source.previousRevision).toBe(true);
      expect(source.rankingImpact).toBe(freshness.rankingImpact);
    }
    // The stale baseline the first audit rejected must be gone.
    expect(freshness.sources.find((s) => s.id === "pgg-update5")?.previousRevision).toBe(
      "2026-11-02",
    );
    expect(freshness.sources.find((s) => s.id === "pgg-update5")?.currentRevision).toBe(
      "2026-11-08",
    );
  });

  it("keeps the page component from rendering lastModified as the evidence date", () => {
    // Only the rendering layer is scanned: data.ts documents the distinction in prose.
    for (const file of ["anime-expeditions-tier-list.tsx", "unit-workspace.tsx"]) {
      const source = readFileSync(path.join(moduleDir, file), "utf8");
      expect(source, `${file} must not surface the route lastModified as evidence`).not.toContain(
        "lastModified",
      );
    }
    // ...while the Evidence section does render the two real dates.
    const page = readFileSync(path.join(moduleDir, "anime-expeditions-tier-list.tsx"), "utf8");
    expect(page).toContain("snapshot.date");
    expect(page).toContain("snapshot.reviewedAt");
    expect(page).toContain("Snapshot date");
    expect(page).toContain("Source review");
  });
});
