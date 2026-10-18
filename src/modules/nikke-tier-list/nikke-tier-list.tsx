"use client";

import { useMemo, useState } from "react";

import styles from "./nikke-tier-list.module.css";

type ModeKey = "campaign" | "boss" | "pvp";
type Rating = "SSS" | "SS" | "S" | "A" | "B" | "C" | "D";

type Character = {
  name: string;
  rarity: "SSR" | "SR";
  burst: "Burst I" | "Burst II" | "Burst III";
  cooldown: "20s" | "40s" | "60s";
  element: "Fire" | "Water" | "Wind" | "Iron" | "Electric";
  weapon: "AR" | "SMG" | "SG" | "SR" | "RL" | "MG";
  classType: "Attacker" | "Defender" | "Supporter";
  manufacturer: "Elysion" | "Missilis" | "Tetra" | "Pilgrim";
  availability: "Standard" | "Limited";
  favoriteItem: boolean;
  roles: string[];
  ratings: Record<ModeKey, Rating>;
  newPlayer: "Excellent" | "Good" | "Medium";
  investment: "Low" | "Medium" | "High";
};

const modes: Array<{ key: ModeKey; title: string; description: string; tone: string }> = [
  {
    key: "campaign",
    title: "CAMPAIGN / TOWER TIER LIST",
    description: "Best for story, normal tower and general PvE.",
    tone: "red",
  },
  {
    key: "boss",
    title: "BOSS / RAID TIER LIST",
    description: "Best for boss battles, interception and raids.",
    tone: "blue",
  },
  {
    key: "pvp",
    title: "PVP / ARENA TIER LIST",
    description: "Best for rookie, special and champion arena.",
    tone: "violet",
  },
];

