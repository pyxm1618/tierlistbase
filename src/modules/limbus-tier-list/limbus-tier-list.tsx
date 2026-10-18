"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  bestEgoBySinner,
  bestIdentityBySinner,
  egoRows,
  exampleTeamDetail,
  identityRows,
  teamRows,
  type Availability,
  type RatingValue,
  type TierValue,
} from "./data";
import styles from "./limbus-tier-list.module.css";

const identityFilters = [
  "All Identities",
  "Sinner",
  "Rarity",
  "Role",
  "Team / Archetype",
  "Damage Type",
  "Sin Affinity",
  "Generalist Value",
  "Beginner Friendly",
  "Team Dependency",
  "Availability",
] as const;

const detailTabs = ["Overview", "Core & Team", "Key E.G.O", "What to Get Next"] as const;

function AssetSlot({
  compact = false,
  wide = false,
  label = "ART",
}: {
  compact?: boolean;
  wide?: boolean;
  label?: string;
}) {
  return (
    <span
      className={[
        styles.assetSlot,
        compact ? styles.assetSlotCompact : "",
        wide ? styles.assetSlotWide : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Artwork asset required"
      title="Artwork asset required"
    >
      <span>{label}</span>
    </span>
  );
}

function TierBadge({ value }: { value: TierValue }) {
  return (
    <span className={styles.tierBadge} data-tier={value}>
      {value}
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
  const [search, setSearch] = useState("");
  const [activeDetailTab, setActiveDetailTab] = useState<(typeof detailTabs)[number]>("Overview");

  const filteredIdentities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return identityRows;

    return identityRows.filter((row) =>
      [
        row.identity,
        row.sinner,
        row.rarity,
        row.role,
        row.mainTeam,
        row.damageType,
        row.sin,
        row.generalistValue,
        row.beginnerFriendly,
        row.teamDependency,
        row.availability,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [search]);

  return (
    <div className={styles.page} data-limbus-page>
      <header className={styles.chrome}>
        <div className={styles.chromeInner}>
          <div className={styles.brandLockup}>
            <Image
              src="/brand/tierlistbase-mark-fa1e376158.webp"
              alt=""
              width={28}
              height={27}
              unoptimized
            />
            <strong>TIERLISTBASE</strong>
          </div>
          <nav className={styles.mockNavigation} aria-label="Limbus page navigation">
            <span>Games</span>
            <span>Tier Lists</span>
            <span>Guides</span>
            <span>Tools</span>
          </nav>
          <label className={styles.topSearch}>
            <span className={styles.visuallyHidden}>Search this mock Limbus page</span>
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search identities, teams, E.G.O..."
            />
          </label>
          <div className={styles.chromeMeta} aria-hidden="true">
            <span>EN⌄</span>
            <span>◐</span>
          </div>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="limbus-title">
        <div className={styles.heroNoise} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>MANAGER DOSSIER // COMBAT INDEX</p>
          <h1 id="limbus-title">
            <span>LIMBUS COMPANY</span>
            <em>TIER LIST</em>
          </h1>
          <p>Know what&apos;s strong. Know what fits your account. Know what to build next.</p>
        </div>
        <div className={styles.heroArt} aria-label="Hero artwork asset required">
          <span>HERO ART · ASSET REQUIRED</span>
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
            description="Ranked by overall combat strength. Generalist value, beginner friendliness, team dependency, and availability stay separate from the core tier."
            action="View Guide"
            actionHref="#identity-tier-list"
          />

          <div className={styles.filterBar} aria-label="Identity filters">
            <div className={styles.filterScroll}>
              {identityFilters.map((filter, index) => (
                <button
                  className={styles.filterButton}
                  data-active={index === 0 ? "true" : "false"}
                  type="button"
                  key={filter}
                >
                  {filter}
                </button>
              ))}
            </div>
            <label className={styles.inlineSearch}>
              <span aria-hidden="true">⌕</span>
              <span className={styles.visuallyHidden}>Search Identity</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Identity..."
              />
            </label>
          </div>

          <div className={styles.tableFrame}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tier</th>
                  <th>Identity</th>
                  <th>Sinner</th>
                  <th>Rarity</th>
                  <th>Role</th>
                  <th>Main Team / Archetype</th>
                  <th>Damage Type</th>
                  <th>Sin</th>
                  <th>Generalist Value</th>
                  <th>Beginner Friendly</th>
                  <th>Team Dependency</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {filteredIdentities.map((row) => (
                  <tr key={row.rank}>
                    <td className={styles.rankCell}>{row.rank}</td>
                    <td>
                      <TierBadge value={row.tier} />
                    </td>
                    <td>
                      <div className={styles.nameCell}>
                        <AssetSlot compact />
                        <strong>{row.identity}</strong>
                      </div>
                    </td>
                    <td>
                      <div className={styles.sinnerCell}>
                        <AssetSlot compact />
                        <span>{row.sinner}</span>
                      </div>
                    </td>
                    <td className={styles.rarityCell}>{row.rarity}</td>
                    <td>{row.role}</td>
                    <td>
                      <span className={styles.mechanicText}>{row.mainTeam}</span>
                    </td>
                    <td>{row.damageType}</td>
                    <td>{row.sin}</td>
                    <td>
                      <RatingBadge value={row.generalistValue} />
                    </td>
                    <td>
                      <RatingBadge value={row.beginnerFriendly} />
                    </td>
                    <td>
                      <RatingBadge value={row.teamDependency} />
                    </td>
                    <td>
                      <AvailabilityBadge value={row.availability} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredIdentities.length === 0 ? (
              <p className={styles.emptyState}>No mock Identity rows match this search.</p>
            ) : null}
          </div>
        </section>

        <section className={styles.paperSection} id="best-identity-by-sinner">
          <SectionHeader
            number="02"
            title="BEST IDENTITY BY SINNER"
            question="If you want to use this Sinner, which Identity should you choose?"
            action="View All"
            actionHref="#best-identity-by-sinner"
          />
          <div className={styles.sinnerGrid}>
            {bestIdentityBySinner.map((pick) => (
              <article className={styles.sinnerCard} key={pick.sinner}>
                <AssetSlot wide label="PORTRAIT" />
                <h3>{pick.sinner}</h3>
                <dl>
                  <div>
                    <dt>Best Overall</dt>
                    <dd>{pick.bestOverall}</dd>
                  </div>
                  <div>
                    <dt>Best Generalist</dt>
                    <dd>{pick.bestGeneralist}</dd>
                  </div>
                  <div>
                    <dt>Best for Team</dt>
                    <dd>{pick.bestForTeam}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.paperSection} id="team-tier-list">
          <SectionHeader
            number="02"
            title="TEAM TIER LIST"
            question="Which complete teams / builds are the strongest?"
            description="Power is ranked at full build. Cost, dependency, flexibility, ease of use, and beginner friendliness remain separate decision signals."
            action="View Guide"
            actionHref="#team-tier-list"
          />
          <div className={styles.teamWorkspace}>
            <div className={styles.tableFrame}>
              <table className={[styles.dataTable, styles.teamTable].join(" ")}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tier</th>
                    <th>Team / Build</th>
                    <th>Type</th>
                    <th>Key Mechanic</th>
                    <th>Power</th>
                    <th>Story / General</th>
                    <th>MD</th>
                    <th>Railway</th>
                    <th>Build Cost</th>
                    <th>Beginner Friendly</th>
                  </tr>
                </thead>
                <tbody>
                  {teamRows.map((row) => (
                    <tr key={row.rank}>
                      <td className={styles.rankCell}>{row.rank}</td>
                      <td>
                        <TierBadge value={row.tier} />
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <AssetSlot compact label="ICON" />
                          <strong>{row.team}</strong>
                        </div>
                      </td>
                      <td>{row.type}</td>
                      <td>
                        <span className={styles.mechanicText}>{row.keyMechanic}</span>
                      </td>
                      <td>
                        <RatingBadge value={row.power} compact />
                      </td>
                      <td>
                        <RatingBadge value={row.storyGeneral} compact />
                      </td>
                      <td>
                        <RatingBadge value={row.mirrorDungeon} compact />
                      </td>
                      <td>
                        <RatingBadge value={row.railway} compact />
                      </td>
                      <td>
                        <RatingBadge value={row.buildCost} compact />
                      </td>
                      <td>
                        <RatingBadge value={row.beginnerFriendly} compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <article className={styles.teamDetail} id="team-details">
              <div className={styles.teamDetailHeader}>
                <span className={styles.detailNumber}>02</span>
                <strong>TEAM DETAILS (EXAMPLE)</strong>
                <button type="button">View All Teams →</button>
              </div>
              <div className={styles.teamDetailHero}>
                <div className={styles.teamBannerAsset}>TEAM BANNER · ASSET REQUIRED</div>
                <div className={styles.teamDetailTitle}>
                  <h3>{exampleTeamDetail.team}</h3>
                  <div>
                    <TierBadge value={exampleTeamDetail.powerTier} />
                    <span className={styles.typeChip}>Status</span>
                    <span className={styles.mechanicText}>Bleed</span>
                  </div>
                </div>
              </div>
              <div className={styles.detailTabs} role="tablist" aria-label="Team detail sections">
                {detailTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeDetailTab === tab}
                    data-active={activeDetailTab === tab ? "true" : "false"}
                    onClick={() => setActiveDetailTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className={styles.teamMetrics}>
                <dl>
                  <div>
                    <dt>Power Tier</dt>
                    <dd>
                      <RatingBadge value={exampleTeamDetail.powerTier} compact />
                    </dd>
                  </div>
                  <div>
                    <dt>Story / General</dt>
                    <dd>
                      <RatingBadge value={exampleTeamDetail.storyGeneral} compact />
                    </dd>
                  </div>
                  <div>
                    <dt>Mirror Dungeon</dt>
                    <dd>
                      <RatingBadge value={exampleTeamDetail.mirrorDungeon} compact />
                    </dd>
                  </div>
                  <div>
                    <dt>Railway / Endgame</dt>
                    <dd>
                      <RatingBadge value={exampleTeamDetail.railwayEndgame} compact />
                    </dd>
                  </div>
                </dl>
                <dl>
                  <div>
                    <dt>Build Cost</dt>
                    <dd>
                      <RatingBadge value={exampleTeamDetail.buildCost} compact />
                    </dd>
                  </div>
                  <div>
                    <dt>Core Dependency</dt>
                    <dd>
                      <RatingBadge value={exampleTeamDetail.coreDependency} compact />
                    </dd>
                  </div>
                  <div>
                    <dt>Flexibility</dt>
                    <dd>
                      <RatingBadge value={exampleTeamDetail.flexibility} compact />
                    </dd>
                  </div>
                  <div>
                    <dt>Ease of Use</dt>
                    <dd>
                      <RatingBadge value={exampleTeamDetail.easeOfUse} compact />
                    </dd>
                  </div>
                  <div>
                    <dt>Beginner Friendly</dt>
                    <dd>
                      <RatingBadge value={exampleTeamDetail.beginnerFriendly} compact />
                    </dd>
                  </div>
                </dl>
              </div>
              <div className={styles.teamPieces}>
                <div>
                  <h4>Core Members</h4>
                  <div className={styles.assetStrip}>
                    {exampleTeamDetail.coreMembers.map((member) => (
                      <span key={member} title={member}>
                        <AssetSlot compact label="ART" />
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>Recommended Team</h4>
                  <div className={styles.assetStrip}>
                    {exampleTeamDetail.recommendedTeam.map((member) => (
                      <span key={member} title={member}>
                        <AssetSlot compact label="ART" />
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>Key E.G.O</h4>
                  <div className={styles.assetStrip}>
                    {exampleTeamDetail.keyEgo.map((ego) => (
                      <span key={ego} title={ego}>
                        <AssetSlot compact label="EGO" />
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>Substitutes / Alternatives</h4>
                  <div className={styles.assetStrip}>
                    {exampleTeamDetail.substitutes.map((member) => (
                      <span key={member} title={member}>
                        <AssetSlot compact label="ART" />
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.missingNext}>
                  <h4>Missing One / What to Get Next</h4>
                  <p>
                    {exampleTeamDetail.missingOne}
                    <span aria-hidden="true">›</span>
                  </p>
                </div>
              </div>
              <p className={styles.tabHint}>
                Active detail view: <strong>{activeDetailTab}</strong>
              </p>
            </article>
          </div>
        </section>

        <section className={styles.paperSection} id="ego-tier-list">
          <div className={styles.egoWorkspace}>
            <div>
              <SectionHeader
                number="03"
                title="E.G.O TIER LIST"
                question="Which E.G.O are the most valuable?"
                description="Ranked by overall combat value, with use case, team importance, generalist value, and availability kept visible."
                action="View Guide"
                actionHref="#ego-tier-list"
              />
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
                            <AssetSlot compact label="EGO" />
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
                    <AssetSlot compact label="POR" />
                    <div title={pick.bestOverall}>
                      <AssetSlot compact label="EGO" />
                      <span>{pick.bestOverall}</span>
                    </div>
                    <div title={pick.bestGeneralist}>
                      <AssetSlot compact label="EGO" />
                      <span>{pick.bestGeneralist}</span>
                    </div>
                    <div title={pick.bestForTeam}>
                      <AssetSlot compact label="EGO" />
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
                <p>Check the Identity Tier List and the detailed ratings.</p>
              </div>
              <span aria-hidden="true">→</span>
            </li>
            <li>
              <strong>2</strong>
              <div>
                <h3>Choose a Team to build</h3>
                <p>Use Team Tier List and the Team Details block.</p>
              </div>
              <span aria-hidden="true">→</span>
            </li>
            <li>
              <strong>3</strong>
              <div>
                <h3>Get key members &amp; E.G.O</h3>
                <p>Review the missing pieces and key E.G.O for your chosen team.</p>
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
