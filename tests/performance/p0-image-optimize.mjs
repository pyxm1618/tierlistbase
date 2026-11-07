import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const zzzRoot = path.join(root, "src/modules/zenless-zone-zero-tier-list/assets");
const nikkeRoot = path.join(root, "src/modules/nikke-tier-list/assets");
const manifestPath = path.join(root, "zzz-asset-manifest.json");
const zzzIconsPath = path.join(root, "src/modules/zenless-zone-zero-tier-list/icons.ts");
const nikkeAvatarsPath = path.join(root, "src/modules/nikke-tier-list/character-avatars.ts");
const nikkeAvatarTestPath = path.join(root, "tests/unit/nikke/character-avatars.test.ts");
const reportPath = "/tmp/p0-image-report.json";

const policies = {
  zzzAgents: { dir: path.join(zzzRoot, "agents"), maxDimension: 192, quality: 92 },
  zzzWEngines: { dir: path.join(zzzRoot, "w-engines"), maxDimension: 96, quality: 92 },
  zzzBangboo: { dir: path.join(zzzRoot, "bangboo"), maxDimension: 96, quality: 92 },
  zzzTeams: { dir: path.join(zzzRoot, "teams"), maxDimension: 1536, quality: 92 },
  nikkeAvatars: { dir: path.join(nikkeRoot, "avatars"), maxDimension: 320, quality: 92 },
};

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

function posix(filePath) {
  return filePath.split(path.sep).join("/");
}

function repoPath(filePath) {
  return posix(path.relative(root, filePath));
}

async function walkImages(dir) {
  const out = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) out.push(full);
    }
  }
  await walk(dir);
  return out.sort();
}

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}

async function inspectFile(filePath) {
  const [meta, s] = await Promise.all([sharp(filePath).metadata(), stat(filePath)]);
  return {
    path: repoPath(filePath),
    format: (meta.format ?? path.extname(filePath).slice(1)).toLowerCase(),
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    bytes: s.size,
    hasAlpha: Boolean(meta.hasAlpha),
    sha256: await sha256(filePath),
  };
}

async function auditDir(dir) {
  const files = await walkImages(dir);
  return Promise.all(files.map(inspectFile));
}

function summarize(entries) {
  if (entries.length === 0) {
    return { count: 0, totalBytes: 0, largestFile: null, largestDimensions: null };
  }
  const largestFile = [...entries].sort((a, b) => b.bytes - a.bytes)[0];
  const largestDimensions = [...entries].sort(
    (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height),
  )[0];
  return {
    count: entries.length,
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    largestFile,
    largestDimensions,
  };
}

function moduleImportPath(repoFile, moduleDir) {
  return "./" + posix(path.relative(path.join(root, moduleDir), path.join(root, repoFile)));
}

async function encodeCandidate(input, output, maxDimension, quality, lossless = false) {
  const temp = output + ".tmp";
  await rm(temp, { force: true });
  await sharp(input)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .toColourspace("srgb")
    .webp({
      quality,
      alphaQuality: 100,
      effort: 6,
      lossless,
      nearLossless: false,
      smartSubsample: true,
    })
    .toFile(temp);
  return temp;
}

async function compareVisual(input, encoded, maxDimension) {
  const reference = await sharp(input)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .toColourspace("srgb")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const candidate = await sharp(encoded)
    .toColourspace("srgb")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (
    reference.info.width !== candidate.info.width ||
    reference.info.height !== candidate.info.height ||
    reference.info.channels !== candidate.info.channels
  ) {
    throw new Error("Visual verification dimension mismatch for " + input);
  }
  let rgbAbs = 0;
  let rgbSamples = 0;
  let alphaAbs = 0;
  const pixels = reference.info.width * reference.info.height;
  for (let i = 0; i < reference.data.length; i += 4) {
    const refAlpha = reference.data[i + 3];
    const outAlpha = candidate.data[i + 3];
    alphaAbs += Math.abs(refAlpha - outAlpha);
    const refWeight = refAlpha / 255;
    const outWeight = outAlpha / 255;
    rgbAbs += Math.abs(reference.data[i] * refWeight - candidate.data[i] * outWeight);
    rgbAbs += Math.abs(reference.data[i + 1] * refWeight - candidate.data[i + 1] * outWeight);
    rgbAbs += Math.abs(reference.data[i + 2] * refWeight - candidate.data[i + 2] * outWeight);
    rgbSamples += 3;
  }
  return {
    rgbMae: rgbSamples ? rgbAbs / rgbSamples : 0,
    alphaMae: pixels ? alphaAbs / pixels : 0,
    width: reference.info.width,
    height: reference.info.height,
  };
}

