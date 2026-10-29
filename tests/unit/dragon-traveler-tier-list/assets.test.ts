import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import sharp from "sharp";
import { expect, it } from "vitest";

import provenance from "@/modules/dragon-traveler-tier-list/assets/provenance.json";

it("serves exactly the audited local derivative of the supplied Hero source", async () => {
  const hero = readFileSync(
    "src/modules/dragon-traveler-tier-list/assets/dragon-traveler-hero.webp",
  );
  expect(createHash("sha256").update(hero).digest("hex")).toBe(provenance.hero.sha256);
  expect(hero.byteLength).toBe(provenance.hero.bytes);
  expect(hero.byteLength).toBeLessThan(80_000);
  expect(await sharp(hero).metadata()).toMatchObject(provenance.hero.dimensions);
  expect(provenance.hero.path).not.toMatch(/^https?:/);
});

import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe } from "vitest";
import { getRoster, normalizeSourceTier } from "@/modules/dragon-traveler-tier-list";
const root = join(process.cwd(), "src/modules/dragon-traveler-tier-list");
const manifest = JSON.parse(readFileSync(join(root, "assets/provenance.json"), "utf8"))
  .restoredAssets as {
  id: string;
  path: string;
  sourceUrl?: string;
}[];
describe("Dragon Traveler asset and grade provenance", () => {
  it("has a local, real WebP portrait for every live character", () => {
    for (const server of ["global", "taiwan"] as const)
      for (const c of getRoster(server)) {
        const asset = manifest.find((a) => a.id === c.id)!;
        expect(asset, c.id).toBeDefined();
        expect(asset.sourceUrl).toMatch(/^https:\/\/www.hideoutgacha.com\//);
        const bytes = readFileSync(join(root, asset.path));
        expect(bytes.subarray(0, 4).toString()).toBe("RIFF");
        expect(bytes.subarray(8, 12).toString()).toBe("WEBP");
      }
    expect(existsSync(join(root, "assets/dragon-traveler-hero.webp"))).toBe(true);
  });
  it("uses only observed source grades and fails on an unknown grade", () => {
    expect(normalizeSourceTier("SS")).toBe("S+");
    expect(normalizeSourceTier("S+")).toBe("S");
    expect(normalizeSourceTier("A+")).toBe("A");
    expect(() => normalizeSourceTier("UNKNOWN")).toThrow("Unknown Dragon Traveler source grade");
  });
});

it("rejects inherited object keys as source grades", () => {
  expect(() => normalizeSourceTier("toString")).toThrow("Unknown Dragon Traveler source grade");
  expect(() => normalizeSourceTier("__proto__")).toThrow("Unknown Dragon Traveler source grade");
});
