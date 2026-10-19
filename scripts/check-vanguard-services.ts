// Read-only local configuration inventory. Presence is NOT provider acceptance.
import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { vanguardAssets, vanguardConfig } from "@/config/vanguard.config";
const groups = {
  google: [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "BETTER_AUTH_SECRET",
    "APP_ORIGIN",
    "DATABASE_URL",
  ],
  r2: [
    "VANGUARD_CLOUDFLARE_ACCOUNT_ID",
    "VANGUARD_R2_ACCESS_KEY_ID",
    "VANGUARD_R2_SECRET_ACCESS_KEY",
    "VANGUARD_R2_PRIVATE_BUCKET",
    "VANGUARD_R2_PUBLIC_BUCKET",
    "VANGUARD_CLOUDFLARE_ZONE_ID",
    "VANGUARD_CLOUDFLARE_PURGE_TOKEN",
  ],
  clef: ["VANGUARD_CLOUDFLARE_ACCOUNT_ID", "VANGUARD_WORKERS_AI_TOKEN"],
  resend: ["RESEND_API_KEY", "EMAIL_FROM", "SUPPORT_EMAIL"],
};
const configuration = Object.entries(groups).map(([service, names]) => ({
  service,
  fields: names.map((name) => ({
    name,
    status: process.env[name]?.trim() ? "PRESENT_UNVERIFIED" : "MISSING",
  })),
}));
const audio = [];
for (const url of [vanguardAssets.bgm, ...Object.values(vanguardAssets.sfx)]) {
  await access(`public${url}`);
  const bytes = await readFile(`public${url}`);
  audio.push({ file: url, sha256: createHash("sha256").update(bytes).digest("hex") });
}
console.log(
  JSON.stringify(
    {
      configuration,
      audio,
      claim: "CLOSED_UNTIL_FINAL_MASK_LAYOUT",
      layoutConfigured: Object.keys(vanguardAssets.layouts).length > 0,
      moderationThresholds:
        vanguardConfig.moderationThresholds === null
          ? "UNCALIBRATED_FAIL_CLOSED"
          : "CONFIGURED_UNVERIFIED",
      externalServices: "NOT_CONTACTED",
      productionChanged: false,
    },
    null,
    2,
  ),
);
if (configuration.some((group) => group.fields.some((field) => field.status === "MISSING")))
  process.exitCode = 1;
