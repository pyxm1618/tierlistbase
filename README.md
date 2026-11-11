# TierListBase

TierListBase is a production game tier-list platform for comparing rankings across games with clear version context, evidence, methodology, and freshness information.

**Live website:** https://www.tierlistbase.com

## What TierListBase does

- Publishes game tier lists for characters, classes, units, weapons, cards, and other game-specific ranking objects.
- Separates current rankings from archived or versioned snapshots.
- Adds evidence, methodology, source context, and freshness information so rankings can be checked rather than treated as unexplained scores.
- Expands by game only when the ranking target and search intent are distinct enough to support a useful standalone page.

## Current tier lists

The current route registry marks the following game tier-list pages as public and indexable.

### Active

- Zenless Zone Zero — `/zenless-zone-zero/tier-list`
- NIKKE — `/nikke/tier-list`
- Limbus Company — `/limbus-company/tier-list`
- Phantom Blade Zero — `/phantom-blade-zero/tier-list`
- Dragon Traveler — `/dragon-traveler/tier-list`
- Wild Rift — `/wild-rift/tier-list`
- Anime Expeditions — `/anime-expeditions/tier-list`
- Slay the Spire 2 — `/slay-the-spire-2/tier-list`

### Archived / versioned snapshots

- World of Warcraft — `/wow-forever/tier-list`
- Genshin Impact — `/genshin-impact/tier-list`

The homepage (`/`) and About page (`/about`) are also public and indexable.

The former WoW Forever Vanguard public route has been retired. `/wow-forever/vanguard` now returns `410 Gone` with `noindex, nofollow`.

## Current product state

- Production account infrastructure uses Google OAuth.
- Production password and Magic Link login are disabled.
- Commerce, subscriptions, and credits are disabled.
- Production deployment is GitHub Actions -> Vinext build -> Cloudflare.
- `main` is the production source branch, and the deploy job rejects a stale workflow SHA when it is no longer current `main`.

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
- Cloudflare Workers
- Wrangler 4.149.0

## Repository structure

- `src/config/**` — product configuration and current product facts.
- `src/modules/**` — product modules.
- `src/platform/**` — shared platform capabilities.
- `src/components/**` — shared renderers and components.
- `data/editorial/**` — reviewed editorial data packages.
- `drizzle/**` — generated database migrations.
- `tests/**` — unit, integration, browser, contract, E2E, and performance coverage.
- `docs/**` — current product, evidence, technical, and operational documentation.

Product modules must be consumed through their public module entry points. Platform code must not depend on product modules. These boundaries are enforced by lint and tests.

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
bun run test:contract
bun run build
bun run test:e2e
```

Database integration tests require a disposable `TEST_DATABASE_URL`. They reset test schemas; never point them at production.

## Production build and deployment

Normal Next.js production build:

```bash
bun run build
```

Cloudflare / Vinext production-build verification:

```bash
bun run build:vinext
```

Production deployment is owned by `.github/workflows/ci.yml` and runs only from a push to current `main`.

## Current documentation

The repository keeps documentation that remains operationally, evidentially, or product-relevant.

- `docs/product-direction.md` — long-term product direction and ranking principles.
- `docs/wow-forever-publication.md` — WoW Forever ranking-data publication runbook.
- `docs/anime-expeditions/**` — current freshness and source evidence for Anime Expeditions.
- `docs/wild-rift/**` — current reviewed source, placement, change, and freshness evidence for Wild Rift.
- `docs/运维/故障处理.md` — incidents, rollback, and database recovery.
- `docs/运维/上线检查清单.md` — current production release checklist.
- `docs/运维/密钥轮换.md` — current credential-rotation procedures.
- `docs/运维/交易与积分.md` — dormant commerce / credits safety boundary; production remains disabled.
- `docs/参考/扩展与升级.md` — rules for changing dormant platform capabilities.
- `docs/参考/waffo-合约与验收.md` — CI-enforced Waffo contract safety gate, relevant only if commerce is activated.

The retained `docs/wow-forever-vanguard/**` material documents the retired Vanguard subsystem and is not a statement that the former public Vanguard route remains active.

Data- or asset-local README files remain beside the data or assets they describe. Some operational and contract documents are retained because current verification scripts read them directly.

Historical PR acceptance reports, temporary evidence, completed implementation plans, and superseded product states belong in Git history rather than being treated as current product truth.

## Important sources of truth

- Site identity: `src/config/site.config.ts`
- Game registry and active / archived status: `src/config/games.config.ts`
- Routes and SEO intent: `src/config/routes.config.ts`
- Production feature flags: `src/config/features.config.ts`
- Legal and provider facts: `src/config/legal.config.ts`
- Cloudflare runtime: `wrangler.jsonc`
- CI and production deployment: `.github/workflows/ci.yml`

Executable configuration and current code control the live product state. Product-direction prose describes longer-term intent and must not override current route, feature, or runtime configuration.

## Security

Security reporting and current production security guidance are documented in [`SECURITY.md`](SECURITY.md).

Do not open a public issue containing exploit details, credentials, private user data, or production payloads.

## License

This repository does not currently grant an open-source license for the TierListBase application source code, first-party ranking data, or first-party project assets.

Third-party components, game-related materials, and external assets remain subject to their respective licenses, terms, and notices.
