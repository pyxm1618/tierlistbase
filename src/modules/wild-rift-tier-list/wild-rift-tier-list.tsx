import Image from "next/image";
import Link from "next/link";

import { getChampion, getRoleProfile, roleKeys, wildRiftSnapshot, type Source } from "./data";
import { WildRiftWorkspace } from "./wild-rift-workspace";
import styles from "./wild-rift-tier-list.module.css";

const faq = [
  [
    "What rank is this Wild Rift Tier List for?",
    `This reviewed snapshot uses ${wildRiftSnapshot.region} ${wildRiftSnapshot.rankContext} Ranked statistics. It is not labeled as global data because the current statistics source is China-server specific.`,
  ],
  [
    "Why do champions have different tiers in different roles?",
    "Every placement is Champion × Role. A champion can be excellent in one role and only situational in another because lane pressure, economy, map responsibilities and execution demands change by position.",
  ],
  [
    "Why isn't the Tier List sorted only by win rate?",
    "Win rate is evidence, not the formula. The review also considers role context, consistency, draft relevance, execution burden, solo-queue value, patch impact, meta presence and sample reliability.",
  ],
  [
    "Is the current game patch included?",
    `Yes. The current client version is ${wildRiftSnapshot.gameVersion}. The latest standard Ranked balance pass is ${wildRiftSnapshot.latestRankedBalance}; patch 7.3c is scoped to AAA ARAM, so it is shown separately instead of being presented as a new Ranked meta reset.`,
  ],
  [
    "What is the difference between Dragon Lane and ADC?",
    "Dragon Lane is the Wild Rift lane name. ADC describes the marksman carry role commonly played there; Duo is another common shorthand. This page keeps one Dragon Lane list rather than creating duplicate ADC and Duo lists.",
  ],
  [
    "What is the difference between Baron Lane, Solo Lane and Top Lane?",
    "Baron Lane is Wild Rift's official lane label. Solo Lane and Top Lane are common community terms for the same strategic position, so they are treated as synonyms rather than separate rankings.",
  ],
] as const;

function HeroChampion({
  championId,
  className,
  priority = false,
}: {
  championId: string;
  className?: string;
  priority?: boolean;
}) {
  const champion = getChampion(championId);
  return (
    <span className={className} aria-hidden="true">
      <Image
        src={champion.portrait}
        alt=""
        width={128}
        height={128}
        sizes="128px"
        priority={priority}
      />
    </span>
  );
}

function SourceLink({ source }: { source: Source }) {
  if (source.url.startsWith("/")) return <Link href={source.url}>{source.name}</Link>;
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer">
      {source.name}
    </a>
  );
}

