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
