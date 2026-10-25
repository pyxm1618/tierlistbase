import Image from "next/image";

import {
  bestEgoBySinner,
  bestIdentityBySinner,
  egoRows,
  teamDetails,
  teamRows,
  type Availability,
  type RatingValue,
  type TierValue,
} from "./data";
import limbusHero from "./assets/hero.webp";
import teamBanner from "./assets/team-banner.webp";
import { AssetSlot } from "./asset-slot";
import {
  egoArtwork,
  egoArtworkSrc,
  identityArtwork,
  identityArtworkSrc,
  teamArtworkSrc,
} from "./artwork";
import { IdentityRanking } from "./identity-ranking";
import { SinnerPortrait } from "./sinner-portrait";
import styles from "./limbus-tier-list.module.css";
import { TeamWorkspace } from "./team-workspace";

function TierBadge({ value }: { value: TierValue }) {
  return (
    <span className={styles.tierBadge} data-tier={value}>
      {value === "NEEDS_REVIEW" ? "Review" : value}
    </span>
  );
}

function RatingBadge({
  value,
  compact = false,
}: {
  value: RatingValue | TierValue | string;
  compact?: boolean;
}) {
  return (
    <span
      className={[styles.ratingBadge, compact ? styles.ratingBadgeCompact : ""]
        .filter(Boolean)
        .join(" ")}
      data-rating={value}
    >
      {value}
    </span>
  );
}

function AvailabilityBadge({ value }: { value: Availability }) {
  return (
    <span className={styles.availabilityBadge} data-availability={value}>
      {value}
    </span>
  );
}

function SectionHeader({
  number,
  title,
  question,
  description,
  action,
  actionHref,
}: {
  number: string;
  title: string;
  question: string;
  description?: string;
  action: string;
  actionHref: string;
}) {
  return (
    <header className={styles.sectionHeader}>
      <span className={styles.sectionNumber}>{number}</span>
      <h2>{title}</h2>
      <p className={styles.sectionQuestion}>{question}</p>
      {description ? <p className={styles.sectionDescription}>{description}</p> : null}
      <a className={styles.sectionAction} href={actionHref}>
        {action}
        <span aria-hidden="true">→</span>
      </a>
    </header>
  );
}

