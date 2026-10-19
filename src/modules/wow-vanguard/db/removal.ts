import { and, eq, inArray } from "drizzle-orm";
import type { DatabaseClient } from "@/platform/database/client";
import { vanguardEventState, vanguardInscriptions, vanguardMedia } from "./schema";
export async function removeVanguardAccount(
  database: DatabaseClient,
  userId: string,
  revoke: (keys: readonly string[]) => Promise<void>,
) {
  await database.transaction(async (transaction) => {
    await transaction.insert(vanguardEventState).values({ id: 1 }).onConflictDoNothing();
    await transaction
      .select()
      .from(vanguardEventState)
      .where(eq(vanguardEventState.id, 1))
      .for("update");
    const media = await transaction
      .select()
      .from(vanguardMedia)
      .where(eq(vanguardMedia.ownerUserId, userId))
      .for("update");
    const keys = media.flatMap((row) =>
      [row.publicDetailKey, row.publicWowThumbKey, row.publicForeverThumbKey].filter(
        (key): key is string => key !== null,
      ),
    );
    // Failures propagate and block account deletion; never leave a claimed privacy removal incomplete.
    if (keys.length) await revoke(keys);
    if (media.length)
      await transaction
        .update(vanguardMedia)
        .set({
          moderationStatus: "hidden",
          ownerUserId: null,
          publicDetailKey: null,
          publicWowThumbKey: null,
          publicForeverThumbKey: null,
          moderationResult: null,
        })
        .where(
          and(
            eq(vanguardMedia.ownerUserId, userId),
            inArray(
              vanguardMedia.id,
              media.map((row) => row.id),
            ),
          ),
        );
    await transaction
      .update(vanguardInscriptions)
      .set({
        userId: null,
        status: "deleted",
        displayName: "",
        guildName: null,
        guildKey: null,
        battleCry: null,
        mediaId: null,
      })
      .where(eq(vanguardInscriptions.userId, userId));
  });
}
// Existing operations may call this scoped service; it exposes no admin route or dashboard.
export async function hideVanguardInscription(
  database: DatabaseClient,
  seatId: string,
  status: "hidden" | "deleted",
  revoke: (keys: readonly string[]) => Promise<void>,
) {
  const { parseSeatId, VanguardError } = await import("../domain/event");
  parseSeatId(seatId);
  if (status !== "hidden" && status !== "deleted") throw new VanguardError("INVALID_INPUT", 400);
  await database.transaction(async (transaction) => {
    await transaction.insert(vanguardEventState).values({ id: 1 }).onConflictDoNothing();
    await transaction
      .select()
      .from(vanguardEventState)
      .where(eq(vanguardEventState.id, 1))
      .for("update");
    const [seat] = await transaction
      .select()
      .from(vanguardInscriptions)
      .where(eq(vanguardInscriptions.seatId, seatId))
      .for("update");
    if (!seat) throw new VanguardError("SEAT_NOT_FOUND", 404);
    if (seat.mediaId) {
      const [media] = await transaction
        .select()
        .from(vanguardMedia)
        .where(eq(vanguardMedia.id, seat.mediaId))
        .for("update");
      if (media) {
        const keys = [
          media.publicDetailKey,
          media.publicWowThumbKey,
          media.publicForeverThumbKey,
        ].filter((key): key is string => key !== null);
        if (keys.length) await revoke(keys);
        await transaction
          .update(vanguardMedia)
          .set({
            moderationStatus: "hidden",
            publicDetailKey: null,
            publicWowThumbKey: null,
            publicForeverThumbKey: null,
          })
          .where(eq(vanguardMedia.id, media.id));
      }
    }
    await transaction
      .update(vanguardInscriptions)
      .set({ status, displayName: "", guildName: null, guildKey: null, battleCry: null })
      .where(eq(vanguardInscriptions.id, seat.id));
  });
}
