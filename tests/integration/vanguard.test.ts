import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { sql, eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabaseClient } from "@/platform/database/client";
import { user } from "@/platform/database/auth-schema";
import {
  createVanguardService,
  vanguardEventState,
  vanguardInscriptions,
  vanguardSeatHolds,
  removeVanguardAccount,
  vanguardMedia,
} from "@/modules/wow-vanguard";
import { assertSafeTestDatabaseUrl } from "../support/test-database-guard";
const database = createDatabaseClient(assertSafeTestDatabaseUrl());
const now = new Date("2026-10-20T12:00:00Z");
const service = createVanguardService(database.db, {
  seatExists: () => true, // Test only: production always uses clock_timestamp().
  authorityTimeSql: sql`cast(${now.toISOString()} as timestamptz)`,
});
let first: string, second: string;
const draft = (seatId: string, holdToken: string) => ({
  seatId,
  holdToken,
  displayName: "Vanguard",
  faction: "alliance" as const,
  className: "Warrior" as const,
});
beforeAll(async () => {
  await migrate(database.db, { migrationsFolder: "drizzle" });
});
beforeEach(async () => {
  // Exact fixture set only, in the isolated guarded test database.
  await database.db.execute(sql`delete from vanguard_reports`);
  await database.db.execute(sql`delete from vanguard_inscriptions`);
  await database.db.execute(sql`delete from vanguard_seat_holds`);
  await database.db.execute(sql`delete from vanguard_event_state`);
  first = randomUUID();
  second = randomUUID();
  await database.db.insert(user).values(
    [first, second].map((id) => ({
      id,
      name: "Private Google name",
      email: `${id}@example.test`,
    })),
  );
});
afterAll(async () => {
  await database.close();
});
describe("Vanguard PostgreSQL transactional integrity", () => {
  it("allows exactly one hold winner for simultaneous users on the same seat", async () => {
    const results = await Promise.allSettled([
      service.hold("WOW-W1-0001", first),
      service.hold("WOW-W1-0001", second),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const loser = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
    expect(loser.reason.code).toBe("SEAT_ALREADY_CLAIMED");
    expect(loser.reason.status).toBe(409);
  });
  it("commits once, rejects an account's second seat globally and never leaks identity", async () => {
    expect((await service.manifest()).counts.total).toBe(0);
    const held = await service.hold("WOW-W1-0001", first);
    const result = await service.inscribe(first, draft("WOW-W1-0001", held.holdToken));
    expect(result.seatId).toBe("WOW-W1-0001");
    expect((await service.manifest()).counts.total).toBe(1);
    expect(JSON.stringify(result)).not.toMatch(/email|userId|Private Google|holdToken|@example/);
    await expect(service.hold("WOW-O-0001", first)).rejects.toMatchObject({
      code: "ACCOUNT_ALREADY_INSCRIBED",
    });
    expect((await database.db.select().from(vanguardEventState))[0]?.wowClaimedCount).toBe(1);
  });
  it("renews an expired free hold on OAuth return, but refuses stolen seats", async () => {
    const held = await service.hold("WOW-O-0001", null);
    await database.db
      .update(vanguardSeatHolds)
      .set({ expiresAt: new Date("2026-10-19T00:00:00Z") })
      .where(eq(vanguardSeatHolds.seatId, "WOW-O-0001"));
    const renewed = await service.hold("WOW-O-0001", first, held.holdToken);
    expect(renewed.holdToken).toBe(held.holdToken);
    await service.inscribe(first, draft("WOW-O-0001", renewed.holdToken));
    await expect(service.hold("WOW-O-0001", second, held.holdToken)).rejects.toMatchObject({
      code: "SEAT_ALREADY_CLAIMED",
    });
  });
  it("serializes concurrent 8014→8015→8016 and writes completion once", async () => {
    await database.db.insert(vanguardEventState).values({ id: 1, wowClaimedCount: 8014 });
    const holds = await Promise.all([
      service.hold("WOW-W2-2671", first),
      service.hold("WOW-W2-2672", second),
    ]);
    await Promise.all([
      service.inscribe(first, draft("WOW-W2-2671", holds[0]!.holdToken)),
      service.inscribe(second, draft("WOW-W2-2672", holds[1]!.holdToken)),
    ]);
    const state = (await database.db.select().from(vanguardEventState))[0]!;
    expect(state.wowClaimedCount).toBe(8016);
    expect(state.wowCompletedAt?.toISOString()).toBe(now.toISOString());
    await expect(
      service.inscribe(second, draft("WOW-W2-2672", holds[1]!.holdToken)),
    ).rejects.toMatchObject({ code: "PHASE_NOT_OPEN" });
    expect((await database.db.select().from(vanguardEventState))[0]?.wowCompletedAt).toEqual(
      state.wowCompletedAt,
    );
  });
  it("rejects writes at the exact database cutoff", async () => {
    const closed = createVanguardService(database.db, {
      seatExists: () => true,
      authorityTimeSql: sql`cast('2026-11-04T23:00:00Z' as timestamptz)`,
    });
    const held = await service.hold("WOW-W1-0001", first);
    await expect(
      closed.inscribe(first, draft("WOW-W1-0001", held.holdToken)),
    ).rejects.toMatchObject({ code: "EVENT_SEALED" });
    expect(await database.db.select().from(vanguardInscriptions)).toHaveLength(0);
    await expect(closed.hold("WOW-W1-0002", first)).rejects.toMatchObject({ code: "EVENT_SEALED" });
  });
  it("does not release an occupied hidden seat after identity deletion", async () => {
    const held = await service.hold("WOW-W1-0001", first);
    await service.inscribe(first, draft("WOW-W1-0001", held.holdToken));
    await removeVanguardAccount(database.db, first, async () => {
      throw new Error("No media expected");
    });
    await database.db.delete(user).where(eq(user.id, first));
    await expect(service.hold("WOW-W1-0001", second)).rejects.toMatchObject({
      code: "SEAT_ALREADY_CLAIMED",
    });
    expect(await service.focus("WOW-W1-0001")).toEqual({
      seatId: "WOW-W1-0001",
      status: "unavailable",
    });
  });
  it("enforces the global account constraint even for direct cross-phase writes", async () => {
    const held = await service.hold("WOW-W1-0001", first);
    await service.inscribe(first, draft("WOW-W1-0001", held.holdToken));
    await expect(
      database.db.insert(vanguardInscriptions).values({
        userId: first,
        seatId: "FOREVER-F-0001",
        phase: "forever",
        letter: "F",
        localIndex: 1,
        displayName: "Second",
        faction: "horde",
        className: "Mage",
      }),
    ).rejects.toThrow();
    expect(await database.db.select().from(vanguardInscriptions)).toHaveLength(1);
  });
  it("never accepts an unapproved media record", async () => {
    const held = await service.hold("WOW-W1-0001", first);
    const [media] = await database.db
      .insert(vanguardMedia)
      .values({
        ownerUserId: first,
        privateMasterKey: "private",
        moderationKey: "private",
        mime: "image/webp",
        moderationStatus: "pending",
      })
      .returning();
    await expect(
      service.inscribe(first, { ...draft("WOW-W1-0001", held.holdToken), mediaId: media!.id }),
    ).rejects.toMatchObject({ code: "MEDIA_MODERATION_REJECTED" });
    expect(await database.db.select().from(vanguardInscriptions)).toHaveLength(0);
  });
  it("rolls back privacy removal if public object revocation fails", async () => {
    const held = await service.hold("WOW-W1-0001", first);
    await service.inscribe(first, draft("WOW-W1-0001", held.holdToken));
    const [media] = await database.db
      .insert(vanguardMedia)
      .values({
        ownerUserId: first,
        privateMasterKey: "private",
        moderationKey: "private",
        mime: "image/webp",
        moderationStatus: "approved",
        publicDetailKey: "vanguard/permanent/image/detail.webp",
      })
      .returning();
    await expect(
      removeVanguardAccount(database.db, first, async () => {
        throw new Error("purge unavailable");
      }),
    ).rejects.toThrow("purge unavailable");
    expect((await service.me(first))?.status).toBe("active");
    expect(
      (await database.db.select().from(vanguardMedia).where(eq(vanguardMedia.id, media!.id)))[0]
        ?.moderationStatus,
    ).toBe("approved");
    await removeVanguardAccount(database.db, first, async (keys) => {
      expect(keys).toEqual(["vanguard/permanent/image/detail.webp"]);
    });
    expect(await service.focus("WOW-W1-0001")).toEqual({
      seatId: "WOW-W1-0001",
      status: "unavailable",
    });
    expect(await service.me(first)).toBeNull();
  });
  it("searches normalized guild prefixes and excludes hidden plates", async () => {
    const held = await service.hold("WOW-W1-0001", first);
    await service.inscribe(first, { ...draft("WOW-W1-0001", held.holdToken), guildName: "Straße" });
    expect(await service.search("Straße")).toHaveLength(1);
    await removeVanguardAccount(database.db, first, async () => {});
    expect(await service.search("Straße")).toHaveLength(0);
  });
});
it("rechecks database cutoff immediately before a new Hold write", async () => {
  const sequence = `vanguard_hold_clock_${randomUUID().replaceAll("-", "")}`;
  await database.db.execute(sql.raw(`create sequence ${sequence}`));
  try {
    const crossing = createVanguardService(database.db, {
      seatExists: async () => true,
      authorityTimeSql: sql.raw(
        `case when nextval('${sequence}')=1 then '2026-11-04T22:59:59Z'::timestamptz else '2026-11-04T23:00:00Z'::timestamptz end`,
      ),
    });
    await expect(crossing.hold("WOW-W1-0001", first)).rejects.toMatchObject({
      code: "EVENT_SEALED",
    });
    expect(await database.db.select().from(vanguardSeatHolds)).toHaveLength(0);
  } finally {
    await database.db.execute(sql.raw(`drop sequence ${sequence}`));
  }
});
it("rolls back an approved media promotion when the final write crosses cutoff", async () => {
  const sequence = `vanguard_publish_clock_${randomUUID().replaceAll("-", "")}`;
  await database.db.execute(sql.raw(`create sequence ${sequence}`));
  const mediaId = randomUUID();
  const keys = {
    publicDetailKey: `vanguard/permanent/${mediaId}/detail.webp`,
    publicWowThumbKey: `vanguard/permanent/${mediaId}/wow-256.webp`,
    publicForeverThumbKey: `vanguard/permanent/${mediaId}/forever-128.webp`,
  };
  let published = false;
  let globalEventLockWasFree = false;
  let mediaRowLockWasFree = false;
  let revoked: readonly string[] = [];
  try {
    const held = await createVanguardService(database.db, {
      seatExists: () => true,
      authorityTimeSql: sql`cast('2026-11-04T22:59:59Z' as timestamptz)`,
    }).hold("WOW-W1-0001", first);
    await database.db.insert(vanguardMedia).values({
      id: mediaId,
      ownerUserId: first,
      privateMasterKey: `vanguard/pending/${mediaId}/master.webp`,
      moderationKey: `vanguard/pending/${mediaId}/moderation.webp`,
      mime: "image/webp",
      moderationStatus: "approved",
      sha256: "a".repeat(64),
    });
    const crossing = createVanguardService(database.db, {
      seatExists: () => true,
      authorityTimeSql: sql.raw(
        `case when nextval('${sequence}')=1 then '2026-11-04T22:59:59Z'::timestamptz else '2026-11-04T23:00:00Z'::timestamptz end`,
      ),
      publishMedia: async () => {
        await database.db.transaction(async (transaction) => {
          await transaction.execute(
            sql`select id from vanguard_event_state where id = 1 for update nowait`,
          );
          await transaction.execute(
            sql`select id from vanguard_media where id = ${mediaId} for update nowait`,
          );
        });
        globalEventLockWasFree = true;
        mediaRowLockWasFree = true;
        published = true;
        return keys;
      },
      revokeMedia: async (keys) => {
        revoked = keys;
      },
    });
    await expect(
      crossing.inscribe(first, { ...draft("WOW-W1-0001", held.holdToken), mediaId }),
    ).rejects.toMatchObject({ code: "EVENT_SEALED" });
    expect(published).toBe(true);
    expect(globalEventLockWasFree).toBe(true);
    expect(mediaRowLockWasFree).toBe(true);
    expect(revoked).toEqual(Object.values(keys));
    expect(await database.db.select().from(vanguardInscriptions)).toHaveLength(0);
    const [media] = await database.db
      .select()
      .from(vanguardMedia)
      .where(eq(vanguardMedia.id, mediaId));
    expect(media?.publicDetailKey).toBeNull();
  } finally {
    await database.db.delete(vanguardMedia).where(eq(vanguardMedia.id, mediaId));
    await database.db.execute(sql.raw(`drop sequence ${sequence}`));
  }
});
it("publishes approved media only once across concurrent duplicate inscription attempts", async () => {
  const held = await service.hold("WOW-W1-0001", first);
  const mediaId = randomUUID();
  const keys = {
    publicDetailKey: `vanguard/permanent/${mediaId}/detail.webp`,
    publicWowThumbKey: `vanguard/permanent/${mediaId}/wow-256.webp`,
    publicForeverThumbKey: `vanguard/permanent/${mediaId}/forever-128.webp`,
  };
  await database.db.insert(vanguardMedia).values({
    id: mediaId,
    ownerUserId: first,
    privateMasterKey: `vanguard/pending/${mediaId}/master.webp`,
    moderationKey: `vanguard/pending/${mediaId}/moderation.webp`,
    mime: "image/webp",
    moderationStatus: "approved",
    sha256: "b".repeat(64),
  });
  let publishCalls = 0;
  const revocations: string[][] = [];
  const mediaService = createVanguardService(database.db, {
    seatExists: () => true,
    authorityTimeSql: sql`cast(${now.toISOString()} as timestamptz)`,
    publishMedia: async () => {
      publishCalls++;
      await new Promise((resolve) => setTimeout(resolve, 25));
      return keys;
    },
    revokeMedia: async (publishedKeys) => {
      revocations.push([...publishedKeys]);
    },
  });
  const payload = { ...draft("WOW-W1-0001", held.holdToken), mediaId };
  const results = await Promise.allSettled([
    mediaService.inscribe(first, payload),
    mediaService.inscribe(first, payload),
  ]);

  expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
  expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
  expect(publishCalls).toBe(1);
  expect(revocations).toEqual([]);
  const [media] = await database.db
    .select()
    .from(vanguardMedia)
    .where(eq(vanguardMedia.id, mediaId));
  expect(media?.publicDetailKey).toBe(keys.publicDetailKey);
  expect((await service.focus("WOW-W1-0001"))?.image?.detail).toBe(
    `https://media.tierlistbase.com/${keys.publicDetailKey}`,
  );
});

it("keeps manifest compact and stable until a real inscription changes occupancy", async () => {
  const empty = await service.manifest();
  expect(empty.phase).toBe("wow");
  expect(Buffer.from(empty.occupancy, "base64")).toHaveLength(1002);
  expect((await service.manifest()).version).toBe(empty.version);
  const held = await service.hold("WOW-W1-0001", first);
  await service.inscribe(first, draft("WOW-W1-0001", held.holdToken));
  const occupied = await service.manifest();
  expect(occupied.counts).toEqual({ wow: 1, forever: 0, total: 1 });
  expect(Buffer.from(occupied.occupancy, "base64")[0]).toBe(1);
  expect(occupied.version).not.toBe(empty.version);
  expect(JSON.stringify(occupied)).not.toMatch(
    /displayName|email|userId|Private Google|battleCry|guildName/,
  );
});
