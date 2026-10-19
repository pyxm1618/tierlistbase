import "server-only";
import { z, ZodError } from "zod";
import { VanguardError } from "@/modules/wow-vanguard";
import { getVanguardService } from "@/config/vanguard-runtime.config";
import { getAccountContext } from "@/platform/auth/account-context";
import { extractTrustedClientIp } from "@/platform/auth/client-ip";
import { createAuthAttemptLimiter } from "@/platform/auth/attempt-rate-limit";
import { env } from "@/platform/config/env";
import { createLogger } from "@/platform/observability/logger";
import { db } from "@/platform/database/application-database";
export const vanguard = getVanguardService();
export async function boundary(
  request: Request,
  scope: string,
  write = false,
  authenticated = false,
) {
  if (write && request.headers.get("origin") !== env.appOrigin)
    throw new VanguardError("INVALID_INPUT", 400);
  const context = await getAccountContext(request.headers);
  if (authenticated && !context) throw new VanguardError("AUTH_REQUIRED", 401);
  if (!env.betterAuthSecret) throw new VanguardError("SERVICE_UNAVAILABLE", 503);
  const ip = extractTrustedClientIp(request.headers, env.appEnv);
  try {
    await createAuthAttemptLimiter(db, env.betterAuthSecret).consume({
      scope: `vanguard:${scope}`,
      identifiers: [`ip:${ip}`, ...(context ? [`account:${context.user.id}`] : [])],
      now: new Date(),
      windowMs: 60000,
      max: write ? 10 : 60,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "authentication attempt rate limited")
      throw new VanguardError("RATE_LIMITED", 429);
    throw error;
  }
  return context;
}
export async function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new VanguardError("INVALID_INPUT", 400);
  const reader = request.body?.getReader();
  if (!reader) throw new VanguardError("INVALID_INPUT", 400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    length += chunk.value.byteLength;
    if (length > 8192) {
      await reader.cancel();
      throw new VanguardError("INVALID_INPUT", 400);
    }
    chunks.push(chunk.value);
  }
  try {
    return schema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError)
      throw new VanguardError("INVALID_INPUT", 400);
    throw error;
  }
}
export function json(value: unknown, status = 200, cache = "no-store") {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": cache, "X-Content-Type-Options": "nosniff" },
  });
}
export async function respond(operation: () => Promise<Response>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof VanguardError)
      return json({ error: { code: error.code, ...error.details } }, error.status);
    if (error instanceof ZodError) return json({ error: { code: "INVALID_INPUT" } }, 400);
    const databaseError =
      error && typeof error === "object" && "cause" in error
        ? (error.cause as { code?: string; constraint_name?: string })
        : null;
    if (
      databaseError?.code === "23505" &&
      databaseError.constraint_name === "vanguard_account_one_seat"
    )
      return json({ error: { code: "ACCOUNT_ALREADY_INSCRIBED" } }, 409);
    if (
      databaseError?.code === "23505" &&
      databaseError.constraint_name === "vanguard_inscriptions_seat_id_unique"
    )
      return json({ error: { code: "SEAT_ALREADY_CLAIMED" } }, 409);
    createLogger({ component: "vanguard-api" }).error("vanguard_request_failed", {
      errorType: error instanceof Error ? error.name : "unknown",
      databaseCode: databaseError?.code,
    });
    return json({ error: { code: "SERVICE_UNAVAILABLE" } }, 503);
  }
}
