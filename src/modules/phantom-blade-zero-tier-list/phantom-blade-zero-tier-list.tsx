"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getPhantomBladeZeroReleaseReadiness,
  phantomBladeZeroSnapshot,
  type ReviewedRankingEntity,
  type ReviewStatus,
} from "./data";
import { phantomBladeZeroAssetProvenance } from "./asset-provenance";
import styles from "./phantom-blade-zero-tier-list.module.css";

type WorkspaceKind = "main_weapon" | "phantom_edge";

const tierOrder: readonly ReviewStatus[] = ["S", "A", "B", "C", "Needs Review", "Pending"];

const heroAsset = phantomBladeZeroAssetProvenance.find((asset) => asset.role === "hero");

function entityAsset(entityId: string) {
  return phantomBladeZeroAssetProvenance.find(
    (asset) => asset.role === "tier_icon" && asset.entityId === entityId,
  );
}

function LazyTierIcon({ entityId }: { readonly entityId: string }) {
  const asset = entityAsset(entityId);
  const slotRef = useRef<HTMLSpanElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot || shouldLoad) return;

    if (!("IntersectionObserver" in window)) {
      const timeoutId = setTimeout(() => setShouldLoad(true), 0);
      return () => clearTimeout(timeoutId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(slot);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <span ref={slotRef} className={styles.tierImageSlot} data-tier-image-slot={entityId}>
      {shouldLoad && asset?.localPath ? (
        <Image
          src={asset.localPath}
          alt=""
          width={56}
          height={56}
          sizes="56px"
          className={styles.tierImage}
          data-p0-role="tier-icon"
          data-entity-id={entityId}
        />
      ) : null}
    </span>
  );
}

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
  const asset = entityAsset(entity.id);

  return (
    <article className={styles.detail} aria-live="polite" data-testid="entity-detail">
      <div className={styles.detailHeading}>
        <div className={styles.detailIdentity}>
          {asset?.localPath ? (
            <Image
              src={asset.localPath}
              alt=""
              width={96}
              height={96}
              sizes="96px"
              className={styles.detailImage}
              data-p0-role="detail"
              data-entity-id={entity.id}
            />
          ) : null}
          <div>
            <p className={styles.eyebrow}>
              {entity.kind === "main_weapon" ? "Main Weapon" : "Phantom Edge"}
            </p>
            <h3>{entity.name}</h3>
          </div>
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
    </article>
  );
}

