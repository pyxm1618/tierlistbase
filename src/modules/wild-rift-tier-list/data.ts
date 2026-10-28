export const roleKeys = ["baron", "jungle", "mid", "dragon", "support"] as const;
export const tiers = ["S+", "S", "A", "B", "C"] as const;

export type RoleKey = (typeof roleKeys)[number];
export type Tier = (typeof tiers)[number];
export type Trend = "up" | "down" | "flat" | "unavailable";
export type Signal = "High" | "Medium" | "Low";
export type InsightKind = "blind" | "easy" | "draft" | "riser";

export type Champion = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly portrait: string;
};

export type ChampionRoleRanking = {
  readonly championId: string;
  readonly role: RoleKey;
  readonly tier: Tier;
  readonly winRate: number | null;
  readonly pickRate: number | null;
  readonly banRate: number | null;
  readonly trend: Trend;
  readonly whyThisTier: string;
  readonly strengths: readonly string[];
  readonly limitations: readonly string[];
  readonly decisionSignals: {
    readonly soloQueueReliability: Signal;
    readonly blindPickSafety: Signal;
    readonly easeOfExecution: Signal;
    readonly carryImpactPotential: Signal;
    readonly teamDependence: Signal;
  };
  readonly patchImpact: string;
  readonly sourceIds: readonly string[];
};

export type Source = {
  readonly id: string;
  readonly name: string;
  readonly type:
    | "official_patch"
    | "ranked_statistics"
    | "editorial_crosscheck"
    | "editorial_review";
  readonly checkedAt: string;
  readonly url: string;
  readonly context: string;
};

export type RoleInsight = {
  readonly kind: InsightKind;
  readonly label: string;
  readonly championId: string;
  readonly reason: string;
};

export type RoleProfile = {
  readonly key: RoleKey;
  readonly label: string;
  readonly shortLabel: string;
  readonly auxiliary: string;
  readonly question: string;
  readonly criteria: readonly string[];
  readonly quickPickChampionId: string;
  readonly insights: readonly RoleInsight[];
};

export type RankingChange = {
  readonly championId: string;
  readonly role: RoleKey;
  readonly previousTier: Tier;
  readonly newTier: Tier;
  readonly kind: "Buff" | "Nerf" | "Meta shift" | "Data trend";
  readonly reason: string;
  readonly sourceIds: readonly string[];
};

export type WildRiftSnapshot = {
  readonly gameVersion: string;
  readonly latestRankedBalance: string;
  readonly snapshotDate: string;
  readonly region: string;
  readonly rankContext: string;
  readonly queueContext: "Ranked";
  readonly queueFocus: string;
  readonly sources: readonly Source[];
  readonly roleProfiles: readonly RoleProfile[];
  readonly champions: readonly Champion[];
  readonly rankings: readonly ChampionRoleRanking[];
  readonly changes: readonly RankingChange[];
};

export const tierDefinitions: Readonly<Record<Tier, string>> = {
  "S+": "Meta-defining, highest Ranked impact, reliable and a strong draft priority.",
  S: "Very strong and consistently valuable in the current Ranked environment.",
  A: "Strong and viable in current Ranked with manageable tradeoffs.",
  B: "Situational or less consistent than the stronger alternatives.",
  C: "Niche, difficult or currently weak relative to alternatives in this role.",
};

