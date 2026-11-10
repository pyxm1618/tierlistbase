import type { Unit, UnitView } from "./types";
import { units } from "./data";
import tierEvidenceDocument from "./tier-evidence.json";

/**
 * Round 3C remediation (R3C-AE-01 / R3C-AE-02).
 *
 * The page publishes five views. Only one of them is directly comparable to a
 * published ranking: `Overall` uses the same five-level S–D scale as the
 * comparative tier list, so a placement can be reconciled one-to-one. The DPS,
 * Utility, Support and Crowd Control views introduce an S+ level that no source
 * publishes, so those sub-grades stay TierListBase editorial and must never be
 * described as publisher placements.
 *
 * Coverage is derived from the checked-in evidence capture rather than typed into
 * prose, so the published claim cannot drift away from the evidence behind it.
 */
export type RankingEvidenceClass = "comparative-current" | "factual-only";

type SourceEvidenceRole = {
  /** What this source can legitimately support. */
  readonly role: "comparative-ranking" | "factual" | "obtainment";
  /** Revision of the source used by the ranking reconciliation. */
  readonly rankingRevision?: string;
  /** True only when that revision is not older than the ranked patch baseline. */
  readonly current: boolean;
};

/** Release date of the ranked patch baseline (Update 5 · Hallows Eve). */
export const RANKED_PATCH_BASELINE = "2026-11-01";

export const sourceEvidenceRoles: Readonly<Record<string, SourceEvidenceRole>> = {
  // Comparative ranking sources — the only sources allowed to support a ranked claim.
  "pgg-update5": { role: "comparative-ranking", rankingRevision: "2026-11-08", current: true },
  "current-unit-role-crosscheck": {
    role: "comparative-ranking",
    rankingRevision: "2026-11-05",
    current: true,
  },
  // Published before Update 5, so it corroborates a role read but cannot certify a placement.
  "wiki-ranking": { role: "comparative-ranking", rankingRevision: "2026-10-08", current: false },
  // Page-level role cross-check only: no unit record cites it as its own evidence.
  "mrguider-update5": { role: "comparative-ranking", rankingRevision: "2026-11-01", current: true },

  // Factual sources: kits, stats, identity, equipment rules, dated patch notes.
  "unit-data": { role: "factual", current: false },
  "current-wiki": { role: "factual", current: false },
  mirror: { role: "factual", current: false },
  "update4-gameplay": { role: "factual", current: false },
  "official-hollow-trailer": { role: "factual", current: false },
  "hollow-calendar": { role: "factual", current: false },
  "draconic-patch": { role: "factual", current: false },
  "sandbox-capacity": { role: "factual", current: false },
  traits: { role: "factual", current: false },
  "equipment-data": { role: "factual", current: false },
  "equipment-rules": { role: "factual", current: false },
  official: { role: "factual", current: false },

  // Obtainment sources: availability only, never a ranking input.
  "summer-obtainment": { role: "obtainment", current: false },
  "current-event-history": { role: "obtainment", current: false },
  "update3-obtainment": { role: "obtainment", current: false },
  "current-roster-obtainment": { role: "obtainment", current: false },
  "crimson-captain-obtainment": { role: "obtainment", current: false },
};

export const tierEvidence = tierEvidenceDocument;

const reconciledById = new Map(tierEvidenceDocument.records.map((entry) => [entry.unitId, entry]));

/** Views whose grade a published source does not supply. */
export const editorialViews: readonly UnitView[] = ["DPS", "Utility", "Support", "Crowd Control"];

export type UnitEvidence = {
  readonly unitId: string;
  readonly evidenceClass: RankingEvidenceClass;
  /** The published placement for the Overall view, when the source ranks the unit. */
  readonly sourceOverallTier: string | null;
  readonly agreesWithSource: boolean;
  readonly comparativeSourceIds: readonly string[];
  readonly factualSourceIds: readonly string[];
  readonly obtainmentSourceIds: readonly string[];
};

function sourceIdsWhere(unit: Unit, role: SourceEvidenceRole["role"]): string[] {
  return unit.sourceIds.filter((id) => sourceEvidenceRoles[id]?.role === role);
}

export function evidenceClassFor(unit: Unit): RankingEvidenceClass {
  const reconciled = reconciledById.get(unit.id);
  return reconciled?.agrees ? "comparative-current" : "factual-only";
}

/**
 * The published review label. "Overall reconciled" is reserved for units whose
 * Overall placement matches the captured source tier; a unit with no captured
 * placement is labelled as an editorial read.
 */
export const reviewStatusByEvidenceClass: Readonly<Record<RankingEvidenceClass, string>> = {
  "comparative-current":
    "Source-reviewed current ranking; Overall reconciled, role views editorial",
  "factual-only": "Source-reviewed kit and stats; editorial grade, no ranking source",
};

/** The phrase that distinguishes each class inside a published review label. */
export const reviewStatusMarkerByEvidenceClass: Readonly<Record<RankingEvidenceClass, string>> = {
  "comparative-current": "Overall reconciled",
  "factual-only": "no ranking source",
};

export function unitEvidenceFor(unit: Unit): UnitEvidence {
  const reconciled = reconciledById.get(unit.id);
  return {
    unitId: unit.id,
    evidenceClass: evidenceClassFor(unit),
    sourceOverallTier: reconciled?.sourceTier ?? null,
    agreesWithSource: reconciled?.agrees ?? false,
    comparativeSourceIds: sourceIdsWhere(unit, "comparative-ranking"),
    factualSourceIds: sourceIdsWhere(unit, "factual"),
    obtainmentSourceIds: sourceIdsWhere(unit, "obtainment"),
  };
}

export const unitEvidence: readonly UnitEvidence[] = units.map(unitEvidenceFor);

export const evidenceCoverage = {
  totalUnits: units.length,
  /** Units whose Overall placement was reconciled against the captured source tier list. */
  overallReconciled: unitEvidence.filter((entry) => entry.agreesWithSource).length,
  /** Units the source does not rank at all. */
  editorialOnly: unitEvidence.filter((entry) => entry.evidenceClass === "factual-only").length,
  /** Every unit still carries a reviewed factual source. */
  factualSupport: unitEvidence.filter((entry) => entry.factualSourceIds.length > 0).length,
  /** Role sub-grades no source publishes; these are editorial across the whole roster. */
  roleViewsEditorial: units.length,
  disagreeing: tierEvidenceDocument.records.filter((entry) => !entry.agrees).length,
  rankedBySource: tierEvidenceDocument.records.length,
} as const;

/**
 * The exact authority statement published on the page. Component copy renders
 * these numbers rather than typing them, so the claim cannot drift away from the
 * evidence it describes.
 */
export const authorityClaim = {
  ...evidenceCoverage,
  short: `Overall placements for ${evidenceCoverage.overallReconciled} of ${evidenceCoverage.totalUnits} units reconcile with the current comparative tier list; the role sub-grades are TierListBase editorial.`,
  detailed: `Overall placements for ${evidenceCoverage.overallReconciled} of ${evidenceCoverage.totalUnits} units reconcile with the current comparative tier list. The DPS, Utility, Support and Crowd Control sub-grades, and the ${evidenceCoverage.editorialOnly} records that tier list does not rank, are TierListBase editorial reads of source-reviewed kits and stats.`,
} as const;
