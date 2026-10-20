import { beforeEach, expect, it, vi } from "vitest";
import { makeSignature } from "better-auth/crypto";
const state = vi.hoisted(() => ({ findSession: vi.fn(), enabled: true }));
vi.mock("server-only", () => ({}));
vi.mock("@/platform/auth/auth", () => ({
  getAuth: () =>
    state.enabled
      ? {
          $context: Promise.resolve({
            secret: "session-readonly-test-secret",
            authCookies: { sessionToken: { name: "tierlistbase.session_token" } },
            internalAdapter: { findSession: state.findSession },
          }),
        }
      : null,
}));
import { hasCurrentSession } from "@/platform/auth/current-session";
beforeEach(() => {
  state.enabled = true;
  state.findSession.mockReset();
});
it("does not query storage for missing or tampered cookies", async () => {
  expect(await hasCurrentSession(new Headers())).toBe(false);
  expect(
    await hasCurrentSession(new Headers({ cookie: "tierlistbase.session_token=forged.signature" })),
  ).toBe(false);
  expect(state.findSession).not.toHaveBeenCalled();
});
it("accepts only an unexpired existing user through the read-only adapter", async () => {
  const token = "owned-token";
  const signature = await makeSignature(token, "session-readonly-test-secret");
  const headers = new Headers({
    cookie: `tierlistbase.session_token=${encodeURIComponent(`${token}.${signature}`)}`,
  });
  state.findSession.mockResolvedValue({
    user: { id: "owner" },
    session: { expiresAt: new Date(Date.now() + 60000) },
  });
  expect(await hasCurrentSession(headers)).toBe(true);
  expect(state.findSession).toHaveBeenCalledWith(token);
  state.findSession.mockResolvedValue({
    user: { id: "owner" },
    session: { expiresAt: new Date(0) },
  });
  expect(await hasCurrentSession(headers)).toBe(false);
  state.findSession.mockResolvedValue(null);
  expect(await hasCurrentSession(headers)).toBe(false);
});
it("returns signed out when authentication is disabled", async () => {
  state.enabled = false;
  expect(
    await hasCurrentSession(new Headers({ cookie: "tierlistbase.session_token=disabled" })),
  ).toBe(false);
});
