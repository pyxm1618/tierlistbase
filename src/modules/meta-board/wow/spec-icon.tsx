import Image, { type StaticImageData } from "next/image";
import styles from "./wow-tier-list.module.css";
import placeholder from "./assets/neutral-placeholder.webp";

// Class icons (9)
import druidClass from "./assets/icons/classes/druid.webp";
import hunterClass from "./assets/icons/classes/hunter.webp";
import mageClass from "./assets/icons/classes/mage.webp";
import paladinClass from "./assets/icons/classes/paladin.webp";
import priestClass from "./assets/icons/classes/priest.webp";
import rogueClass from "./assets/icons/classes/rogue.webp";
import shamanClass from "./assets/icons/classes/shaman.webp";
import warlockClass from "./assets/icons/classes/warlock.webp";
import warriorClass from "./assets/icons/classes/warrior.webp";

// Spec icons (27)
import druidFeralCombat from "./assets/icons/specs/druid-feral-combat.webp";
import druidGuardian from "./assets/icons/specs/druid-guardian.webp";
import druidRestoration from "./assets/icons/specs/druid-restoration.webp";

import hunterBeastMastery from "./assets/icons/specs/hunter-beast-mastery.webp";
import hunterMarksmanship from "./assets/icons/specs/hunter-marksmanship.webp";
import hunterSurvival from "./assets/icons/specs/hunter-survival.webp";

import mageArcane from "./assets/icons/specs/mage-arcane.webp";
import mageFire from "./assets/icons/specs/mage-fire.webp";
import mageFrost from "./assets/icons/specs/mage-frost.webp";

import paladinHoly from "./assets/icons/specs/paladin-holy.webp";
import paladinJusticar from "./assets/icons/specs/paladin-justicar.webp";
import paladinProtection from "./assets/icons/specs/paladin-protection.webp";
import paladinRetribution from "./assets/icons/specs/paladin-retribution.webp";

import priestDiscipline from "./assets/icons/specs/priest-discipline.webp";
import priestHoly from "./assets/icons/specs/priest-holy.webp";
import priestShadow from "./assets/icons/specs/priest-shadow.webp";

import rogueAssassination from "./assets/icons/specs/rogue-assassination.webp";
import rogueCombat from "./assets/icons/specs/rogue-combat.webp";
import rogueSubtlety from "./assets/icons/specs/rogue-subtlety.webp";

import shamanElemental from "./assets/icons/specs/shaman-elemental.webp";
import shamanEnhancement from "./assets/icons/specs/shaman-enhancement.webp";
import shamanRestoration from "./assets/icons/specs/shaman-restoration.webp";

import warlockAffliction from "./assets/icons/specs/warlock-affliction.webp";
import warlockDestruction from "./assets/icons/specs/warlock-destruction.webp";

import warriorArms from "./assets/icons/specs/warrior-arms.webp";
import warriorGladiator from "./assets/icons/specs/warrior-gladiator.webp";
import warriorProtection from "./assets/icons/specs/warrior-protection.webp";

const CLASS_ICONS: Record<string, StaticImageData> = {
  Druid: druidClass,
  Hunter: hunterClass,
  Mage: mageClass,
  Paladin: paladinClass,
  Priest: priestClass,
  Rogue: rogueClass,
  Shaman: shamanClass,
  Warlock: warlockClass,
  Warrior: warriorClass,
};

const SPEC_ICONS: Record<string, StaticImageData> = {
  "Druid::Feral Combat": druidFeralCombat,
  "Druid::Guardian": druidGuardian,
  "Druid::Restoration": druidRestoration,

  "Hunter::Beast Mastery": hunterBeastMastery,
  "Hunter::Marksmanship": hunterMarksmanship,
  "Hunter::Survival": hunterSurvival,

  "Mage::Arcane": mageArcane,
  "Mage::Fire": mageFire,
  "Mage::Frost": mageFrost,

  "Paladin::Holy": paladinHoly,
  "Paladin::Justicar": paladinJusticar,
  "Paladin::Protection": paladinProtection,
  "Paladin::Retribution": paladinRetribution,

  "Priest::Discipline": priestDiscipline,
  "Priest::Holy": priestHoly,
  "Priest::Shadow": priestShadow,

  "Rogue::Assassination": rogueAssassination,
  "Rogue::Combat": rogueCombat,
  "Rogue::Subtlety": rogueSubtlety,

  "Shaman::Elemental": shamanElemental,
  "Shaman::Enhancement": shamanEnhancement,
  "Shaman::Restoration": shamanRestoration,

  "Warlock::Affliction": warlockAffliction,
  "Warlock::Destruction": warlockDestruction,

  "Warrior::Arms": warriorArms,
  "Warrior::Gladiator": warriorGladiator,
  "Warrior::Protection": warriorProtection,
};

export interface SpecIconProps {
  className?: string | null;
  specName?: string | null;
  detail?: boolean;
}

export function SpecIcon({ className, specName, detail = false }: SpecIconProps) {
  // 1. Spec Icon
  if (specName) {
    const key = className ? `${className}::${specName}` : specName;
    const asset = SPEC_ICONS[key] ?? placeholder;
    const size = detail ? 48 : 36;
    const sizes = detail ? "48px" : "36px";
    return (
      <span className={detail ? styles.detailIcon : styles.icon}>
        <Image
          src={asset}
          alt={`${specName} icon`}
          width={size}
          height={size}
          className={styles.placeholderImage}
          sizes={sizes}
          loading="lazy"
        />
      </span>
    );
  }

  // 2. Class Icon
  if (className && className !== "All Classes") {
    const asset = CLASS_ICONS[className] ?? placeholder;
    return (
      <span className={styles.icon}>
        <Image
          src={asset}
          alt={`${className} icon`}
          width={24}
          height={24}
          className={styles.placeholderImage}
          sizes="24px"
          loading="lazy"
        />
      </span>
    );
  }

  // 3. Fallback
  return (
    <span className={detail ? styles.detailIcon : styles.icon}>
      <Image
        src={placeholder}
        alt="WoW icon"
        width={detail ? 56 : 36}
        height={detail ? 56 : 36}
        className={styles.placeholderImage}
        sizes={detail ? "56px" : "36px"}
        loading="lazy"
      />
    </span>
  );
}
