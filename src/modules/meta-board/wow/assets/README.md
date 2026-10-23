# WoW Forever asset provenance

This directory contains production-owned WoW Forever presentation assets.

## Hero

- `hero-3b7bb10711.webp`
- source: user-provided project asset `素材/wow forever/hero.png` (2172 × 724)
- transformation: encoded to WebP with the existing project image pipeline; original dimensions retained
- status: FINAL

## Class icons

Production includes 9 Class icons under `icons/classes/**`.

They were acquired from Blizzard first-party World of Warcraft icon endpoints by the repository's `scripts/process-wow-icons.mjs` pipeline and converted to WebP without inventing new class identity.

## Spec icons

Production includes 27 Spec/cohort icons under `icons/specs/**`.

The acquisition pipeline uses Blizzard first-party sources where an exact first-party specialization identity exists. Forever-specific cohort labels that do not have a distinct Blizzard specialization icon retain the explicitly reviewed mapped source behavior implemented by the pipeline.

The production renderer imports the 9 Class and 27 Spec WebP files directly. `neutral-placeholder.webp` remains only as a defensive fallback for an unmapped/invalid icon key; it is not the normal production Class/Spec artwork.

## Runtime

The mapping used by the WoW UI is implemented in:

`src/modules/meta-board/wow/spec-icon.tsx`

Do not use old V1 acceptance/evidence documents to decide whether icons are still pending. Current assets and executable mappings are the source of truth.
