import type { StaticImageData } from "next/image";

import anby from "./assets/agents/anby.webp";
import anton from "./assets/agents/anton.webp";
import astra from "./assets/agents/astra.webp";
import ben from "./assets/agents/ben.webp";
import billy from "./assets/agents/billy.webp";
import burnice from "./assets/agents/burnice.webp";
import caesar from "./assets/agents/caesar.webp";
import corin from "./assets/agents/corin.webp";
import evelyn from "./assets/agents/evelyn.webp";
import harumasa from "./assets/agents/harumasa.webp";
import jane from "./assets/agents/jane.webp";
import lighter from "./assets/agents/lighter.webp";
import lucy from "./assets/agents/lucy.webp";
import miyabi from "./assets/agents/miyabi.webp";
import nekomata from "./assets/agents/nekomata.webp";
import nicole from "./assets/agents/nicole.webp";
import piper from "./assets/agents/piper.webp";
import qingyi from "./assets/agents/qingyi.webp";
import rina from "./assets/agents/rina.webp";
import seth from "./assets/agents/seth.webp";
import soukaku from "./assets/agents/soukaku.webp";
import yanagi from "./assets/agents/yanagi.webp";
import zhuYuan from "./assets/agents/zhu-yuan.webp";
import butlerboo from "./assets/bangboo/butlerboo.webp";
import cryboo from "./assets/bangboo/cryboo.webp";
import electroboo from "./assets/bangboo/electroboo.webp";
import plugboo from "./assets/bangboo/plugboo.webp";
import rocketboo from "./assets/bangboo/rocketboo.webp";
import sharkboo from "./assets/bangboo/sharkboo.webp";
import agentAliceThymefield from "./assets/agents/alice-thymefield.webp";
import agentAria from "./assets/agents/aria.webp";
import agentBanyue from "./assets/agents/banyue.webp";
import agentCissia from "./assets/agents/cissia.webp";
import agentClaret from "./assets/agents/claret.webp";
import agentDialyn from "./assets/agents/dialyn.webp";
import agentEllenJoe from "./assets/agents/ellen-joe.webp";
import agentGraceHoward from "./assets/agents/grace-howard.webp";
import agentHugoVlad from "./assets/agents/hugo-vlad.webp";
import agentJuFufu from "./assets/agents/ju-fufu.webp";
import agentKoledaBelobog from "./assets/agents/koleda-belobog.webp";
import agentLucia from "./assets/agents/lucia.webp";
import agentNangongYu from "./assets/agents/nangong-yu.webp";
import agentNorma from "./assets/agents/norma.webp";
import agentOrphieAndMagus from "./assets/agents/orphie-and-magus.webp";
import agentPanYinhu from "./assets/agents/pan-yinhu.webp";
import agentPhoenix from "./assets/agents/phoenix.webp";
import agentPromeia from "./assets/agents/promeia.webp";
import agentPyrois from "./assets/agents/pyrois.webp";
import agentRemielleDan from "./assets/agents/remielle-dan.webp";
import agentRoxy from "./assets/agents/roxy.webp";
import agentSeed from "./assets/agents/seed.webp";
import agentSigridDeLAzur from "./assets/agents/sigrid-de-l-azur.webp";
import agentSoldier0Anby from "./assets/agents/soldier-0-anby.webp";
import agentSoldier11 from "./assets/agents/soldier-11.webp";
import agentStarlightBilly from "./assets/agents/starlight-billy.webp";
import agentSunna from "./assets/agents/sunna.webp";
import agentTrigger from "./assets/agents/trigger.webp";
import agentUkinamiYuzuha from "./assets/agents/ukinami-yuzuha.webp";
import agentVelinaAirgid from "./assets/agents/velina-airgid.webp";
import agentVivian from "./assets/agents/vivian.webp";
import agentVonLycaon from "./assets/agents/von-lycaon.webp";
import agentYeShunguang from "./assets/agents/ye-shunguang.webp";
import agentYidhari from "./assets/agents/yidhari.webp";
import agentYixuan from "./assets/agents/yixuan.webp";
import agentZhao from "./assets/agents/zhao.webp";
import agentKomanoManato from "./assets/agents/komano-manato.webp";
import agentPulchraFellini from "./assets/agents/pulchra-fellini.webp";
import bangbooBaddieboo from "./assets/bangboo/baddieboo.webp";
import bangbooBagboo from "./assets/bangboo/bagboo.webp";
import bangbooBelion from "./assets/bangboo/belion.webp";
import bangbooBiggestFan from "./assets/bangboo/biggest-fan.webp";
import bangbooBirkblick from "./assets/bangboo/birkblick.webp";
import bangbooBooltergeist from "./assets/bangboo/booltergeist.webp";
import bangbooBooressure from "./assets/bangboo/booressure.webp";
import bangbooKnightboo from "./assets/bangboo/knightboo.webp";
import bangbooLuckyboo from "./assets/bangboo/luckyboo.webp";
import bangbooMercury from "./assets/bangboo/mercury.webp";
import bangbooSprout from "./assets/bangboo/sprout.webp";
import bangbooUltraJake from "./assets/bangboo/ultra-jake.webp";
import engineAngelInTheShell from "./assets/w-engines/angel-in-the-shell.webp";
import engineBashfulDemon from "./assets/w-engines/bashful-demon.webp";
import engineBellicoseBlaze from "./assets/w-engines/bellicose-blaze.webp";
import engineBigCylinder from "./assets/w-engines/big-cylinder.webp";
import engineBlazingLaurel from "./assets/w-engines/blazing-laurel.webp";
import engineBloodmarrowCoffer from "./assets/w-engines/bloodmarrow-coffer.webp";
import engineBoxCutter from "./assets/w-engines/box-cutter.webp";
import engineBunnyBand from "./assets/w-engines/bunny-band.webp";
import engineCannonRotor from "./assets/w-engines/cannon-rotor.webp";
import engineCattyLuck from "./assets/w-engines/catty-luck.webp";
import engineCauldronOfClarity from "./assets/w-engines/cauldron-of-clarity.webp";
import engineChiefSidekick from "./assets/w-engines/chief-sidekick.webp";
import engineCloudcleaveRadiance from "./assets/w-engines/cloudcleave-radiance.webp";
import engineCordisGermina from "./assets/w-engines/cordis-germina.webp";
import engineCrimsonMoonCasket from "./assets/w-engines/crimson-moon-casket.webp";
import engineCrimsonThirst from "./assets/w-engines/crimson-thirst.webp";
import engineDeepSeaVisitor from "./assets/w-engines/deep-sea-visitor.webp";
import engineDreamlitHearth from "./assets/w-engines/dreamlit-hearth.webp";
import engineDrillRigRedAxis from "./assets/w-engines/drill-rig-red-axis.webp";
import engineElectroLipGloss from "./assets/w-engines/electro-lip-gloss.webp";
import engineElegantVanity from "./assets/w-engines/elegant-vanity.webp";
import engineFlamemakerShaker from "./assets/w-engines/flamemaker-shaker.webp";
import engineFlightOfFancy from "./assets/w-engines/flight-of-fancy.webp";
import engineFrostfallSickle from "./assets/w-engines/frostfall-sickle.webp";
import engineFusionCompiler from "./assets/w-engines/fusion-compiler.webp";
import engineGildedBlossom from "./assets/w-engines/gilded-blossom.webp";
import engineGrillOWisp from "./assets/w-engines/grill-o-wisp.webp";
import engineHailstormShrine from "./assets/w-engines/hailstorm-shrine.webp";
import engineHalfSugarBunny from "./assets/w-engines/half-sugar-bunny.webp";
import engineHeartstringNocturne from "./assets/w-engines/heartstring-nocturne.webp";
import engineHellfireGears from "./assets/w-engines/hellfire-gears.webp";
import engineIceJadeTeapot from "./assets/w-engines/ice-jade-teapot.webp";
import engineJoyauDore from "./assets/w-engines/joyau-dore.webp";
import engineKaboomTheCannon from "./assets/w-engines/kaboom-the-cannon.webp";
import engineKnightSExtolment from "./assets/w-engines/knight-s-extolment.webp";
import engineKrakenSCradle from "./assets/w-engines/kraken-s-cradle.webp";
import engineMarcatoDesire from "./assets/w-engines/marcato-desire.webp";
import engineMetanukimorphosis from "./assets/w-engines/metanukimorphosis.webp";
import engineMyriadEclipse from "./assets/w-engines/myriad-eclipse.webp";
import engineNeonFantasies from "./assets/w-engines/neon-fantasies.webp";
import engineOdeOfResurrectedWings from "./assets/w-engines/ode-of-resurrected-wings.webp";
import engineOriginalTransmorpher from "./assets/w-engines/original-transmorpher.webp";
import enginePeacekeeperSpecialized from "./assets/w-engines/peacekeeper-specialized.webp";
import enginePlumeOfRebirth from "./assets/w-engines/plume-of-rebirth.webp";
import enginePracticedPerfection from "./assets/w-engines/practiced-perfection.webp";
import enginePreciousFossilizedCore from "./assets/w-engines/precious-fossilized-core.webp";
import enginePuzzleSphere from "./assets/w-engines/puzzle-sphere.webp";
import engineQingmingBirdcage from "./assets/w-engines/qingming-birdcage.webp";
import engineRadiowaveJourney from "./assets/w-engines/radiowave-journey.webp";
import engineRainforestGourmet from "./assets/w-engines/rainforest-gourmet.webp";
import engineRiotSuppressorMarkVi from "./assets/w-engines/riot-suppressor-mark-vi.webp";
import engineRoaringFurNace from "./assets/w-engines/roaring-fur-nace.webp";
import engineSerpentineSeeker from "./assets/w-engines/serpentine-seeker.webp";
import engineSeveredInnocence from "./assets/w-engines/severed-innocence.webp";
import engineSharpenedStinger from "./assets/w-engines/sharpened-stinger.webp";
import engineSliceOfTime from "./assets/w-engines/slice-of-time.webp";
import engineSolExuvia from "./assets/w-engines/sol-exuvia.webp";
import engineSpectralGaze from "./assets/w-engines/spectral-gaze.webp";
import engineSpringEmbrace from "./assets/w-engines/spring-embrace.webp";
import engineStarlightEngine from "./assets/w-engines/starlight-engine.webp";
import engineStarlightEngineReplica from "./assets/w-engines/starlight-engine-replica.webp";
import engineStarlightRiderFaceplate from "./assets/w-engines/starlight-rider-faceplate.webp";
import engineSteamOven from "./assets/w-engines/steam-oven.webp";
import engineSteelCushion from "./assets/w-engines/steel-cushion.webp";
import engineTheBrimstone from "./assets/w-engines/the-brimstone.webp";
import engineTheRestrained from "./assets/w-engines/the-restrained.webp";
import engineTheVault from "./assets/w-engines/the-vault.webp";
import engineThoughtbop from "./assets/w-engines/thoughtbop.webp";
import engineTimeweaver from "./assets/w-engines/timeweaver.webp";
import engineTremorTrigramVessel from "./assets/w-engines/tremor-trigram-vessel.webp";
import engineTusksOfFury from "./assets/w-engines/tusks-of-fury.webp";
import engineWeepingCradle from "./assets/w-engines/weeping-cradle.webp";
import engineWeepingGemini from "./assets/w-engines/weeping-gemini.webp";
import engineWrathfulVajra from "./assets/w-engines/wrathful-vajra.webp";
import engineYesterdayCalls from "./assets/w-engines/yesterday-calls.webp";
import engineZanshinHerbCase from "./assets/w-engines/zanshin-herb-case.webp";
import engineReverbMarkIi from "./assets/w-engines/reverb-mark-ii.webp";
import teamPhoenixVortex from "./assets/teams/team-visual-phoenix.webp";
import teamClaretLaceration from "./assets/teams/team-visual-claret.webp";
import teamSeedObolElectric from "./assets/teams/team-visual-seed.webp";
import teamPromeiaVelinaAnomaly from "./assets/teams/team-visual-promeia.webp";
import teamAriaAnomaly from "./assets/teams/team-visual-aria.webp";
import teamYeEnlightened from "./assets/teams/team-visual-ye-shunguang.webp";
import teamYixuanRupture from "./assets/teams/team-visual-yixuan.webp";
import teamBanyueRupture from "./assets/teams/team-visual-banyue.webp";
import teamPyroisCrit from "./assets/teams/team-visual-pyrois.webp";

