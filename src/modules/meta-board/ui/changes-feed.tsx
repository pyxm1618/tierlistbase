import type { ReactNode } from "react";

import type { RecentRatingChangeItem } from "../db/queries";

type ChangesFeedProps = {
  changes: RecentRatingChangeItem[];
};

export function ChangesFeed({ changes }: ChangesFeedProps): ReactNode {
  return (
    <section className="mt-12 border-t border-border pt-8" aria-labelledby="changes-heading">
      <div className="flex items-center justify-between">
        <h2 id="changes-heading" className="text-xl font-bold tracking-tight text-foreground">
          What Changed (Recent Meta Shifts)
        </h2>
        <span className="text-xs text-muted">Auditable version history</span>
      </div>

      {changes.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
          No tier changes recorded yet for this game version.
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-surface">
          {changes.map((change) => {
            const isPromoted = change.changeType === "promoted";
            const isDemoted = change.changeType === "demoted";

            return (
              <div
                key={change.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded font-bold text-xs ${
                      isPromoted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : isDemoted
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "bg-surface-muted text-muted"
                    }`}
                  >
                    {isPromoted ? "↑" : isDemoted ? "↓" : "•"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{change.entityName}</span>
                      <span className="text-xs text-muted">({change.contextLabel})</span>
                    </div>
                    <div className="text-xs text-muted">
                      {change.previousTier} →{" "}
                      <strong className="text-foreground">{change.newTier}</strong>
                      {change.reason ? ` • ${change.reason}` : ""}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-muted">
                  <div>Patch {change.toVersion}</div>
                  <div>{new Date(change.changedAt).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
