"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import {
  formatRate,
  getChampion,
  getOtherViableRoles,
  getQuickPick,
  getRanking,
  getRoleProfile,
  getRoleRankings,
  roleKeys,
  tierDefinitions,
  tiers,
  wildRiftSnapshot,
  type ChampionRoleRanking,
  type RoleKey,
  type Tier,
  type Trend,
} from "./data";
import styles from "./wild-rift-tier-list.module.css";

type ActiveRole = "all" | RoleKey;
type TierFilter = "all" | Tier;

const roleTabs: readonly { key: ActiveRole; label: string; auxiliary: string }[] = [
  { key: "all", label: "All Roles", auxiliary: "" },
  ...roleKeys.map((role) => {
    const profile = getRoleProfile(role);
    return { key: role, label: profile.label, auxiliary: profile.auxiliary };
  }),
];

function subscribeToMobile(callback: () => void) {
  const media = window.matchMedia("(max-width: 767px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function serverMobileSnapshot() {
  return false;
}

function trendSymbol(trend: Trend) {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  if (trend === "flat") return "→";
  return "—";
}

function trendLabel(trend: Trend) {
  if (trend === "up") return "Rising";
  if (trend === "down") return "Falling";
  if (trend === "flat") return "Stable";
  return "Trend unavailable";
}

function ChampionPortrait({
  championId,
  size = 64,
  priority = false,
}: {
  championId: string;
  size?: number;
  priority?: boolean;
}) {
  const champion = getChampion(championId);
  return (
    <span className={styles.portrait} style={{ "--portrait-size": `${size}px` } as CSSProperties}>
      <Image
        src={champion.portrait}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        priority={priority}
      />
    </span>
  );
}

function Stat({
  label,
  value,
  primary = false,
}: {
  label: string;
  value: number | null;
  primary?: boolean;
}) {
  return (
    <span className={primary ? styles.statPrimary : styles.stat}>
      <strong>{formatRate(value)}</strong>
      <small>{label}</small>
    </span>
  );
}

function RankingCard({
  ranking,
  selected,
  onSelect,
}: {
  ranking: ChampionRoleRanking;
  selected: boolean;
  onSelect: () => void;
}) {
  const champion = getChampion(ranking.championId);
  return (
    <button
      type="button"
      className={styles.championCard}
      data-champion-card
      data-selected={selected}
      data-tier={ranking.tier}
      aria-pressed={selected}
      aria-label={`${champion.name}, ${getRoleProfile(ranking.role).label}, ${ranking.tier} tier, ${formatRate(ranking.winRate)} win rate, ${formatRate(ranking.pickRate)} pick rate, ${formatRate(ranking.banRate)} ban rate, ${trendLabel(ranking.trend)}`}
      onClick={onSelect}
    >
      <div className={styles.cardIdentity}>
        <ChampionPortrait championId={ranking.championId} />
        <span>
          <strong data-champion-name>{champion.name}</strong>
          <small className={styles.trend} data-trend={ranking.trend}>
            <span aria-hidden="true">{trendSymbol(ranking.trend)}</span> {trendLabel(ranking.trend)}
          </small>
        </span>
      </div>
      <div className={styles.cardStats}>
        <Stat label="WR" value={ranking.winRate} primary />
        <Stat label="PR" value={ranking.pickRate} />
        <Stat label="BR" value={ranking.banRate} />
      </div>
    </button>
  );
}

function DecisionSignals({
  ranking,
  headingId,
}: {
  ranking: ChampionRoleRanking;
  headingId: string;
}) {
  const signals = [
    ["Solo Queue Reliability", ranking.decisionSignals.soloQueueReliability],
    ["Blind Pick Safety", ranking.decisionSignals.blindPickSafety],
    ["Ease of Execution", ranking.decisionSignals.easeOfExecution],
    ["Carry / Impact Potential", ranking.decisionSignals.carryImpactPotential],
    ["Team Dependence", ranking.decisionSignals.teamDependence],
  ] as const;

  return (
    <section className={styles.detailSection} aria-labelledby={headingId}>
      <h4 id={headingId}>Decision Signals</h4>
      <div className={styles.signalGrid}>
        {signals.map(([label, value]) => (
          <div key={label} className={styles.signal}>
            <span>{label}</span>
            <span className={styles.signalTrack} aria-hidden="true">
              <span data-signal={value} />
            </span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChampionDetail({ ranking, titleId }: { ranking: ChampionRoleRanking; titleId: string }) {
  const champion = getChampion(ranking.championId);
  const role = getRoleProfile(ranking.role);
  const otherRoles = getOtherViableRoles(ranking.championId, ranking.role);

  return (
    <div className={styles.detailContent}>
      <div className={styles.detailHeader}>
        <ChampionPortrait championId={ranking.championId} size={88} />
        <div>
          <span className={styles.detailEyebrow}>
            {role.label} · <strong>{ranking.tier} Tier</strong>
          </span>
          <h3 id={titleId}>{champion.name}</h3>
          <p>{ranking.whyThisTier}</p>
        </div>
      </div>

      <div className={styles.detailStats} aria-label="Champion statistics">
        <Stat label="Win Rate" value={ranking.winRate} primary />
        <Stat label="Pick Rate" value={ranking.pickRate} />
        <Stat label="Ban Rate" value={ranking.banRate} />
        <span className={styles.detailTrend}>
          <strong>{trendSymbol(ranking.trend)}</strong>
          <small>{trendLabel(ranking.trend)}</small>
        </span>
      </div>

      <section className={styles.detailSection}>
        <h4>Other Viable Roles</h4>
        {otherRoles.length ? (
          <div className={styles.otherRoles}>
            {otherRoles.map((other) => (
              <span key={other.role}>
                {getRoleProfile(other.role).label} <strong>{other.tier}</strong>
              </span>
            ))}
          </div>
        ) : (
          <p>No other role has enough reviewed evidence in this snapshot.</p>
        )}
      </section>

      <DecisionSignals ranking={ranking} headingId={`${titleId}-decision-signals`} />

      <div className={styles.detailColumns}>
        <section className={styles.detailSection}>
          <h4>Key Strengths</h4>
          <ul>
            {ranking.strengths.map((strength) => (
              <li key={strength}>{strength}</li>
            ))}
          </ul>
        </section>
        <section className={styles.detailSection}>
          <h4>Limitations</h4>
          <ul>
            {ranking.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className={styles.patchImpact}>
        <span>Recent Patch Impact · {wildRiftSnapshot.latestRankedBalance}</span>
        <p>{ranking.patchImpact}</p>
      </section>
    </div>
  );
}

function MobileDetail({ ranking, onClose }: { ranking: ChampionRoleRanking; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.drawer}
      aria-labelledby="wild-rift-mobile-detail-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.drawerHeader}>
        <span>Champion Detail</span>
        <button type="button" autoFocus aria-label="Close champion details" onClick={onClose}>
          ✕
        </button>
      </div>
      <ChampionDetail ranking={ranking} titleId="wild-rift-mobile-detail-title" />
    </dialog>
  );
}

function QuickPicks({ onPick }: { onPick: (role: RoleKey, championId: string) => void }) {
  return (
    <section
      className={styles.quickPicks}
      data-ia-section="quick-picks"
      aria-labelledby="quick-picks-heading"
    >
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.kicker}>Fast read</span>
          <h2 id="quick-picks-heading">Quick Picks by Role</h2>
        </div>
        <p>One reviewed priority pick from each role list.</p>
      </div>
      <div className={styles.quickPickGrid}>
        {roleKeys.map((role) => {
          const profile = getRoleProfile(role);
          const ranking = getQuickPick(role);
          const champion = getChampion(ranking.championId);
          return (
            <button
              key={role}
              type="button"
              className={styles.quickPick}
              aria-label={`Open ${profile.label} and select ${champion.name}, ${ranking.tier} tier`}
              onClick={() => onPick(role, ranking.championId)}
            >
              <span className={styles.quickRole}>{profile.label}</span>
              <ChampionPortrait championId={ranking.championId} size={56} />
              <span className={styles.quickIdentity}>
                <strong>{champion.name}</strong>
                <small>{profile.auxiliary || "Ranked"}</small>
              </span>
              <span className={styles.quickTier} data-tier={ranking.tier}>
                {ranking.tier}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AllRolesOverview({ onViewRole }: { onViewRole: (role: RoleKey) => void }) {
  return (
    <section
      className={styles.allRoles}
      data-ia-section="all-roles-overview"
      aria-labelledby="all-roles-heading"
    >
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.kicker}>Overview · not an Overall Tier List</span>
          <h2 id="all-roles-heading">Best Wild Rift Champions by Role</h2>
        </div>
        <p>
          Five role-specific snapshots. Champions are never mixed into one cross-role tier board.
        </p>
      </div>
      <div className={styles.roleOverviewGrid}>
        {roleKeys.map((role) => {
          const profile = getRoleProfile(role);
          const top = getRoleRankings(role).slice(0, 3);
          return (
            <article key={role} className={styles.roleOverviewCard}>
              <div className={styles.roleOverviewHeader}>
                <span>
                  <strong>{profile.label}</strong>
                  {profile.auxiliary && <small>{profile.auxiliary}</small>}
                </span>
                <button type="button" onClick={() => onViewRole(role)}>
                  View {profile.label}
                </button>
              </div>
              <div className={styles.overviewRows}>
                {top.map((ranking) => {
                  const champion = getChampion(ranking.championId);
                  return (
                    <div key={ranking.championId} className={styles.overviewRow}>
                      <ChampionPortrait championId={ranking.championId} size={42} />
                      <strong>{champion.name}</strong>
                      <span data-tier={ranking.tier}>{ranking.tier}</span>
                      <small>{formatRate(ranking.winRate)} WR</small>
                      <small className={styles.trend} data-trend={ranking.trend}>
                        {trendSymbol(ranking.trend)}
                      </small>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RoleTierBoard({
  role,
  selected,
  onSelect,
}: {
  role: RoleKey;
  selected: ChampionRoleRanking | null;
  onSelect: (ranking: ChampionRoleRanking) => void;
}) {
  const profile = getRoleProfile(role);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const rankings = getRoleRankings(role);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("en");
    return rankings.filter((ranking) => {
      const champion = getChampion(ranking.championId);
      return (
        champion.name.toLocaleLowerCase("en").includes(query) &&
        (tierFilter === "all" || ranking.tier === tierFilter)
      );
    });
  }, [rankings, search, tierFilter]);

  return (
    <section className={styles.roleWorkspace} data-ia-section="role-workspace">
      <div className={styles.boardColumn}>
        <div className={styles.boardHeader}>
          <div>
            <span className={styles.kicker}>{profile.question}</span>
            <h2>{profile.label} Tier List</h2>
          </div>
          <span className={styles.rankContextBadge}>{wildRiftSnapshot.rankContext}</span>
        </div>

        <div
          className={styles.filters}
          data-ia-section="search-filters"
          aria-label="Tier list filters"
        >
          <label className={styles.searchField}>
            <span>Search Champions</span>
            <input
              type="search"
              value={search}
              placeholder="Search champions…"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className={styles.selectField}>
            <span>Rank Context</span>
            <select value={wildRiftSnapshot.rankContext} disabled>
              <option>{wildRiftSnapshot.rankContext}</option>
            </select>
          </label>
          <label className={styles.selectField}>
            <span>Tier</span>
            <select
              value={tierFilter}
              onChange={(event) => setTierFilter(event.target.value as TierFilter)}
            >
              <option value="all">All</option>
              {tiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              setSearch("");
              setTierFilter("all");
            }}
          >
            Reset
          </button>
        </div>

        <p className={styles.results} role="status">
          {filtered.length
            ? `${filtered.length} reviewed Champion × Role rankings`
            : "No champions match these filters."}
        </p>

        <div className={styles.tierBoard} aria-label={`${profile.label} champion tiers`}>
          {tiers.map((tier) => {
            const tierRankings = filtered.filter((ranking) => ranking.tier === tier);
            return (
              <section key={tier} className={styles.tierRow} data-tier-row={tier}>
                <div className={styles.tierLabel} data-tier={tier}>
                  <strong>{tier}</strong>
                  <span>{tierDefinitions[tier]}</span>
                </div>
                <div className={styles.tierCards}>
                  {tierRankings.map((ranking) => (
                    <RankingCard
                      key={ranking.championId}
                      ranking={ranking}
                      selected={
                        selected?.championId === ranking.championId &&
                        selected.role === ranking.role
                      }
                      onSelect={() => onSelect(ranking)}
                    />
                  ))}
                  {!tierRankings.length && (
                    <span className={styles.emptyTier}>No matching champions in this tier.</span>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <aside
        className={styles.detailPanel}
        data-ia-section="champion-detail"
        aria-label="Champion Detail"
      >
        {selected ? (
          <ChampionDetail ranking={selected} titleId="wild-rift-desktop-detail-title" />
        ) : (
          <div className={styles.emptyDetail}>
            <span aria-hidden="true">⌁</span>
            <h3>Select a champion</h3>
            <p>Open a card to review stats, role context, decision signals and patch evidence.</p>
          </div>
        )}
      </aside>
    </section>
  );
}

function QuickInsights({ role }: { role: RoleKey }) {
  const profile = getRoleProfile(role);
  return (
    <section
      className={styles.insights}
      data-ia-section="quick-insights"
      aria-labelledby="quick-insights-heading"
    >
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.kicker}>{profile.label}</span>
          <h2 id="quick-insights-heading">Quick Insights</h2>
        </div>
        <p>Decision shortcuts from the same reviewed role rankings.</p>
      </div>
      <div className={styles.insightGrid}>
        {profile.insights.map((insight) => {
          const ranking = getRanking(insight.championId, role);
          if (!ranking) return null;
          const champion = getChampion(insight.championId);
          return (
            <article key={insight.kind} className={styles.insight}>
              <span>{insight.label}</span>
              <div>
                <ChampionPortrait championId={insight.championId} size={44} />
                <strong>{champion.name}</strong>
                <b data-tier={ranking.tier}>{ranking.tier}</b>
              </div>
              <p>{insight.reason}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function WhatChanged({ role }: { role: ActiveRole }) {
  const changes =
    role === "all"
      ? wildRiftSnapshot.changes.slice(0, 6)
      : wildRiftSnapshot.changes.filter((change) => change.role === role);

  return (
    <section
      className={styles.changes}
      data-ia-section="what-changed"
      aria-labelledby="what-changed-heading"
    >
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.kicker}>
            Latest Ranked Balance · {wildRiftSnapshot.latestRankedBalance}
          </span>
          <h2 id="what-changed-heading">What Changed</h2>
        </div>
        <p>
          Game version {wildRiftSnapshot.gameVersion} is current, but 7.3c is AAA ARAM-only;
          standard Ranked movement below is anchored to 7.3b.
        </p>
      </div>
      <div className={styles.changeList}>
        {changes.map((change) => {
          const champion = getChampion(change.championId);
          const profile = getRoleProfile(change.role);
          return (
            <article key={`${change.role}-${change.championId}`} className={styles.changeRow}>
              <ChampionPortrait championId={change.championId} size={44} />
              <div>
                <span>
                  {profile.label} · {change.kind}
                </span>
                <strong>{champion.name}</strong>
              </div>
              <b>
                {change.previousTier} → {change.newTier}
              </b>
              <p>{change.reason}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function WildRiftWorkspace() {
  const [activeRole, setActiveRole] = useState<ActiveRole>("all");
  const [selected, setSelected] = useState<ChampionRoleRanking | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const mobile = useSyncExternalStore(subscribeToMobile, isMobile, serverMobileSnapshot);

  const selectRole = (role: RoleKey) => {
    setActiveRole(role);
    setSelected(getQuickPick(role));
    setMobileDetailOpen(false);
  };

  const activateTab = (role: ActiveRole) => {
    if (role === "all") {
      setActiveRole("all");
      setSelected(null);
      setMobileDetailOpen(false);
      return;
    }
    selectRole(role);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % roleTabs.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + roleTabs.length) % roleTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = roleTabs.length - 1;
    else return;

    event.preventDefault();
    const nextRole = roleTabs[nextIndex]!.key;
    activateTab(nextRole);
    requestAnimationFrame(() => {
      document.getElementById(`wild-rift-role-tab-${nextRole}`)?.focus();
    });
  };

  const selectRanking = (ranking: ChampionRoleRanking, openMobile = true) => {
    setSelected(ranking);
    if (mobile && openMobile) setMobileDetailOpen(true);
  };

  const selectQuickPick = (role: RoleKey, championId: string) => {
    const ranking = getRanking(championId, role);
    if (!ranking) return;
    setActiveRole(role);
    setSelected(ranking);
    if (mobile) setMobileDetailOpen(true);
  };

  return (
    <div className={styles.workspaceShell}>
      <QuickPicks onPick={selectQuickPick} />

      <section
        className={styles.roleNavigation}
        data-ia-section="role-navigation"
        aria-labelledby="role-navigation-heading"
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>Ranked roles</span>
            <h2 id="role-navigation-heading">Choose a Role</h2>
          </div>
          <p>All Roles is an overview. Each lane below opens its own Champion × Role tier list.</p>
        </div>
        <div className={styles.roleTabs} role="tablist" aria-label="Wild Rift role rankings">
          {roleTabs.map((tab, index) => (
            <button
              key={tab.key}
              id={`wild-rift-role-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={activeRole === tab.key}
              aria-controls="wild-rift-role-panel"
              tabIndex={activeRole === tab.key ? 0 : -1}
              onClick={() => activateTab(tab.key)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <strong>{tab.label}</strong>
              {tab.auxiliary && <small>{tab.auxiliary}</small>}
            </button>
          ))}
        </div>
      </section>

      <div
        id="wild-rift-role-panel"
        role="tabpanel"
        aria-labelledby={`wild-rift-role-tab-${activeRole}`}
        className={styles.rolePanel}
      >
        {activeRole === "all" ? (
          <AllRolesOverview onViewRole={selectRole} />
        ) : (
          <RoleTierBoard
            key={activeRole}
            role={activeRole}
            selected={selected?.role === activeRole ? selected : null}
            onSelect={(ranking) => selectRanking(ranking)}
          />
        )}
      </div>

      {activeRole !== "all" && <QuickInsights role={activeRole} />}
      <WhatChanged role={activeRole} />

      {mobile && selected && mobileDetailOpen && (
        <MobileDetail
          ranking={selected}
          onClose={() => {
            setMobileDetailOpen(false);
          }}
        />
      )}
    </div>
  );
}
