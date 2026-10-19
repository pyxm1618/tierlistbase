# Vanguard foundation file inventory

All paths are relative to this isolated worktree. Both frozen specification files are unchanged.

| File | Purpose |
| --- | --- |
| `bun.lock` | Vanguard R2 SDK and trusted image processing dependencies |
| `docs/wow-forever-vanguard/implementation/files.md` | Implementation status, provenance or unapplied R2 configuration artifact |
| `docs/wow-forever-vanguard/implementation/r2/cors.production.json` | Implementation status, provenance or unapplied R2 configuration artifact |
| `docs/wow-forever-vanguard/implementation/r2/lifecycle.private.json` | Implementation status, provenance or unapplied R2 configuration artifact |
| `docs/wow-forever-vanguard/implementation/services.md` | Server configuration requirements and official contract provenance; no live service acceptance |
| `docs/wow-forever-vanguard/implementation/status.md` | Implementation status, provenance or unapplied R2 configuration artifact |
| `drizzle.config.ts` | Register Vanguard schema in existing migration tooling |
| `drizzle/0019_exotic_bug.sql` | Drizzle-generated migration, snapshot or journal |
| `drizzle/meta/0019_snapshot.json` | Drizzle-generated migration, snapshot or journal |
| `drizzle/meta/_journal.json` | Drizzle-generated migration, snapshot or journal |
| `next.config.ts` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `package.json` | Vanguard R2 SDK and trusted image processing dependencies |
| `scripts/verify-migrations.ts` | Register Vanguard schema in existing migration tooling |
| `src/app/(account)/account/page.tsx` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `src/app/(account)/account/vanguard/page.tsx` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `src/app/(account)/sign-in/google-sign-in.tsx` | Existing Google authentication, magic-link gate, account deletion hook or callback integration |
| `src/app/(account)/sign-in/page.tsx` | Existing Google authentication, magic-link gate, account deletion hook or callback integration |
| `src/app/(marketing)/wow-forever/tier-list/page.tsx` | Existing Tier List class deep link and role preservation |
| `src/app/(marketing)/wow-forever/vanguard/page.tsx` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `src/app/api/vanguard/_runtime.ts` | Vanguard server route and existing security boundary integration |
| `src/app/api/vanguard/holds/route.ts` | Vanguard server route and existing security boundary integration |
| `src/app/api/vanguard/inscriptions/[seatId]/route.ts` | Vanguard server route and existing security boundary integration |
| `src/app/api/vanguard/inscriptions/route.ts` | Vanguard server route and existing security boundary integration |
| `src/app/api/vanguard/manifest/route.ts` | Vanguard server route and existing security boundary integration |
| `src/app/api/vanguard/me/route.ts` | Vanguard server route and existing security boundary integration |
| `src/app/api/vanguard/reports/route.ts` | Vanguard server route and existing security boundary integration |
| `src/app/api/vanguard/search/route.ts` | Vanguard server route and existing security boundary integration |
| `src/components/navigation/site-footer.tsx` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `src/config/features.config.ts` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `src/config/legal.config.ts` | Vanguard legal additions remain draft; existing release gate preserved |
| `src/config/routes.config.ts` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `src/config/vanguard-runtime.config.ts` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `src/config/vanguard.config.ts` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `src/modules/meta-board/wow/role-links.tsx` | Existing Tier List class deep link and role preservation |
| `src/modules/meta-board/wow/workspace.tsx` | Existing Tier List class deep link and role preservation |
| `src/modules/wow-vanguard/db/removal.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/db/schema.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/db/service.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/domain/event.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/domain/layout.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/domain/links.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/domain/validation.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/index.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/media/moderation.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/media/normalize.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/modules/wow-vanguard/media/r2.ts` | Vanguard domain, transactional persistence, media adapter or public module entry |
| `src/platform/analytics/events.ts` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `src/platform/auth/auth.ts` | Existing Google authentication, magic-link gate, account deletion hook or callback integration |
| `src/platform/auth/callback-url.ts` | Existing Google authentication, magic-link gate, account deletion hook or callback integration |
| `src/platform/auth/create-auth.ts` | Existing Google authentication, magic-link gate, account deletion hook or callback integration |
| `src/platform/email/email-sender.ts` | Existing route, account, security, analytics or navigation integration required by Vanguard |
| `tests/e2e/vanguard-foundation.spec.ts` | Vanguard domain, database or browser foundation verification |
| `tests/integration/vanguard.test.ts` | Vanguard domain, database or browser foundation verification |
| `tests/unit/analytics/production-ga4-config.test.ts` | Vanguard legal additions remain draft; existing release gate preserved |
| `tests/unit/database/migration-metadata.test.ts` | Register Vanguard schema in existing migration tooling |
| `tests/unit/wow-vanguard/event.test.ts` | Vanguard domain, database or browser foundation verification |
| `tests/unit/wow-vanguard/integration-boundaries.test.ts` | Vanguard domain, database or browser foundation verification |
| `tests/unit/wow-vanguard/links.test.ts` | Vanguard domain, database or browser foundation verification |
| `tests/unit/wow-vanguard/media.test.ts` | Vanguard domain, database or browser foundation verification |
| `tests/unit/wow-vanguard/moderation-provider.test.ts` | Vanguard domain, database or browser foundation verification |
| `tests/unit/wow-vanguard/removal-and-layout.test.ts` | Vanguard domain, database or browser foundation verification |
| `tests/unit/wow-vanguard/report.test.ts` | Vanguard domain, database or browser foundation verification |

