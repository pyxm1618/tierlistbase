// Offline validation by default. --run explicitly sends the local 512px
// derivative to the existing Workers AI account; never publishes media or edits thresholds.
import { readFile, open } from "node:fs/promises";
import { z } from "zod";
import { dirname, resolve, extname } from "node:path";
import {
  validateVanguardCalibrationManifest,
  shouldRetryVanguardCalibrationTransportFailure,
  normalizeVanguardMaster,
  moderateVanguardImage,
  VanguardError,
  MODERATION_RISKS,
  VANGUARD_CALIBRATION_CATEGORIES,
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
const thresholdFile = option("thresholds");
const thresholdSchema = z.record(
  z.enum(MODERATION_RISKS),
  z
    .object({ approveBelow: z.number().min(0).max(1), rejectAt: z.number().min(0).max(1) })
    .strict()
    .refine((value) => value.approveBelow < value.rejectAt),
);
const candidate = thresholdFile
  ? thresholdSchema.safeParse(JSON.parse(await readFile(thresholdFile, "utf8")))
  : undefined;
if (candidate && !candidate.success) throw new Error("Invalid calibration thresholds");
const thresholds = candidate?.data ?? vanguardConfig.moderationThresholds;
// Reserve the report before any provider calls; never overwrite an earlier run.
const reportFile = output ? await open(output, "wx", 0o600) : undefined;
const results: Record<string, unknown>[] = [];
let failures = 0;
const report = () => ({
  mode: run ? "provider-sample-run" : "offline-input-validation",
  model: "@cf/cloudflare/clef-flash",
  thresholds,
  thresholdSource: thresholdFile ? "private-candidate" : "production-config",
  thresholdsCalibrated:
    run &&
    !thresholdFile &&
    thresholds !== null &&
    results.length === samples.length &&
    failures === 0 &&
    results.every((row) => row.correct === true),
  complete: results.length === samples.length,
  total: samples.length,
  samples: results,
  failures,
  correct: results.filter((row) => row.correct === true).length,
  falsePositives: results.filter((row) => row.expected === "approved" && row.actual === "rejected")
    .length,
  falseNegatives: results.filter((row) => row.expected === "rejected" && row.actual === "approved")
    .length,
  providerRetries: results.reduce(
    (count, row) =>
      count + (Array.isArray(row.attempts) ? Math.max(0, row.attempts.length - 1) : 0),
    0,
  ),
  uncertain: results.filter((row) => row.actual === "uncertain").length,
  categories: Object.fromEntries(
    VANGUARD_CALIBRATION_CATEGORIES.map((category) => [
      category,
      {
        total: samples.filter((row) => row.category === category).length,
        correct: results.filter((row) => row.category === category && row.correct === true).length,
      },
    ]),
  ),
  calibration: !run
    ? "NOT_RUN"
    : results.length !== samples.length
      ? "INCOMPLETE"
      : thresholds === null
        ? "UNCALIBRATED"
        : failures || results.some((row) => row.correct !== true)
          ? "FAIL"
          : "PASS",
});
async function checkpoint() {
  if (!reportFile) return;
  const bytes = Buffer.from(JSON.stringify(report(), null, 2));
  const { bytesWritten } = await reportFile.write(bytes, 0, bytes.length, 0);
  if (bytesWritten !== bytes.length) throw new Error("Calibration report write was incomplete");
  await reportFile.truncate(bytes.length);
}
await checkpoint();
for (const sample of samples) {
  const provider: { status: number | null; elapsedMs: number | null; errorName: string | null } = {
    status: null,
    elapsedMs: null,
    errorName: null,
  };
  const attempts: (typeof provider)[] = [];
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
    } else {
      let result: Awaited<ReturnType<typeof moderateVanguardImage>> | undefined;
      for (;;) {
        Object.assign(provider, { status: null, elapsedMs: null, errorName: null });
        try {
          result = await moderateVanguardImage({
            accountId: accountId!,
            token: token!,
            image: normalized.moderation,
            thresholds,
            fetch: async (url, init) => {
              const started = Date.now();
              try {
                // Isolate CLI sample requests after an aborted local/proxy connection.
                // The production provider request is unchanged.
                const headers = new Headers(init?.headers);
                headers.set("Connection", "close");
                const response = await fetch(url, { ...init, headers });
                provider.status = response.status;
                return response;
              } catch (error) {
                provider.errorName = error instanceof Error ? error.name : "UnknownError";
                throw error;
              } finally {
                provider.elapsedMs = Date.now() - started;
              }
            },
          });
          attempts.push({ ...provider });
          break;
        } catch (error) {
          attempts.push({ ...provider });
          if (!shouldRetryVanguardCalibrationTransportFailure(provider, attempts.length))
            throw error;
          console.error(`Transport retry ${attempts.length}/2: ${sample.id}`);
          await new Promise((resolve) => setTimeout(resolve, attempts.length * 1000));
        }
      }
      if (!result) throw new VanguardError("MODERATION_UNAVAILABLE", 503);
      results.push({
        id: sample.id,
        category: sample.category,
        expected: sample.expected,
        ...result,
        actual: result.decision,
        provider,
        attempts,
        thresholds,
        correct: result.decision === sample.expected,
      });
    }
  } catch (error) {
    failures++;
    results.push({
      id: sample.id,
      category: sample.category,
      expected: sample.expected,
      actual: "provider-or-input-failure",
      provider,
      attempts,
      thresholds,
      correct: false,
      status: "failed",
      code: error instanceof VanguardError ? error.code : "CALIBRATION_INPUT_OR_PROVIDER_FAILED",
    });
  }
  await checkpoint();
  console.error(`Calibration ${results.length}/${samples.length}: ${sample.id}`);
}
await reportFile?.close();
console.log(JSON.stringify(report()));
if (failures || (run && report().calibration !== "PASS")) process.exitCode = 1;
