import type { MetaBoardData } from "../db/queries";
import { evidenceDate, summarizeBoardEvidence } from "../domain/presentation";

export function SourcesEvidence({ data }: { data: MetaBoardData }) {
  const summary = summarizeBoardEvidence(data);

  return (
    <section
      className="mt-8 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      aria-labelledby="sources-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="sources-heading" className="text-xl font-bold text-foreground">
            Sources &amp; Evidence
          </h2>
          <p className="mt-1 text-sm text-muted">
            Evidence for the selected ranking context. Coverage is shown directly; no synthetic
            confidence score.
          </p>
        </div>
        <p className="text-xs text-muted">
          Patch {data.version?.version ?? "Unknown"} · Build {data.version?.build ?? "Unknown"}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Evidence & Trust"
          value={
            summary.sources.length > 0
              ? `${summary.sources.length} sources`
              : "No reviewed sources"
          }
        />
        <Metric
          label="Source agreement"
          value={
            summary.ratingCount > 0
              ? `${summary.agreeingRatingCount}/${summary.ratingCount} ratings match`
              : "Unknown"
          }
        />
        <Metric
          label="Freshness"
          value={
            summary.sources.length > 0
              ? `${summary.freshnessCounts.current} current · ${summary.freshnessCounts.preliminary} preliminary`
              : "Unknown"
          }
        />
        <Metric
          label="Statistical data"
          value={
            summary.dataSourceCount > 0
              ? `${summary.dataSourceCount} linked`
              : "Not available yet"
          }
        />
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground">Current Sources</h3>
          <span className="text-xs text-muted">
            {data.activeContext?.label ?? "Context unavailable"}
          </span>
        </div>

        {summary.sources.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-5 text-sm text-muted">
            No reviewed sources published for this context yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.sources.map((source) => (
              <li
                key={source.sourceId}
                className="min-w-0 rounded-xl border border-border bg-surface-muted/30 p-4"
              >
                <a
                  href={source.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  {source.sourceName} ↗
                </a>
                <p className="mt-1 text-xs capitalize text-muted">
                  {source.sourceType} · {source.publisher || "Publisher unknown"}
                </p>
                <dl className="mt-3 space-y-1 text-[11px] text-muted">
                  <div>
                    <dt className="inline">Checked: </dt>
                    <dd className="inline">{evidenceDate(source.checkedAt)}</dd>
                  </div>
                  <div>
                    <dt className="inline">Freshness: </dt>
                    <dd className="inline capitalize">
                      {source.sourceFreshness === "unconfigured"
                        ? "Unknown"
                        : source.sourceFreshness}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">Rating version: </dt>
                    <dd className="inline">
                      {source.versionMatch ? "Selected version" : "Mismatch"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">Patch / Build match: </dt>
                    <dd className="inline">Unknown — source-declared version not recorded.</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted/35 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
