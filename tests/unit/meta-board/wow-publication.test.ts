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
});
