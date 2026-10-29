# PR #114 closeout — 2026-10-29

**BLOCKED ON SOURCE ASSET / NOT READY. DATA NOT READY for current 7.3d outcomes.**

Continue PR #114 only. Existing functionality and the five frozen role lists are preserved. No new PR, redesign, API, database, dependency, or ingestion platform.

## Git and CI baseline

- PR: https://github.com/pyxm1618/tierlistbase/pull/114 (OPEN / DRAFT / MERGEABLE when refreshed)
- Branch: `feat/wild-rift-tier-list-v2`
- Base: `58c0c75e7b6398a909aec384c0106659ebacf4ec`
- Incoming handoff Head: `3e58249643aed50829577ec00c6f5d428665dd2e`
- First closeout Head: `a7787c20a327887241eba8c591150941b1dd8c03`
- [Full CI at that Head](https://github.com/pyxm1618/tierlistbase/actions/runs/40647795705): quality, performance, E2E, clean-setup all SUCCESS. Production deployment skipped as expected for a PR. All required checks actually ran, including integration/contracts, production build, vinext/runtime smoke, production-mode SEO, and release verification.
- This new 7.3d freshness correction must pass the complete workflow on its own pushed Head. Final PR description and handoff link the authoritative final run.
- Worktree: `/Users/milushangdi/.codex/worktrees/wild-rift-114-closeout/tier list`. Primary checkout's Dragon Traveler work is preserved.

## New source facts and explicit limits

[Riot 7.3d](https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3d/) was published 2026-10-28 and includes standard champion, item, objective, and turret changes. Both current Game Version and Latest Ranked Balance are now 7.3d. They remain separate fields. Historical 7.3c was AAA ARAM-focused; 7.3b is no longer the latest balance patch.

The available [Core rankings reader capture](https://wildriftcore.com/en/rankings/) is dated 2026-10-27 and labels its statistics 7.3c. It has 180 role rows (Mid 40, down from the prior 41). This is a cached reader capture, not a successful live raw refresh. Direct raw access returned HTTP 403 and the browser displayed verification; no challenge was bypassed. The [Core editorial tier page](https://wildriftcore.com/en/tierlist/) labels its tiers 7.3d and still explicitly lists all 208 role placements. Those tier judgements are not evidence of post-7.3d statistical outcomes.

The page prominently states that its statistics predate 7.3d and that post-patch performance is unverified. `snapshot.statisticsPatch` and `snapshot.postBalanceStatisticsVerified` prevent laundering old statistics into a new patch. `freshness-audit.json` reconciles five roles: 0 approved for current-patch outcomes, 5 deferred, 0 rejected, 0 unreviewed.

## Data audit

| Gate | Result | Evidence and limits |
| --- | --- | --- |
| Raw Statistics Audit | PASS for dated available capture | All 540 WR/PR/BR values exactly match 180 readable rows at source precision. Raw percentage strings and reader line references are pinned in `reviewed-source-snapshot.json`; the prior 543-value fixture and hash are preserved separately. This is Core-reported Tencent data, not an independent Tencent fetch. |
| Role Coverage Audit | PASS for available capture | All 208 originals are itemized. 180 exact statistics rows (A), 28 explicit editorial role placements on the second page (B), 0 unsupported, 0 unreviewed. Both pages have the same publisher; this is not independent corroboration. |
| Tier Provenance Audit | PASS | Source tier, final tier, source ID, override reason, and placement kind are separate. All 208 source tiers are retained; no overrides or official-tier claims. |
| Trend Audit | PASS for available evidence | Six explicitly labeled same-role seven-day spotlight deltas are verified; 202 remain unavailable. No old `d7` values are copied forward, no ambiguous “30 d” column is treated as seven-day evidence, and no arrows come from tier movement. |
| What Changed Evidence Audit | PASS | No unsupported changes published. All 16 originals remain deferred in `change-audit.json`: source-reported from/to/date exist, causal reasons do not. Published 0; unreviewed 0. |
| Editorial Signal Audit | PASS | All 208 Champion × Role assessments have explicit values and role rationales. No signal is computed from Tier. Methodology explains rubric and direction, including High Team Dependence. |
| Champion Detail Content Audit | PASS as dated editorial review | 208 individual role rationales and 142 specific strength/limitation pairs; primary ability URLs in `official-kit-evidence.json`. All 11 direct champion changes in 7.3d are noted. Every detail discloses that measured post-7.3d outcomes are unavailable. |
| Current-patch data freshness | FAIL / DEFERRED | No verifiable post-7.3d statistics window. Passing transcription and provenance checks does not make this current-patch data ready. |

**DATA NOT READY for current 7.3d acceptance.** Never infer new-patch rates, signal changes, or tier movement from patch notes alone.

### Coverage

| Role | Statistics rows | Editorial-only additions | Final placements |
| --- | ---: | ---: | ---: |
| Baron | 42 | 4 | 46 |
| Jungle | 44 | 8 | 52 |
| Mid | 40 | 10 | 50 |
| Dragon | 21 | 2 | 23 |
| Support | 33 | 4 | 37 |
| Total | 180 | 28 | 208 |

Diana × Mid is absent from the newer readable statistics table but remains explicitly listed on the editorial role page. Its rates are now N/A, alongside the other 27 editorial-only placements. Missing values: 84 (28 triples). Fabricated statistics: 0. Earlier cross-role substitutions are removed; no role inherits another role's WR/PR/BR.

Champion catalog: 142. Source headline: 134 tracked. Actual distinct champions counted in the readable role rows: 136. The publisher's headline discrepancy remains unresolved and disclosed.

Quick Picks, detail rates, and tiers use the same audited rankings. Biggest Riser compares only the available same-role seven-day evidence; Mid and Support have no verified positive delta and publish no Biggest Riser item. Highest Draft Priority uses champion-wide BR and says so. All insight conclusions are editorial and use pre-7.3d evidence, not verified new-patch results.

## Preserved audit history

The prior source fixtures, placement ledger, and report are copied intact to `2026-10-28-*.json` / `2026-10-28-CLOSEOUT.md`. These preserve the prior 181 statistics rows, 27 editorial additions, and 136 trend deltas without implying they remain current. The original 16 change records are preserved in their own ledger. No unreviewed item was deleted or treated as rejected.

## Missing Design Assets

| Item | Use | Recommended delivery | Transparency / text |
| --- | --- | --- | --- |
| Final frozen Desktop Web design | Sole source for overlay, crop, typography, spacing and all states | Original full-size export with intended CSS viewport width, ideally 2×, plus any missing fonts | As exported; preserve design text |
| Final approved Wild Rift Hero | Exact Hero background/crop | Original lossless artwork, ideally at least 3840 px wide for 1920 px desktop at 2×; exact ratio awaits design | Transparent only if required; no text |
| Approved Norra portrait | Cards and Champion Detail | Original square PNG/WebP, ideally at least 256×256, matching the approved portrait family | Transparency optional; no text |
| Other design-specific icons/textures/slices | Cannot inventory without frozen design | Exact files, dimensions and placements pending design | Pending design; do not substitute |

`norra.svg` is a letter-N placeholder, not a real champion portrait. Its non-null path and explicit `portraitKind: placeholder` fix the model/typecheck while preserving the asset test and honest accessible label. All 142 local files decode; 141 are champion images and one is a placeholder. Portrait acceptance remains FAIL.

No frozen design or approved Hero original was supplied. Existing CSS atmosphere is inherited implementation, not an accepted Hero. No random online artwork, generated approximation, or mixed-version design assets were added. Pixel-perfect Desktop remains unverified: no overlay comparison exists.

## Engineering and remaining acceptance

The previous full green CI is pinned above. Run all latest-workflow gates for this freshness correction without skipping, weakening assertions, or increasing budgets. Unit tests pin both raw fixtures, exact current row counts, every retained rate, provenance, unavailable trends, withheld changes, and the pre/post-patch boundary. Browser checks verify visible N/A, source links, missing portrait labels, real seven-day evidence, and the freshness notice.

Receive the frozen design and approved artwork, inventory remaining slices, perform desktop overlay/difference comparison, and rerun responsive/accessibility/performance checks after actual UI closeout. Re-check main and PR Head before final review. Keep PR DRAFT and report NOT READY until current-patch data and design acceptance are actually satisfied.