export function PhantomBladeZeroTierListPage() {
  const readiness = getPhantomBladeZeroReleaseReadiness();
  const [kind, setKind] = useState<WorkspaceKind>("main_weapon");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(phantomBladeZeroSnapshot.mainWeapons[0]?.id ?? "");

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
    <main className={styles.page} data-testid="pbz-page">
      <header className={styles.hero}>
        {heroAsset?.localPath ? (
          <Image
            src={heroAsset.localPath}
            alt=""
            fill
            priority
            quality={78}
            sizes="100vw"
            className={styles.heroImage}
            data-p0-role="hero"
          />
        ) : null}
        <div className={styles.shell}>
          <div className={styles.heroTopline}>
            <span className={styles.previewBadge}>PHANTOM BLADE ZERO</span>
            <span>Independent · Evidence-Based · Multi-Source Consensus</span>
          </div>
          <h1>
            <span>Phantom Blade Zero</span> <em>Tier List</em>
          </h1>
          <p className={styles.heroCopy}>
            Use this <strong>Phantom Blade Zero tier list</strong> to compare verified Main Weapons
            and Phantom Edges through independent ranking evidence, strengths, weaknesses, and
            practical use cases. The <strong>Phantom Blade Zero weapon tier list</strong> publishes
            a tier only when at least two independent comprehensive rankings support it. The
            <strong> Phantom Blade Zero tier list</strong> therefore separates verified identity
            from ranked consensus. The <strong>Phantom Blade Zero tier list</strong> remains
            source-led.
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
            Coverage note: this <strong>Phantom Blade Zero tier list</strong> reviews 21 verified
            Main Weapons and 14 verified Phantom Edges; it does not treat the full announced arsenal
            as ranked evidence.
          </p>

          <div className={styles.releaseGate} data-testid="p0-release-gate">
            P0 assets: {readiness.verified}/{readiness.required} verified locally ·{" "}
            {readiness.missing.length} missing
            {readiness.ready ? "." : " · release remains NOT READY."}
          </div>
        </div>
      </header>

      <div className={`${styles.shell} ${styles.bodyGrid}`}>
        <div className={styles.mainColumn}>
          <section
            className={`${styles.section} ${styles.quickSection}`}
            aria-labelledby="quick-picks-title"
          >
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Evidence-backed shortcuts</p>
                <h2 id="quick-picks-title">Quick Picks</h2>
              </div>
            </div>
            <p className={styles.sectionIntro}>
              Quick Picks summarize the clearest recommendations from the
              <strong> Phantom Blade Zero tier list</strong> without replacing the evidence below.
              The <strong>Phantom Blade Zero tier list</strong> keeps every shortcut tied to the
              same source rules used in the full workspace.
            </p>
            <div className={styles.quickGrid}>
              {phantomBladeZeroSnapshot.quickPicks.map((pick) => {
                const entity = [
                  ...phantomBladeZeroSnapshot.mainWeapons,
                  ...phantomBladeZeroSnapshot.phantomEdges,
                ].find((item) => item.id === pick.entityId);
                if (!entity) return null;
                return (
                  <article key={pick.label} className={styles.quickCard}>
                    {entityAsset(entity.id)?.localPath ? (
                      <Image
                        src={entityAsset(entity.id)!.localPath!}
                        alt=""
                        width={64}
                        height={64}
                        sizes="64px"
                        className={styles.quickImage}
                        data-p0-role="quick-pick"
                        data-entity-id={entity.id}
                      />
                    ) : null}
                    <span>{pick.label}</span>
                    <strong>{entity.name}</strong>
                    <p>{pick.reason}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.rankingSection}`}
            aria-labelledby="ranking-workspace-title"
          >
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

            <p className={styles.sectionIntro}>
              The default <strong>Phantom Blade Zero weapons tier list</strong> view covers Main
              Weapons. Switch to Phantom Edges to inspect the current
              <strong> Phantom Blade Zero Phantom Edge tier list</strong>. The
              <strong> Phantom Blade Zero tier list</strong> keeps missing source coverage neutral
              rather than scoring it as zero. The{" "}
              <strong>Phantom Blade Zero Phantom Edges tier list</strong> remains evidence-gated
              until another qualifying comprehensive ranking source exists.
            </p>

            <div className={styles.controls}>
              <label>
                <span>Search</span>
                <input
                  type="search"
                  aria-label={
                    kind === "main_weapon" ? "Search main weapons" : "Search Phantom Edges"
                  }
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
                            <LazyTierIcon entityId={entity.id} />
                            <span className={styles.entityText}>
                              <span>{entity.name}</span>
                              <small>{entity.independentSourceCount} sources</small>
                            </span>
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
        </div>

        <aside className={styles.rail} aria-label="Ranking evidence and methodology">
          <section
            className={`${styles.section} ${styles.methodSection}`}
            aria-labelledby="methodology-title"
          >
            <div className={styles.proseCard}>
              <p className={styles.eyebrow}>Reproducible rules</p>
              <h2 id="methodology-title">Ranking Methodology</h2>
              <p>
                The <strong>Phantom Blade Zero tier list</strong> counts only qualifying
                comprehensive editorial rankings. The{" "}
                <strong>Phantom Blade Zero weapons tier list</strong>
                ignores missing placements instead of scoring them as zero.
              </p>
              <p>
                An entity needs at least two independent comprehensive ranking sources to leave
                Pending. The <strong>Phantom Blade Zero tier list</strong> uses Needs Review when
                qualifying sources disagree enough that a precise consensus tier would overstate the
                evidence. The <strong>Phantom Blade Zero tier list</strong> is deliberately
                conservative when independent evidence is incomplete.
              </p>
              <p>
                The <strong>Phantom Blade Zero Phantom Edge tier list</strong> does not convert
                utility guides, unlock guides, or objective card statistics into a second tier vote.
                Internal normalized scores are calculation tools, not public fake-precision ratings.
              </p>
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.sourcesSection}`}
            aria-labelledby="sources-title"
          >
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Audit trail</p>
                <h2 id="sources-title">Sources &amp; Evidence</h2>
              </div>
            </div>

            <p className={styles.sectionIntro}>
              Sources for the <strong>Phantom Blade Zero tier list</strong> are separated by what
              they can prove. The <strong>Phantom Blade Zero weapon tier list</strong> currently has
              two qualifying comprehensive Main Weapon sources; supporting data cannot cast a Final
              Tier vote. For the <strong>Phantom Blade Zero tier list</strong>, official facts can
              verify identity or mechanics without becoming ranking votes.
            </p>

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
              TierListBase publishes this <strong>Phantom Blade Zero tier list</strong>{" "}
              independently and is not affiliated with or endorsed by S-GAME or PlayStation.
            </p>
          </section>

          <section
            className={`${styles.section} ${styles.changesSection}`}
            aria-labelledby="changes-title"
          >
            <div className={styles.proseCard}>
              <h2 id="changes-title">What Changed</h2>
              <p>
                This is the first reviewed <strong>Phantom Blade Zero tier list</strong> snapshot.
                No previous verified TierListBase snapshot exists, so no tier movement is claimed.
                This <strong>Phantom Blade Zero tier list</strong> is the release baseline.
              </p>
            </div>
          </section>

          <section className={`${styles.section} ${styles.faqSection}`} aria-labelledby="faq-title">
            <div className={styles.proseCard}>
              <h2 id="faq-title">FAQ</h2>
              <details>
                <summary>How does the Phantom Blade Zero tier list decide a rank?</summary>
                <p>
                  Verified identity and ranking consensus are separate. A weapon stays Pending until
                  two independent comprehensive rankings cover it.
                </p>
              </details>
              <details>
                <summary>Why does the Phantom Blade Zero tier list show Pending?</summary>
                <p>
                  Pending means the entity is verified but does not yet have enough independent
                  comprehensive ranking evidence for a formal tier. The{" "}
                  <strong>Phantom Blade Zero Phantom Edges tier list</strong> therefore stays
                  Pending until another qualifying comprehensive ranking source appears. The{" "}
                  <strong>Phantom Blade Zero Phantom Edges tier list</strong> uses separate
                  evidence.
                </p>
              </details>
              <details>
                <summary>
                  Does the Phantom Blade Zero weapons tier list mix Main Weapons and Phantom Edges?
                </summary>
                <p>
                  No. Main Weapons and boss-derived Phantom Edges stay separate because their combat
                  roles and evidence coverage differ.
                </p>
              </details>
              <details>
                <summary>What does Needs Review mean in the Phantom Blade Zero tier list?</summary>
                <p>
                  Needs Review is used when qualifying sources disagree enough that publishing one
                  precise tier would overstate the evidence.
                </p>
              </details>
              <details>
                <summary>
                  Does a lower result in the Phantom Blade Zero weapon tier list mean unusable?
                </summary>
                <p>
                  No. Matchups, execution, progression, and player preference still matter even when
                  overall combat value ranks lower. The{" "}
                  <strong>Phantom Blade Zero tier list</strong> is a consensus guide, not a claim
                  that lower-ranked options cannot work.
                </p>
              </details>
              <details>
                <summary>How often is the Phantom Blade Zero tier list updated?</summary>
                <p>
                  The <strong>Phantom Blade Zero tier list</strong> is reviewed when meaningful new
                  comprehensive rankings or official evidence changes the consensus picture.
                </p>
              </details>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
