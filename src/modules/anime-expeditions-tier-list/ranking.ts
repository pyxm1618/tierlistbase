import type { Unit, UnitView, UnitFilters, UnitTier } from "./types";
import { unitViews } from "./types";
export const unitTiers: readonly UnitTier[] = ["S+", "S", "A", "B", "C", "Pending"];
export function filterUnits(roster: readonly Unit[], filters: UnitFilters): Unit[] {
  const query = filters.search?.trim().toLocaleLowerCase("en-US") ?? "";
  return roster.filter(
    (unit) =>
      !unit.hidden &&
      (!query ||
        `${unit.baseName} ${unit.forms.map((f) => f.name).join(" ")}`
          .toLocaleLowerCase("en-US")
          .includes(query)) &&
      (!filters.role || filters.role === "All" || unit.role === filters.role) &&
      (!filters.element || filters.element === "All" || unit.element === filters.element) &&
      (!filters.archetype || filters.archetype === "All" || unit.archetype === filters.archetype) &&
      (!filters.rarity || filters.rarity === "All" || unit.rarity === filters.rarity) &&
      (!filters.availability ||
        filters.availability === "All" ||
        unit.availability === filters.availability) &&
      (!filters.evolution ||
        filters.evolution === "All" ||
        unit.evolutionState === filters.evolution),
  );
}
export function getQuickPicks(roster: readonly Unit[]) {
  return unitViews.flatMap((view) => {
    const unit = roster
      .filter((u) => !u.hidden && u.viewTiers[view] !== "Pending")
      .sort(
        (a, b) => unitTiers.indexOf(a.viewTiers[view]) - unitTiers.indexOf(b.viewTiers[view]),
      )[0];
    return unit
      ? [{ view, unit, label: view === "Overall" ? "Best Overall Unit" : `Best ${view}` }]
      : [];
  });
}
export function tierFor(unit: Unit, view: UnitView) {
  return unit.viewTiers[view];
}
