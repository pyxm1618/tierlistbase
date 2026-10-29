"use client";

import Image from "next/image";
import { useRef, useState, type RefObject, type CSSProperties } from "react";
import { CurrentPullPriority } from "./current-pull-priority";
import {
  classes,
  filterRoster,
  getFilters,
  getQuickPicks,
  getRoster,
  rankingViews,
  servers,
  snapshotDate,
  sourceRecords,
  teams,
  teamViews,
  tiers,
  type Luminary,
  type RosterFilters,
  type ServerKey,
  type Team,
  type TeamViewKey,
  type ViewKey,
} from "./data";
import { classesIcons, factionsIcons, heroArtwork, portraits } from "./icons";
import styles from "./dragon-traveler-tier-list.module.css";

function Portrait({
  id,
  name,
  size = 64,
}: {
  readonly id: string;
  readonly name: string;
  readonly size?: number;
}) {
  return (
    <Image
      className={styles.portrait}
      style={{ "--portrait-size": `${size}px` } as CSSProperties}
      src={portraits[id]!}
      alt={name ? `${name} portrait` : ""}
      width={size}
      height={size}
      unoptimized
    />
  );
}
function CharacterDetail({
  detailRef,
  character,
  onSelect,
  roster,
}: {
  readonly detailRef: RefObject<HTMLElement | null>;
  readonly character: Luminary;
  readonly onSelect: (id: string) => void;
  readonly roster: readonly Luminary[];
}) {
  const partners = character.bestPartners;
  return (
    <aside
      className={styles.detail}
      ref={detailRef}
      tabIndex={-1}
      data-testid="character-detail"
      aria-label="Selected Luminary details"
      aria-live="polite"
    >
      <div className={styles.detailIdentity}>
        <Image
          className={styles.detailPortrait}
          src={portraits[character.id]!}
          alt={character.displayName}
          fill
          sizes="(max-width: 600px) 100vw, 335px"
          unoptimized
        />
        <div>
          <p className={styles.eyebrow}>
            {character.rarity} · {character.class}
          </p>
          <h3>{character.displayName}</h3>
          <p>{character.factions.join(" · ")}</p>
        </div>
      </div>
      <div className={styles.ratings}>
        {rankingViews.map((view) => (
          <div key={view}>
            <small>{view}</small>
            <strong>{character.viewTiers[view]}</strong>
          </div>
        ))}
      </div>
      <dl className={styles.metrics}>
        {[
          ["New Player Value", character.newPlayerValue],
          ["Investment", character.investmentLevel],
          ["Team Dependency", character.teamDependency],
          ["Flexibility", character.flexibility],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.detailCopy}>
        <h4>Why This Tier</h4>
        <p>{character.whyThisTier}</p>
        <div className={styles.prosCons}>
          <div>
            <h4>Strengths</h4>
            <ul>
              {character.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Limitations</h4>
            <ul>
              {character.limitations.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <h4>Best For</h4>
        <p>{character.bestFor.join(" · ")}</p>
        <h4>Best Partners</h4>
        {partners.length ? (
          <div className={styles.partnerRow}>
            {partners.map((id) => (
              <button type="button" key={id} onClick={() => onSelect(id)}>
                <Portrait id={id} name={roster.find((c) => c.id === id)!.displayName} size={42} />
                <span>{roster.find((c) => c.id === id)!.displayName}</span>
              </button>
            ))}
          </div>
        ) : (
          <p>Check the source character guide for a tested composition before investing.</p>
        )}
        <a
          href={
            character.id === "arachne"
              ? sourceRecords.find((s) => s.id === "allclash-arachne")!.url
              : sourceRecords.find((s) => s.id === `character-${character.id}`)!.url
          }
          target="_blank"
          rel="noreferrer"
        >
          Read character evidence ↗
        </a>
      </div>
    </aside>
  );
}
function TeamFormation({
  team,
  roster,
  onSelect,
}: {
  readonly team: Team;
  readonly roster: readonly Luminary[];
  readonly onSelect: (id: string) => void;
}) {
  return (
    <article className={styles.featuredTeam} data-testid="featured-team">
      <div className={styles.teamHeading}>
        <span className={styles.teamRank}>#{team.rank}</span>
        <div>
          <h3>{team.name}</h3>
          <p>
            {team.archetype} · {team.investmentLevel} investment
          </p>
        </div>
        <strong className={styles.teamTier}>{team.tier}</strong>
      </div>
      <div className={styles.formation}>
        {(["Backline", "Midline", "Frontline"] as const).map((position) => (
          <div key={position}>
            <h4>{position}</h4>
            {(["Left", "Center", "Right"] as const).map((slot) => {
              const member = team.members.find((m) => m.position === position && m.slot === slot);
              return (
                <div
                  key={slot}
                  className={styles.formationCell}
                  data-testid="formation-cell"
                  data-position={position}
                  data-slot={slot}
                >
                  {member ? (
                    <button type="button" onClick={() => onSelect(member.characterId)}>
                      <Portrait
                        id={member.characterId}
                        name={roster.find((c) => c.id === member.characterId)!.displayName}
                        size={56}
                      />
                      <span>{roster.find((c) => c.id === member.characterId)!.displayName}</span>
                      <small>{slot}</small>
                    </button>
                  ) : (
                    <span className={styles.emptyCell} aria-label={`Empty ${position} ${slot}`}>
                      —
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <h4>Core Synergy</h4>
      <p>{team.coreSynergy}</p>
      <p>
        <strong>Best For:</strong> {team.bestFor.join(" · ")}
      </p>
      <p>
        <strong>Flexible Slot:</strong>{" "}
        {roster.find((c) => c.id === team.flexibleSlot)?.displayName ??
          "No flexible slot specified by this source."}
      </p>
      <p>
        <strong>Alternatives:</strong>{" "}
        {team.alternatives.length
          ? team.alternatives.map((id) => roster.find((c) => c.id === id)!.displayName).join(" · ")
          : "No substitute specified in this source formation."}
      </p>
    </article>
  );
}
export function DragonTravelerTierList() {
  const detailRef = useRef<HTMLElement>(null);
  const [server, setServer] = useState<ServerKey>("global");
  const [view, setView] = useState<ViewKey>("Overall");
  const [teamView, setTeamView] = useState<TeamViewKey>("PvE");
  const [wishlistView, setWishlistView] = useState<"New Player" | "PvE" | "PvP">("New Player");
  const [filters, setFilters] = useState<RosterFilters>({});
  const [selectedId, setSelectedId] = useState("poseidon");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const roster = getRoster(server),
    options = getFilters(server);
  const filtered = filterRoster(roster, filters);
  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0];
  const currentTeams = teams.filter((t) => t.server === server && t.view === teamView);
  const featured = currentTeams.find((t) => t.id === selectedTeamId) ?? currentTeams[0]!;
  const quickPicks = getQuickPicks(server);
  const wishlist =
    wishlistView === "New Player"
      ? {
          high: ["fenrir", "oberonnie", "medusa"],
          situational: ["atanith", "chiron"],
          low: ["arthur", "guna"],
        }
      : wishlistView === "PvE"
        ? {
            high: [quickPicks["Best PvE"], "vivian", "artemis"],
            situational: ["scheherazade", "gullveig"],
            low: ["cerberus", "gudong"],
          }
        : {
            high: [quickPicks["Best PvP"], "poseidon", "morgana"],
            situational: ["ophelia", "zagrus"],
            low: ["cerberus", "guna"],
          };
  function selectCharacter(id: string) {
    setSelectedId(id);
    setFilters({});
    requestAnimationFrame(() => {
      const detail = detailRef.current;
      if (!detail) return;
      const top = detail.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.65)
        detail.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
      detail.focus({ preventScroll: true });
    });
  }
  function switchServer(next: ServerKey) {
    const nextOptions = getFilters(next);
    setServer(next);
    setFilters((current) => ({
      ...current,
      faction: nextOptions.factions.some((f) => f === current.faction)
        ? (current.faction ?? "")
        : "",
      rarity: nextOptions.rarities.some((r) => r === current.rarity) ? (current.rarity ?? "") : "",
    }));
  }
  function filterControl(
    key: "class" | "faction" | "rarity",
    label: string,
    values: readonly string[],
  ) {
    return (
      <label className={styles.filter}>
        <span>{label}</span>
        <select
          aria-label={label}
          value={filters[key] ?? ""}
          onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
        >
          <option value="">All</option>
          {values.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
    );
  }
  function recommendationButtons(ids: readonly string[]) {
    return (
      <div className={styles.recommendations}>
        {ids.map((id) => {
          const c = roster.find((item) => item.id === id)!;
          return (
            <button key={id} type="button" onClick={() => selectCharacter(id)}>
              <Portrait id={id} name={c.displayName} size={48} />
              <span>{c.displayName}</span>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <main className={styles.page} data-dragon-traveler-page>
      <section className={styles.hero} aria-labelledby="dragon-title">
        <Image
          className={styles.heroArt}
          src={heroArtwork}
          alt=""
          fill
          priority
          sizes="100vw"
          unoptimized
        />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Dragon Traveler · Game Meta Board</p>
          <h1 id="dragon-title">Dragon Traveler Tier List</h1>
          <p>
            Find your next Luminary. Compare Overall value, PvE progression and PvP impact — with
            team context and investment in view.
          </p>
          <div className={styles.snapshot}>
            <span>{server === "global" ? "Global" : "Taiwan"} server</span>
            <span>Snapshot {snapshotDate}</span>
            <span>{roster.length} live Luminaries</span>
            <span>Editorial preview · noindex</span>
          </div>
        </div>
      </section>
      <div className={styles.content}>
        <section className={styles.quickPicks} aria-labelledby="quick-picks-title">
          <div>
            <h2 id="quick-picks-title">Quick Picks</h2>
            <p>A starting point for your account.</p>
          </div>
          {Object.entries(quickPicks).map(([label, id]) => (
            <button type="button" key={label} onClick={() => selectCharacter(id)}>
              <Portrait id={id} name={roster.find((c) => c.id === id)!.displayName} size={54} />
              <span>
                <small>{label}</small>
                <strong>{roster.find((c) => c.id === id)!.displayName}</strong>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </section>
        <section className={styles.workspace} aria-label="Luminary rankings and details">
          <div className={styles.board}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Build with a purpose</p>
                <h2>Luminary Tier List</h2>
              </div>
              <div className={styles.switches} role="group" aria-label="Server context">
                {servers.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={server === s}
                    onClick={() => switchServer(s)}
                  >
                    {s === "global" ? "Global" : "Taiwan"}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.switches} role="group" aria-label="Luminary ranking views">
              {rankingViews.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={view === mode}
                  onClick={() => setView(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className={styles.toolbar}>
              <label className={styles.search}>
                <span className={styles.srOnly}>Search Luminaries</span>
                <input
                  type="search"
                  aria-label="Search Luminaries"
                  placeholder="Search Luminaries…"
                  value={filters.search ?? ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </label>
              {filterControl("class", "Class", classes)}
              {filterControl("faction", "Faction", options.factions)}
              {filterControl("rarity", "Rarity", options.rarities)}
              <button type="button" className={styles.clear} onClick={() => setFilters({})}>
                Clear filters
              </button>
            </div>
            <p className={styles.count} role="status">
              Showing {filtered.length} of {roster.length} live Luminaries ·{" "}
              {server === "global" ? "Global" : "Taiwan"} · {view}
            </p>
            <div className={styles.tierRows}>
              {tiers.map((tier) => (
                <div className={styles.tierRow} key={tier} data-tier={tier}>
                  <div className={styles.tierLabel}>{tier}</div>
                  <div className={styles.cards}>
                    {filtered
                      .filter((c) => c.viewTiers[view] === tier)
                      .map((c) => (
                        <button
                          type="button"
                          data-testid="luminary-card"
                          className={styles.card}
                          key={c.id}
                          aria-label={`Select ${c.displayName}`}
                          aria-pressed={selected?.id === c.id}
                          onClick={() => setSelectedId(c.id)}
                        >
                          <Portrait id={c.id} name="" size={64} />
                          <span className={styles.cardBadges}>
                            <Image
                              src={classesIcons[c.class]}
                              alt={c.class}
                              width={14}
                              height={14}
                              unoptimized
                            />
                            {c.factions.map((f) => (
                              <Image
                                key={f}
                                src={factionsIcons[f]}
                                alt={f}
                                width={14}
                                height={14}
                                unoptimized
                              />
                            ))}
                          </span>
                          <span>{c.displayName}</span>
                        </button>
                      ))}
                    {!filtered.some((c) => c.viewTiers[view] === tier) && (
                      <p className={styles.empty}>No matching Luminaries in this tier.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {selected ? (
            <CharacterDetail
              detailRef={detailRef}
              character={selected}
              onSelect={selectCharacter}
              roster={roster}
            />
          ) : (
            <aside className={styles.detail}>
              <p>No matching Luminaries. Clear filters to explore the roster.</p>
            </aside>
          )}
        </section>
        <section className={styles.teamsSection} aria-labelledby="teams-title">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="teams-title">Best Dragon Traveler Teams</h2>
              <p>Build around synergy, positioning and the characters you own.</p>
            </div>
            <div className={styles.switches} role="group" aria-label="Team ranking views">
              {teamViews.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={teamView === mode}
                  onClick={() => setTeamView(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.teamLayout}>
            <TeamFormation team={featured} roster={roster} onSelect={selectCharacter} />
            <div className={styles.teamList}>
              {currentTeams
                .filter((t) => t.id !== featured.id)
                .map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTeamId(t.id)}
                    className={styles.compactTeam}
                  >
                    <span className={styles.teamRank}>#{t.rank}</span>
                    <div>
                      <strong>{t.name}</strong>
                      <p>{t.archetype}</p>
                      <div className={styles.miniPortraits}>
                        {t.members.map((m) => (
                          <Portrait
                            key={m.characterId}
                            id={m.characterId}
                            name={roster.find((c) => c.id === m.characterId)!.displayName}
                            size={34}
                          />
                        ))}
                      </div>
                    </div>
                    <span aria-hidden="true">›</span>
                  </button>
                ))}
            </div>
          </div>
          <p className={styles.note}>
            Four sourced formations per mode. Order and team grades are editorial recommendations,
            not measured win rates. Both server lists use the same formation advice where every
            member is live.
          </p>
        </section>
        <section aria-labelledby="decisions-title">
          <h2 id="decisions-title">Account Decisions</h2>
          <p className={styles.sectionIntro}>
            Spend for the team you can finish, not a tier label alone.
          </p>
          <div className={styles.decisionGrid}>
            <article className={styles.paper}>
              <h3>Best Reroll Targets</h3>
              <p>
                Prioritize an accessible damage dealer, a frontline unit and support. Starter and
                shop options keep the initial cost lower.
              </p>
              {recommendationButtons(["fenrir", "oberonnie", "medusa", "atanith"])}
              <p>
                These are account-building targets, not a promise of availability on a particular
                banner.
              </p>
            </article>
            <article className={styles.paper}>
              <h3>Wishlist Priority</h3>
              <div className={styles.switches} role="group" aria-label="Wishlist context">
                {(["New Player", "PvE", "PvP"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={wishlistView === mode}
                    onClick={() => setWishlistView(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className={styles.wishlistGroups}>
                {(
                  [
                    ["High Priority", wishlist.high],
                    ["Situational", wishlist.situational],
                    ["Low Priority", wishlist.low],
                  ] as const
                ).map(([label, ids]) => (
                  <div key={label}>
                    <h4>{label}</h4>
                    {recommendationButtons([...new Set(ids)])}
                  </div>
                ))}
              </div>
            </article>
            <CurrentPullPriority server={server} />
          </div>
        </section>
        <section className={styles.changes}>
          <h2>What Changed</h2>
          <p>
            First verified source capture on {snapshotDate}. There is no previous TierListBase
            snapshot to compare, so no tier movements are claimed.
          </p>
        </section>
        <section className={styles.paper} aria-labelledby="methodology-title">
          <h2 id="methodology-title">How We Rank Dragon Traveler Luminaries</h2>
          <div className={styles.methodGrid}>
            <div>
              <h3>Server-specific</h3>
              <p>
                Overall ordering and live membership follow the Global / Taiwan source lists.
                Arachne’s Global release is corroborated by the October 25 banner report. War
                Drummer is a formation helper and is excluded from the Luminary count.
              </p>
            </div>
            <div>
              <h3>Mode-aware</h3>
              <p>
                PvE and PvP follow published character assessments, shared between servers by the
                source. They are not independently tested server-specific performance results.
              </p>
            </div>
            <div>
              <h3>Team context</h3>
              <p>
                Formation members and substitutes follow the linked community guide. Frontline,
                midline and backline placement preserves the source’s three-by-three formation
                coordinates. Local team order reflects a suggested starting sequence.
              </p>
            </div>
            <div>
              <h3>Investment-aware</h3>
              <p>
                New-player value, cost, dependency and flexibility are editorial estimates from
                rarity, starter access and published build notes. They are not usage statistics or
                spending guarantees.
              </p>
            </div>
          </div>
          <details>
            <summary>How source grades become five tiers</summary>
            <p>
              Hideout SS → S+; S+ → S; S and A+ → A; A, B/A, B+ and B → B; C → C. AllClash’s Arachne
              grades already use five bands and are retained unchanged. This intentionally
              compresses the source scale. Source character grades remain in the data provenance; a
              local A can represent several source grades.
            </p>
          </details>
          <p className={styles.note}>
            Sources were accessed on {snapshotDate}. An access date does not prove that the
            publisher’s data is current. This independent editorial preview remains noindex pending
            content and SEO release review.
          </p>
        </section>
        <section className={styles.sources}>
          <h2>Sources</h2>
          <p>Character evidence is linked from each detail panel. General references:</p>
          <ul>
            {sourceRecords
              .filter((s) => !s.id.startsWith("character-"))
              .map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.name} ↗
                  </a>
                  <span>
                    {s.sourceType} · accessed {s.checkedAt}
                  </span>
                </li>
              ))}
          </ul>
          <p>
            Game characters and artwork belong to their respective owners. TierListBase is not
            affiliated with Dragon Traveler or its publishers.
          </p>
        </section>
        <section className={styles.faq}>
          <h2>FAQ</h2>
          {[
            [
              "Who is the best character in Dragon Traveler?",
              "There is no universal best for every account. Quick Picks offer a starting point; compare mode ratings, duplicate requirements and the team you already own.",
            ],
            [
              "Is the Taiwan tier list the same as Global?",
              "No. The live pool and Overall ordering differ. The source uses shared character mode assessments; this page makes that limitation explicit.",
            ],
            [
              "Should I reroll in Dragon Traveler?",
              "Use the reroll targets to fill missing team roles. An accessible starter can be more practical than a premium character whose required duplicates are out of reach.",
            ],
            [
              "Which faction is best?",
              "Choose a faction whose damage, protection and support core you can build together. Faction is a filter, not an additional ranking.",
            ],
            [
              "Are upcoming characters ranked?",
              "No. Upcoming records are separate and can only appear in pull context with Wait for Testing. They never enter the live board, Quick Picks, teams or live count.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      </div>
    </main>
  );
}
