# Genshin Impact V1 data persistence handoff

Date: 2026-10-14 (Asia/Shanghai).

## Baseline and scope

- Base SHA: `012aefdbc1facaec9336903d46f88af93b1c40a4` (latest fetched `origin/main` at start).
- Branch: `feat/genshin-v1-data-persistence`.
- Initial tracked working tree: clean. Existing untracked audit files and assets were preserved and excluded from this change.
- Delivery scope: Schema + Reviewed Data Package + Import + Validation.
- Database execution target: **local `localhost/tierlistbase`**, from the existing `.env` configuration. Production database import, application deployment, UI integration and merge were not performed.

## Schema changes

| Table | Change |
| --- | --- |
| `entity_profiles` | New `entity_id` PK/FK to `entities.id` (one-to-one); required JSONB `metadata` for game-specific official facts. |
| `ratings` | Nullable `primary_role`, `best_use_context`, `ranking_assumption`, `evidence_summary`; required `editorial_status`, default `draft`, CHECK allowing `draft/reviewed/published`. |
| `ratings` | Relax `published_at` NOT NULL so reviewed data can remain unpublished. Preserve its existing default for existing publishers. |
| `evidence_observations` | New stable `id` PK; required FKs `entity_id`, `source_id`, `game_version_id`; optional FK `ranking_context_id`. Fields: `observation_type`, nullable `metric_key`, `numeric_value`, `text_value`, `unit`, `sample_size`; required `source_url`, `checked_at`, `status`; nullable `observed_at`, `notes`. CHECK requires an observation value and nonnegative known sample size. |

No game-specific columns were added to public entities. The importer verifies profiles are actual JSONB objects, including when the driver returns JSON text. Primary Role remains a version/context editorial field; the old required `entities.role` uses `unclassified` for this package.

## Migration and compatibility

Generated through `bun run db:generate --name reviewed_editorial_persistence`:

- `drizzle/0017_reviewed_editorial_persistence.sql`
- `drizzle/meta/0017_snapshot.json`
- `drizzle/meta/_journal.json`

The migration adds tables/columns/checks and relaxes one nullability requirement. It contains no data deletion, table drop, rating rewrite or destructive reset. Migration metadata and empty/main-chain upgrade verification passed in a dedicated disposable test database. The normal `bun run db:migrate` applied it to the configured local database; migration journal count advanced from 17 to 18.

A recovery dump was created **before migration/import** at `/tmp/tierlistbase-genshin-20261014/before-import.dump`, outside Git. A before/after comparison preserved every original field of all three pre-existing core rows (one WoW game, its version, and one source). The local database had no pre-existing WoW entities/ratings; preservation of populated unrelated entities is additionally exercised by the integration fixture. Existing reset-based project tests ran exclusively against newly created dedicated test databases, never against `tierlistbase`.

## Reviewed package and coverage

Location: `data/editorial/genshin-impact/7.1/`.

Files: `character-master.json`, `ratings.json`, `sources.json`, `evidence.json`, `manifest.json`; plus provenance `checksums.json` and operating/mapping notes in `README.md`.

All five inputs match the supplied Desktop `*.final.json` files byte-for-byte. SHA-256 hashes were independently checked. No research, roster reconstruction, tier recalculation or mock supplementation was performed.

| Input | Approved/pass | Deferred | Rejected | Unreviewed | Original total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Entities | 121 | 0 | 0 | 0 | 121 |
| Ratings | 121 | 0 | 0 | 0 | 121 |
| Sources | 7 | 0 | 0 | 0 | 7 |
| Evidence | 130 | 0 | 0 | 0 | 130 |
| Total | 379 | 0 | 0 | 0 | 379 |

Input preflight: duplicate character slugs 0; missing names/required official fields 0; duplicate entity ratings 0; missing tier/primaryRole/whyThisTier 0; unknown entity/source references 0; duplicate evidence identities 0; invalid date/percentage values 0.

Traveler is one entity. Manekin/Manekina are absent. Vesna A+, Vodyanitsa S. All ratings are reviewed; Pending Evaluation 0. Version 7.1 release date 2026-09-23 comes from the explicit approved task instruction. Only the `endgame-overall` ranking context is created.

