import { routeRegistry as neutralRegistry } from "../../../examples/neutral-product/routes.config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";
import { describe, expect, it } from "vitest";
import {
  units,
  traits,
  equipment,
  evolutions,
  teams,
  snapshot,
  sources,
  unitViews,
  getQuickPicks,
  filterUnits,
  auditCoverage,
} from "@/modules/anime-expeditions-tier-list";

describe("Anime Expeditions snapshot integrity", () => {
  it("reconciles every source form with a canonical relationship and explicit review state", () => {
    expect(new Set(units.map((u) => u.id)).size).toBe(units.length);
    const forms = units.flatMap((u) => u.forms);
    expect(new Set(forms.map((f) => f.name)).size).toBe(forms.length);
    expect(forms.length).toBe(snapshot.sourceFormCount);
    for (const unit of units) {
      expect(unit.forms.some((f) => f.name === unit.currentForm)).toBe(true);
      expect(unit.forms.some((f) => f.name === unit.baseName)).toBe(true);
      expect(Object.keys(unit.viewTiers)).toEqual([...unitViews]);
      for (const tier of Object.values(unit.viewTiers))
        expect(["S+", "S", "A", "B", "C", "Pending"]).toContain(tier);
      expect(unit.sourceIds.length).toBeGreaterThan(0);
    }
    expect(auditCoverage.total).toBe(
      auditCoverage.pass + auditCoverage.deferred + auditCoverage.rejected + auditCoverage.unknown,
    );
  });
  it("derives quick picks from the same ranked units and keeps pending units out", () => {
    expect(getQuickPicks()).toHaveLength(5);
    for (const pick of getQuickPicks()) {
      expect(units).toContain(pick.unit);
      expect(pick.unit.viewTiers[pick.view]).not.toBe("Pending");
    }
    const pending = units.filter((u) => u.viewTiers.Overall === "Pending");
    expect(pending.length).toBeGreaterThan(0);
  });
  it("filters real identity fields without converting unknown availability to obtainable", () => {
    const first = units.find((u) => u.currentForm === "Crimson Captain (Moon)")!;
    expect(
      filterUnits(units, {
        search: "crimson captain",
        role: first.role,
        element: first.element,
        archetype: first.archetype,
        rarity: first.rarity,
        availability: first.availability,
        evolution: first.evolutionState,
        mode: "All Modes",
      }),
    ).toEqual([first]);
    expect(filterUnits(units, { search: "no such unit" })).toEqual([]);
  });
  it("validates all build, team, evolution and source references", () => {
    const ids = new Set(units.map((u) => u.id));
    for (const unit of units) {
      for (const id of unit.build.traitIds) expect(traits.some((t) => t.id === id)).toBe(true);
      for (const id of unit.build.standardIds)
        expect(equipment.some((e) => e.id === id && e.kind === "Standard")).toBe(true);
      for (const id of unit.build.exclusiveIds)
        expect(
          equipment.some(
            (e) =>
              e.id === id && e.kind === "Exclusive" && unit.forms.some((f) => f.name === e.unit),
          ),
        ).toBe(true);
      for (const id of unit.partners) expect(ids.has(id)).toBe(true);
    }
    for (const item of equipment.filter((e) => e.kind === "Exclusive"))
      expect(item.tier).toBeNull();
    for (const team of teams)
      for (const member of team.members) expect(ids.has(member.unitId)).toBe(true);
    for (const evo of evolutions) {
      const unit = units.find((u) => u.id === evo.unitId)!;
      expect(unit.forms.some((f) => f.name === evo.from)).toBe(true);
      expect(unit.forms.some((f) => f.name === evo.to)).toBe(true);
      expect(evo.materials.length).toBeGreaterThan(0);
    }
    expect(snapshot.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(snapshot.version.label.length).toBeGreaterThan(0);
    expect(snapshot.releaseReady).toBe(false);
    expect(snapshot.version.status).toBe("Needs Review");
    for (const item of [...units, ...traits, ...equipment])
      for (const id of item.sourceIds) expect(sources.some((s) => s.id === id)).toBe(true);
    expect(JSON.stringify({ units, traits, equipment, evolutions, teams })).not.toMatch(
      /\b(TODO|TBD|lorem ipsum|Shadow Monarch|Dimension Core)\b/i,
    );
  });
});

it("keeps the incomplete snapshot noindex in production and out of sitemap", () => {
  const route = "/anime-expeditions/tier-list";
  expect(routeRegistry.get(route).class).toBe("public_noindex");
  expect(metadataForRoute(routeRegistry, route, "production").robots).toEqual({
    index: false,
    follow: true,
  });
  expect(routeRegistry.sitemapEntries().some((entry) => entry.route === route)).toBe(false);
});
it("maps every displayed image to a bounded local derivative with source provenance", () => {
  const root = path.join(process.cwd(), "src/modules/anime-expeditions-tier-list/assets");
  const assets = JSON.parse(readFileSync(path.join(root, "provenance.json"), "utf8")) as {
    key: string;
    sourceUrl: string;
    bytes: number;
    width: number;
    height: number;
    derivative: string;
    status: string;
  }[];
  for (const asset of assets) {
    expect(asset.status).toBe("Source mapped");
    expect(asset.sourceUrl).toMatch(/^https:\/\/static.wikitide.net\//);
    expect(asset.bytes).toBeLessThan(500_000);
    expect(asset.width).toBeGreaterThan(0);
    expect(asset.height).toBeGreaterThan(0);
    expect(readFileSync(path.join(root, asset.derivative)).length).toBe(asset.bytes);
  }
  for (const unit of units) expect(assets.some((a) => a.key === `unit-${unit.asset}`)).toBe(true);
  for (const trait of traits) expect(assets.some((a) => a.key === `trait-${trait.id}`)).toBe(true);
  for (const item of equipment)
    expect(assets.some((a) => a.key === `gear-${item.asset}`)).toBe(true);
});

it("does not turn an unreviewed evolution into a Situational recommendation", () => {
  for (const evolution of evolutions.filter((item) => item.status === "Pending"))
    expect(evolution.priority).toBeNull();
});

it("keeps the fusion ingredient separate from Metallic Alchemist forms", () => {
  const metallic = units.find((unit) => unit.id === "metallic-alchemist")!;
  expect(metallic.forms.map((form) => form.name)).not.toContain("Suited Alchemist");
  expect(units.find((unit) => unit.id === "suited-alchemist")?.baseName).toBe("Suited Alchemist");
});

it("registers the neutral clean-setup route as noindex as well", () => {
  expect(neutralRegistry.get("/anime-expeditions/tier-list").class).toBe("public_noindex");
  expect(
    neutralRegistry
      .sitemapEntries()
      .some((entry) => entry.route === "/anime-expeditions/tier-list"),
  ).toBe(false);
});
