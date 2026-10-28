"use client";

import Image from "next/image";
import { useDeferredValue, useMemo, useState } from "react";

import heroImage from "./assets/dragon-traveler-hero.webp";
import { accountDecisions } from "./account-decisions";
import { changes } from "./changes";
import { globalSnapshot } from "./global-snapshot";
import { sources } from "./sources";
import { taiwanSnapshot } from "./taiwan-snapshot";
import { teamRecommendations } from "./teams";
import { classKeys } from "./types";
import type { ClassKey, Luminary, RankingMode, ServerKey, ServerSnapshot, Tier } from "./types";

import styles from "./dragon-traveler-tier-list.module.css";

const snapshots: Readonly<Record<ServerKey, ServerSnapshot>> = {
  global: globalSnapshot,
  taiwan: taiwanSnapshot,
};

const tiers: readonly Tier[] = ["S+", "S", "A", "B", "C"];
const modes: readonly { key: RankingMode; label: string }[] = [
  { key: "overall", label: "Overall" },
  { key: "pve", label: "PvE" },
  { key: "pvp", label: "PvP" },
];

const faqs = [
  {
    q: "Are Global and Taiwan rankings the same?",
    a: "No. Each server uses its own verified taxonomy and snapshot. Taiwan is not a translated copy of the Global ranking set, and coverage is stated explicitly for each server.",
  },
  {
    q: "Why do rarity filters change when I switch servers?",
    a: "The two servers publish different rarity labels. Global currently uses SSR Ex / SSR+ / SSR / SR / R / N, while Taiwan official notices expose local labels such as 傳說·神話 and 傳說+.",
  },
  {
    q: "What does S+ mean?",
    a: "S+ marks the highest-value options in the selected context. It is contextual, not a claim that every S+ Luminary is equally strong in every team or account.",
  },
  {
    q: "How is this page updated?",
    a: "Snapshots are refreshed when ranking evidence, live roster metadata, or official server notices materially change. Snapshot dates and sources are shown on the page.",
  },
] as const;

function rankOf(luminary: Luminary, mode: RankingMode): Tier {
  return luminary.rankings[mode];
}