## Actual import and read-back

Successful first import, committed to local `tierlistbase`:

| Table | Inserted |
| --- | ---: |
| games | 1 |
| game_versions | 1 |
| ranking_contexts | 1 |
| entities | 121 |
| entity_profiles | 121 |
| sources | 7 |
| ratings | 121 |
| evidence_observations | 130 |

Second import: **0 inserts across every table**. Later repeat after the review fix also inserted 0. Imports perform no UPDATE/DELETE: they resolve stable/natural identities, reject ambiguous/conflicting data and roll back as a unit. Existing versions and unrelated games are retained. No `rating_changes` or `source_ratings` are created.

Independent, post-commit database read-back:

```text
Genshin standard entities: 121
Genshin JSONB object profiles: 121
Genshin reviewed ratings: 121
Approved sources resolved/read: 7
Genshin evidence observations: 130
Current version: 7.1
Release date: 2026-09-23
Ranking context: endgame-overall
Duplicate count: 0
Missing / cross-game relation count: 0
Persisted input field comparison: PASS
Reviewed ratings with publication timestamp: 0
Genshin rating_changes: 0
Genshin source_ratings: 0
```

Evidence read-back: 120 `current-cycle-observed-use-rate` observations plus 10 `mechanics-cross-check` observations. All supplied unknown sample sizes remain NULL; no absent observation is synthesized. Editorial arrays are losslessly stored as JSON text in the existing text fields. The manifest describes human-approved research; this task does not re-verify the upstream websites.

## Verification performed

| Command / check | Actual result |
| --- | --- |
| `bun run typecheck` | PASS |
| `bun run lint` in original shared working directory | FAIL: pre-existing untracked audit scripts, 5 errors/1 warning; none is included in this delivery. |
| `bun run lint` in clean export of the staged delivery plus tracked main files | PASS |
| `bun run test:unit` | PASS: 60 files, 319 tests |
| `bun run test:integration` with a fresh dedicated `TEST_DATABASE_URL` | PASS: 38 files, 264 tests |
| `bun run test:contract` | PASS: 1 file, 35 tests |
| `bun run build` | PASS |
| `bun run db:verify` with dedicated `TEST_DATABASE_URL` | PASS: migration metadata drift check, empty-to-latest and main-chain-to-latest paths |
| `bun scripts/reviewed-editorial.ts validate` | PASS: 121 entities / 121 ratings / 7 sources / 130 evidence, full ledger reconciles |
| Original-input byte comparison + package checksums | PASS |
| Actual local import, repeated import, independent read-back | PASS |
| `git diff --cached --check` | PASS |

Original workspace lint offenders retained unchanged:

- `scripts/build-full-audit-report.cjs`: forbidden CommonJS imports.
- `scripts/generate-phase1-audit-cn.cjs`: forbidden CommonJS import and unused variable warning.
- `scripts/generate-phase1-audit.cjs`: forbidden CommonJS import.

The clean delivery export is `/tmp/tierlistbase-genshin-clean-delivery-20261014/`; it includes all staged/previously tracked code and excludes those untracked audit scripts. No lint rule or project configuration was weakened.

The seven new database tests cover repeated import, rollback after a collision encountered after earlier inserts, conflicts in frozen ratings, invalid source references, changed database content, independent raw-Bun CLI execution, and rejection of JSONB strings masquerading as objects. Independent read-only code review found the last type-check issue; its regression failed before the fix and passed afterward. Review confirmed the fix with no remaining findings.

## Changed-file inventory

17 delivery files: one shared schema, one migration SQL, its snapshot/journal, three editorial scripts, two test files, seven reviewed-package/provenance files, and this handoff record. No dependency, build/runtime configuration, query consumer, UI, CSS, route visibility, source research or other-game logic changes.

```text
DATA PERSISTENCE IMPLEMENTATION COMPLETED
Schema migration: PASS (local database)
Reviewed package validation: PASS
Entities imported: 121 / 121
Ratings imported: 121 / 121
Evidence observations imported: 130
Read-back validation: PASS
Awaiting human review.
```