export function LimbusTierList() {
  return (
    <div className={styles.page} data-limbus-page>
      <section className={styles.hero} aria-labelledby="limbus-title">
        <Image src={limbusHero} alt="" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroNoise} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>MANAGER DOSSIER // COMBAT INDEX</p>
          <h1 id="limbus-title">
            <span>LIMBUS COMPANY</span>
            <em>TIER LIST</em>
          </h1>
          <p>
            Use this Limbus Company Tier List to compare the strongest Identities, teams, and E.G.O
            for your account and decide what to build next.
          </p>
        </div>
        <p className={styles.heroGraffiti} aria-hidden="true">
          FACE THE SIN,
          <br />
          SAVE THE E.G.O.
        </p>
      </section>

      <main className={styles.content}>
        <section className={styles.paperSection} id="identity-tier-list">
          <SectionHeader
            number="01"
            title="IDENTITY TIER LIST"
            question="Which Identities are the strongest in the current meta?"
            description="This Limbus Company Tier List ranks Identities by overall combat strength. Use the Limbus Tier List to compare generalist value, beginner friendliness, team dependency, and availability without mixing those factors into the core tier."
            action="View Guide"
            actionHref="#identity-tier-list"
          />

          <IdentityRanking artwork={identityArtworkSrc} />
        </section>

        <section className={styles.paperSection} id="best-identity-by-sinner">
          <SectionHeader
            number="02"
            title="BEST IDENTITY BY SINNER"
            question="If you want to use this Sinner, which Identity should you choose?"
            description="The Limbus Company Tier List also shows the strongest Identity choices for each Sinner, including generalist and team-focused options."
            action="View All"
            actionHref="#best-identity-by-sinner"
          />
          <div className={styles.sinnerGrid}>
            <div className={styles.sinnerLabels} aria-hidden="true">
              <span />
              <strong>Best Overall</strong>
              <strong>Best Generalist</strong>
              <strong>Best for Team</strong>
            </div>
            {bestIdentityBySinner.map((pick) => (
              <article className={styles.sinnerCard} key={pick.sinner}>
                <div className={styles.sinnerPortrait}>
                  <SinnerPortrait sinner={pick.sinner} variant="identity" />
                  <h3>{pick.sinner}</h3>
                </div>
                <div className={styles.sinnerPick} title={pick.bestOverall}>
                  <AssetSlot compact src={identityArtwork[pick.bestOverall]?.src} alt="" />
                  <span>{pick.bestOverall}</span>
                </div>
                <div className={styles.sinnerPick} title={pick.bestGeneralist}>
                  <AssetSlot compact src={identityArtwork[pick.bestGeneralist]?.src} alt="" />
                  <span>{pick.bestGeneralist}</span>
                </div>
                <div className={styles.sinnerPick} title={pick.bestForTeam}>
                  <AssetSlot compact src={identityArtwork[pick.bestForTeam]?.src} alt="" />
                  <span>{pick.bestForTeam}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.paperSection} id="team-tier-list">
          <SectionHeader
            number="02"
            title="TEAM TIER LIST"
            question="Which complete teams / builds are the strongest?"
            description="Use the Limbus Company Tier List to compare complete team strength while keeping cost, dependency, flexibility, ease of use, and beginner friendliness as separate decision signals."
            action="View Guide"
            actionHref="#team-tier-list"
          />
          <TeamWorkspace
            teamRows={teamRows}
            teamDetails={teamDetails}
            teamArtwork={teamArtworkSrc}
            identityArtwork={identityArtworkSrc}
            egoArtwork={egoArtworkSrc}
            bannerImage={teamBanner}
          />
        </section>

        <section className={styles.paperSection} id="ego-tier-list">
          <SectionHeader
            number="03"
            title="LIMBUS COMPANY E.G.O TIER LIST"
            question="Which E.G.O are the most valuable?"
            description="The Limbus Company EGO Tier List ranks E.G.O by overall combat value, best use case, generalist value, team importance, and availability. Use the Limbus Tier List to identify which E.G.O add the most value to your chosen team."
            action="View Guide"
            actionHref="#ego-tier-list"
          />
          <div className={styles.egoWorkspace}>
            <div>
              <div className={styles.tableFrame}>
                <table className={[styles.dataTable, styles.egoTable].join(" ")}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tier</th>
                      <th>E.G.O</th>
                      <th>Sinner</th>
                      <th>Main Team</th>
                      <th>Best Use Case</th>
                      <th>Generalist</th>
                      <th>Team Importance</th>
                      <th>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {egoRows.map((row) => (
                      <tr key={row.rank}>
                        <td className={styles.rankCell}>{row.rank}</td>
                        <td>
                          <TierBadge value={row.tier} />
                        </td>
                        <td>
                          <div className={styles.nameCell}>
                            <AssetSlot compact src={egoArtwork[row.ego]?.src} alt="" />
                            <strong>{row.ego}</strong>
                          </div>
                        </td>
                        <td>{row.sinner}</td>
                        <td>
                          <span className={styles.mechanicText}>{row.mainTeam}</span>
                        </td>
                        <td>{row.bestUseCase}</td>
                        <td>
                          <RatingBadge value={row.generalist} compact />
                        </td>
                        <td>
                          <RatingBadge value={row.teamImportance} compact />
                        </td>
                        <td>
                          <AvailabilityBadge value={row.availability} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <section className={styles.bestEgo} id="best-ego-by-sinner">
              <div className={styles.bestEgoHeader}>
                <span className={styles.detailNumber}>03</span>
                <h2>BEST E.G.O BY SINNER</h2>
                <a href="#best-ego-by-sinner">View All →</a>
              </div>
              <div className={styles.bestEgoMatrix}>
                <div className={styles.bestEgoLabels} aria-hidden="true">
                  <span />
                  <span>Best Overall</span>
                  <span>Best Generalist</span>
                  <span>Best for Team</span>
                </div>
                {bestEgoBySinner.map((pick) => (
                  <article className={styles.egoSinnerColumn} key={pick.sinner}>
                    <h3>{pick.sinner}</h3>
                    <SinnerPortrait sinner={pick.sinner} variant="ego" />
                    <div title={pick.bestOverall}>
                      <AssetSlot compact src={egoArtwork[pick.bestOverall]?.src} alt="" />
                      <span>{pick.bestOverall}</span>
                    </div>
                    <div title={pick.bestGeneralist}>
                      <AssetSlot compact src={egoArtwork[pick.bestGeneralist]?.src} alt="" />
                      <span>{pick.bestGeneralist}</span>
                    </div>
                    <div title={pick.bestForTeam}>
                      <AssetSlot compact src={egoArtwork[pick.bestForTeam]?.src} alt="" />
                      <span>{pick.bestForTeam}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className={styles.nextStep} aria-labelledby="next-step-title">
          <div className={styles.nextStepTitle}>
            <span aria-hidden="true">↯</span>
            <h2 id="next-step-title">YOUR NEXT STEP</h2>
          </div>
          <ol>
            <li>
              <strong>1</strong>
              <div>
                <h3>Find strong Identities</h3>
                <p>
                  Use the Limbus Company Tier List to compare Identity ranks and detailed ratings.
                </p>
              </div>
              <span aria-hidden="true">→</span>
            </li>
            <li>
              <strong>2</strong>
              <div>
                <h3>Choose a Team to build</h3>
                <p>
                  Use the Limbus Tier List to compare complete teams and open the Team Details
                  block.
                </p>
              </div>
              <span aria-hidden="true">→</span>
            </li>
            <li>
              <strong>3</strong>
              <div>
                <h3>Get key members &amp; E.G.O</h3>
                <p>
                  Review the Limbus Company E.G.O Tier List for the key E.G.O that support your
                  chosen team.
                </p>
              </div>
            </li>
          </ol>
          <p className={styles.nextStepGraffiti} aria-hidden="true">
            SAME SIN,
            <br />
            DIFFERENT ANSWERS.
          </p>
        </section>
      </main>
    </div>
  );
}
