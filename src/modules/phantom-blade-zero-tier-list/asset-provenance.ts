export type PhantomBladeZeroAssetStatus =
  | "verified_local"
  | "source_verified_binary_missing";

export type PhantomBladeZeroAssetProvenance = {
  readonly id: string;
  readonly entityId: string | null;
  readonly role: "hero" | "tier_icon";
  readonly required: "P0";
  readonly sourceUrl: string;
  readonly sourcePage: string;
  readonly sourceType: "official" | "public_verified_game_capture";
  readonly checkedAt: string;
  readonly originalDimensions: { readonly width: number; readonly height: number } | null;
  readonly outputDimensions: { readonly width: number; readonly height: number } | null;
  readonly sha256: string | null;
  readonly transform: string | null;
  readonly crop: string | null;
  readonly attribution: string;
  readonly status: PhantomBladeZeroAssetStatus;
  readonly localPath: string | null;
};

const sourcePage = "https://allthings.how/phantom-blade-zero-weapons-list/";

const tierIconSources = [
  [
    "jagged-steel",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-jagged-steel.jpg",
  ],
  [
    "white-serpent-crimson-viper",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-white-serpent-crimson-viper.jpg",
  ],
  [
    "fiend-saws",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-fiend-saws.jpg",
  ],
  [
    "freezing-chaos",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-freezing-chaos.jpg",
  ],
  [
    "soft-snake-sword",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-soft-snake-sword.jpg",
  ],
  [
    "parting-hooks",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-parting-hooks.jpg",
  ],
  [
    "seamless-death",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-weapon-seamless-death-wide.jpg",
  ],
  [
    "thunder-spear",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-thunder-spear-1.jpg",
  ],
  [
    "fire-meteor",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-fire-meteor-1.jpg",
  ],
  [
    "dread-axe",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-dread-axe-1.jpg",
  ],
  [
    "heartrend-pipa",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-heartrend-pipa-1.jpg",
  ],
  [
    "wolfjaw",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-wolfjaw-1.jpg",
  ],
  [
    "iron-gauntlets",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-iron-gauntlets-1.jpg",
  ],
  [
    "flaming-mane",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-flaming-mane-1.jpg",
  ],
  [
    "hunters-chain-sickle",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-hunters-chain-sickle-1.jpg",
  ],
  [
    "bastion",
    "https://static.allthings.how/wp-content/uploads/2026/10/phantombladezero-thumb-weapon-bastion-1.jpg",
  ],
] as const;

export const phantomBladeZeroAssetProvenance: readonly PhantomBladeZeroAssetProvenance[] = [
  {
    id: "hero",
    entityId: null,
    role: "hero",
    required: "P0",
    sourceUrl:
      "https://gmedia.playstation.com/is/image/SIEPDC/phantom-blade-zero-screenshot-09-en-14jul26",
    sourcePage: "https://www.playstation.com/en-us/games/phantom-blade-zero/",
    sourceType: "official",
    checkedAt: "2026-11-03",
    originalDimensions: null,
    outputDimensions: null,
    sha256: null,
    transform: null,
    crop: null,
    attribution: "PlayStation / S-GAME official game page",
    status: "source_verified_binary_missing",
    localPath: null,
  },
  ...tierIconSources.map(([entityId, sourceUrl]) => ({
    id: `tier-icon-${entityId}`,
    entityId,
    role: "tier_icon" as const,
    required: "P0" as const,
    sourceUrl,
    sourcePage,
    sourceType: "public_verified_game_capture" as const,
    checkedAt: "2026-11-03",
    originalDimensions: null,
    outputDimensions: null,
    sha256: null,
    transform: null,
    crop: null,
    attribution: "AllThingsHow in-game weapon icon capture",
    status: "source_verified_binary_missing" as const,
    localPath: null,
  })),
];
