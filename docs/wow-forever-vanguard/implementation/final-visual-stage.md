# Supplied visual asset integration — baseline d9b2dbc

Branch codex/vanguard-monument only. No push, PR or deployment. Frozen requirements/design, authentication/Header, database model, event rules, moderation rules, Tier List data and the five final WAVs are unchanged.

## Inventory gate

31 source entries = 28 copied unchanged + 2 reviewed references + 1 excluded macOS metadata + 0 unknown. Item-level paths, original SHA256, format, size and alpha pixel counts are in final-assets-inventory.json. Source files were never edited. All 30 visual files were inspected in a contact sheet; full-size WOW Mask overlay, Plate, Focus and both Seal templates were additionally inspected.

- Copied: WOW hero; three 1672×941 SVG masks; nine unique 1254×1254 class emblems; base/Alliance/Horde Plate and Focus panel; five 1254×1254 Inscription keyframes; four alpha FX; portrait and square Seal templates.
- Reference only: the annotated multi-panel hero concept and the explicitly named Focus reference. They are not substituted for final runtime artwork.
- Excluded: .DS_Store, positively identified macOS metadata.
- MISSING_ASSET: FOREVER hero and F/O/R1/E1/V/E2/R2 masks. The user explicitly instructed this round to skip missing assets and continue.
- AMBIGUOUS_ASSET: the inherited Scatter movement is not defined by the five supplied Inscription keyframes. The existing open-palm notice remains explicit; no final Scatter movement is invented.

Opaque black backgrounds in supplied Plate/Emblem/Seal PNGs are preserved, not converted to artificial alpha. FX PNG alpha is preserved. The WOW masks share the exact hero coordinate system; O has two even-odd contours and its hole remains empty. No duplicates among the nine emblem files by SHA256.

## Formal WOW layout

The offline generator reads actual SVG alpha, independently searches uniform grid spacing per letter, checks centers and all four footprint corners against fully opaque mask pixels, and takes a deterministic row-major distributed subset. No random number or browser generation. Compact little-endian Float32 x/y/z/rotation files contain no user records, repeated Seat strings or neighbors. Seat ID local index binds to buffer row permanently.

| Group | Generated count | Spacing in source pixels | Uniform world scale |
| --- | ---: | ---: | ---: |
| WOW W1 | 2672 | 7.70 | 0.6314 |
| WOW O | 2672 | 5.05 | 0.4141 |
| WOW W2 | 2672 | 7.55 | 0.6191 |
| WOW total | 8016 | | |
| FOREVER F/O/R1/E1/V/E2/R2 | Not generated; each target remains 8016 | Missing final masks | |
| FOREVER total | Not generated; target remains 56112 | | |
| System target | 64128; only 8016 formal coordinates available | | |

Regeneration was byte-compared against all three buffers and metadata and was identical. Unit checks verify exact count, cross-letter coordinate uniqueness, opaque mask membership, real catalog lookup and absent FOREVER failure. The final overlay was inspected against actual hero artwork. The scene applies each letter's own scale and registers the unchanged hero at the same source-pixel/world transform. Rotation remains disabled. Far view has no user texture; thumbnail limits remain device-budgeted.

Production Hold/Claim stays closed: composition only passes final layout URLs when all ten groups exist. The prior explicit test-only fixture transport is unchanged. Local test Claim is not a production opening.

## Supplied visual wiring

- SSR WOW hero, Three background and three compact groups use supplied files; sRGB decoding preserves source color. Occupancy is neutral/gold until a public detail resolves faction blue/red; resolved tint survives polling.
- Nine mappings are derived directly from existing WOW_CLASSES: Warrior, Paladin, Hunter, Rogue, Priest, Shaman, Mage, Warlock, Druid → their corresponding vanguard-class-{lowercase}.png.
- Plate/Focus preserve the final frames and image slots. Full text remains separately readable where the decorative panel uses truncation. Missing/failed approved images fall back to the matching emblem. Hidden/deleted seats stay neutral; no emblem exposes removed personal content.
- Five supplied Ritual frame images map charge/form/inscribe/lock/ignite to the existing four-second accepted-result state machine, faction FX and existing action SFX. Camera controls remain fixed-view; reduced motion does not alter business results. No transaction result depends on an image/animation load.
- Canvas Seal exports exact 1080×1920 and 1254×1254. Existing approved/default image, name, Seat ID, faction, class, guild, UTC date, story battle cry, real WOW location thumbnail/marker, public Seat QR and unofficial disclaimer occupy supplied slots. Font fitting bounds long Unicode text. No DOM screenshot, private account identifier or DB UUID is used. FOREVER Seal location stays blocked by missing FOREVER artwork/layout.
- Static asset/layout folders use immutable cache. The original audio files are neither copied nor transformed.

