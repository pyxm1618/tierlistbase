import { genshinArchivedSnapshot } from "./archived-snapshots/registry";
import type { GenshinData } from "./data";

/**
 * Materialized read path for the archived Genshin snapshot.
 *
 * The reviewed package in `data/editorial/genshin-impact/<version>/` remains the import source of
 * truth and the database stays authoritative; this only removes the per-request remote read for a
 * frozen ranking snapshot. Regenerate with
 * `bun --conditions=react-server scripts/export-archived-ranking-snapshots.ts`.
 */
export type GenshinArchivedSnapshot = {
  readonly schemaVersion: number;
  readonly provenance: {
    readonly gameSlug: string;
    readonly exportedAt: string;
    readonly databaseHost: string;
    readonly version: string;
    readonly editorialPackage: string;
    readonly counts: Record<string, number>;
  };
  readonly data: GenshinData;
};

export function readArchivedGenshinData(): GenshinData | null {
  return genshinArchivedSnapshot?.data ?? null;
}
