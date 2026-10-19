import "server-only";

import { parseCookies } from "better-auth/cookies";
import { constantTimeEqual, makeSignature } from "better-auth/crypto";
import { getAuth } from "./auth";

// Header-only read: no subject provisioning, session refresh or expired-session deletion.
export async function hasCurrentSession(requestHeaders: Headers): Promise<boolean> {
  if (!requestHeaders.get("cookie")) return false;
  const auth = getAuth();
  if (!auth) return false;
  const context = await auth.$context;
  const value = parseCookies(requestHeaders.get("cookie")!).get(
    context.authCookies.sessionToken.name,
  );
  if (!value) return false;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return false;
  const token = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!constantTimeEqual(signature, await makeSignature(token, context.secret))) return false;
  const result = await context.internalAdapter.findSession(token);
  return Boolean(result?.user.id && result.session.expiresAt.getTime() > Date.now());
}
