# PR #114 closeout — 2026-10-28

Status: **BLOCKED ON SOURCE ASSET / NOT READY**. No pixel-perfect claim, no overlay comparison, no redesign or replacement artwork. Continue PR #114 only.

## Handoff baseline

- PR: https://github.com/pyxm1618/tierlistbase/pull/114 (OPEN, DRAFT, MERGEABLE when refreshed)
- Branch: `feat/wild-rift-tier-list-v2`
- Base: `58c0c75e7b6398a909aec384c0106659ebacf4ec`
- Incoming Head: `3e58249643aed50829577ec00c6f5d428665dd2e`
- Fetch and PR inspection found no newer commits at handoff.
- Worktree: `/Users/milushangdi/.codex/worktrees/wild-rift-114-closeout/tier list`. The primary checkout's Dragon Traveler work was preserved.

## Data audit

| Gate | Result | Evidence and limits |
| --- | --- | --- |
| Raw Statistics Audit | PASS | All 543 WR/PR/BR values from 181 source rows transcribed at source precision; raw percentage strings and original HTML hash in `reviewed-source-snapshot.json`; regression test pins the raw fixture hash and compares every numeric value. This verifies Wild Rift Core, not an independent Tencent fetch. |
| Role Coverage Audit | PASS | `placement-audit.json` explicitly reconciles all 208 incoming placements. 181 exact statistics rows (A), 27 explicitly listed on the second editorial tier-list page (B), 0 unsupported placements, 0 unreviewed. Both source pages belong to the same publisher; this is not independent corroboration. |
| Tier Provenance Audit | PASS | `sourceTier`, final `tier`, `tierSourceId`, `editorialTierReason`, and `placementKind` remain separate. All 208 source tiers are retained after role review; overrides: 0. No official Riot/Tencent tier claim. |
| Trend Audit | PASS | 136 exact same-role seven-day deltas; 72 unavailable. No role borrowing and no arrows derived from tier movements. The table's “30 d” label conflicts with its embedded `d7` map; the latter provides the explicit seven-day evidence. History metadata ends 2026-10-27; page update label is 2026-10-26. Both are disclosed. |
| What Changed Evidence Audit | PASS | No unsupported changes published. Source-reported dates/from/to exist for all 16 originals, but their causal reasons are unverified. `change-audit.json`: 0 approved, 16 deferred, 0 rejected, 0 unreviewed; published 0. Restore only with full evidence. |
| Editorial Signal Audit | PASS | All 208 Champion × Role assessments have five explicit reviewed values and a role-specific rationale in `role-reviews.json`. No signals derived from tier. Methodology explains meaning, especially High Team Dependence and High Ease. |
| Champion Detail Content Audit | PASS | 208 individual role rationales; 142 champion-specific strength/limitation pairs, each linked to its actual Riot ability page. `official-kit-evidence.json` records 142 successfully fetched primary references and hashes. Patch 7.3b direct changes include Jhin and Tryndamere, previously omitted. Causal effects are not claimed. |

**DATA READY** means the published snapshot obeys the evidence and missing-data rules above. It does not mean upstream Tencent provenance, source headline consistency, statistical significance, design assets, UI fidelity, or CI are independently proven.

### Coverage reconciliation

| Role | Statistics source | Editorial additions | Final placements |
| --- | ---: | ---: | ---: |
| Baron | 42 | 4 | 46 |
| Jungle | 44 | 8 | 52 |
| Mid | 41 | 9 | 50 |
| Dragon | 21 | 2 | 23 |
| Support | 33 | 4 | 37 |
| Total | 181 | 27 | 208 |

All 27 additions have item-level role and tier evidence in `placement-audit.json`. All show N/A for WR/PR/BR. Twenty previously contained statistics borrowed from another role; those 60 values were removed. Seven already had null statistics. Missing values now total 81 (27 triples); fabricated statistics in the final snapshot: 0.

