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

Clef currently has only implementation/moderation/samples.template.json, not a real private labeled manifest. No real calibration set/path is assumed; no test image is generated; thresholds and real-sample evaluation remain BLOCKED_EXTERNAL.

Before merge, verify the available Google configuration/return flow, R2 CORS/lifecycle/private-public/delete/purge, real Clef samples/calibration and received Resend notification only when actual configuration and inputs exist. Final Google production callback/session/returnTo acceptance belongs to the post-deployment smoke test. Human review and production acceptance cannot be replaced by local or mocked test success.
