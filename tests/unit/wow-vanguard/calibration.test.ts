import { expect, it } from "vitest";
import {
  validateVanguardCalibrationManifest,
  VANGUARD_CALIBRATION_CATEGORIES,
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
