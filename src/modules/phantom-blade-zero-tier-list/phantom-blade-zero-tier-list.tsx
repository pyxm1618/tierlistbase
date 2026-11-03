"use client";

import { useMemo, useState } from "react";

import {
  getPhantomBladeZeroReleaseReadiness,
  phantomBladeZeroSnapshot,
  type ReviewedRankingEntity,
  type ReviewStatus,
} from "./data";
import { PHANTOM_BLADE_ZERO_SEO } from "./seo";
import styles from "./phantom-blade-zero-tier-list.module.css";

type WorkspaceKind = "main_weapon" | "phantom_edge";

const tierOrder: readonly ReviewStatus[] = ["S", "A", "B", "C", "Needs Review", "Pending"];

function sourceName(sourceId: string) {
  return (
    phantomBladeZeroSnapshot.sources.find((source) => source.id === sourceId)?.name ?? sourceId
  );
}

function sourceUrl(sourceId: string) {
  return phantomBladeZeroSnapshot.sources.find((source) => source.id === sourceId)?.url ?? "#";
}

function placementLabel(entity: ReviewedRankingEntity, sourceId: string) {
  const placement = entity.placements.find((entry) => entry.sourceId === sourceId);
  if (!placement) return "Not rated";
  return placement.method === "tier"
    ? `${placement.tier} tier`
    : `#${placement.rank} of ${placement.fieldSize}`;
}

