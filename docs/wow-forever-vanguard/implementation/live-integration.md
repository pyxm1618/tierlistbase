# Vanguard service integration preparation (baseline e8ba0c4)

No production settings, secrets, buckets, database, email recipients or provider billing were changed. This is a bounded operator runbook, not completed external acceptance. Final Mask/layout is absent, so production Hold/Claim remains fail-closed. No production coordinates are fabricated.

## Read-only configuration inventory

Run `bun scripts/check-vanguard-services.ts` in the intended server environment. It prints field names and PRESENT_UNVERIFIED/MISSING, never credential values. A missing field exits nonzero. Presence never proves billing, permission or provider readiness. It also fingerprints the five supplied audio files; no transcoding/copy occurs.

## Google OAuth

Reuse the existing Better Auth application and account tables. Set the existing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BETTER_AUTH_SECRET, APP_ORIGIN and DATABASE_URL; keep Google enabled and Magic Link/password disabled. Authorized production JavaScript origin: `https://www.tierlistbase.com`; redirect URI: `https://www.tierlistbase.com/api/auth/callback/google`. Local/staging callbacks must be registered separately for their exact origin. Never replace production settings to test a preview.

Local E2E verifies the real sign-in endpoint constructs the Google authorization URL with the expected callback; it does not visit Google with fixture credentials. Real-account acceptance still requires successful and canceled/failed Google returns, preserved text, valid/expired/stolen Hold handling, existing-account second-seat rejection and no Google identity autofill. Until final layouts arrive, do the Claim-specific return cases in an isolated test environment; production must continue returning LAYOUT_UNAVAILABLE.

## R2 upload and purge

Server variable names are in services.md. Private/public buckets must differ. Use the exact production CORS artifact (no wildcard); staging has a separate origin/configuration. Apply/read back the pending-prefix 24-hour lifecycle only on the private bucket, never permanent. These artifacts have not been applied by this task.

Authenticated real acceptance: presign → direct browser WebP PUT to private R2 → Complete. Verify anonymous pending access fails; HEAD content type/size and byte magic are checked; a swapped upload cannot bypass hash validation; rejected/uncertain/error images never appear publicly. Approved media remains private until the final inscription flow publishes exactly detail/1024, WOW/256 and FOREVER/128. Confirm permanent objects are not removed by pending lifecycle. During a scoped hide/privacy/legal removal, call the existing hide/removal service with R2 revoke, rather than issuing a bare status UPDATE. Check all three old URLs fail after object deletion and Cloudflare purge readback. Do not remove any unrelated key or Seat.

SDK boundary tests cover real signature generation, HEAD/Get If-Match, bounded reads, approved-only publication and all-three-object deletion/purge failure. No R2 network write was performed by these tests.

## Clef Flash calibration

Fixed model: @cf/cloudflare/clef-flash, called only from the existing server; Workers Paid/usage billing must be verified in the existing account. No AI Gateway prepaid flow or separate Worker is needed.

Copy samples.template.json to a private directory and replace all PRIVATE_SUPPLIED paths with authorized real images, cropped/normalized as the upload pipeline requires (square 512–2048, <=4MB JPEG/PNG/WebP). Human-label each sample; all eight categories are required, with more normal WoW combat/guild/person samples encouraged. Do not commit samples, private paths or provider tokens.

Offline input check (no external call):

`bun scripts/calibrate-vanguard.ts --manifest=/private/samples.json`

Explicit provider run, when authorized:

`bun scripts/calibrate-vanguard.ts --manifest=/private/samples.json --output=/private/new-report.json --run`

The runner sends only the 512px derivative, writes a new private report with IDs/categories/labels/probabilities/status, never image bytes or file paths, and never publishes R2 objects. Existing output files are not overwritten. It does not invent or auto-write thresholds. Thresholds remain null/fail-closed until real sample review establishes approveBelow/rejectAt centrally in vanguard.config.ts, followed by a second sample evaluation and timeout/429/error regression. Synthetic tests are not accuracy evidence.

## Report / Resend

Reuse RESEND_API_KEY, EMAIL_FROM, SUPPORT_EMAIL and the existing Resend sender; verify the sender/domain with the intended account. Google-only auth remains unchanged. Real acceptance: report a known public Seat with one of five reasons, verify DB insert and received support email includes Seat ID/reason/database timestamp/public Seat link. One report never hides content. A delivery failure preserves the report and returns REPORT_NOTIFICATION_FAILED. The local real-API E2E uses the existing file test-email sender, not a claimed Resend delivery.

## Acceptance ledger

| Gate | Current evidence | Remaining |
| --- | --- | --- |
| Audio | Five originals mapped; SFX independent of BGM; unit/browser checks | Physical-device listening as part of final acceptance |
| OAuth | Real local authorization URL/session/API tests | Real provider credentials + account callback/cancel flows |
| R2 | SDK boundary and transaction fixtures | Private/public/CORS/lifecycle/purge live readback |
| Clef | Contract/fail-closed tests + explicit-run calibration tool | Authorized real sample set, provider run and threshold review |
| Resend | Real local HTTP report → DB → existing test mailbox | Verified sender/domain and actual delivery |
| Legal | Existing documents corrected; draft retained | Human legal review; no invented review approval |
| Production Claim | Empty final layout slots fail closed | Final supplied Mask-derived geometry and visual acceptance |
