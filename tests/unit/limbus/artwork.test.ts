import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import manifest from "@/modules/limbus-tier-list/assets/asset-manifest.json";
import { egoArtwork, identityArtwork, teamArtwork } from "@/modules/limbus-tier-list/artwork";
import {
  bestEgoBySinner,
  bestIdentityBySinner,
  egoRows,
  identityRows,
  teamDetails,
  teamRows,
} from "@/modules/limbus-tier-list/data";

const moduleDir = fileURLToPath(new URL("../../../src/modules/limbus-tier-list/", import.meta.url));

describe("Limbus artwork map", () => {
  it("覆盖全部 190 Identity 与 116 E.G.O 素材，且不多不少", () => {
    expect(Object.keys(identityArtwork)).toHaveLength(190);
    expect(Object.keys(egoArtwork)).toHaveLength(116);

    expect(new Set(Object.keys(identityArtwork))).toEqual(
      new Set(manifest.entries.identities.map((entry) => entry.name)),
    );
    expect(new Set(Object.keys(egoArtwork))).toEqual(
      new Set(manifest.entries.ego.map((entry) => entry.name)),
    );
  });

  it("主表 190 / 116 条全部可精确解析（unresolved = 0）", () => {
    expect(identityRows).toHaveLength(190);
    expect(egoRows).toHaveLength(116);

    for (const row of identityRows) {
      expect(identityArtwork[row.identity], `identity: ${row.identity}`).toBeDefined();
    }
    for (const row of egoRows) {
      expect(egoArtwork[row.ego], `ego: ${row.ego}`).toBeDefined();
    }
  });

  it("Best Identity / Best E.G.O 的 36 + 36 个推荐位全部可解析", () => {
    for (const pick of bestIdentityBySinner) {
      for (const name of [pick.bestOverall, pick.bestGeneralist, pick.bestForTeam]) {
        expect(identityArtwork[name], `best identity: ${name}`).toBeDefined();
      }
    }
    for (const pick of bestEgoBySinner) {
      for (const name of [pick.bestOverall, pick.bestGeneralist, pick.bestForTeam]) {
        expect(egoArtwork[name], `best ego: ${name}`).toBeDefined();
      }
    }
  });

  it("12 个 Team artwork 全部按冻结 ID 精确解析", () => {
    expect(teamRows).toHaveLength(12);
    expect(Object.keys(teamArtwork)).toHaveLength(12);

    for (const row of teamRows) {
      expect(teamArtwork[row.id], `team artwork: ${row.id}`).toBeDefined();
    }
  });

  it("全部 12 个 Team Details 的 Core / Recommended / Substitutes 与 Key E.G.O 全部可解析", () => {
    expect(teamDetails).toHaveLength(12);
    for (const team of teamDetails) {
      for (const name of [...team.coreMembers, ...team.recommendedTeam, ...team.substitutes]) {
        expect(identityArtwork[name], `team identity in ${team.team}: ${name}`).toBeDefined();
      }
      for (const name of team.keyEgo) {
        expect(egoArtwork[name], `team key ego in ${team.team}: ${name}`).toBeDefined();
      }
    }
  });

  it("E.G.O 的 canonical name 与 Sinner 归属一致，避免同名错配", () => {
    const sinnerByName = new Map(egoRows.map((row) => [row.ego, row.sinner]));
    for (const entry of manifest.entries.ego) {
      expect(sinnerByName.get(entry.name), `ego sinner: ${entry.name}`).toBe(entry.sinner);
    }

    const identitySinnerByName = new Map(identityRows.map((row) => [row.identity, row.sinner]));
    for (const entry of manifest.entries.identities) {
      expect(identitySinnerByName.get(entry.name), `identity sinner: ${entry.name}`).toBe(
        entry.sinner,
      );
    }
  });

  it("映射模块不得被客户端组件引用（否则 306 条素材元数据会进入客户端 bundle）", () => {
    const clientModules = readdirSync(moduleDir)
      .filter((file) => /\.tsx?$/.test(file))
      .map((file) => ({ file, source: readFileSync(moduleDir + file, "utf8") }))
      .filter(({ source }) => source.startsWith('"use client"'));

    // 确认扫描确实命中了客户端边界，避免测试空转
    expect(clientModules.map(({ file }) => file)).toContain("identity-ranking.tsx");
    for (const { file, source } of clientModules) {
      expect(source, file).not.toMatch(/from "\.\/artwork"/);
    }
  });
});
