"use client";

import Image, { type StaticImageData } from "next/image";
import { useMemo, useState } from "react";

import bossRaidArt from "./assets/boss-raid.avif";
import campaignTowerArt from "./assets/campaign-tower.avif";
import heroArt from "./assets/hero.avif";
import pvpArenaArt from "./assets/pvp-arena.avif";
import { getCharacterAvatar } from "./character-avatars";
import {
  characters,
  currentBanner,
  quickPicks,
  recommendedTeams,
  rerollTargets,
  snapshot,
  sourceSummary,
  wishlistData,
  type Character,
  type ModeKey,
  type Rating,
} from "./data";
import styles from "./nikke-tier-list.module.css";

const modes: Array<{
  key: ModeKey;
  title: string;
  description: string;
  tone: string;
  image: StaticImageData;
}> = [
  {
    key: "campaign",
    title: "CAMPAIGN / TOWER TIER LIST",
    description: "Best for story, normal tower and general PvE.",
    tone: "red",
    image: campaignTowerArt,
  },
  {
    key: "boss",
    title: "BOSS / RAID TIER LIST",
    description: "Best for boss battles, interception and raids.",
    tone: "blue",
    image: bossRaidArt,
  },
  {
    key: "pvp",
    title: "PVP / ARENA TIER LIST",
    description: "Best for rookie, special and champion arena.",
    tone: "violet",
    image: pvpArenaArt,
  },
];

const ratingScore: Record<Rating, number> = {
  SSS: 7,
  SS: 6,
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  D: 1,
};

const navItems = [
  ["tier-list", "Tier List"],
  ["quick-picks", "Quick Picks"],
  ["teams", "Teams"],
  ["reroll", "Reroll"],
  ["wishlist", "Wishlist"],
  ["current-banner", "Current Banner"],
  ["methodology", "Methodology"],
  ["changelog", "Changelog"],
] as const;

function CharacterAvatar({
  name,
  variant = "portrait",
  priority = false,
}: {
  name: string;
  variant?: "portrait" | "compact" | "feature";
  priority?: boolean;
}) {
  const avatar = getCharacterAvatar(name);
  const containerClass =
    variant === "compact"
      ? styles.detailAvatar
      : variant === "feature"
        ? styles.featureAvatar
        : styles.characterPortrait;

  return (
    <div className={containerClass} aria-label={`${name} avatar`}>
      <Image
        src={avatar}
        alt={name}
        fill
        sizes={
          variant === "compact"
            ? "92px"
            : variant === "feature"
              ? "(max-width: 768px) 132px, 256px"
              : "(max-width: 768px) 60px, 80px"
        }
        priority={priority}
        className={styles.avatarImage}
      />
    </div>
  );
}

