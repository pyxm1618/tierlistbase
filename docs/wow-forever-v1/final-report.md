# WoW Forever V1 delivery report

Base SHA: `ee400982f197646aeab6d0db526f0367f101e24e` (initial); rebased onto `2feb6a69d33751d49685f949e3fd96ac5ef401de`.

Final origin/main checked: `2feb6a69d33751d49685f949e3fd96ac5ef401de`, fetched 2026-10-15.

Branch: `codex/wow-forever-v1-publication-gate`

PR: [Draft #24](https://github.com/pyxm1618/tierlistbase/pull/24). No merge, deployment or production publication performed. Current remote checks are available on the PR; this report does not substitute local results for CI or production acceptance.

Main WoW files changed:

- `src/app/(marketing)/wow-forever/tier-list/page.tsx`
- `src/modules/meta-board/wow/` (model, workspace, detail, editorial, role links, icons, CSS and assets)
- `src/modules/meta-board/db/queries.ts`
- `src/modules/meta-board/domain/{wow-context,forever-logs-publication,forever-logs-data-ranking}.ts`
- `src/modules/meta-board/data/forever-logs-publisher.ts`
- `scripts/update-wow-forever-data.ts` and the WoW route entry in `src/config/routes.config.ts`
- Relevant unit/integration/presentation/performance/SEO tests. Shared exception: one-line Homepage cached-date fix with regression test.

Implemented modules: approved Hero; fixed Dungeon / Level 30 context; DPS/Tank/Healer navigation; Class Navigator; Tier Board; four-tab Spec Detail; responsive modal drawer; Quick Insights; What Changed; Sources & Evidence; Methodology & FAQ. Server-rendered route and editorial sections; client boundaries limited to interactions. Existing database/query/module architecture retained.

Real data used: the page reads existing database records through the shared query. Blizzard official current Beta notes were read for Level 30 and dungeon availability/ranges; Wetlands corrected to 26–31. Authenticated current Forever Logs responses and production Neon records have not been validated in this environment. Dedicated local synthetic fixtures were used only for tests, screenshots and performance measurement. No sample/design values were put into production.

| Production acceptance gate | Status |
| --- | --- |
| Forever Logs production secret | configured (user-confirmed in Worker tierlistbase) |
| Forever Logs live API validation | Pending — remote production validation pending |
| Production DB read-back | Pending — remote production validation pending |
| Active phase / context consistency | Pending — remote production validation pending |
| Data freshness | Pending — remote production validation pending |

The existing production Neon DATABASE_URL remains user-confirmed configured. Local inability to read Cloudflare Secrets is environment isolation. Runtime ingestion continues to use FOREVER_LOGS_API_KEY and DATABASE_URL; no second Secret name or Secret value was introduced into the repository.

Pending / N/A fields: missing or invalid observations, insufficient included samples/coverage, unknown legacy Class/Spec metadata, and unreviewed/expired phase evidence remain Pending/Preliminary/Stale. Missing dungeon observations stay N/A. City of Dalaran numerical level range remains unknown. No previous change record becomes Stable; one performance source does not become source agreement. Unreviewed external editorial sources do not contribute to rankings.

Ranking logic changed: YES — eligibility and evidence/context validation hardened; existing within-dungeon normalization, parse weighting, score formula and tier bands retained. Minimum 5 parses per included dungeon, 2 dungeons and 20 included parses remain enforced. Scores/tier/rank cannot contradict validated observations.

Database schema changed: NO. No migration, dependency or deployment configuration change.

Forever Logs pipeline changed: YES.

If YES, exact reason: require explicit active phase_number rather than phase row id, reviewed current official/taxonomy context and metric-specific roles; validate malformed/empty payload context; persist Class parent/Profile identity. Use bounded upserts and abort an incomplete same-phase refresh instead of deleting or leaving a partially refreshed snapshot. Existing parser/ranking flow retained; no scraper, CMS or asset system added. CLI defaults to dry-run and requires an explicit review file for publishing.

Images:

```text
Hero: FINAL / approved
Class Icons: PLACEHOLDER / final assets pending
Spec Icons: PLACEHOLDER / final assets pending
```

Image strategy:

- WebP: approved original Hero 2172×724 → 299436-byte WebP, no resize/upscale/crop. Neutral geometric placeholder 128×128 / 796 bytes; no official imagery claimed.
- hashed/versioned assets: static imports emit content-hashed build URLs. Minimal provenance ledger: `src/modules/meta-board/wow/assets/README.md`; Hero Source: user-provided project asset / Status: approved.
- Hero preload: only large priority image; existing Next Image convention.
- non-critical lazy: Class/Spec/detail images use lazy loading and bounded layout dimensions.
- responsive sizes: Hero viewport-aware sizes; icon sizes 36/56px. Seven-width browser currentSrc, intrinsic/rendered widths, response bytes and DPR recorded in `evidence/image-candidates.json`. Browser naturalWidth is density-corrected; placeholders are not evidence of final icon sharpness or final visual acceptance. No external pictures fetched or pseudo-official AI icons generated.

Viewport acceptance:

| Width | Local browser result |
| --- | --- |
| 390 | PASS; modal detail / mobile controls |
| 768 | PASS; responsive workspace / modal detail |
| 1024 | PASS; responsive workspace / modal detail |
| 1280 | PASS; desktop detail column |
| 1440 | PASS; desktop layout screenshot |
| 1920 | PASS; bounded desktop layout screenshot |
| 2560 | PASS; bounded wide layout |

Performance: local production-build browser lab, dedicated synthetic fixture; not production RUM. Full records in `evidence/performance-metrics.json`.

| WoW route | CLS | LCP | INP | Script bytes / count |
| --- | --- | --- | --- | --- |
| Desktop default | 0 | 112 ms | 48 ms | 156463 / 9 |
| Desktop query | 0 | 92 ms | 48 ms | 156463 / 9 |
| Mobile default | 0 | 152 ms | 40 ms | 151053 / 8 |
| Mobile query | 0 | 100 ms | 72 ms | 151053 / 8 |

oversized images: none detected by the existing budget checks. Thresholds retained; populated boards exercise real Spec/Performance interactions, empty boards retain the existing generic lab interaction so INP is measured.

Tests:

- Pinned Bun 1.3.14: unit 337/337; full database integration 265/265 (including targeted meta-board 6/6); typecheck PASS.
- WoW presentation 28/28, desktop/mobile projects including seven widths, SSR, context isolation, filters, tabs, drawer focus/Escape/backdrop/scroll lock, accessibility and image behavior.
- Existing performance 20/20 populated and 20/20 empty DB; analytics-enabled 1/1. SEO production-build/canonical 4/4.
- Scoped ESLint/Prettier, secret scan, i18n, SEO and git diff check PASS. Full working-directory lint encounters five pre-existing errors in three unrelated untracked audit scripts, which were preserved and excluded from the PR.
- Independent review found no Critical and two Important issues; both corrected and verified with parser/publication unit tests and SQL rollback integration tests.
- Initial remote CI harness failures were reproduced and fixed without weakening budgets or removing tests. The neutral clean-setup route uses the configured H1/structured-data name, preserving the registry contract when example configuration is applied. Latest CI status must be read from the PR checks.

Genshin regression: existing functional checks included in 18/18 Homepage/Genshin run; existing performance checks passed. No Genshin files changed.

Homepage regression: same 18/18 run; one reproduced cache-hit date serialization bug fixed with a dedicated RED→GREEN unit test.

Remaining issues:

- Remote production validation pending for the four runtime/data gates above; authenticated phase/taxonomy, stored version/role context and timestamps must be checked before READY.
- Remaining issue: final Class/Spec visual assets pending. User-approved development placeholders permit functional delivery but do not count as final visual assets.
- Draft PR checks must complete successfully before integration. No merge/deployment authorized or performed in this delivery.

44-item coverage reconciliation: 44 = 33 approved/pass + 2 deferred/waiting for visual assets + 9 deferred/unknown for remote data + 0 confirmed reject + 0 unreviewed. See `gap-audit.md` for item-level evidence and next actions.

Final: NOT READY — remote production validation pending. WoW V1 functional implementation is delivered for review in the draft PR; production authenticity acceptance is still pending.
