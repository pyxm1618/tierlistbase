import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import {
  validateVanguardCalibrationManifest,
  VANGUARD_CALIBRATION_CATEGORIES,
  shouldRetryVanguardCalibrationTransportFailure,
} from "@/modules/wow-vanguard";
const samples = VANGUARD_CALIBRATION_CATEGORIES.map((category, index) => ({
  id: `sample-${index}`,
  category,
  expected: index < 4 ? "approved" : "rejected",
  file: `private-${index}.webp`,
  mime: "image/webp",
}));
it("requires all eight real-sample categories and explicit human labels", () => {
  expect(validateVanguardCalibrationManifest({ samples })).toHaveLength(8);
  expect(() => validateVanguardCalibrationManifest({ samples: samples.slice(1) })).toThrow();
  expect(() =>
    validateVanguardCalibrationManifest({
      samples: samples.map((sample, index) =>
        index === 7 ? { ...sample, category: "qr" } : sample,
      ),
    }),
  ).toThrow("missing");
});
it("rejects duplicate IDs and unknown fields instead of inventing results", () => {
  expect(() =>
    validateVanguardCalibrationManifest({
      samples: samples.map((sample) => ({ ...sample, id: "same" })),
    }),
  ).toThrow("unique");
  expect(() => validateVanguardCalibrationManifest({ samples, approved: true })).toThrow();
});

it("refuses report overwrite and invalid candidate thresholds before processing images", () => {
  const directory = mkdtempSync(join(tmpdir(), "vanguard-calibration-"));
  try {
    const manifest = join(directory, "samples.json");
    const output = join(directory, "report.json");
    const thresholds = join(directory, "thresholds.json");
    writeFileSync(manifest, JSON.stringify({ samples }));
    writeFileSync(output, "preserved report");
    writeFileSync(
      thresholds,
      JSON.stringify({ graphic_gore: { approveBelow: 0.9, rejectAt: 0.1 } }),
    );
    const collision = spawnSync(
      "bun",
      ["scripts/calibrate-vanguard.ts", `--manifest=${manifest}`, `--output=${output}`],
      { encoding: "utf8" },
    );
    expect(collision.status).not.toBe(0);
    expect(collision.stderr).toContain("EEXIST");
    expect(readFileSync(output, "utf8")).toBe("preserved report");
    const invalid = spawnSync(
      "bun",
      ["scripts/calibrate-vanguard.ts", `--manifest=${manifest}`, `--thresholds=${thresholds}`],
      { encoding: "utf8" },
    );
    expect(invalid.status).not.toBe(0);
    expect(invalid.stderr).toContain("Invalid calibration thresholds");
    const failedReport = join(directory, "failed-report.json");
    const failed = spawnSync(
      "bun",
      ["scripts/calibrate-vanguard.ts", `--manifest=${manifest}`, `--output=${failedReport}`],
      { encoding: "utf8" },
    );
    expect(failed.status).not.toBe(0);
    const report = JSON.parse(readFileSync(failedReport, "utf8"));
    expect(report.complete).toBe(true);
    expect(report.samples).toHaveLength(8);
    expect(report.failures).toBe(8);
    expect(report.providerRetries).toBe(0);
    expect(report.calibration).toBe("NOT_RUN");
    expect(report.samples.every((row: { correct: boolean }) => row.correct === false)).toBe(true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

it("bounds calibration retries to transport failures before any HTTP response", () => {
  expect(
    shouldRetryVanguardCalibrationTransportFailure({ status: null, errorName: "TypeError" }, 1),
  ).toBe(true);
  expect(
    shouldRetryVanguardCalibrationTransportFailure({ status: null, errorName: "TimeoutError" }, 2),
  ).toBe(true);
  expect(
    shouldRetryVanguardCalibrationTransportFailure({ status: null, errorName: "TypeError" }, 3),
  ).toBe(false);
  for (const status of [200, 429, 500, 503]) {
    expect(
      shouldRetryVanguardCalibrationTransportFailure({ status, errorName: "TypeError" }, 1),
    ).toBe(false);
  }
  expect(shouldRetryVanguardCalibrationTransportFailure({ status: null, errorName: null }, 1)).toBe(
    false,
  );
});
