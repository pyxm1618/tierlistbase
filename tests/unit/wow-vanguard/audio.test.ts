import { afterEach, expect, it, vi } from "vitest";
import { vanguardAssets } from "@/config/vanguard.config";
import { createVanguardAudio, ritualSound } from "@/modules/wow-vanguard";
afterEach(() => vi.unstubAllGlobals());
it("maps the supplied files to only their approved actions", () => {
  expect(vanguardAssets.bgm).toBe("/wow-forever/vanguard/audio/vanguard-ambient-theme.wav");
  expect(vanguardAssets.sfx).toEqual({
    focus: "/wow-forever/vanguard/audio/vanguard-focus-open.wav",
    plate_formation: "/wow-forever/vanguard/audio/vanguard-plaque-form.wav",
    plate_insert: "/wow-forever/vanguard/audio/vanguard-plaque-lock.wav",
    seat_ignite: "/wow-forever/vanguard/audio/vanguard-monument-ignite.wav",
  });
  expect(ritualSound("plate_formation")).toBe("plate_formation");
  expect(ritualSound("plate_insert")).toBe("plate_insert");
  expect(ritualSound("seat_ignite")).toBe("seat_ignite");
  expect(ritualSound("reveal")).toBeNull();
});
it("requires a user unlock, mutes only BGM, and keeps SFX independent", async () => {
  const sources: {
    start: ReturnType<typeof vi.fn>;
    loop: boolean;
    connect: ReturnType<typeof vi.fn>;
  }[] = [];
  const gain = { gain: { setTargetAtTime: vi.fn() }, connect: vi.fn() };
  const context = {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: vi.fn(async () => {}),
    decodeAudioData: vi.fn(async () => ({})),
    createGain: () => gain,
    createBufferSource: () => {
      const source = { start: vi.fn(), stop: vi.fn(), loop: false, connect: vi.fn(() => gain) };
      sources.push(source);
      return source;
    },
    close: vi.fn(async () => {}),
  };
  const constructor = vi.fn(function () {
    return context;
  });
  vi.stubGlobal("AudioContext", constructor);
  const fetcher = vi.fn(async () => new Response(new Uint8Array([1])));
  vi.stubGlobal("fetch", fetcher);
  const audio = createVanguardAudio(vanguardAssets);
  await audio.setMusic(true);
  expect(constructor).not.toHaveBeenCalled();
  expect(fetcher).not.toHaveBeenCalled();
  await audio.unlock();
  expect(sources).toHaveLength(1);
  expect(sources[0]?.loop).toBe(true);
  await audio.setMusic(false);
  await audio.sfx("focus");
  expect(sources).toHaveLength(2);
  expect(sources[1]?.start).toHaveBeenCalled();
  expect(sources[1]?.connect).toHaveBeenCalledWith(context.destination);
  expect(gain.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, 0.1);
  await audio.close();
});
it("does not fetch or report false playback while browser autoplay remains blocked", async () => {
  const context = {
    state: "suspended",
    resume: vi.fn(async () => {
      throw new DOMException("gesture required", "NotAllowedError");
    }),
    close: vi.fn(async () => {}),
  };
  vi.stubGlobal(
    "AudioContext",
    vi.fn(function () {
      return context;
    }),
  );
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const audio = createVanguardAudio(vanguardAssets);
  await audio.setMusic(true);
  await expect(audio.unlock()).resolves.toBeUndefined();
  expect(fetcher).not.toHaveBeenCalled();
  await audio.close();
});
