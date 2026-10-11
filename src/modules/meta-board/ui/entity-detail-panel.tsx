import type { BoardEntityItem } from "../db/queries";
import { evidenceDate } from "../domain/presentation";
import { EvidenceBadge } from "./evidence-badge";

export function EntityDetailPanel({ item }: { item: BoardEntityItem | null }) {
  if (!item) {
    return (
      <aside className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
        Select a ranked entity to inspect its ranking rationale and evidence.
      </aside>
    );
  }

  const expertCount = item.sources.filter(
    (source) => source.sourceType === "expert" || source.sourceType === "aggregator",
  ).length;
  const dataCount = item.sources.filter((source) => source.sourceType === "data").length;

  return (
    <aside
      className="sticky top-24 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      aria-label={`Selected entity: ${item.entityName}`}
    >
      <div className="border-b border-border bg-surface-muted/50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {item.entityType} · {item.role}
            </p>
            <h3 className="mt-1 break-words text-2xl font-bold tracking-tight text-foreground">
              {item.entityName}
            </h3>
            <p className="mt-1 text-xs text-muted">{item.currentContextLabel}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center">
            <span className="block text-3xl font-black leading-none text-rose-500">
              {item.tier}
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
              Tier
            </span>
          </div>
        </div>

        <div className="mt-4">
          <EvidenceBadge
            sourceCount={item.sourceCount}
            agreeingSourceCount={item.agreeingSourceCount}
            disagreementLevel={item.disagreementLevel}
            dataStatus={
              item.sources.some((source) => source.sourceType === "data")
                ? item.dataStatus
                : "unavailable"
            }
            freshnessStatus={item.freshnessStatus}
          />
        </div>
      </div>

      <div className="space-y-5 p-5">
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Why this tier?</h4>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {item.whyThisTier || "No reviewed editorial rationale recorded yet."}
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 min-[1400px]:grid-cols-1 min-[1580px]:grid-cols-2">
          <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Key strengths
            </h4>
            <p className="mt-2 text-xs leading-5 text-foreground">
              {item.strengths || "No reviewed strengths recorded yet."}
            </p>
          </section>
          <section className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Constraints
            </h4>
            <p className="mt-2 text-xs leading-5 text-foreground">
              {item.constraints || "No reviewed constraints recorded yet."}
            </p>
          </section>
        </div>

        <section className="rounded-xl border border-border bg-surface-muted/35 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Evidence snapshot
          </h4>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted">Expert/editorial</dt>
              <dd className="mt-1 font-semibold text-foreground">{expertCount} linked</dd>
            </div>
            <div>
              <dt className="text-muted">Statistical data</dt>
              <dd className="mt-1 font-semibold text-foreground">
                {dataCount > 0 ? `${dataCount} linked` : "Not available yet"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Version</dt>
              <dd className="mt-1 font-semibold text-foreground">
                {item.versionString}
                {item.buildString ? ` · ${item.buildString}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Last updated</dt>
              <dd className="mt-1 font-semibold text-foreground">
                {evidenceDate(item.lastUpdated)}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Recent change</h4>
          {item.latestTierChange ? (
            <div className="mt-2 rounded-xl border border-border p-4 text-xs">
              <p className="font-semibold text-foreground">
                {item.latestTierChange.previousTier} → {item.latestTierChange.newTier}
              </p>
              <p className="mt-1 leading-5 text-muted">
                {item.latestTierChange.reason || "Reason not recorded."}
              </p>
              <time
                className="mt-2 block text-[11px] text-muted"
                dateTime={new Date(item.latestTierChange.changedAt).toISOString()}
              >
                {evidenceDate(item.latestTierChange.changedAt)}
              </time>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted">No prior tier transition recorded.</p>
          )}
        </section>

        <section>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Linked sources</h4>
          {item.sources.length === 0 ? (
            <p className="mt-2 text-xs text-muted">No reviewed sources linked yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {item.sources.slice(0, 4).map((source) => (
                <li key={source.sourceId} className="rounded-lg border border-border p-3 text-xs">
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground underline-offset-2 hover:underline"
                  >
                    {source.sourceName} ↗
                  </a>
                  <p className="mt-1 capitalize text-muted">
                    {source.sourceType} · {source.publisher || "Publisher unknown"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}
