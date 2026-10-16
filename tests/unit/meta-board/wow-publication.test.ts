import { describe, expect, it } from "vitest";
import {
  validatePublicationReview,
  requireActivePhase,
} from "@/modules/meta-board/domain/forever-logs-publication";
const now = new Date("2026-10-15T01:00:00Z");
const review = {
  phaseId: 1,
  phaseName: "Beta",
  levelCap: 30,
  officialSourceUrl:
    "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes/2360696",
  checkedAt: "2026-10-15T00:00:00Z",
  taxonomySourceUrl: "https://foreverlogs.gg/faq",
  dungeons: ["City of Dalaran", "Excavation Site: Wetlands", "Razorfen Downs", "Uldaman"],
  roleBySpec: { "Shaman::Earthen Guardian": ["tank"], "Mage::Fire": ["dps"] },
};
describe("WoW publication accuracy gate", () => {
  it("requires one explicit active phase, never latest-id fallback", () => {
    expect(() =>
      requireActivePhase({ phases: [{ id: 7, phase_number: 1, name: "Beta", is_active: false }] }),
    ).toThrow(/active phase/);
    expect(() =>
      requireActivePhase({
        phases: [
          { id: 7, phase_number: 1, name: "Beta", is_active: true },
          { id: 8, phase_number: 2, name: "Other", is_active: true },
        ],
      }),
    ).toThrow(/active phase/);
    expect(
      requireActivePhase({ phases: [{ id: 7, phase_number: 1, name: "Beta", is_active: true }] }),
    ).toMatchObject({ id: 1, name: "Beta" });
  });
  it("accepts reviewed current phase, official scope and explicit live taxonomy", () => {
    expect(
      validatePublicationReview(review, { phaseId: 1, phaseName: "Beta", now }).roleBySpec[
        "Shaman::Earthen Guardian"
      ],
    ).toEqual(["tank"]);
  });
  it("blocks missing, stale, future, unofficial and mismatched context", () => {
    for (const changed of [
      null,
      { ...review, phaseId: 2 },
      { ...review, phaseName: "Old Beta" },
      { ...review, levelCap: 60 },
      { ...review, checkedAt: "2026-10-01T00:00:00Z" },
      { ...review, checkedAt: "2026-10-16T00:00:00Z" },
      { ...review, officialSourceUrl: "https://example.com" },
      { ...review, dungeons: ["Uldaman"] },
      { ...review, roleBySpec: {} },
    ])
      expect(() =>
        validatePublicationReview(changed, { phaseId: 1, phaseName: "Beta", now }),
      ).toThrow();
  });

  it("identifies known Forever Logs cohorts vs official specs", async () => {
    const { isSpecialCohortSpec } =
      await import("@/modules/meta-board/domain/forever-logs-publication");
    expect(isSpecialCohortSpec("Warrior::Gladiator")).toBe(true);
    expect(isSpecialCohortSpec("Paladin::Justicar")).toBe(true);
    expect(isSpecialCohortSpec("Warrior::Arms")).toBe(false);
    expect(isSpecialCohortSpec("Warrior::Protection")).toBe(false);
    expect(isSpecialCohortSpec("Paladin::Retribution")).toBe(false);
    expect(isSpecialCohortSpec("Paladin::Holy")).toBe(false);

    // Test C: explicit review cohortSpecs classification
    expect(isSpecialCohortSpec("Warrior::Gladiator", { cohortSpecs: ["Warrior::Gladiator"] })).toBe(
      true,
    );
    expect(isSpecialCohortSpec("Mage::Frostfire", { cohortSpecs: ["Mage::Frostfire"] })).toBe(true);
    expect(isSpecialCohortSpec("Warrior::Gladiator", { cohortSpecs: ["Mage::Frostfire"] })).toBe(
      false,
    );

    // Test D: incomplete officialSpecs must NEVER falsely classify an unknown spec as cohort
    expect(
      isSpecialCohortSpec("Mage::Some Future Spec", { officialSpecs: ["Warrior::Arms"] }),
    ).toBe(false);
    expect(isSpecialCohortSpec("Warrior::Arms", { officialSpecs: ["Warrior::Arms"] })).toBe(false);

    // Test E: default compatibility fallbacks preserved
    expect(isSpecialCohortSpec("Warrior::Gladiator")).toBe(true);
    expect(isSpecialCohortSpec("Paladin::Justicar")).toBe(true);
    expect(isSpecialCohortSpec("Warrior::Gladiator", { officialSpecs: ["Warrior::Arms"] })).toBe(
      true,
    );
  });
});
