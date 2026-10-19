# Continuation ledger — frozen technical design §39

Start: `b976dbb`, branch `codex/vanguard-monument`. Scope gate: [62-file audit](scope-audit-b976dbb.md). No frozen-document edits, push, deployment or production migration.

| Work unit | Status | Evidence / remaining condition |
| --- | --- | --- |
| Scope audit | PASS | 62 = 61 PASS + 1 REPAIRED; incidental emnapi lock drift restored; frozen install passed |
| Media orchestration / publication | IMPLEMENTED | Authenticated presign/complete, private normalization, owner checks, approved-only hash-verified publication, final DB cutoff, compensating revoke/purge; local DB/provider fixtures pass |
| Public projection / scoped removal | IMPLEMENTED | Three public derivatives only, hidden neutral response, account deletion and explicit operations service revoke objects/purge; no admin route |
| Claim / OAuth / crop / errors | IMPLEMENTED | Text-only draft, hold revalidation including already-occupied OAuth return, deliberate file selection after login, 1:1 crop/resize/direct PUT, retry/change/emblem fallback, immutable success |
| Browse / archive / account | IMPLEMENTED | 15s ETag polling, search, Focus, fixed-reason Report + notification, read-only My Vanguard, share and existing Tier List links |
| Scene / gesture / audio / ritual / Seal interfaces | IMPLEMENTED | Dynamic InstancedMesh architecture, phase/per-letter binary adapters, geometric nearest lookup, pointer/touch controls, explicit self-hosted camera, independent BGM/SFX, accepted-result 4s ritual, public Seal model/renderer contract |
| Analytics / CSP / cache / SEO | IMPLEMENTED | Existing consent boundary; 12 allowlisted events with no UGC properties; page-specific WASM/R2 CSP only; canonical/static cache/SEO validator integration |
| Automated verification / review | PASS | 474 unit, 299 PostgreSQL integration, 35 contract, 24 distinct browser cases; lint/types/format/migrations/security/SEO/supply-chain/builds and feature matrix passed; review fixes below |

8 original units = 2 PASS + 6 IMPLEMENTED + 0 IN_PROGRESS; 0 unreviewed. IMPLEMENTED states describe code, not external production acceptance.

## Review findings and bounded fixes

- Important: OAuth return with an actually occupied Focus must restore the text draft and revalidate Hold. Browser test first failed; corrected resume path preserves the conflict/recommendation flow.
- Important: OrbitControls defaults left mouse/one finger to rotation even when rotation is disabled. Explicit PAN / DOLLY_PAN mapping; control test first failed then passed.
- Important: Hold must re-read database time after layout/validation before writing. A two-step database-clock test first returned an expired successful Hold, then passed with EVENT_SEALED after the fix.
- Minor correctness: validate Name/Guild/Battle Cry before the final API and display field-specific plain-text/length guidance. Server validation remains authoritative and shared.
- Completed WOW archive occupancy is reconstructed only from the authoritative 8016 server counter after FOREVER opens; no additional public player enumeration or client phase authority.
- Background thumbnail lookups cache negative results and reserve 20 of the existing 60 Focus reads/minute for deliberate interactions; they cannot flood the existing read limiter on emblem-only seats.
- Final publication rollback test verifies approved keys are revoked and database updates roll back if the authoritative write crosses cutoff.

No review finding was deferred as unrelated cleanup.

## Asset and external gates

BLOCKED_ASSET: final WOW/FOREVER visuals, Mask/Seat Layout, Memory Plate/Focus, nine Default Emblems, Inscription animation keyframes and Vanguard Seal visuals. Audio is complete and is not blocked. Only explicitly labeled DEV PLACEHOLDER UI ships while these slots are empty.

EXTERNAL_VERIFICATION: real Google OAuth, R2 CORS/lifecycle/private/public/purge readback, Resend delivery, Workers AI account readiness and real-sample moderation calibration, physical cameras/devices, reviewed legal content. No mocked provider response or green local test is presented as that acceptance.

Ruling: absence of final masks keeps production scene/Claim selection closed; functional tests may inject explicitly synthetic layouts. No fabricated layout ships. Cost if wrong: final assets must be connected before participation can launch.
Ruling: moderation thresholds remain null until real sample calibration. Cost if wrong: image approval remains fail-closed; users can choose the class emblem.

## Concurrent supplied audio commit

The branch received user-authored `8b46067`: ambient-theme, focus-open, monument-ignite, plaque-form and plaque-lock WAV files under `public/wow-forever/vanguard/audio`. The user has confirmed all five are final. They are connected to the explicit approved BGM/Focus/formation/insertion/ignition actions. Original bytes are unchanged; there is no outstanding audio asset blocker. This corrects the earlier unverified/unassigned assessment at e8ba0c4. See audio-service-stage.md for the mapping and tests.

Submission checks: E2E auth/provider fixture tokens are generated at runtime rather than committed as fixed literals. Vendored generated loaders retain upstream bytes through a directory-local whitespace attribute; no application-source, secret-scan or CSP exemption was added.