async function transformOne(input, policy) {
  const ext = path.extname(input);
  const output = path.join(path.dirname(input), path.basename(input, ext) + ".webp");
  let selectedTemp = "";
  let selectedDiff = null;
  let selectedQuality = policy.quality;
  let lossless = false;

  for (const quality of [policy.quality, 95, 98]) {
    const temp = await encodeCandidate(input, output, policy.maxDimension, quality, false);
    const diff = await compareVisual(input, temp, policy.maxDimension);
    if (diff.rgbMae <= 8 && diff.alphaMae <= 0.6) {
      selectedTemp = temp;
      selectedDiff = diff;
      selectedQuality = quality;
      break;
    }
    await rm(temp, { force: true });
  }

  if (!selectedTemp) {
    const temp = await encodeCandidate(input, output, policy.maxDimension, 100, true);
    selectedTemp = temp;
    selectedDiff = await compareVisual(input, temp, policy.maxDimension);
    selectedQuality = 100;
    lossless = true;
  }

  const before = await inspectFile(input);
  if (output === input) {
    await rename(selectedTemp, output);
  } else {
    await rm(output, { force: true });
    await rename(selectedTemp, output);
    await unlink(input);
  }
  const after = await inspectFile(output);

  if (Math.max(after.width, after.height) > policy.maxDimension) {
    throw new Error("Dimension policy failed for " + after.path);
  }
  if (selectedDiff.alphaMae > 0.6 || selectedDiff.rgbMae > 8) {
    throw new Error("Visual fidelity threshold failed for " + after.path + ": " + JSON.stringify(selectedDiff));
  }

  return { before, after, quality: selectedQuality, lossless, visualDiff: selectedDiff };
}

async function transformCategory(policy) {
  const files = await walkImages(policy.dir);
  const transformed = [];
  for (const file of files) transformed.push(await transformOne(file, policy));
  return transformed;
}

function buildMapping(transformations) {
  return new Map(transformations.map((item) => [item.before.path, item]));
}

async function updateImports(filePath, moduleDir, transformations) {
  let content = await readFile(filePath, "utf8");
  for (const item of transformations) {
    if (item.before.path === item.after.path) continue;
    const oldImport = moduleImportPath(item.before.path, moduleDir);
    const newImport = moduleImportPath(item.after.path, moduleDir);
    content = content.split(oldImport).join(newImport);
  }
  await writeFile(filePath, content);
}

function walkObject(value, visit) {
  if (!value || typeof value !== "object") return;
  visit(value);
  if (Array.isArray(value)) {
    for (const child of value) walkObject(child, visit);
  } else {
    for (const child of Object.values(value)) walkObject(child, visit);
  }
}

async function updateZzzManifest(mapping) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const referencedFiles = new Set();
  let metadataUpdated = 0;
  let referenceOnlyUpdated = 0;

  walkObject(manifest, (entry) => {
    if (typeof entry.filename !== "string") return;
    const item = mapping.get(entry.filename);
    if (!item) return;

    referencedFiles.add(item.before.path);
    entry.filename = item.after.path;

    const hasAssetMetadata =
      "sha256" in entry ||
      "byteSize" in entry ||
      "resolution" in entry ||
      "format" in entry ||
      "verified" in entry;

    if (!hasAssetMetadata) {
      referenceOnlyUpdated += 1;
      return;
    }

    entry.resolution = { width: item.after.width, height: item.after.height };
    entry.format = "WebP";
    entry.byteSize = item.after.bytes;
    entry.sha256 = item.after.sha256;
    entry.productionTransformation = "resize + WebP encode";
    metadataUpdated += 1;
  });

  if (referencedFiles.size !== mapping.size) {
    throw new Error(
      "ZZZ manifest does not cover every transformed production asset: " +
        referencedFiles.size +
        "/" +
        mapping.size,
    );
  }
  if (metadataUpdated < mapping.size) {
    throw new Error(
      "ZZZ manifest metadata coverage is incomplete: " + metadataUpdated + "/" + mapping.size,
    );
  }
  if (referenceOnlyUpdated === 0) {
    throw new Error("Expected shared ZZZ filename references to be migrated");
  }

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

function byteGate(maxBytes) {
  return Math.ceil((maxBytes * 1.25) / 4096) * 4096;
}

function maxBytes(entries) {
  return Math.max(...entries.map((entry) => entry.bytes));
}

