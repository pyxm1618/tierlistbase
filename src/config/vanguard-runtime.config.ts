import "server-only";
import { z } from "zod";
import { createVanguardR2, removeVanguardAccount } from "@/modules/wow-vanguard";
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
  if (!parsed.success) throw new Error("Vanguard R2 configuration is incomplete");
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
