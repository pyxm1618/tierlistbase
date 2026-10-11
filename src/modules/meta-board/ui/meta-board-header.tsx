import type { MetaBoardData } from "../db/queries";
import { evidenceDate, summarizeBoardEvidence } from "../domain/presentation";

type MetaBoardHeaderProps = {
  data: MetaBoardData;
  eyebrow?: string;
  title?: string;
  description?: string;
  contextMetricLabel?: string;
  contextMetricValue?: string;
};

export function MetaBoardHeader({
  data,
  eyebrow,
  title,
  description,
  contextMetricLabel = "Level Cap",
  contextMetricValue,
}: MetaBoardHeaderProps) {
  const summary = summarizeBoardEvidence(data);
  const statusLabel =
    summary.status === "current" ? "Current" : summary.status === "stale" ? "Stale" : "Preliminary";
  const gameName = eyebrow ?? data.game?.name ?? "World of Warcraft: Forever";
  const heading = title ?? (data.game?.slug === "wow-forever" ? "WoW Forever Tier List" : `${gameName} Tier List`);
  const intro =
    description ??
    "Compare reviewed rankings for the selected context. Open any ranked entity to see why it is placed there and what evidence supports the decision.";
  const metricValue =
    contextMetricValue ??
    String(data.activeContext?.levelCap ?? data.version?.levelCap ?? "Unknown");

  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-7 sm:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,color-mix(in_oklab,var(--color-accent)_18%,transparent),transparent_34%),linear-gradient(120deg,color-mix(in_oklab,var(--color-surface-muted)_78%,transparent),transparent_60%)]"
      />
      <div className="relative grid gap-6 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)] min-[1080px]:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{gameName}</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">{intro}</p>
        </div>

        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 min-[1080px]:grid-cols-2">
          <StatusCard label="Current Patch" value={data.version?.version ?? "Pending"} />
          <StatusCard label={contextMetricLabel} value={metricValue} />
          <StatusCard label="Last Updated" value={evidenceDate(summary.lastUpdated)} />
          <div className="rounded-xl border border-border bg-background/55 p-3 backdrop-blur-sm">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Data Status
            </dt>
            <dd className="mt-1 flex items-center gap-2 text-sm font-bold text-foreground">
              <span
                className={`size-2 rounded-full ${
                  summary.status === "current"
                    ? "bg-emerald-500"
                    : summary.status === "stale"
                      ? "bg-rose-500"
                      : "bg-amber-500"
                }`}
              />
              {statusLabel}
            </dd>
          </div>
        </dl>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/70 pt-4 text-xs text-muted">
        <span>{data.activeContext?.label ?? "Ranking context pending verification"}</span>
        <span aria-hidden="true">•</span>
        <span>Build {data.version?.build ?? "Unknown"}</span>
        <span aria-hidden="true">•</span>
        <span>Status reflects recorded evidence freshness; dates are UTC.</span>
      </div>
    </header>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background/55 p-3 backdrop-blur-sm">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-foreground">{value}</dd>
    </div>
  );
}
