import { beforeEach, expect, it, vi } from "vitest";
import { MemoryCacheHandler, setDataCacheHandler } from "vinext/shims/cache";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => import("vinext/shims/cache"));
vi.mock("@/modules/wow-vanguard", () => ({ wowClassFromQuery: () => null }));

const reads = vi.hoisted(() => ({ board: vi.fn(), changes: vi.fn() }));
vi.mock("@/modules/meta-board", () => ({
  getGameMetaBoardData: reads.board,
  getRecentRatingChanges: reads.changes,
  buildWowSpecs: () => [],
  summarizeWowStatus: () => "Current",
  WowWorkspace: () => null,
  WowRoleLinks: () => null,
  WowChanges: () => null,
  WowInsights: () => null,
  WowMethodology: () => null,
  WowSources: () => null,
  wowHero: "/hero.webp",
  wowStyles: {},
}));

import WowForeverTierListPage from "../../../src/app/(marketing)/wow-forever/tier-list/page";

const available = {
  hasData: true,
  activeContext: { id: "dps-context", role: "dps" },
  version: { id: "beta-version", version: "Current Beta" },
  availableRoles: ["dps"],
};
const renderPage = () => WowForeverTierListPage({ searchParams: Promise.resolve({ role: "dps" }) });

beforeEach(() => {
  reads.board.mockReset();
  reads.changes.mockReset().mockResolvedValue([]);
  setDataCacheHandler(new MemoryCacheHandler());
});

it("queries changes and caches a successful board without showing unavailable", async () => {
  reads.board.mockResolvedValue(available);
  expect(JSON.stringify(await renderPage())).not.toContain("currently unavailable");
  await renderPage();
  expect(reads.board).toHaveBeenCalledTimes(1);
  expect(reads.changes).toHaveBeenCalledExactlyOnceWith("wow-forever", 10, undefined, {
    rankingContextId: "dps-context",
    toVersionId: "beta-version",
  });
});

it("rejects an empty board before querying changes and lets the existing catch render safely", async () => {
  reads.board.mockResolvedValueOnce({ ...available, hasData: false }).mockResolvedValue(available);
  const unavailablePage = JSON.stringify(await renderPage());
  expect(unavailablePage).toContain(
    "WoW ranking data is currently unavailable. Please try again later.",
  );
  expect(unavailablePage).not.toContain("WoW ranking data unavailable");
  expect(reads.changes).not.toHaveBeenCalled();

  expect(JSON.stringify(await renderPage())).not.toContain("currently unavailable");
  await renderPage();
  expect(reads.board).toHaveBeenCalledTimes(2);
  expect(reads.changes).toHaveBeenCalledTimes(1);
});
