import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { Unit } from "@/modules/anime-expeditions-tier-list/types";
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

/**
 * R3C-AE-02 external anchor.
 *
 * `tierEvidence.json`, `review-metadata.json` and `data.ts` are all repository
 * truth: a change that edits the evidence capture and the expected local metadata
 * together still satisfies every test above. The frozen publisher capture below is
 * the independent party in the chain, so `tierEvidence.json` no longer proves
 * itself; the digest and both reconciliation links start from the external file.
 */
const captureDir = path.join(process.cwd(), "docs/anime-expeditions/source-captures");
const captureFile = "docs/anime-expeditions/source-captures/pgg-tier-list-2026-11-08.json";

type ExternalSourceCapture = {
  source: {
    id: string;
    url: string;
    sourceRevision: string;
    captureDate: string;
    scale: string;
    scaleLevels: readonly string[];
  };
  externalTiers: Record<string, readonly string[]>;
  externalCounts: Record<string, number>;
  notRankedBySource: readonly { externalPresence: string; note: string }[];
  labelResolution: { entries: Record<string, string> };
};

type CaptureProvenance = {
  captureFile: string;
  sourceCaptureSha256: string;
  capturedAt: string;
  source: { id: string; url: string; sourceRevision: string };
};

const externalCapture = JSON.parse(
  readFileSync(path.join(process.cwd(), captureFile), "utf8"),
) as ExternalSourceCapture;

const captureProvenance = JSON.parse(
  readFileSync(path.join(captureDir, "provenance.json"), "utf8"),
) as CaptureProvenance;

type CaptureRow = { tier: string; label: string };
type ReconcilableRecord = { unitId: string; sourceTier: string };

function captureRows(capture: ExternalSourceCapture): CaptureRow[] {
  return Object.entries(capture.externalTiers).flatMap(([tier, labels]) =>
    labels.map((label) => ({ tier, label })),
  );
}

/**
 * The whole external chain in one pure function: external label -> internal unit
 * -> captured external tier, compared against both the evidence capture and the
 * published Overall view. Any link that disagrees is returned, never dropped.
 */
function reconcileExternalCapture(
  capture: ExternalSourceCapture,
  roster: readonly Unit[],
  records: readonly ReconcilableRecord[],
) {
  const rows = captureRows(capture);
  const resolution = capture.labelResolution.entries;
  const resolved = new Map<string, string>();
  const unresolved: string[] = [];

  for (const row of rows) {
    const unitId = resolution[row.label];
    if (unitId === undefined) unresolved.push(row.label);
    else resolved.set(row.label, unitId);
  }

  const rosterById = new Map(roster.map((unit) => [unit.id, unit]));
  const evidenceById = new Map(records.map((record) => [record.unitId, record]));

  const disagreements = rows.flatMap((row) => {
    const unitId = resolved.get(row.label);
    if (unitId === undefined) return [];
    const publishedTier = rosterById.get(unitId)?.viewTiers.Overall ?? null;
    const evidenceTier = evidenceById.get(unitId)?.sourceTier ?? null;
    if (publishedTier === row.tier && evidenceTier === row.tier) return [];
    return [{ label: row.label, unitId, externalTier: row.tier, evidenceTier, publishedTier }];
  });

  const counts = Object.fromEntries(
    Object.entries(capture.externalTiers).map(([tier, labels]) => [tier, labels.length]),
  );

  return { rows, resolved, unresolved, disagreements, counts, total: rows.length };
}

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

  it("never describes the snapshot date as the source-review pass", () => {
    const page = readFileSync(path.join(moduleDir, "anime-expeditions-tier-list.tsx"), "utf8");

    // The rejected wording stated that the snapshot date records the review pass.
    expect(page).not.toMatch(/snapshot date records the source-?review pass/i);

    // Whatever sentence explains freshness must still separate the two jobs.
    const freshnessCopy = page
      .split("\n")
      .filter((line) => /snapshot date/i.test(line) && /review/i.test(line));
    expect(freshnessCopy.length).toBeGreaterThan(0);
    for (const line of freshnessCopy) {
      expect(line).toMatch(/reconciled/i);
      expect(line).toMatch(/recheck|review date/i);
    }
  });
});

