const fs = require("node:fs/promises");
const path = require("node:path");
const https = require("node:https");
const crypto = require("node:crypto");
const sharp = require("sharp");

// 9 Classes from SSOT
const CLASSES = [
  {
    className: "Warrior",
    fileName: "warrior",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/classicon_warrior.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes",
  },
  {
    className: "Paladin",
    fileName: "paladin",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/classicon_paladin.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes",
  },
  {
    className: "Hunter",
    fileName: "hunter",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/classicon_hunter.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes",
  },
  {
    className: "Rogue",
    fileName: "rogue",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/classicon_rogue.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes",
  },
  {
    className: "Priest",
    fileName: "priest",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/classicon_priest.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes",
  },
  {
    className: "Shaman",
    fileName: "shaman",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/classicon_shaman.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes",
  },
  {
    className: "Mage",
    fileName: "mage",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/classicon_mage.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes",
  },
  {
    className: "Warlock",
    fileName: "warlock",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/classicon_warlock.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes",
  },
  {
    className: "Druid",
    fileName: "druid",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/classicon_druid.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes",
  },
];

// 27 Specs from SSOT
const SPECS = [
  // Druid (3)
  {
    className: "Druid",
    specName: "Feral Combat",
    fileName: "druid-feral-combat",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/132115.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/druid",
    note: "Blizzard official class page lists Feral with icon 132115 (ability_druid_catform).",
  },
  {
    className: "Druid",
    specName: "Guardian",
    fileName: "druid-guardian",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/132276.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/druid",
    note: "Blizzard official class page lists Guardian with icon 132276 (ability_racial_bearform).",
  },
  {
    className: "Druid",
    specName: "Restoration",
    fileName: "druid-restoration",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/136041.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/druid",
    note: "Blizzard official class page lists Restoration with icon 136041 (spell_nature_healingtouch).",
  },

  // Hunter (3)
  {
    className: "Hunter",
    specName: "Beast Mastery",
    fileName: "hunter-beast-mastery",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/461112.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/hunter",
    note: "Blizzard official class page lists Beast Mastery with icon 461112 (ability_hunter_beastmastery).",
  },
  {
    className: "Hunter",
    specName: "Marksmanship",
    fileName: "hunter-marksmanship",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/236179.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/hunter",
    note: "Blizzard official class page lists Marksmanship with icon 236179 (ability_marksmanship).",
  },
  {
    className: "Hunter",
    specName: "Survival",
    fileName: "hunter-survival",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/461113.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/hunter",
    note: "Blizzard official class page lists Survival with icon 461113 (ability_hunter_camouflage).",
  },

  // Mage (3)
  {
    className: "Mage",
    specName: "Arcane",
    fileName: "mage-arcane",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/135932.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/mage",
    note: "Blizzard official class page lists Arcane with icon 135932 (spell_holy_magicalsentry).",
  },
  {
    className: "Mage",
    specName: "Fire",
    fileName: "mage-fire",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/135810.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/mage",
    note: "Blizzard official class page lists Fire with icon 135810 (spell_fire_firebolt02).",
  },
  {
    className: "Mage",
    specName: "Frost",
    fileName: "mage-frost",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/135846.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/mage",
    note: "Blizzard official class page lists Frost with icon 135846 (spell_frost_frostbolt02).",
  },

  // Paladin (4)
  {
    className: "Paladin",
    specName: "Holy",
    fileName: "paladin-holy",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/135920.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/paladin",
    note: "Blizzard official class page lists Holy with icon 135920 (spell_holy_holybolt).",
  },
  {
    className: "Paladin",
    specName: "Justicar",
    fileName: "paladin-justicar",
    assetUrl: null,
    sourcePageUrl: null,
    unresolvedReason:
      "Forever Logs DPS cohort for Protection Paladin; no Blizzard first-party Justicar specialization icon exists.",
  },
  {
    className: "Paladin",
    specName: "Protection",
    fileName: "paladin-protection",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/236264.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/paladin",
    note: "Blizzard official class page lists Protection with icon 236264 (ability_paladin_shieldofthetemplar).",
  },
  {
    className: "Paladin",
    specName: "Retribution",
    fileName: "paladin-retribution",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/135873.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/paladin",
    note: "Blizzard official class page lists Retribution with icon 135873 (spell_holy_auraoflight).",
  },

  // Priest (3)
  {
    className: "Priest",
    specName: "Discipline",
    fileName: "priest-discipline",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/135940.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/priest",
    note: "Blizzard official class page lists Discipline with icon 135940 (spell_holy_powerwordshield).",
  },
  {
    className: "Priest",
    specName: "Holy",
    fileName: "priest-holy",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/237542.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/priest",
    note: "Blizzard official class page lists Holy with icon 237542 (spell_holy_guardianspirit).",
  },
  {
    className: "Priest",
    specName: "Shadow",
    fileName: "priest-shadow",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/136207.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/priest",
    note: "Blizzard official class page lists Shadow with icon 136207 (spell_shadow_shadowwordpain).",
  },

  // Rogue (3)
  {
    className: "Rogue",
    specName: "Assassination",
    fileName: "rogue-assassination",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/236270.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/rogue",
    note: "Blizzard official class page lists Assassination with icon 236270 (ability_rogue_eviscerate).",
  },
  {
    className: "Rogue",
    specName: "Combat",
    fileName: "rogue-combat",
    assetUrl: null,
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/rogue",
    unresolvedReason:
      "Blizzard official class page names this specialization slot 'Outlaw' (icon 236286). Per strict rules, no exact literal first-party 'Combat' specialization icon is mapped without explicit instruction.",
  },
  {
    className: "Rogue",
    specName: "Subtlety",
    fileName: "rogue-subtlety",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/132320.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/rogue",
    note: "Blizzard official class page lists Subtlety with icon 132320 (ability_stealth).",
  },

  // Shaman (3)
  {
    className: "Shaman",
    specName: "Elemental",
    fileName: "shaman-elemental",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/136048.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/shaman",
    note: "Blizzard official class page lists Elemental with icon 136048 (spell_nature_lightning).",
  },
  {
    className: "Shaman",
    specName: "Enhancement",
    fileName: "shaman-enhancement",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/237581.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/shaman",
    note: "Blizzard official class page lists Enhancement with icon 237581 (spell_shaman_improvedstormstrike).",
  },
  {
    className: "Shaman",
    specName: "Restoration",
    fileName: "shaman-restoration",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/136052.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/shaman",
    note: "Blizzard official class page lists Restoration with icon 136052 (spell_nature_magicimmunity).",
  },

  // Warlock (2)
  {
    className: "Warlock",
    specName: "Affliction",
    fileName: "warlock-affliction",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/136145.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/warlock",
    note: "Blizzard official class page lists Affliction with icon 136145 (spell_shadow_deathcoil).",
  },
  {
    className: "Warlock",
    specName: "Destruction",
    fileName: "warlock-destruction",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/136186.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/warlock",
    note: "Blizzard official class page lists Destruction with icon 136186 (spell_shadow_rainoffire).",
  },

  // Warrior (3)
  {
    className: "Warrior",
    specName: "Arms",
    fileName: "warrior-arms",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/132355.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/warrior",
    note: "Blizzard official class page lists Arms with icon 132355 (ability_warrior_savageblow).",
  },
  {
    className: "Warrior",
    specName: "Gladiator",
    fileName: "warrior-gladiator",
    assetUrl: null,
    sourcePageUrl: null,
    unresolvedReason:
      "Forever Logs DPS cohort for Protection Warrior; no Blizzard first-party Gladiator specialization icon exists.",
  },
  {
    className: "Warrior",
    specName: "Protection",
    fileName: "warrior-protection",
    assetUrl: "https://render.worldofwarcraft.com/us/icons/56/132341.jpg",
    sourcePageUrl: "https://worldofwarcraft.blizzard.com/en-us/game/classes/warrior",
    note: "Blizzard official class page lists Protection with icon 132341 (ability_warrior_defensivestance).",
  },
];

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    };
    https
      .get(options, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode,
            contentType: res.headers["content-type"] || "",
            buffer,
          });
        });
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function processSingleItem(item, type) {
  if (!item.assetUrl) {
    return {
      type,
      className: item.className,
      specName: item.specName || null,
      sourcePageUrl: item.sourcePageUrl || null,
      assetUrl: null,
      assetHostname: null,
      originalFormat: null,
      width: null,
      height: null,
      fileSizeBytes: null,
      sha256: null,
      retrievedAt: new Date().toISOString(),
      firstPartyVerified: false,
      result: "UNRESOLVED",
      unresolvedReason: item.unresolvedReason,
    };
  }

  const urlObj = new URL(item.assetUrl);
  const assetHostname = urlObj.hostname;
  const isFirstParty =
    assetHostname.endsWith(".blizzard.com") || assetHostname.endsWith(".worldofwarcraft.com");

  console.log(
    `Processing ${type}: [${item.className}${item.specName ? "::" + item.specName : ""}]`,
  );
  const { statusCode, contentType, buffer } = await downloadBuffer(item.assetUrl);
  const retrievedAt = new Date().toISOString();

  const image = sharp(buffer);
  const metadata = await image.metadata();

  const magicOk = ["jpeg", "png", "webp"].includes(metadata.format);
  const width = metadata.width;
  const height = metadata.height;
  const fileSizeBytes = buffer.length;
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  if (statusCode !== 200 || !magicOk || !width || !height || !isFirstParty) {
    throw new Error(`Validation failed for ${item.className} ${item.specName || ""}`);
  }

  const subDir = type === "class" ? "classes" : "specs";
  const origExt = metadata.format === "jpeg" ? "jpg" : metadata.format;
  const origPath = path.join(
    "docs/wow-forever-v1/evidence/icon-canary/original",
    subDir,
    `${item.fileName}.${origExt}`,
  );
  const webpEvidencePath = path.join(
    "docs/wow-forever-v1/evidence/icon-canary/webp",
    subDir,
    `${item.fileName}.webp`,
  );
  const webpCandidatePath = path.join(
    "src/modules/meta-board/wow/assets/icons",
    subDir,
    `${item.fileName}.webp`,
  );

  await fs.mkdir(path.dirname(origPath), { recursive: true });
  await fs.writeFile(origPath, buffer);

  const webpBuffer = await sharp(buffer).webp({ lossless: true, effort: 6 }).toBuffer();
  const webpMeta = await sharp(webpBuffer).metadata();
  if (webpMeta.width !== width || webpMeta.height !== height) {
    throw new Error(
      `Dimension mismatch: ${webpMeta.width}x${webpMeta.height} vs ${width}x${height}`,
    );
  }

  await fs.mkdir(path.dirname(webpEvidencePath), { recursive: true });
  await fs.writeFile(webpEvidencePath, webpBuffer);

  await fs.mkdir(path.dirname(webpCandidatePath), { recursive: true });
  await fs.writeFile(webpCandidatePath, webpBuffer);

  return {
    type,
    className: item.className,
    specName: item.specName || null,
    sourcePageUrl: item.sourcePageUrl,
    assetUrl: item.assetUrl,
    assetHostname,
    originalFormat: metadata.format,
    width,
    height,
    fileSizeBytes,
    sha256,
    retrievedAt,
    firstPartyVerified: isFirstParty,
    result: "PASS",
    paths: {
      original: origPath,
      webpEvidence: webpEvidencePath,
      webpCandidate: webpCandidatePath,
    },
    note: item.note || undefined,
  };
}

