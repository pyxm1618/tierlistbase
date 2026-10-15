import type { RecentRatingChangeItem } from "../db/queries";
import { WOW_DUNGEONS, type WowSpec } from "./model";
import styles from "./wow-tier-list.module.css";
export function WowInsights({
  specs,
  changes,
}: {
  specs: WowSpec[];
  changes: RecentRatingChangeItem[];
}) {
  const ranked = specs.filter((s) => s.score !== null);
  const top = ranked[0];
  const largest = [...specs]
    .filter((s) => s.parses !== null && s.parses > 0)
    .sort((a, b) => b.parses! - a.parses!)[0];
  const coverage = [...specs]
    .filter((s) => s.coverage !== null && s.coverage > 0)
    .sort((a, b) => b.coverage! - a.coverage!)[0];
  const pending = specs.filter((s) => s.tier === "Pending");
  const bands = ["S", "A", "B", "C"];
  const movers = changes
    .filter((c) => bands.includes(c.previousTier) && bands.includes(c.newTier))
    .sort(
      (a, b) =>
        Math.abs(bands.indexOf(b.previousTier) - bands.indexOf(b.newTier)) -
        Math.abs(bands.indexOf(a.previousTier) - bands.indexOf(a.newTier)),
    );
  const mover = movers[0];
  const insights = [
    [
      "Top Performance",
      top?.name ?? "Not enough data",
      top ? `Score: ${top.score!.toFixed(1)}` : "No ranked performance yet",
    ],
    [
      "Largest Sample",
      largest?.name ?? "No recorded data",
      largest ? `${largest.parses!.toLocaleString("en-US")} included parses` : "N/A",
    ],
    [
      "Widest Coverage",
      coverage?.name ?? "No recorded data",
      coverage ? `${coverage.coverage} / ${WOW_DUNGEONS.length} dungeons` : "N/A",
    ],
    [
      "Biggest Mover",
      mover?.entityName ?? "No recorded movement yet",
      mover ? `${mover.previousTier} → ${mover.newTier}` : "Comparable tier movement unavailable",
    ],
    [
      "Needs More Data",
      `${pending.length} pending specs`,
      pending.length ? pending.map((s) => s.name).join(", ") : "No pending specs recorded",
    ],
  ];
  return (
    <section className={styles.section} aria-labelledby="wow-insights-heading">
      <h2 id="wow-insights-heading">
        Quick Insights <span>· Level 30 Beta</span>
      </h2>
      <div className={styles.insights}>
        {insights.map(([label, name, detail]) => (
          <article key={label}>
            <h3>{label}</h3>
            <strong>{name}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function WowChanges({ changes }: { changes: RecentRatingChangeItem[] }) {
  return (
    <section className={styles.section} aria-labelledby="wow-changes-heading">
      <h2 id="wow-changes-heading">
        What Changed <span>· Ranking movement</span>
      </h2>
      {changes.length === 0 ? (
        <p>No recorded tier changes yet.</p>
      ) : (
        <ol className={styles.changes}>
          {changes.map((change) => (
            <li key={change.id}>
              <strong>{change.entityName}</strong>
              <span>
                {change.previousTier} → {change.newTier}
              </span>
              <time dateTime={new Date(change.changedAt).toISOString()}>
                {new Date(change.changedAt).toISOString().slice(0, 10)}
              </time>
            </li>
          ))}
        </ol>
      )}
      <p className={styles.contextNote}>
        Selected context and version only. A missing record does not establish Stable; ranking
        changes do not establish buffs or nerfs.
      </p>
    </section>
  );
}
export function WowSources({ specs }: { specs: WowSpec[] }) {
  const sources = [
    ...new Map(
      specs
        .flatMap((s) => s.item.sources.filter((source) => source.versionMatch))
        .map((s) => [s.sourceId, s]),
    ).values(),
  ];
  return (
    <section className={styles.section} aria-labelledby="wow-sources-heading">
      <h2 id="wow-sources-heading">Sources &amp; Evidence</h2>
      <div className={styles.sourceGrid}>
        <article>
          <a href="https://foreverlogs.gg/" target="_blank" rel="noopener noreferrer">
            Forever Logs ↗
          </a>
          <strong>Primary Performance Data</strong>
          <p>
            {sources.filter((s) => s.sourceType === "data").length} linked performance data
            source(s). Aggregate dungeon performance, visibly attributed to Forever Logs.
          </p>
        </article>
        <article>
          <a
            href="https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-8/2360696"
            target="_blank"
            rel="noopener noreferrer"
          >
            Blizzard ↗
          </a>
          <strong>Official Beta / Game Context</strong>
          <p>Official Level Cap and Dungeon availability. Not a performance rating source.</p>
        </article>
        {["Wowhead", "Mobalytics"].map((name) => (
          <article key={name}>
            <h3>{name}</h3>
            <strong>Editorial Cross-check</strong>
            <p>
              No reviewed cross-check linked to this context and version. Not used in the data
              ranking.
            </p>
          </article>
        ))}
      </div>
      {sources.length > 0 && (
        <details className={styles.sourceRecords}>
          <summary>Recorded evidence and check dates ({sources.length})</summary>
          {sources.map((source) => (
            <p key={source.sourceId}>
              <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
                {source.sourceName}
              </a>{" "}
              · checked {new Date(source.checkedAt).toISOString().slice(0, 10)} ·{" "}
              {source.sourceFreshness}
            </p>
          ))}
        </details>
      )}
    </section>
  );
}
export function WowMethodology() {
  const faqs = [
    [
      "How do you calculate the score?",
      "Within each dungeon, 100 is the median eligible spec benchmark. Higher median DPS/HPS is better; Tank uses inverse median DTPS. Scores across dungeons are weighted by included parses.",
    ],
    [
      "What are the data requirements?",
      "At least 5 parses per dungeon, at least 2 selected near-cap dungeons, and at least 20 included parses. Insufficient evidence remains Pending.",
    ],
    [
      "What are the Tier Bands?",
      "S ≥ 120 · A ≥ 105 · B ≥ 90 · C < 90. Pending means evidence is insufficient, not poor performance.",
    ],
    [
      "Does Level 30 mean only Level 30 players?",
      "No. Level 30 is the Beta level-cap context. Forever Logs aggregate statistics do not expose a player-level filter. This board uses selected near-cap dungeons.",
    ],
    [
      "What does Current mean?",
      "Current requires stored phase provenance consistent with the reviewed official Beta context and both observations and publication verification within 24 hours. Unverified data is Preliminary; expired evidence is Stale. This is a publication policy, not statistical confidence.",
    ],
    [
      "Which dungeons are included?",
      WOW_DUNGEONS.join(" · ") +
        ". Coverage counts only included observations that meet the minimum sample requirement.",
    ],
  ];
  return (
    <section className={styles.methodology} aria-labelledby="wow-methodology-heading">
      <h2 id="wow-methodology-heading">Methodology &amp; FAQ</h2>
      <div>
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
