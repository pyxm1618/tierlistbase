import type { VanguardAssets } from "../client/contracts";
export function createVanguardAudio(assets: Pick<VanguardAssets, "bgm" | "sfx">) {
  let context: AudioContext | null = null;
  let bgmSource: AudioBufferSourceNode | null = null;
  let bgmGain: GainNode | null = null;
  let music = false;
  let ducked = false;
  const buffers = new Map<string, Promise<AudioBuffer>>();
  async function buffer(url: string) {
    if (!context) throw new Error("Audio not unlocked");
    let promise = buffers.get(url);
    if (!promise) {
      const active = context;
      promise = fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error("Audio asset unavailable");
          return response.arrayBuffer();
        })
        .then((bytes) => active.decodeAudioData(bytes));
      buffers.set(url, promise);
      promise.catch(() => buffers.delete(url));
    }
    return promise;
  }
  function volume() {
    if (context && bgmGain)
      bgmGain.gain.setTargetAtTime(music ? (ducked ? 0.15 : 1) : 0, context.currentTime, 0.1);
  }
  async function startMusic() {
    if (!music || !context || context.state !== "running" || !assets.bgm || bgmSource) return;
    const decoded = await buffer(assets.bgm);
    if (!context || context.state !== "running" || !music || bgmSource) return;
    bgmSource = context.createBufferSource();
    bgmGain = context.createGain();
    bgmSource.buffer = decoded;
    bgmSource.loop = true;
    bgmSource.connect(bgmGain).connect(context.destination);
    volume();
    bgmSource.start();
  }
  return {
    async unlock() {
      context ??= new AudioContext();
      try {
        await context.resume();
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") return;
        throw error;
      }
      await startMusic();
    },
    async setMusic(enabled: boolean) {
      music = enabled;
      volume();
      await startMusic();
    },
    duck(enabled: boolean) {
      ducked = enabled;
      volume();
    },
    async sfx(name: keyof VanguardAssets["sfx"]) {
      const url = assets.sfx[name];
      if (!url || !context || context.state !== "running") return;
      const decoded = await buffer(url);
      if (!context || context.state !== "running") return;
      const source = context.createBufferSource();
      source.buffer = decoded;
      source.connect(context.destination);
      source.start();
    },
    async close() {
      bgmSource?.stop();
      bgmSource = null;
      buffers.clear();
      const active = context;
      context = null;
      await active?.close();
    },
  };
}
export type VanguardAudioController = ReturnType<typeof createVanguardAudio>;
