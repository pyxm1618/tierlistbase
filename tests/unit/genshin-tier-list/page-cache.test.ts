import { beforeEach, expect, it, vi } from "vitest";
import { MemoryCacheHandler, setDataCacheHandler } from "vinext/shims/cache";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => import("vinext/shims/cache"));

const reads = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("@/modules/genshin-tier-list", () => ({
  loadGenshinData: reads.load,
  GenshinChanges: () => null,
  GenshinEditorial: () => null,
  GenshinTierBoard: () => null,
  genshinHero: "/hero.webp",
  genshinStyles: {},
}));

import GenshinImpactTierListPage from "../../../src/app/(marketing)/genshin-impact/tier-list/page";

const available = {
  status: "available",
  data: { version: "test-version", updatedAt: "2026-10-16T00:00:00Z", characters: [] },
};

beforeEach(() => {
  reads.load.mockReset();
  setDataCacheHandler(new MemoryCacheHandler());
});

it("retries after an unavailable read instead of caching the failure", async () => {
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    reads.load.mockResolvedValueOnce({ status: "unavailable" }).mockResolvedValue(available);
    const unavailablePage = await GenshinImpactTierListPage();
    expect(JSON.stringify(unavailablePage)).toContain("currently unavailable");
    const recoveredPage = await GenshinImpactTierListPage();
    expect(recoveredPage.type).toBe("main");
    await GenshinImpactTierListPage();
    expect(reads.load).toHaveBeenCalledTimes(2);
    expect(errors).toHaveBeenCalledWith("Genshin ranking read unavailable", expect.any(Error));
  } finally {
    errors.mockRestore();
  }
});
