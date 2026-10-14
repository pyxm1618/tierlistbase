# Genshin V1 final visual closeout

Baseline: PR #21 at `c1e9808ff0f662918a3d2395f5eefc7f983fafb8` (all four CI jobs passed). This pass only adjusts Genshin CSS and the existing avatar `sizes` declaration. Product scope, data, content, interactions and image sources are unchanged.

## Target ledger

Five pre-existing replacement targets = five explicitly approved + zero deferred + zero rejected + zero unknown, before and after execution. Item-level authorization is the user's final visual-closeout request; originals remain recoverable from the baseline commit.

| Target | Decision | Evidence |
|---|---|---|
| Genshin CSS | Approved / applied | Requested proportion, size, spacing, hierarchy and readability changes only. |
| Avatar sizes | Approved / applied | Existing 256px Mock asset displayed at up to 96 CSS px; sizes updated to 96px, lazy loading preserved. |
| 1440px screenshot | Approved / replaced | New actual production-build full-page capture. |
| 1920px screenshot | Approved / replaced | New actual production-build full-page capture. |
| 390px screenshot | Approved / replaced | New actual production-build full-page capture. |

## Measured changes

| Viewport | Board width | First card width × height | Name font | Empty detail height | Hero height |
|---|---|---|---|---|---|
| 1440 | 840 → 929px | 101 × 89 → 112 × 131px | 10 → 13px | 402 → 352px | 213 → 214px (rounding) |
| 1920 | 1087 → 1204px | 143 × 97 → 154 × 139px | 12 → 14px | 492 → 382px | 196 → 195px |
| 390 | 366px unchanged | 93 × 103 → 126 × 161px | 10 → 13px | Mobile dialog unchanged | 345px unchanged |

Desktop uses a 2:1 board/detail split, six cards per row at 1440/1920 and the same bounded 1820px shell. Larger tier letters have reserved width so A+ and B+ do not overlap their explanations. Context values are 14px on desktop; cards have stronger borders and 8px gaps. Hero keeps the supplied image and its compact height.

Mobile uses two card columns, an 88px tier label, visible readable tier explanations, 13px character names, and separate 12px Element/Role lines. Filter targets are 40px high and retain local Search/Role/Element behavior. Longer page height is intentional to preserve readability.

Empty detail is shorter and the changes panel uses natural content height. Bottom information uses natural heights, softer borders/backgrounds and remains visually secondary to the enlarged board. All four modules and their exact content remain intact. Mock Notice remains present with subdued contrast. Why this Tier retains its existing primary emphasis.

Full-page PNGs: `docs/genshin-v1-evidence/genshin-1440.png`, `genshin-1920.png`, `genshin-390.png`. Raw before/after browser geometry: `visual-closeout-geometry.json`. Actual capture options: fullPage=true, scale=css, DPR=1, loaded fonts/images, unselected board. Source/brand/Mock images are unchanged; no screenshot-derived image assets.

## Validation

- Production build, formatting, lint, typecheck: pass.
- Unit: 312 pass; contract: 35 pass.
- Genshin browser acceptance: 8 pass, including all six responsive widths, filters, detail, native mobile dialog and axe checks.
- Existing performance/navigation suite: 18 pass. Updated-head CI evidence is attached to PR #21; final handoff waits for all four jobs to complete.
- Scoped diff confirms no changes to page IA, character fixtures, selection/filter logic, editorial content, public navigation, WoW/Forever Logs, backend, API, schema or dependencies. No new feature or component system.
- PR remains Draft and unmerged. No deployment or database operations in this pass. Previously recorded out-of-scope WoW presentation problems are unchanged and not reopened.
