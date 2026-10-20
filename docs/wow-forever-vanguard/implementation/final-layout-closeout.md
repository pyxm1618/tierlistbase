# Final layout and Scatter closeout — baseline 75e5419

Branch: codex/vanguard-monument. Local continuation only; no push, PR, deployment or production database write. Frozen requirements/design, business model, auth/Header, event rules, moderation, SEO/Analytics strategy and original five WAVs are unchanged.

## Item-level coverage

Desktop source directory: /Users/milushangdi/Desktop/wow forever/. Two inventories reconcile all 44 source files: 40 copied unchanged + 3 reviewed references + 1 positively identified macOS metadata exclusion + 0 unknown. The previous inventory covers 31 files; forever-assets-inventory.json covers the new 13: 12 copied unchanged and one portrait composition reference. SHA256 of all 40 copies matches source. No source image, mask, supplied JSON or audio was edited, transcoded or synthesized.

New runtime copies: FOREVER 1774×887 opaque desktop hero under public/wow-forever/vanguard/monument; seven matching SVG masks under masks. Portrait FOREVER reference (941×1672) is reviewed but not substituted into the incompatible desktop mask coordinates. Four original FINAL layout/audit JSON files live under this implementation directory's seat-layout folder, outside public and client imports; their original formatting and bytes are preserved. Deployed geometry is only ten Float32 buffers plus two small metadata files.

## Supplied FINAL geometry

| Phase | Letter | Count | Source footprint | World scale |
| --- | --- | ---: | --- | ---: |
| WOW | W1 | 2672 | 4×4 pixels | 0.4 |
| WOW | O | 2672 | 4×4 pixels | 0.4 |
| WOW | W2 | 2672 | 4×4 pixels | 0.4 |
| FOREVER | F | 8016 | 4×4 logical pixels / 1×1 source pixel | 0.1 |
| FOREVER | O | 8016 | same | 0.1 |
| FOREVER | R1 | 8016 | same | 0.1 |
| FOREVER | E1 | 8016 | same | 0.1 |
| FOREVER | V | 8016 | same | 0.1 |
| FOREVER | E2 | 8016 | same | 0.1 |
| FOREVER | R2 | 8016 | same | 0.1 |

WOW = 8016; FOREVER = 56112; total = 64128. The supplied WOW FINAL layout replaces the previous unpublished generated coordinates. This is an explicit adoption of user-provided final positions before publication, not a migration of occupied production seats. Its W and O spacing differs in the actual supplied geometry; no uniform-density assumption or repacking is applied.

Offline converter validates exact capacities, supplied array order, mask dimensions, full 4×4 footprint alpha=255 at every pixel, and no overlapping rectangles across any letters of the same phase. FOREVER logicalScale=4 maps 7096×3548 logical coordinates into the 1774×887 hero. O/R holes remain unoccupied. All 64,128 rectangles passed; no partial coverage or overlap. Public Seat IDs bind to source row+1 within each letter. Supplied numeric IDs are import provenance only, not a second public identity.

The converter and independent test validate the same supplied source against all compact output centers; two complete regenerations reproduce all ten buffers and both metadata files byte-for-byte. The legacy WOW generator delegates to the same converter, preventing accidental restoration of the previous packing. No runtime random coordinate generation or all-player payload is added.

## Visual and movement integration

Both phases use correct hero dimensions for fixed-art-view 2.5D scene bounds and Seal location markers. Instancing, viewport/DPR/memory budgets and per-letter loads remain. Far view loads no player texture; thumbnail pixel threshold now accounts for actual seat scale, including FOREVER's smaller plates. Focus alone uses detail images.

Open palm invokes deterministic per-phase/per-letter/per-row Scatter targets; fist gathers original positions and resets the existing camera; pinch selects Focus through existing picking. Smooth interpolation changes only instance transforms and visible thumbnail positions. Original geometry, Seat IDs and occupancy remain unchanged. Reduced motion reduces travel and transition duration. Raycast bounds include both motion endpoints. Late thumbnail loads use current interpolated positions. Polling updates occupancy/nearby recommendations without moving the camera or silently gathering Scatter. No physics engine, new navigation mode, additional asset or movement-specification dependency.

Existing supplied Plate/Focus, nine original WOW_CLASSES emblems, five accepted-result Ritual frames with independent SFX, Reveal, share/report/search/My Vanguard and Canvas Seal exports are retained. Emblems map Warrior/Paladin/Hunter/Rogue/Priest/Shaman/Mage/Warlock/Druid to the corresponding lowercase filename; no duplicate roster or Blizzard icons. Seal supports portrait and square, public Seat QR and FOREVER location marker, with no private identity fields.

