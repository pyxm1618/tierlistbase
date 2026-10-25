import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import nextConfig from "../../../next.config";
import { siteConfig } from "@/config/site.config";
import { assertAllowedRelativeCallback } from "@/platform/auth/callback-url";
import { isAnalyticsLocationSafe } from "@/platform/analytics/events";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
it.skipIf(String(siteConfig.slug) !== "tierlistbase")(
  "enables production Google only, with notification email",
  async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("GA4_MEASUREMENT_ID", "G-TEST");
    vi.resetModules();
    const { featuresConfig } = await import("@/config/features.config");
    expect(featuresConfig.auth).toEqual({
      enabled: true,
      google: true,
      magicLink: false,
      password: false,
    });
    expect(featuresConfig.email.enabled).toBe(true);
  },
);
it("keeps Vanguard on the global camera-denied policy", async () => {
  const rules = await nextConfig.headers!();
  const baseline = rules
    .find((rule) => rule.source === "/:path*")
    ?.headers.find((header) => header.key === "Permissions-Policy")?.value;
  expect(baseline).toContain("camera=()");
  expect(rules.some((rule) => rule.source === "/wow-forever/vanguard")).toBe(false);
});
it("allows same-origin Vanguard OAuth return and rejects external return", () => {
  expect(assertAllowedRelativeCallback("/wow-forever/vanguard?seat=WOW-O-0001")).toBe(
    "/wow-forever/vanguard?seat=WOW-O-0001",
  );
  expect(() => assertAllowedRelativeCallback("//evil.example/wow-forever/vanguard")).toThrow();
});
it("allows validated seat and class query only, never text or account fields", () => {
  expect(
    isAnalyticsLocationSafe({
      pathname: "/wow-forever/vanguard",
      search: "?seat=WOW-O-0001",
      hash: "",
    }),
  ).toBe(true);
  expect(
    isAnalyticsLocationSafe({
      pathname: "/wow-forever/tier-list",
      search: "?class=Warrior",
      hash: "",
    }),
  ).toBe(true);
  expect(
    isAnalyticsLocationSafe({
      pathname: "/wow-forever/vanguard",
      search: "?seat=personal-name",
      hash: "",
    }),
  ).toBe(false);
  expect(
    isAnalyticsLocationSafe({
      pathname: "/wow-forever/vanguard",
      search: "?displayName=Vanguard",
      hash: "",
    }),
  ).toBe(false);
});
it("caches the final immutable audio files without caching the event HTML", async () => {
  const rules = await nextConfig.headers!();
  const audio = rules.find((rule) => rule.source === "/wow-forever/vanguard/audio/:path*");
  expect(audio?.headers.find((header) => header.key === "Cache-Control")?.value).toBe(
    "public, max-age=31536000, immutable",
  );
  expect(
    rules
      .find((rule) => rule.source === "/wow-forever/vanguard")
      ?.headers.some((header) => header.key === "Cache-Control"),
  ).toBeFalsy();
});

it("keeps Vanguard layout fetch compatible with Cloudflare Workers", () => {
  const source = readFileSync("src/config/vanguard-runtime.config.ts", "utf8");
  expect(source).not.toContain('cache: "force-cache"');
});

it("routes production Vanguard layout binaries through the Cloudflare asset binding", () => {
  const source = readFileSync("cloudflare-worker.ts", "utf8");
  expect(source).toContain("env.ASSETS.fetch(request)");
  expect(source).toContain("/wow-forever\\/vanguard\\/layouts");
  expect(source.indexOf("env.ASSETS.fetch(request)")).toBeLessThan(
    source.indexOf("return runWithRequestDatabase"),
  );
});
