export const EVENT_CLOSE_AT = "2026-11-04T23:00:00Z";
export const WOW_LETTERS = ["W1", "O", "W2"] as const;
export const FOREVER_LETTERS = ["F", "O", "R1", "E1", "V", "E2", "R2"] as const;
export type VanguardPhase = "wow" | "forever";
export type VanguardStage =
  | "WOW_OPEN"
  | "WOW_COMPLETE_WAITING"
  | "FOREVER_OPEN"
  | "COMPLETE"
  | "SEALED";
export type SeatIdentity = {
  seatId: string;
  phase: VanguardPhase;
  letter: string;
  localIndex: number;
};
export type VanguardEventState = {
  wowClaimedCount: number;
  foreverClaimedCount: number;
  wowCompletedAt: Date | null;
};
export class VanguardError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly details?: Record<string, unknown>,
  ) {
    super(code);
  }
}
export function buildSeatId(phase: VanguardPhase, letter: string, localIndex: number): string {
  const letters: readonly string[] = phase === "wow" ? WOW_LETTERS : FOREVER_LETTERS;
  const max = phase === "wow" ? 2672 : 8016;
  if (
    !letters.includes(letter) ||
    !Number.isInteger(localIndex) ||
    localIndex < 1 ||
    localIndex > max
  )
    throw new VanguardError("INVALID_INPUT", 400);
  return `${phase.toUpperCase()}-${letter}-${String(localIndex).padStart(4, "0")}`;
}
export function parseSeatId(seatId: string): SeatIdentity {
  const match = /^(WOW|FOREVER)-([A-Z][12]?)-(\d{4})$/.exec(seatId);
  if (!match) throw new VanguardError("INVALID_INPUT", 400);
  const phase = match[1] === "WOW" ? "wow" : "forever";
  const letter = match[2]!;
  const localIndex = Number(match[3]);
  if (buildSeatId(phase, letter, localIndex) !== seatId)
    throw new VanguardError("INVALID_INPUT", 400);
  return { seatId, phase, letter, localIndex };
}
// Identity only. This is deliberately not a geometric seat layout.
export function enumerateSeatIdentities(): SeatIdentity[] {
  return (["wow", "forever"] as const).flatMap((phase) =>
    (phase === "wow" ? WOW_LETTERS : FOREVER_LETTERS).flatMap((letter) =>
      Array.from({ length: phase === "wow" ? 2672 : 8016 }, (_, index) => ({
        seatId: buildSeatId(phase, letter, index + 1),
        phase,
        letter,
        localIndex: index + 1,
      })),
    ),
  );
}
export function assertVanguardWriteOpen(now: Date): void {
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid Vanguard authority time");
  if (now.getTime() >= Date.parse(EVENT_CLOSE_AT)) throw new VanguardError("EVENT_SEALED", 410);
}
export function resolveVanguardStage(now: Date, state: VanguardEventState): VanguardStage {
  const { wowClaimedCount: wow, foreverClaimedCount: forever, wowCompletedAt } = state;
  if (
    !Number.isFinite(now.getTime()) ||
    !Number.isInteger(wow) ||
    wow < 0 ||
    wow > 8016 ||
    !Number.isInteger(forever) ||
    forever < 0 ||
    forever > 56112 ||
    (wow === 8016) !== (wowCompletedAt !== null) ||
    (forever > 0 && wow < 8016) ||
    (wowCompletedAt !== null && !Number.isFinite(wowCompletedAt.getTime()))
  )
    throw new Error("Inconsistent Vanguard event state");
  if (now.getTime() >= Date.parse(EVENT_CLOSE_AT)) return "SEALED";
  if (wow + forever === 64128) return "COMPLETE";
  if (wow < 8016) return "WOW_OPEN";
  if (now.getTime() < wowCompletedAt!.getTime() + 86400000) return "WOW_COMPLETE_WAITING";
  return "FOREVER_OPEN";
}
export function assertPhaseOpen(now: Date, state: VanguardEventState, phase: VanguardPhase): void {
  assertVanguardWriteOpen(now);
  const stage = resolveVanguardStage(now, state);
  if (stage !== (phase === "wow" ? "WOW_OPEN" : "FOREVER_OPEN"))
    throw new VanguardError("PHASE_NOT_OPEN", 410);
}
