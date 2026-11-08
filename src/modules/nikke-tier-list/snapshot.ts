/**
 * Ranking snapshot metadata is recorded as free text in the NIKKE dataset
 * (`game_version_if_confirmable`, e.g. "v122.8 (Halloween Belorta / Pre-Anniversary Update)").
 * This parser keeps the structured version/phase derivable from that single recorded value so
 * page copy, metadata and tests never have to hardcode a version or snapshot date twice.
 */
export type SnapshotMetadata = {
  readonly date: string;
  readonly version: string;
  readonly phase: string;
};

export function readSnapshotMetadata(input: {
  readonly dataSnapshotDate: string;
  readonly gameVersion: string;
}): SnapshotMetadata {
  const [recordedVersion = "", recordedDetail = ""] = input.gameVersion.split(/\s*\(/, 2);
  const detailSegments = recordedDetail
    .replace(/\)\s*$/, "")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  return {
    date: input.dataSnapshotDate,
    version: recordedVersion.trim(),
    phase: (detailSegments.at(-1) ?? "").replace(/\bupdate\b/i, "").trim(),
  };
}
