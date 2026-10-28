import Image from "next/image";
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
import { artworkFor } from "./artwork";
import styles from "./anime-expeditions-tier-list.module.css";

const faq = [
  [
    "Why do rankings vary by mode?",
    "Wave count, boss immunities, placement rules and upgrade budgets change the value of the same kit. Mode Context keeps those tradeoffs visible without creating extra tier lists.",
  ],
  [
    "Are evolved forms ranked separately?",
    "Base and evolved forms belong to one canonical unit. The board shows the selected ranked form. Broken Falcon has divergent evolution paths: this snapshot selects Silver Falcon for support and keeps the other path in the same identity record.",
  ],
  [
    "Do Traits change a Unit's tier?",
    "They can change practical performance. Unbound trades multiple placements for one amplified unit; Draconic rewards damaging DoT. A trait suited to one role is not automatically best for another. These editorial grades assume the build named in the detail.",
  ],
  [
    "How does Equipment affect rankings?",
    "Compare actual rolled values and kit interactions. Standard items occupy two shared slots. Evolved unit-exclusive equipment has a separate slot and is recommended per unit, never ranked against interchangeable Standard items.",
  ],
  [
    "How are new Units handled before enough live testing exists?",
    "They stay Pending / Needs Review. An unranked unit is not C tier, and missing evidence never becomes a fabricated score.",
  ],
  [
    "How often is this Tier List updated?",
    "After patch facts and ranking evidence are checked. The snapshot date records this research pass, not a promise of live testing. This preview remains noindex until version, roster, rankings and assets finish release review.",
  ],
] as const;

