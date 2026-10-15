# WoW Forever Production Data Acceptance

PR: [Draft #24](https://github.com/pyxm1618/tierlistbase/pull/24)
HEAD: see the commit containing this report; source fix and evidence are included together. PR remains Draft. No merge or deployment.

Forever Logs live API: PASS. Production key loaded from user-designated ignored `.env.local`; no Secret value printed or committed. `/phases` authenticated HTTP200 and existing schema validation; all twelve scope/metric statistics probes HTTP200 and parser validation PASS.

Active phase:
phase number: 1
phase name: Beta

Dungeon scope: PASS — City of Dalaran, Excavation Site: Wetlands, Razorfen Downs, Uldaman all present in the unique active phase. No fallback or scope adjustment. Current official Blizzard topic rechecked: Level30 and this dungeon availability remain consistent.

Live taxonomy: PASS — live `/api/creatures/class-specs` fetched successfully through the Forever Logs browser runtime, then checked against all 69 observations / 27 class::spec keys. Direct CLI requests to this site endpoint returned403; those were not called successes. Current Shaman tankSpecs is empty; no Shaman Tank observation was returned, so none was invented. The current FAQ documents Warrior Gladiator and Paladin Justicar as DPS cohorts of tank talent specs; both are returned by the current DPS-filtered API and were explicitly reviewed. They were not silently inferred from old static arrays. All five observed Healer specs match live healerSpecs; all three observed Tank specs match live tankSpecs. HPS observations of DPS/Tanks are excluded from Healer rankings by the reviewed roles.

Sources: [Forever Logs live taxonomy](https://foreverlogs.gg/api/creatures/class-specs), [current cohort/role documentation](https://foreverlogs.gg/faq), [Blizzard Beta notes](https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-updated-october-8/2360696). Review checkedAt: `2026-10-15T06:42:11.615Z`; actual check time, not backdated.

Production DB before:
current version: Beta 2026-10-08 (`v-64e1d8e2af3e8a69c1f84c38d6f5125196`)
stored phase: Unknown — legacy rows had no explicit phase metadata; no phase number was invented.
last data timestamp: 2026-10-11T07:54:53.632Z

Before-state: three Dungeon/30 role contexts, 25 Spec entities, zero profiles, 25 source_ratings, 25 ratings, zero changes. The legacy snapshot's Level30, all stored dungeon names and explicit official Beta source correspond to the approved context; no conflicting stored phase exists. A distinct reviewed Beta/1 version was published. Every existing entity/context key matched the current candidate, including conservatively comparing all 25 legacy keys rather than assuming they could be discarded. The old version and its 25 rating/source rows remain byte-for-byte unchanged.

Dry run: PASS
DPS count: 19
Tank count: 3
Healer count: 5
Pending count: 15

27 candidate rows = 12 ranked + 15 Pending. No role has an empty eligible ranking. Every Pending item is explained by fewer than two included dungeons and/or fewer than20 included parses; excluded samples below5 remain flagged. Holy Paladin has low confidence and an extreme_tail flag retained from live observations; its score is not promoted or replaced. Scores match existing normalization/weighting and rounded persisted Tier Bands. Full dry-run summary is in evidence/production/dry-run-repair.json.

Publish performed: YES — existing script with `--review <review-file> --publish`, using the same Secret names and unchanged publication gates. No manual production SQL repair or migrations.

The first real read-back exposed JSONB scalar strings in all27 profile metadata rows. Production writes paused; the test was strengthened to assert PostgreSQL jsonb_typeof directly (RED), then the publisher parameter changed to postgres JSON encoding (GREEN). Existing known JSONB strings are decoded before merging, preserving other metadata. This is a storage correctness fix, not a new ranking/UI feature or gate bypass. All27 repair targets had positive item-level identity evidence. Fresh dry run, production read-only comparison, same-phase completeness and local verification passed before the same pipeline was rerun. First publication and repair results/evidence were retained.

Production DB read-back: PASS — read-only transaction, readAt `2026-10-15T06:52:02.799Z`. All27 current rows checked, including Tier/Score/Rank/Parses/Coverage/Dungeon Breakdown/Class/Spec/Role/Source/review/timestamps; sampled DPS/Tank/Healer/Pending detailed records are retained in readback-validation.json. Nine Class parents,27 Spec entities and27 JSONB-object profiles; current pointer `v-a34604d21fb04a5905428181db7e6c120c` with exact reviewed Beta/1 metadata; three Dungeon/30 contexts. Total52 ratings/source_ratings = unchanged25 historical +27 current. Zero changes: this is a new reviewed phase-version, so no movement or Stable record was fabricated. Repair dry run and publication candidate are identical.

Page production-data verification: PASS — verifiedAt `2026-10-15T06:53:04.528Z`. Actual local production build of PR code at `http://127.0.0.1:3017`, with real production Neon from the trusted local config. This is a production-data runtime check, not a claim that the draft UI has been deployed to Cloudflare. No synthetic fixtures or test DB used for acceptance. All four requested URLs returned200: default/DPS19, Tank3, Healer5. All27 distinct Specs checked (46 Detail checks counting repeated default/DPS routes), summary and four-dungeon table matched DB, missing data remained N/A, page status Preliminary was correct. Forever Logs attribution returned200; no Level60/Retail/Classic/fixture content.

Freshness: Preliminary
原因：source retrieval `2026-10-15T06:50:21.403Z` and review check are real, current and within24h; current source freshness is `current`. Page status deliberately remains Preliminary because15 Pending items and low-confidence evidence exist. Current retrieval does not imply complete/statistically certain ranking evidence.

Remaining data blockers: None.

Images:
Hero: FINAL
Class Icons: PLACEHOLDER / final assets pending
Spec Icons: PLACEHOLDER / final assets pending

Final data acceptance: PASS.

Verification for the minimal publisher fix: unit337/337, full local integration265/265, explicit storage/legacy-merge regression RED→GREEN, typecheck/scoped lint/format, local production build and real production-data browser comparison passed. Integration uses an explicitly dedicated localhost test database, never production. No dependency/schema/UI change. Remote CI is reported separately by PR checks; previous-head green checks are not evidence for a later head.
