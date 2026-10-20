import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { VanguardError } from "../domain/event";
export type VanguardR2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  privateBucket: string;
  publicBucket: string;
  publicOrigin: string;
  zoneId: string;
  purgeToken: string;
};
export function createVanguardR2(config: VanguardR2Config) {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    maxAttempts: 2,
  });
  const assertKey = (key: string) => {
    if (
      !/^vanguard\/(pending|permanent)\/[0-9a-f-]{36}\/(master|moderation|detail|wow-256|forever-128)\.webp$/.test(
        key,
      )
    )
      throw new Error("Invalid Vanguard media object key");
  };
  return {
    async presign(key: string) {
      assertKey(key);
      if (!key.startsWith("vanguard/pending/"))
        throw new Error("Upload must target private pending storage");
      return getSignedUrl(
        client,
        new PutObjectCommand({ Bucket: config.privateBucket, Key: key, ContentType: "image/webp" }),
        { expiresIn: 120, signableHeaders: new Set(["content-type"]) },
      );
    },
    async readPending(key: string) {
      assertKey(key);
      if (!key.startsWith("vanguard/pending/")) throw new Error("Expected pending media");
      const head = await client.send(
        new HeadObjectCommand({ Bucket: config.privateBucket, Key: key }),
      );
      if (!head.ContentLength || head.ContentLength > 4 * 1024 * 1024)
        throw new VanguardError("MEDIA_TOO_LARGE", 422);
      if (head.ContentType !== "image/webp") throw new VanguardError("MEDIA_FORMAT_INVALID", 422);
      const result = await client.send(
        new GetObjectCommand({ Bucket: config.privateBucket, Key: key, IfMatch: head.ETag }),
      );
      if (!result.Body) throw new VanguardError("MEDIA_DECODE_FAILED", 422);
      const chunks: Uint8Array[] = [];
      let size = 0;
      for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
        size += chunk.byteLength;
        if (size > 4 * 1024 * 1024) {
          throw new VanguardError("MEDIA_TOO_LARGE", 422);
        }
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    },
    async writePrivate(key: string, bytes: Buffer) {
      assertKey(key);
      await client.send(
        new PutObjectCommand({
          Bucket: config.privateBucket,
          Key: key,
          Body: bytes,
          ContentType: "image/webp",
          CacheControl: "private, no-store",
        }),
      );
    },
    async publishApproved(key: string, bytes: Buffer, approved: boolean) {
      assertKey(key);
      if (!approved || !key.startsWith("vanguard/permanent/"))
        throw new Error("Only approved permanent derivatives may be published");
      await client.send(
        new PutObjectCommand({
          Bucket: config.publicBucket,
          Key: key,
          Body: bytes,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
          IfNoneMatch: "*",
        }),
      );
    },
    async deletePending(key: string) {
      assertKey(key);
      if (!key.startsWith("vanguard/pending/")) throw new Error("Expected pending media");
      await client.send(new DeleteObjectCommand({ Bucket: config.privateBucket, Key: key }));
    },
    async revoke(keys: readonly string[]) {
      for (const key of keys) {
        assertKey(key);
        if (!key.startsWith("vanguard/permanent/")) throw new Error("Expected permanent media");
      }
      await Promise.all(
        keys.map((Key) =>
          client.send(new DeleteObjectCommand({ Bucket: config.publicBucket, Key })),
        ),
      );
      if (!keys.length) return;
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(config.zoneId)}/purge_cache`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.purgeToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: keys.map((key) => `${config.publicOrigin}/${key}`) }),
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!response.ok || ((await response.json()) as { success?: boolean }).success !== true)
        throw new Error("Vanguard public media cache purge failed");
    },
  };
}
