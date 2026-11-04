# PR #114 closeout — 2026-11-04

**RELEASE CANDIDATE READY — FINAL NEW-CI VALIDATION REQUIRED.**

Continue PR #114 only. No new Wild Rift PR/branch, dependency, API, database, scraper, cron, or ingestion platform.

## Git baseline

- PR: https://github.com/pyxm1618/tierlistbase/pull/114
- Branch: `feat/wild-rift-tier-list-v2`
- Current main baseline absorbed: `acdb655713892e739e1b2f6f909c093a8f211c5b`
- Branch is required to remain **behind main = 0** before merge.
- Historical audit fixtures remain preserved.

## Current version and statistics context

- Game version / latest standard Ranked balance: **7.3d**
- Riot patch date: **2026-10-28**
- Ranked statistics: **Wild Rift Core-reported Tencent CN · Master+ · Ranked**
- Statistics updated: **2026-11-01**
- Source headline: **135 champions tracked**
- Distinct champions in actual role rows: **136**
- Exact Champion × Role statistics rows: **179**
- Final Champion × Role placements: **208**
- Editorial-only / WR-PR-BR N/A placements: **29**
- Fabricated statistics: **0**

The 135-vs-136 source discrepancy is preserved and disclosed. No Diamond+ homepage values, cross-role statistics, older-patch fills, interpolation, or estimated WR / PR / BR are used.

## Data audit

| Gate | Result |
| --- | --- |
| Raw Statistics Audit | PASS |
| Patch Freshness | PASS |
| Rank Context Consistency | PASS |
| Role Coverage Audit | PASS |
| Tier Provenance Audit | PASS |
| Missing Statistics Honesty | PASS |
| Trend Audit | PASS |
| What Changed Audit | PASS |
| Editorial Signals Audit | PASS |
| Champion Detail Audit | PASS |
| Fabricated Statistics | **0** |

### Role coverage

| Role | Statistics-backed | Editorial-only / N/A | Total |
| --- | ---: | ---: | ---: |
| Baron | 40 | 6 | 46 |
| Jungle | 44 | 8 | 52 |
| Mid | 40 | 10 | 50 |
| Dragon | 22 | 1 | 23 |
| Support | 33 | 4 | 37 |
| **Total** | **179** | **29** | **208** |

## Tier provenance

Three evidence layers remain separate:

1. **Raw statistics** — Wild Rift Core reports Tencent CN Master+ Ranked statistics.
2. **Wild Rift Core source tier** — source ranking; not a Riot/Tencent official tier.
3. **TierListBase editorial review** — Champion × Role rationale and Decision Signals.

All 208 current source tiers are retained. TierListBase applies **0 tier overrides** in this snapshot.

## Trend and What Changed

Only six explicitly labeled same-role **7-day** movements drive trend arrows. The source's separate 30-day field is not repurposed as 7-day evidence.

`What Changed` publishes only source-tier movements for which the source explicitly provides previous tier, current tier, role, and date. Patch notes are not converted into invented performance outcomes.

## Final design and assets

The source-asset blockers are closed.

- **Final frozen Desktop design:** explicitly supplied and confirmed by the user on 2026-11-04 as the sole visual source of truth.
- **Approved Hero artwork:** explicitly supplied and confirmed by the user on 2026-11-04.
  - Repository path: `public/images/wild-rift/hero.webp`
  - Web asset: 1440×538 WebP
  - Size: 52,376 bytes
  - Verified Git blob SHA: `9383594d4b40daaa1b2c2e74fa54541341b9eaae`
  - The Git blob SHA was verified against the locally produced approved asset before installation.
- **Norra portrait:** placeholder removed.
  - Repository path: `public/images/wild-rift/champions/norra.png`
  - Size: 57,157 bytes
  - Git blob SHA: `0a80721f7f36ccb660fddf8b020cadd046bae66c`
  - Riot's official Norra champion page remains the identity / kit evidence; the reviewed portrait bytes are from WildRiftFire and are not represented as Riot-hosted artwork.
- Temporary Hero transfer chunks are absent from the final repository tree.
- Permanent E2E now verifies that both the Hero and Norra image actually decode with `naturalWidth > 0`; path existence alone is not accepted.

## Visual acceptance

- Final frozen Desktop source of truth: **YES**
- Approved Hero source: **PASS**
- Norra portrait: **PASS**
- 1440 scoped page composition: **PASS**
- Responsive 390 / 768 / 1440 coverage: **PASS**
- Shared Header / Footer: intentionally outside this page-redesign scope.
- No approximate Hero, AI-generated substitute, alternate champion, or letter placeholder is accepted.

A 1440 actual-page evidence run was reviewed for page geometry and section composition. The final approved Hero is now installed as the exact verified asset, and permanent E2E enforces successful image decoding.

## Scope

- New dependency: NO
- New API: NO
- DB migration: NO
- Scraper / cron / ingestion platform: NO
- Shared Header / Footer redesign: NO
- Other game module implementation changes: NO
- Product architecture expansion: NO

## Release rule

Engineering acceptance must use the **latest final Head** on the repository's new CI architecture. The PR may be marked Ready and merged only when all of the following are true:

- behind main = 0
- mergeable = true
- unresolved review threads = 0
- `CI Required = PASS`
- no product/data/asset/visual blocker remains

After merge, the resulting main run must also finish with `CI Required = PASS` and `Production Deploy = PASS`.

**Current status: RELEASE CANDIDATE READY — WAITING ONLY FOR FINAL NEW-CI VALIDATION.**
