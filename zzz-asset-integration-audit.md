# ZZZ audited production asset integration

## Base and scope

- Base SHA: `5ecc42ea89cadf514dcac64ecfb5675a41fac095`, fetched from origin/main before implementation and refreshed before PR.
- Branch: `codex/zzz-production-assets`.
- Fresh managed worktree had HEAD == origin/main and a clean working tree before branching. The earlier sourcing worktree was preserved unchanged.
- Frozen truth: `zzz-asset-manifest.json`, `zzz-asset-audit.md` and the original verified images from `/Users/milushangdi/.codex/worktrees/zzz-asset-sourcing/tier list`. Source manifest and audit were copied byte-for-byte, retaining their historical sourcing base SHA.
- No external asset search, download, transformation, dependency change or build/deployment configuration change.

## Bounded plan and completion ledger

- [x] Verify all 170 source image hashes; reconcile latest-main data; copy only the 136 absent originals. Existing 34 files preserved.
- [x] Synchronize only the already-approved Velina bestAlternative correction missing from main.
- [x] Add data-derived mapping/hash tests; observe failures before implementation; expand existing icons.ts with explicit maps and the single approved alias.
- [x] Integrate images in existing containers via next/image; preserve MissingArtwork, names, tabs, layout, Bangboo splitting and SEO.
- [x] Run lint, typecheck, full units, build, ZZZ E2E and actual 390px/1440px visual inspection.
- [x] Obtain independent read-only review, resolve its coverage/scope findings, and inspect the final bounded diff.

| P0 category | Required | Approved source | Integrated | Missing | Unreviewed |
|---|---:|---:|---:|---:|---:|
| Released Agent portraits | 61 | 61 | 61 | 0 | 0 |
| Actually used Bangboo | 14 | 14 | 14 | 0 | 0 |
| Unique W-Engines | 77 | 77 | 77 | 0 | 0 |
| Current Team visuals | 9 | 9 | 9 | 0 | 0 |
| Total | 161 | 161 | 161 | 0 | 0 |

- Initial states: 161 approved source items, 161 pending integration, 0 rejected/delete, 0 unreviewed source.
- Final P0 states: 161 approved/integrated, 0 deferred, 0 rejected/deleted, 0 unreviewed. Total reconciles to 161.
- P1 detail art: ten explicit manifest IDs integrated; 51 deferred optional. Nine share Team visual files; no guessed bulk reuse.
- Supplemental Upcoming Severian: no approved portrait added, existing MissingArtwork retained; outside the 61 released-Agent gate.
- Three legacy Team files remain unchanged and unmapped. Four existing unused Bangboo remain preserved. No image was deleted, overwritten, renamed or recompressed.

## Implementation and safety

- Stable Agent IDs map all released portraits; existing display-name/officialName lookup remains unchanged, including Rina, Harumasa and Miyabi.
- Canonical Bangboo names map all 14 current requirements through the existing BangbooIcons helper and slash splitting.
- All 183 W-Engine field references resolve to 77 unique images. Only `Gilded Blossom (P5 baseline)` explicitly aliases `Gilded Blossom`; unknown names retain fallback. No fuzzy normalization.
- Nine current Team IDs map to approved core-Agent/faction visuals. They are not described as official Team Banners. Images use contain/right-center in existing containers; no card or CSS redesign.
- W-Engine images reuse the existing 35px item styles and contain behavior; no new image service/component framework.
- Data: 61 Agents, 9 Teams, 3 Pull Advice. Exact source-text difference from latest-main data is one `velina-airgid.bestAlternative` replacement: Wuthering Salon → Bellicose Blaze. No W-Engine recommendation field retains Wuthering Salon; all other business data unchanged.
- CSS module, routes.config.ts and ZZZ SEO page are byte-identical to base. Title and H1 unchanged; public_noindex and sitemap exclusion unchanged; no SEO release.

## Verification

| Check | Result |
|---|---|
| ZZZ targeted units | 12/12 passed (6 existing data + 6 new asset checks) |
| Full unit suite | 691/691 passed across 109 files |
| `bun run lint` | Pass: 0 errors; 2 pre-existing unrelated Vanguard warnings |
| `bun run typecheck` | Pass |
| `bun run build` with local test environment | Pass: compiled, TypeScript, page generation and trace collection completed |
| Repository enabled-profile `build:test` | Pass; used for the browser server |
| Existing + new ZZZ E2E | 8/8 passed using project Playwright Chromium |
| `git diff --check` | Pass |
| Image integrity | 170/170 source hashes/bytes match; 34 existing + 136 new; no duplicate filename/hash |

The first bare build lacked required APP_ENV/APP_ORIGIN/DATABASE_URL values and failed environment validation after compilation. It was rerun successfully with explicit local test values, without loading production credentials or changing environment requirements. No database/API operation was performed. There is no `test` script; the actual repository unit script is `test:unit`.

The new browser coverage iterates all 61 released Agent details and waits for portrait and all three W-Engine images to load, then visits all nine Teams and waits for their visual, Bangboo and composition portraits to load. It asserts no P0 MissingArtwork and preserves the 51 optional hero fallbacks plus Upcoming Severian. Existing SEO title/H1/noindex/sitemap and copy-density tests also pass.

## Visual regression

| Viewport | Overflow | Portraits | W-Engines | Bangboo | Team visuals |
|---|---|---|---|---|---|
| 390px | document width 390px | Pass | Pass, existing 35px containers | Pass | Pass, contained original art |
| 1440px | document width 1440px | Pass | Pass, existing 35px containers | Pass | Pass, contained original art |

Actual viewport and detail screenshots were inspected under:
`/Users/milushangdi/.codex/visualizations/2026/10/26/01a17615-4c3a-7a62-8ec3-fecffc8cd9d5/zzz-assets/`.
The existing mobile stylesheet hides detail hero art; that behavior is unchanged. Sticky-header overlap in tall element captures is existing page behavior, not an asset crop. Full viewport captures and loaded-image/container assertions were also checked.

## Independent review and rulings

- Independent reviewer confirmed exact mappings, hashes, the single-field business-data exception, preserved containers, and no CSS/SEO scope drift.
- P2 coverage finding fixed: exhaustive browser loops now wait for successful image delivery rather than merely counting image elements. Final 8/8 browser suite passed.
- P3 unrelated ignore change regraded Important due to the strict scope: browse had auto-added `.gstack/` to .gitignore. Restored the file exactly and preserved the one generated startup error log in /tmp, removing only that generated checkout metadata. No ignore change remains.
- Tool ruling: browse's pinned Chromium was unavailable. Used the already-installed project Playwright runtime for browser verification and screenshots; no browser/dependency installation. The alternative would have added unnecessary tooling.
- Test ruling: default desktop auxiliary panels are closed through their existing buttons before Agent-card interactions; Upcoming is selected from its actual Current Pull Advice card. Product UI behavior was not changed to accommodate test assumptions.
- No unresolved Important/Critical findings; no deferred minor findings. No merge/deployment performed.

## Final integration gate

PASS. P0 161/161 integrated; P0 missing 0. P1 deferred 51 and Upcoming fallback are explicitly permitted by the task.

No ZZZ ranking re-research, business-data redesign, SEO release, indexability change, sitemap change, UI redesign, unrelated game change, or new asset sourcing was performed. Only previously audited ZZZ production assets were integrated, including the explicitly authorized synchronization of Velina's frozen one-field correction.
