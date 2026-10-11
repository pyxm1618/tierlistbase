const questions = [
  [
    "What does this WoW Forever tier list rank?",
    "The board compares classes and specs within the selected mode, role, level cap and build. A tier in one context is not a recommendation for every play style.",
  ],
  [
    "How are tiers and evidence connected?",
    "Source ratings are associated with a context and version, normalized using configured source rules, and used in the published ranking. Open an entity to inspect its rationale, strengths, constraints and source evidence. Missing rules and missing evidence remain unknown.",
  ],
  [
    "What do Current, Preliminary and Stale mean?",
    "Current requires a current version and current recorded ranking and source freshness. Stale indicates recorded stale evidence or version status. Otherwise the board is Preliminary. Last Updated is the latest ranking-record update, not a promise that a source was recently published.",
  ],
  [
    "Are expert opinions the same as performance data?",
    "No. Expert and editorial evidence is shown separately from statistical sources. If no statistical source is linked to this context and version, Data is Not available yet.",
  ],
  [
    "Why are some sections empty?",
    "No rankings, sources or insight conclusions are invented to fill the layout. Pending sections need reviewed evidence. Filters select a real ranking context; unavailable combinations stay empty.",
  ],
] as const;

export function MetaBoardFaq() {
  return (
    <section className="mt-10 border-t border-border pt-8" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-bold text-foreground">
        FAQ / Methodology
      </h2>
      <div className="mt-4 divide-y divide-border">
        {questions.map(([question, answer]) => (
          <div key={question} className="py-4">
            <h3 className="text-sm font-semibold text-foreground">{question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
