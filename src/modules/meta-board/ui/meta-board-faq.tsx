const questions = [
  [
    "How We Rank",
    "The board compares classes and specs inside the selected mode, role, level cap and build. Source ratings are normalized through configured rules before they can support a published tier. Missing evidence remains unknown rather than being filled with a guessed score.",
  ],
  [
    "Data Sources",
    "Expert and editorial evidence is kept separate from statistical performance data. Each published source keeps its own source type, freshness and rating-version association. If no statistical source is linked, Data remains Not available yet.",
  ],
  [
    "FAQ",
    "A tier is specific to the current Ranking Context. Current, Preliminary and Stale describe recorded version, ranking and source freshness; Last Updated is the latest ranking-record update, not a promise about a publisher's latest article.",
  ],
  [
    "About This Tier List",
    "TierListBase does not invent rankings, insight conclusions or source agreement to fill the page. Unavailable filter combinations stay empty, and future community signals can attach to rankings without changing the V1 ranking model.",
  ],
] as const;

export function MetaBoardFaq() {
  return (
    <section
      className="mt-4 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      aria-labelledby="faq-heading"
    >
      <h2 id="faq-heading" className="text-xl font-bold text-foreground">
        FAQ / Methodology
      </h2>
      <div className="mt-4 grid gap-2 lg:grid-cols-2">
        {questions.map(([question, answer]) => (
          <details
            key={question}
            className="group rounded-xl border border-border bg-surface-muted/25 p-4"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
              <span className="flex items-center justify-between gap-3">
                {question}
                <span
                  aria-hidden="true"
                  className="text-muted transition group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-muted">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
