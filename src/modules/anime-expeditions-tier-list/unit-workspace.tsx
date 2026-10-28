"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { artworkFor } from "./artwork";
import { filterUnits, getQuickPicks, unitTiers } from "./ranking";
import {
  unitViews,
  type Unit,
  type UnitFilters,
  type UnitView,
  type Trait,
  type Equipment,
} from "./types";
import styles from "./anime-expeditions-tier-list.module.css";

function Portrait({ unit, large = false }: { unit: Unit; large?: boolean }) {
  return (
    <Image
      src={artworkFor(`unit-${unit.asset}`)}
      alt={unit.currentForm}
      width={large ? 192 : 128}
      height={large ? 184 : 123}
      sizes={large ? "192px" : "(max-width: 600px) 96px, 112px"}
      loading="lazy"
      className={styles.portrait}
    />
  );
}
function UnitDetail({
  unit,
  view,
  traits,
  equipment,
  roster,
}: {
  unit: Unit;
  view: UnitView;
  traits: readonly Trait[];
  equipment: readonly Equipment[];
  roster: readonly Unit[];
}) {
  const names = (ids: readonly string[], collection: readonly { id: string; name: string }[]) =>
    ids.map((id) => collection.find((item) => item.id === id)!.name).join(" / ") || "Needs Review";
  return (
    <>
      <div className={styles.identity}>
        <Portrait unit={unit} large />
        <div>
          <span className={styles.badge} data-tier={unit.viewTiers[view]}>
            {unit.viewTiers[view]}
          </span>
          <h3>{unit.currentForm}</h3>
          <p>
            {unit.role} · {unit.element} · {unit.archetype}
          </p>
          <p>
            {unit.rarity} · {unit.reviewStatus}
          </p>
        </div>
      </div>
      <dl className={styles.identityFacts}>
        <div>
          <dt>Base Unit</dt>
          <dd>{unit.baseName}</dd>
        </div>
        <div>
          <dt>Current Form</dt>
          <dd>{unit.currentForm}</dd>
        </div>
        <div>
          <dt>Evolution State</dt>
          <dd>{unit.evolutionState}</dd>
        </div>
        <div>
          <dt>Placement limit</dt>
          <dd>{unit.placementLimit ?? "Needs Review"} · source documented</dd>
        </div>
      </dl>
      <h4>Rating Summary</h4>
      <dl className={styles.ratings}>
        {unitViews.map((v) => (
          <div key={v}>
            <dt>{v}</dt>
            <dd data-tier={unit.viewTiers[v]}>{unit.viewTiers[v]}</dd>
          </div>
        ))}
      </dl>
      <h4>Why This Tier</h4>
      <p>{unit.why}</p>
      <h4>Best For</h4>
      <p>{unit.bestFor.join(" · ") || "Not enough evidence"}</p>
      <h4>Best Build</h4>
      <dl className={styles.build}>
        <div>
          <dt>Best Trait / Alternative Trait</dt>
          <dd>{names(unit.build.traitIds, traits)}</dd>
        </div>
        <div>
          <dt>Best Standard Equipment / Alternative Equipment</dt>
          <dd>{names(unit.build.standardIds, equipment)}</dd>
        </div>
        <div>
          <dt>Exclusive Equipment</dt>
          <dd>
            {unit.build.exclusiveIds.length
              ? names(unit.build.exclusiveIds, equipment)
              : "No mapped exclusive equipment"}
          </dd>
        </div>
      </dl>
      <p className={styles.muted}>{unit.build.note}</p>
      <h4>Investment</h4>
      <p>
        {unit.investment} · {unit.investmentLevel} investment
      </p>
      <p>{unit.dependency}</p>
      <h4>Team Fit</h4>
      <p>
        {unit.role === "Economy"
          ? "Fund the carry before expensive secondary upgrades. Compare the remaining wave count to the farm payback window."
          : `${unit.archetype} partners should complement this unit’s ${unit.role.toLowerCase()} contribution. Pair a carry with amplification, stall and a way to fund upgrades.`}
      </p>
      <p>
        <strong>Core partners:</strong>{" "}
        {unit.partners
          .map((id) => roster.find((partner) => partner.id === id)!.currentForm)
          .join(" · ") || "Needs Review"}
      </p>
      <p>
        <strong>Synergy:</strong>{" "}
        {unit.role === "Support"
          ? "Amplify the carry without duplicating non-stacking buffs."
          : unit.role === "Crowd Control"
            ? "Keep enemies grouped inside allied damage coverage; check control immunities."
            : unit.role === "Economy"
              ? "Fund the next damage or control breakpoint before buying secondary upgrades."
              : "Use amplification and stall to complete damage setup and keep targets in range."}
      </p>
      <p>
        <strong>Replacements:</strong> Follow the role-specific alternatives in the composition
        notes; pending units do not imply equivalent performance.
      </p>
      <a href="#teams" onClick={(event) => event.currentTarget.closest("dialog")?.close()}>
        View Team Comps →
      </a>
    </>
  );
}

