# Audio and service preparation — e8ba0c4 continuation

The two frozen specification documents remain unchanged. No push, deployment, production migration or provider configuration write. No new dependency, account system, database, admin, realtime or unrelated refactor.

## Approved audio mapping

All five final WAVs are present, accepted and connected, with original bytes unchanged. None is BLOCKED_ASSET.

| File under public/wow-forever/vanguard/audio | Action |
| --- | --- |
| vanguard-plaque-form.wav | plate_formation |
| vanguard-plaque-lock.wav | plate_insert / lock |
| vanguard-monument-ignite.wav | seat_ignite success |
| vanguard-focus-open.wav | Focus opens |
| vanguard-ambient-theme.wav | looping BGM only |

One shared lazy AudioContext survives the ENTER boundary. No WAV is requested on initial load. Pointer/keyboard/Music user actions unlock it; blocked autoplay does not produce false playback. BGM gain is independent of SFX. Music preference is retained, BGM is ducked during accepted-result ritual, and sources/context close on unmount. No extra sound is invented for the other ritual frames.

## Work ledger

| Unit | State | Evidence / remaining condition |
| --- | --- | --- |
| Audio mapping/controller | IMPLEMENTED | Unit checks; real browser Claim with BGM off loads the three action SFX; Focus and Music checks |
| Google preparation | IMPLEMENTED | Real existing authorization endpoint/callback/session tested; exact environment/origin/return checklist in live-integration.md |
| R2 preparation/purge | IMPLEMENTED | Real signed-URL construction and SDK boundary tests, private/public/cutoff/transaction fixtures; live CORS/lifecycle/object/purge readback still external |
| Clef/calibration preparation | IMPLEMENTED | Eight-category manifest validator and offline-by-default CLI; explicit --run only, private non-overwritten reports, no auto-threshold edits |
| Report/email | IMPLEMENTED | Real local HTTP request inserts DB row and uses existing test email sender; no auto-hide; production Resend delivery still external |
| Legal | IMPLEMENTED | Existing four documents updated; removed disabled-account/Neon contradictions and added retention/account processing; no false reviewed status |
| Search/cache/ETag | IMPLEMENTED | Actual API search/ETag exercised; approved immutable media and all-three-object revoke/purge contract tested |
| Stage/Claim/error states | IMPLEMENTED | Existing DB cutoff/races, actual API Claim/second-seat rejection, added waiting/complete UI cases; production closed without final layout |
| Nonvisual E2E/security/SEO/analytics | IMPLEMENTED | Full browser regression and targeted latest audio/business checks; verification results below |

9 original units = 9 IMPLEMENTED + 0 VERIFYING + 0 UNKNOWN. IMPLEMENTED is code evidence, not a live provider acceptance claim.

The test fixture transport is a temporary loopback-only HTTP process with synthetic linear coordinates. No synthetic coordinate file is stored under public/ or in a production asset slot. APP_ENV=test, the explicit Vanguard E2E profile and the exact fixed loopback origin are all required; a production guard test proves flags cannot open production Claim. Test records are scoped to a random owner; counter changes are reconciled under the event row lock before cleanup. No production Seat is modified.

## Genuine BLOCKED_ASSET (six groups only)

1. WOW / FOREVER final visuals
2. Final Mask / Seat Layout
3. Memory Plate / Focus final visuals
4. Nine Default Emblems
5. Inscription final animation keyframes
6. Vanguard Seal final visuals

## Pending non-asset acceptance

- Real Google credentials and successful/canceled/failed provider return using an actual account.
- Real private/public R2, production/staging CORS separation, pending lifecycle readback and all-three-URL deletion/CDN purge.
- Workers AI paid-account readiness, eight categories of authorized real samples, actual sample run, reviewed centralized thresholds and rerun. Current thresholds stay null/fail-closed.
- Verified Resend sender/domain and actual support-email receipt.
- Human legal review and physical device/listening/camera acceptance; remote CI has not run because no push is permitted.

The local configuration inventory reports missing fields, and the shipped sample template correctly fails validation because actual sample files are absent. These are explicit nonzero readiness results, not successful provider checks. No provider call or real email send was made by this task. See live-integration.md for bounded operator steps.

## Review and verification

Fresh-context read-only review found no Critical/Important issues and no deferred minor finding.

