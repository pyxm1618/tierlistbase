import snapshotSource from "./snapshot-source.json";

import { readSnapshotMetadata } from "./snapshot";

export const snapshot = snapshotSource;

const snapshotMetadata = readSnapshotMetadata({
  dataSnapshotDate: snapshotSource.data_snapshot_date,
  gameVersion: snapshotSource.game_version_if_confirmable,
});

export const snapshotDate = snapshotMetadata.date;
export const snapshotVersion = snapshotMetadata.version;
export const snapshotPhase = snapshotMetadata.phase;
