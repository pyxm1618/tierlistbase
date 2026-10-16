import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { legalConfig } from "@/config/legal.config";
import { loadRuntimeEnv } from "@/platform/config/load-runtime-config";
import { validateLegalConfig } from "@/platform/legal/validate-legal-config";

describe("production GA4 configuration and fact sync", () => {
  it("wrangler.jsonc sets production vars with GA4_MEASUREMENT_ID G-TBL00RRKY6", () => {
    const raw = readFileSync("wrangler.jsonc", "utf8");
    // Strip simple comments or parse JSON
    const stripped = raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "$1").trim();
    // remove trailing commas for JSON.parse
    const sanitized = stripped.replace(/,\s*([\]}])/g, "$1");
    const parsed = JSON.parse(sanitized);

    expect(parsed.vars).toBeDefined();
    expect(parsed.vars.APP_ENV).toBe("production");
    expect(parsed.vars.APP_ORIGIN).toBe("https://www.tierlistbase.com");
    expect(parsed.vars.GA4_MEASUREMENT_ID).toBe("G-TBL00RRKY6");
  });

  it("runtime configuration enforces GA4_MEASUREMENT_ID only in production", () => {
    const baseProductionEnv = {
      APP_ENV: "production",
      APP_ORIGIN: "https://www.tierlistbase.com",
      DATABASE_URL: "postgres://user:pass@db.example.com:5432/app",
      BETTER_AUTH_SECRET: "a".repeat(48),
      CRON_SECRET: "b".repeat(32),
    };

    const productionFeatures = {
      auth: { enabled: false, google: false, magicLink: false, password: false },
      email: { enabled: false },
      commerce: { enabled: false, oneTime: false, subscriptions: false, credits: false },
      analytics: { enabled: true, ga4: true, clarity: false, consentRequired: true },
    } as const;

    // Fails closed if GA4_MEASUREMENT_ID is missing
    expect(() => loadRuntimeEnv(baseProductionEnv, productionFeatures)).toThrow(
      /GA4 configuration/,
    );

    // Succeeds when GA4_MEASUREMENT_ID is provided
    const validEnv = loadRuntimeEnv(
      {
        ...baseProductionEnv,
        GA4_MEASUREMENT_ID: "G-TBL00RRKY6",
      },
      productionFeatures,
    );
    expect(validEnv.ga4MeasurementId).toBe("G-TBL00RRKY6");
    expect(validEnv.clarityProjectId).toBeUndefined();

    // Local / staging / non-production does not require GA4_MEASUREMENT_ID
    const nonProductionFeatures = {
      ...productionFeatures,
      analytics: { enabled: false, ga4: false, clarity: false, consentRequired: true },
    };
    const nonProdEnv = loadRuntimeEnv(
      {
        ...baseProductionEnv,
        APP_ENV: "staging",
      },
      nonProductionFeatures,
    );
    expect(nonProdEnv.ga4MeasurementId).toBeUndefined();
  });

  it("legal configuration includes Google Analytics processor disclosure and accurate consent privacy disclosures", () => {
    const gaProcessor = legalConfig.processors.find((p) => p.name === "Google Analytics");
    expect(gaProcessor).toBeDefined();
    expect(gaProcessor?.privacyUrl).toBe("https://policies.google.com/privacy");

    // validateLegalConfig passes with ga4 enabled
    expect(() =>
      validateLegalConfig({
        legal: legalConfig,
        features: {
          ga4: true,
          clarity: false,
        },
        releaseMode: true,
      }),
    ).not.toThrow();

    // Privacy disclosures reflect GA4 consent-only behavior and clarity disabled
    const privacyTexts = legalConfig.content.privacy
      .flatMap((section) => section.paragraphs)
      .join(" ");

    expect(privacyTexts).toContain("Google Analytics (GA4)");
    expect(privacyTexts).toContain("explicit consent");
    expect(privacyTexts).toContain("Microsoft Clarity is not enabled");
    expect(privacyTexts).not.toContain(
      "Google Analytics and Microsoft Clarity are not currently loaded",
    );
  });

  it("featuresConfig enables GA4 only in production when GA4_MEASUREMENT_ID is supplied", async () => {
    const originalAppEnv = process.env.APP_ENV;
    const originalGa4 = process.env.GA4_MEASUREMENT_ID;

    try {
      vi.resetModules();
      process.env.APP_ENV = "production";
      process.env.GA4_MEASUREMENT_ID = "G-TBL00RRKY6";
      const { featuresConfig: prodConfig } = await import("@/config/features.config");
      expect(prodConfig.analytics.enabled).toBe(true);
      expect(prodConfig.analytics.ga4).toBe(true);
      expect(prodConfig.analytics.clarity).toBe(false);
      expect(prodConfig.analytics.consentRequired).toBe(true);

      // Without GA4_MEASUREMENT_ID
      vi.resetModules();
      delete process.env.GA4_MEASUREMENT_ID;
      const { featuresConfig: fallbackConfig } = await import("@/config/features.config");
      expect(fallbackConfig.analytics.enabled).toBe(false);
      expect(fallbackConfig.analytics.ga4).toBe(false);
    } finally {
      process.env.APP_ENV = originalAppEnv;
      if (originalGa4 !== undefined) process.env.GA4_MEASUREMENT_ID = originalGa4;
      else delete process.env.GA4_MEASUREMENT_ID;
      vi.resetModules();
    }
  });
});