export function AnimeExpeditionsTierList() {
  const standard = equipment.filter((item) => item.kind === "Standard");
  const built = units.filter((unit) => unit.build.standardIds.length && !unit.hidden);
  const namedEquipment = (ids: readonly string[]) =>
    ids.map((id) => equipment.find((item) => item.id === id)!.name).join(" / ") || "Not documented";
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
          <p className={styles.eyebrow}>ANIME EXPEDITIONS · RANKING RESEARCH PREVIEW</p>
          <h1 id="ae-title">Anime Expeditions Tier List</h1>
          <p>Choose units, roll role-fit Traits, and plan equipment, teams and evolutions.</p>
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
              <dt>Scope</dt>
              <dd>
                {units.filter((u) => !u.hidden).length} canonical units · {snapshot.sourceFormCount}{" "}
                source forms
              </dd>
            </div>
            <div>
              <dt>Review</dt>
              <dd>
                {units.filter((u) => u.reviewStatus === "Provisional").length} provisional
                assessments · live review pending
              </dd>
            </div>
          </dl>
        </div>
      </section>
      <div className={styles.shell}>
        <p className={styles.notice}>
          <strong>Needs Review.</strong> Official current version is unconfirmed. Unit data
          documents 3.5 while newer equipment includes Update 4. Rankings are provisional editorial
          assessments; this page is excluded from search indexing.{" "}
          <a href="#sources">See evidence limits ↓</a>
        </p>
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
            <p>One ranking · role fit before rarity · provisional editorial grades</p>
          </div>
          <p className={styles.context}>
            Effects, roll odds and pity are community documented. Draconic conflicts with older
            sources; verify the current server before spending crystals.
          </p>
          <div data-trait-board>
            {["S", "A", "B", "C", "Pending"].map((tier) => {
              const rows = traits.filter((t) => t.tier === tier);
              return rows.length ? (
                <div className={styles.itemTier} key={tier}>
                  <h3 className={styles.tierLabel} data-tier={tier}>
                    {tier}
                  </h3>
                  <div className={styles.itemGrid}>
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
            <h2 id="equipment-title">Anime Expeditions Equipment Tier List</h2>
            <p>Standard Equipment only · compare rolled values and kit interactions</p>
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
            Editorial build starting points. Exclusive equipment is unit-bound and has no Standard
            tier.
          </p>
          <div
            className={styles.tableScroll}
            tabIndex={0}
            role="region"
            aria-label="Best Equipment by Unit"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Unit</th>
                  <th scope="col">Best Standard Equipment</th>
                  <th scope="col">Alternative Standard Equipment</th>
                  <th scope="col">Exclusive Equipment</th>
                  <th scope="col">Notes / Alternative</th>
                </tr>
              </thead>
              <tbody>
                {built.map((unit) => (
                  <tr key={unit.id}>
                    <th scope="row">{unit.currentForm}</th>
                    <td>{namedEquipment(unit.build.standardIds.slice(0, 1))}</td>
                    <td>{namedEquipment(unit.build.standardIds.slice(1))}</td>
                    <td>{namedEquipment(unit.build.exclusiveIds)}</td>
                    <td>
                      {unit.archetype} · {unit.role}. {unit.reviewStatus}; compare actual rolls.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section id="teams" className={styles.section} aria-labelledby="teams-title">
          <div className={styles.sectionHeading}>
            <h2 id="teams-title">Best Anime Expeditions Team Comps</h2>
            <p>Composition decisions, never a Team Tier List</p>
          </div>
          <p className={styles.context}>
            Candidate role cores, not verified complete loadouts. Current team capacity is
            unconfirmed; Carry / Support / Crowd Control / Economy / Flex are planning slots, not a
            claim about the number of equip slots.
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
                      <figure key={member.role}>
                        <Image
                          src={artworkFor(`unit-${unit.asset}`)}
                          alt={unit.currentForm}
                          width={64}
                          height={61}
                          sizes="64px"
                          loading="lazy"
                        />
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
            {evolutions.filter((evo) => evo.priority !== null).length} provisional investment
            assessments. {evolutions.filter((evo) => evo.priority === null).length} source recipes
            await assessment and are withheld from these priority groups.
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
                          <Image
                            src={artworkFor(
                              evo.to === "5th God Hand"
                                ? "unit-5th-god-hand"
                                : `unit-${unit.asset}`,
                            )}
                            alt=""
                            width={48}
                            height={46}
                            sizes="48px"
                            loading="lazy"
                          />
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
                          {evo.status} · recipe source revision 9555; verify live costs before
                          spending.
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
          <p>No verified prior comparison available</p>
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
                  {label === "Equipment Changes"
                    ? "Newer source includes Update 4 records. Live availability is Pending."
                    : label === "Trait Changes"
                      ? "Draconic source conflict retained for review."
                      : "No verified prior comparison available"}
                </p>
              </div>
            ))}
          </div>
        </section>
        <div className={styles.editorialGrid}>
          <section id="sources" className={styles.section} aria-labelledby="sources-title">
            <h2 id="sources-title">Sources & Evidence</h2>
            <p>
              Research snapshot: {snapshot.date}. {snapshot.version.label}. Publisher facts and
              community observations are separate from TierListBase grades.
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
              <summary>Known uncertainty & coverage</summary>
              <ul>
                {snapshot.uncertainties.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <p>
                Source inventory: {snapshot.sourceFormCount} forms, {traits.length} Traits,{" "}
                {standard.length} Standard Equipment, {equipment.length - standard.length} exclusive
                items and {evolutions.length} evolution edges. These are source records, not a claim
                of current complete live coverage.
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
              Current patch confirmation is pending. These provisional editorial grades evaluate the
              documented selected form, not the base form at equal cost.
            </p>
            <dl className={styles.methodology}>
              <div>
                <dt>Trait & equipment assumptions</dt>
                <dd>
                  Use the role-fit build in Unit Detail, two rolled Standard items and an evolved
                  exclusive where documented. An Unbound single-placement build must earn its lost
                  placement value.
                </dd>
              </div>
              <div>
                <dt>Role contribution</dt>
                <dd>
                  DPS values damage delivery; Utility values mechanics beyond damage; Support values
                  allied output; Crowd Control values reliable stall. Pending means evidence is
                  missing, not that contribution is zero.
                </dd>
              </div>
              <div>
                <dt>Economy & team dependency</dt>
                <dd>
                  Payback time, placement restrictions, ramp and partner requirements matter.
                  Economy units can improve a team without gaining another ranking view.
                </dd>
              </div>
              <div>
                <dt>Mode context</dt>
                <dd>
                  Check enemy immunities, wave budget and stage restrictions. Mode selection
                  supplies context and never silently rewrites canonical grades.
                </dd>
              </div>
              <div>
                <dt>Current Meta Modifier</dt>
                <dd>
                  No verified current weekly modifier. Temporary elemental, weather or Expedition
                  bonuses are contextual and are excluded from permanent canonical tiers.
                </dd>
              </div>
              <div>
                <dt>Evidence freshness</dt>
                <dd>
                  Version conflicts, stale mirrors and untested new forms block current-patch
                  release review. New entries stay Pending until adequate evidence is available.
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
