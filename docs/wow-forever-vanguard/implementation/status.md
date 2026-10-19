# Vanguard implementation ledger

Baseline: origin/main `162284d66e5d0e546f68257a41d0fa77a1f577c1`.
Branch: `codex/vanguard-monument`. Both frozen source documents remain unchanged.

This is an implementation foundation, **not the completed Monument and not Ready for launch**.

States: PASS = implemented and verified for the stated stage; IN_PROGRESS = partial implementation with remaining work explicitly identified; DEFERRED = awaiting a named external condition; UNKNOWN = not yet implemented or verified. Nothing is rejected or removed from scope.

| Technical design §39 | State | Evidence / remaining work |
| --- | --- | --- |
| 1 Final WOW / FOREVER visual | DEFERRED | BLOCKED_ASSET: final artwork required |
| 2 Memory Plate | DEFERRED | BLOCKED_ASSET: final layered plate required |
| 3 Seat Layout | DEFERRED | BLOCKED_ASSET: final masks/shapes required. Identity enumeration is not geometry. Layout validation exists; no fake layout is shipped. |
| 4 Module / route | PASS | Module and marketing SSR route skeleton exist. Explicit DEV PLACEHOLDER only. This does not claim completed interactive UI. |
| 5 Schema / migration | PASS | Five tables; generated `0019_exotic_bug.sql` and snapshot. Empty-to-latest, main-chain-to-latest and repeat application passed on isolated local PostgreSQL. |
| 6 Event Stage / cutoff | PASS | Shared resolver, exact cutoff tests, singleton row lock, post-lock database authority time and final pre-insert time check. Production uses `clock_timestamp()`. |
| 7 Hold / global account uniqueness | IN_PROGRESS | 180s holds, token hashes, DB uniqueness and race tests implemented. OAuth UI/draft restore and final geometric nearest-seat recommendations pending. No layout configured means Claim fails closed. |
| 8 Google Auth | IN_PROGRESS | Production flags Google-only, real sign-in button, backend Magic Link plugin disabled, callback allowlist extended. Real Google OAuth verification and Vanguard draft UI pending. Existing legacy test-only profiles are preserved. |
| 9 R2 | IN_PROGRESS | Concrete presign/read/private write/approved publish/delete+CDN purge adapter and private/public bucket separation. CORS/lifecycle configuration artifacts exist but have NOT been applied or read back from a Cloudflare account. |
| 10 Crop / normalize | IN_PROGRESS | Server validation, metadata removal and derivatives tested. Browser selection, interactive crop and resize pending. |
| 11 Presign / complete APIs | UNKNOWN | R2 adapter exists; authenticated upload orchestration and API routes are not yet implemented. |
| 12 Clef Flash | IN_PROGRESS | Fixed REST adapter and nine risk questions implemented using official schema. Synthetic timeout/429/error/malformed-response tests only. Real provider response and real samples remain unverified. |
| 13 Moderation calibration | DEFERRED | Real labeled samples required. Thresholds remain null; no image can be approved with uncalibrated thresholds. |
| 14 WOW Three.js | UNKNOWN | Instanced scene, texture culling and interaction architecture not yet implemented; final geometry is BLOCKED_ASSET. |
| 15 FOREVER Three.js | UNKNOWN | Per-letter instancing and loading not yet implemented; final geometry is BLOCKED_ASSET. |
| 16 Automatic unlock | PASS | Unified stage resolver uses completion +24h, no cron, no client stage authority. Exact unlock/cutoff boundary tests pass. |
| 17 MediaPipe | UNKNOWN | Dynamic integration and self-hosted runtime/model pending. Actual page-specific camera headers are implemented. |
| 18 Ritual | UNKNOWN | State machine and animation interface pending; final keyframes BLOCKED_ASSET. |
| 19 Reveal / Seal | UNKNOWN | Reveal and Canvas renderer interface pending; final Seal design BLOCKED_ASSET. |
| 20 Stand Beside Me | UNKNOWN | Seat link helper exists; fly/focus and nearby highlights pending; geometric neighbors BLOCKED_ASSET. |
| 21 Class Tier List link | PASS | Existing workspace receives validated WOW_CLASSES selection, role links retain class, existing canonical unchanged. Browser foundation deep-link verification is tracked below. |
| 22 Report + email | IN_PROGRESS | Fixed reason schema, existing rate limiter, DB insert and existing Resend sender used. No automatic hide. Route and real email delivery acceptance pending. Notification failures return explicit 503 after preserving report. |
| 23 My Vanguard | IN_PROGRESS | Existing AccountShell/context, read-only details and Monument link implemented. Seal/image/share UI pending. Account deletion hook scrubs text and revokes media; failures block deletion. |
| 24 Existing Legal | IN_PROGRESS | Only Vanguard-related additions to existing four documents and provider disclosures. Deliberately draft, not falsely marked reviewed; existing release validator continues to block publication. |
| 25 Tests | IN_PROGRESS | Domain, SQL integrity, normalization and provider-failure tests added. Full feature acceptance still incomplete. |
| 26 CI / viewport / device acceptance | IN_PROGRESS | Unit/integration/lint/typecheck/migration/build checks run locally. Foundation browser tests cover five widths and security headers; complete workflows, CI, real cameras and real devices remain unverified. |
| 27 Production launch | DEFERRED | Requires completed implementation, assets, real service calibration/acceptance, reviewed legal content and production authorization. |

