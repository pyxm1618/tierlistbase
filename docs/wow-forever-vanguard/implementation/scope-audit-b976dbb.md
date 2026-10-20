# b976dbb diff scope audit

Audited baseline: `b976dbb^..b976dbb`, exactly 62 files. Frozen specifications are the sole product/design authority. This audit does not imply implementation acceptance.

The initial audit found one incidental dependency upgrade inside bun.lock: @emnapi/runtime 1.10.0 to 1.11.3. It was not necessary for the frozen requirement and has been restored to the parent locked version. No direct dependency upgrades were found. The other semver lock changes relocate already-existing locked versions for the new image-processing dependency.

Final gate: 62 = 61 PASS + 1 REPAIRED + 0 DEFERRED + 0 REJECT + 0 UNREVIEWED. Current tree has no identified out-of-scope change remaining. The finding is preserved instead of falsely claiming the original commit was perfectly scope-clean.

Existing snapshot tables were compared semantically: no prior table changed and exactly five Vanguard tables added. Frozen requirement/design blobs are unchanged from the parent. No push, deployment, production configuration or production migration occurred.

| File | Frozen authority | Audit state | Item-level evidence |
| --- | --- | --- | --- |
| `bun.lock` | technical §0,17–19 | REPAIRED | R2 SDK and Sharp required; restored incidental @emnapi/runtime 1.11.3→1.10.0 to parent version. semver changes relocate already-locked versions for dependency resolution. |
| `docs/wow-forever-vanguard/implementation/files.md` | technical §39,42 | PASS | Implementation evidence/ledger/config artifacts only. Neither frozen document edited. Artifacts not deployed. |
| `docs/wow-forever-vanguard/implementation/r2/cors.production.json` | technical §39,42 | PASS | Implementation evidence/ledger/config artifacts only. Neither frozen document edited. Artifacts not deployed. |
| `docs/wow-forever-vanguard/implementation/r2/lifecycle.private.json` | technical §39,42 | PASS | Implementation evidence/ledger/config artifacts only. Neither frozen document edited. Artifacts not deployed. |
| `docs/wow-forever-vanguard/implementation/services.md` | technical §39,42 | PASS | Implementation evidence/ledger/config artifacts only. Neither frozen document edited. Artifacts not deployed. |
| `docs/wow-forever-vanguard/implementation/status.md` | technical §39,42 | PASS | Implementation evidence/ledger/config artifacts only. Neither frozen document edited. Artifacts not deployed. |
| `drizzle.config.ts` | technical §7 | PASS | Registers just the Vanguard schema. |
| `drizzle/0019_exotic_bug.sql` | technical §7–8 | PASS | Creates only five Vanguard tables with corresponding FK/check/index constraints. |
| `drizzle/meta/0019_snapshot.json` | technical §7 | PASS | Semantic comparison: all 38 prior tables unchanged; exactly five Vanguard tables added. |
| `drizzle/meta/_journal.json` | technical §7 | PASS | One generated migration appended; prior entries retained. |
| `next.config.ts` | technical §26 | PASS | Only Vanguard gets camera=(self); all other capabilities and routes retain baseline. |
| `package.json` | technical §17–19 | PASS | Only R2 S3 SDK, presigner and Sharp added; no direct existing dependency upgraded. |
| `scripts/verify-migrations.ts` | technical §7 | PASS | Adds Vanguard schema to existing drift probe; no migration checks removed. |
| `src/app/(account)/account/page.tsx` | technical §30 | PASS | Existing AccountShell/context and read-only Vanguard destination; no editor. |
| `src/app/(account)/account/vanguard/page.tsx` | technical §30 | PASS | Existing AccountShell/context and read-only Vanguard destination; no editor. |
| `src/app/(account)/sign-in/google-sign-in.tsx` | technical §9 | PASS | Existing sign-in UI extended for existing Google provider; OAuth draft implementation is tracked separately. |
| `src/app/(account)/sign-in/page.tsx` | technical §9 | PASS | Existing sign-in UI extended for existing Google provider; OAuth draft implementation is tracked separately. |
| `src/app/(marketing)/wow-forever/tier-list/page.tsx` | technical §28 | PASS | Only class searchParam selection and preservation across roles; canonical and ranking pipeline unchanged. |
| `src/app/(marketing)/wow-forever/vanguard/page.tsx` | technical §3,32 | PASS | SSR skeleton and explicit asset placeholder. Not final design or final layout. |
| `src/app/api/vanguard/_runtime.ts` | technical §11,22,31,34–36 | PASS | Only specified Vanguard route contracts and security integration; missing orchestration is incompleteness. |
| `src/app/api/vanguard/holds/route.ts` | technical §11,22,31,34–36 | PASS | Only specified Vanguard route contracts and security integration; missing orchestration is incompleteness. |
| `src/app/api/vanguard/inscriptions/[seatId]/route.ts` | technical §11,22,31,34–36 | PASS | Only specified Vanguard route contracts and security integration; missing orchestration is incompleteness. |
| `src/app/api/vanguard/inscriptions/route.ts` | technical §11,22,31,34–36 | PASS | Only specified Vanguard route contracts and security integration; missing orchestration is incompleteness. |
| `src/app/api/vanguard/manifest/route.ts` | technical §11,22,31,34–36 | PASS | Only specified Vanguard route contracts and security integration; missing orchestration is incompleteness. |
| `src/app/api/vanguard/me/route.ts` | technical §11,22,31,34–36 | PASS | Only specified Vanguard route contracts and security integration; missing orchestration is incompleteness. |
| `src/app/api/vanguard/reports/route.ts` | technical §11,22,31,34–36 | PASS | Only specified Vanguard route contracts and security integration; missing orchestration is incompleteness. |
| `src/app/api/vanguard/search/route.ts` | technical §11,22,31,34–36 | PASS | Only specified Vanguard route contracts and security integration; missing orchestration is incompleteness. |
| `src/components/navigation/site-footer.tsx` | technical §3,32 | PASS | Single ordinary link makes the sole indexable activity route reachable using existing footer. |
| `src/config/features.config.ts` | technical §2,9,22 | PASS | Google-only production auth and notification email; analytics effective behavior retained when ID absent. |
| `src/config/legal.config.ts` | requirements §23; technical §37 | PASS | Only Google/UGC/storage/moderation/removal additions. Existing unrelated legal sections retained; modified documents remain draft. |
| `src/config/routes.config.ts` | technical §30,32; §41 | PASS | Registers activity/account/API paths, home link relation; adjusts home fingerprint only for that relation. |
| `src/config/vanguard-runtime.config.ts` | technical §12,17–20,23 | PASS | Vanguard configuration, null uncalibrated thresholds and server-only storage composition. |
| `src/config/vanguard.config.ts` | technical §12,17–20,23 | PASS | Vanguard configuration, null uncalibrated thresholds and server-only storage composition. |
| `src/modules/meta-board/wow/role-links.tsx` | technical §28 | PASS | Only class searchParam selection and preservation across roles; canonical and ranking pipeline unchanged. |
| `src/modules/meta-board/wow/workspace.tsx` | technical §28 | PASS | Only class searchParam selection and preservation across roles; canonical and ranking pipeline unchanged. |
| `src/modules/wow-vanguard/db/removal.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/db/schema.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/db/service.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/domain/event.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/domain/layout.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/domain/links.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/domain/validation.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/index.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/media/moderation.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/media/normalize.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/modules/wow-vanguard/media/r2.ts` | technical §4–8,11–20,23,31,34–36 | PASS | Vanguard-only domain, persistence or media implementation. API/media/geometry gaps retained as remaining work. |
| `src/platform/analytics/events.ts` | technical §33 | PASS | Route-bound SAFE_QUERY_KEYS checks only. Event wiring remains incomplete, not out of scope. |
| `src/platform/auth/auth.ts` | technical §9,23 | PASS | Composition binds existing Auth to Vanguard privacy-removal hook, no separate auth. |
| `src/platform/auth/callback-url.ts` | technical §9,30 | PASS | Only Vanguard and My Vanguard added to existing callback allowlist. |
| `src/platform/auth/create-auth.ts` | technical §9,23 | PASS | Conditional existing Magic Link registration and before-delete callback; test-only legacy profiles preserved. |
| `src/platform/email/email-sender.ts` | technical §22 | PASS | Adds report template identifier; reuses existing email sender. |
| `tests/e2e/vanguard-foundation.spec.ts` | technical §38 | PASS | Tests only frozen Vanguard behavior; synthetic fixtures are identified and not real-provider acceptance. |
| `tests/integration/vanguard.test.ts` | technical §38 | PASS | Tests only frozen Vanguard behavior; synthetic fixtures are identified and not real-provider acceptance. |
| `tests/unit/analytics/production-ga4-config.test.ts` | technical §37 | PASS | Test now explicitly verifies draft legal config blocks release; release validator unchanged. |
| `tests/unit/database/migration-metadata.test.ts` | technical §7 | PASS | Adds new schema to actual metadata verification; existing drift tests preserved. |
| `tests/unit/wow-vanguard/event.test.ts` | technical §38 | PASS | Tests only frozen Vanguard behavior; synthetic fixtures are identified and not real-provider acceptance. |
| `tests/unit/wow-vanguard/integration-boundaries.test.ts` | technical §38 | PASS | Tests only frozen Vanguard behavior; synthetic fixtures are identified and not real-provider acceptance. |
| `tests/unit/wow-vanguard/links.test.ts` | technical §38 | PASS | Tests only frozen Vanguard behavior; synthetic fixtures are identified and not real-provider acceptance. |
| `tests/unit/wow-vanguard/media.test.ts` | technical §38 | PASS | Tests only frozen Vanguard behavior; synthetic fixtures are identified and not real-provider acceptance. |
| `tests/unit/wow-vanguard/moderation-provider.test.ts` | technical §38 | PASS | Tests only frozen Vanguard behavior; synthetic fixtures are identified and not real-provider acceptance. |
| `tests/unit/wow-vanguard/removal-and-layout.test.ts` | technical §38 | PASS | Tests only frozen Vanguard behavior; synthetic fixtures are identified and not real-provider acceptance. |
| `tests/unit/wow-vanguard/report.test.ts` | technical §38 | PASS | Tests only frozen Vanguard behavior; synthetic fixtures are identified and not real-provider acceptance. |

## Scope versus implementation gaps

In-scope gaps are not scope approval failures: the incomplete upload pipeline, nearest-seat geometry, OAuth draft restore, public media projection, scene/audio/gesture interfaces, Seal and complete flow tests must still be implemented. Final visuals remain BLOCKED_ASSET. Real service configuration/calibration remain unverified until exercised; test fixtures do not convert them to PASS.

Ruling: keep existing legal additions draft and the release validation gate blocking — reviewed status is not fabricated. Keep final geometry unavailable until approved masks exist; identity enumeration is not a layout.