function initials(name: string): string {
  return name
    .split(/[\s・-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function DragonTravelerTierListPage() {
  const [server, setServer] = useState<ServerKey>("global");
  const [mode, setMode] = useState<RankingMode>("overall");
  const [classFilter, setClassFilter] = useState<ClassKey | "all">("all");
  const [factionFilter, setFactionFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(globalSnapshot.luminaries[0]?.id ?? "");
  const [teamMode, setTeamMode] = useState<"pve" | "pvp">("pve");

  const deferredServer = useDeferredValue(server);
  const deferredMode = useDeferredValue(mode);
  const deferredClassFilter = useDeferredValue(classFilter);
  const deferredFactionFilter = useDeferredValue(factionFilter);
  const deferredRarityFilter = useDeferredValue(rarityFilter);
  const snapshot = snapshots[deferredServer];

  const filtered = useMemo(
    () =>
      snapshot.luminaries.filter((luminary) => {
        if (deferredClassFilter !== "all" && luminary.classKey !== deferredClassFilter) {
          return false;
        }
        if (
          deferredFactionFilter !== "all" &&
          !luminary.factionKeys.includes(deferredFactionFilter)
        ) {
          return false;
        }
        if (deferredRarityFilter !== "all" && luminary.rarityKey !== deferredRarityFilter) {
          return false;
        }
        return true;
      }),
    [snapshot, deferredClassFilter, deferredFactionFilter, deferredRarityFilter],
  );

  const selected =
    snapshot.luminaries.find((luminary) => luminary.id === selectedId) ??
    filtered[0] ??
    snapshot.luminaries[0];

  const quickPicks = useMemo(() => {
    const best = snapshot.luminaries.filter((luminary) => rankOf(luminary, deferredMode) === "S+");
    return (best.length > 0 ? best : snapshot.luminaries).slice(0, 4);
  }, [snapshot, deferredMode]);

  const teams = teamRecommendations.filter(
    (team) => team.server === server && team.mode === teamMode,
  );
  const decisions = accountDecisions.filter((decision) => decision.server === server);

  function changeServer(next: ServerKey) {
    const nextSnapshot = snapshots[next];
    setServer(next);
    setClassFilter("all");
    setFactionFilter("all");
    setRarityFilter("all");
    setSelectedId(nextSnapshot.luminaries[0]?.id ?? "");
  }

  return (
    <main className={styles.page} data-dragon-traveler-page>
      <section className={styles.hero} aria-labelledby="dragon-traveler-title">
        <Image
          className={styles.heroImage}
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={76}
        />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Dragon Traveler · Luminary Rankings</p>
          <h1 id="dragon-traveler-title">Dragon Traveler Tier List</h1>
          <p>
            Compare current Luminary rankings by server context, then move from tier placement to
            teams and account decisions without mixing Global and Taiwan data.
          </p>
          <div className={styles.heroMeta}>
            <span>Snapshot: {snapshot.asOf}</span>
            <span>{snapshot.sourceLabel}</span>
          </div>
        </div>
      </section>

      <div className={styles.shell}>
        <section className={styles.context} aria-label="Server context">
          <div>
            <span>Server Context</span>
            <strong>{snapshot.label}</strong>
          </div>
          <div className={styles.segmented} role="group" aria-label="Server">
            {(["global", "taiwan"] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={server === key}
                className={server === key ? styles.activeControl : styles.control}
                onClick={() => changeServer(key)}
              >
                {snapshots[key].label}
              </button>
            ))}
          </div>
          <p>{snapshot.coverageNote}</p>
        </section>

        <section className={styles.section} aria-labelledby="quick-picks">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>At a glance</p>
              <h2 id="quick-picks">Quick Picks</h2>
            </div>
            <p>
              Highest-value options in the selected{" "}
              {modes.find((entry) => entry.key === deferredMode)?.label} context.
            </p>
          </div>
          <div className={styles.quickGrid}>
            {quickPicks.map((luminary) => (
              <button
                key={luminary.id}
                type="button"
                className={styles.quickCard}
                onClick={() => setSelectedId(luminary.id)}
              >
                <span className={styles.avatar}>{initials(luminary.name)}</span>
                <span>
                  <strong>{luminary.name}</strong>
                  <small>{luminary.classKey}</small>
                </span>
                <b>{rankOf(luminary, deferredMode)}</b>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="luminary-tier-list">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Decision workspace</p>
              <h2 id="luminary-tier-list">Luminary Tier List</h2>
            </div>
            <div className={styles.tabs} role="tablist" aria-label="Ranking context">
              {modes.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  role="tab"
                  aria-selected={mode === entry.key}
                  className={mode === entry.key ? styles.activeControl : styles.control}
                  onClick={() => setMode(entry.key)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filters}>
            <label>
              Class
              <select
                aria-label="Class"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value as ClassKey | "all")}
              >
                <option value="all">All Classes</option>
                {classKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Faction
              <select
                aria-label="Faction"
                value={factionFilter}
                onChange={(event) => setFactionFilter(event.target.value)}
              >
                <option value="all">All Factions</option>
                {snapshot.factions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rarity
              <select
                aria-label="Rarity"
                value={rarityFilter}
                onChange={(event) => setRarityFilter(event.target.value)}
              >
                <option value="all">All Rarities</option>
                {snapshot.rarities.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.workspace}>
            <div className={styles.board} aria-label="Luminary ranking board">
              {tiers.map((tier) => {
                const members = filtered.filter(
                  (luminary) => rankOf(luminary, deferredMode) === tier,
                );
                return (
                  <div className={styles.tierRow} key={tier}>
                    <div className={styles.tierLabel}>{tier}</div>
                    <div className={styles.tierMembers}>
                      {members.length === 0 ? (
                        <span className={styles.empty}>No matches</span>
                      ) : null}
                      {members.map((luminary) => (
                        <button
                          key={luminary.id}
                          type="button"
                          aria-label={`${luminary.name}, ${tier} tier`}
                          className={
                            selected?.id === luminary.id ? styles.characterActive : styles.character
                          }
                          onClick={() => setSelectedId(luminary.id)}
                        >
                          <span className={styles.avatar}>{initials(luminary.name)}</span>
                          <span>{luminary.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {selected ? (
              <aside className={styles.detail} aria-label="Character Detail">
                <p className={styles.kicker}>Character Detail</p>
                <div className={styles.detailTop}>
                  <span className={styles.detailAvatar}>{initials(selected.name)}</span>
                  <div>
                    <h3>{selected.name}</h3>
                    <p>{selected.classKey}</p>
                  </div>
                </div>
                <div className={styles.rankTriplet}>
                  {modes.map((entry) => (
                    <div key={entry.key}>
                      <span>{entry.label}</span>
                      <strong>{selected.rankings[entry.key]}</strong>
                    </div>
                  ))}
                </div>
                <p>{selected.summary}</p>
                <dl>
                  <div>
                    <dt>Rarity</dt>
                    <dd>
                      {snapshot.rarities.find((option) => option.key === selected.rarityKey)?.label}
                    </dd>
                  </div>
                  <div>
                    <dt>Factions</dt>
                    <dd>
                      {selected.factionKeys
                        .map((key) => snapshot.factions.find((option) => option.key === key)?.label)
                        .filter(Boolean)
                        .join(" · ")}
                    </dd>
                  </div>
                </dl>
              </aside>
            ) : null}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="best-teams">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Composition context</p>
              <h2 id="best-teams">Best Teams</h2>
            </div>
            <div className={styles.tabs} role="tablist" aria-label="Team mode">
              {(["pve", "pvp"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={teamMode === key}
                  className={teamMode === key ? styles.activeControl : styles.control}
                  onClick={() => setTeamMode(key)}
                >
                  {key === "pve" ? "PvE" : "PvP"}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.cardGrid}>
            {teams.map((team) => (
              <article className={styles.card} key={team.name}>
                <p className={styles.kicker}>{team.mode.toUpperCase()}</p>
                <h3>{team.name}</h3>
                <div className={styles.teamMembers}>
                  {team.core.map((member) => (
                    <span key={member}>{member}</span>
                  ))}
                </div>
                <p>{team.why}</p>
                <small>{team.sourceLabel}</small>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="account-decisions">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Account value</p>
              <h2 id="account-decisions">Account Decisions</h2>
            </div>
            <p>Reroll, wishlist, and current pull priority only.</p>
          </div>
          <div className={styles.decisionGrid}>
            {decisions.map((decision) => (
              <article className={styles.card} key={decision.type}>
                <span className={styles.decisionType}>
                  {decision.type === "reroll"
                    ? "Reroll"
                    : decision.type === "wishlist"
                      ? "Wishlist"
                      : "Current Pull Priority"}
                </span>
                <h3>{decision.recommendation}</h3>
                <p>{decision.rationale}</p>
                <small>{decision.sourceLabel}</small>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="what-changed">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Release notes</p>
              <h2 id="what-changed">What Changed</h2>
            </div>
          </div>
          <div className={styles.changeList}>
            {changes.map((change) => (
              <article key={change.date + change.title}>
                <time>{change.date}</time>
                <div>
                  <h3>{change.title}</h3>
                  <p>{change.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="methodology-sources">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Evidence</p>
              <h2 id="methodology-sources">Methodology &amp; Sources</h2>
            </div>
          </div>
          <div className={styles.methodGrid}>
            <article className={styles.card}>
              <h3>How rankings are assembled</h3>
              <p>
                Server identity is resolved first. Ranking evidence is then separated into Overall,
                PvE, and PvP context. Class, faction, and rarity are metadata filters, never extra
                ranking systems. When a source does not prove complete live-roster coverage, this
                page says so rather than filling gaps with invented values.
              </p>
            </article>
            <div className={styles.sourceList}>
              {sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                  <strong>{source.label}</strong>
                  <span>{source.scope}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.faqSection}`} aria-labelledby="faq">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Reference</p>
              <h2 id="faq">FAQ</h2>
            </div>
          </div>
          <div className={styles.faqList}>
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
