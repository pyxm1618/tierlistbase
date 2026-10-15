# WoW Forever V1 Implementation Plan

**Goal:** Deliver the approved Dungeon / Level 30 Beta decision board with real stored evidence, honest unavailable states, and a fail-closed publication gate.
**Spec:** docs/wow-forever-v1/merged-requirements.md plus the user's 2026-10-15 asset exception: approved Hero; neutral, explicitly labelled Class/Spec placeholders permitted.
**Architecture:** Keep the route server rendered and shared ranking/query logic. A small WoW presentation model validates stored source observations; a client workspace handles class filtering, selection, tabs and native modal detail. Server components own Hero, context links, insights, changes, sources and FAQ.
**Constraints:** No dependencies/schema changes, no alternate ranking engine, no image scraping, no invented values. Preserve shared navigation/Genshin/Homepage. No production writes or deployment as part of implementation.

## Tasks

- [x] 1. Data presentation and publication boundaries. Add failing unit cases for malformed/foreign observations, sample/coverage, pending/rank, and phase/role/version mismatches. Extend existing query fields without N+1. Preserve existing normalization/tier bands. Repair publisher metadata and gate Current against reviewed official/live context.
- [x] 2. Approved layout. Convert standalone hero through existing sharp to hashed WebP; create one neutral geometric placeholder WebP, mark it visibly, keep a minimal asset ledger. Implement server sections and client workspace with real role links, local class filtering, four detail tabs and accessible modal drawer.
- [ ] 3. Verification. Extend existing Playwright coverage for all three real DB contexts, context/version isolation, SSR, class/spec detail, missing data, source attribution, modal keyboard behavior and seven viewports. Synthetic fixtures only in a dedicated local DB, clearly separated from real data acceptance. Run unit/type/lint/build and existing Home/Genshin/performance checks.
- [ ] 4. Delivery. Review diff, reconcile 44-item ledger, record limitations/metrics/screenshots, final fetch and compare main, commit only task files, open and attach PR; never merge/deploy.

## Review focus

- Historic source notes without class identity remain unmapped until publisher/profile backfill; never infer class from display names.
- A missing previous change record never becomes Stable.
- A single data source never becomes source agreement.
- Old/unverified versions remain Preliminary/Stale even with large samples.
- Approved placeholders resolve development blockage but never count as final visual assets.
