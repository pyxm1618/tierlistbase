import { createHash } from "node:crypto";
import type { vanguardMedia } from "../db/schema";
import { VanguardError } from "../domain/event";
import { normalizeVanguardMaster } from "./normalize";
export type PublishedMediaKeys = {
  publicDetailKey: string;
  publicWowThumbKey: string;
  publicForeverThumbKey: string;
};
export function createVanguardMediaPublisher(storage: {
  readPending: (key: string) => Promise<Buffer>;
  publishApproved: (key: string, bytes: Buffer, approved: boolean) => Promise<void>;
  revoke: (keys: readonly string[]) => Promise<void>;
}) {
  return async (media: typeof vanguardMedia.$inferSelect): Promise<PublishedMediaKeys> => {
    if (media.moderationStatus !== "approved" || !media.sha256)
      throw new VanguardError("MEDIA_MODERATION_REJECTED", 422);
    const bytes = await storage.readPending(media.privateMasterKey);
    if (createHash("sha256").update(bytes).digest("hex") !== media.sha256)
      throw new VanguardError("MEDIA_CHANGED", 422);
    const derivatives = await normalizeVanguardMaster(bytes, "image/webp");
    const keys = {
      publicDetailKey: `vanguard/permanent/${media.id}/detail.webp`,
      publicWowThumbKey: `vanguard/permanent/${media.id}/wow-256.webp`,
      publicForeverThumbKey: `vanguard/permanent/${media.id}/forever-128.webp`,
    };
    try {
      for (const [key, content] of [
        [keys.publicDetailKey, derivatives.detail],
        [keys.publicWowThumbKey, derivatives.wow],
        [keys.publicForeverThumbKey, derivatives.forever],
      ] as const)
        await storage.publishApproved(key, content, true);
    } catch (error) {
      try {
        await storage.revoke(Object.values(keys));
      } catch (cleanup) {
        throw new AggregateError(
          [error, cleanup],
          "Vanguard media publication and rollback cleanup failed",
        );
      }
      throw error;
    }
    return keys;
  };
}
