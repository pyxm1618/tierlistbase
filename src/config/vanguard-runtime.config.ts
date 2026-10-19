import "server-only";
import { z } from "zod";
import {
  VanguardError,
  createVanguardR2,
  removeVanguardAccount,
  createVanguardService,
  createVanguardLayoutLookup,
  createVanguardMediaService,
  createVanguardMediaPublisher,
  moderateVanguardImage,
} from "@/modules/wow-vanguard";
import { env as runtimeEnv } from "@/platform/config/env";
import { vanguardAssets, vanguardConfig } from "./vanguard.config";
import { db } from "@/platform/database/application-database";
const storageSchema = z.object({
  VANGUARD_CLOUDFLARE_ACCOUNT_ID: z.string().regex(/^[a-f0-9]{32}$/),
  VANGUARD_R2_ACCESS_KEY_ID: z.string().min(1),
  VANGUARD_R2_SECRET_ACCESS_KEY: z.string().min(1),
  VANGUARD_R2_PRIVATE_BUCKET: z.string().min(1),
  VANGUARD_R2_PUBLIC_BUCKET: z.string().min(1),
  VANGUARD_CLOUDFLARE_ZONE_ID: z.string().regex(/^[a-f0-9]{32}$/),
  VANGUARD_CLOUDFLARE_PURGE_TOKEN: z.string().min(1),
});
export function getVanguardR2() {
  const parsed = storageSchema.safeParse(process.env);
  if (!parsed.success) throw new VanguardError("UPLOAD_FAILED", 503);
  const env = parsed.data;
  if (env.VANGUARD_R2_PRIVATE_BUCKET === env.VANGUARD_R2_PUBLIC_BUCKET)
    throw new Error(
      "Vanguard pending storage must use a private bucket separate from public derivatives",
    );
  return createVanguardR2({
    accountId: env.VANGUARD_CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: env.VANGUARD_R2_ACCESS_KEY_ID,
    secretAccessKey: env.VANGUARD_R2_SECRET_ACCESS_KEY,
    privateBucket: env.VANGUARD_R2_PRIVATE_BUCKET,
    publicBucket: env.VANGUARD_R2_PUBLIC_BUCKET,
    publicOrigin: "https://media.tierlistbase.com",
    zoneId: env.VANGUARD_CLOUDFLARE_ZONE_ID,
    purgeToken: env.VANGUARD_CLOUDFLARE_PURGE_TOKEN,
  });
}
export async function removeVanguardBeforeAccountDeletion(userId: string) {
  await removeVanguardAccount(db, userId, (keys) => getVanguardR2().revoke(keys));
}

export function getVanguardService() {
  const catalog = createVanguardLayoutLookup(vanguardAssets.layouts, async (path) => {
    const response = await fetch(new URL(path, runtimeEnv.appOrigin), { cache: "force-cache" });
    if (!response.ok) throw new VanguardError("LAYOUT_UNAVAILABLE", 503);
    return response.arrayBuffer();
  });
  return createVanguardService(db, {
    seatExists: catalog.exists,
    nearestAvailable: catalog.nearest,
    publishMedia: (media) => createVanguardMediaPublisher(getVanguardR2())(media),
    revokeMedia: (keys) => getVanguardR2().revoke(keys),
  });
}
export function getVanguardMediaService() {
  const accountId = process.env.VANGUARD_CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.VANGUARD_WORKERS_AI_TOKEN;
  if (!accountId || !token) throw new VanguardError("MODERATION_UNAVAILABLE", 503);
  return createVanguardMediaService(db, {
    storage: getVanguardR2(),
    moderate: (image) =>
      moderateVanguardImage({
        accountId,
        token,
        image,
        thresholds: vanguardConfig.moderationThresholds,
      }),
  });
}
