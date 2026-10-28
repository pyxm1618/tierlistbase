"use client";

import { useMemo, useState } from "react";

import { dragonTravelerAccountDecisions } from "./account-decisions";
import { dragonTravelerChanges } from "./changes";
import { globalSnapshot } from "./global-snapshot";
import { dragonTravelerSources } from "./sources";
import { taiwanSnapshot } from "./taiwan-snapshot";
import { dragonTravelerTeams } from "./teams";
import {
  classKeys,
  tierKeys,
  type AnyServerSnapshot,
  type RankingView,
  type ServerKey,
} from "./types";

import styles from "./dragon-traveler-tier-list.module.css";

const rankingLabels: Record<RankingView, string> = {
  overall: "Overall",
  pve: "PvE",
  pvp: "PvP",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function factionLabel(snapshot: AnyServerSnapshot, faction: string) {
  return snapshot.factionLabels[faction] ?? faction;
}

export function DragonTravelerTierList() {
  const [server, setServer] = useState<ServerKey>("global");
  const [rankingView, setRankingView] = useState<RankingView>("overall");
  const [classFilter, setClassFilter] = useState("All");
  const [factionFilter, setFactionFilter] = useState("All");
  const [rarityFilter, setRarityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("artemis");
  const [teamMode, setTeamMode] = useState<"pve" | "pvp">("pve");

  const snapshot: AnyServerSnapshot = server === "global" ? globalSnapshot : taiwanSnapshot;

  const filteredLuminaries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return snapshot.luminaries.filter((luminary) => {
      if (classFilter !== "All" && luminary.classKey !== classFilter) return false;
      if (factionFilter !== "All" && !luminary.factions.includes(factionFilter)) return false;
      if (rarityFilter !== "All" && luminary.rarity !== rarityFilter) return false;
      return query === "" || luminary.name.toLowerCase().includes(query);
    });
  }, [classFilter, factionFilter, rarityFilter, search, snapshot]);

  const selectedLuminary =
    snapshot.luminaries.find((luminary) => luminary.id === selectedId) ?? snapshot.luminaries[0];

  const quickPicks = snapshot.quickPicks
    .map((pick) => ({
      ...pick,
      luminary: snapshot.luminaries.find((luminary) => luminary.id === pick.luminaryId),
    }))
    .filter((pick) => pick.luminary);

  const teams = dragonTravelerTeams.filter(
    (team) => team.server === server && team.mode === teamMode,
  );
  const decisions = dragonTravelerAccountDecisions.filter((decision) => decision.server === server);
  const changes = dragonTravelerChanges.filter((change) => change.server === server);
  const sources = dragonTravelerSources.filter(
    (source) => source.server === "both" || source.server === server,
  );

  function activateServer(nextServer: ServerKey) {
    setServer(nextServer);
    setClassFilter("All");
    setFactionFilter("All");
    setRarityFilter("All");
    setSearch("");
    setSelectedId("artemis");
  }

  return (
    <main className={styles.page} data-dragon-traveler-page>
      <section className={styles.hero} aria-labelledby="dragon-traveler-title">
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>DRAGON TRAVELER · LIVE SNAPSHOT</span>
            <h1 id="dragon-traveler-title">Dragon Traveler Tier List</h1>
            <p>
              Rank Luminaries by Overall, PvE, and PvP value, then switch server context before
              making team, wishlist, or pull decisions.
            </p>
            <div className={styles.heroMeta}>
              <span>Snapshot {snapshot.snapshotDate}</span>
              <span>{snapshot.luminaries.length} ranked records</span>
              <span>Evidence-linked methodology</span>
            </div>
          </div>

          <div className={styles.serverContext} aria-label="Server Context">
            <span>Server Context</span>
            <div role="tablist" aria-label="Dragon Traveler server">
              <button
                type="button"
                role="tab"
                aria-selected={server === "global"}
                data-active={server === "global"}
                onClick={() => activateServer("global")}
              >
                Global
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={server === "taiwan"}
                data-active={server === "taiwan"}
                onClick={() => activateServer("taiwan")}
              >
                Taiwan
              </button>
            </div>
            <p>{snapshot.coverageNote}</p>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.section} aria-labelledby="quick-picks-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>DECISION SHORTCUTS</span>
              <h2 id="quick-picks-title">Quick Picks</h2>
            </div>
            <p>Fast answers for the current {snapshot.label} snapshot.</p>
          </div>
          <div className={styles.quickGrid}>
            {quickPicks.map((pick) => (
              <button
                type="button"
                key={pick.label}
                className={styles.quickCard}
                onClick={() => pick.luminary && setSelectedId(pick.luminary.id)}
              >
                <span>{pick.label}</span>
                <strong>{pick.luminary?.name}</strong>
                <small>{pick.rationale}</small>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="luminary-tier-list-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>{snapshot.label.toUpperCase()} RANKINGS</span>
              <h2 id="luminary-tier-list-title">Luminary Tier List</h2>
            </div>
            <p>
              Overall is the default decision view. PvE and PvP expose mode-specific placements
              without creating additional leaderboard products.
            </p>
          </div>

          <div className={styles.rankingTabs} role="tablist" aria-label="Luminary ranking views">
            {(["overall", "pve", "pvp"] as const).map((view) => (
              <button
                key={view}
                type="button"
                role="tab"
                aria-selected={rankingView === view}
                data-active={rankingView === view}
                onClick={() => setRankingView(view)}
              >
                {rankingLabels[view]}
              </button>
            ))}
          </div>

          <div className={styles.filters}>
            <label>
              <span>Class</span>
              <select
                aria-label="Class"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
              >
                <option>All</option>
                {classKeys.map((classKey) => (
                  <option key={classKey}>{classKey}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Faction</span>
              <select
                aria-label="Faction"
                value={factionFilter}
                onChange={(event) => setFactionFilter(event.target.value)}
              >
                <option>All</option>
                {snapshot.factionKeys.map((faction) => (
                  <option key={faction} value={faction}>
                    {factionLabel(snapshot, faction)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Rarity</span>
              <select
                aria-label="Rarity"
                value={rarityFilter}
                onChange={(event) => setRarityFilter(event.target.value)}
              >
                <option>All</option>
                {snapshot.rarityKeys.map((rarity) => (
                  <option key={rarity}>{rarity}</option>
                ))}
              </select>
            </label>
            <label className={styles.searchField}>
              <span>Search</span>
              <input
                type="search"
                aria-label="Search Luminaries"
                value={search}
                placeholder="Search Luminaries..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => {
                setClassFilter("All");
                setFactionFilter("All");
                setRarityFilter("All");
                setSearch("");
              }}
            >
              Reset
            </button>
          </div>

          <div className={styles.workspace}>
            <div className={styles.tierBoard} aria-label="Luminary Ranking">
              {tierKeys.map((tier) => {
                const members = filteredLuminaries.filter(
                  (luminary) => luminary.tiers[rankingView] === tier,
                );
                return (
                  <div className={styles.tierRow} data-tier={tier} key={tier}>
                    <div className={styles.tierLabel}>
                      <strong>{tier}</strong>
                      <small>{rankingLabels[rankingView]}</small>
                    </div>
                    <div className={styles.tierMembers}>
                      {members.map((luminary) => (
                        <button
                          type="button"
                          key={luminary.id}
                          className={styles.luminaryCard}
                          data-selected={selectedLuminary?.id === luminary.id}
                          onClick={() => setSelectedId(luminary.id)}
                          aria-label={luminary.name + ", " + tier + " tier"}
                        >
                          <span className={styles.portrait} aria-hidden="true">
                            {initials(luminary.name)}
                          </span>
                          <span className={styles.cardCopy}>
                            <strong>{luminary.name}</strong>
                            <small>{luminary.classKey}</small>
                          </span>
                          <span className={styles.rarityBadge}>{luminary.rarity}</span>
                        </button>
                      ))}
                      {members.length === 0 ? (
                        <span className={styles.emptyTier}>No matching Luminaries</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className={styles.detailPanel} aria-label="Character Detail">
              {selectedLuminary ? (
                <>
                  <div className={styles.detailHeader}>
                    <span className={styles.detailPortrait} aria-hidden="true">
                      {initials(selectedLuminary.name)}
                    </span>
                    <div>
                      <span className={styles.kicker}>CHARACTER DETAIL</span>
                      <h3>Character Detail</h3>
                      <strong>{selectedLuminary.name}</strong>
                    </div>
                  </div>
                  <div className={styles.detailRanks}>
                    {(["overall", "pve", "pvp"] as const).map((view) => (
                      <div key={view}>
                        <span>{rankingLabels[view]}</span>
                        <strong>{selectedLuminary.tiers[view]}</strong>
                      </div>
                    ))}
                  </div>
                  <dl className={styles.detailMeta}>
                    <div>
                      <dt>Class</dt>
                      <dd>{selectedLuminary.classKey}</dd>
                    </div>
                    <div>
                      <dt>Rarity</dt>
                      <dd>{selectedLuminary.rarity}</dd>
                    </div>
                    <div>
                      <dt>Faction</dt>
                      <dd>
                        {selectedLuminary.factions
                          .map((faction) => factionLabel(snapshot, faction))
                          .join(" · ")}
                      </dd>
                    </div>
                  </dl>
                  <p>{selectedLuminary.note}</p>
                  <small className={styles.detailFootnote}>
                    Rankings are snapshot decisions, not permanent character power scores.
                  </small>
                </>
              ) : null}
            </aside>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="best-teams-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>FORMATION CONTEXT</span>
              <h2 id="best-teams-title">Best Teams</h2>
            </div>
            <p>
              Team recommendations stay separate from the character ranking and follow server
              context.
            </p>
          </div>
          <div className={styles.rankingTabs} role="tablist" aria-label="Best Teams modes">
            {(["pve", "pvp"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={teamMode === mode}
                data-active={teamMode === mode}
                onClick={() => setTeamMode(mode)}
              >
                {mode === "pve" ? "PvE" : "PvP"}
              </button>
            ))}
          </div>
          <div className={styles.teamGrid}>
            {teams.map((team, index) => (
              <article className={styles.teamCard} key={team.id}>
                <div className={styles.teamRank}>#{index + 1}</div>
                <div className={styles.teamBody}>
                  <span className={styles.teamMetric}>{team.metric}</span>
                  <h3>{team.name}</h3>
                  <div className={styles.memberChips}>
                    {team.members.map((member) => (
                      <span key={member}>{member}</span>
                    ))}
                  </div>
                  <p>{team.context}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="account-decisions-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>RESOURCE ALLOCATION</span>
              <h2 id="account-decisions-title">Account Decisions</h2>
            </div>
            <p>Reroll, wishlist, and current pull priority use the active server snapshot.</p>
          </div>
          <div className={styles.decisionGrid}>
            {decisions.map((decision) => (
              <article className={styles.decisionCard} key={decision.type}>
                <div className={styles.decisionTopline}>
                  <h3>{decision.title}</h3>
                  <span data-priority={decision.priority}>{decision.priority}</span>
                </div>
                <div className={styles.targetList}>
                  {decision.targets.map((target) => (
                    <strong key={target}>{target}</strong>
                  ))}
                </div>
                <p>{decision.rationale}</p>
                {decision.timing ? <small>{decision.timing}</small> : null}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="what-changed-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>SNAPSHOT DELTA</span>
              <h2 id="what-changed-title">What Changed</h2>
            </div>
            <p>
              Only changes relevant to the active server and current ranking decisions are shown.
            </p>
          </div>
          <div className={styles.changeList}>
            {changes.map((change) => (
              <article key={change.date + change.title}>
                <time dateTime={change.date}>{change.date}</time>
                <div>
                  <h3>{change.title}</h3>
                  <p>{change.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="methodology-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>EVIDENCE & NORMALIZATION</span>
              <h2 id="methodology-title">Methodology &amp; Sources</h2>
            </div>
            <p>
              Server taxonomy is sourced first; ranking normalization is applied only after that
              boundary is fixed.
            </p>
          </div>
          <div className={styles.methodologyGrid}>
            <div className={styles.methodologyCopy}>
              <h3>How this snapshot is built</h3>
              <p>
                Global and Taiwan keep separate faction and rarity keys. Global uses the current SSR
                Ex / SSR+ / SSR / SR / R / N pool terminology. Taiwan keeps the official local
                quality labels 傳說‧神話 / 傳說+ / 傳說 / 史詩 / 菁英 / 普通 instead of
                force-mapping them to Global.
              </p>
              <p>
                The five display tiers normalize source-specific labels into S+, S, A, B and C.
                Overall, PvE and PvP remain ranking views of one Luminary product rather than new
                standalone tier lists.
              </p>
              <p>
                Snapshot coverage is stated explicitly. Where a source is a current ranked subset,
                the page does not relabel that count as the full live roster.
              </p>
            </div>
            <div className={styles.sourceList}>
              {sources.map((source) => (
                <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                  <strong>{source.label}</strong>
                  <span>{source.use}</span>
                  <small>Checked {source.checkedAt}</small>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="faq-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>FAQ</span>
              <h2 id="faq-title">FAQ</h2>
            </div>
          </div>
          <div className={styles.faqList}>
            <details>
              <summary>Are Global and Taiwan rankings the same?</summary>
              <p>
                No. Server context controls the snapshot, taxonomy, teams and account decisions.
                Similar faction concepts do not make the underlying server data interchangeable.
              </p>
            </details>
            <details>
              <summary>Why does the Rarity filter change between servers?</summary>
              <p>
                Because the live terminology differs. The implementation intentionally avoids a
                shared Mythic / Legendary / Epic abstraction and keeps each server&apos;s verified
                labels.
              </p>
            </details>
            <details>
              <summary>Does S+ mean a Luminary is always the best pull?</summary>
              <p>
                No. Pull value also depends on the current banner, roster gaps, faction activation,
                star investment and whether the unit solves a real account problem.
              </p>
            </details>
            <details>
              <summary>Is this page already approved for search indexing?</summary>
              <p>
                No. The route ships through the existing TierListBase route-review policy and stays
                noindex until content, SEO and release review explicitly promote it.
              </p>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}
