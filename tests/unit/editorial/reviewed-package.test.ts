import { describe, expect, it } from "vitest";
import { readReviewedPackage, validateReviewedPackage } from "../../../scripts/editorial-package";

describe("reviewed Genshin package", () => {
  it("accepts the frozen roster, final tiers and nullable sample counts", async () => {
    const pkg = await readReviewedPackage();
    expect(pkg.characters).toHaveLength(121);
    expect(pkg.ratings).toHaveLength(121);
    expect(pkg.evidence).toHaveLength(130);
    expect(pkg.ratings.find((row) => row.entitySlug === "vesna")?.tier).toBe("A+");
    expect(pkg.ratings.find((row) => row.entitySlug === "vodyanitsa")?.tier).toBe("S");
    expect(
      pkg.evidence
        .filter((row) => row.numericValue !== null)
        .every((row) => row.sampleSize === null),
    ).toBe(true);
  });

  it.each(["duplicate", "reference", "tier", "status", "missing", "manifest", "evidence", "date"])(
    "rejects %s before any database write",
    async (problem) => {
      const pkg = structuredClone(await readReviewedPackage());
      switch (problem) {
        case "duplicate":
          pkg.characters[1]!.slug = pkg.characters[0]!.slug;
          break;
        case "reference":
          pkg.ratings[0]!.entitySlug = "unknown";
          break;
        case "tier":
          Object.assign(pkg.ratings[0]!, { tier: "SS" });
          break;
        case "status":
          Object.assign(pkg.evidence[0]!, { status: "Not Verified" });
          break;
        case "missing":
          pkg.characters[0]!.officialUrl = "";
          break;
        case "manifest":
          pkg.manifest.evidenceCount = 129;
          break;
        case "evidence":
          pkg.evidence[1] = structuredClone(pkg.evidence[0]!);
          break;
        case "date":
          pkg.evidence[0]!.checkedAt = "2026-02-30";
          break;
      }
      expect(() => validateReviewedPackage(pkg)).toThrow();
    },
  );
});
