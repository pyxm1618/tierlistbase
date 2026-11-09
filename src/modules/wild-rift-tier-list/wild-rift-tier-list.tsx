import Image from "next/image";
import Link from "next/link";

import {
  coverage,
  roleCriteria,
  roleKeys,
  roleLabels,
  snapshot,
  sources,
  tierDefinitions,
  tiers,
} from "./data";
import styles from "./wild-rift-tier-list.module.css";
import { WildRiftWorkspace } from "./wild-rift-workspace";

const heroDescription =
  "Use this Wild Rift tier list to compare Baron, Jungle, Mid, Dragon and Support with ranked statistics, role evidence and reviewed patch context.";
const sourcesIntro =
  "This Wild Rift tier list combines patch facts, ranked statistics and role review; no statistic alone determines placement.";
const methodologyIntro =
  "This Wild Rift champion tier list reviews each role separately, combining Win Rate with reliability, execution, draft value and patch evidence.";
const faqIntro =
  "Questions about this Wild Rift tier list, methodology and Ranked snapshot.";

const faq = [
  [
    "What rank does this Wild Rift Tier List cover?",
    "This reviewed snapshot uses China server Master+ Ranked statistics, with a solo-queue decision focus. The region and rank context are shown explicitly because this is not a global ranked dataset.",
  ],
  [
    "Why does the Wild Rift champion tier list differ by role?",
    "The ranking unit is Champion × Role. A champion can have different value in Baron Lane, Jungle, Mid, Dragon Lane, or Support because each role has different responsibilities, matchups, economy, and map impact.",
  ],
  [
    "Why isn't this Wild Rift tier list based only on win rate?",
    "This snapshot retains Wild Rift Core source tiers after TierListBase role review. Wild Rift Core describes its tier list as a data-informed ranking using Master+ performance and consensus; it is not a Riot or Tencent official tier. TierListBase Decision Signals are separate editorial assessments. WR / PR / BR remain raw evidence, not a TierListBase tier formula.",
  ],
  [
    "Does this ranking cover the current game patch?",
    `The current game version is ${snapshot.gameVersion}. Its patch notes change AAA ARAM augments only, so ${snapshot.latestRankedBalance} remains the latest standard Ranked balance patch. The reviewed Master+ CN statistics were captured on ${snapshot.snapshotDate} and the publisher labels that dataset ${snapshot.statisticsPatch}. Raw role statistics, Wild Rift Core source tiers, and TierListBase editorial signals remain separate.`,
  ],
  [
    "How are Dragon Lane and ADC handled?",
    "Dragon Lane is Wild Rift's lane name. ADC describes the ranged carry role most commonly played there. This page uses Dragon Lane as the primary label and ADC / Duo only as an explanatory alias.",
  ],
  [
    "How does the Wild Rift tier list use Baron, Solo and Top Lane?",
    "Baron Lane is Wild Rift's official lane label. Solo Lane and Top Lane are common community terms for the same general position. This page uses Baron Lane as the primary label and Solo / Top as an alias.",
  ],
] as const;

