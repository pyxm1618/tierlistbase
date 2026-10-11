import type { MetaBoardData } from "../db/queries";
import { summarizeBoardEvidence } from "../domain/presentation";

export function EvidenceSummary({ data }: { data: MetaBoardData }) {
  const summary = summarizeBoardEvidence(data);
  const metrics = [
    [
      "Source Consensus",
      `${summary.sources.length} unique sources · ${summary.ratingCount} source ratings`,
      summary.ratingCount > 0
        ? `${summary.agreeingRatingCount}/${summary.ratingCount} source ratings match the published entity tier.`
        : "No source agreement evidence available yet.",
    ],
    [
      "Freshness",
      summary.sources.length > 0
        ? `${summary.freshnessCounts.current} current · ${summary.freshnessCounts.preliminary} preliminary · ${summary.freshnessCounts.stale} stale · ${summary.freshnessCounts.unknown} unknown`
        : "Unknown",
      "Recorded source freshness; a check date alone does not establish freshness.",
    ],
    [
      "Data Availability",
      summary.dataSourceCount > 0
        ? `${summary.dataSourceCount} statistical sources linked`
        : "Not available yet",
      "Expert opinions are separate from statistical performance data.",
    ],
    [
      "Disagreement",
      summary.ratingCount > 0
        ? `${summary.differingRatingCount} differing · ${summary.unmappedRatingCount} not normalized`
        : "Unknown",
      "Missing normalization is unknown, not agreement or disagreement. Open a class or spec for its recorded classification.",
    ],
  ];
  return (
    <section className="mt-10 border-t border-border pt-8" aria-labelledby="evidence-heading">
      <h2 id="evidence-heading" className="text-xl font-bold text-foreground">
        Evidence &amp; Trust
      </h2>
      <p className="mt-2 text-sm text-muted">
        Evidence for the selected context and version. Counts describe coverage, not a confidence
        score.
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {metrics.map(([label, value, explanation]) => (
          <div key={label} className="rounded-lg border border-border bg-surface p-4">
            <dt className="text-sm font-semibold text-foreground">{label}</dt>
            <dd className="mt-2 text-sm text-foreground">
              {value}
              <p className="mt-2 text-xs leading-relaxed text-muted">{explanation}</p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
