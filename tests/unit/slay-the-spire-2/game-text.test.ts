import { describe, expect, it } from "vitest";

import { cards, potions, relics } from "@/modules/slay-the-spire-2-tier-list/data";
import { formatSlayGameText } from "@/modules/slay-the-spire-2-tier-list/game-text";

describe("formatSlayGameText", () => {
  it("removes color markup while preserving readable text", () => {
    expect(formatSlayGameText("[gold]Block[/gold]")).toBe("Block");
    expect(formatSlayGameText("[blue]2[/blue] cards")).toBe("2 cards");
  });

  it("translates energy tokens and prefixed zero-cost energy markup", () => {
    expect(formatSlayGameText("Gain [energy:2].")).toBe("Gain 2 Energy.");
    expect(formatSlayGameText("Add a 0[energy:1] copy.")).toBe("Add a 0 Energy copy.");
  });

  it("translates star tokens with readable singular and plural labels", () => {
    expect(formatSlayGameText("Gain [star:1].")).toBe("Gain 1 Star.");
    expect(formatSlayGameText("Gain [star:3].")).toBe("Gain 3 Stars.");
  });

  it("leaves ordinary text unchanged", () => {
    expect(formatSlayGameText("Deal 18 damage.")).toBe("Deal 18 damage.");
  });

  it("formats multiple token types in one description", () => {
    expect(formatSlayGameText("[gold]Block[/gold]. Gain [energy:2] and [star:1].")).toBe(
      "Block. Gain 2 Energy and 1 Star.",
    );
  });

  it("uses a bracket-free safe fallback for unknown tokens", () => {
    expect(formatSlayGameText("Unknown [mystery:2] token.")).toBe("Unknown 2 token.");
    expect(formatSlayGameText("[color]Readable[/color]")).toBe("Readable");
    expect(formatSlayGameText("Choose [Card].")).toBe("Choose Card.");
  });

  it("removes raw markup from every current rendered description", () => {
    for (const item of [...cards, ...relics, ...potions])
      expect(formatSlayGameText(item.description)).not.toMatch(/\[[^\]]+\]/);
  });
});
