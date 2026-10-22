import "server-only";

import { parseCookies } from "better-auth/cookies";
import { constantTimeEqual, makeSignature } from "better-auth/crypto";
import { getAuth } from "./auth";

export type CurrentSessionIdentity = {
  name: string | null;
  email: string | null;
};

// Header-only read: no subject provisioning, session refresh or expired-session deletion.
export async function readCurrentSessionIdentity(
  requestHeaders: Headers,
): Promise<CurrentSessionIdentity | null> {
  if (!requestHeaders.get("cookie")) return null;
  const auth = getAuth();
  if (!auth) return null;
  const context = await auth.$context;
  const value = parseCookies(requestHeaders.get("cookie")!).get(
    context.authCookies.sessionToken.name,
  );
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const token = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!constantTimeEqual(signature, await makeSignature(token, context.secret))) return null;
  const result = await context.internalAdapter.findSession(token);
  if (!result?.user.id || result.session.expiresAt.getTime() <= Date.now()) return null;
  return {
    name: typeof result.user.name === "string" && result.user.name.trim() ? result.user.name : null,
    email:
      typeof result.user.email === "string" && result.user.email.trim() ? result.user.email : null,
  };
}

export async function hasCurrentSession(requestHeaders: Headers): Promise<boolean> {
  return Boolean(await readCurrentSessionIdentity(requestHeaders));
}
