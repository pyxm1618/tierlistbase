import { afterEach, expect, it, vi } from "vitest";
import nextConfig from "../../../next.config";
import { assertAllowedRelativeCallback } from "@/platform/auth/callback-url";
import { isAnalyticsLocationSafe } from "@/platform/analytics/events";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
it("enables production Google only, with notification email", async () => {
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
});
it("allows only Vanguard camera override", async () => {
  const rules = await nextConfig.headers!();
  const policy = (path: string) =>
    rules
      .filter((rule) => rule.source === "/:path*" || rule.source === path)
      .flatMap((rule) => rule.headers)
      .filter((h) => h.key === "Permissions-Policy")
      .at(-1)?.value;
  expect(policy("/wow-forever/vanguard")).toContain("camera=(self)");
  expect(policy("/privacy")).toContain("camera=()");
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
