/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type KeyboardEvent } from "react";

import {
  cards,
  cardPools,
  cardPoolName,
  cardTierOrder,
  characters,
  defaultCardForPool,
  potions,
  potionTierOrder,
  relics,
  relicTierOrder,
  snapshot,
  sources,
  type CardPool,
  type SlayCard,
} from "./data";
import { formatSlayGameText } from "./game-text";
import styles from "./slay-the-spire-2-tier-list.module.css";

type RankingSection = "cards" | "relics" | "characters" | "potions";
type SortMode = "tier" | "name";

const rankingSections = [
  { key: "cards", label: "Cards", note: "Card tier list with key-card context" },
  { key: "relics", label: "Relics", note: "Extended source-grade rankings" },
  { key: "characters", label: "Characters", note: "Current Main character strength" },
  { key: "potions", label: "Potions", note: "Potion rankings and use context" },
] as const;

const tierIndex = new Map(cardTierOrder.map((tier, index) => [tier, index]));
const rankOrder = ["Top", "Middle", "Last"] as const;

function moveTab<T extends string>(
  event: KeyboardEvent<HTMLButtonElement>,
  order: readonly T[],
  current: T,
  setCurrent: (value: T) => void,
  attribute: string,
) {
  if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const focusedIndex = order.indexOf(event.currentTarget.getAttribute(attribute) as T);
  const currentIndex = focusedIndex >= 0 ? focusedIndex : order.indexOf(current);
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % order.length;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + order.length) % order.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = order.length - 1;
  const next = order[nextIndex]!;
  setCurrent(next);
  requestAnimationFrame(() => {
    document.querySelector<HTMLButtonElement>(`button[${attribute}="${next}"]`)?.focus();
  });
}

const snapshotMonthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Renders the reviewed snapshot date from the snapshot record instead of a display literal. */
function snapshotDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const monthLabel =
    month !== undefined && month >= 1 && month <= 12 ? snapshotMonthLabels[month - 1] : undefined;
  if (!year || !day || !monthLabel) return isoDate;
  return `${monthLabel} ${day}, ${year}`;
}

function costLabel(card: SlayCard): string {
  if (card.cost === null) return "N/A";
  return `${card.cost} Energy`;
}

function sourceLabel(card: SlayCard): string {
  if (card.tier === "Needs Review") {
    return card.pool === "colorless"
      ? "Current Main game data verified; no complete independent Main Colorless ranking was verified."
      : "Current Main game data verified; the reviewed source did not assign this card an S–D tier.";
  }
  return `Current Main ${snapshot.mainVersion} source placement: ${card.tier} tier.`;
}

function CardOption({
  card,
  selected,
  showTier,
  onSelect,
}: {
  card: SlayCard;
  selected: boolean;
  showTier: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.cardButton}
      data-card-id={card.id.toLocaleLowerCase("en-US")}
      data-tier={card.tier}
      aria-pressed={selected}
      aria-label={`${card.name}, ${card.tier} tier`}
      onClick={onSelect}
    >
      <Image
        src={card.image}
        alt=""
        width={250}
        height={172}
        sizes="(max-width: 620px) calc((100vw - 133px) / 2), 90px"
        loading="lazy"
      />
      <span>{card.name}</span>
      <small data-card-tier={showTier ? card.tier : undefined}>
        {showTier ? `${card.tier} tier · ${card.type}` : card.type}
      </small>
    </button>
  );
}

function CardDetail({ card }: { card: SlayCard }) {
  return (
    <aside className={styles.detail} aria-label="Card Detail" data-card-detail>
      <div className={styles.detailTop}>
        <Image
          src={card.image}
          alt={`${card.name} card artwork`}
          width={96}
          height={130}
          loading="lazy"
        />
        <div>
          <p className={styles.eyebrow}>{card.poolName}</p>
          <h3>{card.name}</h3>
          <div className={styles.chips}>
            <span data-tier={card.tier}>{card.tier}</span>
            <span>{card.type}</span>
            <span>{card.rarity}</span>
            <span>{costLabel(card)}</span>
          </div>
        </div>
      </div>

      <section>
        <h4>Why This Tier</h4>
        <p>{sourceLabel(card)}</p>
        <p>{formatSlayGameText(card.description)}</p>
      </section>

      {card.context ? (
        <>
          <section>
            <h4>When to Pick</h4>
            <p>{card.context.whenToPick}</p>
          </section>
          <section>
            <h4>When to Skip</h4>
            <p>{card.context.whenToSkip}</p>
          </section>
          <section>
            <h4>Best With / Synergies</h4>
            <p>{card.context.bestWith}</p>
          </section>
        </>
      ) : null}

      <section className={styles.evidenceBox}>
        <h4>Evidence / Source Context</h4>
        <p>
          Snapshot: Main {snapshot.mainVersion}. No pick rate, win rate, or run sample is displayed
          here unless a source is independently verified for this exact snapshot.
        </p>
      </section>
    </aside>
  );
}