Necessary dependency additions only: qrcode 1.5.4 for actual QR encoding; its development types; jsqr 1.4.0 solely to decode exported images in tests. Existing dependency versions and overrides are preserved.

## Review and verification

Fresh-context review identified two P2 issues: faction tint lost on occupancy refresh and failed-image state reused by the new Focus visual. Both are covered by targeted regression checks; color state and Focus key isolation were repaired. Final current-source results:

- Unit: 96 files / 495 tests passed.
- Integration: 44 files / 299 tests passed against isolated local PostgreSQL.
- Contract: 1 file / 35 tests passed.
- Full Vanguard browser suite: 34/34 passed (4.7 minutes), including five viewports, real local Claim/DB/Reveal/My Vanguard/Report test mailbox, both Seal PNG exports, long Unicode fields, actual final scene rendering, camera/touch/reduced motion and all closed-state checks.
- Latest targeted repair run: 4/4 passed; the Focus per-Seat failure regression and faction color state regression were observed red before fixes and green afterward.
- QR contents decode correctly from the actual PNG QR regions in both formats. Whole-poster jsQR detection failed against the complex artwork; it is not claimed as a pass. Physical phone scanning remains human acceptance.
- Next local production-mode test build and vinext build passed; post-build TypeScript passed. ESLint, full Prettier, security (25 header rules in both modes) and SEO checks passed.
- Frozen documents, all five existing WAVs and all 28 copied/source files were byte-compared unchanged. No Header/Auth/database/SEO/Analytics policy changes.
- Staged secret scan passed (944 tracked files); staged diff check passed. Final formal layout regeneration, including formatted metadata, was byte-identical.

Actual local screenshots/exports were inspected: /tmp/vanguard-final-monument.png, /tmp/vanguard-final-scene.png, /tmp/vanguard-final-reveal.png, /tmp/vanguard-final-seal-{9x16,1x1}.png and long-text exports. They use supplied artwork; the real local business test uses isolated DB sessions, not a real Google/provider acceptance. Camera uses the existing fake device for automated testing.

The first full browser run had one strict-locator failure caused by the newly supplied visual panel also showing the name; the selector now identifies the exact name. A separate image regression test first exposed invalid fixture URLs, which were corrected to the existing public-media schema before proving the real per-Seat fallback failure. The first full current-art run also exposed whole-poster QR detection and a camera-init failure; QR-region validation is explicit and the camera test passed both the targeted rerun and final full suite. Scene disposal now explicitly releases its owned WebGL context. An attempted overlapping browser command was refused because the prior runner still owned its port; it was rerun only after that runner exited. These failed/refused runs are not counted as acceptance passes.

## Remaining gates

BLOCKED_ASSET: FOREVER hero; seven FOREVER masks/layout; undefined final Scatter movement. Associated FOREVER scene/location/Seat geometry and Scatter final motion remain unfinished. Other supplied asset wiring is implemented, subject to final checks and human visual review.

BLOCKED_EXTERNAL unchanged: real Google callback; R2 production CORS/lifecycle/delete/CDN purge; Clef paid-account/authorized samples/threshold calibration; Resend actual receipt. Local tests do not prove any of these.

HUMAN_REVIEW: legal approval, physical camera/touch/audio and final subjective visual/motion acceptance. No completed external or human acceptance is claimed.

Remaining non-asset implementation gap identified this round: none. Deferred work requires missing/ambiguous final assets, not a new product or architecture. Development is not declared complete while these remain.

## File coverage ledger

61 changed/added files = 61 in scope + 0 unknown; 0 tracked deletions.

