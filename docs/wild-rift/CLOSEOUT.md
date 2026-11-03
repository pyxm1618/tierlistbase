# PR #114 closeout — 2026-11-03

**DATA READY / BLOCKED ON SOURCE ASSET / NOT READY FOR FINAL REVIEW.**

Continue PR #114 only. Keep the PR OPEN and DRAFT. Do not merge or deploy.

## Current verified data state

- Current game version: `7.3d`
- Latest standard Ranked balance: `7.3d`
- Riot patch date: `2026-10-28`
- Statistics patch: `7.3d`
- Statistics updated: `2026-11-01`
- Region: CN
- Rank: Master+
- Queue: Ranked
- Product focus: Solo Queue
- Source: Wild Rift Core reporting official Tencent CN statistics; TierListBase does not independently fetch Tencent.

The current Rankings page explicitly labels the dataset `Official Tencent data · Master+ CN · Updated 2026-11-01 · patch 7.3d`. The separate Wild Rift Core homepage currently shows Diamond+ and is not used by this snapshot.

### Coverage

| Role | Statistics rows | Editorial-only / N/A | Total placements |
| --- | ---: | ---: | ---: |
| Baron | 40 | 6 | 46 |
| Jungle | 44 | 8 | 52 |
| Mid | 40 | 10 | 50 |
| Dragon | 22 | 1 | 23 |
| Support | 33 | 4 | 37 |
| **Total** | **179** | **29** | **208** |

All 537 retained WR / PR / BR values preserve source precision. Missing role rows stay `N/A`; no Diamond+, old-patch, champion-wide replacement, cross-role borrowing, interpolation, or manual estimation is used.

Compared with the previous reviewed 7.3c snapshot, Diana × Mid and Corki × Dragon now have exact current role rows. Singed × Baron, Tristana × Baron, and Malphite × Mid no longer have current exact role rows and therefore display `N/A`.

The source headline says **135 champions tracked** while the 179 current role rows contain **136 distinct champions**. Both facts are preserved; TierListBase does not normalize the discrepancy away.

## Provenance

Three evidence classes remain separate:

1. **Raw statistics** — WR / PR / BR from the exact Master+ CN Champion × Role row.
2. **Wild Rift Core source tier** — the source's current role ranking. The source describes this tier list as data-informed and recomputed from Master+ performance, presence, and expert/community consensus. It is not a Riot or Tencent official tier.
3. **TierListBase Editorial Assessment** — Champion × Role rationale and Decision Signals. These are not Tencent statistics or Riot facts.

No TierListBase tier override is currently applied.

## Trend and What Changed

Trend arrows use only explicitly verifiable same-role **7-day** movement evidence. Six spotlight changes are retained:

- Shyvana Jungle +6.85 pp
- Lee Sin Jungle +2.10 pp
- Akali Mid +1.73 pp
- Samira Dragon −2.08 pp
- Malphite Baron −1.51 pp
- Mel Mid −1.02 pp

The Rankings table's separate `30 d` column is not reinterpreted as 7-day evidence.

`What Changed` now publishes 16 source-tier movements because the current source explicitly provides the role, previous tier, current tier, and date. The UI labels them as **Source tier movement** and does not invent causal explanations.

## Patch impact

Riot 7.3d directly changes Shyvana, Camille, Malphite, Ekko, Lee Sin, Akali, Nasus, Samira, Ashe, Miss Fortune, and Singed. Those facts are described from Riot patch notes. A patch note is never used as proof that WR / PR / BR or tier rose or fell.

Champions without a direct 7.3d champion adjustment explicitly say that no direct champion adjustment is listed for 7.3d; item / objective effects may still matter.

## Audit gates

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
| Fabricated Statistics | 0 |

Historical `2026-10-28-*` fixtures remain untouched as historical evidence. The current reviewed source is also preserved as `2026-11-01-reviewed-source-snapshot.json`.

## Missing Design Assets

The data blocker is closed. The release is still blocked by design source assets.

| Item | Page use | Current problem | Recommended delivery | Transparency / text |
| --- | --- | --- | --- | --- |
| **Final frozen Desktop design — approved identity** | Sole visual source for 1440 overlay and all section geometry | Three 1024×1536 Wild Rift full-page mockups exist in the user's files, but available evidence does not identify which one is the approved frozen source of truth | Provide / identify the approved original at the intended viewport, preferably 1440 px wide or 2× (2880 px) | Preserve design text; no transparency requirement |
| **Final approved Hero artwork** | Hero background / crop | Repo has no approved source artwork matching the frozen design | Exact approved text-free composition; preferably ≥2880 px wide for 1440 desktop, ideally 3840 px wide if 1920 desktop must remain sharp | No webpage text; transparency only if the approved design uses a separate foreground layer |
| **Norra portrait** | Champion card and Champion Detail | `public/images/wild-rift/champions/norra.svg` is only a letter-N placeholder | Approved square portrait, preferably 512×512 PNG/WebP or larger | No text; transparency optional |
| **Other design-specific artwork** | Decorative slices / motifs if baked into the approved design | Cannot be inventoried reliably until the approved frozen design is identified | Exact source exports only where CSS/SVG cannot reproduce the element | No substitute / approximation |

CSS-realizable borders, glow, gradients, dividers, card backgrounds, and simple geometry are not treated as missing artwork.

Because the approved final design identity, Hero source, and Norra portrait are not available, **pixel-perfect acceptance and 1440 overlay comparison cannot be claimed**.

## Scope

- New dependency: NO
- New API: NO
- DB migration: NO
- Scraper / cron / ingestion platform: NO
- Homepage visible UI changed: NO — Wild Rift is registered but not exposed as a new Shared Header navigation item.
- Other game modules changed: NO
- Product scope expansion: NO

## Engineering

The previous Head `9f6de79a2517c1b8e98c76f3c4247d2dda14fe2f` had a complete green CI baseline. That run is not final acceptance for the current data correction.

The final current Head must pass the complete latest workflow again: format, lint, typecheck, unit, integration/contracts, architecture, SEO, i18n, security, production build, runtime smoke, release verification, E2E/accessibility, performance, and clean-setup. Do not weaken any threshold or assertion.

Final state remains:

`BLOCKED ON SOURCE ASSET`

until the approved frozen Desktop design, approved Hero source, and approved Norra portrait are supplied and the pixel-overlay / final CI gates are completed.
