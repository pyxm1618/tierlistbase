"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  championForId,
  changes,
  otherViableRoles,
  quickInsights,
  quickPickChampionIds,
  rankingFor,
  rankingsForRole,
  roleAliases,
  roleKeys,
  roleLabels,
  snapshot,
  tierDefinitions,
  tiers,
  type ChampionRoleRanking,
  type RoleKey,
  type Tier,
} from "./data";
import styles from "./wild-rift-tier-list.module.css";

type RoleView = "all" | RoleKey;
type TierFilter = "All" | Tier;

const views: readonly RoleView[] = ["all", ...roleKeys];

function subscribeToMobile(callback: () => void) {
  const media = window.matchMedia("(max-width: 899px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function isMobile() {
  return window.matchMedia("(max-width: 899px)").matches;
}

function serverMobileSnapshot() {
  return false;
}

function trendLabel(ranking: ChampionRoleRanking) {
  if (ranking.trend === "up") return "↑";
  if (ranking.trend === "down") return "↓";
  if (ranking.trend === "flat") return "→";
  return "—";
}

function ChampionPortrait({
  championId,
  sizes,
  priority = false,
}: {
  championId: string;
  sizes: string;
  priority?: boolean;
}) {
  const champion = championForId(championId);
  return (
    <Image
      src={champion.portrait}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      className={styles.portraitImage}
    />
  );
}

function Metric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong data-emphasis={emphasis}>{value}</strong>
    </div>
  );
}