export function UnitWorkspace({
  units,
  traits,
  equipment,
  modes,
}: {
  units: readonly Unit[];
  traits: readonly Trait[];
  equipment: readonly Equipment[];
  modes: readonly string[];
}) {
  const [view, setView] = useState<UnitView>("Overall");
  const [filters, setFilters] = useState<UnitFilters>({ mode: "All Modes" });
  const [selectedId, setSelectedId] = useState(units.find((u) => u.viewTiers.Overall === "S+")!.id);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const selected = units.find((u) => u.id === selectedId)!;
  const visible = filterUnits(units, filters);
  const quickPicks = getQuickPicks(units);
  function selectUnit(unit: Unit, button: HTMLButtonElement) {
    setSelectedId(unit.id);
    trigger.current = button;
    if (window.matchMedia("(max-width: 1000px)").matches) dialog.current?.showModal();
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % unitViews.length
        : event.key === "ArrowLeft"
          ? (index + unitViews.length - 1) % unitViews.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? unitViews.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    setView(unitViews[next]!);
    document.getElementById(`ae-tab-${next}`)?.focus();
  }
  const fields = [
    { key: "role", label: "Role", field: "role" },
    { key: "element", label: "Element", field: "element" },
    { key: "archetype", label: "Archetype", field: "archetype" },
    { key: "rarity", label: "Rarity", field: "rarity" },
    { key: "availability", label: "Availability", field: "availability" },
    { key: "evolution", label: "Evolution", field: "evolutionState" },
  ] as const;
  return (
    <>
      <section aria-labelledby="quick-title" className={styles.quickSection}>
        <div className={styles.sectionHeading}>
          <h2 id="quick-title">Quick Picks</h2>
          <p>Provisional editorial picks · current live review pending</p>
        </div>
        <div className={styles.quickPicks}>
          {quickPicks.map((pick) => (
            <button
              key={pick.view}
              onClick={(event) => {
                setView(pick.view);
                selectUnit(pick.unit, event.currentTarget);
              }}
              className={styles.quickCard}
            >
              <span>{pick.label}</span>
              <Portrait unit={pick.unit} />
              <strong>{pick.unit.currentForm}</strong>
              <span className={styles.badge} data-tier={pick.unit.viewTiers[pick.view]}>
                {pick.unit.viewTiers[pick.view]}
              </span>
              <small>{pick.unit.role}</small>
            </button>
          ))}
        </div>
      </section>
      <nav aria-label="Ranking systems" className={styles.primaryNav}>
        <a href="#units">
          <b>✧ Units</b>
          <span>Which units are worth building?</span>
        </a>
        <a href="#traits">
          <b>✦ Traits</b>
          <span>Which traits are worth rolling?</span>
        </a>
        <a href="#equipment">
          <b>⚔ Equipment</b>
          <span>Which equipment is worth farming?</span>
        </a>
      </nav>
      <section id="units" aria-labelledby="unit-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2 id="unit-title">Anime Expeditions Unit Tier List</h2>
          <p>One canonical unit. Its recommended form. Five role views.</p>
        </div>
        <div className={styles.workspace}>
          <div className={styles.boardColumn}>
            <div role="tablist" aria-label="Unit ranking views" className={styles.tabs}>
              {unitViews.map((v, i) => (
                <button
                  id={`ae-tab-${i}`}
                  role="tab"
                  aria-selected={view === v}
                  aria-controls="ae-unit-panel"
                  tabIndex={view === v ? 0 : -1}
                  key={v}
                  onClick={() => setView(v)}
                  onKeyDown={(event) => tabKey(event, i)}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className={styles.filters}>
              <label className={styles.search}>
                Search
                <input
                  type="search"
                  aria-label="Search units"
                  placeholder="Search units or forms…"
                  value={filters.search ?? ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </label>
              {fields.map(({ key, label, field }) => (
                <label key={key}>
                  {label}
                  <select
                    value={filters[key] ?? "All"}
                    onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                  >
                    <option>All</option>
                    {[...new Set(units.filter((u) => !u.hidden).map((u) => u[field]))]
                      .sort()
                      .map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                  </select>
                </label>
              ))}
              <label>
                Mode Context
                <select
                  value={filters.mode}
                  onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
                >
                  {modes.map((mode) => (
                    <option key={mode}>{mode}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className={styles.context} role="status">
              {visible.length} units · {filters.mode}.{" "}
              {filters.mode !== "All Modes"
                ? "Context only: canonical tiers stay unchanged. Check stage restrictions, enemy immunities and modifiers before choosing a lineup."
                : "Provisional tiers; Pending means unranked, never low tier."}
            </p>
            <div
              id="ae-unit-panel"
              role="tabpanel"
              aria-labelledby={`ae-tab-${unitViews.indexOf(view)}`}
              tabIndex={0}
            >
              {visible.length === 0 ? (
                <p className={styles.empty}>
                  No units match these filters.{" "}
                  <button onClick={() => setFilters({ mode: "All Modes" })}>Reset filters</button>
                </p>
              ) : (
                unitTiers.map((tier) => {
                  const rows = visible.filter((u) => u.viewTiers[view] === tier);
                  return (
                    <section key={tier} className={styles.tierRow} data-tier-row={tier}>
                      <h3 className={styles.tierLabel} data-tier={tier}>
                        {tier}
                        <small>
                          {tier === "Pending"
                            ? "Needs Review"
                            : tier === "S+"
                              ? "Meta defining"
                              : tier === "S"
                                ? "Top role value"
                                : tier === "A"
                                  ? "Strong"
                                  : tier === "B"
                                    ? "Situational"
                                    : "Limited"}
                        </small>
                      </h3>
                      <div className={styles.unitGrid}>
                        {rows.length ? (
                          rows.map((unit) => (
                            <button
                              className={styles.unitCard}
                              data-unit-id={unit.id}
                              aria-label={`${unit.currentForm}, ${tier} tier, ${unit.role}, ${unit.element}`}
                              aria-pressed={selectedId === unit.id}
                              key={unit.id}
                              onClick={(event) => selectUnit(unit, event.currentTarget)}
                            >
                              <Portrait unit={unit} />
                              <strong>{unit.currentForm}</strong>
                              <small>
                                {unit.role} · {unit.element}
                              </small>
                            </button>
                          ))
                        ) : (
                          <p className={styles.emptyTier}>No reviewed placement in this view.</p>
                        )}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </div>
          <aside aria-label="Unit Detail" className={styles.detail}>
            <UnitDetail
              unit={selected}
              view={view}
              traits={traits}
              equipment={equipment}
              roster={units}
            />
          </aside>
        </div>
        <dialog
          ref={dialog}
          className={styles.mobileDetail}
          aria-label="Unit Detail"
          onClose={() => trigger.current?.focus({ preventScroll: true })}
        >
          <button
            autoFocus
            className={styles.close}
            onClick={() => dialog.current?.close()}
            aria-label="Close Unit Detail"
          >
            Close ×
          </button>
          <UnitDetail
            unit={selected}
            view={view}
            traits={traits}
            equipment={equipment}
            roster={units}
          />
        </dialog>
      </section>
    </>
  );
}
