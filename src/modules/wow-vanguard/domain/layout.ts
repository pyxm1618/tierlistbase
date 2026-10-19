import {
  parseSeatId,
  WOW_LETTERS,
  FOREVER_LETTERS,
  buildSeatId,
  type VanguardPhase,
} from "./event";
export type SeatLayoutGroup = {
  phase: VanguardPhase;
  letter: string;
  positions: Float32Array;
  neighbors: ReadonlyMap<number, readonly number[]>;
};
// Position tuple: x,y,z,rotation. No repeated public strings in the render buffer.
export function validateSeatLayouts(groups: readonly SeatLayoutGroup[]) {
  const keys = new Set<string>();
  let total = 0;
  for (const group of groups) {
    const count = group.positions.length / 4;
    const expected = group.phase === "wow" ? 2672 : 8016;
    const key = `${group.phase}:${group.letter}`;
    if (keys.has(key) || count !== expected || ![...group.positions].every(Number.isFinite))
      throw new Error(`Invalid Vanguard layout ${key}`);
    parseSeatId(buildSeatId(group.phase, group.letter, 1));
    for (const [index, neighbors] of group.neighbors)
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= count ||
        neighbors.some((n) => !Number.isInteger(n) || n < 0 || n >= count)
      )
        throw new Error(`Invalid Vanguard neighbors ${key}`);
    keys.add(key);
    total += count;
  }
  for (const letter of WOW_LETTERS)
    if (!keys.has(`wow:${letter}`)) throw new Error(`Missing WOW ${letter}`);
  for (const letter of FOREVER_LETTERS)
    if (!keys.has(`forever:${letter}`)) throw new Error(`Missing FOREVER ${letter}`);
  if (total !== 64128) throw new Error("Invalid Vanguard total layout capacity");
}
