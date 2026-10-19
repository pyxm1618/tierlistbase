export const vanguardConfig = {
  eventCloseAt: "2026-11-04T23:00:00Z",
  holdSeconds: 180,
  foreverDelayMs: 24 * 60 * 60 * 1000,
  wowCapacity: 8016,
  foreverCapacity: 56112,
  totalCapacity: 64128,
  // Uncalibrated: media must fail closed until real sample calibration is approved.
  moderationThresholds: null,
} as const;

// Final supplied artwork only. Empty slots keep the scene and final renderer blocked.
export const vanguardAssets = {
  hero: {},
  layouts: {},
  plate: null,
  emblems: {},
  bgm: "/wow-forever/vanguard/audio/vanguard-ambient-theme.wav",
  sfx: {
    focus: "/wow-forever/vanguard/audio/vanguard-focus-open.wav",
    plate_formation: "/wow-forever/vanguard/audio/vanguard-plaque-form.wav",
    plate_insert: "/wow-forever/vanguard/audio/vanguard-plaque-lock.wav",
    seat_ignite: "/wow-forever/vanguard/audio/vanguard-monument-ignite.wav",
  },
  seal: { portrait: null, square: null },
} satisfies import("@/modules/wow-vanguard").VanguardAssets;
