# Vanguard implementation ledger

Baseline: origin/main `162284d66e5d0e546f68257a41d0fa77a1f577c1`. Foundation: `b976dbb`. Concurrent user audio commit: `8b46067` (preserved, not authored by this continuation).
Branch: `codex/vanguard-monument`. Frozen requirements/design are unchanged.

This ledger distinguishes implemented code/interfaces from final visual and external service acceptance. **Not Ready for launch.** PASS refers to the explicitly stated local evidence; it never means production provider acceptance.

| Technical design §39 | State | Evidence / remaining condition |
| --- | --- | --- |
| 1 Final WOW / FOREVER visual | DEFERRED | BLOCKED_ASSET: final artwork; typed phase-specific hero slots only |
| 2 Memory Plate | DEFERRED | BLOCKED_ASSET: final layered Plate/Focus; approved detail/emblem/unavailable renderer implemented |
| 3 Seat Layout | DEFERRED | BLOCKED_ASSET: final masks/shapes. Exact identity/capacity validators, compact binary loaders and geometric nearest adapters exist; no fake layout ships |
| 4 Module / route | PASS | Marketing SSR story, state, disclaimer, ordinary Tier List links, dynamic ENTER boundary and existing header/footer |
| 5 Schema / migration | PASS | Five tables only; prior 38 tables unchanged; isolated migration paths and repeat application verified |
| 6 Event Stage / cutoff | PASS | Shared server resolver, event singleton lock, atomic WOW counter and once-only completion; final DB time checks including Hold after layout and inscription after media publication |
| 7 Hold / global account uniqueness | PASS | 180-second token-hashed holds, DB global unique constraint, real transaction races; text draft/OAuth restore, expired/free/taken recovery; geometric recommendations await actual final layout |
| 8 Google / Account | PASS | Existing Better Auth Google only in production, Magic Link/password disabled; UI never copies Google identity into Vanguard Name. Real OAuth acceptance remains external |
| 9 Crop / local upload | PASS | JPEG/PNG/WebP, <=20MB local validation, >=512 square crop, <=2048 WebP master, post-login File selection and explicit error states |
| 10 R2 pending / permanent | PASS | Existing server composition uses private pending and approved permanent derivatives; fixtures test ownership/hash/rollback. Production CORS/lifecycle/purge readback remains external |
| 11 Presigned API | PASS | Authenticated/rate-limited strict-zod presign/complete APIs; server-generated key, 120s content-type-bound PUT, no large API proxy |
| 12 Normalize / derivatives | PASS | Bounded header/decode, metadata stripping and 512/1024/256/128 generation; local Node tests and actual workerd invocation. Sharp is test-only |
| 13 Moderation | PASS | Fixed Clef Flash server contract, risk questions including QR/promotion, fail closed on unknown/timeout/429/error. Null thresholds intentionally block approval until real-sample calibration |
| 14 WOW Three.js | IN_PROGRESS | InstancedMesh architecture, exact 8016 capacity, pan/pinch/raycast, texture culling and device budgets tested. Final scene visual acceptance BLOCKED_ASSET |
| 15 FOREVER Three.js | IN_PROGRESS | Seven per-letter groups / 56112 capacity, staged binary loading and shared interaction architecture. Final geometry/visual acceptance BLOCKED_ASSET |
| 16 Automatic unlock | PASS | Completion +24h from server authority, no cron or client phase authority; unlock>=cutoff never opens Claim |
| 17 MediaPipe | PASS | Explicit Enable only, self-hosted pinned WASM/model, 20fps separate timer and cleanup. Real detector starts on a fake browser camera; no-camera fallback tested. Physical gesture accuracy remains external |
| 18 Ritual | PASS | Accepted-result-only ordered 4s state machine, reduced-motion business parity and independent SFX/audio hooks. Final animation/keyframes BLOCKED_ASSET |
| 19 Reveal / Seal | PASS | Reveal gives Seal, Stand Beside Me and class Tier List; public-only Seal model/renderer interface. Final Seal renderer/composition BLOCKED_ASSET; no DOM screenshot |
| 20 Stand Beside Me | PASS | Immutable Seat query, Focus, archived WOW layout selection after FOREVER, geometric nearby candidate interface and open-only recommendations. Final fly/highlight presentation BLOCKED_ASSET |
| 21 Class Tier List link | PASS | Existing WOW_CLASSES reused; class searchParam selection/role preservation and fixed canonical, browser verified |
| 22 Report + email | PASS | Five fixed reasons, existing rate/session/IP boundary, DB insert then Resend notification, failure preserves report, no auto-hide/admin. Live delivery remains external |
| 23 My Vanguard | PASS | Existing AccountShell/context; read-only Plate/details, Seal interface, View in Monument and Share. Account deletion/revocation retains occupied neutral Seat |
| 24 Existing Legal | PASS | Existing Privacy/Terms/Acceptable Use/Account Deletion now cover Vanguard; stale disabled-account/Neon statements corrected. Human legal review remains external and draft is retained |
| 25 Tests | PASS | Local unit, PostgreSQL integration, provider/clock fixtures, browser contracts, cache/SEO/security checks; results below distinguish simulated versus actual services |
| 26 CI / viewport / device acceptance | IN_PROGRESS | Existing CI gains dedicated Google-only Vanguard browser suite. Local five widths, mouse/touch/reduced-motion, fake Camera/No Camera. Remote CI and physical devices not run |
| 27 Production launch | DEFERRED | No push/deploy. Requires final assets, real service calibration/readback, legal review and production authorization |

Coverage reconciliation: 27 original units = PASS 20 + IN_PROGRESS 3 + DEFERRED 4 + UNKNOWN 0. No unit rejected or removed.

## Verification boundary

