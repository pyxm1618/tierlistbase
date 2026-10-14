# Genshin Tier List V1 acceptance

Base: `012aefdbc1facaec9336903d46f88af93b1c40a4`. Visual reference: user-approved `素材/原神.png`. The user supplied a replacement full-resolution Hero and explicitly approved uniform Mock avatars. Shared Header/Footer are unchanged.

## Coverage ledger

28 requirements = 26 pass + 2 deferred + 0 confirmed reject + 0 unreviewed. Deferred does not mean rejected or complete.

| ID | Requirement | State | Evidence / limit |
|---|---|---|---|
| 01 | Approved visual structure | Pass | Skyline header/context, compact filters, board left, detail/changes right, four lower panels. Approved replacements: new Hero, uniform Mock avatars, shared site navigation. |
| 02 | Ten IA layers in order | Pass | Browser DOM order assertion. |
| 03 | Character search | Pass | Trimmed, case-insensitive search; empty-result feedback. |
| 04 | Role filter | Pass | All / Main DPS / Sub DPS / Support; combined browser and unit test. |
| 05 | Element filter | Pass | All plus seven elements; combined browser and unit test. |
| 06 | Complete tiers | Pass | S / A+ / A / B+ / B / C / D / E / F / Pending Evaluation. |
| 07 | A–Z within tiers | Pass | English locale comparator in code; unit/browser assertions; no internal rank numbers. |
| 08 | No initial selection | Pass | Empty desktop panel; no mobile modal until user selection. |
| 09 | Selected detail | Pass | Facts, primary Why this Tier, all six explanatory headings, Last Updated. |
| 10 | Mobile dialog | Pass | Native modal dialog; Escape, focus restoration, background inertness, scroll locking, viewport switch cleanup. |
| 11 | What's Changed | Pass | Mock New Characters and Tier Changes only; no news/patch-note system. |
| 12 | Five methodology dimensions | Pass | Exact five required dimensions, server-rendered. |
| 13 | Three evidence classes | Pass | Official Facts / Observed Performance Data / Editorial Cross-check; verification pending, no invented counts or source URLs. |
| 14 | Ten tier definitions | Pass | One short sentence per required tier. |
| 15 | Bounded FAQ | Pass | Six tier-list questions, native details controls. |
| 16 | No prohibited V1 features | Pass | Scoped diff review; no build/wiki/teams/pull/community/mode rankings. |
| 17 | WoW regression | Deferred | WoW/Meta Board/Forever Logs/navigation are byte-for-byte unchanged from base. Navigation and performance pass; the legacy presentation suite fails on baseline assumptions/behavior (see below). No claim of an all-green WoW presentation suite. |
| 18 | No horizontal overflow | Pass | Chromium at 390/768/1024/1440/1920/2560. |
| 19 | Image strategy | Pass | Approved original Hero → WebP → static import → next/image. Uniform Mock avatar approved by user. Sizes, lazy loading, image byte/candidate sampling. |
| 20 | Full verification | Deferred | Formatting/lint/typecheck/unit/contract/build and targeted browser/performance pass; legacy WoW presentation suite remains red. |
| 21 | No screenshot asset crops | Pass | Source provenance in module assets README; no design screenshot shipped. |
| 22 | Single Hero preload | Pass | Browser asserts exactly one image preload; no avatar preload. |
| 23 | Real responsive image evidence | Pass | currentSrc / naturalWidth / renderedWidth / encodedBodySize at three widths and desktop/mobile DPR. |
| 24 | Content versioning/cache | Pass | Static build asset `hero-f958fb67df.a8ec62c8.webp`; observed `public, max-age=31536000, immutable`. |
| 25 | Server/client boundary | Pass | Page/header/context/editorial remain server-rendered; local board interaction is one client island; changes passed as rendered server content. |
| 26 | Existing performance framework | Pass | Genshin added to existing marketing suite; real search/filter/selection interactions; no new framework/dependency. |
| 27 | Mock-stage noindex/truthfulness | Pass | Existing public_noindex route preserved; version/date/reference content Pending verification. Production check recorded below. |
| 28 | Drawer accessibility | Pass | Native dialog semantics; card buttons; keyboard tests and zero serious/critical axe violations. |

## Mock scope and boundaries

54 character UI fixtures; all assigned tiers, Primary Roles, rationale/strengths/limitations/use contexts, two new-character examples, two tier-change examples and evidence summary are Mock/Placeholder. Uniform 256px branded avatar is a placeholder, not character artwork. No verified current version, ranking-update date or main reference content is asserted. No formal database writes, backend/API/schema changes, crawlers, ranking algorithm changes or new dependencies. A new local dedicated presentation-test database was created and migrated using existing scripts only to investigate baseline regressions; it contains synthetic WoW test fixtures, no Genshin mock writes or production data.

## Verification results

- `bun run format:check`, `bun run lint`, `bun run typecheck`, `git diff --check`: pass in the isolated worktree. Original checkout's pre-existing untracked audit scripts were preserved and excluded from this PR.
- `bun run test:unit`: 60 files / 312 tests pass.
- `bun run test:contract`: 35 tests pass.
- `bun run build:test`: pass. `APP_ENV=production APP_ORIGIN=https://www.tierlistbase.com bun run build`: pass (production requires HTTPS origin; the local HTTP origin was overridden for this command only).
- Genshin + homepage browser suite: 18 tests pass against the optimized test-environment build. Genshin production-environment browser suite: 8 tests pass; observed robots `noindex, follow` and no canonical link. Evidence: `docs/genshin-v1-evidence/production-noindex-and-cache.json`.
- Existing marketing performance + navigation suites: 18 tests pass across desktop and Pixel 7 emulation.
- Observed Genshin lab metrics: desktop CLS 0.0118014, LCP 164ms, INP 48ms, script bytes 151490; mobile CLS 0.0027974, LCP 116ms, INP 56ms, script bytes 145004. No >500KB images, serious/critical axe violations or browser console errors in these runs. These are local lab results, not field metrics or production deployment acceptance.
- Image evidence: `docs/genshin-v1-evidence/browser-image-and-performance.json`. No unknown timing is replaced with a fabricated value; HTTP response-body byte counts are separately identified.
- Production-environment full-page captures retained at 390, 1440 and 1920 in `docs/genshin-v1-evidence/`. Six responsive widths were checked.

## Existing WoW presentation failures

`tests/meta-board/presentation.spec.ts` failed 8 desktop/mobile cases. It uses synthetic `overall/all` contexts while current main defaults to `dungeon/dps`; its pending-mask selector also matches multiple aria-hidden elements. Diagnostic fixture corrections exposed further baseline problems: selecting All removes the role parameter, after which the existing page defaults to dps; the empty-evidence drawer's scroll region fails keyboard-accessibility validation. Those diagnostics were reverted. Existing WoW product files and the presentation spec are unchanged in the final diff. Repairing WoW is outside this user's explicitly locked scope, so the failures remain deferred rather than being hidden or reclassified as pass.

No merge, deployment, production database change or real ranking publication was performed.
