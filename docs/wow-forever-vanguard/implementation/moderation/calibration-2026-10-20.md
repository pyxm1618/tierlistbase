# Vanguard Clef real calibration — 2026-10-20

## Scope and evidence

The existing calibration runner called the real Cloudflare Workers AI model `@cf/cloudflare/clef-flash` for all 80 privately supplied labeled samples. No images were sourced, generated, changed, published or committed for this task. The manifest schema is unchanged; `sources.json` is provenance evidence only.

Input validation: 80 existing, decodable JPEG/PNG/WebP files; declared MIME matches decoded format; square dimensions between 512 and 2048 pixels; each at most 4 MiB; 80 unique SHA-256 hashes; all 80 match the supplied provenance records. This does not constitute an independent legal review of every source license.

Private detailed report: `~/Private/vanguard-clef-calibration/real-acceptance-20261020T134028Z.json`. It records every sample ID, expected/actual decision, model probabilities, thresholds, correctness and transport attempts. SHA-256: `efa86b0e3ec734802382e54af901e55dabaec3257797937598d4b01014c35487`.

## Final full-set result

| Category | Expected | Correct / total |
| --- | --- | --- |
| wow_screenshot | approved | 10 / 10 |
| wow_combat | approved | 10 / 10 |
| guild_group | approved | 10 / 10 |
| person_photo | approved | 10 / 10 |
| advertisement | rejected | 10 / 10 |
| qr | rejected | 10 / 10 |
| sexual_explicit | rejected | 10 / 10 |
| graphic_gore | rejected | 10 / 10 |

Approved: 40/40. Rejected: 40/40. False positives: 0. False negatives: 0. Uncertain: 0. Terminal provider/input failures: 0. Calibration gate: **PASS for this 80-sample set**; this is not a guarantee for unseen images.

There were 82 network attempts for 80 final valid responses. Samples `wow_screenshot_005` and `qr_006` each encountered one TypeError before receiving any HTTP response, then succeeded. All attempts remain in the report. The CLI permits at most two retries only for transport TypeError/TimeoutError before a response. HTTP errors, malformed model responses and any received model decision are never retried to select a label. Production moderation retains one request and fail-closed handling; no production retry was added.

## Final central thresholds

| Risk | approveBelow | rejectAt |
| --- | --- | --- |
| sexual_explicit | 0.30 | 0.50 |
| sexual_suggestive | 0.35 | 0.55 |
| graphic_gore | 0.28 | 0.36 |
| hate_extremism | 0.30 | 0.50 |
| illegal_or_abusive | 0.30 | 0.50 |
| commercial_spam | 0.245 | 0.265 |
| personal_sensitive_info | 0.30 | 0.50 |
| offsite_redirect | 0.30 | 0.50 |

All thresholds reside in `src/config/vanguard.config.ts`. Intermediate full-set runs identified missed printed/product advertisements, severe burn injury and a portrait commercial-spam false positive. Minimal prompt clarification addresses these cases while preserving ordinary stylized WoW combat. Recorded commercial-spam scores separated the portrait maximum 0.2209 from advertisement minimum 0.2893; the final uncertainty band lies between them. Recorded ordinary-combat gore maximum 0.2177 and severe injury score 0.4244 informed the gore band. After the final prompt/threshold changes, the complete 80-sample set was run again against the real API; the result above uses production-config thresholds, not a private candidate override.

The provider timeout is 30 seconds, following observed successful real calls exceeding the old 15-second budget. Timeout, HTTP 429/provider errors, uncertain and rejected results remain fail closed. Only approved media can be published.

## Verification and remaining release gates

The final real-run execution metadata matches the current runner, provider, calibration helper and config hashes. All seven changed source/test files match the full verification run hashes. These hashes and dataset/provenance hashes were rechecked on 2026-10-21.

- Format, lint and typecheck: passed.
- Unit: 99 files, 645 tests passed.
- Integration: 44 files, 300 tests passed.
- Provider/contract: 35 contract tests passed; provider fail-closed and score regressions are included in unit coverage.
- Vanguard E2E: 35 passed.

Private check logs: `~/Private/vanguard-clef-calibration/checks-acceptance-20261020T134144Z/`. Mocked unit/provider tests establish failure contracts; they are not the real calibration evidence.

This closes only the real Clef calibration gate. Production application upload/moderation smoke, other external services, human/legal reviews and PR #63 final-head CI/main-alignment/review gates remain separate. No merge or deployment is performed by this calibration task. Frozen requirements and technical design are unchanged.
