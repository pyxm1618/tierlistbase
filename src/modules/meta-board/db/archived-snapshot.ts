import { archivedMetaBoardSnapshots } from "./archived-snapshots/registry";
import type {
  BoardEntityItem,
  MetaBoardData,
  RecentRatingChangeItem,
  SourceEvidenceItem,
} from "./queries";

/**
 * Materialized archive snapshot for an archived tier list.
 *
 * The database stays authoritative: `scripts/update-wow-forever-data.ts` still publishes, and any
 * explicit `db` handle still reads SQL. This module only serves the frozen snapshot to the public
 * page path, so a normal page view never opens a remote database connection. Regenerate with
 * `bun --conditions=react-server scripts/export-archived-ranking-snapshots.ts`.
 */
export const ARCHIVED_SNAPSHOT_SCHEMA_VERSION = 1;

export type ArchivedSnapshotProvenance = {
  readonly gameSlug: string;
  readonly exportedAt: string;
  readonly databaseHost: string;
  readonly version: string | null;
  readonly versionId: string | null;
  readonly roles: readonly string[];
  readonly counts: Record<string, number>;
};

export type ArchivedMetaBoardRoleSnapshot = {
  /** `MetaBoardData` with timestamps serialized as ISO strings. */
  readonly board: MetaBoardData;
  /** `RecentRatingChangeItem[]` with timestamps serialized as ISO strings. */
  readonly changes: RecentRatingChangeItem[];
};

export type ArchivedMetaBoardSnapshot = {
  readonly schemaVersion: number;
  readonly provenance: ArchivedSnapshotProvenance;
  readonly roles: Record<string, ArchivedMetaBoardRoleSnapshot>;
};

const ARCHIVED_MODE = "dungeon";
const ARCHIVED_LEVEL_CAP = 30;

function toDate(value: unknown, field: string): Date {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Archived ranking snapshot has an invalid ${field} timestamp`);
  }
  return date;
}

function toNullableDate(value: unknown, field: string): Date | null {
  return value === null || value === undefined ? null : toDate(value, field);
}

function reviveSource(source: SourceEvidenceItem): SourceEvidenceItem {
  const revived: SourceEvidenceItem = {
    ...source,
    publishedAt: toNullableDate(source.publishedAt, "sources.publishedAt"),
    updatedAtSource: toNullableDate(source.updatedAtSource, "sources.updatedAtSource"),
    checkedAt: toDate(source.checkedAt, "sources.checkedAt"),
  };
  return source.collectedAt === undefined
    ? revived
    : { ...revived, collectedAt: toDate(source.collectedAt, "sources.collectedAt") };
}

type RevivableTierChange = NonNullable<BoardEntityItem["latestTierChange"]>;

function reviveTierChange(change: RevivableTierChange): RevivableTierChange {
  return { ...change, changedAt: toDate(change.changedAt, "tierChanges.changedAt") };
}

function reviveBoardEntity(item: BoardEntityItem): BoardEntityItem {
  return {
    ...item,
    lastUpdated: toDate(item.lastUpdated, "items.lastUpdated"),
    latestTierChange: item.latestTierChange ? reviveTierChange(item.latestTierChange) : null,
    tierChanges: item.tierChanges.map(reviveTierChange),
    sources: item.sources.map(reviveSource),
  };
}

export function reviveArchivedBoard(board: MetaBoardData): MetaBoardData {
  return {
    ...board,
    tiers: board.tiers.map((group) => ({ ...group, items: group.items.map(reviveBoardEntity) })),
  };
}

export function reviveArchivedChanges(
  changes: readonly RecentRatingChangeItem[],
): RecentRatingChangeItem[] {
  return changes.map((change) => ({
    ...change,
    changedAt: toDate(change.changedAt, "changes.changedAt"),
  }));
}

/**
 * Mirrors the SQL path's "requested role has no active ranking context" branch, so a stale or
 * hand-edited `?role=` value degrades exactly like it does against the database.
 */
function unavailableBoardFor(reference: MetaBoardData, availableRoles: string[]): MetaBoardData {
  return {
    game: reference.game,
    version: reference.version,
    activeContext: null,
    availableModes: reference.availableModes,
    availableRoles,
    availableLevels: reference.availableLevels,
    availableBuilds: [],
    tiers: [],
    hasData: false,
  };
}

export type ArchivedBoardQuery = {
  gameSlug: string;
  mode?: string | undefined;
  role?: string | undefined;
  levelCap?: number | undefined;
  build?: string | undefined;
};

/**
 * Returns the frozen archive board when the snapshot fully covers the query, or `null` when the
 * caller must fall back to the database (different mode, level cap, build, or a live game).
 */
export function readArchivedMetaBoard(query: ArchivedBoardQuery): MetaBoardData | null {
  const snapshot = archivedMetaBoardSnapshots[query.gameSlug];
  if (!snapshot) return null;
  if (query.build) return null;
  if (query.mode !== undefined && query.mode !== ARCHIVED_MODE) return null;
  if (query.levelCap !== undefined && query.levelCap !== ARCHIVED_LEVEL_CAP) return null;

  const availableRoles = Object.keys(snapshot.roles).sort();
  const requestedRole = query.role ?? "all";
  const roleSnapshot = snapshot.roles[requestedRole];
  const reference = roleSnapshot ?? snapshot.roles[availableRoles[0] ?? ""];
  if (!reference) return null;

  const referenceBoard = reviveArchivedBoard(reference.board);
  return roleSnapshot ? referenceBoard : unavailableBoardFor(referenceBoard, availableRoles);
}

/**
 * Serves the frozen change history for the ranking context the snapshot captured. A filter that
 * does not match the archived context returns an empty list, exactly like the SQL path.
 */
export function readArchivedRatingChanges(
  gameSlug: string,
  limit: number,
  filters?: { rankingContextId?: string | undefined; toVersionId?: string | undefined },
): RecentRatingChangeItem[] | null {
  const snapshot = archivedMetaBoardSnapshots[gameSlug];
  if (!snapshot) return null;

  const contextId = filters?.rankingContextId;
  const versionId = filters?.toVersionId;
  if (contextId === undefined && versionId === undefined) {
    return Object.values(snapshot.roles)
      .flatMap((role) => reviveArchivedChanges(role.changes))
      .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())
      .slice(0, limit);
  }

  for (const role of Object.values(snapshot.roles)) {
    const contextMatches = contextId === undefined || role.board.activeContext?.id === contextId;
    const versionMatches = versionId === undefined || role.board.version?.id === versionId;
    if (!contextMatches || !versionMatches) continue;
    return reviveArchivedChanges(role.changes).slice(0, limit);
  }
  return [];
}
