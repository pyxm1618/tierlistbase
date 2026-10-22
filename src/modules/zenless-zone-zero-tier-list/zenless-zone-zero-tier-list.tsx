"use client";

import Image from "next/image";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";

import {
  agentRankingViews,
  agents,
  filterOptions,
  pullAdvices,
  teamRankingViews,
  teams,
  type Agent,
  type AgentRankingView,
  type PullAdvice,
  type Team,
  type TeamRankingView,
  type Tier,
} from "./data";
import agentDetailMiyabi from "./assets/agent-detail-miyabi.webp";
import heroArtwork from "./assets/hero.webp";
import teamMiyabiFreeze from "./assets/team-miyabi-freeze.webp";
import { agentIcons, bangbooIcons } from "./icons";
import styles from "./zenless-zone-zero-tier-list.module.css";

const tiers: readonly Tier[] = ["S+", "S", "A", "B"];

type PrimarySection = "agents" | "teams" | "pull";
type AgentDetailTab = "build" | "teams" | "details";
type TeamDetailTab =
  | "overview"
  | "composition"
  | "alternatives"
  | "bangboo"
  | "performance"
  | "details";
type PullDetailTab = "overview" | "decision" | "teams" | "investment" | "alternatives" | "summary";

function rankOrder(tier: Tier) {
  return tiers.indexOf(tier);
}

function Metric({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className={styles.metric} data-label={label}>
      <span>{label}</span>
      <strong data-strong={strong} data-value={typeof value === "string" ? value : undefined}>
        {value}
      </strong>
    </div>
  );
}

function Pills({ items }: { items: readonly string[] }) {
  return (
    <span className={styles.pills}>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </span>
  );
}

function MissingArtwork({ kind }: { kind: "hero" | "portrait" | "team" | "item" }) {
  return (
    <span
      className={styles.missingArtwork}
      data-kind={kind}
      data-asset-pending="true"
      aria-hidden="true"
    />
  );
}

function AgentPortrait({ name, sizes }: { name: string; sizes: string }) {
  const agent = agents.find((candidate) => candidate.name === name);
  const icon = agentIcons[agent?.id ?? ""];
  return icon ? (
    <Image src={icon} alt={name} fill sizes={sizes} className={styles.iconImage} />
  ) : (
    <MissingArtwork kind="portrait" />
  );
}

function BangbooIcons({ names }: { names: string }) {
  return names.split("/").map((name) => {
    const label = name.trim();
    const icon = bangbooIcons[label];
    return icon ? (
      <Image
        key={label}
        src={icon}
        alt={label}
        width={35}
        height={35}
        sizes="35px"
        className={styles.bangbooIcon}
      />
    ) : (
      <MissingArtwork key={label} kind="item" />
    );
  });
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.selectFilter}>
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? label : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <span className={styles.sectionIcon} aria-hidden="true">
          ✦
        </span>
        <div>
          {eyebrow ? <p>{eyebrow}</p> : null}
          <h2>{title}</h2>
          <span>{description}</span>
        </div>
      </div>
      {action}
    </div>
  );
}