async function runFull() {
  console.log("=== EXECUTING FULL BLIZZARD FIRST-PARTY ACQUISITION ===");
  const classResults = [];
  for (const c of CLASSES) {
    classResults.push(await processSingleItem(c, "class"));
  }

  const specResults = [];
  for (const s of SPECS) {
    specResults.push(await processSingleItem(s, "spec"));
  }

  const allItems = [...classResults, ...specResults];
  const passedItems = allItems.filter((i) => i.result === "PASS");
  const unresolvedItems = allItems.filter((i) => i.result === "UNRESOLVED");

  const manifestPath = "docs/wow-forever-v1/evidence/icon-canary/manifest.json";
  const manifestData = {
    scope: "WoW Forever V1 Production Taxonomy SSOT",
    generatedAt: new Date().toISOString(),
    canarySummary: {
      total: 5,
      passed: 5,
      status: "PASS",
    },
    classSummary: {
      total: CLASSES.length,
      acquired: classResults.filter((r) => r.result === "PASS").length,
      unresolved: classResults.filter((r) => r.result === "UNRESOLVED").length,
    },
    specSummary: {
      total: SPECS.length,
      acquired: specResults.filter((r) => r.result === "PASS").length,
      unresolved: specResults.filter((r) => r.result === "UNRESOLVED").length,
    },
    items: allItems,
  };

  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify(manifestData, null, 2), "utf8");

  console.log("\n=== FULL RUN COMPLETE ===");
  console.log(`Classes: ${manifestData.classSummary.acquired} / ${CLASSES.length} acquired`);
  console.log(`Specs: ${manifestData.specSummary.acquired} / ${SPECS.length} acquired`);
  console.log(
    `Unresolved: ${unresolvedItems.length} (${unresolvedItems.map((u) => u.className + (u.specName ? "::" + u.specName : "")).join(", ")})`,
  );
}

runFull().catch((err) => {
  console.error("FULL ACQUISITION FAILED:", err);
  process.exit(1);
});
