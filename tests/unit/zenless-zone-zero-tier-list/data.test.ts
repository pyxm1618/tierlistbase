import { describe, expect, it } from "vitest";

import {
  agentRankingViews,
  agents,
  gameVersion,
  pullAdvices,
  snapshotDate,
  teamRankingViews,
  teams,
  upcomingAgentNames,
  type Tier,
} from "@/modules/zenless-zone-zero-tier-list/data";

const tiers = new Set<Tier>(["S+", "S", "A", "B"]);
const expectedAgentIds = [
  "alexandrina-sebastiane",
  "alice-thymefield",
  "aria",
  "asaba-harumasa",
  "astra-yao",
  "banyue",
  "burnice-white",
  "caesar-king",
  "cissia",
  "claret",
  "dialyn",
  "ellen-joe",
  "evelyn-chevalier",
  "grace-howard",
  "hoshimi-miyabi",
  "hugo-vlad",
  "jane-doe",
  "ju-fufu",
  "koleda-belobog",
  "lighter",
  "lucia",
  "nangong-yu",
  "nekomata",
  "norma",
  "orphie-and-magus",
  "pan-yinhu",
  "phoenix",
  "promeia",
  "pyrois",
  "qingyi",
  "remielle-dan",
  "roxy",
  "seed",
  "sigrid-de-l-azur",
  "soldier-0-anby",
  "soldier-11",
  "starlight-billy",
  "sunna",
  "trigger",
  "tsukishiro-yanagi",
  "ukinami-yuzuha",
  "velina-airgid",
  "vivian",
  "von-lycaon",
  "ye-shunguang",
  "yidhari",
  "yixuan",
  "zhao",
  "zhu-yuan",
  "anby-demara",
  "anton-ivanov",
  "ben-bigger",
  "billy-kid",
  "corin-wickes",
  "komano-manato",
  "lucy",
  "nicole-demara",
  "piper-wheel",
  "pulchra-fellini",
  "seth-lowell",
  "soukaku",
] as const;
const forbiddenPlaceholders = [
  "Signature W-Engine",
  "Premium Role W-Engine",
  "A-Rank Role Alternative",
  "Craftable / Event Option",
  "Role-focused 4-Pc Set",
  "Anomaly-focused 4-Pc Set",
] as const;

function resolvesAgentReference(value: string) {
  const normalized = value.trim().toLowerCase();
  return agents.some((agent) =>
    [agent.name, agent.officialName]
      .map((name) => name.toLowerCase())
      .some(
        (candidate) =>
          candidate === normalized ||
          candidate.startsWith(normalized + " ") ||
          candidate.split(/\s+/).includes(normalized),
      ),
  );
}

describe("ZZZ production data", () => {
  it("uses the frozen 2026-10-25 Version 3.3 roster", () => {
    expect(snapshotDate).toBe("2026-10-25");
    expect(gameVersion).toBe("3.3");
    expect(agents).toHaveLength(61);
    expect(new Set(agents.map((agent) => agent.id)).size).toBe(61);
    expect([...agents.map((agent) => agent.id)].sort()).toEqual([...expectedAgentIds].sort());
  });

  it("has all five ranking views and complete agent detail data", () => {
    for (const agent of agents) {
      expect(Object.keys(agent.viewTiers).sort()).toEqual([...agentRankingViews].sort());
      for (const view of agentRankingViews) expect(tiers.has(agent.viewTiers[view])).toBe(true);
      expect(agent.keyStrengths.length).toBeGreaterThanOrEqual(2);
      expect(agent.keyLimitations.length).toBeGreaterThanOrEqual(2);
      expect(agent.bestWEngine.trim()).not.toBe("");
      expect(agent.bestAlternative.trim()).not.toBe("");
      expect(agent.bestF2pOption.trim()).not.toBe("");
      expect(agent.bestDriveDisc.trim()).not.toBe("");
      expect(agent.mainStats.length).toBeGreaterThan(0);
      expect(agent.importantSubstats.length).toBeGreaterThan(0);
      expect(agent.bestTeams.length).toBeGreaterThan(0);
      const serialized = JSON.stringify(agent);
      for (const placeholder of forbiddenPlaceholders)
        expect(serialized).not.toContain(placeholder);
    }
  });

  it("keeps team members and agent best-team compositions tied to the frozen roster", () => {
    const names = new Set(agents.flatMap((agent) => [agent.name, agent.officialName]));
    const teamNames = new Set(teams.map((team) => team.name));
    for (const team of teams) {
      for (const composition of team.compositions) {
        for (const member of composition.members) expect(names.has(member.name)).toBe(true);
      }
      for (const member of team.budgetF2pVersion ?? []) expect(names.has(member)).toBe(true);
    }
    for (const agent of agents) {
      for (const bestTeam of agent.bestTeams) {
        if (teamNames.has(bestTeam)) continue;
        const members = bestTeam
          .split("/")
          .map((member) => member.trim())
          .filter(Boolean);
        expect(members.length).toBeGreaterThanOrEqual(2);
        for (const member of members) expect(resolvesAgentReference(member)).toBe(true);
      }
    }
  });

  it("integrates exactly nine complete team records", () => {
    expect(teams).toHaveLength(9);
    expect(new Set(teams.map((team) => team.id)).size).toBe(9);
    for (const team of teams) {
      expect(Object.keys(team.viewTiers).sort()).toEqual([...teamRankingViews].sort());
      for (const view of teamRankingViews) expect(tiers.has(team.viewTiers[view])).toBe(true);
      expect(team.compositions.length).toBeGreaterThanOrEqual(2);
      expect(team.bestBangboo.trim()).not.toBe("");
      expect(team.alternativeBangboo.trim()).not.toBe("");
      expect(team.activationRequirement.length).toBeGreaterThan(0);
      expect(team.budgetF2pNote.trim()).not.toBe("");
    }
  });

  it("uses only current or officially allowed upcoming pull advice", () => {
    expect(pullAdvices).toHaveLength(3);
    const liveNames = new Set(agents.map((agent) => agent.name));
    const upcoming = new Set<string>(upcomingAgentNames);
    for (const advice of pullAdvices) {
      if (advice.bannerStatus === "Current Banner") expect(liveNames.has(advice.name)).toBe(true);
      else expect(upcoming.has(advice.name)).toBe(true);
      expect(advice.dateLabel).not.toMatch(/2025/);
    }
    expect(pullAdvices.map((advice) => advice.name)).toEqual([
      "Phoenix",
      "Velina Airgid",
      "Severian Lowell",
    ]);
  });

  it("contains no legacy mock or 2025 banner strings", () => {
    const serialized = JSON.stringify({ agents, teams, pullAdvices });
    expect(serialized).not.toContain("Jan 22, 2025");
    expect(serialized).not.toContain("Feb 12, 2025");

    const genericTeamPlaceholders = agents
      .flatMap((agent) => agent.bestTeams)
      .filter((team) => / (Premium|Flexible|Budget) Core$/.test(team));
    expect(genericTeamPlaceholders).toEqual([]);
  });
});
