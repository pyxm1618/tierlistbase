import type { MetaBoardData } from "../db/queries";
import { summarizeBoardEvidence } from "../domain/presentation";

export function ExpertDataView({ data }: { data: MetaBoardData }) {
  const { entities } = summarizeBoardEvidence(data);
  return (
    <section className="mt-10" aria-labelledby="perspectives-heading">
      <h2 id="perspectives-heading" className="text-xl font-bold text-foreground">
        Expert / Data View
      </h2>
      <p className="mt-2 text-sm text-muted">
        Source-reported ratings shown separately. These are evidence views, not additional rankings.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(["expert", "data"] as const).map((type) => {
          const entries = entities.flatMap((entity) =>
            entity.sources
              .filter((source) =>
                type === "data"
                  ? source.sourceType === "data"
                  : source.sourceType === "expert" || source.sourceType === "aggregator",
              )
              .map((source) => ({ entity, source })),
          );
          return (
            <div key={type} className="min-w-0 rounded-lg border border-border bg-surface p-4">
              <h3 className="font-semibold text-foreground">
                {type === "expert" ? "Expert & Editorial" : "Statistical Data"}
              </h3>
              {entries.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Not available yet</p>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {entries.map(({ entity, source }) => (
                    <li
                      key={`${entity.entityId}-${source.sourceId}`}
                      className="break-words border-t border-border pt-3"
                    >
                      <span className="font-medium text-foreground">{entity.entityName}</span>
                      <p className="text-xs text-muted">
                        <a
                          href={source.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {source.sourceName}
                        </a>{" "}
                        · {source.sourceType}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Reported tier: {source.rawTier} · Normalized:{" "}
                        {source.normalizedTier ?? "Not configured"}
                        {type === "data"
                          ? ` · Rank: ${source.rawRank ?? "Unknown"} · Score: ${source.rawScore ?? "Unknown"}`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