## Continuation file inventory

Exactly 74 changed/added files in this continuation; all reviewed against frozen Vanguard scope.

| File | Purpose | Scope |
| --- | --- | --- |
| `.github/workflows/ci.yml` | Run Google-only Vanguard browser profile in existing CI | PASS |
| `.prettierignore` | Exclude only vendored generated runtime from source lint/format | PASS |
| `bun.lock` | Pinned Vanguard runtime/type dependencies and repaired incidental lock drift | PASS |
| `docs/wow-forever-vanguard/implementation/files.md` | This exact continuation file inventory | PASS |
| `docs/wow-forever-vanguard/implementation/next-stage.md` | Implementation scope, provenance or verification ledger; frozen source documents untouched | PASS |
| `docs/wow-forever-vanguard/implementation/scope-audit-b976dbb.md` | Implementation scope, provenance or verification ledger; frozen source documents untouched | PASS |
| `docs/wow-forever-vanguard/implementation/services.md` | Implementation scope, provenance or verification ledger; frozen source documents untouched | PASS |
| `docs/wow-forever-vanguard/implementation/status.md` | Implementation scope, provenance or verification ledger; frozen source documents untouched | PASS |
| `eslint.config.mjs` | Exclude only vendored generated runtime from source lint/format | PASS |
| `next.config.ts` | Required Vanguard composition, read-only account, auth test profile, security/cache or consent integration | PASS |
| `package.json` | Pinned Vanguard runtime/type dependencies and repaired incidental lock drift | PASS |
| `playwright.vanguard.config.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `public/vendor/vanguard/.gitattributes` | Preserve upstream generated loader bytes with a vendor-only Git whitespace attribute | PASS |
| `public/vendor/vanguard/LICENSE-2.0.txt` | Pinned self-hosted MediaPipe technical runtime/model and license; no final visual asset | PASS |
| `public/vendor/vanguard/README.md` | Pinned self-hosted MediaPipe technical runtime/model and license; no final visual asset | PASS |
| `public/vendor/vanguard/hand_landmarker-v1.task` | Pinned self-hosted MediaPipe technical runtime/model and license; no final visual asset | PASS |
| `public/vendor/vanguard/mediapipe-1.1.1/vision_wasm_internal.js` | Pinned self-hosted MediaPipe technical runtime/model and license; no final visual asset | PASS |
| `public/vendor/vanguard/mediapipe-1.1.1/vision_wasm_internal.wasm` | Pinned self-hosted MediaPipe technical runtime/model and license; no final visual asset | PASS |
| `public/vendor/vanguard/mediapipe-1.1.1/vision_wasm_module_internal.js` | Pinned self-hosted MediaPipe technical runtime/model and license; no final visual asset | PASS |
| `public/vendor/vanguard/mediapipe-1.1.1/vision_wasm_module_internal.wasm` | Pinned self-hosted MediaPipe technical runtime/model and license; no final visual asset | PASS |
| `public/vendor/vanguard/mediapipe-1.1.1/vision_wasm_nosimd_internal.js` | Pinned self-hosted MediaPipe technical runtime/model and license; no final visual asset | PASS |
| `public/vendor/vanguard/mediapipe-1.1.1/vision_wasm_nosimd_internal.wasm` | Pinned self-hosted MediaPipe technical runtime/model and license; no final visual asset | PASS |
| `scripts/verify-seo.ts` | Register SSR Vanguard as an existing-validator bespoke indexable page | PASS |
| `src/app/(account)/account/vanguard/page.tsx` | Required Vanguard composition, read-only account, auth test profile, security/cache or consent integration | PASS |
| `src/app/(marketing)/wow-forever/vanguard/page.tsx` | Required Vanguard composition, read-only account, auth test profile, security/cache or consent integration | PASS |
| `src/app/api/vanguard/_runtime.ts` | Existing server boundaries and Vanguard API orchestration | PASS |
| `src/app/api/vanguard/media/complete/route.ts` | Existing server boundaries and Vanguard API orchestration | PASS |
| `src/app/api/vanguard/media/presign/route.ts` | Existing server boundaries and Vanguard API orchestration | PASS |
| `src/app/api/vanguard/reports/route.ts` | Existing server boundaries and Vanguard API orchestration | PASS |
| `src/config/features.config.ts` | Required Vanguard composition, read-only account, auth test profile, security/cache or consent integration | PASS |
| `src/config/vanguard-runtime.config.ts` | Required Vanguard composition, read-only account, auth test profile, security/cache or consent integration | PASS |
| `src/config/vanguard.config.ts` | Required Vanguard composition, read-only account, auth test profile, security/cache or consent integration | PASS |
| `src/modules/wow-vanguard/client/api.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/canvas.tsx` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/claim.tsx` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/contracts.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/crop.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/entry.tsx` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/experience.tsx` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/plate.tsx` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/response.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/seal.tsx` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/client/tracking.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/db/removal.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/db/reports.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/db/service.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/domain/catalog.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/domain/text.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/domain/validation.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/experience/audio.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/experience/gestures.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/experience/scene.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/experience/thumbnails.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/index.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/media/image-header.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/media/moderation.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/media/normalize.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/media/publish.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/modules/wow-vanguard/media/service.ts` | Frozen Vanguard domain, media, immutable Claim/browse or experience interface implementation | PASS |
| `src/platform/analytics/events.ts` | Required Vanguard composition, read-only account, auth test profile, security/cache or consent integration | PASS |
| `src/platform/security/content-security-policy.ts` | Required Vanguard composition, read-only account, auth test profile, security/cache or consent integration | PASS |
| `src/proxy.ts` | Required Vanguard composition, read-only account, auth test profile, security/cache or consent integration | PASS |
| `tests/e2e/vanguard-flows.spec.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/e2e/vanguard-foundation.spec.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/integration/vanguard-media.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/integration/vanguard-report.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/integration/vanguard.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/unit/wow-vanguard/analytics-events.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/unit/wow-vanguard/catalog.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/unit/wow-vanguard/client-contracts.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/unit/wow-vanguard/media.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/unit/wow-vanguard/publish.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/unit/wow-vanguard/scene.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
| `tests/unit/wow-vanguard/thumbnail.test.ts` | Vanguard automated regression / isolated fixture coverage | PASS |