- Unit: 93 files / 487 tests passed; latest direct-destination audio assertion: 3 targeted tests passed.
- Integration: 44 files / 299 tests passed against isolated local PostgreSQL.
- Contract: 1 file / 35 tests passed.
- Browser: 30/30 full-suite tests passed; latest-source targeted Google/API/Claim/Report/audio checks: 4/4 passed, including the newly added BGM failure case (31 distinct browser cases covered across the runs).
- Lint, TypeScript, full Prettier check, migration verification, neutral/enabled build matrix, SEO, release checks and security policy checks passed. Security verifies 18 header rules in both modes.
- Local Next production build passed through the browser runner. Final vinext build and post-build TypeScript verification passed.
- Frozen requirements/design and all five original WAV files remain byte-identical to e8ba0c4. No dependency or production feature configuration change.

## File scope inventory

Baseline e8ba0c4; 28 changed/added files = 28 in-scope + 0 unknown. No deleted files.

| File | Frozen scope / purpose |
| --- | --- |
| `docs/wow-forever-vanguard/implementation/audio-service-stage.md` | Implementation evidence, corrected audio ledger or real-service/calibration preparation; frozen docs untouched |
| `docs/wow-forever-vanguard/implementation/live-integration.md` | Implementation evidence, corrected audio ledger or real-service/calibration preparation; frozen docs untouched |
| `docs/wow-forever-vanguard/implementation/moderation/samples.template.json` | Implementation evidence, corrected audio ledger or real-service/calibration preparation; frozen docs untouched |
| `docs/wow-forever-vanguard/implementation/next-stage.md` | Implementation evidence, corrected audio ledger or real-service/calibration preparation; frozen docs untouched |
| `docs/wow-forever-vanguard/implementation/status.md` | Implementation evidence, corrected audio ledger or real-service/calibration preparation; frozen docs untouched |
| `next.config.ts` | Immutable cache only for the five final audio files |
| `playwright.vanguard.config.ts` | Existing isolated E2E runner includes real API suite and loopback fixture transport |
| `scripts/calibrate-vanguard.ts` | Explicit bounded Vanguard service inventory / sample calibration preparation; no default external call |
| `scripts/check-vanguard-services.ts` | Explicit bounded Vanguard service inventory / sample calibration preparation; no default external call |
| `src/config/legal.config.ts` | Only Vanguard account/UGC/retention/processor/deletion corrections to existing legal config |
| `src/config/vanguard-runtime.config.ts` | Test-only three-gate loopback layout transport; production remains closed |
| `src/config/vanguard.config.ts` | Five final audio mappings; empty final visual/layout slots unchanged |
| `src/modules/wow-vanguard/client/contracts.ts` | Vanguard AudioContext/shared lifecycle/ritual action mapping or calibration input validation |
| `src/modules/wow-vanguard/client/entry.tsx` | Vanguard AudioContext/shared lifecycle/ritual action mapping or calibration input validation |
| `src/modules/wow-vanguard/client/experience.tsx` | Vanguard AudioContext/shared lifecycle/ritual action mapping or calibration input validation |
| `src/modules/wow-vanguard/experience/audio.ts` | Vanguard AudioContext/shared lifecycle/ritual action mapping or calibration input validation |
| `src/modules/wow-vanguard/index.ts` | Vanguard AudioContext/shared lifecycle/ritual action mapping or calibration input validation |
| `src/modules/wow-vanguard/media/calibration.ts` | Vanguard AudioContext/shared lifecycle/ritual action mapping or calibration input validation |
| `tests/e2e/start-vanguard-test-server.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
| `tests/e2e/vanguard-business.spec.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
| `tests/e2e/vanguard-flows.spec.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
| `tests/e2e/vanguard-foundation.spec.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
| `tests/unit/wow-vanguard/audio.test.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
| `tests/unit/wow-vanguard/calibration.test.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
| `tests/unit/wow-vanguard/integration-boundaries.test.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
| `tests/unit/wow-vanguard/legal.test.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
| `tests/unit/wow-vanguard/production-claim.test.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
| `tests/unit/wow-vanguard/r2-boundary.test.ts` | Vanguard nonvisual business/audio/legal/production-isolation/cache/provider regression only |
