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

The existing production auth/email runtime additionally requires its existing Google, Better Auth, Resend and account-lifecycle configuration. No passwords or Magic Links are enabled in the production feature configuration.

The R2 CORS and lifecycle JSON files in this directory are **configuration artifacts only**. Apply them only to the intended environment and verify actual readback before launch. Production upload origin is exactly https://www.tierlistbase.com; staging/preview must be separate. The private bucket must have no public custom domain. No public master or moderation derivative is allowed. Only approved permanent derivatives may be published. Pending lifecycle must not target permanent objects.

Workers AI invocation is a server-side REST call to @cf/cloudflare/clef-flash with the official System One question and image schema. Thresholds are deliberately null in vanguard.config.ts until real sample calibration. Synthetic provider tests prove error handling, not model accuracy, normal-combat acceptance, account billing readiness or real provider execution.

Official contract sources inspected on 2026-10-19:

- [Cloudflare Clef model schema](https://developers.cloudflare.com/workers-ai/models/clef/)
- [Clef input schema](https://developers.cloudflare.com/workers-ai/models/clef/schema-input.json)
- [Clef output schema](https://developers.cloudflare.com/workers-ai/models/clef/schema-output.json)
- [R2 S3 SDK and content-type-bound presigning](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)

Media/presign and media/complete orchestration, real-provider tests, browser crop, successful inscription media promotion and operations hide/delete acceptance remain implementation work. The adapter alone is not a completed upload workflow.