export const agentIcons: Readonly<Partial<Record<string, StaticImageData>>> = {
  "alexandrina-sebastiane": rina,
  "alice-thymefield": agentAliceThymefield,
  "anby-demara": anby,
  "anton-ivanov": anton,
  aria: agentAria,
  "asaba-harumasa": harumasa,
  "astra-yao": astra,
  banyue: agentBanyue,
  "ben-bigger": ben,
  "billy-kid": billy,
  "burnice-white": burnice,
  "caesar-king": caesar,
  cissia: agentCissia,
  claret: agentClaret,
  "corin-wickes": corin,
  dialyn: agentDialyn,
  "ellen-joe": agentEllenJoe,
  "evelyn-chevalier": evelyn,
  "grace-howard": agentGraceHoward,
  "hoshimi-miyabi": miyabi,
  "hugo-vlad": agentHugoVlad,
  "jane-doe": jane,
  "ju-fufu": agentJuFufu,
  "koleda-belobog": agentKoledaBelobog,
  "komano-manato": agentKomanoManato,
  lighter: lighter,
  lucia: agentLucia,
  lucy: lucy,
  "nangong-yu": agentNangongYu,
  nekomata: nekomata,
  "nicole-demara": nicole,
  norma: agentNorma,
  "orphie-and-magus": agentOrphieAndMagus,
  "pan-yinhu": agentPanYinhu,
  phoenix: agentPhoenix,
  "piper-wheel": piper,
  promeia: agentPromeia,
  "pulchra-fellini": agentPulchraFellini,
  pyrois: agentPyrois,
  qingyi: qingyi,
  "remielle-dan": agentRemielleDan,
  roxy: agentRoxy,
  seed: agentSeed,
  "seth-lowell": seth,
  "sigrid-de-l-azur": agentSigridDeLAzur,
  "soldier-0-anby": agentSoldier0Anby,
  "soldier-11": agentSoldier11,
  soukaku: soukaku,
  "starlight-billy": agentStarlightBilly,
  sunna: agentSunna,
  trigger: agentTrigger,
  "tsukishiro-yanagi": yanagi,
  "ukinami-yuzuha": agentUkinamiYuzuha,
  "velina-airgid": agentVelinaAirgid,
  vivian: agentVivian,
  "von-lycaon": agentVonLycaon,
  "ye-shunguang": agentYeShunguang,
  yidhari: agentYidhari,
  yixuan: agentYixuan,
  zhao: agentZhao,
  "zhu-yuan": zhuYuan,
};

