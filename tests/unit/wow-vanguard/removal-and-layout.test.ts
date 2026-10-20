import { expect, it } from "vitest";
import { validateSeatLayouts } from "@/modules/wow-vanguard";
it("does not mistake identity capacity for an approved geometric layout", () => {
  expect(() => validateSeatLayouts([])).toThrow("Missing WOW");
  expect(() =>
    validateSeatLayouts([
      { phase: "wow", letter: "W1", positions: new Float32Array(4), neighbors: new Map() },
    ]),
  ).toThrow("Invalid Vanguard layout");
});