export function WildRiftTierList() {
  const officialSources = sources.filter((source) => source.type === "official_patch");
  const rankedSource = sources.find((source) => source.type === "ranked_statistics");
  const tierSource = sources.find((source) => source.id === "core-editorial-tier");
  const editorialSource = sources.find((source) => source.id === "editorial-review");

  return (
    <main className={styles.page}>
      <header className={styles.hero} data-ia-section="hero">
        <div className={styles.heroArtwork} aria-hidden="true">
          <Image src="/images/wild-rift/hero.webp" alt="" fill priority sizes="100vw" unoptimized />
        </div>
        <div className={styles.heroAtmosphere} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className={styles.shell}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Wild Rift</span>
            <span aria-hidden="true">/</span>
            <span>Tier List</span>
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Wild Rift Ranked Meta</p>
              <h1>Wild Rift Tier List</h1>
              <p className={styles.heroLead}>Best Champions by Role for Ranked</p>
              <p className={styles.heroDescription}>{heroDescription}</p>
            </div>
            <section
              className={styles.rankingContext}
              data-ia-section="ranking-context"
              aria-label="Ranking Context"
            >
              <div>
                <span>Game Version</span>
                <strong>{snapshot.gameVersion}</strong>
              </div>
              <div>
                <span>Latest Ranked Balance</span>
                <strong>{snapshot.latestRankedBalance}</strong>
              </div>
              <div>
                <span>Queue</span>
                <strong>{snapshot.queueContext}</strong>
                <small>{snapshot.focus}</small>
              </div>
              <div>
                <span>Rank Context</span>
                <strong>
                  {snapshot.region} · {snapshot.rankContext}
                </strong>
              </div>
              <div>
                <span>Statistics Snapshot</span>
                <strong>
                  <time dateTime={snapshot.snapshotDate}>{snapshot.snapshotDate}</time>
                </strong>
                <small>Reviewed {snapshot.reviewedAt}</small>
              </div>
            </section>
          </div>
        </div>
      </header>

      <div className={styles.shell}>
        <p className={styles.disclosure} data-ia-section="source-freshness" role="status">
          Current game version: {snapshot.gameVersion}. Latest standard Ranked balance:{" "}
          {snapshot.latestRankedBalance}. Verified statistics snapshot: {snapshot.snapshotDate} (
          {snapshot.statisticsPatch}) · CN Server · Master+ · Ranked. Raw WR / PR / BR come only
          from exact Champion × Role rows. Tiers and decision signals remain editorial assessments,
          not Riot or Tencent official rankings.
        </p>
        <WildRiftWorkspace />

        <section
          className={styles.sources}
          data-ia-section="sources-evidence"
          aria-labelledby="wild-rift-sources-title"
        >
          <div className={styles.sectionTitleInline}>
            <h2 id="wild-rift-sources-title">Sources &amp; Evidence</h2>
            <p>{sourcesIntro}</p>
          </div>
          <div className={styles.sourceGrid}>
            <article>
              <span className={styles.sourceIcon} aria-hidden="true">
                ◈
              </span>
              <div>
                <h3>Official Patch Notes</h3>
                <p>Riot Games · checked {snapshot.reviewedAt}</p>
                <ul>
                  {officialSources.map((source) => (
                    <li key={source.id}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.name}
                      </a>
                      <span>{source.context}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
            <article>
              <span className={styles.sourceIcon} aria-hidden="true">
                ▥
              </span>
              <div>
                <h3>Ranked Statistics</h3>
                {rankedSource ? (
                  <>
                    <a href={rankedSource.url} target="_blank" rel="noopener noreferrer">
                      {rankedSource.name}
                    </a>
                    <p>{rankedSource.context}</p>
                    <small>Checked {rankedSource.checkedAt}</small>
                  </>
                ) : null}
              </div>
            </article>
            <article>
              <span className={styles.sourceIcon} aria-hidden="true">
                ✦
              </span>
              <div>
                <h3>Editorial Review</h3>
                {editorialSource ? (
                  <>
                    <Link href={editorialSource.url}>{editorialSource.name}</Link>
                    <p>{editorialSource.context}</p>
                    {tierSource ? (
                      <p>
                        <a href={tierSource.url} target="_blank" rel="noopener noreferrer">
                          {tierSource.name}
                        </a>
                      </p>
                    ) : null}
                    <small>Checked {editorialSource.checkedAt}</small>
                  </>
                ) : null}
              </div>
            </article>
          </div>
          <p className={styles.disclosure}>
            TierListBase is independent. This Wild Rift tier list is not affiliated with or endorsed
            by Riot Games; related IP belongs to its rights holders.
          </p>
        </section>

        <section
          className={styles.methodology}
          data-ia-section="methodology"
          aria-labelledby="wild-rift-methodology-title"
        >
          <div className={styles.sectionTitleInline}>
            <h2 id="wild-rift-methodology-title">How the Wild Rift Tier List Is Ranked</h2>
            <p>{methodologyIntro}</p>
          </div>
          <p className={styles.disclosure}>
            Scope: CN Server · Master+ · Ranked. This Wild Rift tier list includes{" "}
            {coverage.statisticsBackedPlacements} statistics-backed Champion × Role placements
            across {coverage.distinctStatisticsChampions} champions from {snapshot.snapshotDate}.
            The source lists {coverage.sourceTrackedChampions} champions. This discrepancy is
            preserved. Another {coverage.editorialPlacements} placements keep the{" "}
            {coverage.carriedForwardTierCapture} Wild Rift Core tier but show N/A for WR / PR / BR
            without current statistics.
          </p>
          <p className={styles.disclosure}>
            Every captured Champion × Role row appears in this Wild Rift tier list; role tiers stay
            separate rather than averaged.
          </p>
          <p className={styles.disclosure}>
            The Wild Rift tier list preserves Wild Rift Core role rankings without TierListBase
            overrides; they are not official Riot or Tencent tiers. TierListBase has not
            independently fetched the reported Tencent CN data. Rates are publisher-supplied; ban
            rate is champion-wide.
          </p>
          <p className={styles.disclosure}>
            Alongside Tier, the Wild Rift tier list publishes five editorial signals per Champion ×
            Role: reliability, blind safety, ease, impact and team dependence. They cover access,
            lane exposure, execution, damage or control and reliance on allies. Signals are
            independent of Tier; high dependence means more reliance on allies.
          </p>
          <p className={styles.disclosure}>
            Trend arrows in the Wild Rift tier list show same-role seven-day win-rate change. The
            capture verifies {coverage.verifiedTrendPlacements} labelled deltas; the other{" "}
            {coverage.statisticsBackedPlacements +
              coverage.editorialPlacements -
              coverage.verifiedTrendPlacements}{" "}
            placements have none. The “30 d” column is separate. Patch {snapshot.gameVersion}{" "}
            changes AAA ARAM augments only, so the {snapshot.snapshotDate} snapshot remains
            post-balance against {snapshot.latestRankedBalance}. Buffs alone do not change tiers.
          </p>
          <div className={styles.methodGrid}>
            {roleKeys.map((role) => (
              <article key={role}>
                <h3>{roleLabels[role]}</h3>
                <ul>
                  {roleCriteria[role].map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <dl className={styles.tierDefinitions}>
            {tiers.map((tier) => (
              <div key={tier}>
                <dt data-tier={tier}>{tier}</dt>
                <dd>{tierDefinitions[tier]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.faq} data-ia-section="faq" aria-labelledby="wild-rift-faq-title">
          <div className={styles.sectionTitleInline}>
            <h2 id="wild-rift-faq-title">FAQ</h2>
            <p>{faqIntro}</p>
          </div>
          <div className={styles.faqList}>
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