## Readiness and remaining gates

BLOCKED_ASSET = 0. The historical missing FOREVER/masks and incorrectly classified Scatter blocker are resolved. Runtime implementation contains no BLOCKED_ASSET / DEV PLACEHOLDER / pending final-art notices. Explicit missing-asset error handling remains valid for a genuinely broken deployment; it is not a remaining placeholder.

The existing server gate now receives all ten formal groups. Only the asset/layout prerequisite is satisfied: Stage, Hold, global account uniqueness, conflict and authoritative database cutoff remain enforced. No deployment, external-provider verification or production opening occurred.

BLOCKED_EXTERNAL: real Google production callback; R2 production CORS/lifecycle/public deletion/CDN purge; Clef real sample calibration and thresholds; Resend receipt. Local fixtures do not satisfy these gates.

HUMAN_REVIEW: final legal review; physical camera, touch and audio; phone QR scanning; subjective final artwork/motion acceptance. Automated fake-camera and fixture tests do not satisfy these gates.

Remaining asset-related code: 0. Remaining non-asset code in the authorized scope: 0. Scope outside frozen requirements: No.

## Verification

- Unit: 98 files / 498 tests passed on final scene/selection code.
- Integration: 44 files / 299 tests passed against isolated local PostgreSQL; contract: 1 file / 35 tests passed.
- Final full Vanguard E2E: 35/35 passed (4.5 minutes), including all previous local business/Seal/QR/viewport/closed-state coverage plus actual seven-group FOREVER rendering after a phase transition. Pixel-variance assertion requires actual nonblank artwork, not merely an existing canvas. Screenshot inspected: /tmp/vanguard-forever-final-scene.png.
- Independent mask tests check every complete rectangle; both regeneration passes preserve all 12 deployed layout artifacts exactly.
- ESLint and full Prettier checks passed. Security verified all 25 header rules in both modes; SEO verified existing indexable routes/canonical policy. Migration verification passed empty-to-latest and main-chain-to-latest in the isolated database, without adding a migration.
- Read-only service readiness check correctly exited nonzero because credentials are missing in this invocation; all final layouts are configured, moderation remains UNCALIBRATED_FAIL_CLOSED, external services NOT_CONTACTED, productionChanged=false. This is not real Google/R2/Clef/Resend acceptance.

The strengthened FOREVER rendering check initially failed, exposing reuse of a released WebGL context on the same canvas during phase change (WebGL precision initialization error). Phase-keyed canvases repair the actual rendering boundary while retaining context disposal; final full E2E passes and screenshot contains the real supplied artwork. The earlier canvas-presence-only pass is not visual acceptance. Review also found manifest polling silently gathering Scatter; camera selection effects are now separate from occupancy/nearby updates. Explicit selection can focus the same Seat again, and Continue exploring clears Scatter state. Historical final-visual-stage.md retains prior evidence and is superseded only for present asset/readiness status.

Next optimized test build (used by the final E2E server), vinext build, route type generation and final TypeScript check passed. No dependency, toolchain, build configuration or migration change was needed.

## Final change-scope ledger

42 changed/new files = PASS 42 + DEFERRED 0 + REJECTED 0 + UNKNOWN 0. No item is deleted by exclusion. No frozen document, audio, account/auth/Header, business DB, event policy, unrelated dependency or non-Vanguard module changes.