function CardsWorkspace() {
  const [pool, setPool] = useState<CardPool>("ironclad");
  const [selectedId, setSelectedId] = useState(() => defaultCardForPool("ironclad").id);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [rarityFilter, setRarityFilter] = useState("All");
  const [sort, setSort] = useState<SortMode>("tier");

  const poolCards = useMemo(() => cards.filter((card) => card.pool === pool), [pool]);
  const types = useMemo(
    () => ["All", ...Array.from(new Set(poolCards.map((card) => card.type))).sort()],
    [poolCards],
  );
  const rarities = useMemo(
    () => ["All", ...Array.from(new Set(poolCards.map((card) => card.rarity))).sort()],
    [poolCards],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("en-US");
    const list = poolCards.filter((card) => {
      if (query && !card.name.toLocaleLowerCase("en-US").includes(query)) return false;
      if (typeFilter !== "All" && card.type !== typeFilter) return false;
      if (rarityFilter !== "All" && card.rarity !== rarityFilter) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const tierDelta = (tierIndex.get(a.tier) ?? 99) - (tierIndex.get(b.tier) ?? 99);
      return tierDelta || a.name.localeCompare(b.name);
    });
  }, [poolCards, rarityFilter, search, sort, typeFilter]);

  const selected =
    filtered.find((card) => card.id === selectedId) ??
    poolCards.find((card) => card.id === selectedId) ??
    filtered[0] ??
    poolCards[0]!;

  const sCards = poolCards.filter((card) => card.tier === "S");
  const sTypeCounts = new Map<string, number>();
  for (const card of sCards) sTypeCounts.set(card.type, (sTypeCounts.get(card.type) ?? 0) + 1);
  const dominantSType =
    [...sTypeCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ??
    "N/A";
  const zeroCostS = sCards.filter((card) => card.cost === 0).length;
  const needsReview = poolCards.filter((card) => card.tier === "Needs Review").length;

  const choosePool = (next: CardPool) => {
    setPool(next);
    setSearch("");
    setTypeFilter("All");
    setRarityFilter("All");
    setSelectedId(defaultCardForPool(next).id);
  };

  return (
    <>
      <section className={styles.sectionIntro} aria-labelledby="cards-title">
        <div>
          <p className={styles.kicker}>SLAY THE SPIRE 2 CARD TIER LIST</p>
          <h2 id="cards-title">Cards</h2>
          <p>
            The Slay the Spire 2 card tier list compares baseline card value by current Main card
            pool. The broader card ranking is contextual: tier does not mean automatic pick.
          </p>
        </div>
        <div className={styles.contextNote}>
          Deck, relics, route, encounters and the current run can change the right choice.
        </div>
      </section>

      <div className={styles.poolTabs} role="tablist" aria-label="Slay the Spire 2 card pools">
        {cardPools.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            data-pool-tab={item}
            aria-selected={pool === item}
            aria-controls="card-tier-workspace"
            onKeyDown={(event) => moveTab(event, cardPools, pool, choosePool, "data-pool-tab")}
            onClick={() => choosePool(item)}
          >
            <span>{cardPoolName(item)}</span>
            <small>{cards.filter((card) => card.pool === item).length}</small>
          </button>
        ))}
      </div>

      <div className={styles.filters} aria-label="Card filters">
        <label>
          <span className={styles.srOnly}>Search cards</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search cards…"
            aria-label="Search cards"
          />
        </label>
        <label>
          <span>Type</span>
          <select
            aria-label="Type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
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
            {rarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select
            aria-label="Sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
          >
            <option value="tier">Tier</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className={styles.cardWorkspace} id="card-tier-workspace" role="tabpanel">
        <div className={styles.tierBoard} aria-label={`${cardPoolName(pool)} Card Tier Board`}>
          {filtered.length === 0 ? (
            <div className={styles.empty} role="status">
              No cards match the current filters.
            </div>
          ) : sort === "name" ? (
            <div className={styles.cardGrid} data-name-sort-grid>
              {filtered.map((card) => (
                <CardOption
                  key={card.id}
                  card={card}
                  selected={selected.id === card.id}
                  showTier
                  onSelect={() => setSelectedId(card.id)}
                />
              ))}
            </div>
          ) : (
            cardTierOrder.map((tier) => {
              const tierCards = filtered.filter((card) => card.tier === tier);
              if (tierCards.length === 0) return null;
              return (
                <section key={tier} className={styles.tierRow} data-tier-row={tier}>
                  <div className={styles.tierLabel} data-tier={tier}>
                    <strong>{tier === "Needs Review" ? "NR" : tier}</strong>
                    <span>
                      {tier === "S"
                        ? "Exceptional baseline"
                        : tier === "A"
                          ? "Strong baseline"
                          : tier === "B"
                            ? "Solid / contextual"
                            : tier === "C"
                              ? "Situational"
                              : tier === "D"
                                ? "Narrow baseline"
                                : "Not independently ranked"}
                    </span>
                  </div>
                  <div className={styles.cardGrid}>
                    {tierCards.map((card) => (
                      <CardOption
                        key={card.id}
                        card={card}
                        selected={selected.id === card.id}
                        showTier={false}
                        onSelect={() => setSelectedId(card.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
        <CardDetail card={selected} />
      </div>

      <section
        className={styles.insights}
        aria-labelledby="insights-title"
        data-ia-section="quick-insights"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>QUICK INSIGHTS</p>
          <h2 id="insights-title">{cardPoolName(pool)} snapshot signals</h2>
        </div>
        <div className={styles.insightGrid}>
          <article>
            <strong>{sCards.length}</strong>
            <span>S-tier cards</span>
            <p>Reviewed Main source placements in this pool.</p>
          </article>
          <article>
            <strong>{dominantSType}</strong>
            <span>Most common S-tier type</span>
            <p>Derived from the same current pool.</p>
          </article>
          <article>
            <strong>{zeroCostS}</strong>
            <span>Zero-cost S-tier cards</span>
            <p>Uses verified Main cost data.</p>
          </article>
          <article>
            <strong>{needsReview}</strong>
            <span>Needs Review</span>
            <p>No tier is invented for uncovered cards.</p>
          </article>
        </div>
      </section>
    </>
  );
}

function RelicsPanel() {
  return (
    <section aria-labelledby="relics-title" className={styles.secondaryPanel}>
      <div className={styles.sectionIntro}>
        <div>
          <p className={styles.kicker}>SLAY THE SPIRE 2 RELIC TIER LIST</p>
          <h2 id="relics-title">Relics</h2>
          <p>
            All {snapshot.counts.relics} current Main relic records are shown. The source uses
            extended S–G buckets; those labels are preserved exactly rather than converted into a
            new scoring model.
          </p>
        </div>
        <div className={styles.contextNote}>
          G includes class-specific relics in the cited source. It must not be read as a universal
          “bad relic” grade.
        </div>
      </div>
      <div className={styles.secondaryGroups}>
        {relicTierOrder.map((tier) => {
          const items = relics.filter((relic) => relic.tier === tier);
          if (!items.length) return null;
          return (
            <section key={tier} className={styles.secondaryGroup} data-relic-tier={tier}>
              <h3 data-tier={tier}>{tier}</h3>
              <div className={styles.secondaryGrid}>
                {items.map((relic) => (
                  <article key={relic.id} className={styles.entityCard}>
                    <Image src={relic.image} alt="" width={54} height={54} loading="lazy" />
                    <div>
                      <h4>{relic.name}</h4>
                      <p>{formatSlayGameText(relic.description)}</p>
                      <small>
                        {relic.rarity} · {relic.pool}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function CharactersPanel() {
  return (
    <section aria-labelledby="characters-title" className={styles.secondaryPanel}>
      <div className={styles.sectionIntro}>
        <div>
          <p className={styles.kicker}>SLAY THE SPIRE 2 CHARACTER TIER LIST</p>
          <h2 id="characters-title">Characters</h2>
          <p>
            Five current Main characters. The source uses Top / Middle / Last, so TierListBase keeps
            those labels instead of inventing S/A/B conversions.
          </p>
        </div>
        <div className={styles.contextNote}>
          Community-uploaded runs inform this ranking; Mega Crit does not publish official win rates
          by character.
        </div>
      </div>
      <div className={styles.characterGroups}>
        {rankOrder.map((rank) => (
          <section key={rank} className={styles.characterRank}>
            <h3>{rank}</h3>
            <div className={styles.characterGrid}>
              {characters
                .filter((character) => character.rank === rank)
                .map((character) => (
                  <article
                    key={character.id}
                    className={styles.characterCard}
                    data-character-id={character.id.toLocaleLowerCase("en-US")}
                  >
                    <Image src={character.image} alt="" width={86} height={86} loading="lazy" />
                    <div>
                      <h4>{character.name}</h4>
                      <p>
                        <strong>Strengths:</strong> {character.strengths}
                      </p>
                      <p>
                        <strong>Limitations:</strong> {character.limitations}
                      </p>
                      <p>
                        <strong>Playstyle:</strong> {character.playstyle}
                      </p>
                      <small>
                        {character.rank} · Starting HP: {character.startingHp}
                      </small>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function PotionsPanel() {
  return (
    <section aria-labelledby="potions-title" className={styles.secondaryPanel}>
      <div className={styles.sectionIntro}>
        <div>
          <p className={styles.kicker}>SLAY THE SPIRE 2 POTION TIER LIST</p>
          <h2 id="potions-title">Potions</h2>
          <p>
            All {snapshot.counts.potions} {snapshot.mainVersion} Main potions are mapped to the
            cited S/A/B/C/D/F source list. Use context still depends on the fight, potion slots and
            route.
          </p>
        </div>
      </div>
      <div className={styles.secondaryGroups}>
        {potionTierOrder.map((tier) => {
          const items = potions.filter((potion) => potion.tier === tier);
          if (!items.length) return null;
          return (
            <section key={tier} className={styles.secondaryGroup} data-potion-tier={tier}>
              <h3 data-tier={tier}>{tier}</h3>
              <div className={styles.secondaryGrid}>
                {items.map((potion) => (
                  <article key={potion.id} className={styles.entityCard}>
                    <Image src={potion.image} alt="" width={54} height={54} loading="lazy" />
                    <div>
                      <h4>{potion.name}</h4>
                      <p>{formatSlayGameText(potion.description)}</p>
                      <small>
                        {potion.rarity} · {potion.pool}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

const faq = [
  [
    "What are the best cards in the Slay the Spire 2 card tier list?",
    `There is no automatic best pick. This Slay the Spire 2 card tier list shows reviewed baseline Main ${snapshot.mainVersion} placements, but deck, relics, route, encounters and current run context can make a lower-tier card the correct choice.`,
  ],
  [
    "What is the best character in the Slay the Spire 2 character tier list?",
    "The cited 1 November 2026 community review places the Silent and Regent together in the Top group. The gaps are small, and the figures are community-uploaded runs rather than official Mega Crit character win rates.",
  ],
  [
    "Why can an S-tier card still be a bad pick?",
    "An S-tier label describes strong baseline value, not an instruction to take the card. Opportunity cost, deck size, energy, relics, planned encounters and the route can all change the decision.",
  ],
  [
    "Does the Slay the Spire 2 tier list use Main or Beta?",
    `Rankings use Main ${snapshot.mainVersion}. Beta ${snapshot.betaVersion} is tracked as change context only and is not mixed into Main placements.`,
  ],
  [
    "How often is the Slay the Spire 2 tier list updated?",
    "The snapshot is reviewed when a verified Main patch, ranking source or material balance change affects the page. Planned future patches are not pre-applied.",
  ],
  [
    "Does TierListBase show card pick rates and win rates?",
    "Not in this snapshot. No card-level statistic is displayed unless it can be verified for the exact Main snapshot and source scope; design-mock numbers were deliberately excluded.",
  ],
];

export function SlayTheSpire2TierList() {
  const [section, setSection] = useState<RankingSection>("cards");
  const sectionKeys = rankingSections.map((item) => item.key);

  return (
    <main className={styles.page}>
      <section className={styles.hero} data-ia-section="hero" aria-labelledby="page-title">
        <img className={styles.heroArt} src="/images/slay-the-spire-2/hero-spire.svg" alt="" />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span>Slay the Spire 2</span>
            <span aria-hidden="true">›</span>
            <span>Tier List</span>
          </nav>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>SLAY THE SPIRE 2</p>
            <h1 id="page-title">Slay the Spire 2 Tier List</h1>
            <p>
              Use this Slay the Spire 2 tier list to compare current Main cards, relics, characters
              and potions using traceable game data and reviewed ranking evidence. Tier does not
              mean automatic pick.
            </p>
          </div>
          <div className={styles.snapshotBar} aria-label="Ranking snapshot">
            <div>
              <span>Main</span>
              <strong>{snapshot.mainVersion}</strong>
            </div>
            <div>
              <span>Beta context</span>
              <strong>{snapshot.betaVersion}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{snapshot.releaseStatus}</strong>
            </div>
            <div>
              <span>Snapshot</span>
              <strong>{snapshotDateLabel(snapshot.date)}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.shell}>
        <section className={styles.rankingContext} aria-label="Ranking Context">
          <strong>Ranking Context</strong>
          <p>
            The Slay the Spire 2 tier list uses Main {snapshot.mainVersion}. Beta{" "}
            {snapshot.betaVersion} is documented separately. Card value is contextual: baseline
            value, consistency, deck flexibility, opportunity cost, scaling and verified evidence
            inform the review without creating a hidden numeric score. Use the ranking tabs for the
            Slay the Spire 2 relic tier list and Slay the Spire 2 character tier list.
          </p>
        </section>

        <div
          className={styles.rankingTabs}
          role="tablist"
          aria-label="Slay the Spire 2 ranking systems"
        >
          {rankingSections.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              data-ranking-tab={item.key}
              aria-selected={section === item.key}
              aria-controls="ranking-panel"
              onClick={() => setSection(item.key)}
              onKeyDown={(event) =>
                moveTab(event, sectionKeys, section, setSection, "data-ranking-tab")
              }
            >
              <strong>{item.label}</strong>
              <span>{item.note}</span>
            </button>
          ))}
        </div>

        <div id="ranking-panel" role="tabpanel" className={styles.rankingPanel}>
          {section === "cards" ? <CardsWorkspace /> : null}
          {section === "relics" ? <RelicsPanel /> : null}
          {section === "characters" ? <CharactersPanel /> : null}
          {section === "potions" ? <PotionsPanel /> : null}
        </div>

        <section
          className={styles.changed}
          id="changes"
          data-ia-section="what-changed"
          aria-labelledby="changes-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>WHAT CHANGED</p>
            <h2 id="changes-title">Initial Reviewed Snapshot</h2>
          </div>
          <div className={styles.changeGrid}>
            <article>
              <strong>Main {snapshot.mainVersion}</strong>
              <p>
                First reviewed Slay the Spire 2 tier list snapshot. There is no previous reviewed
                TierListBase snapshot, so no A→S or S→B movements are fabricated.
              </p>
            </article>
            <article>
              <strong>Beta {snapshot.betaVersion}</strong>
              <p>
                Tracked as change context only. Beta-only balance changes are not mixed into the
                current Main rankings.
              </p>
            </article>
          </div>
        </section>

        <div className={styles.infoGrid}>
          <section
            className={styles.infoPanel}
            data-ia-section="methodology"
            aria-labelledby="methodology-title"
          >
            <p className={styles.kicker}>METHODOLOGY</p>
            <h2 id="methodology-title">How this Slay the Spire 2 tier list works</h2>
            <ol>
              <li>
                <strong>Current snapshot:</strong> Main {snapshot.mainVersion}, reviewed{" "}
                {snapshot.lastReviewed}.
              </li>
              <li>
                <strong>Tier means baseline:</strong> the Slay the Spire 2 tier list is a starting
                point for comparison, not an automatic pick.
              </li>
              <li>
                <strong>Context matters:</strong> deck, relics, route, encounters, energy and
                current run state can change value.
              </li>
              <li>
                <strong>Evidence stays separate:</strong> game object facts come from{" "}
                {snapshot.mainVersion} data; editorial/community placements keep their own source.
              </li>
              <li>
                <strong>No fake completeness:</strong> {snapshot.counts.cardsNeedsReview} cards and{" "}
                {snapshot.counts.relicsNeedsReview} relics remain Needs Review where evidence did
                not cover them.
              </li>
              <li>
                <strong>Known limit:</strong> no card-level pick rate, win rate or sample size is
                presented for this exact Main snapshot.
              </li>
            </ol>
          </section>

          <section
            className={styles.infoPanel}
            data-ia-section="sources-evidence"
            aria-labelledby="sources-title"
          >
            <p className={styles.kicker}>SOURCES &amp; EVIDENCE</p>
            <h2 id="sources-title">Traceable snapshot sources</h2>
            <div className={styles.sources}>
              {sources.map((source) => (
                <article key={source.id}>
                  <span>{source.category}</span>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                  <p>{source.note}</p>
                </article>
              ))}
            </div>
            <p className={styles.disclaimer}>
              The Slay the Spire 2 tier list is independent third-party analysis from TierListBase
              and is not affiliated with Mega Crit. Community and editorial rankings are not
              official game balance statements.
            </p>
          </section>
        </div>

        <section className={styles.faq} data-ia-section="faq" aria-labelledby="faq-title">
          <p className={styles.kicker}>FAQ</p>
          <h2 id="faq-title">Slay the Spire 2 tier list questions</h2>
          <div className={styles.faqGrid}>
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
