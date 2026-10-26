import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import type { StaticImageData } from "next/image";
import { describe, expect, it } from "vitest";

import { agents, pullAdvices, teams } from "@/modules/zenless-zone-zero-tier-list/data";
import * as assets from "@/modules/zenless-zone-zero-tier-list/icons";

type ReviewedAsset = {
  entityId: string;
  entityName: string;
  filename: string | null;
  sha256: string;
  verified: boolean;
  rawValues?: string[];
};
const manifest = JSON.parse(
  readFileSync(new URL("../../../zzz-asset-manifest.json", import.meta.url), "utf8"),
) as Record<
  "agentPortraits" | "bangboo" | "wEngines" | "teamVisuals" | "agentDetailArtwork",
  ReviewedAsset[]
>;

function expectReviewedAsset(image: StaticImageData | undefined, entry: ReviewedAsset) {
  expect(entry.verified).toBe(true);
  expect(entry.filename).toBeTruthy();
  expect(image).toBeTruthy();
  // Vite exposes imported image URLs; Next exposes StaticImageData in the application.
  const source = typeof image === "string" ? image : image?.src;
  expect(source).toBeTruthy();
  expect(source).toContain(path.basename(entry.filename!));
  const bytes = readFileSync(path.resolve(entry.filename!));
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(entry.sha256);
}

const engineFields = ["bestWEngine", "bestAlternative", "bestF2pOption"] as const;

describe("ZZZ audited production asset mappings", () => {
  it("maps all 61 released agent IDs to their exact reviewed portraits", () => {
    expect(agents).toHaveLength(61);
    expect(Object.keys(assets.agentIcons)).toHaveLength(61);
    for (const agent of agents) {
      const entry = manifest.agentPortraits.find((asset) => asset.entityId === agent.id)!;
      expectReviewedAsset(assets.agentIcons[agent.id], entry);
    }
    for (const name of ["Rina", "Harumasa", "Miyabi"]) {
      const agent = agents.find((candidate) => candidate.name === name)!;
      expect(assets.agentIcons[agent.id]).toBeTruthy();
    }
  });

  it("maps every canonical Bangboo actually used by the nine teams", () => {
    const required = new Set(
      teams.flatMap((team) =>
        [team.bestBangboo, team.alternativeBangboo].flatMap((names) =>
          names.split("/").map((name) => name.trim()),
        ),
      ),
    );
    expect(required.size).toBe(14);
    for (const name of required) {
      const entry = manifest.bangboo.find((asset) => asset.entityName === name)!;
      expectReviewedAsset(assets.bangbooIcons[name], entry);
    }
  });

  it("resolves all 183 engine fields to 77 unique reviewed W-Engines", () => {
    expect(assets.wEngineAliases).toEqual({ "Gilded Blossom (P5 baseline)": "Gilded Blossom" });
    const references = agents.flatMap((agent) => engineFields.map((field) => agent[field]));
    expect(references).toHaveLength(183);
    const required = new Set(references.map((name) => assets.wEngineAliases[name] ?? name));
    expect(required.size).toBe(77);
    expect(Object.keys(assets.wEngineIcons).sort()).toEqual([...required].sort());
    for (const name of new Set(references)) {
      const entry = manifest.wEngines.find((asset) => asset.rawValues?.includes(name))!;
      expectReviewedAsset(assets.getWEngineIcon(name), entry);
    }
    expect(agents.find((agent) => agent.id === "velina-airgid")?.bestAlternative).toBe(
      "Bellicose Blaze",
    );
    expect(references).not.toContain("Wuthering Salon");
    expect(assets.getWEngineIcon("Gilded Blossom (P4 baseline)")).toBeUndefined();
    expect(assets.getWEngineIcon("Unreviewed future engine")).toBeUndefined();
  });

  it("maps each current team ID to its verified visual without legacy banners", () => {
    expect(teams).toHaveLength(9);
    expect(Object.keys(assets.teamVisuals).sort()).toEqual(teams.map((team) => team.id).sort());
    for (const team of teams) {
      const entry = manifest.teamVisuals.find((asset) => asset.entityId === team.id)!;
      expectReviewedAsset(assets.teamVisuals[team.id], entry);
    }
  });

  it("integrates only the ten explicitly approved optional detail-art IDs", () => {
    const approved = manifest.agentDetailArtwork.filter((entry) => entry.verified);
    expect(approved).toHaveLength(10);
    expect(Object.keys(assets.agentDetailArtwork).sort()).toEqual(
      approved.map((entry) => entry.entityId).sort(),
    );
    for (const entry of approved) {
      expectReviewedAsset(assets.agentDetailArtwork[entry.entityId], entry);
    }
    expect(manifest.agentDetailArtwork.filter((entry) => !entry.verified)).toHaveLength(51);
  });

  it("keeps the unapproved upcoming Severian portrait unmapped", () => {
    expect(pullAdvices.find((advice) => advice.name === "Severian Lowell")?.bannerStatus).toBe(
      "Upcoming",
    );
    expect(agents.some((agent) => agent.officialName === "Severian Lowell")).toBe(false);
    expect(assets.agentIcons["severian-lowell"]).toBeUndefined();
  });
});
