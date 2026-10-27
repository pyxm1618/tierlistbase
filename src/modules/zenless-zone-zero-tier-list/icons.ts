import type { StaticImageData } from "next/image";

import anby from "./assets/agents/anby.png";
import anton from "./assets/agents/anton.png";
import astra from "./assets/agents/astra.png";
import ben from "./assets/agents/ben.png";
import billy from "./assets/agents/billy.png";
import burnice from "./assets/agents/burnice.png";
import caesar from "./assets/agents/caesar.png";
import corin from "./assets/agents/corin.png";
import evelyn from "./assets/agents/evelyn.png";
import harumasa from "./assets/agents/harumasa.png";
import jane from "./assets/agents/jane.png";
import lighter from "./assets/agents/lighter.png";
import lucy from "./assets/agents/lucy.png";
import miyabi from "./assets/agents/miyabi.png";
import nekomata from "./assets/agents/nekomata.png";
import nicole from "./assets/agents/nicole.png";
import piper from "./assets/agents/piper.png";
import qingyi from "./assets/agents/qingyi.png";
import rina from "./assets/agents/rina.png";
import seth from "./assets/agents/seth.png";
import soukaku from "./assets/agents/soukaku.png";
import yanagi from "./assets/agents/yanagi.png";
import zhuYuan from "./assets/agents/zhu-yuan.png";
import butlerboo from "./assets/bangboo/butlerboo.png";
import cryboo from "./assets/bangboo/cryboo.png";
import electroboo from "./assets/bangboo/electroboo.png";
import plugboo from "./assets/bangboo/plugboo.png";
import rocketboo from "./assets/bangboo/rocketboo.png";
import sharkboo from "./assets/bangboo/sharkboo.png";
import agentAliceThymefield from "./assets/agents/alice-thymefield.png";
import agentAria from "./assets/agents/aria.png";
import agentBanyue from "./assets/agents/banyue.png";
import agentCissia from "./assets/agents/cissia.png";
import agentClaret from "./assets/agents/claret.png";
import agentDialyn from "./assets/agents/dialyn.png";
import agentEllenJoe from "./assets/agents/ellen-joe.png";
import agentGraceHoward from "./assets/agents/grace-howard.png";
import agentHugoVlad from "./assets/agents/hugo-vlad.png";
import agentJuFufu from "./assets/agents/ju-fufu.png";
import agentKoledaBelobog from "./assets/agents/koleda-belobog.png";
import agentLucia from "./assets/agents/lucia.png";
import agentNangongYu from "./assets/agents/nangong-yu.png";
import agentNorma from "./assets/agents/norma.png";
import agentOrphieAndMagus from "./assets/agents/orphie-and-magus.png";
import agentPanYinhu from "./assets/agents/pan-yinhu.png";
import agentPhoenix from "./assets/agents/phoenix.png";
import agentPromeia from "./assets/agents/promeia.png";
import agentPyrois from "./assets/agents/pyrois.png";
import agentRemielleDan from "./assets/agents/remielle-dan.png";
import agentRoxy from "./assets/agents/roxy.png";
import agentSeed from "./assets/agents/seed.png";
import agentSigridDeLAzur from "./assets/agents/sigrid-de-l-azur.png";
import agentSoldier0Anby from "./assets/agents/soldier-0-anby.png";
import agentSoldier11 from "./assets/agents/soldier-11.png";
import agentStarlightBilly from "./assets/agents/starlight-billy.png";
import agentSunna from "./assets/agents/sunna.png";
import agentTrigger from "./assets/agents/trigger.png";
import agentUkinamiYuzuha from "./assets/agents/ukinami-yuzuha.png";
import agentVelinaAirgid from "./assets/agents/velina-airgid.png";
import agentVivian from "./assets/agents/vivian.png";
import agentVonLycaon from "./assets/agents/von-lycaon.png";
import agentYeShunguang from "./assets/agents/ye-shunguang.png";
import agentYidhari from "./assets/agents/yidhari.png";
import agentYixuan from "./assets/agents/yixuan.png";
import agentZhao from "./assets/agents/zhao.png";
import agentKomanoManato from "./assets/agents/komano-manato.png";
import agentPulchraFellini from "./assets/agents/pulchra-fellini.png";
import bangbooBaddieboo from "./assets/bangboo/baddieboo.png";
import bangbooBagboo from "./assets/bangboo/bagboo.png";
import bangbooBelion from "./assets/bangboo/belion.png";
import bangbooBiggestFan from "./assets/bangboo/biggest-fan.png";
import bangbooBirkblick from "./assets/bangboo/birkblick.png";
import bangbooBooltergeist from "./assets/bangboo/booltergeist.png";
import bangbooBooressure from "./assets/bangboo/booressure.png";
import bangbooKnightboo from "./assets/bangboo/knightboo.png";
import bangbooLuckyboo from "./assets/bangboo/luckyboo.png";
import bangbooMercury from "./assets/bangboo/mercury.png";
import bangbooSprout from "./assets/bangboo/sprout.png";
import bangbooUltraJake from "./assets/bangboo/ultra-jake.png";
import engineAngelInTheShell from "./assets/w-engines/angel-in-the-shell.png";
import engineBashfulDemon from "./assets/w-engines/bashful-demon.png";
import engineBellicoseBlaze from "./assets/w-engines/bellicose-blaze.png";
import engineBigCylinder from "./assets/w-engines/big-cylinder.png";
import engineBlazingLaurel from "./assets/w-engines/blazing-laurel.png";
import engineBloodmarrowCoffer from "./assets/w-engines/bloodmarrow-coffer.png";
import engineBoxCutter from "./assets/w-engines/box-cutter.png";
import engineBunnyBand from "./assets/w-engines/bunny-band.png";
import engineCannonRotor from "./assets/w-engines/cannon-rotor.png";
import engineCattyLuck from "./assets/w-engines/catty-luck.png";
import engineCauldronOfClarity from "./assets/w-engines/cauldron-of-clarity.png";
import engineChiefSidekick from "./assets/w-engines/chief-sidekick.png";
import engineCloudcleaveRadiance from "./assets/w-engines/cloudcleave-radiance.png";
import engineCordisGermina from "./assets/w-engines/cordis-germina.png";
import engineCrimsonMoonCasket from "./assets/w-engines/crimson-moon-casket.png";
import engineCrimsonThirst from "./assets/w-engines/crimson-thirst.png";
import engineDeepSeaVisitor from "./assets/w-engines/deep-sea-visitor.png";
import engineDreamlitHearth from "./assets/w-engines/dreamlit-hearth.png";
import engineDrillRigRedAxis from "./assets/w-engines/drill-rig-red-axis.png";
import engineElectroLipGloss from "./assets/w-engines/electro-lip-gloss.png";
import engineElegantVanity from "./assets/w-engines/elegant-vanity.png";
import engineFlamemakerShaker from "./assets/w-engines/flamemaker-shaker.png";
import engineFlightOfFancy from "./assets/w-engines/flight-of-fancy.png";
import engineFrostfallSickle from "./assets/w-engines/frostfall-sickle.png";
import engineFusionCompiler from "./assets/w-engines/fusion-compiler.png";
import engineGildedBlossom from "./assets/w-engines/gilded-blossom.png";
import engineGrillOWisp from "./assets/w-engines/grill-o-wisp.png";
import engineHailstormShrine from "./assets/w-engines/hailstorm-shrine.png";
import engineHalfSugarBunny from "./assets/w-engines/half-sugar-bunny.png";
import engineHeartstringNocturne from "./assets/w-engines/heartstring-nocturne.png";
import engineHellfireGears from "./assets/w-engines/hellfire-gears.png";
import engineIceJadeTeapot from "./assets/w-engines/ice-jade-teapot.png";
import engineJoyauDore from "./assets/w-engines/joyau-dore.png";
import engineKaboomTheCannon from "./assets/w-engines/kaboom-the-cannon.png";
import engineKnightSExtolment from "./assets/w-engines/knight-s-extolment.png";
import engineKrakenSCradle from "./assets/w-engines/kraken-s-cradle.png";
import engineMarcatoDesire from "./assets/w-engines/marcato-desire.png";
import engineMetanukimorphosis from "./assets/w-engines/metanukimorphosis.png";
import engineMyriadEclipse from "./assets/w-engines/myriad-eclipse.png";
import engineNeonFantasies from "./assets/w-engines/neon-fantasies.png";
import engineOdeOfResurrectedWings from "./assets/w-engines/ode-of-resurrected-wings.png";
import engineOriginalTransmorpher from "./assets/w-engines/original-transmorpher.png";
import enginePeacekeeperSpecialized from "./assets/w-engines/peacekeeper-specialized.png";
import enginePlumeOfRebirth from "./assets/w-engines/plume-of-rebirth.png";
import enginePracticedPerfection from "./assets/w-engines/practiced-perfection.png";
import enginePreciousFossilizedCore from "./assets/w-engines/precious-fossilized-core.png";
import enginePuzzleSphere from "./assets/w-engines/puzzle-sphere.png";
import engineQingmingBirdcage from "./assets/w-engines/qingming-birdcage.png";
import engineRadiowaveJourney from "./assets/w-engines/radiowave-journey.png";
import engineRainforestGourmet from "./assets/w-engines/rainforest-gourmet.png";
import engineRiotSuppressorMarkVi from "./assets/w-engines/riot-suppressor-mark-vi.png";
import engineRoaringFurNace from "./assets/w-engines/roaring-fur-nace.png";
import engineSerpentineSeeker from "./assets/w-engines/serpentine-seeker.png";
import engineSeveredInnocence from "./assets/w-engines/severed-innocence.png";
import engineSharpenedStinger from "./assets/w-engines/sharpened-stinger.png";
import engineSliceOfTime from "./assets/w-engines/slice-of-time.png";
import engineSolExuvia from "./assets/w-engines/sol-exuvia.png";
import engineSpectralGaze from "./assets/w-engines/spectral-gaze.png";
import engineSpringEmbrace from "./assets/w-engines/spring-embrace.png";
import engineStarlightEngine from "./assets/w-engines/starlight-engine.png";
import engineStarlightEngineReplica from "./assets/w-engines/starlight-engine-replica.png";
import engineStarlightRiderFaceplate from "./assets/w-engines/starlight-rider-faceplate.png";
import engineSteamOven from "./assets/w-engines/steam-oven.png";
import engineSteelCushion from "./assets/w-engines/steel-cushion.png";
import engineTheBrimstone from "./assets/w-engines/the-brimstone.png";
import engineTheRestrained from "./assets/w-engines/the-restrained.png";
import engineTheVault from "./assets/w-engines/the-vault.png";
import engineThoughtbop from "./assets/w-engines/thoughtbop.png";
import engineTimeweaver from "./assets/w-engines/timeweaver.png";
import engineTremorTrigramVessel from "./assets/w-engines/tremor-trigram-vessel.png";
import engineTusksOfFury from "./assets/w-engines/tusks-of-fury.png";
import engineWeepingCradle from "./assets/w-engines/weeping-cradle.png";
import engineWeepingGemini from "./assets/w-engines/weeping-gemini.png";
import engineWrathfulVajra from "./assets/w-engines/wrathful-vajra.png";
import engineYesterdayCalls from "./assets/w-engines/yesterday-calls.png";
import engineZanshinHerbCase from "./assets/w-engines/zanshin-herb-case.png";
import engineReverbMarkIi from "./assets/w-engines/reverb-mark-ii.png";
import teamPhoenixVortex from "./assets/teams/team-visual-phoenix.png";
import teamClaretLaceration from "./assets/teams/team-visual-claret.png";
import teamSeedObolElectric from "./assets/teams/team-visual-seed.png";
import teamPromeiaVelinaAnomaly from "./assets/teams/team-visual-promeia.png";
import teamAriaAnomaly from "./assets/teams/team-visual-aria.png";
import teamYeEnlightened from "./assets/teams/team-visual-ye-shunguang.png";
import teamYixuanRupture from "./assets/teams/team-visual-yixuan.png";
import teamBanyueRupture from "./assets/teams/team-visual-banyue.png";
import teamPyroisCrit from "./assets/teams/team-visual-pyrois.png";

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
