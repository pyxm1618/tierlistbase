import {
  buildSeatId,
  parseSeatId,
  VanguardError,
  WOW_LETTERS,
  FOREVER_LETTERS,
  type VanguardPhase,
} from "./event";
export function createVanguardLayoutLookup(
  urls: Partial<Record<string, string>>,
  read: (url: string) => Promise<ArrayBuffer>,
) {
  const cache = new Map<VanguardPhase, Promise<{ letter: string; positions: Float32Array }[]>>();
  async function phaseGroups(phase: VanguardPhase) {
    let promise = cache.get(phase);
    if (!promise) {
      const letters = phase === "wow" ? WOW_LETTERS : FOREVER_LETTERS;
      const count = phase === "wow" ? 2672 : 8016;
      promise = Promise.all(
        letters.map(async (letter) => {
          const url = urls[`${phase}:${letter}`];
          if (!url) throw new VanguardError("LAYOUT_UNAVAILABLE", 503);
          if (!url.startsWith("/") || url.startsWith("//"))
            throw new VanguardError("LAYOUT_UNAVAILABLE", 503);
          const bytes = await read(url);
          if (bytes.byteLength !== count * 16) throw new VanguardError("LAYOUT_UNAVAILABLE", 503);
          const positions = new Float32Array(bytes);
          if (!positions.every(Number.isFinite)) throw new VanguardError("LAYOUT_UNAVAILABLE", 503);
          return { letter, positions };
        }),
      );
      cache.set(phase, promise);
      promise.catch(() => cache.delete(phase));
    }
    return promise;
  }
  return {
    async exists(seatId: string) {
      const identity = parseSeatId(seatId);
      const groups = await phaseGroups(identity.phase);
      return groups.some(
        (group) =>
          group.letter === identity.letter && identity.localIndex <= group.positions.length / 4,
      );
    },
    async nearest(seatId: string, occupied: ReadonlySet<string>) {
      const identity = parseSeatId(seatId);
      const groups = await phaseGroups(identity.phase);
      const target = groups.find((group) => group.letter === identity.letter)!;
      const offset = (identity.localIndex - 1) * 4;
      let nearest: string | null = null;
      let distance = Infinity;
      for (const group of groups)
        for (let index = 0; index < group.positions.length / 4; index++) {
          const candidate = buildSeatId(identity.phase, group.letter, index + 1);
          if (occupied.has(candidate)) continue;
          const delta = Math.hypot(
            group.positions[index * 4]! - target.positions[offset]!,
            group.positions[index * 4 + 1]! - target.positions[offset + 1]!,
            group.positions[index * 4 + 2]! - target.positions[offset + 2]!,
          );
          if (delta < distance) {
            distance = delta;
            nearest = candidate;
          }
        }
      return nearest;
    },
  };
}
