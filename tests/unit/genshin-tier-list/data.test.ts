import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { mapGenshinCharacters } from "@/modules/genshin-tier-list/data";
import { reviewedRows } from "../../genshin-tier-list/fixture";

describe("reviewed Genshin database mapping", () => {
  it("maps all 121 approved ratings/profiles losslessly, with no pending or fabricated F tier", () => {
    const characters = mapGenshinCharacters(reviewedRows);
    expect(characters).toHaveLength(121);
    expect(
      Object.fromEntries(
        ["S", "A+", "A", "B+", "B", "C", "D", "E", "F", "Pending Evaluation"].map((tier) => [
          tier,
          characters.filter((c) => c.tier === tier).length,
        ]),
      ),
    ).toEqual({
      S: 9,
      "A+": 21,
      A: 26,
      "B+": 29,
      B: 16,
      C: 15,
      D: 2,
      E: 3,
      F: 0,
      "Pending Evaluation": 0,
    });
    for (const [name, tier] of Object.entries({
      Vesna: "A+",
      Vodyanitsa: "S",
      Bennett: "A+",
      Qiqi: "A",
      Razor: "B+",
      Traveler: "A",
      Venti: "A+",
      "Yae Miko": "A+",
    }))
      expect(characters.find((c) => c.name === name)?.tier).toBe(tier);
    for (const row of reviewedRows) {
      expect(characters.find((c) => c.id === row.id)).toMatchObject({
        primaryRole: row.primaryRole,
        whyThisTier: row.whyThisTier,
        strengths: JSON.parse(row.strengths),
        limitations: JSON.parse(row.constraints),
        bestUseContext: row.bestUseContext,
        rankingAssumption: row.rankingAssumption,
        evidenceSummary: row.evidenceSummary,
        updatedAt: row.updatedAt.toISOString(),
        element: row.metadata.element,
        rarity: row.metadata.rarity,
        weapon: row.metadata.weapon,
        officialReleaseVersion: row.metadata.officialReleaseVersion,
        officialUrl: row.metadata.officialUrl,
      });
    }
  });
  it("accepts published ratings as well as reviewed", () => {
    expect(
      mapGenshinCharacters(reviewedRows.map((row) => ({ ...row, editorialStatus: "published" }))),
    ).toHaveLength(121);
  });
  it.each([
    ["missing roster", () => reviewedRows.slice(1)],
    ["duplicate entity", () => [...reviewedRows.slice(1), reviewedRows[1]!]],
    ["missing profile", () => reviewedRows.map((r, i) => (i ? r : { ...r, profileId: null }))],
    ["missing rating", () => reviewedRows.map((r, i) => (i ? r : { ...r, ratingId: null }))],
    ["draft", () => reviewedRows.map((r, i) => (i ? r : { ...r, editorialStatus: "draft" }))],
    [
      "JSONB string",
      () => reviewedRows.map((r, i) => (i ? r : { ...r, metadata: JSON.stringify(r.metadata) })),
    ],
    [
      "invalid element",
      () =>
        reviewedRows.map((r, i) =>
          i ? r : { ...r, metadata: { ...r.metadata, element: "Unknown" } },
        ),
    ],
    ["malformed array", () => reviewedRows.map((r, i) => (i ? r : { ...r, strengths: "invalid" }))],
    ["non-array", () => reviewedRows.map((r, i) => (i ? r : { ...r, constraints: '"text"' }))],
    [
      "missing editorial text",
      () => reviewedRows.map((r, i) => (i ? r : { ...r, whyThisTier: null })),
    ],
  ])("rejects %s rather than returning partial or mock characters", (_name, rows) => {
    expect(() => mapGenshinCharacters(rows())).toThrow();
  });
});
