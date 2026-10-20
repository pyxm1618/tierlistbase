import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { sql, eq, inArray } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import sharp from "sharp";
import { createDatabaseClient } from "@/platform/database/client";
import { user } from "@/platform/database/auth-schema";
import { createVanguardMediaService, vanguardMedia } from "@/modules/wow-vanguard";
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
