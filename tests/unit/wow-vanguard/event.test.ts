import { describe, expect, it } from "vitest";
import {
  buildSeatId,
  parseSeatId,
  resolveVanguardStage,
  assertVanguardWriteOpen,
  validateVanguardText,
  enumerateSeatIdentities,
} from "@/modules/wow-vanguard";

const beforeClose = new Date("2026-11-04T22:59:59.999Z");
const close = new Date("2026-11-04T23:00:00Z");
const state = { wowClaimedCount: 0, foreverClaimedCount: 0, wowCompletedAt: null as Date | null };
describe("frozen Vanguard capacity and identity", () => {
  it("assigns all 64128 unique identities with exact phase and letter capacities", () => {
    const seats = enumerateSeatIdentities();
    expect(seats).toHaveLength(64128);
    expect(new Set(seats.map((s) => s.seatId)).size).toBe(64128);
    for (const letter of ["W1", "O", "W2"])
      expect(seats.filter((s) => s.phase === "wow" && s.letter === letter)).toHaveLength(2672);
    for (const letter of ["F", "O", "R1", "E1", "V", "E2", "R2"])
      expect(seats.filter((s) => s.phase === "forever" && s.letter === letter)).toHaveLength(8016);
    expect(seats.filter((s) => s.phase === "wow")).toHaveLength(8016);
    expect(seats.filter((s) => s.phase === "forever")).toHaveLength(56112);
    for (const seat of seats) expect(parseSeatId(seat.seatId)).toEqual(seat);
  });
  it.each([
    "WOW-W1-0000",
    "WOW-W1-2673",
    "WOW-F-0001",
    "FOREVER-W1-0001",
    "FOREVER-O-8017",
    "WOW-O-1",
    "wow-o-0001",
  ])("rejects invalid identity %s", (id) => expect(() => parseSeatId(id)).toThrow());
  it("never assigns a serial or UUID as the public identity", () =>
    expect(buildSeatId("forever", "E2", 421)).toBe("FOREVER-E2-0421"));
});
describe("server event stage", () => {
  it("opens only WOW initially", () =>
    expect(resolveVanguardStage(beforeClose, state)).toBe("WOW_OPEN"));
  const completed = {
    ...state,
    wowClaimedCount: 8016,
    wowCompletedAt: new Date("2026-11-01T12:00:00Z"),
  };
  it("waits exactly 24h", () => {
    expect(resolveVanguardStage(new Date("2026-11-02T11:59:59.999Z"), completed)).toBe(
      "WOW_COMPLETE_WAITING",
    );
    expect(resolveVanguardStage(new Date("2026-11-02T12:00:00Z"), completed)).toBe("FOREVER_OPEN");
  });
  it("reports complete only before cutoff and seals at exact UTC cutoff", () => {
    expect(resolveVanguardStage(beforeClose, { ...completed, foreverClaimedCount: 56112 })).toBe(
      "COMPLETE",
    );
    expect(resolveVanguardStage(close, { ...completed, foreverClaimedCount: 56112 })).toBe(
      "SEALED",
    );
  });
  it("never opens FOREVER when unlock reaches cutoff", () => {
    const late = { ...completed, wowCompletedAt: new Date("2026-11-03T23:00:00Z") };
    expect(resolveVanguardStage(beforeClose, late)).toBe("WOW_COMPLETE_WAITING");
    expect(resolveVanguardStage(close, late)).toBe("SEALED");
  });
  it("fails closed for inconsistent counters and missing completion time", () => {
    expect(() => resolveVanguardStage(beforeClose, { ...state, wowClaimedCount: 8016 })).toThrow();
    expect(() => resolveVanguardStage(beforeClose, { ...state, foreverClaimedCount: 1 })).toThrow();
  });
  it("accepts just before but never at or after cutoff", () => {
    expect(() => assertVanguardWriteOpen(beforeClose)).not.toThrow();
    expect(() => assertVanguardWriteOpen(close)).toThrow("EVENT_SEALED");
  });
});
describe("plain text boundary", () => {
  it("normalizes Unicode and preserves display capitalization", () =>
    expect(validateVanguardText("  Ａｚｅｒｏｔｈ  ", 2, 32)).toBe("Azeroth"));
  it.each([
    "https://spam.example",
    "spam.example",
    "me@example.com",
    "discord.gg/raid",
    "+1 (415) 555-1234",
    "<b>Raid</b>",
    "**Raid**",
    "[Raid](link)",
  ])("rejects promotion or markup %s", (value) =>
    expect(() => validateVanguardText(value, 2, 120)).toThrow(),
  );
  it("counts Unicode characters rather than UTF16 units", () =>
    expect(validateVanguardText("😀😀", 2, 2)).toBe("😀😀"));
});
