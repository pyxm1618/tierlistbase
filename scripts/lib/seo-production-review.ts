import type { IndexablePage, SiteSeoConfig } from "@/platform/seo/types";

type ProductionSeoSite = Pick<SiteSeoConfig, "canonicalOrigin" | "releaseStatus">;
type ProductionSeoRoute = Pick<IndexablePage, "route" | "reviewStatus">;

export function assertProductionSeoReviewContract(
  site: ProductionSeoSite,
  routes: readonly ProductionSeoRoute[],
): void {
  if (site.releaseStatus !== "reviewed") {
    throw new Error("production SEO config must be reviewed");
  }
  if (/example\.com/i.test(site.canonicalOrigin)) {
    throw new Error("production SEO canonical origin is a placeholder");
  }
  for (const route of routes) {
    if (route.reviewStatus !== "reviewed") {
      throw new Error(`production SEO route must be reviewed: ${route.route}`);
    }
  }
}
