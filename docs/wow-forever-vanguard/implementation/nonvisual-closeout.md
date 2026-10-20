# Nonvisual closeout — baseline 49fb3a0

Frozen sources: requirements.md and technical-design.md. Neither is modified. No push, deployment, provider configuration change, production database write, new dependency or runtime architecture. Production layouts remain empty and Hold/Claim stays fail-closed. Five final WAVs remain mapped and unchanged.

## Coverage ledger

Eight requested engineering areas = eight audited / zero unreviewed / zero rejected. Code verification and external acceptance are separate columns; BLOCKED_EXTERNAL is never a test pass.

| Area | Engineering evidence | External acceptance |
| --- | --- | --- |
| Google OAuth | Existing Better Auth Google-only configuration, trusted origin, exact callback and validated returnTo; real local authorization request; sessionStorage text draft; transaction revalidates valid/expired-free/stolen Hold; conflict retains text and recommends nearest available Seat | BLOCKED_EXTERNAL: actual client credentials, Console authorized origin/callback and real account success/cancel/error return |
| R2 | 120s content-type-bound private PUT; server HEAD/Get If-Match and bounded normalization; distinct private/public buckets; approved-only permanent 1024/256/128 objects; scoped hide/delete revokes all objects then purges exact URLs; purge failure propagates | BLOCKED_EXTERNAL: account/bucket credentials and live production CORS, private access, 24h lifecycle, permanent retention, object deletion and CDN readback |
| Clef Flash | Server-only fixed model, 512px derivative, nine questions; normal WoW combat not a generic violence rejection; timeout/429/provider/schema error fail closed; eight-category private sample manifest and explicit-run calibration CLI | BLOCKED_EXTERNAL: Workers AI token/paid-account readiness, authorized real samples, real probabilities and centralized threshold calibration. Thresholds remain null/uncertain |
| Report / Resend | Fixed reasons, existing session/IP/rate boundary, DB insert; existing sender includes Seat ID/reason/DB timestamp/public link; failure preserves report; single report does not hide; real local HTTP uses file test mailbox | BLOCKED_EXTERNAL: Resend key, verified sender/domain and actual support inbox receipt |
| Cache / Search / Security / SEO / Analytics | Manifest short cache + ETag/304; public Focus short cache; me/write/error no-store; bounded prefix/exact public search and limiter; public projection omits private fields; canonical and class query use existing Tier List; SAFE_QUERY_KEYS constrained; consent and empty Vanguard event property allowlists; UGC Clarity masks; scoped camera policy/CSP | No external provider acceptance claimed; remote analytics ingestion is not demonstrated by local tests |
| Event / Claim | All five stages; exact database cutoff; singleton-locked concurrent completion; one global unique account Seat; stolen-seat recommendation; account deletion scrubs identity and retains occupied Seat; production missing-layout guard | No final geometric/visual acceptance claimed |
| Legal | Existing Privacy / Terms / Acceptable Use / Account Deletion cover account/UGC/R2/Workers AI/display license/report/hide/delete; no separate Vanguard legal route | HUMAN_REVIEW: draft retained pending legal reviewer |
| Verification | Existing meaningful unit/integration/contract/browser/security/SEO/build/migration suites rerun; final evidence below | HUMAN_REVIEW: physical device/camera/listening acceptance. No push means no remote CI execution |

## Environment evidence

The current process has none of the required Google/R2/Workers AI/Resend fields. Read-only field-presence checks of the original workspace .env and .env.local also found no Google client/secret, Better Auth secret, Vanguard Cloudflare credentials or Resend/sender/support fields. Existing origin/database values were not printed, copied, used or changed. No production secret pull was performed. These observations establish local blockage only; production Console configuration remains unknown.

`bun scripts/check-vanguard-services.ts` exits 1 because required fields are missing and reports NOT_CONTACTED, CLOSED_UNTIL_FINAL_MASK_LAYOUT and UNCALIBRATED_FAIL_CLOSED. No Google login, R2 network write, Workers AI inference or live email was performed. Local test identities, sample probabilities, fake camera and file mailbox are explicitly test evidence.

## BLOCKED_ASSET — six groups

1. WOW / FOREVER final visuals
2. Final Mask / Seat Layout
3. Memory Plate / Focus final visuals
4. Nine Default Emblems
5. Inscription final animation keyframes
6. Vanguard Seal final visuals

## HUMAN_REVIEW

Legal wording approval and physical-device camera/touch/audio subjective acceptance. No unrelated legal rewrite is justified by pending review.

## Remaining nonvisual code

No identified nonvisual implementation gap remains that can be completed with current local inputs. Real sample results may require threshold values and evidence-backed adjustments; those are deferred to BLOCKED_EXTERNAL, not silently considered complete. Final asset wiring remains BLOCKED_ASSET. No fabricated final coordinates/emblems/plates/seals/animation were added.

## Verification evidence

All results below were executed in this round against unchanged runtime baseline 49fb3a0:

- Unit: 93 files / 487 tests passed.
- Integration: 44 files / 299 tests passed on isolated local PostgreSQL.
- Contract: 1 file / 35 tests passed.
- Full Vanguard browser E2E: 31/31 passed (4.2 minutes), including five viewports, real local HTTP/DB/report test mailbox, draft conflict, upload fixtures, stages, touch/camera fallback, audio and ETag.
- Next production-mode test build passed through the E2E startup runner; this is a local build, not a deployment.
- TypeScript, ESLint, full formatting, security (18 header rules in both modes), SEO and staged secret scan passed; git diff --check passed.
- Migration verification passed empty-to-latest and main-chain-to-latest. Initial command omitted TEST_DATABASE_URL and was correctly refused before mutation; corrected rerun explicitly targeted the isolated local test database.
- Two frozen docs and five final WAVs byte-compared unchanged against 49fb3a0. No generated/configuration drift.

Evidence logs: /tmp/vanguard4-{unit,integration,contract,e2e,lint,types,format,security,seo,secrets}.log and /tmp/vanguard4-migrations-retry.log. Logs are local evidence and are not committed as generated artifacts.

Fresh-context independent read-only audit found no actionable Critical/Important finding and made no changes. No deferred minor finding. Scope changes outside frozen Vanguard: No.

## File scope

This round changes only this evidence ledger and the existing implementation status link. No runtime or test code change was necessary after audit. Two files = two in-scope / zero unknown / zero deleted.
