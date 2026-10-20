import { WOW_CLASSES } from "@/modules/meta-board";
import wowLayout from "../../public/wow-forever/vanguard/layouts/wow-layout.json";
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
  hero: {
    wow: {
      src: "/wow-forever/vanguard/monument/vanguard-hero-base-desktop.png",
      width: 1672,
      height: 941,
    },
  },
  layouts: Object.fromEntries(
    Object.keys(wowLayout).map((letter) => [
      `wow:${letter}`,
      `/wow-forever/vanguard/layouts/wow-${letter}.f32`,
    ]),
  ),
  layoutScales: Object.fromEntries(
    Object.entries(wowLayout).map(([letter, meta]) => [`wow:${letter}`, meta.scale]),
  ),
  plate: "/wow-forever/vanguard/plates/vanguard-seat-base.png",
  plates: {
    alliance: "/wow-forever/vanguard/plates/vanguard-seat-alliance.png",
    horde: "/wow-forever/vanguard/plates/vanguard-seat-horde.png",
  },
  focus: "/wow-forever/vanguard/plates/vanguard-focus-panel.png",
  ritual: Object.fromEntries(
    ["charge", "form", "inscribe", "lock", "ignite"].map((name, index) => [
      name,
      `/wow-forever/vanguard/animation/vanguard-inscription-0${index + 1}-${name}.png`,
    ]),
  ),
  effects: Object.fromEntries(
    ["alliance", "horde", "focus", "ignite"].map((name) => [
      name,
      `/wow-forever/vanguard/animation/vanguard-fx-${name}.png`,
    ]),
  ),
  emblems: Object.fromEntries(
    WOW_CLASSES.map((name) => [
      name,
      `/wow-forever/vanguard/emblems/vanguard-class-${name.toLowerCase()}.png`,
    ]),
  ),
  bgm: "/wow-forever/vanguard/audio/vanguard-ambient-theme.wav",
  sfx: {
    focus: "/wow-forever/vanguard/audio/vanguard-focus-open.wav",
    plate_formation: "/wow-forever/vanguard/audio/vanguard-plaque-form.wav",
    plate_insert: "/wow-forever/vanguard/audio/vanguard-plaque-lock.wav",
    seat_ignite: "/wow-forever/vanguard/audio/vanguard-monument-ignite.wav",
  },
  seal: {
    portrait: "/wow-forever/vanguard/seal/vanguard-seal-story.png",
    square: "/wow-forever/vanguard/seal/vanguard-seal-square.png",
  },
} satisfies import("@/modules/wow-vanguard").VanguardAssets;