async function writeZzzGate(afterByCategory) {
  const gatePath = path.join(root, "tests/unit/zenless-zone-zero-tier-list/image-performance.test.ts");
  const limits = {
    agents: byteGate(maxBytes(afterByCategory.agents)),
    wEngines: byteGate(maxBytes(afterByCategory.wEngines)),
    bangboo: byteGate(maxBytes(afterByCategory.bangboo)),
    teams: byteGate(maxBytes(afterByCategory.teams)),
  };
  const content =
    'import { createHash } from "node:crypto";\n' +
    'import { readdirSync, readFileSync, statSync } from "node:fs";\n' +
    'import path from "node:path";\n\n' +
    'import sharp from "sharp";\n' +
    'import { describe, expect, it } from "vitest";\n\n' +
    'const root = path.resolve(new URL("../../..", import.meta.url).pathname);\n' +
    'const assetsRoot = path.join(root, "src/modules/zenless-zone-zero-tier-list/assets");\n' +
    'const manifest = JSON.parse(readFileSync(path.join(root, "zzz-asset-manifest.json"), "utf8")) as Record<string, unknown>;\n\n' +
    'const policies = ' +
    JSON.stringify(
      {
        agents: { maxDimension: 192, maxBytes: limits.agents },
        "w-engines": { maxDimension: 96, maxBytes: limits.wEngines },
        bangboo: { maxDimension: 96, maxBytes: limits.bangboo },
        teams: { maxDimension: 1536, maxBytes: limits.teams },
      },
      null,
      2,
    ) +
    ' as const;\n\n' +
    'describe("ZZZ production image performance gate", () => {\n' +
    '  for (const [category, policy] of Object.entries(policies)) {\n' +
    '    it(category + " stays within production image budgets", async () => {\n' +
    '      const dir = path.join(assetsRoot, category);\n' +
    '      const files = readdirSync(dir).filter((file) => !file.startsWith("."));\n' +
    '      expect(files.length).toBeGreaterThan(0);\n' +
    '      for (const file of files) {\n' +
    '        expect(path.extname(file)).toBe(".webp");\n' +
    '        const full = path.join(dir, file);\n' +
    '        expect(statSync(full).size).toBeLessThanOrEqual(policy.maxBytes);\n' +
    '        const metadata = await sharp(full).metadata();\n' +
    '        expect(Math.max(metadata.width ?? 0, metadata.height ?? 0)).toBeLessThanOrEqual(policy.maxDimension);\n' +
    '      }\n' +
    '    });\n' +
    '  }\n\n' +
    '  it("keeps reviewed provenance while matching transformed production files", async () => {\n' +
    '    const groups = ["agentPortraits", "bangboo", "wEngines", "teamVisuals"] as const;\n' +
    '    for (const group of groups) {\n' +
    '      const entries = manifest[group] as Array<Record<string, unknown>>;\n' +
    '      for (const entry of entries) {\n' +
    '        expect(entry.verified).toBe(true);\n' +
    '        expect(entry.reviewState).toBe("approved/pass");\n' +
    '        expect(entry.sourceURL).toBeTruthy();\n' +
    '        expect(entry.sourcePage).toBeTruthy();\n' +
    '        expect(entry.sourceType).toBeTruthy();\n' +
    '        if (group === "agentPortraits") {\n' +
    '          expect(entry.identitySource).toBeTruthy();\n' +
    '          expect(entry.officialSourceName).toBeTruthy();\n' +
    '        }\n' +
    '        expect(entry.productionTransformation).toBe("resize + WebP encode");\n' +
    '        expect(entry.format).toBe("WebP");\n' +
    '        const filename = String(entry.filename);\n' +
    '        const bytes = readFileSync(path.join(root, filename));\n' +
    '        expect(bytes.byteLength).toBe(entry.byteSize);\n' +
    '        expect(createHash("sha256").update(bytes).digest("hex")).toBe(entry.sha256);\n' +
    '        const metadata = await sharp(path.join(root, filename)).metadata();\n' +
    '        expect({ width: metadata.width, height: metadata.height }).toEqual(entry.resolution);\n' +
    '      }\n' +
    '    }\n' +
    '  });\n' +
    '});\n';
  await mkdir(path.dirname(gatePath), { recursive: true });
  await writeFile(gatePath, content);
  return limits;
}