Catalog assets: 142 entries. Source headline: 134 tracked champions. Actual unique champions in source role tables: 136; statistics coverage and catalog membership remain distinct. The publisher's headline mismatch remains unresolved and is disclosed, not converted into a false exact count.

Quick Picks use the same final rankings. Highest Draft Priority compares champion-wide BR among supported role candidates; Biggest Riser compares available same-role seven-day WR changes. Neither claims a role-specific ban measurement or a proven causal meta effect.

### Live sources checked

- [Riot patch index](https://wildrift.leagueoflegends.com/en-us/news/tags/patch-notes/): latest game version 7.3c.
- [Riot 7.3c](https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3c/): AAA ARAM changes.
- [Riot 7.3b](https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3b/): latest standard Ranked champion/item/rune/jungle balance.
- [Core rankings](https://wildriftcore.com/en/rankings/): CN Server · Master+ · Ranked, update label 2026-10-26.
- [Core editorial tiers/history](https://wildriftcore.com/en/tierlist/): second page supporting the 27 editorial placements and publisher-reported movement facts.
- Individual primary ability URLs and fetched hashes: `official-kit-evidence.json`. No new runtime scraper, API, or scheduled ingestion was added.

## Missing Design Assets

| Required item | Use | Recommended delivery | Transparent | Text |
| --- | --- | --- | --- | --- |
| Final frozen Wild Rift Desktop Web design | Sole UI source of truth for desktop overlay, crops, typography, spacing, all sections and selected states | Original full-size export with intended CSS viewport width; ideally 2× pixels, plus exact fonts if not already in repo | As exported | Preserve design text |
| Final approved Wild Rift Hero source artwork | Hero background and exact crop | Original lossless file; ideally at least 3840 px wide for 1920 px desktop at 2×; final aspect ratio/crop depends on supplied design | Only if design requires it | No text |
| Approved Norra champion portrait | Cards and details | Original square PNG/WebP, ideally at least 256×256; same approved portrait family as existing local assets | Not required unless original uses it | No text |
| Other design-specific slices/icons/textures | Unknown until frozen design is available | Inventory and exact dimensions pending the design; do not substitute random or generated artwork | Pending design | Pending design |

`norra.svg` is a gradient/letter-N placeholder, not a champion portrait. It is now explicitly typed `portraitKind: placeholder`, has an unavailable-portrait accessible label, and has a non-null local path. The existing every-asset test is preserved. This fixes the nullable model without asserting that Norra's genuine portrait exists. The 142 local files decode successfully; the contact sheet shows 141 champion images plus one placeholder. Full portraits gate remains FAIL.

No final design or Hero original was found in the PR checkout or attached in this chat. The existing CSS atmosphere remains the incoming implementation and is not accepted as the missing Hero. No artwork was generated, downloaded as a substitute, or mixed into the page.

## Engineering evidence

Local: formatting PASS; lint PASS with two existing unrelated warnings; typecheck PASS; whole unit suite 717 PASS, final Wild Rift unit suite 18 PASS, and targeted browser suite 11 PASS (including six viewport widths, desktop/mobile accessibility, missing-statistics labels, seven-day trend, placeholder disclosure, and withheld history). The complete CI workflow must run on the final pushed closeout commit; the GitHub Actions run linked in the final handoff is authoritative for its results. E2E/performance/clean-setup are not marked successful from typecheck alone.

No assertions or budgets were weakened. No dependencies, APIs, database migrations, shared header/homepage UI, other game modules, or product scope were changed in this closeout.

## Remaining acceptance

- Complete all checks in the latest CI workflow, including production build, release checks, E2E, performance, independent clean setup, production-mode SEO, vinext build/runtime smoke, contracts and integration.
- Receive frozen design, approved Hero, and approved Norra portrait; inspect and inventory remaining design slices.
- Reproduce exact desktop design, generate same-size screenshot and overlay/difference evidence, then verify responsive behavior/accessibility again.
- Re-fetch latest main and PR head and assess mergeability before final review.
- Keep DRAFT. Do not declare READY FOR FINAL REVIEW while any required acceptance remains incomplete.
