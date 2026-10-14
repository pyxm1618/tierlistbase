# Genshin Impact 7.1 reviewed package

These five JSON files are byte-for-byte copies of the human-approved `*.final.json` inputs supplied on 2026-10-14. `checksums.json` records their SHA-256 hashes. No roster research or tier recalculation is performed by the persistence tools.

| Input | Approved | Deferred | Rejected | Unreviewed | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Character Master | 121 | 0 | 0 | 0 | 121 |
| Ratings | 121 | 0 | 0 | 0 | 121 |
| Sources | 7 | 0 | 0 | 0 | 7 |
| Evidence | 130 | 0 | 0 | 0 | 130 |
| Total | 379 | 0 | 0 | 0 | 379 |

Version: **7.1**, release date: **2026-09-23**, ranking context: **endgame-overall**. The release date comes from the task's approved version instruction; the supplied manifest has no release-date field.

Traveler remains one entity. Manekin and Manekina are excluded by the approved roster. Vesna is A+ and Vodyanitsa is S. These review decisions are not version-history changes. All 121 ratings are reviewed; Pending Evaluation is zero.

Evidence consists of 120 current-cycle use-rate observations and 10 mechanics cross-checks. Sample sizes are NULL as supplied. No missing observation is invented, including the absent Traveler use-rate observation. The seven approved source catalog entries are preserved even when a source has no standalone observation in this package.

## Commands

Run from the repository root with Bun and the existing dependencies:

```sh
bun scripts/reviewed-editorial.ts validate
bun run db:migrate
bun scripts/reviewed-editorial.ts import
bun scripts/reviewed-editorial.ts read-back
```

Migration and database commands require the existing `DATABASE_URL`. Validation requires no database. These commands use the configured database, not a production endpoint selected automatically by the tool. For tests, use a dedicated disposable database in `TEST_DATABASE_URL`; the repository's existing integration and migration tests reset their test schema.

Validation precedes every import and read-back. The import transaction locks the participating tables briefly, resolves existing natural keys, refuses ambiguous or conflicting records, and inserts only missing rows with stable primary keys. Re-running the same package performs no updates or deletes. Conflicts roll back the whole transaction; the tool never replaces a frozen rating snapshot silently. A new game version requires a new reviewed package and version record.

Mappings:

- Public entity fields stay in `entities`. The existing required `entities.role` uses `unclassified`; the approved role belongs to `ratings.primary_role` for this version/context.
- Element, weapon, rarity, official release version and official URL go into one JSONB `entity_profiles.metadata` record per entity.
- Strengths and limitations arrays are serialized losslessly as JSON text in the existing `strengths` and `constraints` text columns.
- Ratings have `editorial_status=reviewed`, `published_at=NULL`. No third-party consensus score is inferred; existing unavailable/default accounting fields remain as such.
- Evidence numeric/text values go into `evidence_observations`, never `source_ratings`. Date-only checked dates are stored at UTC midnight; `observed_at` remains NULL because the package does not provide an observation timestamp.
- Sources reuse existing URL matches only when catalog fields agree. Newly inserted catalog sources have `freshness_status=unknown`; their existing `checked_at` default records import time, not a new live verification of the website. The JSON package retains provenance for source keys.
- The importer never writes `rating_changes` or `source_ratings`.

Read-back independently checks every persisted input field, counts the complete Genshin roster and version/context snapshot, and checks duplicates and missing/cross-game relations. It refuses to turn an extra or missing row into a passing simplified result. Historical rows from other versions are preserved.
