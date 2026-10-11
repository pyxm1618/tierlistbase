import type { MetaBoardData } from "../db/queries";
import { evidenceDate, summarizeBoardEvidence } from "../domain/presentation";

export function MetaBoardHeader({ data }: { data: MetaBoardData }) {
  const summary = summarizeBoardEvidence(data);
  return (
    <header className="border-b border-border pb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Game Meta Board</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        WoW Forever Tier List
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-foreground">
        <span className="rounded bg-surface-muted px-2.5 py-1">
          Patch: {data.version?.version ?? "Pending verification"}
        </span>
        <span className="max-w-full break-all rounded bg-surface-muted px-2.5 py-1">
          Build: {data.version?.build ?? "Unknown"}
        </span>
        <span className="rounded bg-surface-muted px-2.5 py-1">
          Level Cap: {data.activeContext?.levelCap ?? data.version?.levelCap ?? "Unknown"}
        </span>
        <span className="rounded bg-surface-muted px-2.5 py-1">
          Last Updated: {evidenceDate(summary.lastUpdated)}
        </span>
        <span className="rounded border border-border px-2.5 py-1 font-semibold capitalize">
          {summary.status}
        </span>
      </div>
      <p className="mt-3 text-xs text-muted">
        {data.activeContext?.label ?? "Ranking context pending verification"} · Status reflects
        recorded evidence freshness. Dates shown in UTC.
      </p>
    </header>
  );
}