async function writeNikkeGate(afterEntries) {
  const gatePath = path.join(root, "tests/unit/nikke/image-performance.test.ts");
  const limit = byteGate(maxBytes(afterEntries));
  const content =
    'import { readdirSync, statSync } from "node:fs";\n' +
    'import path from "node:path";\n\n' +
    'import sharp from "sharp";\n' +
    'import { describe, expect, it } from "vitest";\n\n' +
    'const avatarsDir = path.resolve(new URL("../../../src/modules/nikke-tier-list/assets/avatars", import.meta.url).pathname);\n' +
    "const MAX_DIMENSION = 320;\n" +
    "const MAX_BYTES = " +
    limit +
    ";\n\n" +
    'describe("NIKKE avatar production image performance gate", () => {\n' +
    '  it("keeps all 203 avatars within the 2x feature-image budget", async () => {\n' +
    '    const files = readdirSync(avatarsDir).filter((file) => !file.startsWith("."));\n' +
    '    expect(files).toHaveLength(203);\n' +
    '    for (const file of files) {\n' +
    '      expect(path.extname(file)).toBe(".webp");\n' +
    '      const full = path.join(avatarsDir, file);\n' +
    '      expect(statSync(full).size).toBeLessThanOrEqual(MAX_BYTES);\n' +
    '      const metadata = await sharp(full).metadata();\n' +
    '      expect(Math.max(metadata.width ?? 0, metadata.height ?? 0)).toBeLessThanOrEqual(MAX_DIMENSION);\n' +
    '    }\n' +
    '  });\n' +
    '});\n';
  await writeFile(gatePath, content);
  return limit;
}

function maxVisualDiff(transformations) {
  return transformations.reduce(
    (acc, item) => {
      const worse =
        item.visualDiff.rgbMae > acc.rgbMae || item.visualDiff.alphaMae > acc.alphaMae;
      return {
        rgbMae: Math.max(acc.rgbMae, item.visualDiff.rgbMae),
        alphaMae: Math.max(acc.alphaMae, item.visualDiff.alphaMae),
        file: worse ? item.after.path : acc.file,
      };
    },
    { rgbMae: 0, alphaMae: 0, file: "" },
  );
}

async function hashNonTargetFiles() {
  const allZzz = await walkImages(zzzRoot);
  const allNikke = await walkImages(nikkeRoot);
  const targetPrefixes = [
    repoPath(policies.zzzAgents.dir) + "/",
    repoPath(policies.zzzWEngines.dir) + "/",
    repoPath(policies.zzzBangboo.dir) + "/",
    repoPath(policies.zzzTeams.dir) + "/",
    repoPath(policies.nikkeAvatars.dir) + "/",
  ];
  const nonTarget = [...allZzz, ...allNikke].filter((file) => {
    const rel = repoPath(file);
    return !targetPrefixes.some((prefix) => rel.startsWith(prefix));
  });
  const hashes = {};
  for (const file of nonTarget) hashes[repoPath(file)] = await sha256(file);
  return hashes;
}

async function assertHashesUnchanged(before) {
  for (const [rel, hash] of Object.entries(before)) {
    const file = path.join(root, rel);
    if (!existsSync(file)) throw new Error("Untargeted asset disappeared: " + rel);
    const after = await sha256(file);
    if (after !== hash) throw new Error("Untargeted asset changed: " + rel);
  }
}

const beforeUntargetedHashes = await hashNonTargetFiles();
const beforeWEnginesEntries = await auditDir(policies.zzzWEngines.dir);
const before = {
  zzzTotal: summarize(await auditDir(zzzRoot)),
  agents: summarize(await auditDir(policies.zzzAgents.dir)),
  wEngines: summarize(beforeWEnginesEntries),
  bangboo: summarize(await auditDir(policies.zzzBangboo.dir)),
  teams: summarize(await auditDir(policies.zzzTeams.dir)),
  nikkeAvatars: summarize(await auditDir(policies.nikkeAvatars.dir)),
};
const beforePuzzle = beforeWEnginesEntries.find((x) => x.path.endsWith("/puzzle-sphere.png"));
const beforeRadiowave = beforeWEnginesEntries.find((x) =>
  x.path.endsWith("/radiowave-journey.png"),
);

const zzzAgents = await transformCategory(policies.zzzAgents);
const zzzWEngines = await transformCategory(policies.zzzWEngines);
const zzzBangboo = await transformCategory(policies.zzzBangboo);
const zzzTeams = await transformCategory(policies.zzzTeams);
const nikkeAvatars = await transformCategory(policies.nikkeAvatars);