| File | State | Item-level purpose / evidence |
| --- | --- | --- |
| `docs/wow-forever-vanguard/implementation/final-layout-closeout.md` | PASS | Item-level inventory, historical correction or current implementation evidence |
| `docs/wow-forever-vanguard/implementation/final-visual-stage.md` | PASS | Item-level inventory, historical correction or current implementation evidence |
| `docs/wow-forever-vanguard/implementation/forever-assets-inventory.json` | PASS | Item-level inventory, historical correction or current implementation evidence |
| `docs/wow-forever-vanguard/implementation/seat-layout/vanguard-forever-seat-layout-56112.json` | PASS | Original supplied FINAL/audit input; unchanged SHA256 in inventory |
| `docs/wow-forever-vanguard/implementation/seat-layout/vanguard-monument-seat-layout-64128.json` | PASS | Original supplied FINAL/audit input; unchanged SHA256 in inventory |
| `docs/wow-forever-vanguard/implementation/seat-layout/vanguard-seat-layout-8016-final-audit.json` | PASS | Original supplied FINAL/audit input; unchanged SHA256 in inventory |
| `docs/wow-forever-vanguard/implementation/seat-layout/vanguard-seat-layout-8016-final.json` | PASS | Original supplied FINAL/audit input; unchanged SHA256 in inventory |
| `docs/wow-forever-vanguard/implementation/status.md` | PASS | Item-level inventory, historical correction or current implementation evidence |
| `public/wow-forever/vanguard/layouts/forever-E1.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/forever-E2.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/forever-F.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/forever-O.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/forever-R1.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/forever-R2.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/forever-V.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/forever-layout.json` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/wow-O.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/wow-W1.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/wow-W2.f32` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/layouts/wow-layout.json` | PASS | Validated exact-count final compact geometry/provenance; WOW replaces unpublished generated coordinates |
| `public/wow-forever/vanguard/masks/vanguard-mask-e1.svg` | PASS | Supplied final visual copied unchanged; SHA256 in inventory |
| `public/wow-forever/vanguard/masks/vanguard-mask-e2.svg` | PASS | Supplied final visual copied unchanged; SHA256 in inventory |
| `public/wow-forever/vanguard/masks/vanguard-mask-f.svg` | PASS | Supplied final visual copied unchanged; SHA256 in inventory |
| `public/wow-forever/vanguard/masks/vanguard-mask-o-forever.svg` | PASS | Supplied final visual copied unchanged; SHA256 in inventory |
| `public/wow-forever/vanguard/masks/vanguard-mask-r1.svg` | PASS | Supplied final visual copied unchanged; SHA256 in inventory |
| `public/wow-forever/vanguard/masks/vanguard-mask-r2.svg` | PASS | Supplied final visual copied unchanged; SHA256 in inventory |
| `public/wow-forever/vanguard/masks/vanguard-mask-v.svg` | PASS | Supplied final visual copied unchanged; SHA256 in inventory |
| `public/wow-forever/vanguard/monument/vanguard-forever-hero-base-desktop.png` | PASS | Supplied final visual copied unchanged; SHA256 in inventory |
| `scripts/check-vanguard-services.ts` | PASS | Readiness reports all ten layouts, without claiming provider acceptance |
| `scripts/generate-vanguard-layouts.ts` | PASS | Offline full-rectangle validation and deterministic compact conversion |
| `scripts/generate-vanguard-wow-layout.ts` | PASS | Delegates legacy command to supplied FINAL conversion |
| `src/config/vanguard.config.ts` | PASS | Connects final FOREVER hero, ten groups and supplied scales |
| `src/modules/wow-vanguard/client/canvas.tsx` | PASS | Phase-keyed canvas lifecycle; Scatter controller; polling preserves motion |
| `src/modules/wow-vanguard/client/experience.tsx` | PASS | Gesture Scatter state and Focus/Gather transitions replace incorrect asset notice |
| `src/modules/wow-vanguard/experience/scene.ts` | PASS | Deterministic Scatter, reduced motion, phase dimensions and scale-aware thumbnails |
| `src/modules/wow-vanguard/experience/seal-renderer.ts` | PASS | Normalizes location marker using the actual phase dimensions |
| `src/modules/wow-vanguard/index.ts` | PASS | Exposes actual Scatter geometry operations to boundary-compliant regression tests |
| `tests/e2e/vanguard-flows.spec.ts` | PASS | Direct final-asset/layout/Scatter/readiness/rendering regression |
| `tests/unit/wow-vanguard/final-assets.test.ts` | PASS | Direct final-asset/layout/Scatter/readiness/rendering regression |
| `tests/unit/wow-vanguard/production-claim.test.ts` | PASS | Direct final-asset/layout/Scatter/readiness/rendering regression |
| `tests/unit/wow-vanguard/scatter.test.ts` | PASS | Direct final-asset/layout/Scatter/readiness/rendering regression |
| `tests/unit/wow-vanguard/supplied-layout.test.ts` | PASS | Direct final-asset/layout/Scatter/readiness/rendering regression |

Final staged secret scan passed: 969 tracked files (732 text / 237 binary). Staged diff whitespace check passed. All 40 copied-source hashes, the two frozen documents and five original WAVs were rechecked unchanged immediately before commit. The 42-file scope remains reconciled with zero unknown or unrelated files.
