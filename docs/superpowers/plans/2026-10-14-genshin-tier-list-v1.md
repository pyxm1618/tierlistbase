# Genshin Tier List V1 Implementation Plan

**Goal:** Implement the approved `素材/原神.png` layout and fixed V1 information architecture on `/genshin-impact/tier-list`.
**Architecture:** Server-render header/context and lower editorial modules. A scoped client island owns local search/role/element filtering, alphabetic tier groups, selection and accessible mobile dialog. Reuse marketing Header/Footer without changing Meta Board or WoW.
**Tech stack:** Existing Next.js, React, CSS modules, next/image, Vitest and Playwright.
**Base:** 012aefdbc1facaec9336903d46f88af93b1c40a4.

## Constraints

No database/schema/backend/API/dependency changes. Mock rankings/rationale/changes/evidence remain explicit; version, update date and reference content are pending verification. Keep public_noindex. No screenshot-cropped image assets. Use user-supplied replacement Hero through static import for build-time hashed URLs. User approved uniform Mock avatars; use the existing branded placeholder until approved original character artwork is available. Only hero preload; avatars lazy, correctly sized, versioned. Do not reopen product design or add V1 features.

## Tasks

- [x] Add failing local filter/order tests and browser acceptance tests.
- [x] Add scoped Genshin module: replaceable mock data, interaction component, detail component and CSS; retain server page metadata and public layout.
- [x] Add server editorial modules with five methodology dimensions, three evidence classes, ten definitions and six FAQ items.
- [x] Extend existing performance suite with Genshin route and real input interaction; validate image currentSrc/naturalWidth/renderedWidth/encodedBodySize and responsiveness at 390/768/1024/1440/1920/2560; retain full screenshots at 390/1440/1920.
- [x] Run formatting, lint, typecheck, unit/contract tests, build, browser acceptance/performance and WoW regression (existing presentation suite remains failing on unchanged baseline paths; do not broaden into WoW repairs). Inspect final diff, reconcile acceptance ledger.

## Review focus

Combined filters and empty results; no initial selection; stable A–Z order independent of fixtures; mobile focus return/Escape/background inertness; responsive switch with selected character; image source fidelity and no fabricated current data.
