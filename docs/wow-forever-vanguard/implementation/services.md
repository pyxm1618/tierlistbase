# External service configuration and evidence boundary

No production Cloudflare, Google or Resend configuration has been changed by this implementation.

R2 adapter requires server-only values:

- VANGUARD_CLOUDFLARE_ACCOUNT_ID
- VANGUARD_R2_ACCESS_KEY_ID
- VANGUARD_R2_SECRET_ACCESS_KEY
- VANGUARD_R2_PRIVATE_BUCKET
- VANGUARD_R2_PUBLIC_BUCKET (distinct from private bucket)
- VANGUARD_CLOUDFLARE_ZONE_ID
- VANGUARD_CLOUDFLARE_PURGE_TOKEN
- VANGUARD_WORKERS_AI_TOKEN (Workers AI inference permission; server only)

The existing production auth/email runtime additionally requires its existing Google, Better Auth, Resend and account-lifecycle configuration. No passwords or Magic Links are enabled in the production feature configuration.

The R2 CORS and lifecycle JSON files in this directory are **configuration artifacts only**. Apply them only to the intended environment and verify actual readback before launch. Production upload origin is exactly https://www.tierlistbase.com; staging/preview must be separate. The private bucket must have no public custom domain. No public master or moderation derivative is allowed. Only approved permanent derivatives may be published. Pending lifecycle must not target permanent objects.

Workers AI invocation is a server-side REST call to @cf/cloudflare/clef-flash with the official System One question and image schema. Thresholds are deliberately null in vanguard.config.ts until real sample calibration. Synthetic provider tests prove error handling, not model accuracy, normal-combat acceptance, account billing readiness or real provider execution.

Official contract sources inspected on 2026-10-19:

- [Cloudflare Clef model schema](https://developers.cloudflare.com/workers-ai/models/clef/)
- [Clef input schema](https://developers.cloudflare.com/workers-ai/models/clef/schema-input.json)
- [Clef output schema](https://developers.cloudflare.com/workers-ai/models/clef/schema-output.json)
- [R2 S3 SDK and content-type-bound presigning](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)

Continuation implements authenticated presign/complete routes, local square crop and normalization, private pending moderation, approved-only publication within the inscription flow, compensating revocation on failed commits, public media projection, and scoped hide/delete revocation. Automated tests use isolated PostgreSQL and explicit storage/provider fixtures. Real R2 upload/CORS/lifecycle/readback/purge, Google OAuth, Resend delivery and calibrated Workers AI sample acceptance remain external launch gates. No production provider settings were changed.

Production image normalization uses pinned `@cf-wasm/photon@0.4.0` conditional Node/workerd WASM exports. Sharp remains a development-only independent fixture/metadata oracle. A local Wrangler/workerd smoke invoked the real normalizer and verified 512/1024/256/128 derivatives; this is runtime compatibility evidence, not a live provider test.

Gesture detection uses pinned `@mediapipe/tasks-vision@1.1.1`, with its WASM/loaders and official revision-1 Hand Landmarker model self-hosted under `public/vendor/vanguard`. Camera starts only after Enable Gesture Control; a browser test uses a fake device, loads the real self-hosted detector, and verifies track cleanup. Physical camera/device accuracy remains unverified.

Scene code uses pinned `three@0.186.1` with development types `@types/three@0.186.0`. The final mask-derived layout, Plate texture and art must be supplied through `vanguardAssets`; absent assets do not create fabricated production coordinates. Instancing, phase loading, geometric neighbor lookup, device budgets and controls are implemented independently of final visual acceptance.
