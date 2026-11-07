import { describe, expect, it } from "vitest";

import { assertProductionSeoReviewContract } from "../../../scripts/lib/seo-production-review";

const reviewedSite = {
  canonicalOrigin: "https://www.tierlistbase.com",
  releaseStatus: "reviewed",
} as const;

const reviewedRoutes = [{ route: "/", reviewStatus: "reviewed" }] as const;

describe("production SEO review gate", () => {
  it("rejects a draft site release status", () => {
    expect(() =>
      assertProductionSeoReviewContract(
        { ...reviewedSite, releaseStatus: "draft" },
        reviewedRoutes,
      ),
    ).toThrow("production SEO config must be reviewed");
  });

  it("rejects any draft public indexable route", () => {
    expect(() =>
      assertProductionSeoReviewContract(reviewedSite, [
        ...reviewedRoutes,
        { route: "/draft-route", reviewStatus: "draft" },
      ]),
    ).toThrow("production SEO route must be reviewed: /draft-route");
  });

  it("accepts reviewed site and route statuses", () => {
    expect(() => assertProductionSeoReviewContract(reviewedSite, reviewedRoutes)).not.toThrow();
  });
});
