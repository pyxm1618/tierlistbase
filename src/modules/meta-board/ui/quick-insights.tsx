const insights = [
  ["Most Stable", "Pending reviewed history across comparable versions."],
  ["Strong for Leveling", "Pending a reviewed leveling comparison for this level and build."],
  ["Most Disputed", "Pending a reviewed comparison of source disagreement."],
  ["Biggest Mover", "Pending a reviewed comparison of tier changes."],
  ["Best for New Players", "Pending reviewed ease-of-use and performance evidence."],
] as const;

export function QuickInsights() {
  return (
    <section
      className="mt-4 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      aria-labelledby="insights-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="insights-heading" className="text-xl font-bold text-foreground">
            Quick Insights
          </h2>
          <p className="mt-1 text-sm text-muted">
            Current Meta conclusions only appear when reviewed evidence supports the comparison.
          </p>
        </div>
        <span className="text-xs text-muted">Selected context only</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {insights.map(([label, explanation]) => (
          <article key={label} className="rounded-xl border border-border bg-surface-muted/30 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-2 text-sm font-bold text-foreground">Pending</p>
            <p className="mt-1 text-xs leading-5 text-muted">{explanation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