function AgentCard({
  agent,
  selected,
  tier,
  onSelect,
}: {
  agent: Agent;
  selected: boolean;
  tier: Tier;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.agentCard}
      data-selected={selected}
      data-tier={tier}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${agent.name}, ${tier} tier, ${agent.combatRole}`}
    >
      <span className={styles.agentPortrait}>
        <AgentPortrait name={agent.name} sizes="48px" />
      </span>
      <span className={styles.agentCardName}>{agent.name}</span>
      <span className={styles.agentCardRank}>{agent.rarity === "S-Rank" ? "S" : "A"}</span>
    </button>
  );
}

function AgentDetail({
  agent,
  tab,
  onTabChange,
}: {
  agent: Agent;
  tab: AgentDetailTab;
  onTabChange: (tab: AgentDetailTab) => void;
}) {
  return (
    <aside className={styles.agentDetail} aria-label="Agent Detail">
      <div className={styles.agentDetailHero}>
        <span className={styles.detailTier} data-tier={agent.tier}>
          {agent.tier}
        </span>
        <div className={styles.agentDetailPortrait}>
          <AgentPortrait name={agent.name} sizes="(max-width: 760px) 58px, 72px" />
        </div>
        <div className={styles.agentIdentity}>
          <div>
            <h3>{agent.name}</h3>
            <p>{agent.faction}</p>
            <Pills items={[agent.combatRole, agent.specialty, agent.attribute, agent.rarity]} />
          </div>
        </div>
        <div className={styles.agentHeroArt}>
          {agent.id === "miyabi" ? (
            <Image
              src={agentDetailMiyabi}
              alt=""
              sizes="(max-width: 1080px) 100vw, 420px"
              className={styles.agentDetailArtwork}
            />
          ) : (
            <MissingArtwork kind="hero" />
          )}
        </div>
      </div>

      <div className={styles.agentDetailGrid}>
        <section className={styles.detailCard}>
          <h4>Ratings</h4>
          <Metric label="Overall Rating" value={agent.overallRating} strong />
          <Metric label="New Player Value" value={agent.newPlayerValue} />
          <Metric label="Investment Level" value={agent.investmentLevel} />
          <Metric label="Team Flexibility" value={agent.teamFlexibility} />
          <Metric label="Signature Dependency" value={agent.signatureDependency} />
        </section>
        <section className={styles.detailCard}>
          <h4>Endgame Performance</h4>
          <Metric label="Shiyu Defense" value={agent.shiyuDefense} strong />
          <Metric label="Deadly Assault" value={agent.deadlyAssault} />
          <div className={styles.cycleSuitability}>
            <span>Current Cycle Suitability</span>
            <strong>{agent.currentCycleSuitability}</strong>
          </div>
        </section>
      </div>

      <div className={styles.proConGrid}>
        <section>
          <h4 className={styles.positive}>Key Strengths</h4>
          <ul>
            {agent.keyStrengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className={styles.negative}>Key Limitations</h4>
          <ul>
            {agent.keyLimitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className={styles.detailTabs} role="tablist" aria-label="Agent detail tabs">
        {[
          ["build", "Build & Equipment"],
          ["teams", "Best Teams"],
          ["details", "Details"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => onTabChange(value as AgentDetailTab)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "build" ? (
        <div className={styles.equipmentGrid}>
          <section>
            <span>Best W-Engine</span>
            <div className={styles.itemLine}>
              <MissingArtwork kind="item" />
              <strong>{agent.bestWEngine}</strong>
            </div>
          </section>
          <section>
            <span>Best Alternative</span>
            <div className={styles.itemLine}>
              <MissingArtwork kind="item" />
              <strong>{agent.bestAlternative}</strong>
            </div>
          </section>
          <section>
            <span>Best F2P Option</span>
            <div className={styles.itemLine}>
              <MissingArtwork kind="item" />
              <strong>{agent.bestF2pOption}</strong>
            </div>
          </section>
          <section>
            <span>Best Drive Disc</span>
            <strong>{agent.bestDriveDisc}</strong>
          </section>
          <section>
            <span>Main Stats</span>
            <ul>
              {agent.mainStats.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <span>Important Substats</span>
            <ul>
              {agent.importantSubstats.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === "teams" ? (
        <div className={styles.textPanel}>
          <h4>Best Teams</h4>
          <Pills items={agent.bestTeams} />
        </div>
      ) : null}

      {tab === "details" ? (
        <div className={styles.textPanel}>
          <h4>Agent Detail</h4>
          <p>
            This mock detail state keeps the frozen decision fields visible without asserting live
            ZZZ meta accuracy. Production ranking evidence will be handled in the later data phase.
          </p>
        </div>
      ) : null}
    </aside>
  );
}

function TeamCard({
  team,
  tier,
  selected,
  onSelect,
}: {
  team: Team;
  tier: Tier;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.teamCard}
      data-selected={selected}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={styles.teamCardTier} data-tier={tier}>
        {tier}
      </span>
      <span className={styles.teamBackdrop}>
        {team.id === "miyabi-freeze" ? (
          <Image
            src={teamMiyabiFreeze}
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 520px"
            className={styles.teamCardArtwork}
          />
        ) : (
          <MissingArtwork kind="team" />
        )}
      </span>
      <span className={styles.teamCardBody}>
        <strong>{team.name}</strong>
        <Pills items={team.tags} />
        <span className={styles.teamMembers}>
          {team.compositions[0]?.members.map((member) => member.name).join(" · ")}
        </span>
        <span className={styles.teamMetrics}>
          <span>Shiyu {team.shiyuDefense.split(" · ")[0]}</span>
          <span>Assault {team.deadlyAssault.split(" · ")[0]}</span>
          <span>{team.investmentLevel} investment</span>
        </span>
        <span className={styles.teamBestFor}>Best for: {team.bestFor.join(" · ")}</span>
      </span>
    </button>
  );
}

function TeamDetail({
  team,
  tab,
  onTabChange,
  onClose,
}: {
  team: Team;
  tab: TeamDetailTab;
  onTabChange: (tab: TeamDetailTab) => void;
  onClose: () => void;
}) {
  const [best, alternative, budget] = team.compositions;
  return (
    <section className={styles.largeDetailPanel} aria-label="Team Detail">
      <div className={styles.detailPanelHeader} data-detail-kind="team">
        <span className={styles.detailHeaderBackdrop} aria-hidden="true">
          {team.id === "miyabi-freeze" ? (
            <Image
              src={teamMiyabiFreeze}
              alt=""
              fill
              sizes="(max-width: 1080px) 100vw, 700px"
              className={styles.teamDetailArtwork}
            />
          ) : (
            <MissingArtwork kind="team" />
          )}
        </span>
        <div>
          <p>Team Detail</p>
          <div className={styles.detailPanelTitle}>
            <span className={styles.detailTier} data-tier={team.tier}>
              {team.tier}
            </span>
            <h3>{team.name}</h3>
          </div>
          <Pills items={team.tags} />
        </div>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close Team Detail"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className={styles.detailTabs} role="tablist" aria-label="Team detail tabs">
        {[
          ["overview", "Overview"],
          ["composition", "Team Comp"],
          ["alternatives", "Alternatives"],
          ["bangboo", "Bangboo"],
          ["performance", "Performance"],
          ["details", "Details"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => onTabChange(value as TeamDetailTab)}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === "overview" || tab === "composition" || tab === "alternatives") && (
        <>
          <h4 className={styles.subheading}>Team Compositions</h4>
          <div className={styles.compositionGrid}>
            {[best, alternative, budget].map((composition, index) =>
              composition ? (
                <section key={composition.label} data-variant={index}>
                  <div>
                    <strong>{composition.label}</strong>
                    <span>{composition.subtitle}</span>
                  </div>
                  <div className={styles.compositionMembers}>
                    {composition.members.map((member) => (
                      <div key={member.name}>
                        <span className={styles.memberPortrait}>
                          <AgentPortrait name={member.name} sizes="48px" />
                        </span>
                        <strong>{member.name}</strong>
                        <small>{member.role}</small>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null,
            )}
          </div>
        </>
      )}

      {(tab === "overview" || tab === "details") && (
        <>
          <h4 className={styles.subheading}>Team Info</h4>
          <div className={styles.teamInfoGrid}>
            <Metric label="Team Archetype" value={team.teamArchetype} />
            <Metric label="Main Damage / Combat Concept" value={team.mainDamageConcept} />
            <Metric label="Investment Level" value={team.investmentLevel} />
            <Metric label="Team Cost" value={team.teamCost} />
            <Metric label="Best For" value={team.bestFor.join(" · ")} />
          </div>
        </>
      )}

      {(tab === "overview" || tab === "bangboo") && (
        <>
          <h4 className={styles.subheading}>Bangboo Recommendation</h4>
          <div className={styles.bangbooGrid}>
            <section>
              <span>Best Bangboo</span>
              <div className={styles.itemLine}>
                <BangbooIcons names={team.bestBangboo} />
                <strong>{team.bestBangboo}</strong>
              </div>
            </section>
            <section>
              <span>Alternative Bangboo</span>
              <div className={styles.itemLine}>
                <BangbooIcons names={team.alternativeBangboo} />
                <strong>{team.alternativeBangboo}</strong>
              </div>
            </section>
            <section>
              <span>Activation Requirement</span>
              <ul>
                {team.activationRequirement.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}

      {(tab === "overview" || tab === "performance") && (
        <>
          <h4 className={styles.subheading}>Performance</h4>
          <div className={styles.performanceGrid}>
            <Metric label="Shiyu Defense" value={team.shiyuDefense} strong />
            <Metric label="Deadly Assault" value={team.deadlyAssault} strong />
            <Metric
              label="Current Cycle / Matchup Suitability"
              value={team.currentCycleSuitability}
            />
          </div>
        </>
      )}
    </section>
  );
}

function PullAdviceDetail({
  advice,
  tab,
  onTabChange,
  onClose,
}: {
  advice: PullAdvice;
  tab: PullDetailTab;
  onTabChange: (tab: PullDetailTab) => void;
  onClose: () => void;
}) {
  return (
    <section className={styles.largeDetailPanel} aria-label="Pull Advice Detail">
      <div className={styles.detailPanelHeader}>
        <div>
          <p>Pull Advice Detail</p>
          <div className={styles.pullDetailIdentity}>
            <span className={styles.pullPortrait}>
              <AgentPortrait name={advice.name} sizes="64px" />
              <span className={styles.pullRankBadge}>S</span>
            </span>
            <div>
              <h3>{advice.name}</h3>
              <Pills items={[advice.bannerStatus, advice.role, advice.style]} />
              <span>{advice.dateLabel}</span>
            </div>
          </div>
        </div>
        <div className={styles.pullHeaderActions}>
          <div className={styles.pullScoreGrid}>
            <Metric label="Pull Value" value={advice.pullValue} strong />
            <Metric label="F2P Friendliness" value={advice.f2pFriendliness} />
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close Pull Advice Detail"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>

      <div className={styles.detailTabs} role="tablist" aria-label="Pull Advice detail tabs">
        {[
          ["overview", "Overview"],
          ["decision", "Pull Decision"],
          ["teams", "Teams & Synergy"],
          ["investment", "Investment"],
          ["alternatives", "Alternatives"],
          ["summary", "Summary"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => onTabChange(value as PullDetailTab)}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === "overview" || tab === "decision") && (
        <div className={styles.pullDecisionGrid}>
          <section data-tone="positive">
            <h4>Pull If</h4>
            <ul>
              {advice.pullIf.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section data-tone="caution">
            <h4>Lower Priority / Skip If</h4>
            <ul>
              {advice.lowerPriorityIf.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section data-tone="account">
            <h4>Best For Which Accounts</h4>
            <ul>
              {advice.bestForAccounts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {(tab === "overview" || tab === "decision" || tab === "teams") && (
        <div className={styles.pullImpactGrid}>
          <section>
            <span>Which Teams It Improves</span>
            <Pills items={advice.improvesTeams} />
          </section>
          <section>
            <span>Enables New Team Core</span>
            <strong>{advice.enablesNewTeamCore}</strong>
          </section>
          <section>
            <span>Team Cost</span>
            <strong>{advice.teamCost}</strong>
          </section>
        </div>
      )}

      {(tab === "overview" || tab === "investment") && (
        <div className={styles.pullImpactGrid}>
          <section>
            <span>Investment</span>
            <strong>{advice.investment}</strong>
          </section>
          <section>
            <span>Signature W-Engine Importance</span>
            <strong>{advice.signatureImportance}</strong>
          </section>
        </div>
      )}

      {(tab === "overview" || tab === "alternatives") && (
        <div className={styles.textPanel}>
          <h4>Alternatives</h4>
          <ul>
            {advice.alternatives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {tab === "summary" ? (
        <div className={styles.textPanel}>
          <h4>Account Decision Summary</h4>
          <p>
            Pull Value {advice.pullValue}; F2P friendliness {advice.f2pFriendliness}; team cost{" "}
            {advice.teamCost}; investment {advice.investment}.
          </p>
        </div>
      ) : null}
    </section>
  );
}

export function ZenlessZoneZeroTierList() {
  const [primarySection, setPrimarySection] = useState<PrimarySection>("agents");
  const [agentView, setAgentView] = useState<AgentRankingView>("Overall");
  const [teamView, setTeamView] = useState<TeamRankingView>("Overall");
  const [search, setSearch] = useState("");
  const [combatRole, setCombatRole] = useState("All");
  const [specialty, setSpecialty] = useState("All");
  const [attribute, setAttribute] = useState("All");
  const [faction, setFaction] = useState("All");
  const [rarity, setRarity] = useState("All");
  const [selectedAgentId, setSelectedAgentId] = useState("miyabi");
  const [selectedTeamId, setSelectedTeamId] = useState("miyabi-freeze");
  const [selectedPullId, setSelectedPullId] = useState("miyabi-pull");
  const [agentDetailTab, setAgentDetailTab] = useState<AgentDetailTab>("build");
  const [teamDetailTab, setTeamDetailTab] = useState<TeamDetailTab>("overview");
  const [pullDetailTab, setPullDetailTab] = useState<PullDetailTab>("decision");
  const [teamDetailOpen, setTeamDetailOpen] = useState(true);
  const [pullDetailOpen, setPullDetailOpen] = useState(true);

  const filteredAgents = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return agents
      .filter(
        (agent) =>
          agent.name.toLowerCase().includes(normalized) &&
          (combatRole === "All" || agent.combatRole === combatRole) &&
          (specialty === "All" || agent.specialty === specialty) &&
          (attribute === "All" || agent.attribute === attribute) &&
          (faction === "All" || agent.faction === faction) &&
          (rarity === "All" || agent.rarity === rarity),
      )
      .sort(
        (left, right) =>
          rankOrder(left.viewTiers[agentView]) - rankOrder(right.viewTiers[agentView]) ||
          left.name.localeCompare(right.name),
      );
  }, [agentView, attribute, combatRole, faction, rarity, search, specialty]);

  const rankedTeams = useMemo(
    () =>
      [...teams].sort(
        (left, right) =>
          rankOrder(left.viewTiers[teamView]) - rankOrder(right.viewTiers[teamView]) ||
          left.name.localeCompare(right.name),
      ),
    [teamView],
  );

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0];
  const selectedPull = pullAdvices.find((advice) => advice.id === selectedPullId) ?? pullAdvices[0];

  if (!selectedAgent || !selectedTeam || !selectedPull) return null;

  const activatePrimarySection = (section: PrimarySection) => {
    setPrimarySection(section);

    if (section === "agents") {
      setTeamDetailOpen(true);
      setPullDetailOpen(true);
      return;
    }

    if (section === "teams") {
      setTeamDetailOpen(true);
      setPullDetailOpen(false);
      return;
    }

    setTeamDetailOpen(false);
    setPullDetailOpen(true);
  };

  const resetFilters = () => {
    setCombatRole("All");
    setSpecialty("All");
    setAttribute("All");
    setFaction("All");
    setRarity("All");
    setSearch("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageFrame}>
        <aside className={styles.sideRail} aria-label="Zenless Zone Zero sections">
          <button
            type="button"
            className={styles.sideRailTitle}
            onClick={() => activatePrimarySection("agents")}
          >
            <span aria-hidden="true">▣</span> ZZZ Tier List
          </button>
          <button
            type="button"
            data-active={primarySection === "agents"}
            onClick={() => activatePrimarySection("agents")}
          >
            <span>◉</span> Agents
          </button>
          <button
            type="button"
            data-active={primarySection === "teams"}
            onClick={() => activatePrimarySection("teams")}
          >
            <span>♟</span> Teams
          </button>
          <button
            type="button"
            data-active={primarySection === "pull"}
            onClick={() => activatePrimarySection("pull")}
          >
            <span>✦</span> Pull Advice
          </button>
          <div className={styles.sideDivider} />
          <p>Related</p>
          <span>▤ Guides</span>
          <span>⌘ Builds</span>
          <span>▦ News</span>
          <span>◈ Tools</span>
          <div className={styles.sideGraffiti} aria-hidden="true">
            WELCOME
            <br />
            TO NEW
            <br />
            ERIDU
          </div>
        </aside>

        <main className={styles.content}>
          <section className={styles.hero}>
            <Image
              src={heroArtwork}
              alt=""
              fill
              priority
              sizes="(max-width: 1080px) 100vw, 1420px"
              className={styles.heroBackground}
            />
            <div className={styles.heroShade} aria-hidden="true" />
            <div className={styles.heroCopy}>
              <p>ZENLESS ZONE ZERO</p>
              <h1>
                TIER <em>LIST</em>
              </h1>
              <strong>Build better teams. Make smarter pulls.</strong>
              <span>
                Find out who to build, what teams to play, and who to pull in Zenless Zone Zero.
              </span>
            </div>
            <div className={styles.heroArt}>
              <span className={styles.heroSticker}>ZENLESS ZONE ZERO</span>
            </div>
          </section>

          <section className={styles.pullSummary} aria-label="Current Pull Advice">
            <div className={styles.pullSummaryHeader}>
              <div className={styles.pullSummaryTitle}>
                <span aria-hidden="true">✦</span>
                <strong>Current Pull Advice</strong>
              </div>
              <span className={styles.pullSummaryDescription}>
                Based on current and upcoming banners. Get personalized pull recommendations.
              </span>
              <span className={styles.smallAction}>View All Patches →</span>
            </div>
            <div className={styles.pullSummaryGrid}>
              {pullAdvices.map((advice) => (
                <button
                  type="button"
                  key={advice.id}
                  className={styles.pullSummaryCard}
                  data-selected={selectedPullId === advice.id}
                  onClick={() => {
                    setSelectedPullId(advice.id);
                    setPullDetailTab("decision");
                    setPullDetailOpen(true);
                  }}
                >
                  <span
                    className={styles.bannerBadge}
                    data-upcoming={advice.bannerStatus === "Upcoming"}
                  >
                    {advice.bannerStatus}
                  </span>
                  <span className={styles.pullPortrait}>
                    <AgentPortrait name={advice.name} sizes="80px" />
                    <span className={styles.pullRankBadge}>S</span>
                  </span>
                  <span className={styles.pullSummaryCopy}>
                    <strong>{advice.name}</strong>
                    <small>{advice.subtitle}</small>
                    <span className={styles.pullBulletList}>
                      {advice.summaryBullets.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </span>
                    <small className={styles.pullDate}>{advice.dateLabel}</small>
                  </span>
                  <span
                    className={styles.pullCardAction}
                    data-upcoming={advice.bannerStatus === "Upcoming"}
                  >
                    {advice.bannerStatus === "Upcoming" ? "View Details →" : "View Pull Advice →"}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <nav
            className={styles.primaryTabs}
            role="tablist"
            aria-label="Tier list primary sections"
          >
            <button
              type="button"
              role="tab"
              aria-selected={primarySection === "agents"}
              data-active={primarySection === "agents"}
              onClick={() => activatePrimarySection("agents")}
            >
              <span className={styles.primaryTabIcon} aria-hidden="true">
                ◉
              </span>
              <span className={styles.primaryTabCopy}>
                <strong>Agents</strong>
                <span>Who should I build?</span>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={primarySection === "teams"}
              data-active={primarySection === "teams"}
              onClick={() => activatePrimarySection("teams")}
            >
              <span className={styles.primaryTabIcon} aria-hidden="true">
                ⛭
              </span>
              <span className={styles.primaryTabCopy}>
                <strong>Teams</strong>
                <span>What team should I build?</span>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={primarySection === "pull"}
              data-active={primarySection === "pull"}
              onClick={() => activatePrimarySection("pull")}
            >
              <span className={styles.primaryTabIcon} aria-hidden="true">
                ★
              </span>
              <span className={styles.primaryTabCopy}>
                <strong>Pull Advice</strong>
                <span>Who should I pull now?</span>
              </span>
            </button>
          </nav>

          {primarySection === "agents" ? (
            <section className={styles.rankingSection} aria-label="Agent Ranking">
              <SectionHeading
                eyebrow=""
                title="Agent Ranking"
                description="Compare agents across multiple criteria and find the best ones for your account."
              />
              <div className={styles.rankingTabs} role="tablist" aria-label="Agent ranking views">
                {agentRankingViews.map((view) => (
                  <button
                    key={view}
                    type="button"
                    role="tab"
                    aria-selected={agentView === view}
                    onClick={() => setAgentView(view)}
                  >
                    {view}
                  </button>
                ))}
              </div>

              <div className={styles.filters}>
                <strong>Filters</strong>
                <SelectFilter
                  label="Combat Role"
                  value={combatRole}
                  options={filterOptions.combatRole}
                  onChange={setCombatRole}
                />
                <SelectFilter
                  label="Specialty"
                  value={specialty}
                  options={filterOptions.specialty}
                  onChange={setSpecialty}
                />
                <SelectFilter
                  label="Attribute"
                  value={attribute}
                  options={filterOptions.attribute}
                  onChange={setAttribute}
                />
                <SelectFilter
                  label="Faction"
                  value={faction}
                  options={filterOptions.faction}
                  onChange={setFaction}
                />
                <SelectFilter
                  label="Rarity"
                  value={rarity}
                  options={filterOptions.rarity}
                  onChange={setRarity}
                />
                <button type="button" className={styles.resetButton} onClick={resetFilters}>
                  Reset
                </button>
                <label className={styles.agentSearch}>
                  <span className="sr-only">Search agents</span>
                  <input
                    type="search"
                    value={search}
                    placeholder="Search agents..."
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>

              <div className={styles.agentWorkspace}>
                <div className={styles.tierBoard}>
                  {tiers.map((tier) => {
                    const inTier = filteredAgents.filter(
                      (agent) => agent.viewTiers[agentView] === tier,
                    );
                    return (
                      <div className={styles.tierRow} data-tier={tier} key={tier}>
                        <div className={styles.tierLabel}>{tier}</div>
                        <div className={styles.tierCards}>
                          {inTier.map((agent) => (
                            <AgentCard
                              key={agent.id}
                              agent={agent}
                              tier={tier}
                              selected={selectedAgent.id === agent.id}
                              onSelect={() => {
                                setSelectedAgentId(agent.id);
                                setAgentDetailTab("build");
                              }}
                            />
                          ))}
                          {inTier.length === 0 ? (
                            <span className={styles.noMatches}>No matching agents</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <AgentDetail
                  agent={selectedAgent}
                  tab={agentDetailTab}
                  onTabChange={setAgentDetailTab}
                />
              </div>
            </section>
          ) : null}

          {primarySection === "teams" ? (
            <section className={styles.rankingSection} aria-label="Team Ranking">
              <SectionHeading
                eyebrow=""
                title="Team Ranking"
                description={
                  "Rank complete team concepts, then open a team to compare premium, alternative, and F2P versions."
                }
              />
              <div className={styles.rankingTabs} role="tablist" aria-label="Team ranking views">
                {teamRankingViews.map((view) => (
                  <button
                    key={view}
                    type="button"
                    role="tab"
                    aria-selected={teamView === view}
                    onClick={() => setTeamView(view)}
                  >
                    {view}
                  </button>
                ))}
              </div>
              <div className={styles.teamRankingGrid}>
                {rankedTeams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    tier={team.viewTiers[teamView]}
                    selected={selectedTeam.id === team.id}
                    onSelect={() => {
                      setSelectedTeamId(team.id);
                      setTeamDetailTab("overview");
                      setPullDetailOpen(false);
                      setTeamDetailOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {primarySection === "pull" && !pullDetailOpen ? (
            <section className={styles.rankingSection} aria-label="Pull Advice">
              <SectionHeading
                eyebrow=""
                title="Current Pull Advice"
                description={
                  "Select a current or upcoming banner above to open the account-focused pull decision detail."
                }
              />
            </section>
          ) : null}

          {teamDetailOpen || pullDetailOpen ? (
            <div
              className={styles.detailOverlayLayer}
              data-team-open={teamDetailOpen}
              data-pull-open={pullDetailOpen}
            >
              <div className={styles.overlayPanel} data-overlay="team" data-open={teamDetailOpen}>
                {teamDetailOpen ? (
                  <TeamDetail
                    team={selectedTeam}
                    tab={teamDetailTab}
                    onTabChange={setTeamDetailTab}
                    onClose={() => setTeamDetailOpen(false)}
                  />
                ) : null}
              </div>
              <div className={styles.overlayPanel} data-overlay="pull" data-open={pullDetailOpen}>
                {pullDetailOpen ? (
                  <PullAdviceDetail
                    advice={selectedPull}
                    tab={pullDetailTab}
                    onTabChange={setPullDetailTab}
                    onClose={() => setPullDetailOpen(false)}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
