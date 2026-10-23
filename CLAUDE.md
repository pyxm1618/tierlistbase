# CLAUDE.md

Guidance for coding agents working in TierListBase.

## Repository identity

This repository is the production TierListBase application. It is not the old `creat-web` neutral starter and should not be treated as a template repository.

Current production facts:

- canonical origin: `https://www.tierlistbase.com`
- production branch: `main`
- production deployment: GitHub Actions -> Vinext -> Cloudflare
- database: PostgreSQL / Neon
- production account login: Google OAuth
- production Magic Link/password: disabled
- commerce/subscriptions/credits: disabled
- Vanguard media: Cloudflare R2 + Workers AI

Use executable config as the primary current-state source: `src/config/**`, `wrangler.jsonc`, and `.github/workflows/ci.yml`.

## Toolchain

Pinned runtime/dependencies include:

- Bun 1.3.14
- Next.js 16.4.1
- React 19.2.9
- Better Auth 1.6.25
- Vinext 1.1.0
- Wrangler 4.149.0

Install with:

```bash
bun install --frozen-lockfile
```

## Common commands

```bash
bun run dev
bun run format:check
bun run lint
bun run typecheck
bun run test:unit
bun run test:integration
bun run test:contract
bun run db:verify
bun run verify:security
bun run verify:seo
bun run verify:i18n
bun run build
bun run build:vinext
bun run test:e2e
bun run verify:performance
```

Integration tests require a disposable `TEST_DATABASE_URL` and can reset schemas. Never use production credentials.

## Architecture boundaries

### Product configuration

`src/config/**` contains product-owned composition and current product facts. Do not copy old starter defaults into current configuration.

### Product modules

Product functionality lives under `src/modules/<module>/**`.

External consumers must use the module's public entry point. Deep/cross-module internal imports are restricted by architecture lint/tests.

### Platform

`src/platform/**` is shared platform infrastructure. Platform code must not import product modules.

### Database

Migrations live in `drizzle/**` and are generated with:

```bash
bun run db:generate
```

Do not hand-write a migration and present it as generated output. Production does not use schema push.

Run:

```bash
bun run db:verify
```

before accepting migration-chain changes.

## Current product surfaces

The current route registry includes indexable TierListBase, WoW Forever, Genshin Impact, Vanguard and About surfaces. ZZZ, NIKKE and Limbus Company game pages currently exist as public noindex routes.

Do not infer current route/indexability state from deleted V1 plans; read `src/config/routes.config.ts`.

## Vanguard

Authoritative product rules:

- `docs/wow-forever-vanguard/requirements.md`

Authoritative current technical design:

- `docs/wow-forever-vanguard/technical-design.md`

Important implementation facts:

- Google-only production auth.
- one completed Vanguard Seat per account.
- fixed final event close: `2026-11-04T23:00:00Z`.
- total capacity: 64,128 Seats.
- R2 private pending storage is separate from public approved derivatives.
- Workers AI moderation is fail closed.
- Vanguard does not use Camera, MediaPipe or Gesture Control.
- core controls are mouse, touch and keyboard.
- final layout generation uses the two FINAL source JSON files under `docs/wow-forever-vanguard/implementation/seat-layout/`.
- R2 CORS/lifecycle source config remains under `docs/wow-forever-vanguard/implementation/r2/`.

Do not resurrect deleted implementation ledgers or old Camera/MediaPipe plans.

## WoW ranking publication

Use `docs/wow-forever-publication.md`.

The publication script is `scripts/update-wow-forever-data.ts`. Dry-run is the default. Production writes require explicit authorization and a reviewed current context. Do not bypass freshness, taxonomy, phase or completeness checks.

## Deployment

`.github/workflows/ci.yml` owns the production deploy. It builds with `bun run build:vinext` and deploys through Cloudflare credentials only on a push to `main`.

The deploy job verifies that the workflow SHA is still the current `main` before deploying.

Do not add or restore a Vercel deployment workflow unless the product deployment architecture is intentionally changed in a separate scoped task.

## Documentation policy

Keep docs current and minimal.

A document belongs in the working tree only if it is one of:

- current product/technical SSOT;
- an active operational runbook;
- machine-readable configuration/source data still used by scripts/tests;
- data/asset provenance beside the owned data/assets.

Do not add completed-plan documents, PR acceptance reports, progress ledgers, closeout reports, screenshots, one-off benchmark evidence or duplicate historical inventories. Git history and CI are the history/evidence system.

When a task finishes, update the relevant current SSOT if the current facts changed; do not create a new closeout document by default.


## CI-enforced documentation inputs

Some Markdown files are executable release-gate inputs, not optional historical notes.

Current code directly reads:

- `CHANGELOG.md`
- `docs/建站手册.md`
- `docs/运维/故障处理.md`
- `docs/运维/密钥轮换.md`
- `docs/运维/交易与积分.md`
- `docs/运维/上线检查清单.md`
- `docs/参考/扩展与升级.md`
- `docs/参考/waffo-合约与验收.md`

`scripts/verify-commerce.ts` also validates required Waffo contract language. Do not delete or casually rename these files in a docs-only task. Removing one requires an explicit, separately reviewed change to the verification code.
