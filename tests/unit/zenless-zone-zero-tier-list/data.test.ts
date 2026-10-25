import { describe, expect, it } from "vitest";

import {
  agentRankingViews,
  agents,
  pullAdvices,
  teamRankingViews,
  teams,
} from "@/modules/zenless-zone-zero-tier-list/data";

const genericPlaceholders = [
  "Signature W-Engine",
  "Premium Role W-Engine",
  "A-Rank Role Alternative",
  "Craftable / Event Option",
  "Role-focused 4-Pc Set",
  "Anomaly-focused 4-Pc Set",
];

describe("ZZZ production data", () => {
  it("integrates exactly 61 unique live Agents with all five ranking views", () => {
    expect(agents).toHaveLength(61);
    expect(new Set(agents.map((agent) => agent.id)).size).toBe(61);

    for (const agent of agents) {
      expect(agent.name).toBeTruthy();
      expect(Object.keys(agent.viewTiers).sort()).toEqual([...agentRankingViews].sort());
      for (const view of agentRankingViews)
        expect(["S+", "S", "A", "B"]).toContain(agent.viewTiers[view]);
      expect(agent.keyStrengths.length).toBeGreaterThanOrEqual(2);
      expect(agent.keyLimitations.length).toBeGreaterThanOrEqual(2);
      expect(agent.bestWEngine).toBeTruthy();
      expect(agent.bestAlternative).toBeTruthy();
      expect(agent.bestF2pOption).toBeTruthy();
      expect(agent.bestDriveDisc).toBeTruthy();
      expect(agent.mainStats.length).toBeGreaterThan(0);
      expect(agent.importantSubstats.length).toBeGreaterThan(0);
      expect(agent.bestTeams.length).toBeGreaterThan(0);
    }
  });

  it("integrates exactly nine audited Team records with complete five-view rankings", () => {
    expect(teams).toHaveLength(9);
    expect(new Set(teams.map((team) => team.id)).size).toBe(9);

    const agentNames = new Set(agents.map((agent) => agent.name));
    for (const team of teams) {
      expect(Object.keys(team.viewTiers).sort()).toEqual([...teamRankingViews].sort());
      for (const view of teamRankingViews)
        expect(["S+", "S", "A", "B"]).toContain(team.viewTiers[view]);
      expect(team.compositions.length).toBeGreaterThan(0);
      expect(team.bestBangboo).toBeTruthy();
      expect(team.alternativeBangboo).toBeTruthy();
      expect(team.activationRequirement.length).toBeGreaterThan(0);
      expect(
        team.budgetF2pNote !== null ||
          team.compositions.some((composition) => /budget|f2p/i.test(composition.label)),
      ).toBe(true);
      for (const composition of team.compositions) {
        for (const member of composition.members) expect(agentNames.has(member.name)).toBe(true);
      }
    }
  });

  it("keeps every Agent mapped to a real audited team/core reference", () => {
    const agentAliases = agents.flatMap((agent) => [
      agent.name,
      ...agent.name.split(/[\s-]+/).filter((token) => token.length >= 4),
    ]);
    const teamNames = new Set(teams.map((team) => team.name));
    for (const agent of agents) {
      for (const reference of agent.bestTeams) {
        const exactTeam = teamNames.has(reference);
        const referencesKnownAgent = agentAliases.some((alias) => reference.includes(alias));
        expect(exactTeam || referencesKnownAgent).toBe(true);
        expect(reference).not.toMatch(/\b(Premium|Flexible|Budget) Core\b/);
      }
    }
  });

  it("contains only current/audited pull records and no legacy 2025 banner dates", () => {
    expect(pullAdvices.map((advice) => advice.name)).toEqual([
      "Phoenix",
      "Velina Airgid",
      "Severian Lowell",
    ]);
    expect(pullAdvices).toHaveLength(3);
    expect(pullAdvices.filter((advice) => advice.bannerStatus === "Current Banner")).toHaveLength(
      2,
    );
    expect(pullAdvices.filter((advice) => advice.bannerStatus === "Upcoming")).toHaveLength(1);

    const liveNames = new Set(agents.map((agent) => agent.name));
    for (const advice of pullAdvices) {
      expect(liveNames.has(advice.name) || advice.name === "Severian Lowell").toBe(true);
      expect(advice.dateLabel).not.toMatch(/2025|Jan 22|Feb 12/);
    }
  });

  it("contains no legacy generic build placeholders", () => {
    const serialized = JSON.stringify({ agents, teams, pullAdvices });
    for (const placeholder of genericPlaceholders) expect(serialized).not.toContain(placeholder);
    expect(serialized).not.toMatch(/Mock summary|Mock date|Production data later/i);
  });
});