Coverage reconciliation: original 27 = PASS 5 + IN_PROGRESS 10 + DEFERRED 5 + UNKNOWN 7.

## Verification scope

- Local isolated database created for this task: `vanguard_20261019_test` on localhost. No production database was migrated or changed.
- Integration authority-time injection and synthetic provider responses are test fixtures, not proof of production execution or moderation accuracy.
- Final full integration run: 42 files / 290 tests passed; targeted Vanguard suite: 10 tests passed.
- Foundation build uses APP_ENV=test; it does not verify production Google, R2, Resend, Workers AI credentials, account billing, CORS or lifecycle deployment.
- Remaining non-asset work includes upload APIs/UI, OAuth draft restore, full Claim UI, scene/gesture/audio architecture, ritual, Reveal/Seal and full Report/media acceptance. These are not mislabeled as asset blockers.
- Final visual/audio asset blockers: WOW/FOREVER art and masks, layered Memory Plate/Focus, nine original emblems, ritual keyframes, Seal layouts, original BGM and six SFX channels.

Scope outside frozen Vanguard requirements: **No**. No frozen-document edits, admin, CMS, second auth/database, realtime, system fill, unrelated refactor or unrelated dependency upgrades.

New direct dependencies needed by Vanguard only: `@aws-sdk/client-s3@3.1152.0`, `@aws-sdk/s3-request-presigner@3.1152.0`, `sharp@0.35.5`. New server-only R2 configuration requirements are in `src/config/vanguard-runtime.config.ts`; no credentials are stored in code.

## Final foundation verification

- Unit suite: 82 files / 458 tests passed.
- Full PostgreSQL integration suite: 42 files / 290 tests passed. Vanguard-only suite: 10 tests passed, including normalized Guild search and hidden exclusion.
- `typecheck`, repository ESLint and `git diff --check`: passed.
- `db:verify`: passed against the task-local isolated database, including generated snapshot drift verification and both migration paths.
- `build:test`: passed (Next.js optimized build under APP_ENV=test).
- Foundation Playwright suite: 7/7 passed using installed Chrome against the built local server; five requested widths, page-specific camera response headers, no camera request on page load, and class deep-link selection.
- Full business-flow E2E, production environment build, production feature acceptance and deployment have NOT been completed.
- Legal review remains draft and intentionally blocks the existing release validator. This is a real release blocker, not a test bypass or asset blocker.
