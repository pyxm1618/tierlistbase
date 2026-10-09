import type { ReactNode } from "react";

type EvidenceBadgeProps = {
  sourceCount: number;
  agreeingSourceCount: number;
  disagreementLevel: string;
  dataStatus: string;
  freshnessStatus?: string;
};

export function EvidenceBadge({
  sourceCount,
  agreeingSourceCount,
  disagreementLevel,
  dataStatus,
  freshnessStatus,
}: EvidenceBadgeProps): ReactNode {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {sourceCount > 0 ? (
        <span className="inline-flex items-center rounded bg-surface-muted px-2 py-0.5 font-medium text-foreground">
          {agreeingSourceCount} / {sourceCount} sources agree
        </span>
      ) : (
        <span className="inline-flex items-center rounded bg-surface-muted px-2 py-0.5 font-medium text-muted">
          No sources reviewed
        </span>
      )}

      {disagreementLevel === "high" ? (
        <span className="inline-flex items-center rounded bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-700 dark:text-amber-400">
          High disagreement
        </span>
      ) : null}

      {dataStatus === "unavailable" ? (
        <span
          className="inline-flex items-center rounded bg-surface-muted px-1.5 py-0.5 text-muted"
          title="Real performance data unavailable"
        >
          Data: N/A
        </span>
      ) : null}

      {freshnessStatus === "preliminary" ? (
        <span className="inline-flex items-center rounded bg-blue-500/10 px-1.5 py-0.5 font-medium text-blue-700 dark:text-blue-400">
          Preliminary
        </span>
      ) : freshnessStatus === "stale" ? (
        <span className="inline-flex items-center rounded bg-red-500/10 px-1.5 py-0.5 font-medium text-red-700 dark:text-red-400">
          Stale
        </span>
      ) : null}
    </div>
  );
}
