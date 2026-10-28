import Link from "next/link";

import {
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

const faq = [
  [
    "What rank is this Wild Rift Tier List for?",
    "This reviewed snapshot uses China server Master+ Ranked statistics, with a solo-queue decision focus. The region and rank context are shown explicitly because this is not a global ranked dataset.",
  ],
  [
    "Why do champions have different tiers in different roles?",
    "The ranking unit is Champion × Role. A champion can have different value in Baron Lane, Jungle, Mid, Dragon Lane, or Support because each role has different responsibilities, matchups, economy, and map impact.",
  ],
  [
    "Why isn't the Tier List sorted only by win rate?",
    "This snapshot retains Wild Rift Core source tiers after TierListBase role review. Tiers are editorial judgements, not official Riot or Tencent rankings or a TierListBase statistical formula. WR / PR / BR are evidence; no sample counts or confidence intervals are supplied.",
  ],
  [
    "Is the current game patch included?",
    `Yes. The current game version is ${snapshot.gameVersion}. The latest standard Ranked balance patch is ${snapshot.latestRankedBalance}; ${snapshot.gameVersion} is primarily an AAA ARAM update and is not treated as a new standard Ranked balance reset.`,
  ],
  [
    "What is the difference between Dragon Lane and ADC?",
    "Dragon Lane is Wild Rift's lane name. ADC describes the ranged carry role most commonly played there. This page uses Dragon Lane as the primary label and ADC / Duo only as an explanatory alias.",
  ],
  [
    "What is the difference between Baron Lane, Solo Lane and Top Lane?",
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
              <p className={styles.heroDescription}>
                Compare current Baron Lane, Jungle, Mid Lane, Dragon Lane, and Support rankings
                using role-specific evidence, ranked statistics, and reviewed patch context.
              </p>
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
                <span>Data Updated</span>
                <strong>
                  <time dateTime={snapshot.snapshotDate}>{snapshot.snapshotDate}</time>
                </strong>
              </div>
            </section>
          </div>
        </div>
      </header>

      <div className={styles.shell}>
        <WildRiftWorkspace />

        <section
          className={styles.sources}
          data-ia-section="sources-evidence"
          aria-labelledby="wild-rift-sources-title"
        >
          <div className={styles.sectionTitleInline}>
            <h2 id="wild-rift-sources-title">Sources &amp; Evidence</h2>
            <p>Patch facts, ranked statistics, and role-specific editorial review.</p>
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
            TierListBase is an independent third-party site. Wild Rift, League of Legends, Riot
            Games, and related intellectual property belong to their respective rights holders.
            TierListBase is not affiliated with, approved by, endorsed by, or partnered with Riot
            Games.
          </p>
        </section>

        <section
          className={styles.methodology}
          data-ia-section="methodology"
          aria-labelledby="wild-rift-methodology-title"
        >
          <div className={styles.sectionTitleInline}>
            <h2 id="wild-rift-methodology-title">How the Wild Rift Tier List Is Ranked</h2>
            <p>
              Each role uses its own criteria. Win Rate alone does not determine Tier; ranked
              statistics are interpreted with role context, reliability, execution burden, draft
              value, and patch evidence.
            </p>
          </div>
          <p className={styles.disclosure}>
            CN Server · Master+ · Ranked. Champion catalog: 142; statistics-backed role placements:
            181 across 136 distinct champions counted in the source tables. The source headline says
            134 tracked champions; that mismatch is unresolved. Another 27 placements have explicit
            Wild Rift Core editorial role evidence and display N/A for every role statistic. Catalog
            membership never creates a ranked placement.
          </p>
          <p className={styles.disclosure}>
            Tiers retain Wild Rift Core source tiers after TierListBase review, with no editorial
            overrides in this snapshot. They are not official Riot or Tencent tiers. The statistics
            are reported by Wild Rift Core as Tencent CN data; TierListBase has not independently
            fetched them from Tencent. Ban rates reflect champion-wide draft pressure.
          </p>
          <p className={styles.disclosure}>
            Decision Signals are TierListBase editorial assessments, reviewed for each Champion ×
            Role: reliability considers repeatable access and fallback utility; blind safety
            considers lane exposure, range, and counterplay; ease considers aiming, combos, and
            resource management; impact considers damage or control access; dependence considers
            allied setup, protection, and follow-up. High Team Dependence means greater reliance on
            allies, not a better score. No signal is computed from Tier. High Ease means easier
            execution.
          </p>
          <p className={styles.disclosure}>
            Trend arrows show same-role seven-day win-rate change only. Unavailable trends stay
            unavailable. The source table labels its delta column “30 d”, but those values match its
            embedded seven-day data; no 30-day movement is inferred from that column. Source history
            metadata ends on 2026-10-27 while its update label says 2026-10-26. What Changed
            attributes dated net tier movements to Wild Rift Core; causal reasons are not evidenced.
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
            <p>Common questions about the current Wild Rift Ranked snapshot.</p>
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