export const bangbooIcons: Readonly<Partial<Record<string, StaticImageData>>> = {
  Baddieboo: bangbooBaddieboo,
  Bagboo: bangbooBagboo,
  Belion: bangbooBelion,
  "Biggest Fan": bangbooBiggestFan,
  Birkblick: bangbooBirkblick,
  Booltergeist: bangbooBooltergeist,
  Booressure: bangbooBooressure,
  Butler: butlerboo,
  Butlerboo: butlerboo,
  Cryboo: cryboo,
  Electroboo: electroboo,
  Knightboo: bangbooKnightboo,
  Luckyboo: bangbooLuckyboo,
  Mercury: bangbooMercury,
  Plugboo: plugboo,
  Rocketboo: rocketboo,
  Sharkboo: sharkboo,
  Sprout: bangbooSprout,
  "Ultra Jake": bangbooUltraJake,
};

export const wEngineIcons: Readonly<Partial<Record<string, StaticImageData>>> = {
  "Angel in the Shell": engineAngelInTheShell,
  "Bashful Demon": engineBashfulDemon,
  "Bellicose Blaze": engineBellicoseBlaze,
  "Big Cylinder": engineBigCylinder,
  "Blazing Laurel": engineBlazingLaurel,
  "Bloodmarrow Coffer": engineBloodmarrowCoffer,
  "Box Cutter": engineBoxCutter,
  "Bunny Band": engineBunnyBand,
  "Cannon Rotor": engineCannonRotor,
  "Catty Luck": engineCattyLuck,
  "Cauldron of Clarity": engineCauldronOfClarity,
  "Chief Sidekick": engineChiefSidekick,
  "Cloudcleave Radiance": engineCloudcleaveRadiance,
  "Cordis Germina": engineCordisGermina,
  "Crimson Moon Casket": engineCrimsonMoonCasket,
  "Crimson Thirst": engineCrimsonThirst,
  "Deep Sea Visitor": engineDeepSeaVisitor,
  "Dreamlit Hearth": engineDreamlitHearth,
  "Drill Rig - Red Axis": engineDrillRigRedAxis,
  "Electro-Lip Gloss": engineElectroLipGloss,
  "Elegant Vanity": engineElegantVanity,
  "Flamemaker Shaker": engineFlamemakerShaker,
  "Flight of Fancy": engineFlightOfFancy,
  "Frostfall Sickle": engineFrostfallSickle,
  "Fusion Compiler": engineFusionCompiler,
  "Gilded Blossom": engineGildedBlossom,
  "Grill O'Wisp": engineGrillOWisp,
  "Hailstorm Shrine": engineHailstormShrine,
  "Half-Sugar Bunny": engineHalfSugarBunny,
  "Heartstring Nocturne": engineHeartstringNocturne,
  "Hellfire Gears": engineHellfireGears,
  "Ice-Jade Teapot": engineIceJadeTeapot,
  "Joyau Dore": engineJoyauDore,
  "Kaboom the Cannon": engineKaboomTheCannon,
  "Knight's Extolment": engineKnightSExtolment,
  "Kraken's Cradle": engineKrakenSCradle,
  "Marcato Desire": engineMarcatoDesire,
  Metanukimorphosis: engineMetanukimorphosis,
  "Myriad Eclipse": engineMyriadEclipse,
  "Neon Fantasies": engineNeonFantasies,
  "Ode of Resurrected Wings": engineOdeOfResurrectedWings,
  "Original Transmorpher": engineOriginalTransmorpher,
  "Peacekeeper - Specialized": enginePeacekeeperSpecialized,
  "Plume of Rebirth": enginePlumeOfRebirth,
  "Practiced Perfection": enginePracticedPerfection,
  "Precious Fossilized Core": enginePreciousFossilizedCore,
  "Puzzle Sphere": enginePuzzleSphere,
  "Qingming Birdcage": engineQingmingBirdcage,
  "Radiowave Journey": engineRadiowaveJourney,
  "Rainforest Gourmet": engineRainforestGourmet,
  "Riot Suppressor Mark VI": engineRiotSuppressorMarkVi,
  "Roaring Fur-nace": engineRoaringFurNace,
  "Serpentine Seeker": engineSerpentineSeeker,
  "Severed Innocence": engineSeveredInnocence,
  "Sharpened Stinger": engineSharpenedStinger,
  "Slice of Time": engineSliceOfTime,
  "Sol Exuvia": engineSolExuvia,
  "Spectral Gaze": engineSpectralGaze,
  "Spring Embrace": engineSpringEmbrace,
  "Starlight Engine": engineStarlightEngine,
  "Starlight Engine Replica": engineStarlightEngineReplica,
  "Starlight Rider Faceplate": engineStarlightRiderFaceplate,
  "Steam Oven": engineSteamOven,
  "Steel Cushion": engineSteelCushion,
  "The Brimstone": engineTheBrimstone,
  "The Restrained": engineTheRestrained,
  "The Vault": engineTheVault,
  Thoughtbop: engineThoughtbop,
  Timeweaver: engineTimeweaver,
  "Tremor Trigram Vessel": engineTremorTrigramVessel,
  "Tusks of Fury": engineTusksOfFury,
  "Weeping Cradle": engineWeepingCradle,
  "Weeping Gemini": engineWeepingGemini,
  "Wrathful Vajra": engineWrathfulVajra,
  "Yesterday Calls": engineYesterdayCalls,
  "Zanshin Herb Case": engineZanshinHerbCase,
  "[Reverb] Mark II": engineReverbMarkIi,
};

export const teamVisuals: Readonly<Partial<Record<string, StaticImageData>>> = {
  "aria-anomaly": teamAriaAnomaly,
  "banyue-rupture": teamBanyueRupture,
  "claret-laceration": teamClaretLaceration,
  "phoenix-vortex": teamPhoenixVortex,
  "promeia-velina-anomaly": teamPromeiaVelinaAnomaly,
  "pyrois-crit": teamPyroisCrit,
  "seed-obol-electric": teamSeedObolElectric,
  "ye-enlightened": teamYeEnlightened,
  "yixuan-rupture": teamYixuanRupture,
};

// Only this refinement label is an audited alias; unknown names stay unresolved.
export const wEngineAliases: Readonly<Partial<Record<string, string>>> = {
  "Gilded Blossom (P5 baseline)": "Gilded Blossom",
};

export function getWEngineIcon(name: string): StaticImageData | undefined {
  return wEngineIcons[wEngineAliases[name] ?? name];
}