function FilterButtons({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <fieldset className={styles.filterGroup}>
      <legend>{label}</legend>
      <div className={styles.filterButtonRow}>
        {values.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function CharacterCard({
  character,
  mode,
  selected,
  onSelect,
}: {
  character: Character;
  mode: ModeKey;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.characterCard}
      data-selected={selected}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <CharacterAvatar name={character.name} />
      <strong>{character.name}</strong>
      <div className={styles.ratingStrip}>
        <span>{character.ratings.campaign}</span>
        <span>{character.ratings.boss}</span>
        <span>{character.ratings.pvp}</span>
      </div>
      <span className={styles.activeRating}>{character.ratings[mode]}</span>
    </button>
  );
}

function DetailPanel({ character }: { character: Character }) {
  return (
    <aside className={styles.detailPanel} aria-label="Character Detail">
      <div className={styles.detailHeader}>
        <CharacterAvatar name={character.name} variant="compact" />
        <div>
          <h3>{character.name}</h3>
          <strong className={styles.rarity}>{character.rarity}</strong>
          <span className={styles.limited}>{character.availability}</span>
        </div>
      </div>

      <div className={styles.basicFacts}>
        <span>{character.burst}</span>
        <span>{character.cooldown}</span>
        <span>{character.element}</span>
        <span>{character.weapon}</span>
        <span>{character.classType}</span>
        <span>{character.manufacturer}</span>
      </div>

      <div className={styles.detailSubnav}>
        <strong>Tier Ratings</strong>
        <span>Overview</span>
      </div>

      <div className={styles.tierRatings}>
        <div>
          <span>Campaign</span>
          <strong>{character.ratings.campaign}</strong>
        </div>
        <div>
          <span>Boss / Raid</span>
          <strong>{character.ratings.boss}</strong>
        </div>
        <div>
          <span>PvP / Arena</span>
          <strong>{character.ratings.pvp}</strong>
        </div>
      </div>

      <div className={styles.valueGrid}>
        <div>
          <span>New Player Value</span>
          <strong>{character.newPlayer}</strong>
        </div>
        <div>
          <span>Investment</span>
          <strong>{character.investment}</strong>
        </div>
      </div>

      <section className={styles.detailBlock}>
        <h4>Quick Info</h4>
        <p>{character.summary}</p>
      </section>

      {character.whyThisTier ? (
        <section className={styles.detailBlock}>
          <h4>Why this tier?</h4>
          <p>{character.whyThisTier}</p>
        </section>
      ) : null}

      {character.dependencies.length > 0 ? (
        <section className={styles.detailBlock}>
          <h4>Dependencies</h4>
          <div className={styles.tagRow}>
            {character.dependencies.map((dependency) => (
              <span key={dependency}>{dependency}</span>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}

function TeamPanel({ mode }: { mode: ModeKey }) {
  const teams = recommendedTeams[mode];
  const primaryTeam = teams[0]!;
  const title =
    mode === "campaign" ? "Campaign Team" : mode === "boss" ? "Boss / Raid Team" : "PvP Team";

  return (
    <div className={styles.teamPanel}>
      <h3>{title}</h3>
      <div className={styles.subtabs}>
        {teams.map((team, index) => (
          <span key={team.teamName} data-active={index === 0}>
            {team.teamName}
          </span>
        ))}
      </div>
      <div className={styles.teamLineup}>
        {primaryTeam.members.map((name) => (
          <div key={name}>
            <CharacterAvatar name={name} />
            <strong>{name}</strong>
          </div>
        ))}
      </div>
      <p>Primary verified lineup: {primaryTeam.teamName}.</p>
    </div>
  );
}

export function NikkeTierListPage() {
  const [mode, setMode] = useState<ModeKey>("campaign");
  const [selectedName, setSelectedName] = useState("Red Hood");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Default");
  const [burst, setBurst] = useState("All");
  const [element, setElement] = useState("All");
  const [weapon, setWeapon] = useState("All");
  const [classType, setClassType] = useState("All");
  const [manufacturer, setManufacturer] = useState("All");
  const [rarity, setRarity] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [favoriteItem, setFavoriteItem] = useState("All");
  const [teamMode, setTeamMode] = useState<ModeKey>("campaign");
  const [wishlist, setWishlist] = useState("New Player");
  const [methodology, setMethodology] = useState<ModeKey>("campaign");
  const [activeNav, setActiveNav] = useState("tier-list");

  const selected =
    characters.find((character) => character.name === selectedName) ?? characters[0]!;
  const skillLevels = selected.skillInvestment?.recommended.split("/") ?? [];
  const wishlistKey =
    wishlist === "New Player"
      ? "newPlayer"
      : wishlist === "General PvE"
        ? "generalPvE"
        : wishlist === "Raid"
          ? "raid"
          : "pvp";
  const wishlistEntries = wishlistData[wishlistKey];

  const methodologyItems: Record<ModeKey, string[]> = {
    campaign: [
      "Story and tower progression consistency",
      "Wave clear, survivability and general PvE utility",
      "Team flexibility and new-player accessibility",
      "Investment and Favorite Item impact",
    ],
    boss: [
      "Sustained single-target damage and raid contribution",
      "Core and parts damage, support uptime and team synergy",
      "Element-specific value and replacement flexibility",
      "Investment and Favorite Item impact",
    ],
    pvp: [
      "Burst generation speed and opening pressure",
      "Attack, defense, sustain, stall and counter value",
      "Arena-specific team synergy and reliability",
      "Investment and Favorite Item impact",
    ],
  };

  const filteredCharacters = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const next = characters.filter((character) => {
      return (
        (!normalized || character.name.toLowerCase().includes(normalized)) &&
        (burst === "All" || character.burst === burst) &&
        (element === "All" || character.element === element) &&
        (weapon === "All" || character.weapon === weapon) &&
        (classType === "All" || character.classType === classType) &&
        (manufacturer === "All" || character.manufacturer === manufacturer) &&
        (rarity === "All" || character.rarity === rarity) &&
        (availability === "All" || character.availability === availability) &&
        (favoriteItem === "All" ||
          (favoriteItem === "Has Favorite Item" ? character.favoriteItem : !character.favoriteItem))
      );
    });

    if (sort === "Name") return [...next].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "Tier") {
      return [...next].sort(
        (a, b) =>
          ratingScore[b.ratings[mode]] - ratingScore[a.ratings[mode]] ||
          a.name.localeCompare(b.name),
      );
    }
    return next;
  }, [
    availability,
    burst,
    classType,
    element,
    favoriteItem,
    manufacturer,
    mode,
    rarity,
    search,
    sort,
    weapon,
  ]);

  function resetFilters() {
    setSearch("");
    setBurst("All");
    setElement("All");
    setWeapon("All");
    setClassType("All");
    setManufacturer("All");
    setRarity("All");
    setAvailability("All");
    setFavoriteItem("All");
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-label="NIKKE hero">
        <Image
          src={heroArt}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroTitle}>
            <h1>NIKKE Tier List</h1>
            <span className={styles.gameEyebrow}>GODDESS OF VICTORY</span>
            <strong>Compare NIKKE characters across Campaign, Boss, Raid, and PvP.</strong>
            <p>
              Use this Goddess of Victory NIKKE tier list to review character rankings by mode. This
              NIKKE character tier list also highlights team fit, reroll value, and investment
              context.
            </p>
          </div>
        </div>
      </section>

      <nav className={styles.pageNav} aria-label="NIKKE page navigation">
        <div className={styles.shell}>
          <div className={styles.pageNavItems}>
            {navItems.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                data-active={activeNav === id}
                aria-current={activeNav === id ? "location" : undefined}
                onClick={() => setActiveNav(id)}
              >
                {label}
              </a>
            ))}
          </div>
          <div className={styles.versionInfo}>
            <span>Data Snapshot</span>
            <strong>{snapshot.data_snapshot_date}</strong>
            <span>Roster</span>
            <strong>{snapshot.collected_characters} Characters</strong>
          </div>
        </div>
      </nav>

      <div className={styles.shell}>
        <section id="quick-picks" className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2>♛ Quick Picks</h2>
            <p>A quick answer for common questions. Click to view details.</p>
          </div>
          <div className={styles.quickGrid}>
            {quickPicks.map((pick) => (
              <article key={pick.title} className={styles.quickCard} data-tone={pick.tone}>
                <h3>{pick.title}</h3>
                <div>
                  {pick.names.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setSelectedName(name);
                        setActiveNav("tier-list");
                        requestAnimationFrame(() => {
                          document.getElementById("tier-list")?.scrollIntoView({
                            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                              ? "auto"
                              : "smooth",
                            block: "start",
                          });
                        });
                      }}
                    >
                      <CharacterAvatar name={name} />
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="tier-list" className={styles.section}>
          <div className={styles.sectionTitleRow}>
            <div className={styles.sectionTitle}>
              <h2>🎮 Characters &amp; Tier List</h2>
              <p>
                Compare the NIKKE tier list across Campaign, Boss and PvP, then filter characters by
                burst type, weapon, element, rarity and availability.
              </p>
            </div>
            <div className={styles.topControls}>
              <label>
                <span className="sr-only">Search characters</span>
                <input
                  type="search"
                  placeholder="Search characters..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label>
                <span>Sort by</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option>Default</option>
                  <option>Name</option>
                  <option>Tier</option>
                </select>
              </label>
            </div>
          </div>

          <div className={styles.modeGrid}>
            {modes.map((item) => (
              <button
                key={item.key}
                type="button"
                data-tone={item.tone}
                data-active={mode === item.key}
                aria-pressed={mode === item.key}
                onClick={() => setMode(item.key)}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 680px) calc(100vw - 32px), 33vw"
                  className={styles.modeArt}
                />
                <span className={styles.modeShade} aria-hidden="true" />
                <span className={styles.modeContent}>
                  <span className={styles.modeIcon}>◇</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className={styles.workspace}>
            <aside className={styles.filters} aria-label="Filters">
              <div className={styles.filterHeader}>
                <h3>☷ FILTERS</h3>
                <button type="button" onClick={resetFilters}>
                  Reset All
                </button>
              </div>
              <label className={styles.filterSearch}>
                <span className="sr-only">Filter characters</span>
                <input
                  type="search"
                  placeholder="Search or filter characters..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <FilterButtons
                label="Burst Type"
                values={["All", "Burst I", "Burst II", "Burst III", "Burst I/II/III"]}
                value={burst}
                onChange={setBurst}
              />
              <FilterButtons
                label="Element"
                values={["All", "Fire", "Water", "Wind", "Iron", "Electric"]}
                value={element}
                onChange={setElement}
              />
              <FilterButtons
                label="Weapon"
                values={["All", "AR", "SMG", "SG", "SR", "RL"]}
                value={weapon}
                onChange={setWeapon}
              />
              <FilterButtons
                label="Class"
                values={["All", "Attacker", "Defender", "Supporter"]}
                value={classType}
                onChange={setClassType}
              />
              <FilterButtons
                label="Manufacturer"
                values={["All", "Elysion", "Missilis", "Tetra", "Pilgrim", "Abnormal"]}
                value={manufacturer}
                onChange={setManufacturer}
              />
              <FilterButtons
                label="Rarity"
                values={["All", "SSR", "SR", "R"]}
                value={rarity}
                onChange={setRarity}
              />
              <FilterButtons
                label="Availability"
                values={["All", "Standard", "Limited", "Collaboration", "Event / Welfare"]}
                value={availability}
                onChange={setAvailability}
              />
              <FilterButtons
                label="Favorite Item / Treasure"
                values={["All", "Has Favorite Item", "No Favorite Item"]}
                value={favoriteItem}
                onChange={setFavoriteItem}
              />
            </aside>

            <section className={styles.characterArea} aria-label="Character List">
              <div className={styles.characterAreaHeader}>
                <h3>⚙ Character List</h3>
                <span>{filteredCharacters.length} characters</span>
              </div>
              <div className={styles.characterGrid}>
                {filteredCharacters.map((character) => (
                  <CharacterCard
                    key={character.name}
                    character={character}
                    mode={mode}
                    selected={selected.name === character.name}
                    onSelect={() => setSelectedName(character.name)}
                  />
                ))}
              </div>

              <div className={styles.characterInfo}>
                <div className={styles.characterFeature}>
                  <CharacterAvatar name={selected.name} variant="feature" priority />
                  <div>
                    <h3>{selected.name}</h3>
                    <p>
                      {selected.burst} · {selected.cooldown}
                    </p>
                  </div>
                </div>

                <div className={styles.keyInfo}>
                  <h4>Key Information</h4>
                  <dl>
                    <div>
                      <dt>Rarity</dt>
                      <dd>{selected.rarity}</dd>
                    </div>
                    <div>
                      <dt>Burst Type</dt>
                      <dd>{selected.burst}</dd>
                    </div>
                    <div>
                      <dt>Burst Cooldown</dt>
                      <dd>{selected.cooldown}</dd>
                    </div>
                    <div>
                      <dt>Element</dt>
                      <dd>{selected.element}</dd>
                    </div>
                    <div>
                      <dt>Weapon</dt>
                      <dd>{selected.weapon}</dd>
                    </div>
                    <div>
                      <dt>Class</dt>
                      <dd>{selected.classType}</dd>
                    </div>
                    <div>
                      <dt>Manufacturer</dt>
                      <dd>{selected.manufacturer}</dd>
                    </div>
                    <div>
                      <dt>Availability</dt>
                      <dd>{selected.availability}</dd>
                    </div>
                    <div>
                      <dt>Favorite Item / Treasure</dt>
                      <dd>{selected.favoriteItem ? "Available" : "None"}</dd>
                    </div>
                  </dl>
                </div>

                {selected.strengths.length > 0 || selected.weaknesses.length > 0 ? (
                  <div className={styles.strengths}>
                    <h4>Strengths &amp; Weaknesses</h4>
                    {selected.strengths.length > 0 ? (
                      <>
                        <strong>Strengths</strong>
                        <ul>
                          {selected.strengths.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                    {selected.weaknesses.length > 0 ? (
                      <>
                        <strong>Weaknesses</strong>
                        <ul>
                          {selected.weaknesses.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {selected.corePartners.length > 0 ||
              selected.alternatives.length > 0 ||
              selected.bestUse ? (
                <div className={styles.relationshipGrid}>
                  {selected.corePartners.length > 0 ? (
                    <section>
                      <h4>Core Partners</h4>
                      <div className={styles.partnerRow}>
                        {selected.corePartners.map((name) => (
                          <CharacterAvatar key={name} name={name} />
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {selected.alternatives.length > 0 ? (
                    <section>
                      <h4>Replacement / Alternatives</h4>
                      <div className={styles.partnerRow}>
                        {selected.alternatives.map((name) => (
                          <CharacterAvatar key={name} name={name} />
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {selected.bestUse ? (
                    <section>
                      <h4>Best Use</h4>
                      <div className={styles.tagRow}>
                        <span>{selected.bestUse}</span>
                      </div>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </section>

            <DetailPanel character={selected} />
          </div>
        </section>

        <section id="teams" className={styles.bottomGrid}>
          <div className={styles.panelWide}>
            <div className={styles.panelHeader}>
              <h2>⚔ Recommended Teams</h2>
              <div className={styles.panelTabs}>
                <button
                  type="button"
                  data-active={teamMode === "campaign"}
                  aria-pressed={teamMode === "campaign"}
                  onClick={() => setTeamMode("campaign")}
                >
                  Campaign Team
                </button>
                <button
                  type="button"
                  data-active={teamMode === "boss"}
                  aria-pressed={teamMode === "boss"}
                  onClick={() => setTeamMode("boss")}
                >
                  Boss / Raid Team
                </button>
                <button
                  type="button"
                  data-active={teamMode === "pvp"}
                  aria-pressed={teamMode === "pvp"}
                  onClick={() => setTeamMode("pvp")}
                >
                  PvP Team
                </button>
              </div>
            </div>
            <TeamPanel mode={teamMode} />
          </div>

          <section className={styles.panel}>
            <h2>◉ Investment Details</h2>
            <div className={styles.metricRow}>
              <span>Overall Investment</span>
              <strong>{selected.investment}</strong>
            </div>
            {selected.skillInvestment ? (
              <>
                <h3>Recommended Skill Investment</h3>
                <div className={styles.skillGrid}>
                  <span>
                    Skill 1<br />
                    <strong>{skillLevels[0] ?? "—"}</strong>
                  </span>
                  <span>
                    Skill 2<br />
                    <strong>{skillLevels[1] ?? "—"}</strong>
                  </span>
                  <span>
                    Burst
                    <br />
                    <strong>{skillLevels[2] ?? "—"}</strong>
                  </span>
                </div>
                <div className={styles.metricRow}>
                  <span>Priority</span>
                  <strong>{selected.skillInvestment.priorityOrder}</strong>
                </div>
              </>
            ) : null}
            {selected.cubeRecommendation.length > 0 ? (
              <div className={styles.metricRow}>
                <span>Cube</span>
                <strong>{selected.cubeRecommendation.join(" / ")}</strong>
              </div>
            ) : null}
            <div className={styles.metricRow}>
              <span>Favorite Item / Treasure</span>
              <strong>{selected.favoriteItem ? "Available" : "None"}</strong>
            </div>
          </section>

          <section id="reroll" className={styles.panel}>
            <h2>🎁 Reroll Guide</h2>
            <h3>Best Reroll Targets</h3>
            <div className={styles.rerollRow}>
              {rerollTargets.map((entry) => (
                <div key={entry.character}>
                  <CharacterAvatar name={entry.character} />
                  <strong>{entry.character}</strong>
                  <span>{entry.priority}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="wishlist" className={styles.panel}>
            <h2>◎ Wishlist Priority</h2>
            <div className={styles.panelTabs}>
              {["New Player", "General PvE", "Raid", "PvP"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  data-active={wishlist === tab}
                  aria-pressed={wishlist === tab}
                  onClick={() => setWishlist(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className={styles.wishlistRow}>
              {wishlistEntries.map((entry) => (
                <div key={entry.character}>
                  <CharacterAvatar name={entry.character} />
                  <strong>{entry.character}</strong>
                  <span>
                    {wishlist} · {entry.priority}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section id="methodology" className={styles.panel}>
            <h2>♜ Ranking Methodology</h2>
            <p>
              The Goddess of Victory NIKKE character tier list evaluates character performance by
              game mode, team flexibility, investment requirements, and new-player value.
            </p>
            <div className={styles.panelTabs}>
              <button
                type="button"
                data-active={methodology === "campaign"}
                aria-pressed={methodology === "campaign"}
                onClick={() => setMethodology("campaign")}
              >
                Campaign
              </button>
              <button
                type="button"
                data-active={methodology === "boss"}
                aria-pressed={methodology === "boss"}
                onClick={() => setMethodology("boss")}
              >
                Boss / Raid
              </button>
              <button
                type="button"
                data-active={methodology === "pvp"}
                aria-pressed={methodology === "pvp"}
                onClick={() => setMethodology("pvp")}
              >
                PvP
              </button>
            </div>
            <ul className={styles.methodologyList}>
              {methodologyItems[methodology].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="changelog" className={styles.panel}>
            <h2>◴ Changelog / Tier History</h2>
            <p>Track material NIKKE tier list changes and important ranking updates.</p>
            <div className={styles.changeList}>
              <div>
                <span>{snapshot.data_snapshot_date}</span>
                <strong>Production data snapshot</strong>
                <em>
                  {snapshot.collected_characters} characters refreshed across Campaign, Boss and
                  PvP.
                </em>
              </div>
            </div>
          </section>

          <section id="current-banner" className={styles.panel}>
            <h2>▣ Current Banner Advice</h2>
            <div className={styles.bannerBody}>
              <CharacterAvatar name={currentBanner.character} />
              <div>
                <div className={styles.bannerBadges}>
                  <span>{currentBanner.pullRecommendation}</span>
                  <span>{currentBanner.limitedStatus}</span>
                </div>
                <strong>{currentBanner.character}</strong>
                <ul>
                  <li>{currentBanner.bannerName}</li>
                  <li>
                    {currentBanner.startDate} – {currentBanner.endDate}
                  </li>
                  <li>Official banner status checked {currentBanner.asOf}.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <h2>▤ Data Sources</h2>
            <p>
              Rankings use the {snapshot.data_snapshot_date} production data snapshot and its
              audited source log.
            </p>
            <div className={styles.evidenceGrid}>
              {sourceSummary.map((source) => (
                <span key={source.url}>{source.name}</span>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
