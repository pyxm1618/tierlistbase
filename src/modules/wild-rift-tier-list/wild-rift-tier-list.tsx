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
  "Use this Wild Rift tier list to compare Baron, Jungle, Mid, Dragon and Support with role-specific evidence, ranked statistics and reviewed patch context. Champions are ranked separately by position.";
const sourcesIntro =
  "This Wild Rift tier list uses patch facts, ranked statistics and role-specific editorial review. No single statistic determines a placement.";
const methodologyIntro =
  "This Wild Rift champion tier list reviews each role separately, weighing Win Rate with reliability, execution burden, draft value and patch evidence.";
const faqIntro =
  "Questions about this Wild Rift tier list, its methodology and current Ranked snapshot.";

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
    "Does the Wild Rift champion tier list cover the current patch?",
    `The current game version is ${snapshot.gameVersion}. Its patch notes change AAA ARAM augments only, so ${snapshot.latestRankedBalance} remains the latest standard Ranked balance patch. The reviewed Master+ CN statistics were captured on ${snapshot.snapshotDate} and the publisher labels that dataset ${snapshot.statisticsPatch}. Raw role statistics, Wild Rift Core source tiers, and TierListBase editorial signals remain separate.`,
  ],
  [
    "How does the Wild Rift champion tier list use Dragon Lane and ADC?",
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
            by Riot Games. Wild Rift and related IP belong to their rights holders.
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
            Scope: CN Server · Master+ · Ranked. This Wild Rift tier list contains{" "}
            {coverage.statisticsBackedPlacements} statistics-backed Champion × Role placements
            across {coverage.distinctStatisticsChampions} champions in the {snapshot.snapshotDate}{" "}
            source tables. The source headline reports {coverage.sourceTrackedChampions} champions;
            that discrepancy is preserved. Another {coverage.editorialPlacements} placements retain
            the {coverage.carriedForwardTierCapture} Wild Rift Core source tier but show N/A for WR
            / PR / BR because no current statistics row exists. Catalog membership alone is
            insufficient.
          </p>
          <p className={styles.disclosure}>
            Every captured Champion × Role row appears in this Wild Rift tier list. Different role
            tiers stay separate instead of being averaged into one overall score.
          </p>
          <p className={styles.disclosure}>
            The Wild Rift tier list preserves Wild Rift Core role rankings without TierListBase
            overrides; they are not official Riot or Tencent tiers. Wild Rift Core reports Tencent
            CN statistics, which TierListBase has not independently fetched. Rates are
            publisher-supplied; ban rate is champion-wide.
          </p>
          <p className={styles.disclosure}>
            Alongside Tier, the Wild Rift tier list publishes five editorial signals per Champion ×
            Role: reliability, blind safety, ease, impact and team dependence. They cover repeatable
            access, lane exposure, execution burden, damage or control, and reliance on allies.
            Signals are independent of Tier; High Team Dependence means more reliance on allies, not
            a better score.
          </p>
          <p className={styles.disclosure}>
            Trend arrows in the Wild Rift tier list show same-role seven-day win-rate change only.
            The capture verifies {coverage.verifiedTrendPlacements} labelled deltas; the other{" "}
            {coverage.statisticsBackedPlacements +
              coverage.editorialPlacements -
              coverage.verifiedTrendPlacements}{" "}
            placements have no trend. The “30 d” column is not reused. Patch {snapshot.gameVersion}{" "}
            changes AAA ARAM augments only, so the {snapshot.snapshotDate} snapshot remains
            post-balance against {snapshot.latestRankedBalance}. A buff alone never promotes a
            champion.
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
