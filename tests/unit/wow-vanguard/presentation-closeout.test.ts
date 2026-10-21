import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { VanguardFocusVisual } from "@/modules/wow-vanguard/client/focus-visual";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createVanguardAudio } from "@/modules/wow-vanguard/experience/audio";
import { RITUAL_POST_FRAMES, runPostSuccessRitual } from "@/modules/wow-vanguard/client/contracts";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("Vanguard presentation boundaries", () => {
  it("Music Off mutes the BGM gain while every independent SFX still starts", async () => {
    const sources: {
      start: ReturnType<typeof vi.fn>;
      loop: boolean;
      connect: ReturnType<typeof vi.fn>;
    }[] = [];
    const gain = { gain: { setTargetAtTime: vi.fn() }, connect: vi.fn() };
    class Context {
      state = "running";
      currentTime = 0;
      destination = {};
      resume = vi.fn(async () => {});
      close = vi.fn(async () => {});
      decodeAudioData = vi.fn(async () => ({}));
      createGain() {
        return gain;
      }
      createBufferSource() {
        const source = { start: vi.fn(), stop: vi.fn(), loop: false, connect: vi.fn(() => gain) };
        sources.push(source);
        return source;
      }
    }
    vi.stubGlobal("AudioContext", Context);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Uint8Array(8))),
    );
    const audio = createVanguardAudio({
      bgm: "/bgm.wav",
      sfx: {
        focus: "/focus.wav",
        plate_formation: "/form.wav",
        plate_insert: "/lock.wav",
        seat_ignite: "/ignite.wav",
      },
    });
    await audio.setMusic(true);
    await audio.unlock();
    expect(sources).toHaveLength(1);
    expect(sources[0]!.loop).toBe(true);
    await audio.setMusic(false);
    expect(gain.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, 0.1);
    for (const channel of ["focus", "plate_formation", "plate_insert", "seat_ignite"] as const)
      await audio.sfx(channel);
    expect(sources).toHaveLength(5);
    expect(sources.every((source) => source.start.mock.calls.length === 1)).toBe(true);
    expect(sources.slice(1).every((source) => !source.loop)).toBe(true);
    await audio.close();
  });
  it.each([false, true])(
    "accepted Ritual starts with formation, never repeats the four-second charge (reduced=%s)",
    async (reduced) => {
      vi.useFakeTimers();
      const render = vi.fn();
      const ritual = runPostSuccessRitual(render, reduced);
      expect(render).toHaveBeenCalledWith("plate_formation", reduced);
      await vi.advanceTimersByTimeAsync(2800);
      await ritual;
      expect(render.mock.calls.map((call) => call[0])).toEqual([...RITUAL_POST_FRAMES, "reveal"]);
      expect(render.mock.calls.filter((call) => call[0] === "reveal")).toHaveLength(1);
    },
  );
});

it("Focus keeps public text and emblem when the decorative panel is unavailable", () => {
  const seat = {
    seatId: "WOW-W1-0002",
    status: "active" as const,
    displayName: "Fallback Vanguard",
    faction: "horde" as const,
    className: "Mage",
    guildName: "Test Guild",
    battleCry: "For Azeroth",
    inscribedAt: "2026-10-20T00:00:00Z",
    image: null,
  };
  const assets = {
    hero: {},
    layouts: {},
    plate: null,
    emblems: { Mage: "/mage.png" },
    bgm: null,
    sfx: {},
    seal: { portrait: null, square: null },
  };
  const markup = renderToStaticMarkup(createElement(VanguardFocusVisual, { seat, assets }));
  for (const value of [
    seat.displayName,
    seat.seatId,
    seat.faction,
    seat.className,
    seat.guildName,
    seat.battleCry,
  ])
    expect(markup).toContain(value);
  expect(markup).toContain("Mage Default Emblem");
});
