import type { ChangeItem } from "./types";

export const dragonTravelerChanges = [
  {
    server: "global",
    date: "2026-10-22",
    title: "Arachne entered the live Global roster",
    detail:
      "The current Global update added Arachne as an SSR+ Mage from Illusion Veil / Wild Spirit; the snapshot includes her as a current-banner S-tier specialist rather than elevating her to S+.",
  },
  {
    server: "global",
    date: "2026-10-15",
    title: "Hela added to the Mythical pool",
    detail:
      "Hela is verified as SSR Ex, Priest, Sanctum Glory / Otherworld Return and joins the current Global S+ group.",
  },
  {
    server: "global",
    date: "2026-10-26",
    title: "No further Luminary data changes in 1.19.0",
    detail:
      "The latest datamined patch report records no additional Luminary joins or skill-number changes after the 1.17.0 roster update.",
  },
  {
    server: "taiwan",
    date: "2026-10-15",
    title: "Current Mythical selection rotated",
    detail:
      "The Taiwan Mythical Summon currently features Hypnos, Gaia, Artemis and Hermes through Oct 29. Account advice follows that live pool instead of Global banner timing.",
  },
  {
    server: "taiwan",
    date: "2026-10-01",
    title: "Taiwan continues using local quality terminology",
    detail:
      "Current official notices use 傳說‧神話 and 傳說+ rather than Global SSR Ex / SSR+. The UI keeps these taxonomies server-specific.",
  },
] as const satisfies readonly ChangeItem[];