| File | Evidence / purpose |
| --- | --- |
| `bun.lock` | Required QR encoder and test decoder/types only; no existing version upgrade |
| `docs/wow-forever-vanguard/implementation/final-assets-inventory.json` | Implementation inventory, stage evidence and status only; frozen docs excluded |
| `docs/wow-forever-vanguard/implementation/final-visual-stage.md` | Implementation inventory, stage evidence and status only; frozen docs excluded |
| `docs/wow-forever-vanguard/implementation/status.md` | Implementation inventory, stage evidence and status only; frozen docs excluded |
| `next.config.ts` | Immutable cache for only the supplied static asset/layout folders |
| `package.json` | Required QR encoder and test decoder/types only; no existing version upgrade |
| `public/wow-forever/vanguard/animation/vanguard-fx-alliance.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/animation/vanguard-fx-focus.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/animation/vanguard-fx-horde.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/animation/vanguard-fx-ignite.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/animation/vanguard-inscription-01-charge.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/animation/vanguard-inscription-02-form.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/animation/vanguard-inscription-03-inscribe.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/animation/vanguard-inscription-04-lock.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/animation/vanguard-inscription-05-ignite.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/emblems/vanguard-class-druid.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/emblems/vanguard-class-hunter.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/emblems/vanguard-class-mage.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/emblems/vanguard-class-paladin.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/emblems/vanguard-class-priest.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/emblems/vanguard-class-rogue.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/emblems/vanguard-class-shaman.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/emblems/vanguard-class-warlock.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/emblems/vanguard-class-warrior.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/layouts/wow-O.f32` | Deterministic formal WOW buffer / provenance and scale metadata |
| `public/wow-forever/vanguard/layouts/wow-W1.f32` | Deterministic formal WOW buffer / provenance and scale metadata |
| `public/wow-forever/vanguard/layouts/wow-W2.f32` | Deterministic formal WOW buffer / provenance and scale metadata |
| `public/wow-forever/vanguard/layouts/wow-layout.json` | Deterministic formal WOW buffer / provenance and scale metadata |
| `public/wow-forever/vanguard/masks/vanguard-mask-o-center.svg` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/masks/vanguard-mask-w-left.svg` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/masks/vanguard-mask-w-right.svg` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/monument/vanguard-hero-base-desktop.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/plates/vanguard-focus-panel.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/plates/vanguard-seat-alliance.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/plates/vanguard-seat-base.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/plates/vanguard-seat-horde.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/seal/vanguard-seal-square.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `public/wow-forever/vanguard/seal/vanguard-seal-story.png` | Reviewed supplied visual copied unchanged; original SHA256 in inventory |
| `scripts/generate-vanguard-wow-layout.ts` | Offline deterministic packing from the supplied masks |
| `src/app/(account)/account/vanguard/page.tsx` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/app/(marketing)/wow-forever/vanguard/page.tsx` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/config/vanguard-runtime.config.ts` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/config/vanguard.config.ts` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/client/canvas.tsx` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/client/claim.tsx` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/client/contracts.ts` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/client/experience.tsx` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/client/focus-visual.tsx` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/client/plate.tsx` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/client/ritual.tsx` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/client/seal.tsx` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/domain/layout.ts` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/experience/scene.ts` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/experience/seal-renderer.ts` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `src/modules/wow-vanguard/index.ts` | Vanguard visual wiring, original rendering interfaces or fail-closed partial-layout composition |
| `tests/e2e/vanguard-business.spec.ts` | Asset/layout/Seal/scene regression directly required by this integration |
| `tests/e2e/vanguard-flows.spec.ts` | Asset/layout/Seal/scene regression directly required by this integration |
| `tests/e2e/vanguard-foundation.spec.ts` | Asset/layout/Seal/scene regression directly required by this integration |
| `tests/unit/wow-vanguard/final-assets.test.ts` | Asset/layout/Seal/scene regression directly required by this integration |
| `tests/unit/wow-vanguard/scene.test.ts` | Asset/layout/Seal/scene regression directly required by this integration |
| `tests/unit/wow-vanguard/seal-text.test.ts` | Asset/layout/Seal/scene regression directly required by this integration |
