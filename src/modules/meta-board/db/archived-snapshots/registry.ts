import type { ArchivedMetaBoardSnapshot } from "../archived-snapshot";
import wowForever from "./wow-forever.json";

/**
 * Generated artifact from `scripts/export-archived-ranking-snapshots.ts`.
 * Update it by re-running the export after an approved WoW publish, then review the JSON diff.
 */
export const archivedMetaBoardSnapshots: Record<string, ArchivedMetaBoardSnapshot> = {
  "wow-forever": wowForever as unknown as ArchivedMetaBoardSnapshot,
};
