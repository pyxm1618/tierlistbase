import type { MasterSourceMetadata } from "./types";

export const masterSourceMetadata: MasterSourceMetadata = {
  gameVersion: "1.117.0",
  season: "Season 8 - PUNCTUM",
  sourceUpdatedAt: "2026-10-15",
  reviewedAt: "2026-10-19",
  identitiesCount: 190,
  egoCount: 116,
  teamsCount: 12,
  sinnersCoveredCount: 12,
  primarySources: [
    {
      name: "Project Moon / Steam Official Announcements",
      url: "https://store.steampowered.com/news/app/1973530",
      role: "Official game patch version 1.117.0, release schedule, banner rules, and official announcements",
    },
    {
      name: "Limbus Company Wiki.gg",
      url: "https://limbuscompany.wiki.gg/wiki/Limbus_Company_Wiki",
      role: "Comprehensive factual master data for all 190 Identities, 116 E.G.O, sin affinities, rarity, and release context",
    },
    {
      name: "Prydwen Database (Limbus Company)",
      url: "https://www.prydwen.gg/limbus-company/",
      role: "Secondary reference for competitive meta performance, role taxonomy, and team synergy validation",
    },
  ],
  reviewNotes: [
    "Baseline strictly verified against patch 1.117.0 (2026-10-15) during Season 8 - PUNCTUM.",
    "Availability dimensions strictly recalculated per Wiki/official rules: 190 Identities (extractableNow=true: 130, dispensableNow=true: 140, both=true: 115, both=false: 35) and 116 E.G.O (extractableNow=true: 28, dispensableNow=true: 83, both=true: 26, both=false: 31).",
    "Season 7 ordinary seasonals (14 Identities, 2 E.G.O) set to extractableNow=true, dispensableNow=false; Season 7 Pass E.G.O (4 items) set to extractableNow=false, dispensableNow=true; Season 7 Events (6 Identities, 3 E.G.O) set to both=false.",
    "Season 8 Pass E.G.O (4 items) correctly recorded to unlock in Season 9 Dispenser.",
    "Current Season 8 1-week dispenser rule strictly enforced: Haute Couture Sinclair (released 2026.10.15) has extractableNow=true, dispensableNow=false (unlocks 2026-10-22).",
    "Collaboration E.G.O (4 items) strictly verified as permanently unobtainable (extractableNow=false, dispensableNow=false, temporarilyUnavailable=false).",
    "Editorial ratings strictly audited: Haute Couture Sinclair and 4 late-season E.G.O items retained as NEEDS_REVIEW due to lack of mature competitive evidence.",
    "12 Sinner Best Identity Picks rigorously updated to eliminate obsolete S1/S2 picks (Faust, Don Quixote, Outis, Hong Lu, Ishmael, Rodion, Sinclair updated to current Meta leaders).",
  ],
};
