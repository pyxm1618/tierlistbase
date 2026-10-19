"use client";

import { useMemo, useState } from "react";

import {
  identityRows,
  type Availability,
  type RatingValue,
  type TierValue,
  type IdentityRow,
} from "./data";
import styles from "./limbus-tier-list.module.css";
import { SinnerPortrait } from "./sinner-portrait";

const identityFilters = [
  "All Identities",
  "Sinner",
  "Rarity",
  "Role",
  "Team / Archetype",
  "Damage Type",
  "Sin Affinity",
  "Generalist Value",
  "Beginner Friendly",
  "Team Dependency",
  "Availability",
] as const;

type IdentityFilter = (typeof identityFilters)[number];

const filterFields = {
  Sinner: "sinner",
  Rarity: "rarity",
  Role: "role",
  "Team / Archetype": "mainTeam",
  "Damage Type": "damageType",
  "Sin Affinity": "sin",
  "Generalist Value": "generalistValue",
  "Beginner Friendly": "beginnerFriendly",
  "Team Dependency": "teamDependency",
  Availability: "availability",
} as const satisfies Record<Exclude<IdentityFilter, "All Identities">, keyof IdentityRow>;

function AssetSlot() {
  return (
    <span
      className={[styles.assetSlot, styles.assetSlotCompact].join(" ")}
      aria-label="Artwork asset required"
      title="Artwork asset required"
    >
      <span>ART</span>
    </span>
  );
}

function TierBadge({ value }: { value: TierValue }) {
  return (
    <span className={styles.tierBadge} data-tier={value}>
      {value}
    </span>
  );
}

function RatingBadge({ value }: { value: RatingValue | TierValue | string }) {
  return (
    <span className={styles.ratingBadge} data-rating={value}>
      {value}
    </span>
  );
}

function AvailabilityBadge({ value }: { value: Availability }) {
  return (
    <span className={styles.availabilityBadge} data-availability={value}>
      {value}
    </span>
  );
}

export function IdentityRanking() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<IdentityFilter>("All Identities");

  const [filterValue, setFilterValue] = useState("");
  const activeField = activeFilter === "All Identities" ? undefined : filterFields[activeFilter];
  const filterOptions = useMemo(
    () => (activeField ? [...new Set(identityRows.map((row) => row[activeField]))] : []),
    [activeField],
  );

  const filteredIdentities = useMemo(() => {
    const query = search.trim().toLowerCase();
    return identityRows.filter((row) => {
      if (activeField && filterValue && row[activeField] !== filterValue) return false;
      return (
        !query ||
        [
          row.identity,
          row.sinner,
          row.rarity,
          row.role,
          row.mainTeam,
          row.damageType,
          row.sin,
          row.generalistValue,
          row.beginnerFriendly,
          row.teamDependency,
          row.availability,
        ].some((value) => value.toLowerCase().includes(query))
      );
    });
  }, [search, activeField, filterValue]);

  return (
    <>
      <div className={styles.filterBar} aria-label="Identity filters">
        <div className={styles.filterScroll}>
          {identityFilters.map((filter) => (
            <span className={styles.filterControl} key={filter}>
              <button
                className={styles.filterButton}
                data-active={activeFilter === filter ? "true" : "false"}
                aria-pressed={activeFilter === filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setFilterValue("");
                }}
              >
                {filter}
              </button>
              {activeFilter === filter && activeField ? (
                <select
                  className={[styles.filterButton, styles.filterValue].join(" ")}
                  aria-label={`${filter} value`}
                  value={filterValue}
                  onChange={(event) => setFilterValue(event.target.value)}
                >
                  <option value="">All values</option>
                  {filterOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              ) : null}
            </span>
          ))}
        </div>
        <label className={styles.inlineSearch}>
          <span aria-hidden="true">⌕</span>
          <span className={styles.visuallyHidden}>Search Identity</span>
          <input
            type="search"
            aria-label="Search Identity"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Identity..."
          />
        </label>
      </div>

      <div className={styles.tableFrame}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Tier</th>
              <th>Identity</th>
              <th>Sinner</th>
              <th>Rarity</th>
              <th>Role</th>
              <th>Main Team / Archetype</th>
              <th>Damage Type</th>
              <th>Sin</th>
              <th>Generalist Value</th>
              <th>Beginner Friendly</th>
              <th>Team Dependency</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {filteredIdentities.map((row) => (
              <tr key={row.rank}>
                <td className={styles.rankCell}>{row.rank}</td>
                <td>
                  <TierBadge value={row.tier} />
                </td>
                <td>
                  <div className={styles.nameCell}>
                    <AssetSlot />
                    <strong>{row.identity}</strong>
                  </div>
                </td>
                <td>
                  <div className={styles.sinnerCell}>
                    <SinnerPortrait sinner={row.sinner} />
                    <span>{row.sinner}</span>
                  </div>
                </td>
                <td className={styles.rarityCell}>{row.rarity}</td>
                <td>{row.role}</td>
                <td>
                  <span className={styles.mechanicText}>{row.mainTeam}</span>
                </td>
                <td>{row.damageType}</td>
                <td>{row.sin}</td>
                <td>
                  <RatingBadge value={row.generalistValue} />
                </td>
                <td>
                  <RatingBadge value={row.beginnerFriendly} />
                </td>
                <td>
                  <RatingBadge value={row.teamDependency} />
                </td>
                <td>
                  <AvailabilityBadge value={row.availability} />
                </td>
              </tr>
            ))}
            {filteredIdentities.length === 0 ? (
              <tr>
                <td className={styles.emptyState} colSpan={13}>
                  No mock Identity rows match this search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
