import { describe, expect, it } from "vitest";

import { extractTrustedClientIp } from "@/platform/auth/client-ip";

describe("trusted client IP extraction", () => {
  it("accepts explicit test IP only in local and test modes", () => {
    const headers = new Headers({ "x-real-ip": "203.0.113.10" });
    expect(extractTrustedClientIp(headers, "test")).toBe("203.0.113.10");
    expect(extractTrustedClientIp(headers, "production")).toBe("unknown");
  });

  it("accepts a valid Cloudflare client address in staging and production", () => {
    const headers = new Headers({ "cf-connecting-ip": "198.51.100.42" });
    expect(extractTrustedClientIp(headers, "staging")).toBe("198.51.100.42");
    expect(extractTrustedClientIp(headers, "production")).toBe("198.51.100.42");
  });

  it("rejects missing or malformed Cloudflare client addresses without forwarded fallbacks", () => {
    expect(
      extractTrustedClientIp(
        new Headers({
          "x-vercel-id": "spoofed",
          "x-forwarded-for": "198.51.100.4, 10.0.0.1",
        }),
        "production",
      ),
    ).toBe("unknown");
    expect(
      extractTrustedClientIp(
        new Headers({
          "cf-connecting-ip": "not-an-ip",
          "x-vercel-id": "spoofed",
          "x-forwarded-for": "198.51.100.4",
        }),
        "staging",
      ),
    ).toBe("unknown");
  });
});
