import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { sql, eq, inArray } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import sharp from "sharp";
import { createDatabaseClient } from "@/platform/database/client";
import { user } from "@/platform/database/auth-schema";
import {
  createVanguardService,
  createVanguardMediaService,
  vanguardMedia,
  VanguardError,
} from "@/modules/wow-vanguard";
import { assertSafeTestDatabaseUrl } from "../support/test-database-guard";
const database = createDatabaseClient(assertSafeTestDatabaseUrl());
const owner = randomUUID();
const other = randomUUID();
const objects = new Map<string, Buffer>();
const storage = {
  async presign(key: string) {
    return `https://upload.example.test/${key}`;
  },
  async readPending(key: string) {
    const bytes = objects.get(key);
    if (!bytes) throw new Error("not uploaded");
    return bytes;
  },
  async writePrivate(key: string, bytes: Buffer) {
    objects.set(key, bytes);
  },
  async deletePending(key: string) {
    objects.delete(key);
  },
};
const now = sql`cast('2026-10-20T00:00:00Z' as timestamptz)`;
const service = (decision: "approved" | "rejected" | "uncertain" = "approved", clock = now) =>
  createVanguardMediaService(database.db, {
    storage,
    consumeModeration: async () => {},
    moderate: async () => ({ decision, probabilities: {} }),
    authorityTimeSql: clock,
  });
