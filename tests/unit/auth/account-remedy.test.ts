import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAccountContext: vi.fn(),
  getAccountDeletionService: vi.fn(),
  env: {
    appOrigin: "http://localhost:3000",
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/platform/config/env", () => ({
  env: mocks.env,
}));
vi.mock("@/platform/auth/account-context", () => ({
  requireAccountContext: mocks.requireAccountContext,
}));
vi.mock("@/platform/accounts/account-deletion-runtime", () => ({
  getAccountDeletionService: mocks.getAccountDeletionService,
}));

import { POST } from "@/app/api/account/delete/route";
import { assertFreshSession } from "@/platform/auth/session";

describe("Account Deletion Stale-Session Lifecycle", () => {
  const serviceMock = {
    request: vi.fn().mockResolvedValue({ id: "req_123" }),
    run: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccountDeletionService.mockReturnValue(serviceMock);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("strictly preserves the 15-minute fresh session security threshold", () => {
    const baseTime = new Date("2026-10-23T10:00:00Z");
    const freshTime = new Date("2026-10-23T10:14:59Z");
    const staleTime = new Date("2026-10-23T10:15:01Z");

    expect(() => assertFreshSession({ authenticatedAt: baseTime }, freshTime)).not.toThrow();

    expect(() => assertFreshSession({ authenticatedAt: baseTime }, staleTime)).toThrow(
      "fresh authentication required",
    );
  });

  it("safely redirects stale session deletion to sign-in with returnTo without throwing 500 or deleting", async () => {
    const now = new Date();
    const staleCreatedAt = new Date(now.getTime() - 16 * 60 * 1000); // 16 minutes ago (stale)

    mocks.requireAccountContext.mockResolvedValueOnce({
      user: { id: "user_stale" },
      session: { id: "session_stale", createdAt: staleCreatedAt },
      subject: { id: "subject_stale" },
    });

    const body = new URLSearchParams({ confirmation: "DELETE" }).toString();

    const request = new Request("http://localhost:3000/api/account/delete", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const response = await POST(request);

    // Assert: safe 303 redirect, no 500, points to re-auth returnTo
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/sign-in?returnTo=%2Faccount%2Fsecurity",
    );

    // Assert: deletion was NOT triggered
    expect(serviceMock.request).not.toHaveBeenCalled();
    expect(serviceMock.run).not.toHaveBeenCalled();
  });

  it("proves that newly authenticated session passes fresh-session check and succeeds upon explicit confirmation", async () => {
    const now = new Date();
    // Simulate re-authenticated session from Google/Better Auth
    const freshCreatedAt = new Date(now.getTime() - 10 * 1000); // 10 seconds ago

    // 1. Proves fresh-session policy passes
    expect(() => assertFreshSession({ authenticatedAt: freshCreatedAt }, now)).not.toThrow();

    // 2. Explicit confirmation from user after returning to /account/security
    mocks.requireAccountContext.mockResolvedValueOnce({
      user: { id: "user_reauthed" },
      session: { id: "session_fresh", createdAt: freshCreatedAt },
      subject: { id: "subject_reauthed" },
    });

    const body = new URLSearchParams({ confirmation: "DELETE" }).toString();

    const request = new Request("http://localhost:3000/api/account/delete", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const response = await POST(request);

    // Assert: deletion proceeded and redirected to /account/deleted
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost:3000/account/deleted");
    expect(serviceMock.request).toHaveBeenCalledWith({
      subjectId: "subject_reauthed",
      authUserId: "user_reauthed",
    });
    expect(serviceMock.run).toHaveBeenCalledWith("req_123");
  });

  it("requires explicit DELETE confirmation even with a fresh session", async () => {
    const now = new Date();
    const freshCreatedAt = new Date(now.getTime() - 10 * 1000);

    mocks.requireAccountContext.mockResolvedValueOnce({
      user: { id: "user_fresh" },
      session: { id: "session_fresh", createdAt: freshCreatedAt },
      subject: { id: "subject_fresh" },
    });

    const body = new URLSearchParams({ confirmation: "NO_DELETE" }).toString();

    const request = new Request("http://localhost:3000/api/account/delete", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "confirmation_required" });
    expect(serviceMock.request).not.toHaveBeenCalled();
  });
});