export function WildRiftTierList() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} data-ia-section="page-header">
        <div className={styles.riftGrid} aria-hidden="true" />
        <div className={styles.heroChampions} aria-hidden="true">
          <HeroChampion championId="malphite" className={styles.heroChampionBack} priority />
          <HeroChampion championId="hwei" className={styles.heroChampionMid} />
          <HeroChampion championId="ashe" className={styles.heroChampionFront} />
        </div>
        <div className={styles.shell}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span>Wild Rift</span>
            <span aria-hidden="true">›</span>
            <span>Tier List</span>
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <span className={styles.heroLabel}>Ranked · Role-specific review</span>
              <h1>Wild Rift Tier List</h1>
              <p className={styles.heroLead}>
                Compare current Wild Rift champions by role using China Ranked statistics, official
                balance notes and role-specific editorial review—not a single cross-role win-rate
                leaderboard.
              </p>
              <div className={styles.heroTags} aria-label="Ranking scope">
                <span>Baron</span>
                <span>Jungle</span>
                <span>Mid</span>
                <span>Dragon</span>
                <span>Support</span>
              </div>
            </div>

            <section
              className={styles.context}
              data-ia-section="ranking-context"
              aria-label="Ranking Context"
            >
              <div>
                <span>Game Version</span>
                <strong>{wildRiftSnapshot.gameVersion}</strong>
              </div>
              <div>
                <span>Latest Ranked Balance</span>
                <strong>{wildRiftSnapshot.latestRankedBalance}</strong>
              </div>
              <div>
                <span>Queue</span>
                <strong>{wildRiftSnapshot.queueContext}</strong>
                <small>{wildRiftSnapshot.queueFocus}</small>
              </div>
              <div>
                <span>Rank Context</span>
                <strong>{wildRiftSnapshot.rankContext}</strong>
              </div>
              <div>
                <span>Region</span>
                <strong>{wildRiftSnapshot.region}</strong>
              </div>
              <div>
                <span>Data Updated</span>
                <strong>
                  <time dateTime={wildRiftSnapshot.snapshotDate}>
                    {wildRiftSnapshot.snapshotDate}
                  </time>
                </strong>
              </div>
            </section>
          </div>
        </div>
      </section>

      <div className={styles.shell}>
        <WildRiftWorkspace />

        <section
          className={styles.sources}
          data-ia-section="sources"
          aria-labelledby="sources-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Evidence ledger</span>
              <h2 id="sources-heading">Sources &amp; Evidence</h2>
            </div>
            <p>
              Statistics are labeled with their real region and rank context. Editorial placement
              remains TierListBase&apos;s reviewed interpretation.
            </p>
          </div>
          <div className={styles.sourceLedger}>
            {wildRiftSnapshot.sources.map((source) => (
              <article key={source.id} className={styles.sourceRow} data-source-type={source.type}>
                <span className={styles.sourceType}>
                  {source.type === "official_patch"
                    ? "Official Patch Notes"
                    : source.type === "ranked_statistics"
                      ? "Ranked Statistics"
                      : source.type === "editorial_crosscheck"
                        ? "Editorial Cross-check"
                        : "Editorial Review"}
                </span>
                <div>
                  <strong>
                    <SourceLink source={source} />
                  </strong>
                  <p>{source.context}</p>
                </div>
                <time dateTime={source.checkedAt}>Checked {source.checkedAt}</time>
              </article>
            ))}
          </div>
          <p className={styles.disclosure}>
            TierListBase is an independent third-party site. Wild Rift, League of Legends, Riot
            Games and related intellectual property belong to their respective rights holders.
            TierListBase is not official, Riot-approved, Riot-endorsed or a Riot Games partner.
          </p>
        </section>

        <section
          className={styles.methodology}
          data-ia-section="methodology"
          aria-labelledby="methodology-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Data-informed editorial ranking</span>
              <h2 id="methodology-heading">How the Wild Rift Tier List Is Ranked</h2>
            </div>
            <p>
              Win Rate alone does not determine Tier. Each role uses criteria that match its actual
              Ranked job.
            </p>
          </div>
          <div className={styles.methodGrid}>
            {roleKeys.map((role) => {
              const profile = getRoleProfile(role);
              return (
                <article key={role} className={styles.methodRole}>
                  <h3>
                    {profile.label}
                    {profile.auxiliary && <small>{profile.auxiliary}</small>}
                  </h3>
                  <ul>
                    {profile.criteria.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
          <div className={styles.methodNote}>
            <strong>Review model</strong>
            <p>
              Tier placement combines role context, current statistics, consistency, draft
              relevance, execution burden, solo-queue value, patch impact, meta presence and sample
              reliability. High WR does not automatically produce S+.
            </p>
          </div>
        </section>

        <section className={styles.faqSection} data-ia-section="faq" aria-labelledby="faq-heading">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Reference</span>
              <h2 id="faq-heading">Wild Rift Tier List FAQ</h2>
            </div>
          </div>
          <div className={styles.faqList}>
            {faq.map(([question, answer]) => (
              <details key={question} className={styles.faq}>
                <summary>
                  {question}
                  <span aria-hidden="true">＋</span>
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