const characters: Character[] = [
  {
    name: "Red Hood",
    rarity: "SSR",
    burst: "Burst III",
    cooldown: "40s",
    element: "Fire",
    weapon: "SR",
    classType: "Attacker",
    manufacturer: "Pilgrim",
    availability: "Limited",
    favoriteItem: false,
    roles: ["Main DPS", "Burst Generation", "Core Damage"],
    ratings: { campaign: "SSS", boss: "SSS", pvp: "A" },
    newPlayer: "Good",
    investment: "High",
  },
  {
    name: "Modernia",
    rarity: "SSR",
    burst: "Burst III",
    cooldown: "40s",
    element: "Fire",
    weapon: "MG",
    classType: "Attacker",
    manufacturer: "Pilgrim",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Main DPS", "Sustain", "Parts Damage"],
    ratings: { campaign: "SSS", boss: "S", pvp: "B" },
    newPlayer: "Excellent",
    investment: "High",
  },
  {
    name: "Scarlet",
    rarity: "SSR",
    burst: "Burst III",
    cooldown: "40s",
    element: "Electric",
    weapon: "AR",
    classType: "Attacker",
    manufacturer: "Pilgrim",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Main DPS", "Burst Generation"],
    ratings: { campaign: "SSS", boss: "A", pvp: "S" },
    newPlayer: "Excellent",
    investment: "High",
  },
  {
    name: "Liter",
    rarity: "SSR",
    burst: "Burst I",
    cooldown: "20s",
    element: "Iron",
    weapon: "SMG",
    classType: "Supporter",
    manufacturer: "Missilis",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Support", "Buffer", "CDR"],
    ratings: { campaign: "SSS", boss: "S", pvp: "A" },
    newPlayer: "Excellent",
    investment: "Medium",
  },
  {
    name: "Crown",
    rarity: "SSR",
    burst: "Burst II",
    cooldown: "20s",
    element: "Iron",
    weapon: "MG",
    classType: "Defender",
    manufacturer: "Pilgrim",
    availability: "Limited",
    favoriteItem: false,
    roles: ["Buffer", "Shield", "Support"],
    ratings: { campaign: "SSS", boss: "S", pvp: "S" },
    newPlayer: "Excellent",
    investment: "High",
  },
  {
    name: "Noir",
    rarity: "SSR",
    burst: "Burst III",
    cooldown: "40s",
    element: "Wind",
    weapon: "SG",
    classType: "Attacker",
    manufacturer: "Tetra",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Sub DPS", "Support"],
    ratings: { campaign: "S", boss: "A", pvp: "SSS" },
    newPlayer: "Good",
    investment: "Medium",
  },
  {
    name: "Blanc",
    rarity: "SSR",
    burst: "Burst II",
    cooldown: "60s",
    element: "Wind",
    weapon: "AR",
    classType: "Defender",
    manufacturer: "Tetra",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Support", "Healer", "Shield"],
    ratings: { campaign: "A", boss: "A", pvp: "SSS" },
    newPlayer: "Good",
    investment: "Medium",
  },
  {
    name: "Naga",
    rarity: "SSR",
    burst: "Burst II",
    cooldown: "20s",
    element: "Electric",
    weapon: "SG",
    classType: "Supporter",
    manufacturer: "Missilis",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Support", "Buffer", "Core Damage"],
    ratings: { campaign: "S", boss: "S", pvp: "B" },
    newPlayer: "Excellent",
    investment: "Medium",
  },
  {
    name: "Alice",
    rarity: "SSR",
    burst: "Burst III",
    cooldown: "40s",
    element: "Fire",
    weapon: "SR",
    classType: "Attacker",
    manufacturer: "Tetra",
    availability: "Standard",
    favoriteItem: true,
    roles: ["Main DPS", "Pierce"],
    ratings: { campaign: "A", boss: "S", pvp: "B" },
    newPlayer: "Medium",
    investment: "High",
  },
  {
    name: "Privaty",
    rarity: "SSR",
    burst: "Burst III",
    cooldown: "40s",
    element: "Water",
    weapon: "AR",
    classType: "Attacker",
    manufacturer: "Elysion",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Sub DPS", "Control"],
    ratings: { campaign: "S", boss: "B", pvp: "B" },
    newPlayer: "Good",
    investment: "Medium",
  },
  {
    name: "Dorothy",
    rarity: "SSR",
    burst: "Burst I",
    cooldown: "20s",
    element: "Water",
    weapon: "AR",
    classType: "Supporter",
    manufacturer: "Pilgrim",
    availability: "Limited",
    favoriteItem: false,
    roles: ["Support", "Burst Generation", "Parts Damage"],
    ratings: { campaign: "SSS", boss: "S", pvp: "A" },
    newPlayer: "Good",
    investment: "High",
  },
  {
    name: "Rapunzel",
    rarity: "SSR",
    burst: "Burst I",
    cooldown: "40s",
    element: "Iron",
    weapon: "RL",
    classType: "Supporter",
    manufacturer: "Pilgrim",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Healer", "Support"],
    ratings: { campaign: "A", boss: "B", pvp: "B" },
    newPlayer: "Good",
    investment: "Medium",
  },
  {
    name: "Maxwell",
    rarity: "SSR",
    burst: "Burst III",
    cooldown: "40s",
    element: "Iron",
    weapon: "SR",
    classType: "Attacker",
    manufacturer: "Missilis",
    availability: "Standard",
    favoriteItem: true,
    roles: ["Sub DPS", "Buffer"],
    ratings: { campaign: "A", boss: "S", pvp: "B" },
    newPlayer: "Medium",
    investment: "High",
  },
  {
    name: "Helm",
    rarity: "SSR",
    burst: "Burst III",
    cooldown: "40s",
    element: "Water",
    weapon: "SR",
    classType: "Attacker",
    manufacturer: "Elysion",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Healer", "Sub DPS"],
    ratings: { campaign: "A", boss: "S", pvp: "B" },
    newPlayer: "Good",
    investment: "Medium",
  },
  {
    name: "Drake",
    rarity: "SSR",
    burst: "Burst III",
    cooldown: "40s",
    element: "Fire",
    weapon: "SG",
    classType: "Attacker",
    manufacturer: "Missilis",
    availability: "Standard",
    favoriteItem: true,
    roles: ["Sub DPS", "Burst Generation"],
    ratings: { campaign: "S", boss: "A", pvp: "B" },
    newPlayer: "Good",
    investment: "Medium",
  },
  {
    name: "Noise",
    rarity: "SSR",
    burst: "Burst I",
    cooldown: "40s",
    element: "Electric",
    weapon: "RL",
    classType: "Supporter",
    manufacturer: "Tetra",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Healer", "Taunt", "Arena Specialist"],
    ratings: { campaign: "B", boss: "B", pvp: "SS" },
    newPlayer: "Medium",
    investment: "Medium",
  },
  {
    name: "Centi",
    rarity: "SSR",
    burst: "Burst II",
    cooldown: "20s",
    element: "Iron",
    weapon: "RL",
    classType: "Defender",
    manufacturer: "Missilis",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Shield", "Burst Generation"],
    ratings: { campaign: "S", boss: "A", pvp: "B" },
    newPlayer: "Good",
    investment: "Low",
  },
  {
    name: "Miranda",
    rarity: "SSR",
    burst: "Burst I",
    cooldown: "20s",
    element: "Fire",
    weapon: "SMG",
    classType: "Supporter",
    manufacturer: "Elysion",
    availability: "Standard",
    favoriteItem: false,
    roles: ["Buffer", "Support"],
    ratings: { campaign: "B", boss: "B", pvp: "C" },
    newPlayer: "Medium",
    investment: "Low",
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

const quickPicks = [
  { title: "Best Campaign Characters", names: ["Liter", "Crown", "Modernia"], tone: "red" },
  { title: "Best Boss Characters", names: ["Red Hood", "Scarlet", "Alice"], tone: "purple" },
  { title: "Best PvP Characters", names: ["Noir", "Blanc", "Crown"], tone: "blue" },
  { title: "Best New Player Picks", names: ["Liter", "Naga", "Privaty"], tone: "green" },
  { title: "Best Reroll Targets", names: ["Red Hood", "Modernia", "Scarlet"], tone: "orange" },
];

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

function Placeholder({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={compact ? styles.placeholderCompact : styles.placeholder} aria-label={`${label} image placeholder`}>
      <span>{label}</span>
    </div>
  );
}

function MiniPortrait({ name }: { name: string }) {
  return (
    <div className={styles.miniPortrait} aria-label={`${name} placeholder portrait`}>
      <span>{name.slice(0, 2).toUpperCase()}</span>
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
      <MiniPortrait name={character.name} />
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
        <Placeholder label={character.name} compact />
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
        <p>Mock summary for layout validation. Final NIKKE data will be added in the data phase.</p>
      </section>

      <section className={styles.detailBlock}>
        <h4>Why this tier?</h4>
        <p>
          Placement text is intentionally local mock copy. It exists only to preserve the design density and
          information hierarchy.
        </p>
      </section>

      <section className={styles.detailBlock}>
        <h4>Dependencies</h4>
        <div className={styles.tagRow}>
          <span>Needs specific team</span>
          <span>High investment</span>
          <span>Manual play recommended</span>
        </div>
      </section>
    </aside>
  );
}

function TeamPanel({ mode }: { mode: ModeKey }) {
  const content =
    mode === "campaign"
      ? {
          title: "Campaign Team",
          subtabs: ["Best Core", "Meta Team", "Easy to Build", "Low Investment"],
          lineup: ["Liter", "Crown", "Modernia", "Naga", "Privaty"],
          extras: ["Flex Slot Options", "Replacement Options"],
          note: "Team Notes — preserve the frozen Campaign recommendation structure.",
        }
      : mode === "boss"
        ? {
            title: "Boss / Raid Team",
            subtabs: ["Best Cores", "General Team", "Main DPS Options", "Support Options"],
            lineup: ["Liter", "Red Hood", "Crown", "Maxwell", "Alice"],
            extras: ["Element-specific Alternatives", "Replacement Options"],
            note: "Team Notes — preserve the frozen Boss / Raid recommendation structure.",
          }
        : {
            title: "PvP Team",
            subtabs: ["Burst Rush", "Sustain", "Stall", "Counter", "Attack", "Defense"],
            lineup: ["Naga", "Noir", "Blanc", "Scarlet", "Crown"],
            extras: ["Alternative Options"],
            note: "Team Notes — preserve the frozen PvP archetype structure.",
          };

  return (
    <div className={styles.teamPanel}>
      <h3>{content.title}</h3>
      <div className={styles.subtabs}>
        {content.subtabs.map((tab, index) => (
          <span key={tab} data-active={index === 0}>
            {tab}
          </span>
        ))}
      </div>
      <div className={styles.teamLineup}>
        {content.lineup.map((name) => (
          <div key={name}>
            <MiniPortrait name={name} />
            <strong>{name}</strong>
          </div>
        ))}
      </div>
      <div className={styles.teamExtras}>
        {content.extras.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <p>{content.note}</p>
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
  const [mechanic, setMechanic] = useState("All");
  const [favoriteItem, setFavoriteItem] = useState("All");
  const [teamMode, setTeamMode] = useState<ModeKey>("campaign");
  const [wishlist, setWishlist] = useState("New Player");
  const [methodology, setMethodology] = useState<ModeKey>("campaign");

  const selected = characters.find((character) => character.name === selectedName) ?? characters[0]!;

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
        (mechanic === "All" || character.roles.includes(mechanic)) &&
        (favoriteItem === "All" ||
          (favoriteItem === "Has Favorite Item" ? character.favoriteItem : !character.favoriteItem))
      );
    });

    if (sort === "Name") return [...next].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "Tier") {
      return [...next].sort(
        (a, b) => ratingScore[b.ratings[mode]] - ratingScore[a.ratings[mode]] || a.name.localeCompare(b.name),
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
    mechanic,
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
    setMechanic("All");
    setFavoriteItem("All");
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-label="NIKKE hero">
        <div className={styles.heroPlaceholder} aria-hidden="true">
          <span>NIKKE HERO ART PLACEHOLDER</span>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroTitle}>
            <span className={styles.gameEyebrow}>GODDESS OF VICTORY</span>
            <h1>NIKKE</h1>
            <strong>Find the right NIKKE for your journey</strong>
            <p>Complete tier lists, team recommendations, and in-depth analysis for every game mode.</p>
          </div>
        </div>
      </section>

      <nav className={styles.pageNav} aria-label="NIKKE page navigation">
        <div className={styles.shell}>
          <div className={styles.pageNavItems}>
            {navItems.map(([id, label], index) => (
              <a key={id} href={`#${id}`} data-active={index === 0}>
                {label}
              </a>
            ))}
          </div>
          <div className={styles.versionInfo}>
            <span>Game Version</span>
            <strong>v1.26.0</strong>
            <span>Last Updated</span>
            <strong>Mock</strong>
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
                    <button key={name} type="button" onClick={() => setSelectedName(name)}>
                      <MiniPortrait name={name} />
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
              <p>Compare NIKKE performance across Campaign, Boss and PvP.</p>
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
                onClick={() => setMode(item.key)}
              >
                <span className={styles.modeIcon}>◇</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
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
              <FilterButtons label="Burst Type" values={["All", "Burst I", "Burst II", "Burst III"]} value={burst} onChange={setBurst} />
              <FilterButtons label="Element" values={["All", "Fire", "Water", "Wind", "Iron", "Electric"]} value={element} onChange={setElement} />
              <FilterButtons label="Weapon" values={["All", "AR", "SMG", "SG", "SR", "RL", "MG"]} value={weapon} onChange={setWeapon} />
              <FilterButtons label="Class" values={["All", "Attacker", "Defender", "Supporter"]} value={classType} onChange={setClassType} />
              <FilterButtons label="Manufacturer" values={["All", "Elysion", "Missilis", "Tetra", "Pilgrim"]} value={manufacturer} onChange={setManufacturer} />
              <FilterButtons label="Rarity" values={["All", "SSR", "SR"]} value={rarity} onChange={setRarity} />
              <FilterButtons label="Availability" values={["All", "Standard", "Limited"]} value={availability} onChange={setAvailability} />
              <FilterButtons
                label="Role / Mechanic"
                values={[
                  "All",
                  "Main DPS",
                  "Sub DPS",
                  "Support",
                  "Healer",
                  "Buffer",
                  "Shield",
                  "CDR",
                  "Burst Generation",
                  "Taunt",
                  "Control",
                  "Core Damage",
                  "Parts Damage",
                  "Sustain",
                  "Pierce",
                  "Arena Specialist",
                ]}
                value={mechanic}
                onChange={setMechanic}
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
                  <Placeholder label={selected.name} />
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
                    <div><dt>Rarity</dt><dd>{selected.rarity}</dd></div>
                    <div><dt>Burst Type</dt><dd>{selected.burst}</dd></div>
                    <div><dt>Burst Cooldown</dt><dd>{selected.cooldown}</dd></div>
                    <div><dt>Element</dt><dd>{selected.element}</dd></div>
                    <div><dt>Weapon</dt><dd>{selected.weapon}</dd></div>
                    <div><dt>Class</dt><dd>{selected.classType}</dd></div>
                    <div><dt>Manufacturer</dt><dd>{selected.manufacturer}</dd></div>
                    <div><dt>Availability</dt><dd>{selected.availability}</dd></div>
                    <div><dt>Favorite Item</dt><dd>{selected.favoriteItem ? "Available" : "None"}</dd></div>
                  </dl>
                </div>

                <div className={styles.strengths}>
                  <h4>Strengths &amp; Weaknesses</h4>
                  <strong>Strengths</strong>
                  <ul>
                    <li>Mock high-value performance note</li>
                    <li>Mock burst and sustained damage note</li>
                    <li>Mock team compatibility note</li>
                  </ul>
                  <strong>Weaknesses</strong>
                  <ul>
                    <li>Mock investment requirement</li>
                    <li>Mock team dependency</li>
                    <li>Mock availability limitation</li>
                  </ul>
                </div>
              </div>

              <div className={styles.relationshipGrid}>
                <section>
                  <h4>Core Partners</h4>
                  <div className={styles.partnerRow}>
                    {["Liter", "Naga", "Crown", "Modernia"].map((name) => <MiniPortrait key={name} name={name} />)}
                  </div>
                </section>
                <section>
                  <h4>Replacement / Alternatives</h4>
                  <div className={styles.partnerRow}>
                    {["Scarlet", "Alice", "Maxwell", "Drake"].map((name) => <MiniPortrait key={name} name={name} />)}
                  </div>
                </section>
                <section>
                  <h4>Best Use</h4>
                  <div className={styles.tagRow}>
                    <span>Boss</span><span>Raid</span><span>Interception</span><span>Core Damage</span><span>Manual Play</span>
                  </div>
                </section>
              </div>
            </section>

            <DetailPanel character={selected} />
          </div>
        </section>

        <section id="teams" className={styles.bottomGrid}>
          <div className={styles.panelWide}>
            <div className={styles.panelHeader}>
              <h2>⚔ Recommended Teams</h2>
              <div className={styles.panelTabs}>
                <button type="button" data-active={teamMode === "campaign"} onClick={() => setTeamMode("campaign")}>Campaign Team</button>
                <button type="button" data-active={teamMode === "boss"} onClick={() => setTeamMode("boss")}>Boss / Raid Team</button>
                <button type="button" data-active={teamMode === "pvp"} onClick={() => setTeamMode("pvp")}>PvP Team</button>
              </div>
            </div>
            <TeamPanel mode={teamMode} />
          </div>

          <section className={styles.panel}>
            <h2>◉ Investment Details</h2>
            <div className={styles.metricRow}><span>Overall Investment</span><strong>High</strong></div>
            <h3>Recommended Skill Investment</h3>
            <div className={styles.skillGrid}><span>Skill 1<br /><strong>7+</strong></span><span>Skill 2<br /><strong>7+</strong></span><span>Burst<br /><strong>10</strong></span></div>
            <div className={styles.metricRow}><span>Overload Gear</span><strong>High Priority</strong></div>
            <div className={styles.metricRow}><span>Cube</span><strong>Resilience / Charge</strong></div>
            <div className={styles.metricRow}><span>Favorite Item / Treasure</span><strong>Recommended</strong></div>
            <p className={styles.warning}>High investment note retained for final data replacement.</p>
          </section>

          <section id="reroll" className={styles.panel}>
            <h2>🎁 Reroll Guide</h2>
            <h3>Best Reroll Targets</h3>
            <div className={styles.rerollRow}>
              {["Red Hood", "Modernia", "Scarlet", "Liter"].map((name) => (
                <div key={name}><MiniPortrait name={name} /><strong>{name}</strong><span>Excellent</span></div>
              ))}
            </div>
            <button type="button" className={styles.primaryButton}>View Reroll Guide</button>
          </section>

          <section id="wishlist" className={styles.panel}>
            <h2>◎ Wishlist Priority</h2>
            <div className={styles.panelTabs}>
              {["New Player", "General PvE", "Raid", "PvP"].map((tab) => (
                <button key={tab} type="button" data-active={wishlist === tab} onClick={() => setWishlist(tab)}>{tab}</button>
              ))}
            </div>
            <div className={styles.wishlistRow}>
              {["Liter", "Naga", "Crown", "Modernia"].map((name, index) => (
                <div key={name}><MiniPortrait name={name} /><strong>{name}</strong><span>{wishlist} · {index < 2 ? "High" : "Medium"}</span></div>
              ))}
            </div>
          </section>

          <section id="methodology" className={styles.panel}>
            <h2>♜ Ranking Methodology</h2>
            <p>How we evaluate characters in each game mode.</p>
            <div className={styles.panelTabs}>
              <button type="button" data-active={methodology === "campaign"} onClick={() => setMethodology("campaign")}>Campaign</button>
              <button type="button" data-active={methodology === "boss"} onClick={() => setMethodology("boss")}>Boss / Raid</button>
              <button type="button" data-active={methodology === "pvp"} onClick={() => setMethodology("pvp")}>PvP</button>
            </div>
            <ul className={styles.methodologyList}>
              <li>Evaluation criteria and assumptions</li>
              <li>Team synergy and combat power context</li>
              <li>Availability and investment considerations</li>
              <li>Favorite Item and mode-specific performance</li>
            </ul>
          </section>

          <section id="changelog" className={styles.panel}>
            <h2>◴ Changelog / Tier History</h2>
            <p>Recent changes to tier list and important updates.</p>
            <div className={styles.changeList}>
              <div><span>Mock date</span><strong>Red Hood</strong><em>New character / tier update</em></div>
              <div><span>Mock date</span><strong>Modernia</strong><em>Tier adjusted</em></div>
              <div><span>Mock date</span><strong>Scarlet</strong><em>Favorite Item change</em></div>
              <div><span>Mock date</span><strong>Arena Meta</strong><em>Meta / version change</em></div>
            </div>
          </section>

          <section id="current-banner" className={styles.panel}>
            <h2>▣ Current Banner Advice</h2>
            <div className={styles.bannerBody}>
              <MiniPortrait name="Red Hood" />
              <div>
                <div className={styles.bannerBadges}><span>Worth Pulling</span><span>Limited</span><span>NEW</span></div>
                <strong>Red Hood</strong>
                <ul>
                  <li>Top tier for Campaign and Boss</li>
                  <li>Good value for most players</li>
                  <li>Limited character placeholder</li>
                  <li>Highly recommended for new players</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <h2>▤ Data &amp; Evidence (Coming Soon)</h2>
            <p>More data will be added in future updates.</p>
            <div className={styles.evidenceGrid}>
              {["Raid Pick Rate", "Arena Win Rate", "Team Usage", "Boss Performance", "Season Data", "Sample Size"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <button type="button" className={styles.disabledButton} disabled>Coming in Future Updates</button>
          </section>
        </section>
      </div>
    </main>
  );
}