- Local PostgreSQL integration database: `vanguard_20261019_test`; separate local browser fixture database: `vanguard_20261019_e2e`. These are isolated test databases, not a second product database. No production DB migration/write occurred.
- Browser contracts use real existing Better Auth sessions but intercept Vanguard business APIs to exercise UI deterministically while final layouts are absent. PostgreSQL suites independently exercise real transactional service logic. They are not a claim of full live-provider end-to-end acceptance.
- Local workerd smoke executed the real WASM normalizer and inspected exact derivative sizes. Browser fake-camera test executes the real self-hosted MediaPipe runtime; synthetic camera frames do not verify physical detection accuracy.
- R2/Clef/Resend fixtures do not prove production credentials, billing, CORS, lifecycle, deletion/purge, email delivery or moderation accuracy. Thresholds remain null pending the required real sample set.
- BLOCKED_ASSET is limited to six visual groups: WOW/FOREVER final visuals; Mask/Seat Layout; Memory Plate/Focus final visuals; nine Default Emblems; Inscription animation keyframes; Vanguard Seal final visuals.
- Audio correction: all five WAVs from `8b46067` are final and complete, as confirmed by the user. They are mapped and connected: plaque-form → plate formation, plaque-lock → insertion/lock, monument-ignite → success ignition, focus-open → Focus, ambient-theme → BGM. No audio remains BLOCKED_ASSET. Original bytes are retained; only BGM follows Music Toggle.
- Legal content remains draft and deliberately blocks the existing production release gate. Remote CI and production feature acceptance are unverified.

## Prior e8ba0c4 verification (historical)

- Full unit suite: 88 files / 474 tests passed.
- Full isolated PostgreSQL integration suite: 44 files / 299 tests passed; includes the final Hold cutoff recheck, publication rollback and compact/versioned Manifest cases.
- Provider contract suite: 1 file / 35 tests passed.
- Final consolidated browser suite: 24/24 passed, including the real API ETag/304 case and generated runtime test credentials. Five widths 390/768/1024/1440/1920, real existing auth session, default emblem, crop/upload approved/rejected/unavailable, OAuth stolen-seat recovery, immutable Reveal, mouse/touch/reduced motion, Camera denied/fake-camera detector, sealed Focus/Report/share/Tier List and policy checks. Business API interception remains explicitly documented above.
- Repository ESLint, TypeScript, full Prettier check, migration verification (both paths/idempotence), security, SEO, release-guard and supply-chain checks passed locally. The release-guard test proves draft legal is rejected for production; it does not approve deployment. Supply-chain check retained the repository's existing documented dev-only advisory exception, without introducing an exemption.
- Existing neutral/fully-enabled feature build matrix passed. Next.js optimized test build and Cloudflare vinext build passed. Local workerd executed the actual normalizer successfully.
- Frozen source hashes remain requirements `b3cda71e56d4988a548e78a176f1ef60a7bcd0ae7559295d1d3bbdcb9dbbbd26`, technical design `3c49c208576481e71fc05fdff32714df851a5586fda8708e39648241df190841`.
- Local runtime used installed Bun 1.4.2; repository pin and CI remain Bun 1.3.14. No toolchain configuration was upgraded.

See next-stage.md for independent review/fix evidence and files.md for the exact 74-file continuation inventory. Remote CI, real production providers and physical-device acceptance remain unverified.

Scope outside frozen Vanguard requirements: **No**. No frozen-document changes, admin/CMS, second account/product DB, realtime/backfill, unrelated refactor or unrelated dependency upgrades.

Direct dependency changes required by this phase: `three@0.186.1`, `@types/three@0.186.0` (development), `@mediapipe/tasks-vision@1.1.1`, `@cf-wasm/photon@0.4.0`; existing `sharp@0.35.5` moved to development-only fixture/oracle usage for Workers compatibility. Provider configuration is server-only and documented in services.md.

## Current audio/service continuation

Baseline e8ba0c4; see audio-service-stage.md and live-integration.md for current evidence. The preceding test totals describe the prior commit, not the current verification run. The current phase adds real local HTTP → existing Session → PostgreSQL → test email E2E, audio/production-Claim isolation tests, scoped R2 signature/delete/purge tests and explicit-run sample calibration preparation. Real provider acceptance, physical devices and legal review remain pending non-asset work.

## Nonvisual closeout after 49fb3a0

See [nonvisual-closeout.md](./nonvisual-closeout.md) for the eight-area audit, current-run verification and separately classified BLOCKED_ASSET / BLOCKED_EXTERNAL / HUMAN_REVIEW. Provider preparation and local fixture tests do not constitute real-service acceptance. Production Claim remains closed pending final Mask/layout.

## Supplied final visual stage after d9b2dbc

See [final-visual-stage.md](./final-visual-stage.md) and [item-level asset inventory](./final-assets-inventory.json). WOW geometry and supplied Plate/Focus/Emblem/Ritual/Seal assets are integrated. FOREVER hero/seven masks and final Scatter movement remain explicitly blocked; user authorized skipping missing files. Production Claim remains closed. Earlier six-group asset ledgers are historical, not the current inventory.

## Final FOREVER/layout/Scatter continuation after 75e5419

Current asset status supersedes the historical asset blockers above: **BLOCKED_ASSET = 0**. See [final-layout-closeout.md](./final-layout-closeout.md) and [new asset inventory](./forever-assets-inventory.json). Both final phase heroes, all ten masks and all 64,128 supplied FINAL coordinates are integrated. Scatter is code, not an asset dependency; open palm scatters deterministically, fist gathers, pinch selects Focus. No additional movement specification file is required. The code-level final-layout prerequisite is satisfied; production opening and provider acceptance are not claimed. External service validation and human acceptance remain separate gates.
