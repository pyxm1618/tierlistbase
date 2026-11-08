import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  env: {
    cronSecret: "c".repeat(32),
    indexNowKey: "IndexNow-Key-12345",
  },
}));

vi.mock("@/platform/config/env", () => ({
  env: state.env,
}));

import { POST } from "@/app/api/internal/seo/indexnow/route";
import { routeRegistry } from "@/config/routes.config";

function makeRequest(urls: string[], authorized = true): Request {
  return new Request(`${routeRegistry.site.canonicalOrigin}/api/internal/seo/indexnow`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authorized
        ? { authorization: `Bearer ${state.env.cronSecret}` }
        : {}),
    },
    body: JSON.stringify({ urls }),
  });
}

describe("internal IndexNow submission endpoint", () => {
  beforeEach(() => {
    state.env.indexNowKey = "IndexNow-Key-12345";
    state.env.cronSecret = "c".repeat(32);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires the existing CRON_SECRET authentication contract", async () => {
    const response = await POST(makeRequest(["/"], false));

    expect(response.status).toBe(401);
  });

  it("accepts a deleted same-origin URL without checking the live route registry", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    const deletedUrl = `${routeRegistry.site.canonicalOrigin}/removed-indexable-page`;
    const response = await POST(makeRequest([deletedUrl]));

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      accepted: true,
      statusCode: 202,
      submitted: 1,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["cross-origin", "https://example.net/foreign"],
    ["credential-bearing", "https://user:password@www.tierlistbase.com/private"],
    ["malformed", "https://[::1"],
  ])("rejects %s URLs before calling the provider", async (_label, url) => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(makeRequest([url]));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps provider rate limiting to a non-success internal response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 429 })));

    const response = await POST(makeRequest(["/"]));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "indexnow_upstream_failure" });
  });
});