// prettier-ignore
export const wildRiftSnapshot: WildRiftSnapshot = {
  "gameVersion": "7.3c",
  "latestRankedBalance": "7.3b",
  "snapshotDate": "2026-10-28",
  "region": "China server",
  "rankContext": "Diamond+",
  "queueContext": "Ranked",
  "queueFocus": "Solo Queue Focus",
  "sources": [
    {
      "id": "riot-7-3c",
      "name": "Riot Games · Patch 7.3c",
      "type": "official_patch",
      "checkedAt": "2026-10-28",
      "url": "https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3c/",
      "context": "Current client patch. 7.3c notes are scoped to AAA ARAM, so they are not treated as a new standard Ranked balance pass."
    },
    {
      "id": "riot-7-3b",
      "name": "Riot Games · Patch 7.3b",
      "type": "official_patch",
      "checkedAt": "2026-10-28",
      "url": "https://wildrift.leagueoflegends.com/en-gb/news/game-updates/wild-rift-patch-notes-7-3b/",
      "context": "Latest patch in the current client cycle with standard champion, item, rune and jungle balance changes."
    },
    {
      "id": "wrf-stats",
      "name": "WildRiftFire Ranked Statistics",
      "type": "ranked_statistics",
      "checkedAt": "2026-10-28",
      "url": "https://www.wildriftfire.com/stats",
      "context": "China server · Diamond+ · Ranked. WildRiftFire states its data is sourced exclusively from the China server official ranked statistics and updates daily."
    },
    {
      "id": "wrf-tier-crosscheck",
      "name": "WildRiftFire Tier List",
      "type": "editorial_crosscheck",
      "checkedAt": "2026-10-28",
      "url": "https://www.wildriftfire.com/tier-list",
      "context": "Patch 7.3c role-specific editorial list maintained by challenger-level Wild Rift educator iTzSTU4RT; used only as a cross-check, never copied as the ranking formula."
    },
    {
      "id": "tierlistbase-review",
      "name": "TierListBase Editorial Review",
      "type": "editorial_review",
      "checkedAt": "2026-10-28",
      "url": "/wild-rift/tier-list",
      "context": "Role-specific review combining current statistics, official balance changes, execution burden, draft value and solo-queue reliability."
    }
  ],
  "roleProfiles": [
    {
      "key": "baron",
      "label": "Baron Lane",
      "shortLabel": "Baron",
      "auxiliary": "Solo / Top",
      "question": "Which Baron / Solo Lane champions are the most reliable Ranked picks right now?",
      "criteria": [
        "Lane strength",
        "Matchup safety",
        "Blind-pick safety",
        "Side-lane pressure",
        "Scaling",
        "Teamfight contribution",
        "Independence from constant team support"
      ],
      "quickPickChampionId": "malphite",
      "insights": [
        {
          "kind": "blind",
          "label": "Best Blind Pick",
          "championId": "shen",
          "reason": "Stable lane profile, flexible frontline value and global map impact keep bad drafts playable."
        },
        {
          "kind": "easy",
          "label": "Best Easy Climb Pick",
          "championId": "malphite",
          "reason": "High current win rate, direct engage and low execution burden convert cleanly in solo queue."
        },
        {
          "kind": "draft",
          "label": "Highest Draft Priority",
          "championId": "malphite",
          "reason": "54.80% WR and 43.02% BR make Malphite the most contested Baron pick in this snapshot."
        },
        {
          "kind": "riser",
          "label": "Biggest Riser",
          "championId": "volibear",
          "reason": "7.3b directly buffed his AD scaling and empowered healing, lifting his reviewed placement."
        }
      ]
    },
    {
      "key": "jungle",
      "label": "Jungle",
      "shortLabel": "Jungle",
      "auxiliary": "",
      "question": "Which Junglers can influence Ranked games most consistently right now?",
      "criteria": [
        "Clear speed",
        "Early tempo",
        "Gank pressure",
        "Objective control",
        "Jungle-path reliability",
        "Snowball potential",
        "Fallback value when behind",
        "Solo queue reliability"
      ],
      "quickPickChampionId": "rammus",
      "insights": [
        {
          "kind": "blind",
          "label": "Best Blind Pick",
          "championId": "rammus",
          "reason": "Exceptional current win rate plus durable engage gives him a reliable floor in random-team games."
        },
        {
          "kind": "easy",
          "label": "Best Easy Climb Pick",
          "championId": "rammus",
          "reason": "Straightforward gank patterns and 56.35% WR make his impact easier to convert than mechanical carries."
        },
        {
          "kind": "draft",
          "label": "Highest Draft Priority",
          "championId": "nocturne",
          "reason": "Even after the 7.3b nerf, 52.85% WR and 59.52% BR show unusually high draft pressure."
        },
        {
          "kind": "riser",
          "label": "Biggest Riser",
          "championId": "zed",
          "reason": "7.3b reduced Youmuu's cost and improved assassin snowball tools while Zed holds a 52.10% Jungle WR."
        }
      ]
    },
    {
      "key": "mid",
      "label": "Mid Lane",
      "shortLabel": "Mid",
      "auxiliary": "",
      "question": "Which Mid champions best control lane and influence the map right now?",
      "criteria": [
        "Wave control",
        "Lane pressure",
        "Roaming",
        "Map influence",
        "Burst / control",
        "Teamfight contribution",
        "Scaling",
        "Blind-pick safety"
      ],
      "quickPickChampionId": "galio",
      "insights": [
        {
          "kind": "blind",
          "label": "Best Blind Pick",
          "championId": "galio",
          "reason": "Reliable wave control, roaming and teamfight utility remain useful across a wide range of drafts."
        },
        {
          "kind": "easy",
          "label": "Best Easy Climb Pick",
          "championId": "ahri",
          "reason": "Safe laning and repeatable pick tools provide a forgiving route to map impact."
        },
        {
          "kind": "draft",
          "label": "Highest Draft Priority",
          "championId": "hwei",
          "reason": "Hwei still posts 52.34% WR with 48.69% BR despite the direct 7.3b nerf."
        },
        {
          "kind": "riser",
          "label": "Biggest Riser",
          "championId": "yasuo",
          "reason": "7.3b increased Yasuo's standard critical damage and shield value, improving his reviewed floor."
        }
      ]
    },
    {
      "key": "dragon",
      "label": "Dragon Lane",
      "shortLabel": "Dragon",
      "auxiliary": "ADC / Duo",
      "question": "Which ADC / Dragon Lane carries are the most stable Ranked choices right now?",
      "criteria": [
        "Lane stability",
        "Sustained DPS",
        "Scaling",
        "Range",
        "Survivability",
        "Self-peel",
        "Support synergy",
        "Gold-to-teamfight conversion"
      ],
      "quickPickChampionId": "ashe",
      "insights": [
        {
          "kind": "blind",
          "label": "Best Blind Pick",
          "championId": "ashe",
          "reason": "Range, utility and a 53.47% WR give Ashe value even when she is not the sole damage carry."
        },
        {
          "kind": "easy",
          "label": "Best Easy Climb Pick",
          "championId": "ashe",
          "reason": "Clear teamfight job and strong current results reduce the execution tax of the role."
        },
        {
          "kind": "draft",
          "label": "Highest Draft Priority",
          "championId": "samira",
          "reason": "11.83% PR and 11.69% BR show meaningful draft attention while she keeps a 51.07% WR."
        },
        {
          "kind": "riser",
          "label": "Biggest Riser",
          "championId": "jhin",
          "reason": "7.3b moved Jhin's crit and missing-health power earlier, improving his reviewed placement despite sub-50 WR."
        }
      ]
    },
    {
      "key": "support",
      "label": "Support",
      "shortLabel": "Support",
      "auxiliary": "",
      "question": "Which Supports can influence Ranked games most consistently right now?",
      "criteria": [
        "Engage",
        "Peel",
        "Roaming",
        "Utility",
        "Vision / map-control contribution",
        "Teamfight impact",
        "Low-economy value",
        "Reliability with random teammates"
      ],
      "quickPickChampionId": "braum",
      "insights": [
        {
          "kind": "blind",
          "label": "Best Blind Pick",
          "championId": "braum",
          "reason": "Peel, frontline value and 52.59% WR give Braum a dependable floor without demanding farm."
        },
        {
          "kind": "easy",
          "label": "Best Easy Climb Pick",
          "championId": "leona",
          "reason": "Direct engage patterns and high pick presence make her impact straightforward to execute."
        },
        {
          "kind": "draft",
          "label": "Highest Draft Priority",
          "championId": "thresh",
          "reason": "15.34% PR and 12.89% BR reflect the broadest high-level draft demand among reviewed supports."
        },
        {
          "kind": "riser",
          "label": "Biggest Riser",
          "championId": "rell",
          "reason": "The 7.3b Locket buff strengthened tank-support itemization while Rell maintains a 51.39% WR."
        }
      ]
    }
  ],
  "champions": [
    {
      "id": "malphite",
      "slug": "malphite",
      "name": "Malphite",
      "portrait": "/wild-rift/champions/malphite.png"
    },
    {
      "id": "shen",
      "slug": "shen",
      "name": "Shen",
      "portrait": "/wild-rift/champions/shen.png"
    },
    {
      "id": "mordekaiser",
      "slug": "mordekaiser",
      "name": "Mordekaiser",
      "portrait": "/wild-rift/champions/mordekaiser.png"
    },
    {
      "id": "ksante",
      "slug": "ksante",
      "name": "K'Sante",
      "portrait": "/wild-rift/champions/ksante.png"
    },
    {
      "id": "ornn",
      "slug": "ornn",
      "name": "Ornn",
      "portrait": "/wild-rift/champions/ornn.png"
    },
    {
      "id": "ambessa",
      "slug": "ambessa",
      "name": "Ambessa",
      "portrait": "/wild-rift/champions/ambessa.png"
    },
    {
      "id": "jax",
      "slug": "jax",
      "name": "Jax",
      "portrait": "/wild-rift/champions/jax.png"
    },
    {
      "id": "darius",
      "slug": "darius",
      "name": "Darius",
      "portrait": "/wild-rift/champions/darius.png"
    },
    {
      "id": "volibear",
      "slug": "volibear",
      "name": "Volibear",
      "portrait": "/wild-rift/champions/volibear.png"
    },
    {
      "id": "tryndamere",
      "slug": "tryndamere",
      "name": "Tryndamere",
      "portrait": "/wild-rift/champions/tryndamere.png"
    },
    {
      "id": "rammus",
      "slug": "rammus",
      "name": "Rammus",
      "portrait": "/wild-rift/champions/rammus.png"
    },
    {
      "id": "nocturne",
      "slug": "nocturne",
      "name": "Nocturne",
      "portrait": "/wild-rift/champions/nocturne.png"
    },
    {
      "id": "ekko",
      "slug": "ekko",
      "name": "Ekko",
      "portrait": "/wild-rift/champions/ekko.png"
    },
    {
      "id": "skarner",
      "slug": "skarner",
      "name": "Skarner",
      "portrait": "/wild-rift/champions/skarner.png"
    },
    {
      "id": "jarvan-iv",
      "slug": "jarvan-iv",
      "name": "Jarvan IV",
      "portrait": "/wild-rift/champions/jarvan-iv.png"
    },
    {
      "id": "xin-zhao",
      "slug": "xin-zhao",
      "name": "Xin Zhao",
      "portrait": "/wild-rift/champions/xin-zhao.png"
    },
    {
      "id": "zed",
      "slug": "zed",
      "name": "Zed",
      "portrait": "/wild-rift/champions/zed.png"
    },
    {
      "id": "lee-sin",
      "slug": "lee-sin",
      "name": "Lee Sin",
      "portrait": "/wild-rift/champions/lee-sin.png"
    },
    {
      "id": "master-yi",
      "slug": "master-yi",
      "name": "Master Yi",
      "portrait": "/wild-rift/champions/master-yi.png"
    },
    {
      "id": "shyvana",
      "slug": "shyvana",
      "name": "Shyvana",
      "portrait": "/wild-rift/champions/shyvana.png"
    },
    {
      "id": "hwei",
      "slug": "hwei",
      "name": "Hwei",
      "portrait": "/wild-rift/champions/hwei.png"
    },
    {
      "id": "syndra",
      "slug": "syndra",
      "name": "Syndra",
      "portrait": "/wild-rift/champions/syndra.png"
    },
    {
      "id": "galio",
      "slug": "galio",
      "name": "Galio",
      "portrait": "/wild-rift/champions/galio.png"
    },
    {
      "id": "orianna",
      "slug": "orianna",
      "name": "Orianna",
      "portrait": "/wild-rift/champions/orianna.png"
    },
    {
      "id": "lissandra",
      "slug": "lissandra",
      "name": "Lissandra",
      "portrait": "/wild-rift/champions/lissandra.png"
    },
    {
      "id": "ahri",
      "slug": "ahri",
      "name": "Ahri",
      "portrait": "/wild-rift/champions/ahri.png"
    },
    {
      "id": "brand",
      "slug": "brand",
      "name": "Brand",
      "portrait": "/wild-rift/champions/brand.png"
    },
    {
      "id": "yasuo",
      "slug": "yasuo",
      "name": "Yasuo",
      "portrait": "/wild-rift/champions/yasuo.png"
    },
    {
      "id": "akali",
      "slug": "akali",
      "name": "Akali",
      "portrait": "/wild-rift/champions/akali.png"
    },
    {
      "id": "mel",
      "slug": "mel",
      "name": "Mel",
      "portrait": "/wild-rift/champions/mel.png"
    },
    {
      "id": "ashe",
      "slug": "ashe",
      "name": "Ashe",
      "portrait": "/wild-rift/champions/ashe.png"
    },
    {
      "id": "kogmaw",
      "slug": "kogmaw",
      "name": "Kog'Maw",
      "portrait": "/wild-rift/champions/kogmaw.png"
    },
    {
      "id": "xayah",
      "slug": "xayah",
      "name": "Xayah",
      "portrait": "/wild-rift/champions/xayah.png"
    },
    {
      "id": "samira",
      "slug": "samira",
      "name": "Samira",
      "portrait": "/wild-rift/champions/samira.png"
    },
    {
      "id": "smolder",
      "slug": "smolder",
      "name": "Smolder",
      "portrait": "/wild-rift/champions/smolder.png"
    },
    {
      "id": "kaisa",
      "slug": "kaisa",
      "name": "Kai'Sa",
      "portrait": "/wild-rift/champions/kaisa.png"
    },
    {
      "id": "jhin",
      "slug": "jhin",
      "name": "Jhin",
      "portrait": "/wild-rift/champions/jhin.png"
    },
    {
      "id": "caitlyn",
      "slug": "caitlyn",
      "name": "Caitlyn",
      "portrait": "/wild-rift/champions/caitlyn.png"
    },
    {
      "id": "yunara",
      "slug": "yunara",
      "name": "Yunara",
      "portrait": "/wild-rift/champions/yunara.png"
    },
    {
      "id": "lucian",
      "slug": "lucian",
      "name": "Lucian",
      "portrait": "/wild-rift/champions/lucian.png"
    },
    {
      "id": "braum",
      "slug": "braum",
      "name": "Braum",
      "portrait": "/wild-rift/champions/braum.png"
    },
    {
      "id": "leona",
      "slug": "leona",
      "name": "Leona",
      "portrait": "/wild-rift/champions/leona.png"
    },
    {
      "id": "rell",
      "slug": "rell",
      "name": "Rell",
      "portrait": "/wild-rift/champions/rell.png"
    },
    {
      "id": "thresh",
      "slug": "thresh",
      "name": "Thresh",
      "portrait": "/wild-rift/champions/thresh.png"
    },
    {
      "id": "janna",
      "slug": "janna",
      "name": "Janna",
      "portrait": "/wild-rift/champions/janna.png"
    },
    {
      "id": "sona",
      "slug": "sona",
      "name": "Sona",
      "portrait": "/wild-rift/champions/sona.png"
    },
    {
      "id": "soraka",
      "slug": "soraka",
      "name": "Soraka",
      "portrait": "/wild-rift/champions/soraka.png"
    },
    {
      "id": "pyke",
      "slug": "pyke",
      "name": "Pyke",
      "portrait": "/wild-rift/champions/pyke.png"
    },
    {
      "id": "senna",
      "slug": "senna",
      "name": "Senna",
      "portrait": "/wild-rift/champions/senna.png"
    },
    {
      "id": "yuumi",
      "slug": "yuumi",
      "name": "Yuumi",
      "portrait": "/wild-rift/champions/yuumi.png"
    }
  ],
  "rankings": [
    {
      "championId": "malphite",
      "role": "baron",
      "tier": "S+",
      "winRate": 54.8,
      "pickRate": 7.47,
      "banRate": 43.02,
      "trend": "unavailable",
      "whyThisTier": "Malphite combines a 54.80% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value. Its 43.02% ban rate also means availability is a real draft constraint.",
      "strengths": [
        "54.80% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "High 43.02% ban rate can make the pick difficult to access."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "High",
        "carryImpactPotential": "High",
        "teamDependence": "Low"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "shen",
      "role": "baron",
      "tier": "S+",
      "winRate": 54.42,
      "pickRate": 2.95,
      "banRate": 0.77,
      "trend": "unavailable",
      "whyThisTier": "Shen combines a 54.42% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value.",
      "strengths": [
        "54.42% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Low"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "mordekaiser",
      "role": "baron",
      "tier": "S",
      "winRate": 51.25,
      "pickRate": 10.99,
      "banRate": 33.6,
      "trend": "unavailable",
      "whyThisTier": "Mordekaiser combines a 51.25% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value. Its 33.60% ban rate also means availability is a real draft constraint.",
      "strengths": [
        "51.25% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "High 33.60% ban rate can make the pick difficult to access."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "ksante",
      "role": "baron",
      "tier": "S",
      "winRate": 51.39,
      "pickRate": 7.72,
      "banRate": 18.4,
      "trend": "unavailable",
      "whyThisTier": "K'Sante combines a 51.39% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value.",
      "strengths": [
        "51.39% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "ornn",
      "role": "baron",
      "tier": "S",
      "winRate": 51.39,
      "pickRate": 1.95,
      "banRate": 0.2,
      "trend": "unavailable",
      "whyThisTier": "Ornn combines a 51.39% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value.",
      "strengths": [
        "51.39% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Low pick volume warrants extra caution when reading the headline win rate."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "ambessa",
      "role": "baron",
      "tier": "A",
      "winRate": 51.41,
      "pickRate": 2.42,
      "banRate": 0.85,
      "trend": "unavailable",
      "whyThisTier": "Ambessa combines a 51.41% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value.",
      "strengths": [
        "51.41% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "jax",
      "role": "baron",
      "tier": "A",
      "winRate": 50.94,
      "pickRate": 3.38,
      "banRate": 0.47,
      "trend": "unavailable",
      "whyThisTier": "Jax combines a 50.94% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value.",
      "strengths": [
        "50.94% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "darius",
      "role": "baron",
      "tier": "B",
      "winRate": 49.27,
      "pickRate": 15.66,
      "banRate": 13.95,
      "trend": "unavailable",
      "whyThisTier": "Darius combines a 49.27% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value.",
      "strengths": [
        "49.27% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "More draft- or execution-dependent than the higher tiers.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "volibear",
      "role": "baron",
      "tier": "B",
      "winRate": 49.17,
      "pickRate": 7.19,
      "banRate": 7.69,
      "trend": "up",
      "whyThisTier": "Volibear combines a 49.17% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value.",
      "strengths": [
        "49.17% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "More draft- or execution-dependent than the higher tiers.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "7.3b directly buffed Frenzied Maul AD ratios and empowered healing.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "tryndamere",
      "role": "baron",
      "tier": "C",
      "winRate": 45.69,
      "pickRate": 2.54,
      "banRate": 24.5,
      "trend": "up",
      "whyThisTier": "Tryndamere combines a 45.69% China Diamond+ win rate with lane safety, side-lane pressure and independent teamfight value. Its 24.50% ban rate also means availability is a real draft constraint.",
      "strengths": [
        "45.69% win rate in the checked China Diamond+ snapshot.",
        "Contributes meaningful lane or side-lane pressure."
      ],
      "limitations": [
        "Current results and/or consistency trail the stronger alternatives in this role.",
        "High 24.50% ban rate can make the pick difficult to access."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Low",
        "blindPickSafety": "Low",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "Medium",
        "teamDependence": "High"
      },
      "patchImpact": "7.3b increased Fury critical-strike conversion and Spinning Slash damage.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "rammus",
      "role": "jungle",
      "tier": "S+",
      "winRate": 56.35,
      "pickRate": 3.8,
      "banRate": 6.78,
      "trend": "unavailable",
      "whyThisTier": "Rammus combines a 56.35% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability.",
      "strengths": [
        "56.35% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "High",
        "carryImpactPotential": "High",
        "teamDependence": "Low"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "nocturne",
      "role": "jungle",
      "tier": "S",
      "winRate": 52.85,
      "pickRate": 6.9,
      "banRate": 59.52,
      "trend": "down",
      "whyThisTier": "Nocturne combines a 52.85% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability. Its 59.52% ban rate also means availability is a real draft constraint.",
      "strengths": [
        "52.85% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "High 59.52% ban rate can make the pick difficult to access."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "7.3b reduced health scaling, Duskbringer output and Paranoia availability.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "ekko",
      "role": "jungle",
      "tier": "S",
      "winRate": 53.94,
      "pickRate": 6.56,
      "banRate": 4.64,
      "trend": "unavailable",
      "whyThisTier": "Ekko combines a 53.94% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability.",
      "strengths": [
        "53.94% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "skarner",
      "role": "jungle",
      "tier": "S",
      "winRate": 53.68,
      "pickRate": 1.5,
      "banRate": 0.49,
      "trend": "unavailable",
      "whyThisTier": "Skarner combines a 53.68% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability.",
      "strengths": [
        "53.68% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Low pick volume warrants extra caution when reading the headline win rate."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "jarvan-iv",
      "role": "jungle",
      "tier": "A",
      "winRate": 52.41,
      "pickRate": 7.09,
      "banRate": 0.54,
      "trend": "unavailable",
      "whyThisTier": "Jarvan IV combines a 52.41% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability.",
      "strengths": [
        "52.41% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "xin-zhao",
      "role": "jungle",
      "tier": "A",
      "winRate": 50.61,
      "pickRate": 9.26,
      "banRate": 1.66,
      "trend": "unavailable",
      "whyThisTier": "Xin Zhao combines a 50.61% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability.",
      "strengths": [
        "50.61% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "zed",
      "role": "jungle",
      "tier": "A",
      "winRate": 52.1,
      "pickRate": 2.46,
      "banRate": 2.37,
      "trend": "up",
      "whyThisTier": "Zed combines a 52.10% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability.",
      "strengths": [
        "52.10% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Low",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct champion change; 7.3b reduced Youmuu's cost and improved assassin snowball rune options.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "lee-sin",
      "role": "jungle",
      "tier": "B",
      "winRate": 46.59,
      "pickRate": 13.16,
      "banRate": 7.63,
      "trend": "unavailable",
      "whyThisTier": "Lee Sin combines a 46.59% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability.",
      "strengths": [
        "46.59% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "More draft- or execution-dependent than the higher tiers.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "master-yi",
      "role": "jungle",
      "tier": "B",
      "winRate": 48.78,
      "pickRate": 10.62,
      "banRate": 53.64,
      "trend": "unavailable",
      "whyThisTier": "Master Yi combines a 48.78% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability. Its 53.64% ban rate also means availability is a real draft constraint.",
      "strengths": [
        "48.78% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "More draft- or execution-dependent than the higher tiers.",
        "High 53.64% ban rate can make the pick difficult to access."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Low",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "shyvana",
      "role": "jungle",
      "tier": "C",
      "winRate": 46.28,
      "pickRate": 3.15,
      "banRate": 0.94,
      "trend": "unavailable",
      "whyThisTier": "Shyvana combines a 46.28% China Diamond+ win rate with tempo, gank pressure, objective control and solo-queue reliability.",
      "strengths": [
        "46.28% win rate in the checked China Diamond+ snapshot.",
        "Can convert map tempo into objectives or pressure."
      ],
      "limitations": [
        "Current results and/or consistency trail the stronger alternatives in this role.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Low",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "High"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "hwei",
      "role": "mid",
      "tier": "S",
      "winRate": 52.34,
      "pickRate": 5.94,
      "banRate": 48.69,
      "trend": "down",
      "whyThisTier": "Hwei combines a 52.34% China Diamond+ win rate with wave control, roaming pressure and teamfight influence. Its 48.69% ban rate also means availability is a real draft constraint.",
      "strengths": [
        "52.34% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "High 48.69% ban rate can make the pick difficult to access."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "7.3b reduced Hwei's damage, shielding, crowd control and cast range.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "syndra",
      "role": "mid",
      "tier": "S",
      "winRate": 51.46,
      "pickRate": 5.77,
      "banRate": 17.77,
      "trend": "unavailable",
      "whyThisTier": "Syndra combines a 51.46% China Diamond+ win rate with wave control, roaming pressure and teamfight influence.",
      "strengths": [
        "51.46% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "galio",
      "role": "mid",
      "tier": "S",
      "winRate": 51.79,
      "pickRate": 10.84,
      "banRate": 3.51,
      "trend": "unavailable",
      "whyThisTier": "Galio combines a 51.79% China Diamond+ win rate with wave control, roaming pressure and teamfight influence.",
      "strengths": [
        "51.79% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "orianna",
      "role": "mid",
      "tier": "S",
      "winRate": 51.86,
      "pickRate": 4.76,
      "banRate": 0.35,
      "trend": "unavailable",
      "whyThisTier": "Orianna combines a 51.86% China Diamond+ win rate with wave control, roaming pressure and teamfight influence.",
      "strengths": [
        "51.86% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "lissandra",
      "role": "mid",
      "tier": "A",
      "winRate": 51.36,
      "pickRate": 4.39,
      "banRate": 5.27,
      "trend": "unavailable",
      "whyThisTier": "Lissandra combines a 51.36% China Diamond+ win rate with wave control, roaming pressure and teamfight influence.",
      "strengths": [
        "51.36% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "ahri",
      "role": "mid",
      "tier": "A",
      "winRate": 50.36,
      "pickRate": 4.78,
      "banRate": 0.16,
      "trend": "unavailable",
      "whyThisTier": "Ahri combines a 50.36% China Diamond+ win rate with wave control, roaming pressure and teamfight influence.",
      "strengths": [
        "50.36% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "brand",
      "role": "mid",
      "tier": "A",
      "winRate": 52.55,
      "pickRate": 10.82,
      "banRate": 11.5,
      "trend": "unavailable",
      "whyThisTier": "Brand combines a 52.55% China Diamond+ win rate with wave control, roaming pressure and teamfight influence.",
      "strengths": [
        "52.55% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "yasuo",
      "role": "mid",
      "tier": "B",
      "winRate": 46.93,
      "pickRate": 8.83,
      "banRate": 9.77,
      "trend": "up",
      "whyThisTier": "Yasuo combines a 46.93% China Diamond+ win rate with wave control, roaming pressure and teamfight influence.",
      "strengths": [
        "46.93% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "More draft- or execution-dependent than the higher tiers.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "7.3b increased Yasuo's standard critical damage and passive shield scaling.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "akali",
      "role": "mid",
      "tier": "B",
      "winRate": 47.2,
      "pickRate": 5.19,
      "banRate": 1.08,
      "trend": "unavailable",
      "whyThisTier": "Akali combines a 47.20% China Diamond+ win rate with wave control, roaming pressure and teamfight influence.",
      "strengths": [
        "47.20% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "More draft- or execution-dependent than the higher tiers.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "mel",
      "role": "mid",
      "tier": "C",
      "winRate": 46.59,
      "pickRate": 8.09,
      "banRate": 28.52,
      "trend": "unavailable",
      "whyThisTier": "Mel combines a 46.59% China Diamond+ win rate with wave control, roaming pressure and teamfight influence. Its 28.52% ban rate also means availability is a real draft constraint.",
      "strengths": [
        "46.59% win rate in the checked China Diamond+ snapshot.",
        "Can influence fights beyond the lane through pressure or control."
      ],
      "limitations": [
        "Current results and/or consistency trail the stronger alternatives in this role.",
        "High 28.52% ban rate can make the pick difficult to access."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Low",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "High"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "ashe",
      "role": "dragon",
      "tier": "S+",
      "winRate": 53.47,
      "pickRate": 9.89,
      "banRate": 0.25,
      "trend": "unavailable",
      "whyThisTier": "Ashe combines a 53.47% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "53.47% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "High",
        "carryImpactPotential": "High",
        "teamDependence": "Low"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "kogmaw",
      "role": "dragon",
      "tier": "S",
      "winRate": 53.45,
      "pickRate": 2.51,
      "banRate": 0.23,
      "trend": "unavailable",
      "whyThisTier": "Kog'Maw combines a 53.45% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "53.45% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "xayah",
      "role": "dragon",
      "tier": "S",
      "winRate": 51.27,
      "pickRate": 4.66,
      "banRate": 0.25,
      "trend": "unavailable",
      "whyThisTier": "Xayah combines a 51.27% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "51.27% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "samira",
      "role": "dragon",
      "tier": "S",
      "winRate": 51.07,
      "pickRate": 11.83,
      "banRate": 11.69,
      "trend": "unavailable",
      "whyThisTier": "Samira combines a 51.07% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "51.07% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Low",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "smolder",
      "role": "dragon",
      "tier": "S",
      "winRate": 52.16,
      "pickRate": 8.33,
      "banRate": 3.87,
      "trend": "unavailable",
      "whyThisTier": "Smolder combines a 52.16% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "52.16% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "kaisa",
      "role": "dragon",
      "tier": "A",
      "winRate": 50.37,
      "pickRate": 14.84,
      "banRate": 0.62,
      "trend": "unavailable",
      "whyThisTier": "Kai'Sa combines a 50.37% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "50.37% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "jhin",
      "role": "dragon",
      "tier": "A",
      "winRate": 49.53,
      "pickRate": 15.71,
      "banRate": 1,
      "trend": "up",
      "whyThisTier": "Jhin combines a 49.53% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "49.53% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "7.3b increased standard critical damage and moved missing-health scaling earlier.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "caitlyn",
      "role": "dragon",
      "tier": "A",
      "winRate": 49.9,
      "pickRate": 15.84,
      "banRate": 4.39,
      "trend": "unavailable",
      "whyThisTier": "Caitlyn combines a 49.90% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "49.90% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "yunara",
      "role": "dragon",
      "tier": "B",
      "winRate": 49.45,
      "pickRate": 7.44,
      "banRate": 10.34,
      "trend": "down",
      "whyThisTier": "Yunara combines a 49.45% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "49.45% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "More draft- or execution-dependent than the higher tiers.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "7.3b reduced Yunara's passive damage and increased ultimate cooldown at later ranks.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "lucian",
      "role": "dragon",
      "tier": "C",
      "winRate": 46.7,
      "pickRate": 3.09,
      "banRate": 0.03,
      "trend": "unavailable",
      "whyThisTier": "Lucian combines a 46.70% China Diamond+ win rate with lane stability, sustained damage and gold-to-teamfight conversion.",
      "strengths": [
        "46.70% win rate in the checked China Diamond+ snapshot.",
        "Converts protected farm into relevant teamfight output."
      ],
      "limitations": [
        "Current results and/or consistency trail the stronger alternatives in this role.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Low",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "High"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "braum",
      "role": "support",
      "tier": "S+",
      "winRate": 52.59,
      "pickRate": 4.85,
      "banRate": 1.4,
      "trend": "unavailable",
      "whyThisTier": "Braum combines a 52.59% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability.",
      "strengths": [
        "52.59% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Low"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "leona",
      "role": "support",
      "tier": "S",
      "winRate": 51.99,
      "pickRate": 11.62,
      "banRate": 7.76,
      "trend": "unavailable",
      "whyThisTier": "Leona combines a 51.99% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability.",
      "strengths": [
        "51.99% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "High",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "rell",
      "role": "support",
      "tier": "S",
      "winRate": 51.39,
      "pickRate": 3.32,
      "banRate": 1.43,
      "trend": "up",
      "whyThisTier": "Rell combines a 51.39% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability.",
      "strengths": [
        "51.39% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct champion change; 7.3b made Locket cheaper and added Health, improving tank-support itemization.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "thresh",
      "role": "support",
      "tier": "S",
      "winRate": 51.01,
      "pickRate": 15.34,
      "banRate": 12.89,
      "trend": "unavailable",
      "whyThisTier": "Thresh combines a 51.01% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability.",
      "strengths": [
        "51.01% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "janna",
      "role": "support",
      "tier": "S",
      "winRate": 52.09,
      "pickRate": 2.46,
      "banRate": 0.21,
      "trend": "unavailable",
      "whyThisTier": "Janna combines a 52.09% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability.",
      "strengths": [
        "52.09% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "sona",
      "role": "support",
      "tier": "A",
      "winRate": 52.53,
      "pickRate": 3.28,
      "banRate": 0.33,
      "trend": "unavailable",
      "whyThisTier": "Sona combines a 52.53% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability.",
      "strengths": [
        "52.53% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "soraka",
      "role": "support",
      "tier": "A",
      "winRate": 51.44,
      "pickRate": 4.71,
      "banRate": 1.7,
      "trend": "unavailable",
      "whyThisTier": "Soraka combines a 51.44% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability.",
      "strengths": [
        "51.44% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "pyke",
      "role": "support",
      "tier": "A",
      "winRate": 49.64,
      "pickRate": 3.75,
      "banRate": 2.9,
      "trend": "unavailable",
      "whyThisTier": "Pyke combines a 49.64% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability.",
      "strengths": [
        "49.64% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "Draft context and player execution can still materially change results.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Low",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "senna",
      "role": "support",
      "tier": "B",
      "winRate": 49.94,
      "pickRate": 6.17,
      "banRate": 10.5,
      "trend": "down",
      "whyThisTier": "Senna combines a 49.94% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability.",
      "strengths": [
        "49.94% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "More draft- or execution-dependent than the higher tiers.",
        "Win rate is evidence, not the ranking formula."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "7.3b reduced Senna's critical damage, soul AD scaling and Piercing Darkness base damage.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "yuumi",
      "role": "support",
      "tier": "C",
      "winRate": 47.81,
      "pickRate": 8.13,
      "banRate": 33.67,
      "trend": "unavailable",
      "whyThisTier": "Yuumi combines a 47.81% China Diamond+ win rate with engage or peel value, low-economy utility and random-team reliability. Its 33.67% ban rate also means availability is a real draft constraint.",
      "strengths": [
        "47.81% win rate in the checked China Diamond+ snapshot.",
        "Creates useful team value without requiring carry-level gold."
      ],
      "limitations": [
        "Current results and/or consistency trail the stronger alternatives in this role.",
        "High 33.67% ban rate can make the pick difficult to access."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Low",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "Medium",
        "teamDependence": "High"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "malphite",
      "role": "support",
      "tier": "A",
      "winRate": 51.6,
      "pickRate": 9.59,
      "banRate": 43.02,
      "trend": "unavailable",
      "whyThisTier": "Malphite's 51.60% China Diamond+ Support win rate and simple engage give him real off-role utility, but his peel and low-economy flexibility trail dedicated S-tier supports.",
      "strengths": [
        "51.60% win rate in the checked China Diamond+ snapshot.",
        "Reliable long-range engage without requiring carry-level gold."
      ],
      "limitations": [
        "High 43.02% ban rate can make the pick difficult to access.",
        "Less flexible peel and utility than the strongest dedicated supports."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "High",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "shen",
      "role": "jungle",
      "tier": "S",
      "winRate": 55.45,
      "pickRate": 1.38,
      "banRate": 0.77,
      "trend": "unavailable",
      "whyThisTier": "Shen pairs a 55.45% China Diamond+ Jungle win rate with global map influence and dependable frontline value, though the low pick volume warrants caution.",
      "strengths": [
        "55.45% win rate in the checked China Diamond+ snapshot.",
        "Global ultimate can convert jungle tempo into cross-map saves and counterganks."
      ],
      "limitations": [
        "Low 1.38% pick volume makes the headline win rate less stable.",
        "Clear and carry speed are less explosive than dedicated farming junglers."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "High",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "galio",
      "role": "support",
      "tier": "A",
      "winRate": 50.86,
      "pickRate": 2.79,
      "banRate": 3.51,
      "trend": "unavailable",
      "whyThisTier": "Galio's 50.86% China Diamond+ Support win rate is backed by engage, peel and map response, but his lane and economy fit are less consistent than dedicated support specialists.",
      "strengths": [
        "50.86% win rate in the checked China Diamond+ snapshot.",
        "Strong engage and cross-map follow-up can stabilize skirmishes."
      ],
      "limitations": [
        "Support pick volume is modest relative to his Mid presence.",
        "Requires coordination to extract full value from ultimate windows."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "High"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "ornn",
      "role": "support",
      "tier": "A",
      "winRate": 50.06,
      "pickRate": 1.31,
      "banRate": 0.2,
      "trend": "unavailable",
      "whyThisTier": "Ornn provides durable engage and low-economy frontline value at Support, but a 1.31% pick rate makes the 50.06% win rate a lower-confidence signal.",
      "strengths": [
        "Durable engage remains useful without heavy gold investment.",
        "Can front-line and create teamfight structure for random teammates."
      ],
      "limitations": [
        "1.31% pick rate is a limited sample signal.",
        "Lane pressure and peel can be less reliable than dedicated supports."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "Medium",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "yasuo",
      "role": "baron",
      "tier": "C",
      "winRate": 45.61,
      "pickRate": 1.91,
      "banRate": 9.77,
      "trend": "up",
      "whyThisTier": "Yasuo's 7.3b buff improves his ceiling, but a 45.61% China Diamond+ Baron win rate and high execution burden keep the role placement in C.",
      "strengths": [
        "7.3b increased standard critical damage and passive shield scaling.",
        "Can still create strong side-lane and teamfight moments in favorable drafts."
      ],
      "limitations": [
        "45.61% current win rate trails the stronger Baron alternatives.",
        "High execution burden and matchup sensitivity reduce blind-pick safety."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Low",
        "blindPickSafety": "Low",
        "easeOfExecution": "Low",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "7.3b increased Yasuo's standard critical damage and passive shield scaling.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "brand",
      "role": "support",
      "tier": "A",
      "winRate": 52.66,
      "pickRate": 2.99,
      "banRate": 11.5,
      "trend": "unavailable",
      "whyThisTier": "Brand's 52.66% China Diamond+ Support win rate gives him meaningful damage pressure, but lower defensive utility prevents an S-tier support placement.",
      "strengths": [
        "52.66% win rate in the checked China Diamond+ snapshot.",
        "High damage contribution can punish grouped fights on a support economy."
      ],
      "limitations": [
        "Offers less direct peel than tank or enchanter supports.",
        "Execution and positioning mistakes are punished heavily."
      ],
      "decisionSignals": {
        "soloQueueReliability": "High",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Medium",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "No direct Ranked champion change recorded in 7.3b.",
      "sourceIds": [
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "hwei",
      "role": "support",
      "tier": "A",
      "winRate": 51.26,
      "pickRate": 1.48,
      "banRate": 48.69,
      "trend": "down",
      "whyThisTier": "Hwei remains viable at Support with a 51.26% China Diamond+ win rate and broad utility, but 7.3b nerfs plus low role pick volume cap the placement at A.",
      "strengths": [
        "51.26% win rate in the checked China Diamond+ snapshot.",
        "Control, shielding and range can influence fights without carry-level gold."
      ],
      "limitations": [
        "1.48% role pick rate lowers confidence in the headline result.",
        "7.3b directly reduced damage, shielding and crowd-control output."
      ],
      "decisionSignals": {
        "soloQueueReliability": "Medium",
        "blindPickSafety": "Medium",
        "easeOfExecution": "Low",
        "carryImpactPotential": "High",
        "teamDependence": "Medium"
      },
      "patchImpact": "7.3b reduced Hwei's damage, shielding, crowd control and cast range.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "wrf-tier-crosscheck",
        "tierlistbase-review"
      ]
    }
  ],
  "changes": [
    {
      "championId": "volibear",
      "role": "baron",
      "previousTier": "C",
      "newTier": "B",
      "kind": "Buff",
      "reason": "7.3b improved Frenzied Maul scaling and missing-health healing; current data is still mixed, so the move stops at B.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "nocturne",
      "role": "jungle",
      "previousTier": "S+",
      "newTier": "S",
      "kind": "Nerf",
      "reason": "7.3b cut durability, clear damage and ultimate uptime, although current draft pressure remains exceptional.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "zed",
      "role": "jungle",
      "previousTier": "B",
      "newTier": "A",
      "kind": "Meta shift",
      "reason": "Cheaper Youmuu's and improved assassin snowball tools in 7.3b align with a 52.10% Jungle WR.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "hwei",
      "role": "mid",
      "previousTier": "S+",
      "newTier": "S",
      "kind": "Nerf",
      "reason": "Direct 7.3b reductions to damage, shielding and control lower the ceiling without erasing strong current results.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "yasuo",
      "role": "mid",
      "previousTier": "C",
      "newTier": "B",
      "kind": "Buff",
      "reason": "7.3b restored some crit damage and shield scaling, but current win rate keeps him below A.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "jhin",
      "role": "dragon",
      "previousTier": "B",
      "newTier": "A",
      "kind": "Buff",
      "reason": "7.3b moved Jhin's power spikes earlier; high pick volume supports a cautious rise despite 49.53% WR.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "yunara",
      "role": "dragon",
      "previousTier": "A",
      "newTier": "B",
      "kind": "Nerf",
      "reason": "7.3b reduced sustained damage and increased ultimate cooldown, lowering reviewed consistency.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "rell",
      "role": "support",
      "previousTier": "A",
      "newTier": "S",
      "kind": "Meta shift",
      "reason": "The 7.3b Locket buff improves tank-support economics while Rell retains positive current results.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "tierlistbase-review"
      ]
    },
    {
      "championId": "senna",
      "role": "support",
      "previousTier": "A",
      "newTier": "B",
      "kind": "Nerf",
      "reason": "7.3b directly reduced crit damage, soul AD scaling and Q base damage.",
      "sourceIds": [
        "riot-7-3b",
        "wrf-stats",
        "tierlistbase-review"
      ]
    }
  ]
};

export function getChampion(championId: string): Champion {
  const champion = wildRiftSnapshot.champions.find((item) => item.id === championId);
  if (!champion) throw new Error(`Unknown Wild Rift champion: ${championId}`);
  return champion;
}

export function getRoleProfile(role: RoleKey): RoleProfile {
  const profile = wildRiftSnapshot.roleProfiles.find((item) => item.key === role);
  if (!profile) throw new Error(`Unknown Wild Rift role: ${role}`);
  return profile;
}

export function getRoleRankings(role: RoleKey): readonly ChampionRoleRanking[] {
  return wildRiftSnapshot.rankings.filter((ranking) => ranking.role === role);
}

export function getRanking(championId: string, role: RoleKey): ChampionRoleRanking | undefined {
  return wildRiftSnapshot.rankings.find(
    (ranking) => ranking.championId === championId && ranking.role === role,
  );
}

export function getQuickPick(role: RoleKey): ChampionRoleRanking {
  const ranking = getRanking(getRoleProfile(role).quickPickChampionId, role);
  if (!ranking) throw new Error(`Missing Wild Rift quick pick for ${role}`);
  return ranking;
}

export function getOtherViableRoles(
  championId: string,
  currentRole: RoleKey,
): readonly ChampionRoleRanking[] {
  return wildRiftSnapshot.rankings.filter(
    (ranking) => ranking.championId === championId && ranking.role !== currentRole,
  );
}

export function formatRate(value: number | null): string {
  return value === null ? "N/A" : `${value.toFixed(2)}%`;
}
