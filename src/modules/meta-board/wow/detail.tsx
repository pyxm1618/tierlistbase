"use client";

import { useState } from "react";
import { WOW_DUNGEONS } from "../domain/wow-context";
import type { WowSpec } from "./model";
import { SpecIcon } from "./spec-icon";
import styles from "./wow-tier-list.module.css";
const tabs = ["Overview", "Performance", "Evidence", "Changes"] as const;
export function SpecDetail({ spec, titleId }: { spec: WowSpec; titleId: string }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  return (
    <div className={styles.detailBody}>
      <header className={styles.specHeading}>
        <SpecIcon detail />
        <div>
          <p className={styles.eyebrow}>
            {spec.role.toUpperCase()} · {spec.className ?? "Class not recorded"}
          </p>
          <h2 id={titleId}>{spec.specName}</h2>
        </div>
        <span className={styles.detailTier}>{spec.tier}</span>
      </header>
      <p className={styles.placeholderNotice}>Placeholder icon · final visual asset pending</p>
      <p className={styles.contextNote}>Level 30 Beta · Dungeon · {spec.role.toUpperCase()}</p>
      <div role="tablist" aria-label="Spec detail tabs" className={styles.tabs}>
        {tabs.map((name, index) => (
          <button
            key={name}
            id={`${titleId}-${name}-tab`}
            type="button"
            role="tab"
            aria-selected={tab === name}
            tabIndex={tab === name ? 0 : -1}
            aria-controls={`${titleId}-${name}-panel`}
            onClick={() => setTab(name)}
            onKeyDown={(event) => {
              let next: number | undefined;
              if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
              if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
              if (event.key === "Home") next = 0;
              if (event.key === "End") next = tabs.length - 1;
              if (next !== undefined) {
                event.preventDefault();
                setTab(tabs[next]!);
                document.getElementById(`${titleId}-${tabs[next]}-tab`)?.focus();
              }
            }}
          >
            {name}
          </button>
        ))}
      </div>
      {tabs.map((name) => (
        <section
          key={name}
          id={`${titleId}-${name}-panel`}
          role="tabpanel"
          aria-labelledby={`${titleId}-${name}-tab`}
          hidden={tab !== name}
          tabIndex={0}
          className={styles.tabPanel}
        >
          {name === "Overview" && (
            <>
              <h3>Why This Tier</h3>
              <p>
                {spec.score !== null
                  ? `Tier ${spec.tier}: a TierListBase relative performance score of ${spec.score.toFixed(1)}, based on ${spec.parses} included parses across ${spec.coverage} near-cap dungeons. A score of 100 is the same-dungeon median benchmark.`
                  : "Pending: not enough validated evidence for a ranked tier in this context."}
              </p>
              <PerformanceSummary spec={spec} />
              <div className={styles.traits}>
                <section>
                  <h3>Key Strengths</h3>
                  <p>
                    {spec.score !== null
                      ? `Observed relative performance: ${spec.score.toFixed(1)}. Recorded coverage: ${spec.coverage} of ${WOW_DUNGEONS.length} selected dungeons.`
                      : "No supported performance strengths recorded yet."}
                  </p>
                </section>
                <section>
                  <h3>Limitations</h3>
                  <p>
                    Beta aggregate observations cover selected near-cap dungeons. No player-level
                    filter is available. Sample sizes and dungeon coverage limit the comparison.
                  </p>
                  {spec.evidenceIssue && <p>{spec.evidenceIssue}</p>}
                </section>
              </div>
            </>
          )}
          {name === "Performance" && (
            <>
              <h3>Performance · Dungeon</h3>
              <PerformanceSummary spec={spec} />
              <p>
                The score is a relative performance index, not raw DPS, a percentage or confidence.
                DPS uses median damage output, Healer uses median healing output; Tank uses inverse
                median damage taken.
              </p>
              <h3>Dungeon Breakdown</h3>
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Dungeon</th>
                      <th scope="col">Relative Score</th>
                      <th scope="col">Median</th>
                      <th scope="col">Parses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WOW_DUNGEONS.map((location) => {
                      const dungeon = spec.dungeons.find((d) => d.location === location);
                      return (
                        <tr key={location}>
                          <th scope="row">
                            {location}
                            {dungeon && !dungeon.included && (
                              <small>Insufficient sample / excluded</small>
                            )}
                          </th>
                          <td>
                            {dungeon?.included && dungeon.normalizedScore !== null
                              ? dungeon.normalizedScore.toFixed(1)
                              : "N/A"}
                          </td>
                          <td>{dungeon?.median.toLocaleString("en-US") ?? "N/A"}</td>
                          <td>{dungeon?.sampleSize.toLocaleString("en-US") ?? "N/A"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className={styles.contextNote}>
                Scores are normalized within the same dungeon, then weighted by included parses.
                Missing observations remain N/A.
              </p>
            </>
          )}
          {name === "Evidence" && (
            <>
              <h3>Sources &amp; Evidence</h3>
              <p>{`${spec.item.sources.filter((s) => s.versionMatch && s.sourceType === "data").length} performance data source(s)`}</p>
              <p>
                Retrieved:{" "}
                {spec.retrievedAt
                  ? new Date(spec.retrievedAt).toISOString().replace("T", " ")
                  : "N/A"}
              </p>
              {spec.evidenceIssue && <p>{spec.evidenceIssue}</p>}
              {spec.item.sources
                .filter((s) => s.versionMatch)
                .map((source) => (
                  <article className={styles.evidenceCard} key={source.sourceId}>
                    <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
                      {source.sourceName}
                    </a>
                    <p>
                      {source.sourceType === "data"
                        ? "Primary Performance Data"
                        : "Stored source evidence"}{" "}
                      · {source.sourceFreshness}
                    </p>
                    <p>
                      Checked: {new Date(source.checkedAt).toISOString().slice(0, 10)} · Selected
                      context and version
                    </p>
                  </article>
                ))}
              <p>
                Blizzard provides official Beta context. No unreviewed editorial cross-check is used
                in this explanation.
              </p>
            </>
          )}
          {name === "Changes" && (
            <>
              <h3>Ranking movement</h3>
              {spec.item.tierChanges.length ? (
                <ol className={styles.history}>
                  {spec.item.tierChanges.map((change, index) => (
                    <li key={`${change.changedAt}-${index}`}>
                      <strong>
                        {change.previousTier} → {change.newTier}
                      </strong>
                      <time dateTime={new Date(change.changedAt).toISOString()}>
                        {new Date(change.changedAt).toISOString().slice(0, 10)}
                      </time>
                      <p>Recorded ranking movement for this context and version.</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No recorded tier changes yet.</p>
              )}
              <p>Ranking movement does not establish an official balance change.</p>
            </>
          )}
        </section>
      ))}
    </div>
  );
}
export function PerformanceSummary({ spec }: { spec: WowSpec }) {
  return (
    <dl className={styles.performance}>
      {[
        ["Data Score", spec.score?.toFixed(1) ?? "N/A"],
        ["Rank", spec.rank ? `#${spec.rank}` : "Pending"],
        ["Parses", spec.parses?.toLocaleString("en-US") ?? "N/A"],
        ["Coverage", spec.coverage === null ? "N/A" : `${spec.coverage} / ${WOW_DUNGEONS.length}`],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
