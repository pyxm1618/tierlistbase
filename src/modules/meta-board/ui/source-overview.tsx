import type { MetaBoardData } from "../db/queries";
import { evidenceDate, summarizeBoardEvidence } from "../domain/presentation";

export function SourceOverview({ data }: { data: MetaBoardData }) {
  const { sources } = summarizeBoardEvidence(data);
  return (
    <section className="mt-10" aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="text-xl font-bold text-foreground">
        Current Sources
      </h2>
      <p className="mt-2 text-sm text-muted">
        {data.activeContext?.label ?? "Context not available"} · Patch{" "}
        {data.version?.version ?? "Unknown"} · Build {data.version?.build ?? "Unknown"}
      </p>
      {sources.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-sm text-muted">
          No reviewed sources published for this context yet.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {sources.map((source) => (
            <li
              key={source.sourceId}
              className="min-w-0 break-words rounded-lg border border-border bg-surface p-4"
            >
              <a
                href={source.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground underline underline-offset-4"
              >
                {source.sourceName}
              </a>
              <p className="mt-1 text-xs text-muted">
                {source.sourceType} · {source.publisher || "Publisher unknown"}
              </p>
              <dl className="mt-3 space-y-1 text-xs text-muted">
                <div>
                  <dt className="inline">Published: </dt>
                  <dd className="inline">{evidenceDate(source.publishedAt)}</dd>
                </div>
                <div>
                  <dt className="inline">Updated: </dt>
                  <dd className="inline">{evidenceDate(source.updatedAtSource)}</dd>
                </div>
                <div>
                  <dt className="inline">Checked: </dt>
                  <dd className="inline">{evidenceDate(source.checkedAt)}</dd>
                </div>
                <div>
                  <dt className="inline">Freshness: </dt>
                  <dd className="inline capitalize">
                    {source.sourceFreshness === "unconfigured"
                      ? "Unknown (rule not configured)"
                      : source.sourceFreshness}
                  </dd>
                </div>
                <div>
                  <dt className="inline">Rating version association: </dt>
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
    </section>
  );
}
