import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy } from "@/platform/security/content-security-policy";

describe("buildContentSecurityPolicy", () => {
  it("allows only nonce-authorized inline scripts without unsafe-inline", () => {
    const csp = buildContentSecurityPolicy({
      nonce: "nonce-value",
      development: false,
      production: true,
      analytics: { ga4: false, clarity: false },
      turnstile: false,
    });

    const scriptDirective = csp.match(/(?:^|; )script-src ([^;]+)/)?.[1] ?? "";
    expect(scriptDirective).toContain("'self'");
    expect(scriptDirective).toContain("'nonce-nonce-value'");
    expect(scriptDirective).toContain("https://pagead2.googlesyndication.com");
    expect(scriptDirective).toContain("https://fundingchoicesmessages.google.com");
    expect(scriptDirective).not.toContain("'unsafe-inline'");
    expect(scriptDirective).not.toContain("'unsafe-eval'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("admits only enabled third-party analytics and Turnstile origins", () => {
    const csp = buildContentSecurityPolicy({
      nonce: "test-nonce",
      development: true,
      production: false,
      analytics: { ga4: true, clarity: true },
      turnstile: true,
    });

    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("https://www.google-analytics.com");
    expect(csp).toContain("https://region1.google-analytics.com");
    expect(csp).toContain("https://www.clarity.ms");
    expect(csp).toContain("https://scripts.clarity.ms");
    expect(csp).toContain("https://*.clarity.ms");
    expect(csp).toContain("https://challenges.cloudflare.com");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("configures strict img-src with allowed media origin and no wildcard or bare scheme", () => {
    const csp = buildContentSecurityPolicy({
      nonce: "test-nonce",
      development: false,
      production: true,
      analytics: { ga4: true, clarity: true },
      turnstile: false,
    });

    const imageDirective = csp.match(/(?:^|; )img-src ([^;]+)/)?.[1] ?? "";
    const tokens = imageDirective.split(/\s+/).filter(Boolean);

    expect(tokens).toContain("'self'");
    expect(tokens).toContain("data:");
    expect(tokens).toContain("blob:");
    expect(tokens).toContain("https://media.tierlistbase.com");

    expect(tokens).not.toContain("*");
    expect(tokens).not.toContain("https:");
    expect(tokens).not.toContain("http:");

    for (const token of tokens) {
      if (token === "'self'" || token === "data:" || token === "blob:") continue;
      expect(token).toMatch(/^https:\/\/[a-zA-Z0-9.*-]+\.[a-zA-Z]{2,}/);
    }
  });
});