describe("AE-02 external capture is the independent party", () => {
  it("pins the frozen publisher capture to an immutable digest", () => {
    const actual = createHash("sha256")
      .update(readFileSync(path.join(process.cwd(), captureFile)))
      .digest("hex");

    expect(actual).toBe(captureProvenance.sourceCaptureSha256);
    expect(captureProvenance.captureFile).toBe(captureFile);
    // The digest must be long enough to be a real sha256, not a placeholder.
    expect(captureProvenance.sourceCaptureSha256).toMatch(/^[0-9a-f]{64}$/);
    // Provenance and capture must describe the same external revision.
    expect(captureProvenance.source.id).toBe(externalCapture.source.id);
    expect(captureProvenance.source.url).toBe(externalCapture.source.url);
    expect(captureProvenance.source.sourceRevision).toBe(externalCapture.source.sourceRevision);
    expect(captureProvenance.capturedAt).toBe(externalCapture.source.captureDate);
  });

  it("counts the publisher's own buckets, not the repository's", () => {
    // Hard-coded external counts: they may only change by re-reading the live page.
    expect(reconcileExternalCapture(externalCapture, units, tierEvidence.records).counts).toEqual({
      S: 32,
      A: 23,
      B: 9,
      C: 5,
      D: 6,
    });
    expect(externalCapture.externalCounts).toMatchObject({ S: 32, A: 23, B: 9, C: 5, D: 6 });
    expect(externalCapture.externalCounts.total).toBe(75);
    expect(Object.keys(externalCapture.externalTiers).sort()).toEqual(
      [...externalCapture.source.scaleLevels].sort(),
    );
  });

  it("keeps the publisher's labels instead of rewriting them to internal ids", () => {
    const rows = captureRows(externalCapture);
    expect(rows).toHaveLength(75);

    // The publisher prints the bottom two buckets as "Unit / Character"; a capture
    // normalised to TierListBase names would have lost that, and with it the
    // evidence that this was transcribed from outside.
    for (const tier of ["C", "D"]) {
      const labels = externalCapture.externalTiers[tier] ?? [];
      expect(labels.length).toBeGreaterThan(0);
      for (const label of labels) expect(label).toContain(" / ");
    }
    // Carrot appears twice at different tiers; a de-duplicating capture would lose one.
    expect(rows.filter((row) => row.label.startsWith("Carrot"))).toHaveLength(2);

    // A capture reverse-generated from repository data could only contain repository
    // names. These publisher rows carry source-side text no repository field holds.
    const internalLabels = new Set([
      ...tierEvidence.records.map((record) => record.sourceLabel),
      ...units.map((unit) => unit.currentForm),
    ]);
    const sourceOnlyLabels = rows.filter((row) => !internalLabels.has(row.label));
    expect(sourceOnlyLabels.length).toBeGreaterThan(20);
  });

  it("resolves every captured external label to exactly one unit", () => {
    const reconciliation = reconcileExternalCapture(externalCapture, units, tierEvidence.records);
    const labels = reconciliation.rows.map((row) => row.label);

    expect(new Set(labels).size).toBe(labels.length);
    expect(reconciliation.unresolved).toEqual([]);
    expect(reconciliation.resolved.size).toBe(labels.length);

    const ids = [...reconciliation.resolved.values()];
    // One unit cannot occupy two external rows.
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(units.some((unit) => unit.id === id)).toBe(true);
  });

  it("reconciles the external capture against the evidence capture and the published tier", () => {
    const reconciliation = reconcileExternalCapture(externalCapture, units, tierEvidence.records);

    expect(reconciliation.total).toBe(75);
    expect(reconciliation.disagreements).toEqual([]);

    const capturedIds = [...reconciliation.resolved.values()];
    expect(capturedIds.sort()).toEqual(tierEvidence.records.map((record) => record.unitId).sort());

    // Both links are asserted separately: a poisoned evidence file and a poisoned
    // ranking view each have to fail on their own.
    for (const row of reconciliation.rows) {
      const unitId = reconciliation.resolved.get(row.label)!;
      const unit = units.find((candidate) => candidate.id === unitId)!;
      const evidence = tierEvidence.records.find((record) => record.unitId === unitId)!;
      expect(evidence.sourceTier, `${row.label} evidence tier`).toBe(row.tier);
      expect(unit.viewTiers.Overall, `${row.label} published Overall`).toBe(row.tier);
    }

    // The two units the publisher does not rank stay editorial rather than invented.
    const notRanked = tierEvidence.notRanked.map((entry) => entry.unitId).sort();
    expect(notRanked).toEqual(["cube", "suited-alchemist"]);
    for (const id of notRanked) expect(capturedIds).not.toContain(id);
    expect(capturedIds.length + notRanked.length).toBe(units.length);
    expect(externalCapture.notRankedBySource).toHaveLength(notRanked.length);
  });

  it("binds the capture revision to the snapshot and the review date", () => {
    expect(externalCapture.source.sourceRevision).toBe(tierEvidence.source.revisionDate);
    expect(externalCapture.source.sourceRevision).toBe(snapshot.date);
    expect(externalCapture.source.captureDate).toBe(snapshot.reviewedAt);
    // The review is a recheck of a dated revision, never a claim that the revision moved.
    expect(externalCapture.source.captureDate >= externalCapture.source.sourceRevision).toBe(true);
    expect(snapshot.reviewedAt >= snapshot.date).toBe(true);
    expect(externalCapture.source.id).toBe(tierEvidence.source.id);
    expect(externalCapture.source.url).toBe(tierEvidence.source.url);
  });

  it("fails when the external capture and the repository disagree", () => {
    const baseline = reconcileExternalCapture(externalCapture, units, tierEvidence.records);
    // Guard against an always-failing comparator making the mutations below meaningless.
    expect(baseline.disagreements).toEqual([]);

    const victim = baseline.rows.find((row) => row.tier === "S")!;
    const victimId = baseline.resolved.get(victim.label)!;

    // 1. The capturer records the wrong external tier.
    const movedCapture = structuredClone(externalCapture);
    movedCapture.externalTiers[victim.tier] = movedCapture.externalTiers[victim.tier]!.filter(
      (label) => label !== victim.label,
    );
    movedCapture.externalTiers.D = [...movedCapture.externalTiers.D!, victim.label];
    const moved = reconcileExternalCapture(movedCapture, units, tierEvidence.records);
    expect(moved.disagreements).toHaveLength(1);
    expect(moved.disagreements[0]).toMatchObject({
      label: victim.label,
      externalTier: "D",
      evidenceTier: "S",
    });

    // 2. tier-evidence.json is edited to agree with a wrong tier.
    const tamperedEvidence = tierEvidence.records.map((record) =>
      record.unitId === victimId ? { ...record, sourceTier: "D" } : record,
    );
    const tampered = reconcileExternalCapture(externalCapture, units, tamperedEvidence);
    expect(tampered.disagreements).toHaveLength(1);
    expect(tampered.disagreements[0]).toMatchObject({
      unitId: victimId,
      externalTier: "S",
      evidenceTier: "D",
      publishedTier: "S",
    });

    // 3. The published Overall grade drifts away from the source.
    const tamperedRoster = units.map((unit) =>
      unit.id === victimId
        ? { ...unit, viewTiers: { ...unit.viewTiers, Overall: "D" as const } }
        : unit,
    );
    const drifted = reconcileExternalCapture(externalCapture, tamperedRoster, tierEvidence.records);
    expect(drifted.disagreements).toHaveLength(1);
    expect(drifted.disagreements[0]).toMatchObject({
      unitId: victimId,
      externalTier: "S",
      publishedTier: "D",
    });

    // 4. A label that cannot be resolved is reported, never silently skipped.
    const orphaned = structuredClone(externalCapture);
    delete orphaned.labelResolution.entries[victim.label];
    const orphan = reconcileExternalCapture(orphaned, units, tierEvidence.records);
    expect(orphan.unresolved).toEqual([victim.label]);
    expect(orphan.resolved.size).toBe(baseline.rows.length - 1);
  });
});
