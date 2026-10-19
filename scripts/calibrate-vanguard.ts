// Offline validation by default. --run explicitly sends the local 512px
// derivative to the existing Workers AI account; never publishes media or edits thresholds.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, extname } from "node:path";
import {
  validateVanguardCalibrationManifest,
  normalizeVanguardMaster,
  moderateVanguardImage,
  VanguardError,
} from "@/modules/wow-vanguard";
import { vanguardConfig } from "@/config/vanguard.config";
const option = (name: string) =>
  process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const manifest = option("manifest");
if (!manifest)
  throw new Error(
    "Supply --manifest=/private/path/samples.json; --run is required for provider calls",
  );
const samples = validateVanguardCalibrationManifest(JSON.parse(await readFile(manifest, "utf8")));
const run = process.argv.includes("--run");
const output = option("output");
if (run && (!output || extname(output) !== ".json"))
  throw new Error("Provider run requires a private --output=report.json");
const accountId = process.env.VANGUARD_CLOUDFLARE_ACCOUNT_ID;
const token = process.env.VANGUARD_WORKERS_AI_TOKEN;
if (run && (!accountId || !/^[a-f0-9]{32}$/.test(accountId) || !token))
  throw new Error("Workers AI account/token configuration is missing or invalid");
const results: unknown[] = [];
let failures = 0;
for (const sample of samples) {
  try {
    const bytes = await readFile(resolve(dirname(manifest), sample.file));
    const normalized = await normalizeVanguardMaster(bytes, sample.mime);
    if (!run) {
      results.push({
        id: sample.id,
        category: sample.category,
        input: "validated",
        provider: "NOT_RUN",
      });
      continue;
    }
    const result = await moderateVanguardImage({
      accountId: accountId!,
      token: token!,
      image: normalized.moderation,
      thresholds: vanguardConfig.moderationThresholds,
    });
    results.push({
      id: sample.id,
      category: sample.category,
      expected: sample.expected,
      ...result,
    });
  } catch (error) {
    failures++;
    results.push({
      id: sample.id,
      category: sample.category,
      status: "failed",
      code: error instanceof VanguardError ? error.code : "CALIBRATION_INPUT_OR_PROVIDER_FAILED",
    });
  }
}
const report = {
  mode: run ? "provider-sample-run" : "offline-input-validation",
  thresholdsCalibrated: vanguardConfig.moderationThresholds !== null,
  samples: results,
  failures,
};
if (output) await writeFile(output, JSON.stringify(report, null, 2), { flag: "wx", mode: 0o600 });
console.log(JSON.stringify(report));
if (failures) process.exitCode = 1;
