import type { PublishedMediaKeys } from "../media/publish";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, or, sql, type SQL } from "drizzle-orm";
import type { DatabaseClient, DatabaseTransaction } from "@/platform/database/client";
import {
  assertPhaseOpen,
  EVENT_CLOSE_AT,
  parseSeatId,
  VanguardError,
  type VanguardEventState,
  resolveVanguardStage,
} from "../domain/event";
import { guildSearchKey, inscriptionSchema, type InscriptionInput } from "../domain/validation";
import {
  vanguardEventState,
  vanguardInscriptions,
  vanguardMedia,
  vanguardSeatHolds,
} from "./schema";

type Inscription = typeof vanguardInscriptions.$inferSelect;
export function publicInscription(row: Inscription, media?: typeof vanguardMedia.$inferSelect) {
  if (row.status !== "active" || row.userId === null)
    return { seatId: row.seatId, status: "unavailable" as const };
  return {
    seatId: row.seatId,
    status: "active" as const,
    displayName: row.displayName,
    faction: row.faction,
    className: row.className,
    guildName: row.guildName,
    battleCry: row.battleCry,
    inscribedAt: row.createdAt.toISOString(),
    image:
      media?.moderationStatus === "approved" &&
      media.ownerUserId === row.userId &&
      media.publicDetailKey === `vanguard/permanent/${media.id}/detail.webp` &&
      media.publicWowThumbKey === `vanguard/permanent/${media.id}/wow-256.webp` &&
      media.publicForeverThumbKey === `vanguard/permanent/${media.id}/forever-128.webp`
        ? {
            detail: `https://media.tierlistbase.com/${media.publicDetailKey}`,
            wow: `https://media.tierlistbase.com/${media.publicWowThumbKey}`,
            forever: `https://media.tierlistbase.com/${media.publicForeverThumbKey}`,
          }
        : null,
  };
}
export type PublicInscription = ReturnType<typeof publicInscription>;
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
export function createVanguardService(
  database: DatabaseClient,
  options: {
    authorityTimeSql?: SQL;
    publishMedia?: (media: typeof vanguardMedia.$inferSelect) => Promise<PublishedMediaKeys>;
    revokeMedia?: (keys: readonly string[]) => Promise<void>;
    // Final immutable mask-derived identities and neighbors are supplied by composition.
    seatExists?: (seatId: string) => boolean | Promise<boolean>;
    nearestAvailable?: (
      seatId: string,
      occupied: ReadonlySet<string>,
    ) => string | null | Promise<string | null>;
  } = {},
) {
  async function authorityNow(transaction: DatabaseTransaction) {
    const [row] = await transaction.execute<{ now: Date | string }>(
      sql`select ${options.authorityTimeSql ?? sql`clock_timestamp()`} as now`,
    );
    if (!row) throw new Error("Vanguard database authority time unavailable");
    return new Date(row.now);
  }
  async function lockEvent(transaction: DatabaseTransaction) {
    await transaction.insert(vanguardEventState).values({ id: 1 }).onConflictDoNothing();
    const [event] = await transaction
      .select()
      .from(vanguardEventState)
      .where(eq(vanguardEventState.id, 1))
      .for("update");
    if (!event) throw new Error("Vanguard singleton is missing");
    const [counts] = await transaction
      .select({ count: sql<number>`count(*)::integer` })
      .from(vanguardInscriptions)
      .where(eq(vanguardInscriptions.phase, "forever"));
    const state: VanguardEventState = {
      wowClaimedCount: event.wowClaimedCount,
      wowCompletedAt: event.wowCompletedAt,
      foreverClaimedCount: counts?.count ?? 0,
    };
    return state;
  }
  async function assertLayoutSeat(seatId: string) {
    const seat = parseSeatId(seatId);
    if (!options.seatExists) throw new VanguardError("LAYOUT_UNAVAILABLE", 503);
    if (!(await options.seatExists(seatId))) throw new VanguardError("INVALID_INPUT", 400);
    return seat;
  }
  async function conflict(transaction: DatabaseTransaction, seatId: string): Promise<never> {
    const rows = await transaction
      .select({ seatId: vanguardInscriptions.seatId })
      .from(vanguardInscriptions);
    const occupied = new Set(rows.map((row) => row.seatId));
    // Active holds must also be excluded; recommendations never reserve a seat.
    const holds = await transaction
      .select({ seatId: vanguardSeatHolds.seatId })
      .from(vanguardSeatHolds)
      .where(sql`${vanguardSeatHolds.expiresAt} > clock_timestamp()`);
    for (const held of holds) occupied.add(held.seatId);
    throw new VanguardError("SEAT_ALREADY_CLAIMED", 409, {
      nearestSeatId: (await options.nearestAvailable?.(seatId, occupied)) ?? null,
    });
  }
  async function assertAccountAvailable(transaction: DatabaseTransaction, userId: string | null) {
    if (!userId) return;
    const [existing] = await transaction
      .select({ seatId: vanguardInscriptions.seatId })
      .from(vanguardInscriptions)
      .where(eq(vanguardInscriptions.userId, userId))
      .limit(1);
    if (existing)
      throw new VanguardError("ACCOUNT_ALREADY_INSCRIBED", 409, { seatId: existing.seatId });
  }
  return {
    async manifest() {
      return database.transaction(
        async (transaction) => {
          const [event] = await transaction
            .select()
            .from(vanguardEventState)
            .where(eq(vanguardEventState.id, 1));
          const rows = await transaction
            .select({
              seatId: vanguardInscriptions.seatId,
              phase: vanguardInscriptions.phase,
              localIndex: vanguardInscriptions.localIndex,
              letter: vanguardInscriptions.letter,
            })
            .from(vanguardInscriptions);
          const now = await authorityNow(transaction);
          const state = {
            wowClaimedCount: event?.wowClaimedCount ?? 0,
            wowCompletedAt: event?.wowCompletedAt ?? null,
            foreverClaimedCount: rows.filter((row) => row.phase === "forever").length,
          };
          const stage = resolveVanguardStage(now, state);
          const foreverUnlockAt = state.wowCompletedAt
            ? new Date(state.wowCompletedAt.getTime() + 86400000).toISOString()
            : null;
          const showForever =
            foreverUnlockAt !== null &&
            Date.parse(foreverUnlockAt) < Date.parse(EVENT_CLOSE_AT) &&
            now.getTime() >= Date.parse(foreverUnlockAt);
          const phase: "wow" | "forever" = showForever ? "forever" : "wow";
          const letters =
            phase === "wow" ? ["W1", "O", "W2"] : ["F", "O", "R1", "E1", "V", "E2", "R2"];
          const perLetter = phase === "wow" ? 2672 : 8016;
          const bits = new Uint8Array(Math.ceil((phase === "wow" ? 8016 : 56112) / 8));
          for (const row of rows.filter((row) => row.phase === phase)) {
            const index = letters.indexOf(row.letter) * perLetter + row.localIndex - 1;
            bits[index >> 3]! |= 1 << (index & 7);
          }
          const payload = {
            stage,
            counts: {
              wow: state.wowClaimedCount,
              forever: state.foreverClaimedCount,
              total: state.wowClaimedCount + state.foreverClaimedCount,
            },
            wowCompletedAt: state.wowCompletedAt?.toISOString() ?? null,
            foreverUnlockAt,
            eventCloseAt: EVENT_CLOSE_AT,
            phase,
            occupancy: Buffer.from(bits).toString("base64"),
          };
          return {
            ...payload,
            version: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
          };
        },
        { isolationLevel: "repeatable read" },
      );
    },
    async hold(seatId: string, userId: string | null, previousToken?: string) {
      const seat = parseSeatId(seatId);
      return database.transaction(async (transaction) => {
        const state = await lockEvent(transaction);
        let now = await authorityNow(transaction);
        assertPhaseOpen(now, state, seat.phase);
        await assertLayoutSeat(seat.seatId);
        await assertAccountAvailable(transaction, userId);
        const [occupied] = await transaction
          .select({ seatId: vanguardInscriptions.seatId })
          .from(vanguardInscriptions)
          .where(eq(vanguardInscriptions.seatId, seatId));
        if (occupied) return conflict(transaction, seatId);
        const [held] = await transaction
          .select()
          .from(vanguardSeatHolds)
          .where(eq(vanguardSeatHolds.seatId, seatId));
        const ownsHold =
          held &&
          previousToken &&
          held.holdTokenHash === hash(previousToken) &&
          (!held.userId || held.userId === userId);
        if (held && held.expiresAt > now && !ownsHold) return conflict(transaction, seatId);
        const holdToken = ownsHold ? previousToken! : randomBytes(32).toString("base64url");
        now = await authorityNow(transaction);
        assertPhaseOpen(now, state, seat.phase);
        const expiresAt = new Date(Math.min(now.getTime() + 180000, Date.parse(EVENT_CLOSE_AT)));
        await transaction
          .insert(vanguardSeatHolds)
          .values({ seatId, userId, holdTokenHash: hash(holdToken), expiresAt, createdAt: now })
          .onConflictDoUpdate({
            target: vanguardSeatHolds.seatId,
            set: { userId, holdTokenHash: hash(holdToken), expiresAt, createdAt: now },
          });
        return { seatId, holdToken, expiresAt: expiresAt.toISOString() };
      });
    },
    async inscribe(userId: string, rawInput: InscriptionInput) {
      const input = inscriptionSchema.parse(rawInput);
      const seat = await assertLayoutSeat(input.seatId);
      const expectedPublished = input.mediaId
        ? {
            publicDetailKey: `vanguard/permanent/${input.mediaId}/detail.webp`,
            publicWowThumbKey: `vanguard/permanent/${input.mediaId}/wow-256.webp`,
            publicForeverThumbKey: `vanguard/permanent/${input.mediaId}/forever-128.webp`,
          }
        : undefined;
      let reservedByThisAttempt = false;
      let publicationStarted = false;

      const reservationMatches = (
        media: typeof vanguardMedia.$inferSelect,
        keys: PublishedMediaKeys,
      ) =>
        media.publicDetailKey === keys.publicDetailKey &&
        media.publicWowThumbKey === keys.publicWowThumbKey &&
        media.publicForeverThumbKey === keys.publicForeverThumbKey;

      async function reservationIsUncommitted(mediaId: string, keys: PublishedMediaKeys) {
        return database.transaction(async (transaction) => {
          const [media] = await transaction
            .select()
            .from(vanguardMedia)
            .where(eq(vanguardMedia.id, mediaId))
            .for("update");
          if (!media || !reservationMatches(media, keys)) return false;
          const [inscription] = await transaction
            .select({ id: vanguardInscriptions.id })
            .from(vanguardInscriptions)
            .where(eq(vanguardInscriptions.mediaId, mediaId))
            .limit(1);
          return !inscription;
        });
      }

      async function clearReservation(mediaId: string, keys: PublishedMediaKeys) {
        await database.transaction(async (transaction) => {
          const [media] = await transaction
            .select()
            .from(vanguardMedia)
            .where(eq(vanguardMedia.id, mediaId))
            .for("update");
          if (!media || !reservationMatches(media, keys)) return;
          const [inscription] = await transaction
            .select({ id: vanguardInscriptions.id })
            .from(vanguardInscriptions)
            .where(eq(vanguardInscriptions.mediaId, mediaId))
            .limit(1);
          if (inscription) return;
          await transaction
            .update(vanguardMedia)
            .set({
              publicDetailKey: null,
              publicWowThumbKey: null,
              publicForeverThumbKey: null,
            })
            .where(eq(vanguardMedia.id, mediaId));
        });
      }

      async function compensateReservation(
        mediaId: string,
        keys: PublishedMediaKeys,
        revoke: boolean,
      ) {
        if (!(await reservationIsUncommitted(mediaId, keys))) return;
        if (revoke) await options.revokeMedia!(Object.values(keys));
        await clearReservation(mediaId, keys);
      }

      try {
        if (input.mediaId && expectedPublished) {
          if (!options.publishMedia || !options.revokeMedia)
            throw new VanguardError("UPLOAD_FAILED", 503);

          const preparedMedia = await database.transaction(async (transaction) => {
            const now = await authorityNow(transaction);
            await assertAccountAvailable(transaction, userId);
            const [occupied] = await transaction
              .select({ seatId: vanguardInscriptions.seatId })
              .from(vanguardInscriptions)
              .where(eq(vanguardInscriptions.seatId, input.seatId));
            if (occupied) return conflict(transaction, input.seatId);
            const [held] = await transaction
              .select()
              .from(vanguardSeatHolds)
              .where(eq(vanguardSeatHolds.seatId, input.seatId));
            if (
              !held ||
              held.expiresAt <= now ||
              held.holdTokenHash !== hash(input.holdToken) ||
              held.userId !== userId
            )
              throw new VanguardError("HOLD_EXPIRED", 409);

            const [media] = await transaction
              .select()
              .from(vanguardMedia)
              .where(eq(vanguardMedia.id, input.mediaId))
              .for("update");
            if (!media || media.ownerUserId !== userId || media.moderationStatus !== "approved")
              throw new VanguardError("MEDIA_MODERATION_REJECTED", 422);
            if (
              media.publicDetailKey !== null ||
              media.publicWowThumbKey !== null ||
              media.publicForeverThumbKey !== null
            )
              throw new VanguardError("UPLOAD_FAILED", 503);

            await transaction
              .update(vanguardMedia)
              .set(expectedPublished)
              .where(eq(vanguardMedia.id, media.id));
            return media;
          });
          reservedByThisAttempt = true;

          // All R2 reads, normalization, derivative generation and public writes happen
          // after the short reservation transaction and before the globally locked commit.
          publicationStarted = true;
          const candidate = await options.publishMedia(preparedMedia);
          if (
            candidate.publicDetailKey !== expectedPublished.publicDetailKey ||
            candidate.publicWowThumbKey !== expectedPublished.publicWowThumbKey ||
            candidate.publicForeverThumbKey !== expectedPublished.publicForeverThumbKey
          )
            throw new VanguardError("UPLOAD_FAILED", 503);
        }

        return await database.transaction(async (transaction) => {
          const state = await lockEvent(transaction);
          let now = await authorityNow(transaction);
          assertPhaseOpen(now, state, seat.phase);
          await assertAccountAvailable(transaction, userId);
          const [occupied] = await transaction
            .select({ seatId: vanguardInscriptions.seatId })
            .from(vanguardInscriptions)
            .where(eq(vanguardInscriptions.seatId, input.seatId));
          if (occupied) return conflict(transaction, input.seatId);
          const [held] = await transaction
            .select()
            .from(vanguardSeatHolds)
            .where(eq(vanguardSeatHolds.seatId, input.seatId));
          if (
            !held ||
            held.expiresAt <= now ||
            held.holdTokenHash !== hash(input.holdToken) ||
            held.userId !== userId
          )
            throw new VanguardError("HOLD_EXPIRED", 409);

          let acceptedMedia: typeof vanguardMedia.$inferSelect | undefined;
          if (input.mediaId && expectedPublished) {
            const [media] = await transaction
              .select()
              .from(vanguardMedia)
              .where(eq(vanguardMedia.id, input.mediaId))
              .for("update");
            if (
              !media ||
              media.ownerUserId !== userId ||
              media.moderationStatus !== "approved" ||
              !reservationMatches(media, expectedPublished)
            )
              throw new VanguardError("MEDIA_MODERATION_REJECTED", 422);
            acceptedMedia = media;
          }

          now = await authorityNow(transaction);
          assertPhaseOpen(now, state, seat.phase);
          if (held.expiresAt <= now) throw new VanguardError("HOLD_EXPIRED", 409);

          const [row] = await transaction
            .insert(vanguardInscriptions)
            .values({
              ...seat,
              userId,
              displayName: input.displayName,
              faction: input.faction,
              className: input.className,
              guildName: input.guildName || null,
              guildKey: input.guildName ? guildSearchKey(input.guildName) : null,
              battleCry: input.battleCry || null,
              mediaId: input.mediaId ?? null,
              createdAt: now,
            })
            .returning();
          if (!row) throw new Error("Vanguard inscription insert returned no row");
          if (seat.phase === "wow")
            await transaction
              .update(vanguardEventState)
              .set({
                wowClaimedCount: sql`${vanguardEventState.wowClaimedCount} + 1`,
                wowCompletedAt: sql`case when ${vanguardEventState.wowClaimedCount} + 1 = 8016 and ${vanguardEventState.wowCompletedAt} is null then ${now.toISOString()}::timestamptz else ${vanguardEventState.wowCompletedAt} end`,
                updatedAt: now,
              })
              .where(eq(vanguardEventState.id, 1));
          await transaction
            .delete(vanguardSeatHolds)
            .where(eq(vanguardSeatHolds.seatId, input.seatId));
          return publicInscription(row, acceptedMedia);
        });
      } catch (error) {
        if (input.mediaId && expectedPublished && reservedByThisAttempt) {
          try {
            await compensateReservation(input.mediaId, expectedPublished, publicationStarted);
          } catch (cleanup) {
            throw new AggregateError(
              [error, cleanup],
              "Vanguard inscription and public media cleanup failed",
            );
          }
        }
        throw error;
      }
    },
    async focus(seatId: string) {
      parseSeatId(seatId);
      const [row] = await database
        .select()
        .from(vanguardInscriptions)
        .where(eq(vanguardInscriptions.seatId, seatId))
        .limit(1);
      if (!row) return null;
      const media = row.mediaId
        ? (
            await database
              .select()
              .from(vanguardMedia)
              .where(eq(vanguardMedia.id, row.mediaId))
              .limit(1)
          )[0]
        : undefined;
      return publicInscription(row, media);
    },
    async me(userId: string) {
      const [row] = await database
        .select()
        .from(vanguardInscriptions)
        .where(eq(vanguardInscriptions.userId, userId))
        .limit(1);
      if (!row) return null;
      const media = row.mediaId
        ? (
            await database
              .select()
              .from(vanguardMedia)
              .where(eq(vanguardMedia.id, row.mediaId))
              .limit(1)
          )[0]
        : undefined;
      return publicInscription(row, media);
    },
    async search(query: string) {
      const prefix =
        query
          .normalize("NFKC")
          .toLocaleLowerCase("und")
          .replace(/[\\%_]/g, "\\$&") + "%";
      const guildPrefix = guildSearchKey(query).replace(/[\\%_]/g, "\\$&") + "%";
      const rows = await database
        .select()
        .from(vanguardInscriptions)
        .where(
          and(
            eq(vanguardInscriptions.status, "active"),
            sql`${vanguardInscriptions.userId} is not null`,
            or(
              eq(vanguardInscriptions.seatId, query),
              sql`lower(${vanguardInscriptions.displayName}) like ${prefix}`,
              sql`${vanguardInscriptions.guildKey} like ${guildPrefix}`,
            ),
          ),
        )
        .orderBy(
          sql`case when ${vanguardInscriptions.seatId} = ${query} then 0 else 1 end`,
          vanguardInscriptions.seatId,
        )
        .limit(20);
      return rows.map((row) => publicInscription(row));
    },
  };
}