beforeAll(async () => {
  await migrate(database.db, { migrationsFolder: "drizzle" });
  await database.db
    .insert(user)
    .values(
      [owner, other].map((id) => ({ id, name: "Private name", email: `${id}@example.test` })),
    );
});
afterAll(async () => {
  await database.db.delete(vanguardMedia).where(inArray(vanguardMedia.ownerUserId, [owner, other]));
  await database.db.delete(user).where(inArray(user.id, [owner, other]));
  await database.close();
});
it("keeps approved uploads private and returns no private key or identity", async () => {
  const result = await service().presign(owner);
  const [record] = await database.db
    .select()
    .from(vanguardMedia)
    .where(eq(vanguardMedia.id, result.mediaId));
  objects.set(
    record!.privateMasterKey,
    await sharp({ create: { width: 512, height: 512, channels: 3, background: "blue" } })
      .webp()
      .toBuffer(),
  );
  const completed = await service().complete(owner, result.mediaId);
  expect(completed).toEqual({ mediaId: result.mediaId, status: "approved" });
  const [updated] = await database.db
    .select()
    .from(vanguardMedia)
    .where(eq(vanguardMedia.id, result.mediaId));
  expect(updated?.publicDetailKey).toBeNull();
  expect(updated?.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(JSON.stringify(completed)).not.toMatch(/private|owner|user|base64/);
  await expect(service().complete(other, result.mediaId)).rejects.toMatchObject({
    code: "MEDIA_NOT_FOUND",
  });
});
it("does not approve uncertain or rejected media", async () => {
  for (const decision of ["uncertain", "rejected"] as const) {
    const result = await service().presign(owner);
    objects.set(
      `vanguard/pending/${result.mediaId}/master.webp`,
      await sharp({ create: { width: 512, height: 512, channels: 3, background: "blue" } })
        .webp()
        .toBuffer(),
    );
    await expect(service(decision).complete(owner, result.mediaId)).rejects.toMatchObject({
      code: decision === "rejected" ? "MEDIA_MODERATION_REJECTED" : "MODERATION_UNAVAILABLE",
    });
    const [record] = await database.db
      .select()
      .from(vanguardMedia)
      .where(eq(vanguardMedia.id, result.mediaId));
    expect(record?.moderationStatus).toBe(decision === "rejected" ? "rejected" : "pending");
    expect(record?.publicDetailKey).toBeNull();
  }
});
it("rejects new presign and completion at the exact database cutoff", async () => {
  const closed = service("approved", sql`cast('2026-11-04T23:00:00Z' as timestamptz)`);
  await expect(closed.presign(owner)).rejects.toMatchObject({ code: "EVENT_SEALED" });
  const result = await service().presign(owner);
  await expect(closed.complete(owner, result.mediaId)).rejects.toMatchObject({
    code: "EVENT_SEALED",
  });
});

it("caches decided media under concurrent complete and keeps unavailable retryable", async () => {
  let calls = 0;
  let unavailable = true;
  let decision: "approved" | "rejected" | "uncertain" = "approved";
  const checked = createVanguardMediaService(database.db, {
    storage,
    authorityTimeSql: now,
    consumeModeration: async () => {},
    moderate: async () => {
      calls++;
      if (unavailable) throw new VanguardError("MODERATION_UNAVAILABLE", 503);
      return { decision, probabilities: {} };
    },
  });
  async function upload() {
    const media = await checked.presign(owner);
    objects.set(
      `vanguard/pending/${media.mediaId}/master.webp`,
      await sharp({ create: { width: 512, height: 512, channels: 3, background: "blue" } })
        .webp()
        .toBuffer(),
    );
    return media.mediaId;
  }
  const id = await upload();
  await expect(checked.complete(owner, id)).rejects.toMatchObject({
    code: "MODERATION_UNAVAILABLE",
  });
  unavailable = false;
  await Promise.all([checked.complete(owner, id), checked.complete(owner, id)]);
  expect(calls).toBe(2);
  for (const result of ["rejected", "uncertain"] as const) {
    decision = result;
    const replacement = await upload();
    const before = calls;
    await expect(checked.complete(owner, replacement)).rejects.toBeInstanceOf(VanguardError);
    await expect(checked.complete(owner, replacement)).rejects.toBeInstanceOf(VanguardError);
    expect(calls).toBe(before + 1);
  }
  decision = "approved";
  await expect(checked.complete(owner, await upload())).resolves.toMatchObject({
    status: "approved",
  });
});

it("limits only provider invocations per account over the configured long window", async () => {
  const { createVanguardModerationLimiter } = await import("@/modules/wow-vanguard");
  const { vanguardConfig } = await import("@/config/vanguard.config");
  const consume = createVanguardModerationLimiter(
    assertSafeTestDatabaseUrl(),
    "closeout-test-secret-at-least-thirty-two-characters",
    vanguardConfig.moderationLimit,
  );
  let calls = 0;
  const guarded = createVanguardMediaService(database.db, {
    storage,
    authorityTimeSql: now,
    consumeModeration: consume,
    moderate: async () => {
      calls++;
      throw new VanguardError("MODERATION_UNAVAILABLE", 503);
    },
  });
  async function upload(account: string) {
    const result = await guarded.presign(account);
    objects.set(
      `vanguard/pending/${result.mediaId}/master.webp`,
      await sharp({ create: { width: 512, height: 512, channels: 3, background: "blue" } })
        .webp()
        .toBuffer(),
    );
    return result.mediaId;
  }
  const id = await upload(owner);
  for (let i = 0; i < vanguardConfig.moderationLimit.max; i++)
    await expect(guarded.complete(owner, id)).rejects.toMatchObject({
      code: "MODERATION_UNAVAILABLE",
    });
  await expect(guarded.complete(owner, id)).rejects.toMatchObject({ code: "RATE_LIMITED" });
  expect(calls).toBe(vanguardConfig.moderationLimit.max);
  await expect(createVanguardService(database.db).manifest()).resolves.toHaveProperty("version");
  await expect(guarded.presign(owner)).resolves.toHaveProperty("mediaId");
  await expect(guarded.complete(other, await upload(other))).rejects.toMatchObject({
    code: "MODERATION_UNAVAILABLE",
  });
  expect(calls).toBe(vanguardConfig.moderationLimit.max + 1);
});

it("does not starve a saturated media connection pool while reserving moderation quota", async () => {
  const { createVanguardModerationLimiter } = await import("@/modules/wow-vanguard");
  const small = createDatabaseClient(assertSafeTestDatabaseUrl(), 1);
  const isolated = createVanguardMediaService(small.db, {
    storage,
    authorityTimeSql: now,
    consumeModeration: createVanguardModerationLimiter(
      assertSafeTestDatabaseUrl(),
      "pool-test-secret-at-least-thirty-two-characters",
      { max: 20, windowMs: 86400_000 },
    ),
    moderate: async () => ({ decision: "approved", probabilities: {} }),
  });
  const media = await isolated.presign(other);
  objects.set(
    `vanguard/pending/${media.mediaId}/master.webp`,
    await sharp({ create: { width: 512, height: 512, channels: 3, background: "blue" } })
      .webp()
      .toBuffer(),
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      isolated.complete(other, media.mediaId),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("moderation quota starved media pool")), 2000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
    await small.close();
  }
});
