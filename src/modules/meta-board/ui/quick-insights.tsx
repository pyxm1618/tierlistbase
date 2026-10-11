const insights = [
  ["Most Stable", "Pending reviewed history across comparable versions."],
  ["Strong for Leveling", "Pending a reviewed leveling comparison for this level and build."],
  ["Most Disputed", "Pending a reviewed comparison of source disagreement."],
  ["Biggest Mover", "Pending a reviewed comparison of tier changes."],
] as const;

export function QuickInsights() {
  return (
    <section className="mt-10" aria-labelledby="insights-heading">
      <h2 id="insights-heading" className="text-xl font-bold text-foreground">
        Quick Insights
      </h2>
      <p className="mt-2 text-sm text-muted">
        Insights will appear when the evidence supports a comparison.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map(([label, explanation]) => (
          <div key={label} className="rounded-lg border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold text-foreground">{label}</h3>
            <p className="mt-2 text-xs font-medium text-muted">Pending</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{explanation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
