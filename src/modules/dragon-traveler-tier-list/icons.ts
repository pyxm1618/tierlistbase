import type { StaticImageData } from "next/image";
import type { ClassKey, FactionKey } from "./data";
import heroArtwork from "./assets/dragon-traveler-hero.webp";
import portrait0 from "./assets/verified/ares.webp";
import portrait1 from "./assets/verified/thor.webp";
import portrait2 from "./assets/verified/asmodeus.webp";
import portrait3 from "./assets/verified/azure-dragon.webp";
import portrait4 from "./assets/verified/tyrfing.webp";
import portrait5 from "./assets/verified/andvari.webp";
import portrait6 from "./assets/verified/siegfried.webp";
import portrait7 from "./assets/verified/marylis.webp";
import portrait8 from "./assets/verified/brynhild.webp";
import portrait9 from "./assets/verified/arthur.webp";
import portrait10 from "./assets/verified/guna.webp";
import portrait11 from "./assets/verified/beowulf.webp";
import portrait12 from "./assets/verified/artemis.webp";
import portrait13 from "./assets/verified/dartagnan.webp";
import portrait14 from "./assets/verified/apollo.webp";
import portrait15 from "./assets/verified/ifrit.webp";
import portrait16 from "./assets/verified/ningrose.webp";
import portrait17 from "./assets/verified/mimir.webp";
import portrait18 from "./assets/verified/jing.webp";
import portrait19 from "./assets/verified/orion.webp";
import portrait20 from "./assets/verified/medusa.webp";
import portrait21 from "./assets/verified/huginn-and-muninn.webp";
import portrait22 from "./assets/verified/lorillin.webp";
import portrait23 from "./assets/verified/van-helsing.webp";
import portrait24 from "./assets/verified/talos.webp";
import portrait25 from "./assets/verified/loki.webp";
import portrait26 from "./assets/verified/poseidon.webp";
import portrait27 from "./assets/verified/gabriell.webp";
import portrait28 from "./assets/verified/crassus.webp";
import portrait29 from "./assets/verified/vermilion-bird.webp";
import portrait30 from "./assets/verified/gullveig.webp";
import portrait31 from "./assets/verified/faust.webp";
import portrait32 from "./assets/verified/nanalie.webp";
import portrait33 from "./assets/verified/cleopatra.webp";
import portrait34 from "./assets/verified/melina.webp";
import portrait35 from "./assets/verified/telperion.webp";
import portrait36 from "./assets/verified/cerberus.webp";
import portrait37 from "./assets/verified/arachne.webp";
import portrait38 from "./assets/verified/quetzal.webp";
import portrait39 from "./assets/verified/venus.webp";
import portrait40 from "./assets/verified/vivian.webp";
import portrait41 from "./assets/verified/morgana.webp";
import portrait42 from "./assets/verified/hel.webp";
import portrait43 from "./assets/verified/atanith.webp";
import portrait44 from "./assets/verified/scheherazade.webp";
import portrait45 from "./assets/verified/chiron.webp";
import portrait46 from "./assets/verified/spimo.webp";
import portrait47 from "./assets/verified/ophelia.webp";
import portrait48 from "./assets/verified/caligula.webp";
import portrait49 from "./assets/verified/titania.webp";
import portrait50 from "./assets/verified/hypnos.webp";
import portrait51 from "./assets/verified/hades.webp";
import portrait52 from "./assets/verified/rin.webp";
import portrait53 from "./assets/verified/zagrus.webp";
import portrait54 from "./assets/verified/nemesis.webp";
import portrait55 from "./assets/verified/fenrir.webp";
import portrait56 from "./assets/verified/jormungandr.webp";
import portrait57 from "./assets/verified/pan-junbao.webp";
import portrait58 from "./assets/verified/white-tiger.webp";
import portrait59 from "./assets/verified/mordred.webp";
import portrait60 from "./assets/verified/lancelot.webp";
import portrait61 from "./assets/verified/hermes.webp";
import portrait62 from "./assets/verified/athena.webp";
import portrait63 from "./assets/verified/gaia.webp";
import portrait64 from "./assets/verified/galahad.webp";
import portrait65 from "./assets/verified/prometheus.webp";
import portrait66 from "./assets/verified/salome.webp";
import portrait67 from "./assets/verified/caesar.webp";
import portrait68 from "./assets/verified/dvalin.webp";
import portrait69 from "./assets/verified/pompey.webp";
import portrait70 from "./assets/verified/helveil.webp";
import portrait71 from "./assets/verified/herman.webp";
import portrait72 from "./assets/verified/oberonnie.webp";
import portrait73 from "./assets/verified/anubis.webp";
import portrait74 from "./assets/verified/drasill.webp";
import portrait75 from "./assets/verified/goren.webp";
import portrait76 from "./assets/verified/gudong.webp";
import portrait77 from "./assets/verified/lilith.webp";
import portrait78 from "./assets/verified/hitomi.webp";
import portrait79 from "./assets/verified/catherine.webp";
import portrait80 from "./assets/verified/tamamo.webp";
import portrait81 from "./assets/verified/biqisi.webp";
import portrait82 from "./assets/verified/asteros.webp";
import portrait83 from "./assets/verified/heidren.webp";
import portrait84 from "./assets/verified/himiko.webp";
import portrait85 from "./assets/verified/lupin.webp";
import portrait86 from "./assets/verified/hercules.webp";
import portrait87 from "./assets/verified/xuanwu.webp";
import portrait88 from "./assets/verified/sigurd.webp";
import portrait89 from "./assets/verified/zeus.webp";
import portrait90 from "./assets/verified/pinocchio.webp";
import portrait91 from "./assets/verified/hera.webp";
import portrait92 from "./assets/verified/saad.webp";
import portrait93 from "./assets/verified/honoka.webp";
import portrait94 from "./assets/verified/marie-rose.webp";
import portrait95 from "./assets/verified/kasumi.webp";
export { heroArtwork };
export const portraits: Readonly<Record<string, StaticImageData>> = {
  ares: portrait0,
  thor: portrait1,
  asmodeus: portrait2,
  "azure-dragon": portrait3,
  tyrfing: portrait4,
  andvari: portrait5,
  siegfried: portrait6,
  marylis: portrait7,
  brynhild: portrait8,
  arthur: portrait9,
  guna: portrait10,
  beowulf: portrait11,
  artemis: portrait12,
  dartagnan: portrait13,
  apollo: portrait14,
  ifrit: portrait15,
  ningrose: portrait16,
  mimir: portrait17,
  jing: portrait18,
  orion: portrait19,
  medusa: portrait20,
  "huginn-and-muninn": portrait21,
  lorillin: portrait22,
  "van-helsing": portrait23,
  talos: portrait24,
  loki: portrait25,
  poseidon: portrait26,
  gabriell: portrait27,
  crassus: portrait28,
  "vermilion-bird": portrait29,
  gullveig: portrait30,
  faust: portrait31,
  nanalie: portrait32,
  cleopatra: portrait33,
  melina: portrait34,
  telperion: portrait35,
  cerberus: portrait36,
  arachne: portrait37,
  quetzal: portrait38,
  venus: portrait39,
  vivian: portrait40,
  morgana: portrait41,
  hel: portrait42,
  atanith: portrait43,
  scheherazade: portrait44,
  chiron: portrait45,
  spimo: portrait46,
  ophelia: portrait47,
  caligula: portrait48,
  titania: portrait49,
  hypnos: portrait50,
  hades: portrait51,
  rin: portrait52,
  zagrus: portrait53,
  nemesis: portrait54,
  fenrir: portrait55,
  jormungandr: portrait56,
  "pan-junbao": portrait57,
  "white-tiger": portrait58,
  mordred: portrait59,
  lancelot: portrait60,
  hermes: portrait61,
  athena: portrait62,
  gaia: portrait63,
  galahad: portrait64,
  prometheus: portrait65,
  salome: portrait66,
  caesar: portrait67,
  dvalin: portrait68,
  pompey: portrait69,
  helveil: portrait70,
  herman: portrait71,
  oberonnie: portrait72,
  anubis: portrait73,
  drasill: portrait74,
  goren: portrait75,
  gudong: portrait76,
  lilith: portrait77,
  hitomi: portrait78,
  catherine: portrait79,
  tamamo: portrait80,
  biqisi: portrait81,
  asteros: portrait82,
  heidren: portrait83,
  himiko: portrait84,
  lupin: portrait85,
  hercules: portrait86,
  xuanwu: portrait87,
  sigurd: portrait88,
  zeus: portrait89,
  pinocchio: portrait90,
  hera: portrait91,
  saad: portrait92,
  honoka: portrait93,
  "marie-rose": portrait94,
  kasumi: portrait95,
};
import classes0 from "./assets/verified-icons/guardian.webp";
import classes1 from "./assets/verified-icons/warrior.webp";
import classes2 from "./assets/verified-icons/assassin.webp";
import classes3 from "./assets/verified-icons/archer.webp";
import classes4 from "./assets/verified-icons/mage.webp";
import classes5 from "./assets/verified-icons/priest.webp";
export const classesIcons: Readonly<Record<ClassKey, StaticImageData>> = {
  Guardian: classes0,
  Warrior: classes1,
  Assassin: classes2,
  Archer: classes3,
  Mage: classes4,
  Priest: classes5,
};
import factions0 from "./assets/verified-icons/sanctum-glory.webp";
import factions1 from "./assets/verified-icons/wild-spirit.webp";
import factions2 from "./assets/verified-icons/elemental-echo.webp";
import factions3 from "./assets/verified-icons/arcane-wisdom.webp";
import factions4 from "./assets/verified-icons/otherworld-return.webp";
import factions5 from "./assets/verified-icons/illusion-veil.webp";
export const factionsIcons: Readonly<Record<FactionKey, StaticImageData>> = {
  "Sanctum Glory": factions0,
  "Wild Spirit": factions1,
  "Elemental Echo": factions2,
  "Arcane Wisdom": factions3,
  "Otherworld Return": factions4,
  "Illusion Veil": factions5,
};
