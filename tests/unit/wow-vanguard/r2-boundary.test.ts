import { randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createVanguardR2 } from "@/modules/wow-vanguard";
const id = randomUUID();
const pending = `vanguard/pending/${id}/master.webp`;
const keys = ["detail", "wow-256", "forever-128"].map(
  (name) => `vanguard/permanent/${id}/${name}.webp`,
);
const storage = () =>
  createVanguardR2({
    accountId: "a".repeat(32),
    accessKeyId: randomUUID(),
    secretAccessKey: randomUUID(),
    privateBucket: "private-test",
    publicBucket: "public-test",
    publicOrigin: "https://media.tierlistbase.com",
    zoneId: "b".repeat(32),
    purgeToken: randomUUID(),
  });
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("binds short signed PUT to a private server key and webp content type", async () => {
  const url = new URL(await storage().presign(pending));
  expect(url.hostname).toBe("private-test." + "a".repeat(32) + ".r2.cloudflarestorage.com");
  expect(url.searchParams.get("X-Amz-Expires")).toBe("120");
  expect(url.searchParams.get("X-Amz-SignedHeaders")).toContain("content-type");
  await expect(storage().presign(keys[0]!)).rejects.toThrow("private pending");
});
it("checks server HEAD size/type before bounded reads and binds Get to the observed ETag", async () => {
  const seen: unknown[] = [];
  vi.spyOn(S3Client.prototype, "send").mockImplementation((async (command: unknown) => {
    seen.push(command);
    if (command instanceof HeadObjectCommand)
      return { ContentLength: 3, ContentType: "image/webp", ETag: '"hash"' };
    return {
      Body: (async function* () {
        yield Buffer.from("abc");
      })(),
    };
  }) as never);
  expect(await storage().readPending(pending)).toEqual(Buffer.from("abc"));
  expect((seen[1] as GetObjectCommand).input).toMatchObject({
    Bucket: "private-test",
    Key: pending,
    IfMatch: '"hash"',
  });
});
it("rejects oversized uploads and never publishes pending or rejected media", async () => {
  const send = vi
    .spyOn(S3Client.prototype, "send")
    .mockResolvedValue({ ContentLength: 4 * 1024 * 1024 + 1 } as never);
  await expect(storage().readPending(pending)).rejects.toMatchObject({ code: "MEDIA_TOO_LARGE" });
  expect(send).toHaveBeenCalledTimes(1);
  await expect(storage().publishApproved(keys[0]!, Buffer.from("x"), false)).rejects.toThrow(
    "Only approved",
  );
  await expect(storage().publishApproved(pending, Buffer.from("x"), true)).rejects.toThrow(
    "Only approved",
  );
});
it("revokes all three public objects and verifies successful CDN purge", async () => {
  const commands: unknown[] = [];
  vi.spyOn(S3Client.prototype, "send").mockImplementation((async (command: unknown) => {
    commands.push(command);
    return {};
  }) as never);
  const purge = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    expect(String(url)).toContain("/purge_cache");
    expect(init?.method).toBe("POST");
    return Response.json({ success: true });
  });
  vi.stubGlobal("fetch", purge);
  await storage().revoke(keys);
  expect(commands.every((command) => command instanceof DeleteObjectCommand)).toBe(true);
  expect(commands).toHaveLength(3);
  expect(JSON.parse(purge.mock.calls[0]![1]!.body as string).files).toEqual(
    keys.map((key) => `https://media.tierlistbase.com/${key}`),
  );
  vi.stubGlobal("fetch", async () => Response.json({ success: false }));
  await expect(storage().revoke(keys)).rejects.toThrow("purge failed");
});
