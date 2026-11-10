import Image from "next/image";
import reviewMetadata from "./review-metadata.json";
import {
  units,
  traits,
  equipment,
  evolutions,
  teams,
  snapshot,
  sources,
  modeContexts,
} from "./data";
import { UnitWorkspace } from "./unit-workspace";
import { artworkFor, artworkForOptional } from "./artwork";
import { authorityClaim, evidenceCoverage, tierEvidence } from "./evidence";
import styles from "./anime-expeditions-tier-list.module.css";

const faq = [
  [
    "How does the Anime Expeditions tier list work across modes?",
    "Wave count, boss immunities, placement rules and upgrade budgets change the value of the same kit. The current Anime Expeditions tier list keeps canonical grades stable while Mode Context makes those tradeoffs visible without creating extra tier lists.",
  ],
  [
    "How does the Anime Expeditions unit tier list handle evolved forms?",
    "Base and evolved forms belong to one canonical unit. The board shows the selected ranked form. Broken Falcon has divergent evolution paths: this snapshot selects Silver Falcon for support and keeps the other path in the same identity record.",
  ],
  [
    "How does the Anime Expeditions trait tier list define the best traits?",
    "The best Anime Expeditions traits depend on role fit rather than rarity alone. Unbound trades multiple placements for one amplified unit, while Draconic rewards damaging DoT. These editorial grades assume the build named in Unit Detail.",
  ],
  [
    "How does the Anime Expeditions equipment tier list work?",
    "The Anime Expeditions equipment tier list compares Standard items by rolled values, kit interactions and role fit. Evolved unit-exclusive equipment uses a separate slot and is recommended per unit, never ranked against interchangeable Standard items.",
  ],
  [
    "Which Anime Expeditions best units are highlighted?",
    "The strongest reviewed units appear in the Unit Tier List and Quick Picks for the selected role view. New or under-evidenced units stay Pending / Needs Review; missing evidence never becomes a fabricated score.",
  ],
  [
    "How often is the Anime Expeditions tier list updated?",
    "The Anime Expeditions tier list is updated after current patch facts and ranking evidence are checked. The snapshot date is the newest ranking-source revision actually reconciled, while the review date records when those sources were last rechecked; neither is a claim of direct live testing. Update 5 · Hallows Eve is the current reviewed baseline; unresolved obtainment stays labeled Needs Review rather than being inferred.",
  ],
] as const;

