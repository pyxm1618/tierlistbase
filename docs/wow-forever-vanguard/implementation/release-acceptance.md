# Vanguard release acceptance

Branch: codex/vanguard-monument. PR: https://github.com/pyxm1618/tierlistbase/pull/63 (draft, base main). No new feature work. Only verified acceptance defects may be corrected. Frozen requirements/design and supplied visual/audio bytes remain unchanged.

## Initial GitHub CI evidence

Run https://github.com/pyxm1618/tierlistbase/actions/runs/39367297934 on 26fbdcd finished with 1 successful job (performance) and 3 failed jobs (quality, clean-setup, e2e). No missing or unreviewed job. This run is not green.

| Confirmed defect | Evidence | Bounded correction | Local verification |
| --- | --- | --- | --- |
| Vanguard bespoke page omitted from i18n verifier | quality: missing localized landing content en:/wow-forever/vanguard; reproduced by verify:i18n | Register existing bespoke SSR route alongside the existing bespoke route; keep SEO-copy and alternates checks | verify:i18n passes |
| Clean-sample legacy-term scan matches a comment substring | clean-setup finds casting inside raycasting in the Scene comment; exact git grep reproduces it | Reword only that comment to hit testing; no scan exemption or code change | Exact unchanged scanner returns no matches |
| Focus fallback assertion expects a transient single emblem | CI and local CI=1 Chromium report 2 emblems instead of 1; both existing Plate instances correctly fall back | Await both emblems and no Memory Image, then both loaded Memory Images and no emblem after next Seat | Targeted Chromium regression 3/3 passes |

Only four files change for this repair: scripts/verify-i18n.ts, the Scene comment, tests/e2e/vanguard-flows.spec.ts and this evidence ledger. Four PASS/in-scope, zero deferred files, zero rejected/deleted files, zero unknown. Unit 498 passed; lint, format, typecheck and Next optimized test build passed. Complete GitHub CI must rerun on the repaired head; local checks are not a substitute.

## Ordered release ledger

| Step | State | Evidence / condition |
| --- | --- | --- |
| 1 Safe push | PASS | Normal fast-forward e8ba0c4 to 26fbdcd; no force push |
| 2 PR | PASS | Draft PR 63 attached to this chat |
| 3 Complete CI | WAITING | Initial failures above are fixed locally; require a new complete green run |
| 4 External services | BLOCKED_EXTERNAL | Production settings are being completed by the owner; no fixture acceptance |
| 5 Human review | HUMAN_REVIEW | Legal, physical touch/camera/audio, phone QR and subjective visual approval remain |
| 6 Targeted actual-defect correction | PASS | Only the three evidenced CI failures above |
| 7 Repeat complete CI | WAITING | Required after this repair |
| 8 Merge | WAITING | CI, external and human gates first |
| 9 Deploy | WAITING | After authorized merge and release approval |
| 10 Production smoke | WAITING | Only after deployment; includes final production Google callback |

Coverage: 10 steps = 3 PASS + 5 WAITING + 1 BLOCKED_EXTERNAL + 1 HUMAN_REVIEW; zero unknown. No merge, deployment, production DB mutation or provider configuration change performed.

## External environment confirmed by owner

Use the existing Cloudflare Workers production Worker tierlistbase at https://www.tierlistbase.com. Production secrets/variables are managed only in Cloudflare Dashboard → Workers & Pages → tierlistbase → Settings → Variables and Secrets. No production secret file is created or requested for the repository or chat. Google/R2/Workers AI/Resend configuration is currently being completed. Corresponding live acceptance remains BLOCKED_EXTERNAL.

Historical Clef blocker (superseded on 2026-10-20): only implementation/moderation/samples.template.json was initially available. The owner subsequently supplied the private 80-sample manifest. Real API calibration now passes 80/80, with 0 false positives and 0 false negatives; see [the calibration evidence](moderation/calibration-2026-10-20.md). This closes the sample/calibration blocker only; production application smoke and the other release gates remain separate.

Before merge, verify the available Google configuration/return flow, R2 CORS/lifecycle/private-public/delete/purge, real Clef samples/calibration and received Resend notification only when actual configuration and inputs exist. Final Google production callback/session/returnTo acceptance belongs to the post-deployment smoke test. Human review and production acceptance cannot be replaced by local or mocked test success.

## Second complete CI and final bounded corrections

Run https://github.com/pyxm1618/tierlistbase/actions/runs/39369170699 on 634210b finished with quality and performance successful, clean-setup and e2e failed. The initial three defects are resolved: all 35 Vanguard browser tests passed in GitHub. Two newly reachable CI boundaries failed, and the local production SEO rerun then identified one page integration omission:

| Confirmed defect | Evidence | Correction / verification |
| --- | --- | --- |
| Product-only auth assertion runs after clean harness replaces product configuration | Neutral template intentionally permits Magic Link; exact failure reproduced in a separate detached temporary checkout | Scope only this TierListBase production assertion to site slug tierlistbase. Neutral template unchanged. Full neutral suite: 497 passed, 1 explicit product-only skip; actual TierListBase: 498 passed, no skip |
| Production-mode SEO harness lacks credentials required by the existing enabled auth/email configuration | Remote build fails with Cron secret required before browser tests | Generate process-only ephemeral auth/cron/Google/Resend fixture values in this local test harness and use the required Resend transport setting. No production guard relaxed, no production credentials/file, no provider acceptance |
| Vanguard page omits the existing global structured-data renderer | Once harness starts, real browser assertion fails: /wow-forever/vanguard structured data exists, received 0 | Reuse existing JsonLd and webApplicationJsonLd, fixed registered canonical URL and registered public copy. No new schema strategy or indexable URL. Production-mode browser suite 7/7 passed |

The first local SEO run after fixing Vanguard then found the separate isolated database lacked the existing reviewed Genshin fixture. Existing guarded seedGenshinTestDatabase was run only against localhost/vanguard_20261019_e2e; no Genshin code/test/content change was made. Full 7/7 production-mode SEO pass followed. A pre-existing Genshin fetch-count test also retried successfully in GitHub; it was not modified or treated as the cause of the later production-harness failure.

This correction changes exactly four files: the existing Vanguard page, tests/e2e/start-production-seo-server.ts, tests/unit/wow-vanguard/integration-boundaries.test.ts and this ledger. Four reviewed/in-scope, zero deleted, zero unknown. Cumulative release repair scope: seven files, six evidenced defects, zero feature additions. Local lint, format, typecheck, security and SEO verifier passed; complete GitHub CI must rerun on the final repaired head. External/HUMAN_REVIEW gates above remain unchanged; no merge or deployment.

## Neutral browser-route boundary

Run https://github.com/pyxm1618/tierlistbase/actions/runs/39372836231 on ce73500 passed all previously failed stages and progressed through neutral unit/integration/build into neutral browser tests. Five Vanguard SSR viewport tests failed with HTTP 500 because the neutral route registry intentionally does not register /wow-forever/vanguard. Other shared browser checks passed. This is the seventh evidenced release-validation defect, not a new product requirement.

The five product-page cases now explicitly skip only when that route is absent from the active registry. Actual TierListBase/Vanguard configuration continues to execute all five. The remaining shared Camera-policy, Tier List deep-link, Manifest ETag and immutable WAV checks remain unconditional. No route, feature flag or application fallback is added. This repair changes only tests/e2e/vanguard-foundation.spec.ts and this ledger: 2 reviewed/in-scope, 0 deleted, 0 unknown. A complete local clean-setup and actual-product foundation regression are required before pushing; complete remote CI must then rerun on this head. External/human/merge/deploy gates remain unchanged.
