# WoW V1 publication gate

Production data was refreshed and accepted in the follow-up Production Data Acceptance task; see production-data-acceptance.md. Local UI fixtures are restricted to a dedicated localhost test database. Their screenshots and performance metrics prove implementation behavior, not real player rankings.

The existing publisher now requires a reviewed context file as an explicit `--review` argument. Existing `FOREVER_LOGS_API_KEY` and `DATABASE_URL` names are unchanged; no additional environment variable or service was added.

Run the existing script with the server-only runtime condition:

```sh
bun --conditions=react-server scripts/update-wow-forever-data.ts --review /absolute/path/to/reviewed-context.json
```

Dry-run is the default. `--publish` performs database writes; do not execute it without production-write authorization and the completed accuracy review.

The JSON review record must contain these verified fields (no guessed sample record is supplied):

- `phaseId`: Forever Logs content `phase_number`, not the database row `id`.
- `phaseName`: exact active phase name.
- `levelCap`: 30, checked against current official Forever Beta context.
- `officialSourceUrl`: current official Blizzard Forever Beta source.
- `checkedAt`: real ISO check time; must not be future or over 24 hours old.
- `taxonomySourceUrl`: actual Forever Logs source used to review role definitions.
- `dungeons`: the four approved near-cap names, each present in the actual active phase.
- `roleBySpec`: each returned `Class::Spec` mapped to reviewed role arrays. Multiple observed roles are supported; a static historical map never overrides the review.

The live `/phases` response must identify exactly one explicit active phase; no latest-id fallback is allowed. All twelve role/metric/dungeon probes validate their root context and statistics containers even when empty. Malformed rows, unknown taxonomy, wrong-phase/context responses or unavailable required evidence block publication. A same-phase refresh omitting previously stored context/entity records aborts the entire transaction for review; missing records are preserved, never deleted by inversion of a keep list.

Normalization, parse weighting, sample thresholds and Tier Bands are unchanged. Publishing writes phase provenance to existing version/source records and explicit Class parent/Profile metadata to existing entity tables; no schema migration is required. The page keeps old/unverified identity unknown and rejects invalid/mismatched stored performance instead of inventing values. Current requires the full reviewed version/phase/taxonomy, matching source checks and observations within the documented 24-hour publication policy. This freshness policy is not a statistical-confidence claim.

The user confirmed that the production Cloudflare Worker tierlistbase has FOREVER_LOGS_API_KEY configured and retains the existing production Neon DATABASE_URL Secret. Local processes cannot read those Cloudflare Secrets; this is environment isolation, not missing production configuration. No Secret was requested in chat, exported or committed. Authenticated live phase/taxonomy/statistics and production Neon correspondence were subsequently verified using the user-designated ignored .env.local; see the acceptance report and production evidence. The read-only public Blizzard topic was checked and confirms Level 30 and the four-dungeon scope; City of Dalaran's unverified numerical level range is deliberately null.
