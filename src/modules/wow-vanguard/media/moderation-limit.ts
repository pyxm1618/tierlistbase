import { createDatabaseClient } from "@/platform/database/client";
import { createAuthAttemptLimiter } from "@/platform/auth/attempt-rate-limit";
import { VanguardError } from "../domain/event";

export function createVanguardModerationLimiter(
  databaseUrl: string,
  secret: string,
  policy: { readonly max: number; readonly windowMs: number },
) {
  return async (userId: string) => {
    // Never borrow from the media transaction's pool: concurrent completions can
    // occupy every socket while waiting for the same media row lock.
    const connection = createDatabaseClient(databaseUrl, 1);
    try {
      // Commit independently so a failed provider/media transaction still counts.
      await createAuthAttemptLimiter(connection.db, secret).consume({
        scope: "vanguard:moderation",
        identifiers: [`account:${userId}`],
        now: new Date(),
        ...policy,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "authentication attempt rate limited")
        throw new VanguardError("RATE_LIMITED", 429);
      throw error;
    } finally {
      await connection.close();
    }
  };
}
