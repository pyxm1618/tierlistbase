import { expect, it, vi } from "vitest";
import {
  validateLocalImage,
  vanguardErrorMessage,
  runVanguardRitual,
  sealInput,
  draftFromStorage,
} from "@/modules/wow-vanguard";
it("rejects local file formats and >20MB before decoding", () => {
  expect(() => validateLocalImage({ type: "image/gif", size: 100 })).toThrow(
    "MEDIA_FORMAT_INVALID",
  );
  expect(() => validateLocalImage({ type: "image/jpeg", size: 20 * 1024 * 1024 + 1 })).toThrow(
    "MEDIA_TOO_LARGE",
  );
  expect(() => validateLocalImage({ type: "image/png", size: 1024 })).not.toThrow();
  expect(vanguardErrorMessage("EVENT_SEALED")).toBe(
    "The inscription period has ended. The Monument is now sealed.",
  );
});
it("retains only validated text draft fields, never OAuth identity or file data", () => {
  const raw = JSON.stringify({
    seatId: "WOW-O-0001",
    holdToken: "a".repeat(43),
    displayName: "Vanguard",
    faction: "horde",
    className: "Mage",
    guildName: "Guild",
    battleCry: "For Azeroth",
    email: "secret@example.com",
    file: "bytes",
  });
  expect(draftFromStorage(raw)).toEqual({
    seatId: "WOW-O-0001",
    holdToken: "a".repeat(43),
    displayName: "Vanguard",
    faction: "horde",
    className: "Mage",
    guildName: "Guild",
    battleCry: "For Azeroth",
  });
  expect(draftFromStorage("bad")).toBeNull();
});
it("runs the accepted inscription ritual for 4 seconds and preserves reveal with reduced motion", async () => {
  vi.useFakeTimers();
  const frames: string[] = [];
  const ritual = runVanguardRitual((frame) => frames.push(frame), true);
  await vi.advanceTimersByTimeAsync(3999);
  expect(frames).not.toContain("reveal");
  await vi.advanceTimersByTimeAsync(1);
  await ritual;
  expect(frames.at(-1)).toBe("reveal");
  vi.useRealTimers();
});
it("Seal renderer receives only public inscription and a seat-specific QR link", () => {
  const result = sealInput(
    {
      seatId: "WOW-O-0001",
      status: "active",
      displayName: "Vanguard",
      faction: "horde",
      className: "Mage",
      guildName: null,
      battleCry: null,
      inscribedAt: "2026-10-20T00:00:00.000Z",
      image: null,
    },
    "https://www.tierlistbase.com",
  );
  expect(result.qrPayload).toBe(
    "https://www.tierlistbase.com/wow-forever/vanguard?seat=WOW-O-0001",
  );
  expect(result.formats).toEqual(["9:16", "1:1"]);
  expect(JSON.stringify(result)).not.toMatch(/email|userId|ipAddress/);
});

it("reconstructs completed WOW archive occupancy after the server opens FOREVER", async () => {
  const { occupiedSeats } = await import("@/modules/wow-vanguard");
  const manifest = {
    phase: "forever",
    stage: "FOREVER_OPEN",
    counts: { wow: 8016, forever: 1, total: 8017 },
    occupancy: Buffer.alloc(7014).toString("base64"),
  } as Parameters<typeof occupiedSeats>[0];
  const wow = occupiedSeats(manifest, "wow");
  expect(wow.size).toBe(8016);
  expect(wow.has("WOW-W2-2672")).toBe(true);
  expect(
    occupiedSeats(
      { ...manifest, phase: "wow", counts: { wow: 10, forever: 0, total: 10 } },
      "forever",
    ).size,
  ).toBe(0);
});