function EntityDetail({ entity }: { readonly entity: ReviewedRankingEntity }) {
  return (
    <article className={styles.detail} aria-live="polite" data-testid="entity-detail">
      <div className={styles.detailHeading}>
        <div>
          <p className={styles.eyebrow}>
            {entity.kind === "main_weapon" ? "Main Weapon" : "Phantom Edge"}
          </p>
          <h3>{entity.name}</h3>
        </div>
        <span className={styles.largeTier}>{entity.finalTier}</span>
      </div>

      <div className={styles.factGrid}>
        <div>
          <span>Independent sources</span>
          <strong>{entity.independentSourceCount}</strong>
        </div>
        <div>
          <span>Category</span>
          <strong>{entity.category}</strong>
        </div>
        <div>
          <span>Ease of use</span>
          <strong>{entity.easeOfUse}</strong>
        </div>
        <div>
          <span>Consensus before review</span>
          <strong>{entity.consensusTier ?? "Pending"}</strong>
        </div>
      </div>

      <section>
        <h4>Best For</h4>
        <ul className={styles.tagList}>
          {entity.bestFor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <div className={styles.twoColumn}>
        <section>
          <h4>Strengths</h4>
          <ul>
            {entity.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Limitations</h4>
          <ul>
            {entity.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h4>Why This Tier</h4>
        <p>{entity.whyThisTier}</p>
      </section>

      <section>
        <h4>How to Get</h4>
        <p>{entity.acquisition}</p>
      </section>

      <section>
        <h4>Key Mechanics</h4>
        <ul className={styles.tagList}>
          {entity.mechanics.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Source Placements</h4>
        <div className={styles.evidenceList}>
          {entity.placements.map((placement) => (
            <a
              key={placement.sourceId}
              href={sourceUrl(placement.sourceId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{sourceName(placement.sourceId)}</span>
              <strong>{placementLabel(entity, placement.sourceId)}</strong>
            </a>
          ))}
        </div>
      </section>

      <p className={styles.assetNotice}>
        P0 entity image is intentionally omitted until a verified local WebP/AVIF derivative with
        complete provenance is committed.
      </p>
    </article>
  );
}

export function PhantomBladeZeroTierListPage() {
  const readiness = getPhantomBladeZeroReleaseReadiness();
  const [kind, setKind] = useState<WorkspaceKind>("main_weapon");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(
    phantomBladeZeroSnapshot.mainWeapons[0]?.id ?? "",
  );

  const entities =
    kind === "main_weapon"
      ? phantomBladeZeroSnapshot.mainWeapons
      : phantomBladeZeroSnapshot.phantomEdges;

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(entities.map((entity) => entity.category)))],
    [entities],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entities.filter(
      (entity) =>
        (category === "All" || entity.category === category) &&
        (!normalized ||
          entity.name.toLowerCase().includes(normalized) ||
          entity.bestFor.some((value) => value.toLowerCase().includes(normalized))),
    );
  }, [category, entities, query]);

  const selected =
    filtered.find((entity) => entity.id === selectedId) ??
    filtered[0] ??
    entities.find((entity) => entity.id === selectedId) ??
    entities[0];

  function switchKind(next: WorkspaceKind) {
    const nextEntities =
      next === "main_weapon"
        ? phantomBladeZeroSnapshot.mainWeapons
        : phantomBladeZeroSnapshot.phantomEdges;
    setKind(next);
    setQuery("");
    setCategory("All");
    setSelectedId(nextEntities[0]?.id ?? "");
  }

  function clearFilters() {
    setQuery("");
    setCategory("All");
  }

  const independentRankingSources = new Set(
    phantomBladeZeroSnapshot.sources
      .filter((source) => source.nature === "ranking")
      .map((source) => source.independenceGroup),
  ).size;

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.shell}>
          <div className={styles.heroTopline}>
            <span className={styles.previewBadge}>Preview · NOT READY</span>
            <span>Launch evidence snapshot</span>
          </div>
          <h1>{PHANTOM_BLADE_ZERO_SEO.h1}</h1>
          <p className={styles.heroCopy}>
            Evidence-first rankings for verified primary weapons and Phantom Edges. Every published
            tier requires at least two independent ranking signals; unresolved conflicts stay
            visible instead of being guessed away.
          </p>

          <div className={styles.heroStats}>
            <div>
              <span>Snapshot Date</span>
              <strong>{phantomBladeZeroSnapshot.snapshotDate}</strong>
            </div>
            <div>
              <span>Verified Main Weapons</span>
              <strong>{phantomBladeZeroSnapshot.mainWeapons.length}</strong>
            </div>
            <div>
              <span>Verified Phantom Edges</span>
              <strong>{phantomBladeZeroSnapshot.phantomEdges.length}</strong>
            </div>
            <div>
              <span>Independent Ranking Sources</span>
              <strong>{independentRankingSources}</strong>
            </div>
          </div>

          <p className={styles.coverageNote}>
            Official announced scale: {phantomBladeZeroSnapshot.officialScale.mainWeapons} main
            weapons and {phantomBladeZeroSnapshot.officialScale.phantomEdges} Phantom Edges.
            TierListBase coverage is intentionally smaller and only counts reviewed entities.
          </p>

          <div className={styles.releaseGate} data-testid="p0-release-gate">
            P0 assets: {readiness.verified}/{readiness.required} verified locally ·{" "}
            {readiness.missing.length} missing · release remains NOT READY.
          </div>
        </div>
      </header>

      <div className={styles.shell}>
        <section className={styles.section} aria-labelledby="quick-picks-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Evidence-backed shortcuts</p>
              <h2 id="quick-picks-title">Quick Picks</h2>
            </div>
          </div>
          <div className={styles.quickGrid}>
            {phantomBladeZeroSnapshot.quickPicks.map((pick) => {
              const entity = [
                ...phantomBladeZeroSnapshot.mainWeapons,
                ...phantomBladeZeroSnapshot.phantomEdges,
              ].find((item) => item.id === pick.entityId);
              if (!entity) return null;
              return (
                <article key={pick.label} className={styles.quickCard}>
                  <span>{pick.label}</span>
                  <strong>{entity.name}</strong>
                  <p>{pick.reason}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="ranking-workspace-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Consensus workspace</p>
              <h2 id="ranking-workspace-title">Ranking Workspace</h2>
            </div>
            <div className={styles.tabs} role="tablist" aria-label="Ranking type">
              <button
                type="button"
                role="tab"
                aria-selected={kind === "main_weapon"}
                onClick={() => switchKind("main_weapon")}
              >
                Main Weapons
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={kind === "phantom_edge"}
                onClick={() => switchKind("phantom_edge")}
              >
                Phantom Edges
              </button>
            </div>
          </div>

          <div className={styles.controls}>
            <label>
              <span>Search</span>
              <input
                type="search"
                aria-label={kind === "main_weapon" ? "Search main weapons" : "Search Phantom Edges"}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or use case"
              />
            </label>
            <label>
              <span>Category</span>
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className={styles.clearButton} onClick={clearFilters}>
              Clear filters
            </button>
          </div>

          <div className={styles.workspace}>
            <div className={styles.board} data-testid="tier-board">
              {tierOrder.map((tier) => {
                const tierEntities = filtered.filter((entity) => entity.finalTier === tier);
                if (tierEntities.length === 0) return null;
                return (
                  <section key={tier} className={styles.tierRow} aria-label={`${tier} tier`}>
                    <div className={styles.tierLabel}>{tier}</div>
                    <div className={styles.tierItems}>
                      {tierEntities.map((entity) => (
                        <button
                          key={entity.id}
                          type="button"
                          className={styles.entityButton}
                          aria-pressed={selected?.id === entity.id}
                          onClick={() => setSelectedId(entity.id)}
                        >
                          <span>{entity.name}</span>
                          <small>{entity.independentSourceCount} sources</small>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}

              {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  No reviewed entities match these filters. Clear filters to restore the snapshot.
                </div>
              ) : null}
            </div>

            {selected ? <EntityDetail entity={selected} /> : null}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="methodology-title">
          <div className={styles.proseCard}>
            <p className={styles.eyebrow}>Reproducible rules</p>
            <h2 id="methodology-title">Ranking Methodology</h2>
            <p>
              TierListBase only counts post-launch sources that actually compare multiple weapons.
              Missing coverage is ignored rather than scored as zero. Tier sources normalize S/A/B/C
              to 1.0/0.7/0.4/0.1; ordinal lists normalize relative position from first to last.
            </p>
            <p>
              An entity needs at least two independent valid ranking sources to leave Pending. If
              normalized source scores differ by 0.5 or more, the result becomes Needs Review rather
              than forcing a tier. No manual overrides are present in this snapshot.
            </p>
            <p>
              Internal normalized scores exist only to make the calculation repeatable. They are not
              displayed as a fake precision rating.
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="sources-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Audit trail</p>
              <h2 id="sources-title">Sources &amp; Evidence</h2>
            </div>
          </div>

          <div className={styles.sourceColumns}>
            {(
              [
                ["Official Facts", "official"],
                ["Ranking Sources", "ranking"],
                ["Supporting Data", "supporting"],
              ] as const
            ).map(([label, nature]) => (
              <section key={nature} className={styles.sourceCard}>
                <h3>{label}</h3>
                <ul>
                  {phantomBladeZeroSnapshot.sources
                    .filter((source) => source.nature === nature)
                    .map((source) => (
                      <li key={source.id}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.name}
                        </a>
                        {source.methodology ? <p>{source.methodology}</p> : null}
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>

          <p className={styles.disclaimer}>
            TierListBase is an independent third-party website and is not affiliated with or
            endorsed by S-GAME or PlayStation.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="changes-title">
          <div className={styles.proseCard}>
            <h2 id="changes-title">What Changed</h2>
            <p>{phantomBladeZeroSnapshot.whatChanged}</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="faq-title">
          <div className={styles.proseCard}>
            <h2 id="faq-title">FAQ</h2>
            <details>
              <summary>Why are there fewer weapons here than the official arsenal size?</summary>
              <p>
                Official arsenal size and TierListBase coverage are separate. This first snapshot
                only includes entities whose identity and ranking evidence were independently
                reviewed.
              </p>
            </details>
            <details>
              <summary>Why can a Phantom Edge be marked Needs Review?</summary>
              <p>
                The current Phantom Edge evidence mixes a general-utility tier list with a raw card
                Damage ordering. Large disagreement between those methods is exposed instead of
                silently averaged away.
              </p>
            </details>
            <details>
              <summary>Does TierListBase use Reddit votes to set tiers?</summary>
              <p>
                No. Community discussion can be a validation signal, but it does not directly decide
                a tier in this snapshot.
              </p>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}