function ChampionDetail({
  ranking,
  onRoleChange,
  titleId,
}: {
  ranking: ChampionRoleRanking;
  onRoleChange: (role: RoleKey, championId: string) => void;
  titleId: string;
}) {
  const champion = championForId(ranking.championId);
  const otherRoles = otherViableRoles(ranking.championId, ranking.role);
  const signals = [
    ["Solo Queue Reliability", ranking.decisionSignals.soloQueueReliability],
    ["Blind Pick Safety", ranking.decisionSignals.blindPickSafety],
    ["Ease of Execution", ranking.decisionSignals.easeOfExecution],
    ["Carry / Impact Potential", ranking.decisionSignals.carryImpactPotential],
    ["Team Dependence", ranking.decisionSignals.teamDependence],
  ] as const;

  return (
    <div className={styles.detailContent}>
      <div className={styles.detailHero}>
        <div className={styles.detailPortrait}>
          <ChampionPortrait championId={ranking.championId} sizes="96px" />
        </div>
        <div>
          <span className={styles.detailEyebrow}>{roleLabels[ranking.role]}</span>
          <h3 id={titleId}>{champion.name}</h3>
          <div className={styles.detailTierLine}>
            <span className={styles.tierBadge} data-tier={ranking.tier}>
              {ranking.tier}
            </span>
            <span>{roleAliases[ranking.role] ?? "Ranked"}</span>
          </div>
        </div>
      </div>

      <div className={styles.detailMetrics}>
        <Metric label="Win Rate" value={`${ranking.winRate.toFixed(1)}%`} emphasis />
        <Metric label="Pick Rate" value={`${ranking.pickRate.toFixed(1)}%`} />
        <Metric label="Ban Rate" value={`${ranking.banRate.toFixed(1)}%`} />
        <Metric label="Trend" value={trendLabel(ranking)} />
      </div>

      <section className={styles.detailSection}>
        <h4>Other Viable Roles</h4>
        {otherRoles.length ? (
          <div className={styles.otherRoles}>
            {otherRoles.map((other) => (
              <button
                key={other.role}
                type="button"
                onClick={() => onRoleChange(other.role, ranking.championId)}
              >
                <span>{roleLabels[other.role]}</span>
                <strong data-tier={other.tier}>{other.tier}</strong>
              </button>
            ))}
          </div>
        ) : (
          <p>No other reviewed role is included for this champion in the current snapshot.</p>
        )}
      </section>

      <section className={styles.detailSection}>
        <h4>Decision Signals</h4>
        <div className={styles.signals}>
          {signals.map(([label, level]) => (
            <div className={styles.signal} key={label}>
              <span>{label}</span>
              <span className={styles.signalBar} data-level={level} aria-hidden="true" />
              <strong>{level}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.detailSection}>
        <h4>Why This Tier</h4>
        <p>{ranking.whyThisTier}</p>
      </section>

      <div className={styles.proConGrid}>
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
        <h4>Recent Patch Impact</h4>
        <p>{ranking.patchImpact}</p>
      </section>
    </div>
  );
}

function MobileDetail({
  ranking,
  onClose,
  onRoleChange,
}: {
  ranking: ChampionRoleRanking;
  onClose: () => void;
  onRoleChange: (role: RoleKey, championId: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  const champion = championForId(ranking.championId);

  return (
    <dialog
      ref={ref}
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
        <button autoFocus type="button" aria-label="Close champion details" onClick={onClose}>
          ✕
        </button>
      </div>
      <ChampionDetail
        ranking={ranking}
        titleId="wild-rift-mobile-detail-title"
        onRoleChange={(role, championId) => {
          onClose();
          onRoleChange(role, championId);
        }}
      />
      <span className="sr-only">{champion.name}</span>
    </dialog>
  );
}

function QuickPicks({
  onPick,
}: {
  onPick: (role: RoleKey, championId: string) => void;
}) {
  return (
    <section className={styles.quickPicks} data-ia-section="quick-picks" aria-labelledby="quick-picks-title">
      <div className={styles.sectionTitleInline}>
        <h2 id="quick-picks-title">Quick Picks</h2>
        <p>Best current picks by role from the reviewed snapshot.</p>
      </div>
      <div className={styles.quickPickGrid}>
        {roleKeys.map((role) => {
          const championId = quickPickChampionIds[role];
          const champion = championForId(championId);
          const ranking = rankingFor(championId, role);
          if (!ranking) return null;
          return (
            <button
              className={styles.quickPick}
              type="button"
              key={role}
              onClick={() => onPick(role, championId)}
              aria-label={`${roleLabels[role]} quick pick: ${champion.name}, ${ranking.tier} tier`}
            >
              <span className={styles.quickPickRole}>{roleLabels[role]}</span>
              <span className={styles.quickPickPortrait}>
                <ChampionPortrait championId={championId} sizes="(max-width: 700px) 84px, 110px" />
              </span>
              <span className={styles.quickPickCopy}>
                <strong>{champion.name}</strong>
                <span className={styles.tierBadge} data-tier={ranking.tier}>
                  {ranking.tier}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RoleNavigation({
  active,
  onChange,
}: {
  active: RoleView;
  onChange: (role: RoleView) => void;
}) {
  return (
    <nav
      className={styles.roleNav}
      data-ia-section="role-navigation"
      role="tablist"
      aria-label="Wild Rift role rankings"
    >
      {views.map((view) => {
        const label = view === "all" ? "All Roles" : roleLabels[view];
        const alias = view === "all" ? null : roleAliases[view];
        return (
          <button
            key={view}
            role="tab"
            type="button"
            aria-selected={active === view}
            onClick={() => onChange(view)}
          >
            <strong>{label}</strong>
            {alias ? <span>{alias}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}

function AllRolesOverview({ onRoleChange }: { onRoleChange: (role: RoleKey) => void }) {
  const tierOrder = new Map(tiers.map((tier, index) => [tier, index]));
  return (
    <section
      className={styles.allRoles}
      data-ia-section="all-roles-overview"
      role="tabpanel"
      aria-label="All Roles Overview"
    >
      <div className={styles.workspaceHeading}>
        <div>
          <p className={styles.eyebrow}>Ranked · {snapshot.rankContext}</p>
          <h2>All Roles Overview</h2>
          <p>Role leaders only. This is an overview, not a sixth overall champion tier list.</p>
        </div>
      </div>
      <div className={styles.roleOverviewGrid}>
        {roleKeys.map((role) => {
          const top = [...rankingsForRole(role)]
            .sort(
              (a, b) =>
                (tierOrder.get(a.tier) ?? 99) - (tierOrder.get(b.tier) ?? 99) ||
                b.winRate - a.winRate,
            )
            .slice(0, 3);
          return (
            <article className={styles.roleOverviewCard} key={role}>
              <header>
                <div>
                  <h3>{roleLabels[role]}</h3>
                  {roleAliases[role] ? <p>{roleAliases[role]}</p> : null}
                </div>
                <button type="button" onClick={() => onRoleChange(role)}>
                  View {roleLabels[role]}
                </button>
              </header>
              <ol>
                {top.map((ranking) => {
                  const champion = championForId(ranking.championId);
                  return (
                    <li key={ranking.championId}>
                      <span className={styles.overviewPortrait}>
                        <ChampionPortrait championId={ranking.championId} sizes="42px" />
                      </span>
                      <span>
                        <strong>{champion.name}</strong>
                        <small>{ranking.winRate.toFixed(1)}% WR</small>
                      </span>
                      <span className={styles.tierBadge} data-tier={ranking.tier}>
                        {ranking.tier}
                      </span>
                      <span className={styles.trend} data-trend={ranking.trend}>
                        {trendLabel(ranking)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TierBoard({
  role,
  selectedChampionId,
  onSelect,
}: {
  role: RoleKey;
  selectedChampionId: string;
  onSelect: (championId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<TierFilter>("All");
  const rankings = rankingsForRole(role);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("en-US");
    return rankings.filter((ranking) => {
      const champion = championForId(ranking.championId);
      return (
        champion.name.toLocaleLowerCase("en-US").includes(query) &&
        (tier === "All" || ranking.tier === tier)
      );
    });
  }, [rankings, search, tier]);

  return (
    <section className={styles.tierBoard} aria-labelledby={`${role}-tier-list-heading`}>
      <div className={styles.workspaceHeading}>
        <div>
          <p className={styles.eyebrow}>
            Ranked · {snapshot.rankContext} · Latest Ranked Balance {snapshot.latestRankedBalance}
          </p>
          <h2 id={`${role}-tier-list-heading`}>{roleLabels[role]} Tier List</h2>
        </div>
        <span>{rankings.length} reviewed picks</span>
      </div>

      <div className={styles.filters} data-ia-section="wild-rift-filters">
        <label className={styles.searchField}>
          <span>Search Champions</span>
          <input
            type="search"
            value={search}
            placeholder="Search champions…"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          <span>Rank Context</span>
          <select aria-label="Rank Context" value={snapshot.rankContext} disabled>
            <option>{snapshot.rankContext}</option>
          </select>
        </label>
        <label>
          <span>Tier</span>
          <select
            aria-label="Tier"
            value={tier}
            onChange={(event) => setTier(event.target.value as TierFilter)}
          >
            <option>All</option>
            {tiers.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <button
          className={styles.resetButton}
          type="button"
          onClick={() => {
            setSearch("");
            setTier("All");
          }}
        >
          Reset
        </button>
      </div>

      <p className={styles.results} role="status">
        {filtered.length
          ? `${filtered.length} champion-role placements shown`
          : "No champions match these filters."}
      </p>

      <div className={styles.tierRows}>
        {tiers.map((tierName) => {
          const inTier = filtered.filter((ranking) => ranking.tier === tierName);
          return (
            <section className={styles.tierRow} data-tier={tierName} key={tierName}>
              <div className={styles.tierLabel}>
                <strong>{tierName}</strong>
                <p>{tierDefinitions[tierName]}</p>
              </div>
              <div className={styles.championGrid}>
                {inTier.map((ranking) => {
                  const champion = championForId(ranking.championId);
                  return (
                    <button
                      className={styles.championCard}
                      type="button"
                      key={ranking.championId}
                      data-selected={selectedChampionId === ranking.championId}
                      aria-pressed={selectedChampionId === ranking.championId}
                      aria-label={`${champion.name}, ${ranking.tier} tier, ${roleLabels[role]}, ${ranking.winRate.toFixed(
                        1,
                      )}% win rate, ${ranking.pickRate.toFixed(
                        1,
                      )}% pick rate, ${ranking.banRate.toFixed(1)}% ban rate`}
                      onClick={() => onSelect(ranking.championId)}
                    >
                      <span className={styles.cardPortrait}>
                        <ChampionPortrait championId={ranking.championId} sizes="72px" />
                      </span>
                      <span className={styles.cardBody}>
                        <span className={styles.cardHeader}>
                          <strong>{champion.name}</strong>
                          <span className={styles.trend} data-trend={ranking.trend}>
                            {trendLabel(ranking)}
                          </span>
                        </span>
                        <span className={styles.cardPrimaryMetric}>
                          {ranking.winRate.toFixed(1)} <small>WR</small>
                        </span>
                        <span className={styles.cardSecondaryMetrics}>
                          {ranking.pickRate.toFixed(1)} PR · {ranking.banRate.toFixed(1)} BR
                        </span>
                      </span>
                    </button>
                  );
                })}
                {!inTier.length ? <p className={styles.emptyTier}>No matching champions</p> : null}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function QuickInsights({ role }: { role: RoleView }) {
  if (role === "all") {
    return (
      <section className={styles.insights} data-ia-section="quick-insights" aria-labelledby="insights-title">
        <div className={styles.sectionTitleInline}>
          <h2 id="insights-title">Quick Insights</h2>
          <p>Select a role to see its Blind Pick, Easy Climb, Draft Priority, and Biggest Riser.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.insights} data-ia-section="quick-insights" aria-labelledby="insights-title">
      <div className={styles.sectionTitleInline}>
        <h2 id="insights-title">Quick Insights</h2>
        <p>Key takeaways for {roleLabels[role]} in the current Ranked snapshot.</p>
      </div>
      <div className={styles.insightGrid}>
        {quickInsights[role].map((insight) => {
          const ranking = rankingFor(insight.championId, role);
          if (!ranking) return null;
          const champion = championForId(insight.championId);
          return (
            <article key={insight.label}>
              <span className={styles.insightPortrait}>
                <ChampionPortrait championId={insight.championId} sizes="58px" />
              </span>
              <div>
                <span>{insight.label}</span>
                <strong>{champion.name}</strong>
                <p>{insight.reason}</p>
              </div>
              <span className={styles.tierBadge} data-tier={ranking.tier}>
                {ranking.tier}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function WhatChanged({ role }: { role: RoleView }) {
  const visible = role === "all" ? changes.slice(0, 6) : changes.filter((change) => change.role === role);
  return (
    <section className={styles.changed} data-ia-section="what-changed" aria-labelledby="changed-title">
      <div className={styles.changedHeader}>
        <div>
          <h2 id="changed-title">What Changed</h2>
          <p>Reviewed tier movement within the current patch cycle.</p>
        </div>
        <div>
          <strong>Latest Ranked Balance: {snapshot.latestRankedBalance}</strong>
          <span>7.3c is AAA ARAM-only and does not directly change this Ranked context.</span>
        </div>
      </div>
      {visible.length ? (
        <div className={styles.changeGrid}>
          {visible.map((change) => {
            const champion = championForId(change.championId);
            return (
              <article key={`${change.role}-${change.championId}-${change.date}`}>
                <span className={styles.changePortrait}>
                  <ChampionPortrait championId={change.championId} sizes="54px" />
                </span>
                <div>
                  <strong>{champion.name}</strong>
                  <span>
                    {roleLabels[change.role]} · {change.from} → {change.to}
                  </span>
                  <p>{change.reason}</p>
                </div>
                <span className={styles.changeType}>{change.type}</span>
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.noChanges}>No dated reviewed tier movement is recorded for this role.</p>
      )}
    </section>
  );
}

function WorkspaceShell({
  role,
  selectedChampionId,
  onSelect,
  onRoleChange,
  mobile,
}: {
  role: RoleKey;
  selectedChampionId: string;
  onSelect: (championId: string) => void;
  onRoleChange: (role: RoleKey, championId?: string) => void;
  mobile: boolean;
}) {
  const ranking =
    rankingFor(selectedChampionId, role) ??
    rankingFor(quickPickChampionIds[role], role) ??
    rankingsForRole(role)[0];

  if (!ranking) return null;

  return (
    <section
      className={styles.workspace}
      data-ia-section="role-tier-workspace"
      role="tabpanel"
      aria-label={`${roleLabels[role]} Tier List workspace`}
    >
      <TierBoard role={role} selectedChampionId={ranking.championId} onSelect={onSelect} />
      <aside className={styles.detailPanel} aria-label="Champion Detail">
        {!mobile ? (
          <ChampionDetail
            ranking={ranking}
            titleId="wild-rift-desktop-detail-title"
            onRoleChange={(nextRole, championId) => onRoleChange(nextRole, championId)}
          />
        ) : (
          <div className={styles.mobileDetailHint}>
            <strong>Champion Detail</strong>
            <p>Select a champion to open the full detail drawer.</p>
          </div>
        )}
      </aside>
    </section>
  );
}

export function WildRiftWorkspace() {
  const [role, setRole] = useState<RoleView>("all");
  const [selectedChampionId, setSelectedChampionId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobile = useSyncExternalStore(subscribeToMobile, isMobile, serverMobileSnapshot);

  function activateRole(nextRole: RoleKey, championId?: string) {
    const nextChampion = championId ?? quickPickChampionIds[nextRole];
    setRole(nextRole);
    setSelectedChampionId(nextChampion);
    setMobileOpen(false);
  }

  function selectChampion(championId: string) {
    setSelectedChampionId(championId);
    if (mobile) setMobileOpen(true);
  }

  const selectedRanking =
    role === "all" || !selectedChampionId ? undefined : rankingFor(selectedChampionId, role);

  return (
    <>
      <QuickPicks onPick={activateRole} />
      <RoleNavigation
        active={role}
        onChange={(nextRole) => {
          if (nextRole === "all") {
            setRole("all");
            setSelectedChampionId("");
            setMobileOpen(false);
          } else {
            activateRole(nextRole);
          }
        }}
      />
      {role === "all" ? (
        <AllRolesOverview onRoleChange={activateRole} />
      ) : (
        <WorkspaceShell
          role={role}
          selectedChampionId={selectedChampionId || quickPickChampionIds[role]}
          onSelect={selectChampion}
          onRoleChange={activateRole}
          mobile={mobile}
        />
      )}
      <QuickInsights role={role} />
      <WhatChanged role={role} />
      {mobileOpen && selectedRanking ? (
        <MobileDetail
          ranking={selectedRanking}
          onClose={() => setMobileOpen(false)}
          onRoleChange={activateRole}
        />
      ) : null}
    </>
  );
}

export function WildRiftSectionBoundary({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