const zzzTransforms = [...zzzAgents, ...zzzWEngines, ...zzzBangboo, ...zzzTeams];
await updateImports(
  zzzIconsPath,
  "src/modules/zenless-zone-zero-tier-list",
  zzzTransforms,
);
await updateImports(nikkeAvatarsPath, "src/modules/nikke-tier-list", nikkeAvatars);
await updateZzzManifest(buildMapping(zzzTransforms));

let nikkeTest = await readFile(nikkeAvatarTestPath, "utf8");
nikkeTest = nikkeTest.replace(
  'expect(file.endsWith(".png")).toBe(true);',
  'expect(file.endsWith(".webp")).toBe(true);',
);
await writeFile(nikkeAvatarTestPath, nikkeTest);

const afterEntries = {
  agents: await auditDir(policies.zzzAgents.dir),
  wEngines: await auditDir(policies.zzzWEngines.dir),
  bangboo: await auditDir(policies.zzzBangboo.dir),
  teams: await auditDir(policies.zzzTeams.dir),
  nikkeAvatars: await auditDir(policies.nikkeAvatars.dir),
};
const zzzGateBytes = await writeZzzGate(afterEntries);
const nikkeGateBytes = await writeNikkeGate(afterEntries.nikkeAvatars);
await assertHashesUnchanged(beforeUntargetedHashes);

const after = {
  zzzTotal: summarize(await auditDir(zzzRoot)),
  agents: summarize(afterEntries.agents),
  wEngines: summarize(afterEntries.wEngines),
  bangboo: summarize(afterEntries.bangboo),
  teams: summarize(afterEntries.teams),
  nikkeAvatars: summarize(afterEntries.nikkeAvatars),
};
const afterPuzzle = afterEntries.wEngines.find((x) => x.path.endsWith("/puzzle-sphere.webp"));
const afterRadiowave = afterEntries.wEngines.find((x) =>
  x.path.endsWith("/radiowave-journey.webp"),
);

const zzzReduction = 1 - after.zzzTotal.totalBytes / before.zzzTotal.totalBytes;
const nikkeReduction = 1 - after.nikkeAvatars.totalBytes / before.nikkeAvatars.totalBytes;

if (zzzReduction < 0.5) throw new Error("ZZZ total image reduction below 50%: " + zzzReduction);
if (nikkeReduction < 0.7) throw new Error("NIKKE avatar reduction below 70%: " + nikkeReduction);
if (after.nikkeAvatars.count !== 203) throw new Error("NIKKE avatar count changed");
if (after.agents.count !== 61) throw new Error("ZZZ agent count changed");
if (after.wEngines.count !== 77) throw new Error("ZZZ W-Engine count changed");
if (after.bangboo.count !== 18) throw new Error("ZZZ Bangboo count changed");
if (after.teams.count !== 9) throw new Error("ZZZ team visual count changed");

const report = {
  policies: {
    zzzAgents: { maxCssPx: 80, maxDpr: 2, productionMaxDimension: 192, format: "WebP alpha" },
    zzzWEngines: { maxCssPx: 35, maxDpr: 2, productionMaxDimension: 96, format: "WebP alpha" },
    zzzBangboo: { maxCssPx: 35, maxDpr: 2, productionMaxDimension: 96, format: "WebP alpha" },
    zzzTeams: {
      maxElementWidthCssPx: 1080,
      maxVisualHeightCssPx: 160,
      declaredSizes: "(max-width: 1080px) 100vw, 700px",
      maxDpr: 2,
      productionMaxDimension: 1536,
      format: "WebP alpha",
      resizeMode: "inside, without enlargement",
    },
    nikkeAvatars: {
      maxCssPx: 132,
      declaredSizesMaxCssPx: 256,
      maxDpr: 2,
      productionMaxDimension: 320,
      format: "WebP alpha",
    },
  },
  before,
  after,
  reductions: { zzzTotal: zzzReduction, nikkeAvatars: nikkeReduction },
  namedAssets: {
    puzzleSphere: { before: beforePuzzle, after: afterPuzzle },
    radiowaveJourney: { before: beforeRadiowave, after: afterRadiowave },
  },
  visualDiff: {
    zzz: maxVisualDiff(zzzTransforms),
    nikke: maxVisualDiff(nikkeAvatars),
    threshold: { rgbMae: 8, alphaMae: 0.6 },
  },
  gates: { zzzMaxBytes: zzzGateBytes, nikkeMaxBytes: nikkeGateBytes },
};

await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log("P0_IMAGE_REPORT_START");
console.log(JSON.stringify(report));
console.log("P0_IMAGE_REPORT_END");
