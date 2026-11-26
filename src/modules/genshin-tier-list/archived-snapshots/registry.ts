import type { GenshinArchivedSnapshot } from "../archived-snapshot";
import genshinImpact from "./genshin-impact.json";

/**
 * Generated artifact from `scripts/export-archived-ranking-snapshots.ts`.
 * Update it by re-running the export after an approved reviewed-package import, then review the
 * JSON diff.
 */
export const genshinArchivedSnapshot = genshinImpact as unknown as GenshinArchivedSnapshot;
