import { expect, it } from "vitest";
import { reportSchema } from "@/modules/wow-vanguard";
it("permits only the frozen report reasons and refuses free text", () => {
  for (const reason of [
    "sexual_graphic",
    "hate_impersonation",
    "privacy",
    "spam_promotion",
    "other",
  ])
    expect(reportSchema.safeParse({ seatId: "WOW-O-0001", reason }).success).toBe(true);
  expect(reportSchema.safeParse({ seatId: "WOW-O-0001", reason: "custom" }).success).toBe(false);
  expect(
    reportSchema.safeParse({ seatId: "WOW-O-0001", reason: "privacy", details: "free text" })
      .success,
  ).toBe(false);
});
