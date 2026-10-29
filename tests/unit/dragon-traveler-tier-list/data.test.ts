import { describe, expect, it } from "vitest";
import {
  classes,
  factions,
  rarities,
  rankingViews,
  teamViews,
  getRoster,
  getFilters,
  upcomingLuminaries,
  teams,
  sourceRecords,
  researchLedger,
  getQuickPicks,
  filterRoster,
} from "@/modules/dragon-traveler-tier-list";

describe("Dragon Traveler verified data boundaries", () => {
  it("freezes three character views and two team views", () => {
    expect(rankingViews).toEqual(["Overall", "PvE", "PvP"]);
    expect(teamViews).toEqual(["PvE", "PvP"]);
  });
  it.each(["global", "taiwan"] as const)(
    "keeps %s live rankings complete and traceable",
    (server) => {
      const roster = getRoster(server);
      expect(roster.length).toBeGreaterThan(0);
      expect(new Set(roster.map((c) => c.id)).size).toBe(roster.length);
      for (const c of roster) {
        expect(classes).toContain(c.class);
        expect(rarities).toContain(c.rarity);
        expect(c.factions.length).toBeGreaterThan(0);
        c.factions.forEach((f) => expect(factions).toContain(f));
        expect(Object.keys(c.viewTiers)).toEqual(rankingViews);
        rankingViews.forEach((view) =>
          expect(["S+", "S", "A", "B", "C"]).toContain(c.viewTiers[view]),
        );
        expect(c.strengths.length).toBeGreaterThanOrEqual(2);
        expect(c.limitations.length).toBeGreaterThanOrEqual(2);
        expect(c.whyThisTier.length).toBeGreaterThan(20);
        c.bestPartners.forEach((id) => expect(roster.some((p) => p.id === id)).toBe(true));
        c.evidenceSourceIds.forEach((id) =>
          expect(sourceRecords.some((s) => s.id === id)).toBe(true),
        );
        expect(c).not.toHaveProperty("isUpcoming");
      }
      const options = getFilters(server);
      expect(options.factions).toEqual([...new Set(roster.flatMap((c) => c.factions))].sort());
      expect(options.rarities).toEqual([...new Set(roster.map((c) => c.rarity))].sort());
      for (const id of Object.values(getQuickPicks(server)))
        expect(roster.some((c) => c.id === id)).toBe(true);
    },
  );
  it("never coerces upcoming records into ranked records or recommendations", () => {
    for (const u of upcomingLuminaries) {
      expect(u.releaseStatus).toBe("Upcoming");
      expect(u).not.toHaveProperty("viewTiers");
      expect(getRoster(u.server).some((c) => c.id === u.id)).toBe(false);
      expect(Object.values(getQuickPicks(u.server))).not.toContain(u.id);
      expect(
        teams
          .filter((t) => t.server === u.server)
          .flatMap((t) => t.members.map((m) => m.characterId)),
      ).not.toContain(u.id);
    }
  });
  it("reconciles every researched character without treating missing evidence as rejection", () => {
    expect(researchLedger.length).toBe(96);
    expect(new Set(researchLedger.map((r) => r.id)).size).toBe(96);
    expect(
      researchLedger.every((r) =>
        ["pass", "deferred", "unknown", "confirmed_reject"].includes(r.state),
      ),
    ).toBe(true);
    expect(researchLedger.every((r) => r.reason.length > 0)).toBe(true);
  });
  it("resolves every team member and alternative in its server", () => {
    for (const team of teams) {
      expect(teamViews).toContain(team.view);
      const ids = new Set(getRoster(team.server).map((c) => c.id));
      expect(team.members).toHaveLength(6);
      for (const id of [
        ...team.members.map((m) => m.characterId),
        ...team.alternatives,
        ...(team.flexibleSlot ? [team.flexibleSlot] : []),
      ])
        expect(ids.has(id)).toBe(true);
    }
  });
  it("combines filters using AND and preserves separate servers", () => {
    const roster = getRoster("global");
    const c = roster[0]!;
    expect(
      filterRoster(roster, {
        search: c.displayName,
        class: c.class,
        faction: c.factions[0]!,
        rarity: c.rarity,
      }),
    ).toContain(c);
    expect(filterRoster(roster, { search: "No such luminary" })).toEqual([]);
    expect(getRoster("global")).not.toBe(getRoster("taiwan"));
  });
});

describe("Dragon Traveler published pool", () => {
  it("matches researched server counts and preserves real server differences", () => {
    expect(getRoster("global")).toHaveLength(73);
    expect(getRoster("taiwan")).toHaveLength(95);
    expect(getRoster("global").some((c) => c.id === "arachne")).toBe(true);
    expect(getRoster("taiwan").some((c) => c.id === "arachne")).toBe(false);
    expect(getRoster("global").some((c) => c.id === "zeus")).toBe(false);
    expect(getRoster("taiwan").some((c) => c.id === "zeus")).toBe(true);
    expect(getRoster("global").find((c) => c.id === "ares")!.viewTiers.Overall).not.toBe(
      getRoster("taiwan").find((c) => c.id === "ares")!.viewTiers.Overall,
    );
  });
  it("preserves source cells without overlapping battlefield slots", () => {
    for (const t of teams) {
      expect(new Set(t.members.map((m) => `${m.position}:${m.slot}`)).size).toBe(6);
      expect(t.members.every((m) => ["Left", "Center", "Right"].includes(m.slot))).toBe(true);
      expect(t.sourceFormationId).toMatch(/^pv[ep]-/);
    }
  });
});

it("does not present positive build recommendations as character limitations", () => {
  const poseidon = getRoster("global").find((c) => c.id === "poseidon")!;
  expect(poseidon.limitations).not.toContain("Every team, recommended");
  expect(poseidon.limitations.some((note) => /protect|diver|position/i.test(note))).toBe(true);
});

it("keeps AllClash's five-band Arachne grades separate from Hideout's wider scale", () => {
  expect(getRoster("global").find((c) => c.id === "arachne")!.viewTiers).toEqual({
    Overall: "S",
    PvE: "S",
    PvP: "S",
  });
});
it("keeps source-listed partners in the model and removes wrong-server partners", () => {
  const c = getRoster("global").find((c) => c.id === "lilith")!;
  expect(c.bestPartners.length).toBeGreaterThan(0);
  expect(c.bestPartners).not.toContain("hera");
  expect(c.bestPartners.every((id) => getRoster("global").some((p) => p.id === id))).toBe(true);
});

it("keeps all sourced formations inside a three-by-three battlefield", () => {
  for (const t of teams) {
    for (const position of ["Frontline", "Midline", "Backline"])
      expect(
        t.members.filter((m) => m.position === position).length,
        t.id + " " + position,
      ).toBeLessThanOrEqual(3);
  }
  const t = teams.find((t) => t.id === "global-PvP-2")!;
  expect(t.members.find((m) => m.characterId === "vivian")!.position).toBe("Midline");
  expect(t.members.find((m) => m.characterId === "azure-dragon")!.position).toBe("Frontline");
});

it("names the actual source of Arachne's rating explanation", () => {
  expect(getRoster("global").find((c) => c.id === "arachne")!.whyThisTier).toContain("AllClash");
});
