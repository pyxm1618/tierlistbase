import { randomUUID } from "node:crypto";
import { eq, sql, type SQL } from "drizzle-orm";
import type { DatabaseClient, DatabaseTransaction } from "@/platform/database/client";
import { assertVanguardWriteOpen, VanguardError } from "../domain/event";
import { vanguardMedia, vanguardInscriptions } from "../db/schema";
import { normalizeVanguardMaster } from "./normalize";
type MediaStorage = {
  presign(key: string): Promise<string>;
  readPending(key: string): Promise<Buffer>;
  writePrivate(key: string, bytes: Buffer): Promise<void>;
  deletePending(key: string): Promise<void>;
};
export function createVanguardMediaService(
  database: DatabaseClient,
  input: {
    storage: MediaStorage;
    moderate: (image: Buffer) => Promise<{
      decision: "approved" | "rejected" | "uncertain";
      probabilities: Record<string, number>;
    }>;
    authorityTimeSql?: SQL;
  },
) {
  async function time(transaction: DatabaseTransaction) {
    const [row] = await transaction.execute<{ now: string | Date }>(
      sql`select ${input.authorityTimeSql ?? sql`clock_timestamp()`} as now`,
    );
    if (!row) throw new Error("Vanguard database time unavailable");
    const now = new Date(row.now);
    assertVanguardWriteOpen(now);
    return now;
  }
  async function accountAvailable(transaction: DatabaseTransaction, userId: string) {
    const [seat] = await transaction
      .select({ seatId: vanguardInscriptions.seatId })
      .from(vanguardInscriptions)
      .where(eq(vanguardInscriptions.userId, userId))
      .limit(1);
    if (seat) throw new VanguardError("ACCOUNT_ALREADY_INSCRIBED", 409, { seatId: seat.seatId });
  }
  return {
    async presign(userId: string) {
      return database.transaction(async (transaction) => {
        const now = await time(transaction);
        await accountAvailable(transaction, userId);
        const mediaId = randomUUID();
        const privateMasterKey = `vanguard/pending/${mediaId}/master.webp`;
        const uploadUrl = await input.storage.presign(privateMasterKey);
        await accountAvailable(transaction, userId);
        await time(transaction);
        await transaction.insert(vanguardMedia).values({
          id: mediaId,
          ownerUserId: userId,
          privateMasterKey,
          moderationKey: `vanguard/pending/${mediaId}/moderation.webp`,
          mime: "image/webp",
          createdAt: now,
        });
        return { mediaId, uploadUrl, contentType: "image/webp" as const };
      });
    },
    async complete(userId: string, mediaId: string) {
      const result = await database.transaction(async (transaction) => {
        await time(transaction);
        await accountAvailable(transaction, userId);
        const [media] = await transaction
          .select()
          .from(vanguardMedia)
          .where(eq(vanguardMedia.id, mediaId))
          .for("update");
        if (!media || media.ownerUserId !== userId || media.moderationStatus === "hidden")
          throw new VanguardError("MEDIA_NOT_FOUND", 404);
        if (media.moderationStatus === "approved") return { mediaId, status: "approved" as const };
        if (media.moderationStatus === "rejected")
          return { error: new VanguardError("MEDIA_MODERATION_REJECTED", 422) };
        let bytes: Buffer;
        try {
          bytes = await input.storage.readPending(media.privateMasterKey);
        } catch (error) {
          if (error instanceof VanguardError) {
            await input.storage.deletePending(media.privateMasterKey);
            throw error;
          }
          throw new VanguardError("UPLOAD_FAILED", 503);
        }
        let normalized: Awaited<ReturnType<typeof normalizeVanguardMaster>>;
        try {
          normalized = await normalizeVanguardMaster(bytes, media.mime);
        } catch (error) {
          await input.storage.deletePending(media.privateMasterKey);
          throw error;
        }
        await input.storage.writePrivate(media.privateMasterKey, normalized.master);
        await input.storage.writePrivate(media.moderationKey, normalized.moderation);
        let moderation: Awaited<ReturnType<typeof input.moderate>>;
        try {
          moderation = await input.moderate(normalized.moderation);
        } catch (error) {
          if (!(error instanceof VanguardError) || error.code !== "MODERATION_UNAVAILABLE")
            throw error;
          await time(transaction);
          return { error };
        }
        await accountAvailable(transaction, userId);
        const now = await time(transaction);
        await transaction
          .update(vanguardMedia)
          .set({
            width: normalized.width,
            height: normalized.height,
            byteSize: normalized.master.length,
            sha256: normalized.sha256,
            moderationStatus: moderation.decision === "uncertain" ? "pending" : moderation.decision,
            moderationResult: {
              decision: moderation.decision,
              probabilities: moderation.probabilities,
            },
            moderatedAt: now,
          })
          .where(eq(vanguardMedia.id, mediaId));
        if (moderation.decision !== "approved")
          return {
            error: new VanguardError(
              moderation.decision === "rejected"
                ? "MEDIA_MODERATION_REJECTED"
                : "MODERATION_UNAVAILABLE",
              moderation.decision === "rejected" ? 422 : 503,
            ),
          };
        return { mediaId, status: "approved" as const };
      });
      if ("error" in result) throw result.error;
      return result;
    },
  };
}
