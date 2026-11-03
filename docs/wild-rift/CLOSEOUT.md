# PR #114 closeout — 2026-11-03

**BLOCKED ON SOURCE ASSET. DATA READY. PR MUST REMAIN DRAFT.**

Continue PR #114 only. No new Wild Rift PR/branch, no merge, no production deploy, no new dependency/API/database/scraper/cron/ingestion platform.

## Git baseline

- PR: https://github.com/pyxm1618/tierlistbase/pull/114
- Branch: `feat/wild-rift-tier-list-v2`
- Base: `58c0c75e7b6398a909aec384c0106659ebacf4ec`
- PR remains OPEN / DRAFT.
- Historical `2026-10-28-*` audit fixtures remain preserved and are not overwritten.

## Current version and statistics context

Riot's current listed game update is **7.3d**, published 2026-10-28. The standard Rift patch contains champion, item, objective, and turret changes.

The reviewed Wild Rift Core rankings snapshot is:

- Patch: **7.3d**
- Updated: **2026-11-01**
- Region: **CN**
- Rank: **Master+**
- Queue: **Ranked**
- Product focus: **Solo Queue**
- Source headline: **135 champions tracked**
- Distinct champions counted in the actual role rows: **136**
- Exact Champion × Role statistics rows: **179**

The 135-vs-136 discrepancy is preserved and disclosed. No Diamond+ homepage values are used.

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

All WR / PR / BR values are copied at source precision from the current exact role row. A placement without a current role row keeps WR / PR / BR as N/A. No cross-role, cross-rank, older-patch, champion-wide-WR, interpolation, or estimation fallback is used.

## Tier provenance

Three layers remain separate:

1. **Raw statistics** — Wild Rift Core reports Tencent CN Master+ Ranked statistics.
2. **Wild Rift Core source tier** — data-informed source ranking using Master+ performance/presence plus external consensus; not a Riot/Tencent official tier.
3. **TierListBase editorial review** — Champion × Role rationale and Decision Signals.

All 208 current source tiers are retained. TierListBase applies **0 tier overrides** in this snapshot.

## Trend and What Changed

Only six explicitly labeled same-role **7-day** movements are used for trend arrows:

- Shyvana · Jungle: +6.85 pp
- Lee Sin · Jungle: +2.10 pp
- Akali · Mid: +1.73 pp
- Samira · Dragon: -2.08 pp
- Malphite · Baron: -1.51 pp
- Mel · Mid: -1.02 pp

The separate table `30 d` field is not repurposed as a 7-day signal. The other 202 placements show trend unavailable.

`What Changed` now publishes only the 16 source-tier movements for which the source explicitly provides previous tier, current tier, role, and date. Their cards make **no causal claim**. Patch notes are never used to manufacture tier or win-rate outcomes.

## Quick Picks and insights

Quick Picks come from the same audited Champion × Role model as the formal tier boards:

- Baron: Shen
- Jungle: Rammus
- Mid: Hwei
- Dragon: Smolder
- Support: Braum

Highest Draft Priority explicitly describes BR as champion-wide draft pressure, not a role-specific ban measurement. Biggest Riser exists only where verified positive same-role 7-day evidence exists.

## Champion detail and patch impact

All 208 Champion × Role placements keep explicit role rationale and five TierListBase editorial Decision Signals. Strengths/limitations are tied to primary champion ability references.

7.3d direct champion adjustments are described only where Riot's patch notes contain them. Otherwise the detail states: **No direct champion adjustment in 7.3d.** No patch-note change is converted into an invented performance outcome.

## Design and asset status

The final refined Desktop design reference is available to the reviewer, so the old `Final design missing` blocker is removed. It is the visual source of truth for the eventual 1440 desktop overlay.

### Missing Design Assets

| Asset | Page use | Why blocked | Recommended delivery | Transparency / text |
| --- | --- | --- | --- | --- |
| Final approved Hero source artwork | Hero background / exact crop and positioning | No approved standalone high-resolution source asset is present in the PR or available asset set | Prefer 3840px-wide lossless/high-quality source (minimum sufficient for 1920px desktop at 2×) with the exact final composition | No webpage text; transparency only if the approved composition requires it |
| Norra official/approved portrait | Champion cards + Champion Detail | `norra.svg` is still a letter-N placeholder | Square source, preferably 512×512 or larger | No text; transparency optional |
| Any non-CSS design-specific artwork revealed by the final asset inventory | Exact decorative artwork only | Must not be approximated | Original/high-quality export at design size or 2× | No embedded webpage copy unless it is intentionally part of the artwork |

Borders, glow, gradients, dividers, card surfaces and simple geometric icons remain CSS/SVG implementation details and are not treated as missing source artwork.

Because the approved Hero source and Norra portrait are still missing, **pixel-perfect Desktop cannot be truthfully accepted yet**. No approximate Hero, random official background, AI-generated substitute, alternate champion, or letter placeholder may be accepted as final.

## Visual acceptance

- Final design available: YES
- Pixel-perfect Desktop: FAIL / BLOCKED
- 1440 overlay comparison completed: NO
- Responsive acceptance after final artwork: pending final visual closeout
- Shared Header / Footer remain out of redesign scope.

## Scope

- New dependency: NO
- New API: NO
- DB migration: NO
- Scraper / cron / ingestion platform: NO
- Homepage visible UI redesign: NO
- Other game module implementation changes: NO
- Product architecture expansion: NO
- Merge / deploy: NO

## Final status rule

Data is ready. Engineering acceptance must be based only on the final new Head CI, not an older green run.

Until the missing approved Hero source and Norra portrait are supplied and the 1440 overlay is completed, the only valid release status is:

**BLOCKED ON SOURCE ASSET**
