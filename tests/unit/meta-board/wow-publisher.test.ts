import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  buildWowForeverDataCandidate,
  WOW_FOREVER_NEAR_CAP_DUNGEONS,
} from "@/modules/meta-board/data/forever-logs-publisher";
const now = new Date("2026-10-15T01:00:00Z");
const review = {
  phaseId: 3,
  phaseName: "Current Beta",
  levelCap: 30,
  checkedAt: now.toISOString(),
  officialSourceUrl:
    "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes/2360696",
  taxonomySourceUrl: "https://foreverlogs.gg/faq",
  dungeons: WOW_FOREVER_NEAR_CAP_DUNGEONS.map((d) => d.name),
  roleBySpec: { "Shaman::Earthen Guardian": ["tank", "dps"], "Priest::Holy": ["healer"] },
};
function respond(
  options: { wrongPhase?: boolean; invalidSample?: boolean; unknownSpec?: boolean } = {},
) {
  return vi.fn(async (input: string) => {
    const url = new URL(input);
    const body = url.pathname.endsWith("/phases")
      ? {
          success: true,
          phases: [
            {
              id: 77,
              phase_number: 3,
              name: "Current Beta",
              is_active: true,
              locations: review.dungeons.map((location) => ({ location })),
            },
          ],
        }
      : {
          success: true,
          phase: options.wrongPhase ? 1 : 3,
          phase_name: "Current Beta",
          location: url.searchParams.get("location"),
          metric: url.searchParams.get("metric"),
          difficulty: "all",
          bracket: "all",
          damage_mode: "standard",
          statistics:
            url.searchParams.get("metric") === "avg_hps"
              ? { Priest: { specs: { Holy: { median: 100, total_parses: 20 } } } }
              : {
                  Shaman: {
                    specs: {
                      [options.unknownSpec ? "Unreviewed Spec" : "Earthen Guardian"]: {
                        median: 120,
                        total_parses: options.invalidSample ? -1 : 20,
                      },
                    },
                  },
                },
        };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}
afterEach(() => vi.unstubAllGlobals());
describe("Forever Logs publisher uses reviewed live role context", () => {
  it("uses phase number rather than database id and preserves observed multi-role Shaman", async () => {
    const fetch = respond();
    vi.stubGlobal("fetch", fetch);
    const candidate = await buildWowForeverDataCandidate({
      apiKey: "synthetic-test-key",
      review,
      now,
    });
    expect(candidate.phaseId).toBe(3);
    expect(
      candidate.rankings
        .filter((r) => r.item.className === "Shaman")
        .map((r) => r.item.role)
        .sort(),
    ).toEqual(["dps", "tank"]);
    expect(candidate.rankings.every((r) => r.item.sampleCount === 80)).toBe(true);
    expect(
      fetch.mock.calls
        .filter(([url]) => url.includes("statistics"))
        .every(([url]) => new URL(url).searchParams.get("phase") === "3"),
    ).toBe(true);
    expect(
      WOW_FOREVER_NEAR_CAP_DUNGEONS.find((d) => d.name === "Excavation Site: Wetlands")?.levelRange,
    ).toBe("26-31");
  });
  it("rejects payload context mismatch instead of publishing another phase", async () => {
    vi.stubGlobal("fetch", respond({ wrongPhase: true }));
    await expect(
      buildWowForeverDataCandidate({ apiKey: "synthetic-test-key", review, now }),
    ).rejects.toThrow(/context mismatch/);
  });
  it("rejects malformed spec statistics rather than silently excluding invalid payload rows", async () => {
    vi.stubGlobal("fetch", respond({ invalidSample: true }));
    await expect(
      buildWowForeverDataCandidate({ apiKey: "synthetic-test-key", review, now }),
    ).rejects.toThrow(/validation failed/);
  });
  it("requires review for each returned spec instead of assigning DPS by default", async () => {
    vi.stubGlobal("fetch", respond({ unknownSpec: true }));
    await expect(
      buildWowForeverDataCandidate({ apiKey: "synthetic-test-key", review, now }),
    ).rejects.toThrow(/Unreviewed live spec taxonomy/);
  });
});