export function AnimeExpeditionsTierList() {
  const standard = equipment.filter((item) => item.kind === "Standard");
  const built = units.filter((unit) => unit.build.standardIds.length && !unit.hidden);
  const renderEquipmentOptions = (
    ids: readonly string[],
    options: { priority?: boolean; emptyLabel: string },
  ) => {
    const items = ids.flatMap((id) => {
      const item = equipment.find((candidate) => candidate.id === id);
      return item ? [item] : [];
    });
    if (!items.length) return <span className={styles.equipmentEmpty}>{options.emptyLabel}</span>;
    return (
      <div className={styles.equipmentOptions}>
        {items.map((item) => {
          const art = item.asset ? artworkForOptional(`gear-${item.asset}`) : null;
          return (
            <span
              className={`${styles.equipmentOption} ${
                options.priority ? styles.equipmentOptionPrimary : ""
              }`}
              key={item.id}
            >
              {art ? (
                <Image
                  src={art}
                  alt=""
                  width={36}
                  height={36}
                  sizes="36px"
                  loading="lazy"
                  className={styles.equipmentIcon}
                />
              ) : null}
              <span>{item.name}</span>
            </span>
          );
        })}
      </div>
    );
  };
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="ae-title">
        <Image
          src={artworkFor("hero")}
          alt=""
          priority
          sizes="(max-width: 800px) 100vw, 65vw"
          className={styles.heroArt}
        />
        <div className={styles.rift} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>ANIME EXPEDITIONS · UPDATE 5 SOURCE-REVIEWED</p>
          <h1 id="ae-title">Anime Expeditions Tier List</h1>
          <p>
            Use the current Anime Expeditions tier list to compare the Anime Expeditions best units
            by role, then plan role-fit Traits, equipment, team comps and evolutions.
          </p>
          <dl className={styles.heroFacts}>
            <div>
              <dt>Version</dt>
              <dd>{snapshot.version.label}</dd>
            </div>
            <div>
              <dt>Snapshot date</dt>
              <dd>{snapshot.date}</dd>
            </div>
            <div>
              <dt>Source review</dt>
              <dd>{snapshot.reviewedAt}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>
                {units.length} canonical units · {snapshot.sourceFormCount} source forms
              </dd>
            </div>
            <div>
              <dt>Review</dt>
              <dd>
                {units.filter((u) => !Object.values(u.viewTiers).includes("Pending")).length}{" "}
                five-view graded units · {evidenceCoverage.overallReconciled} Overall placements
                reconciled · {units.filter((u) => u.availability === "Needs Review").length}{" "}
                obtainment records remain Needs Review
              </dd>
            </div>
          </dl>
          <p className={styles.notice}>
            <strong>Update 5 baseline reviewed.</strong> Unit grades are TierListBase editorial
            synthesis, not publisher placements. {authorityClaim.short}{" "}
            {units.filter((u) => u.availability === "Needs Review").length} obtainment routes remain
            explicitly Needs Review. <a href="#sources">Evidence limits ↓</a>
          </p>
        </div>
      </section>
      <div className={styles.shell}>
        <UnitWorkspace
          units={units}
          traits={traits.filter((t) => units.some((u) => u.build.traitIds.includes(t.id)))}
          equipment={equipment.filter((e) =>
            units.some((u) => [...u.build.standardIds, ...u.build.exclusiveIds].includes(e.id)),
          )}
          modes={modeContexts}
        />
        <section id="traits" className={styles.section} aria-labelledby="traits-title">
          <div className={styles.sectionHeading}>
            <h2 id="traits-title">Anime Expeditions Trait Tier List</h2>
            <p>
              The Anime Expeditions trait tier list compares traits by role fit before rarity, using
              source-reviewed mechanics and editorial grades.
            </p>
          </div>
          <p className={styles.context}>
            Effects, roll odds and pity are source documented. The Anime Expeditions tier list keeps
            trait rankings focused on role fit over rarity; the older Draconic discrepancy follows a
            documented Update 3 buff. TierListBase does not claim direct live testing of every trait
            interaction.
          </p>
          <div data-trait-board>
            {["S", "A", "B", "C", "Pending"].map((tier) => {
              const rows = traits.filter((t) => t.tier === tier);
              return rows.length ? (
                <div className={styles.itemTier} key={tier}>
                  <h3 className={styles.tierLabel} data-tier={tier}>
                    {tier}
                  </h3>
                  <div className={`${styles.itemGrid} ${styles.traitGrid}`}>
                    {rows.map((trait) => (
                      <article key={trait.id} className={styles.itemCard}>
                        <Image
                          src={artworkFor(`trait-${trait.id}`)}
                          alt=""
                          width={56}
                          height={56}
                          sizes="56px"
                          loading="lazy"
                        />
                        <div>
                          <h4>{trait.name}</h4>
                          <p>{trait.effect}</p>
                          <p className={styles.muted}>
                            {trait.odds} roll ·{" "}
                            {trait.pity
                              ? `${trait.pity.toLocaleString("en-US")} pity`
                              : "No pity listed"}
                          </p>
                          <span className={styles.tag}>{trait.bestFor}</span>
                          <details>
                            <summary>Role fit & restrictions</summary>
                            <p>{trait.why}</p>
                            <p>{trait.restriction}</p>
                            <p>
                              Recommended units:{" "}
                              {units
                                .filter((u) => u.build.traitIds.includes(trait.id))
                                .map((u) => u.currentForm)
                                .join(", ") || "No reviewed unit recommendation yet"}
                            </p>
                          </details>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </section>
        <section id="equipment" className={styles.section} aria-labelledby="equipment-title">
          <div className={styles.sectionHeading}>
            <h2 id="equipment-title">Anime Expeditions Standard Equipment Tier List</h2>
            <p>
              The Anime Expeditions equipment tier list covers Standard Equipment only, comparing
              rolled values and kit interactions while keeping unit-exclusive gear separate.
            </p>
          </div>
          <div data-standard-board>
            {["S", "A", "B", "C", "Pending"].map((tier) => {
              const rows = standard.filter((e) => e.tier === tier);
              return rows.length ? (
                <div className={styles.itemTier} key={tier}>
                  <h3 className={styles.tierLabel} data-tier={tier}>
                    {tier}
                  </h3>
                  <div className={styles.itemGrid}>
                    {rows.map((item) => (
                      <article className={styles.itemCard} key={item.id}>
                        <Image
                          src={artworkFor(`gear-${item.asset}`)}
                          alt=""
                          width={56}
                          height={56}
                          sizes="56px"
                          loading="lazy"
                        />
                        <div>
                          <h4>{item.name}</h4>
                          <p>{item.effect}</p>
                          <span className={styles.tag}>{item.bestFor}</span>
                          <details>
                            <summary>Passive & use</summary>
                            <p>{item.passive}</p>
                            <p>
                              {item.rollablePassive ? "Passive values are rolled. " : ""}Documented
                              acquisition:{" "}
                              {item.documentedAcquisition.join(" / ") || "Not documented"}. Exact
                              current obtainment is not inferred when the source leaves it blank.
                            </p>
                            <p>
                              {item.status}. TierListBase weighs role compatibility and passive
                              conditions; this is not a raw-rarity ranking.
                            </p>
                          </details>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null;
            })}
          </div>
          <h3 className={styles.subheading}>Best Equipment by Unit</h3>
          <p className={styles.context}>
            The Anime Expeditions equipment tier list also needs unit-level context because the best
            equipment depends on each kit and slot type. Standard, alternative and documented
            exclusive options are reviewed separately. The rankings above cover interchangeable
            Standard items; exclusive equipment remains unit-bound and outside the Standard
            Equipment Tier Board.
          </p>
          <div
            className={styles.equipmentRecommendations}
            role="region"
            aria-label="Best Equipment by Unit"
            data-equipment-recommendations
          >
            <div className={styles.equipmentRecommendationsHeader} aria-hidden="true">
              <span>Unit</span>
              <span>Best Standard</span>
              <span>Alternative</span>
              <span>Exclusive</span>
            </div>
            <div className={styles.equipmentRecommendationList}>
              {built.map((unit) => {
                const portrait = unit.asset ? artworkForOptional(`unit-${unit.asset}`) : null;
                return (
                  <article className={styles.equipmentRecommendationRow} key={unit.id}>
                    <div className={styles.equipmentUnit}>
                      {portrait ? (
                        <Image
                          src={portrait}
                          alt=""
                          width={48}
                          height={46}
                          sizes="48px"
                          loading="lazy"
                          className={styles.equipmentUnitPortrait}
                        />
                      ) : (
                        <div
                          className={styles.equipmentUnitPlaceholder}
                          role="img"
                          aria-label={`${unit.currentForm} artwork pending provenance review`}
                        >
                          {unit.currentForm.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <span className={styles.equipmentCellLabel}>Unit</span>
                        <strong>{unit.currentForm}</strong>
                      </div>
                    </div>
                    <div className={`${styles.equipmentCell} ${styles.equipmentBest}`}>
                      <span className={styles.equipmentCellLabel}>Best Standard</span>
                      {renderEquipmentOptions(unit.build.standardIds.slice(0, 1), {
                        priority: true,
                        emptyLabel: "No documented recommendation",
                      })}
                    </div>
                    <div className={styles.equipmentCell}>
                      <span className={styles.equipmentCellLabel}>Alternative</span>
                      {renderEquipmentOptions(unit.build.standardIds.slice(1), {
                        emptyLabel: "No alternative documented",
                      })}
                    </div>
                    <div className={styles.equipmentCell}>
                      <span className={styles.equipmentCellLabel}>Exclusive</span>
                      {renderEquipmentOptions(unit.build.exclusiveIds, {
                        emptyLabel: "No documented exclusive",
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section id="teams" className={styles.section} aria-labelledby="teams-title">
          <div className={styles.sectionHeading}>
            <h2 id="teams-title">Best Anime Expeditions Team Comps</h2>
            <p>
              Composition decisions alongside the Anime Expeditions tier list, never a Team Tier
              List
            </p>
          </div>
          <p className={styles.context}>
            These best Anime Expeditions team comps use five six-unit cores grounded in the current
            Update 5 source and complement the Anime Expeditions tier list. Roles keep each
            slot&apos;s job explicit, while exact traits, equipment rolls and replacements remain
            account- and stage-dependent. They are a reviewed baseline, not a promise that one
            lineup fits every stage.
          </p>
          <div className={styles.teams}>
            {teams.map((team) => (
              <article className={styles.teamCard} key={team.id}>
                <h3>{team.name}</h3>
                <p className={styles.tag}>{team.status}</p>
                <div className={styles.lineup}>
                  {team.members.map((member) => {
                    const unit = units.find((u) => u.id === member.unitId)!;
                    return (
                      <figure key={`${member.unitId}-${member.role}`}>
                        {unit.asset && artworkForOptional(`unit-${unit.asset}`) ? (
                          <Image
                            src={artworkForOptional(`unit-${unit.asset}`)!}
                            alt={unit.currentForm}
                            width={64}
                            height={61}
                            sizes="64px"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className={styles.portraitPlaceholder}
                            role="img"
                            aria-label={`${unit.currentForm} artwork pending provenance review`}
                          >
                            <span>{unit.currentForm.slice(0, 1)}</span>
                          </div>
                        )}
                        <figcaption>
                          <strong>{member.role}</strong>
                          <span>{unit.currentForm}</span>
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
                <dl>
                  <div>
                    <dt>Investment</dt>
                    <dd>{team.investment}</dd>
                  </div>
                  <div>
                    <dt>Best For</dt>
                    <dd>{team.bestFor}</dd>
                  </div>
                  <div>
                    <dt>Weakness</dt>
                    <dd>{team.weakness}</dd>
                  </div>
                  <div>
                    <dt>Replacements</dt>
                    <dd>{team.replacements}</dd>
                  </div>
                  <div>
                    <dt>Dependencies</dt>
                    <dd>{team.dependency}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
        <section id="evolution" className={styles.section} aria-labelledby="evolution-title">
          <div className={styles.sectionHeading}>
            <h2 id="evolution-title">Evolution Priority</h2>
            <p>Spend for a mechanic unlock, not a copy of the Overall ranking</p>
          </div>
          <p className={styles.context}>
            Use this Anime Expeditions evolution priority alongside the Anime Expeditions tier list
            to see which units are worth evolving across{" "}
            {evolutions.filter((evo) => evo.priority !== null).length} source-backed recipes and
            editorial investment priorities. Priorities reflect mechanic unlocks rather than the
            Overall grade, so this section complements the main rankings instead of duplicating
            them. {evolutions.filter((evo) => evo.priority === null).length} documented recipes
            remain unranked rather than receiving an inferred priority.
          </p>
          <div className={styles.evolutionGrid}>
            {["High Priority", "Worth Evolving", "Situational"].map((priority) => (
              <section key={priority} className={styles.evolutionGroup}>
                <h3>{priority}</h3>
                {evolutions
                  .filter((e) => e.priority === priority)
                  .map((evo) => {
                    const unit = units.find((u) => u.id === evo.unitId)!;
                    return (
                      <details key={`${evo.from}-${evo.to}`} className={styles.evolution}>
                        <summary>
                          {(() => {
                            const asset =
                              evo.to === "5th God Hand"
                                ? artworkForOptional("unit-5th-god-hand")
                                : unit.asset
                                  ? artworkForOptional(`unit-${unit.asset}`)
                                  : null;
                            return asset ? (
                              <Image
                                src={asset}
                                alt=""
                                width={48}
                                height={46}
                                sizes="48px"
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className={styles.portraitPlaceholder}
                                role="img"
                                aria-label={`${evo.to} artwork pending provenance review`}
                              >
                                <span>{evo.to.slice(0, 1)}</span>
                              </div>
                            );
                          })()}
                          <span>
                            {evo.from}
                            <small>→ {evo.to}</small>
                          </span>
                        </summary>
                        <p>{evo.reason}</p>
                        <p>
                          <strong>Major unlock:</strong> {evo.unlock}
                        </p>
                        <p>
                          <strong>Materials / cost:</strong>{" "}
                          {evo.materials.map((m) => `${m.count} ${m.name}`).join(" · ")}
                        </p>
                        <p className={styles.muted}>
                          {evo.status} · verify current in-game costs before spending.
                        </p>
                      </details>
                    );
                  })}
              </section>
            ))}
          </div>
        </section>
        <section id="changes" className={styles.section} aria-labelledby="changes-title">
          <h2 id="changes-title">What Changed</h2>
          <p>
            Update 5 · Hallows Eve remains the source-reviewed baseline for the current Anime
            Expeditions tier list. The November 8 ranking-source revision was re-read on November 10
            and moved no published tier.
          </p>
          <div className={styles.changeGrid}>
            {[
              "New Units",
              "Unit Tier Changes",
              "Trait Changes",
              "Equipment Changes",
              "Meta Notes",
            ].map((label) => (
              <div key={label}>
                <h3>{label}</h3>
                <p>
                  {label === "New Units"
                    ? "The Anime Expeditions unit tier list now integrates the missing Update 4 canonical additions and all five Update 5 Hallows Eve units into the current snapshot."
                    : label === "Unit Tier Changes"
                      ? "The Anime Expeditions unit tier list uses the current Update 5 S–D placements as the new baseline; unsupported patch-to-patch movement is not invented."
                      : label === "Equipment Changes"
                        ? "The Anime Expeditions equipment tier list adds five Update 5 unit-bound equipment records from current source pages; exact obtainment is shown only when documented."
                        : label === "Trait Changes"
                          ? "The Anime Expeditions trait tier list keeps the Draconic historical discrepancy resolved against the dated Update 3 buff; no unsupported new trait delta is claimed."
                          : "The Anime Expeditions tier list reconciled every published unit grade against the November 8 ranking-source revision; no tier moved, so the November 5 snapshot was refreshed rather than re-ranked."}
                </p>
              </div>
            ))}
          </div>
        </section>
        <div className={styles.editorialGrid}>
          <section id="sources" className={styles.section} aria-labelledby="sources-title">
            <h2 id="sources-title">Sources & Evidence</h2>
            <p>
              This source review covers the current Anime Expeditions tier list and meta as of{" "}
              {snapshot.date}. {snapshot.version.label}. Publisher facts and community observations
              are separate from TierListBase grades.
            </p>
            <ul className={styles.sources}>
              {sources.map((source) => (
                <li key={source.id}>
                  <a href={source.url} rel="noreferrer" target="_blank">
                    {source.name} ↗
                  </a>
                  <p>{source.note}</p>
                </li>
              ))}
            </ul>
            <details>
              <summary>Anime Expeditions tier list uncertainty &amp; coverage</summary>
              <p>
                {reviewMetadata.ledger.total} displayed Unit, Trait, Equipment and evolution records
                are source-reviewed. Passing source review means the underlying facts were checked;
                it does not mean the record is a publisher placement. Only the Overall view is
                reconcilable against a published tier list: {evidenceCoverage.overallReconciled} of{" "}
                {evidenceCoverage.totalUnits} units were reconciled on the{" "}
                {tierEvidence.source.revisionDate} revision, with {evidenceCoverage.disagreeing}{" "}
                disagreements. The DPS, Utility, Support and Crowd Control sub-grades are
                TierListBase editorial for all {evidenceCoverage.roleViewsEditorial} units, because
                no source publishes graded role placements. Direct personal live testing is not
                claimed. Unresolved current-obtainment claims remain Needs Review instead of being
                inferred.
              </p>
              <ul>
                {snapshot.uncertainties.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <p>
                Current inventory: {snapshot.sourceFormCount} canonical source forms,{" "}
                {traits.length} Traits, {standard.length} Standard Equipment,{" "}
                {equipment.length - standard.length} exclusive items and {evolutions.length}{" "}
                evolution edges. Update 5 comparative rankings use the November 8 source revision;
                direct personal live testing is not implied.
              </p>
              <p>
                Wiki-derived facts and media credit Anime Expeditions community wiki contributors
                under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>{" "}
                where applicable; game artwork remains attributable to its respective owners. Local
                media are resized WebP derivatives; file-level origins are kept beside the assets.
              </p>
            </details>
          </section>
          <section id="methodology" className={styles.section} aria-labelledby="method-title">
            <h2 id="method-title">Ranking Methodology</h2>
            <p>
              Update 5 · Hallows Eve is the current source-reviewed baseline for the Anime
              Expeditions tier list. TierListBase grades are editorial synthesis.{" "}
              {authorityClaim.detailed} They are not publisher rankings or a claim of direct live
              testing of every interaction.
            </p>
            <dl className={styles.methodology}>
              <div>
                <dt>Trait & equipment assumptions</dt>
                <dd>
                  The Anime Expeditions equipment tier list uses the role-fit build in Unit Detail,
                  two rolled Standard items and an evolved exclusive where documented. An Unbound
                  single-placement build must earn its lost placement value.
                </dd>
              </div>
              <div>
                <dt>Role contribution</dt>
                <dd>
                  The Anime Expeditions unit tier list separates role contribution before comparing
                  grades. DPS values damage delivery; Utility values mechanics beyond damage;
                  Support values allied output; Crowd Control values reliable stall. Pending means
                  evidence is missing, not that contribution is zero.
                </dd>
              </div>
              <div>
                <dt>Economy & team dependency</dt>
                <dd>
                  The Anime Expeditions best units still depend on payback time, placement
                  restrictions, ramp and partner requirements. Economy units can improve a team
                  without gaining another ranking view.
                </dd>
              </div>
              <div>
                <dt>Mode context</dt>
                <dd>
                  The Anime Expeditions tier list checks enemy immunities, wave budget and stage
                  restrictions by mode. Mode selection supplies context and never silently rewrites
                  canonical grades.
                </dd>
              </div>
              <div>
                <dt>Current Meta Modifier</dt>
                <dd>
                  No verified current weekly modifier is included in the current Anime Expeditions
                  tier list meta. Temporary elemental, weather or Expedition bonuses are contextual
                  and excluded from permanent canonical tiers.
                </dd>
              </div>
              <div>
                <dt>Evidence freshness</dt>
                <dd>
                  Version conflicts, stale mirrors and untested new forms block Anime Expeditions
                  tier list release review. New entries stay Pending until adequate evidence is
                  available.
                </dd>
              </div>
            </dl>
          </section>
          <section id="faq" className={styles.section} aria-labelledby="faq-title">
            <h2 id="faq-title">FAQ</h2>
            {faq.map(([question, answer]) => (
              <details className={styles.faq} key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
