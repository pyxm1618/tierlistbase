import { existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  RENDERED_CHARACTER_AVATARS,
  getCharacterAvatar,
} from "@/modules/nikke-tier-list/character-avatars";

const avatarsDir = fileURLToPath(
  new URL("../../../src/modules/nikke-tier-list/assets/avatars", import.meta.url),
);

describe("NIKKE Character Avatars", () => {
  it("preserves exactly 203 verified local avatar assets", () => {
    expect(existsSync(avatarsDir)).toBe(true);
    const files = readdirSync(avatarsDir).filter((file) => !file.startsWith("."));
    expect(files).toHaveLength(203);

    for (const file of files) {
      const stats = statSync(`${avatarsDir}/${file}`);
      expect(stats.size).toBeGreaterThan(0);
      expect(file.endsWith(".png")).toBe(true);
    }
  });

  it("strictly maps all 18 currently rendered characters without missing entries", () => {
    const renderedNames = [
      "Alice",
      "Blanc",
      "Centi",
      "Crown",
      "Dorothy",
      "Drake",
      "Helm",
      "Liter",
      "Maxwell",
      "Miranda",
      "Modernia",
      "Naga",
      "Noir",
      "Noise",
      "Privaty",
      "Rapunzel",
      "Red Hood",
      "Scarlet",
    ];

    expect(Object.keys(RENDERED_CHARACTER_AVATARS)).toHaveLength(18);

    for (const name of renderedNames) {
      const avatar = getCharacterAvatar(name);
      expect(avatar).toBeDefined();
    }
  });

  it("throws clear error when querying an unmapped character instead of silent fallback", () => {
    expect(() => getCharacterAvatar("NonExistentCharacter")).toThrowError(
      'Missing verified avatar asset for rendered character: "NonExistentCharacter"',
    );
  });
});
