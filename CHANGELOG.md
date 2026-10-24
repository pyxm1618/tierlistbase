# TierListBase change log

This file is retained because the current production release gate requires a repository change-control artifact. Git commits and pull requests remain the complete historical record; this file records only material current product/platform transitions.

## Current production baseline — 2026-10-23

- TierListBase is a production multi-game tier/meta application rather than the inherited neutral starter.
- Production deploys from current `main` through GitHub Actions -> Vinext -> Cloudflare.
- WoW Forever and Genshin Impact are indexable game surfaces.
- ZZZ, NIKKE and Limbus Company modules exist as public noindex surfaces.
- WoW Forever Vanguard is integrated into the main product.
- Production Vanguard/account login uses Google OAuth; password and Magic Link are disabled.
- Production commerce, subscriptions and credits are disabled.
- Vanguard media uses private/public Cloudflare R2 boundaries and Workers AI moderation.
- Repository documentation was reduced to current SSOT, active runbooks, CI-enforced safety contracts and machine-readable source/config files.

Future entries should be added only for material production architecture, security, data-model, provider or product-state changes. Do not recreate per-PR closeout history here.
