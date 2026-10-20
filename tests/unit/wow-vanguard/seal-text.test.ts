import { expect, it } from "vitest";
import { sealTextLines } from "@/modules/wow-vanguard";
it("bounds Unicode name/guild/battle cry text without splitting surrogate pairs", () => {
  for (const value of ["先锋".repeat(16), "Guild ".repeat(8), "⚔️".repeat(60)]) {
    const measure = (text: string) => [...text].length * 20;
    const lines = sealTextLines(value, 320, measure, 3);
    expect(lines.length).toBeLessThanOrEqual(3);
    expect(lines.every((line) => measure(line) <= 320)).toBe(true);
    expect(lines.join("")).not.toContain("\uFFFD");
  }
});
