export * from "./types";
export * from "./identities";
export * from "./ego";
export * from "./teams";
export * from "./sinner-picks";
export * from "./sources";

import { identitiesMasterData } from "./identities";
import { egoMasterData } from "./ego";
import { teamsMasterData } from "./teams";
import { sinnerBestIdentities, sinnerBestEgo } from "./sinner-picks";
import { masterSourceMetadata } from "./sources";
import type { SinnerName } from "./types";

/**
 * Pure read-only querying utilities (zero external dependencies, zero database, zero API)
 */
export function getIdentitiesBySinner(sinner: SinnerName) {
  return identitiesMasterData.filter((item) => item.fact.sinner === sinner);
}

export function getEgoBySinner(sinner: SinnerName) {
  return egoMasterData.filter((item) => item.fact.sinner === sinner);
}

export function getBestIdentityForSinner(sinner: SinnerName) {
  return sinnerBestIdentities.find((item) => item.sinner === sinner) ?? null;
}

export function getBestEgoForSinner(sinner: SinnerName) {
  return sinnerBestEgo.find((item) => item.sinner === sinner) ?? null;
}

export function getTeamsByCategory(category: "Status" | "Faction" | "Mechanic" | "Hybrid") {
  return teamsMasterData.filter((team) => team.category === category);
}

export const limbusMasterDataset = {
  metadata: masterSourceMetadata,
  identities: identitiesMasterData,
  ego: egoMasterData,
  teams: teamsMasterData,
  sinnerBestIdentities,
  sinnerBestEgo,
} as const;
