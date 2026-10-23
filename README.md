# TierListBase

TierListBase is a public game-meta and tier-list product. The repository is the production application, not a reusable starter template.

Production: https://www.tierlistbase.com

## Current product

Indexable public surfaces currently include:

- `/`
- `/wow-forever/tier-list`
- `/genshin-impact/tier-list`
- `/wow-forever/vanguard`
- `/about`

Additional game modules currently exposed as public noindex surfaces include Zenless Zone Zero, NIKKE and Limbus Company.

Vanguard is part of TierListBase, uses the existing account system, and uses Google OAuth in production. Production password and Magic Link login are disabled. Commerce, subscriptions and credits are not enabled for the current product.

## Stack

- Bun 1.3.14
- Next.js 16.4.1
- React 19.2.9
- TypeScript
- PostgreSQL / Neon
- Drizzle ORM
- Better Auth
- Vinext 1.1.0
- Vite 8.3.3
- Cloudflare Workers / R2 / Workers AI
- Wrangler 4.149.0

Production deployment is GitHub Actions -> Vinext build -> Cloudflare. `main` is the production source branch. The deploy job refuses to deploy a stale workflow SHA when it is no longer current `main`.

## Repository structure

- `src/config/**` — product configuration and current product facts.
- `src/modules/**` — product modules.
- `src/platform/**` — shared platform capabilities.
- `src/components/**` — shared renderers/components.
- `data/editorial/**` — reviewed editorial data packages.
- `drizzle/**` — generated database migrations.
- `tests/**` — unit, integration, browser, contract and performance coverage.
- `docs/**` — current product, technical and operational documentation only.

Product modules must be consumed through their public module entry points. Platform code must not depend on product modules. These boundaries are enforced by lint/tests.

## Local development

```bash
bun install --frozen-lockfile
bun run dev
```

Common checks:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test:unit
bun run test:integration
bun run build
bun run test:e2e
```

Database integration tests require a disposable `TEST_DATABASE_URL`. They reset test schemas; never point them at production.

## Production build and deployment

Normal Next.js production build:

```bash
bun run build
```

Cloudflare/Vinext verification:

```bash
bun run build:vinext
```

Production deployment is owned by `.github/workflows/ci.yml` and runs only from a push to current `main`. Do not manually recreate a Vercel deployment path; this repository no longer uses Vercel as its production deployment model.

## Current documentation

The repository deliberately keeps only documentation that remains operationally or product-relevant:

- `docs/product-direction.md` — product direction and long-term product rules.
- `docs/wow-forever-publication.md` — WoW Forever ranking-data publication runbook.
- `docs/wow-forever-vanguard/requirements.md` — Vanguard product SSOT.
- `docs/wow-forever-vanguard/technical-design.md` — Vanguard current technical design.
- `docs/运维/故障处理.md` — production operations, rollback, recovery and credential rotation.

Data- or asset-local README files remain beside the data/assets they describe.

Historical PR acceptance reports, implementation ledgers, screenshots, temporary performance evidence and completed development plans are intentionally not retained in the working tree. Git history is the historical record.

## Important source-of-truth files

- Site identity: `src/config/site.config.ts`
- Routes / SEO intent: `src/config/routes.config.ts`
- Production feature flags: `src/config/features.config.ts`
- Legal/current provider facts: `src/config/legal.config.ts`
- Vanguard product/runtime assets: `src/config/vanguard.config.ts`
- Vanguard production service composition: `src/config/vanguard-runtime.config.ts`
- Cloudflare runtime: `wrangler.jsonc`
- CI and production deploy: `.github/workflows/ci.yml`

When documentation conflicts with executable configuration or current code, stop and reconcile the documentation before treating the older prose as authoritative.
