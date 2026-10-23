import type { StaticImageData } from "next/image";

import alice from "./assets/avatars/alice.png";
import blanc from "./assets/avatars/blanc.png";
import centi from "./assets/avatars/centi.png";
import crown from "./assets/avatars/crown.png";
import dorothy from "./assets/avatars/dorothy.png";
import drake from "./assets/avatars/drake.png";
import helm from "./assets/avatars/helm.png";
import liter from "./assets/avatars/liter.png";
import maxwell from "./assets/avatars/maxwell.png";
import miranda from "./assets/avatars/miranda.png";
import modernia from "./assets/avatars/modernia.png";
import naga from "./assets/avatars/naga.png";
import noir from "./assets/avatars/noir.png";
import noise from "./assets/avatars/noise.png";
import privaty from "./assets/avatars/privaty.png";
import rapunzel from "./assets/avatars/rapunzel.png";
import redHood from "./assets/avatars/red-hood.png";
import scarlet from "./assets/avatars/scarlet.png";

/**
 * Verified avatar mappings strictly for characters currently rendered in the NIKKE tier list page.
 * Unrendered avatars from the 203 official assets remain available in assets/avatars/ without premature mapping.
 */
export const RENDERED_CHARACTER_AVATARS: Record<string, StaticImageData> = {
  Alice: alice,
  Blanc: blanc,
  Centi: centi,
  Crown: crown,
  Dorothy: dorothy,
  Drake: drake,
  Helm: helm,
  Liter: liter,
  Maxwell: maxwell,
  Miranda: miranda,
  Modernia: modernia,
  Naga: naga,
  Noir: noir,
  Noise: noise,
  Privaty: privaty,
  Rapunzel: rapunzel,
  "Red Hood": redHood,
  Scarlet: scarlet,
};

export function getCharacterAvatar(name: string): StaticImageData {
  const avatar = RENDERED_CHARACTER_AVATARS[name];
  if (!avatar) {
    throw new Error(`Missing verified avatar asset for rendered character: "${name}"`);
  }
  return avatar;
}
