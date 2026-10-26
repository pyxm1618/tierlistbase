# ZZZ Asset Audit

## Current inventory
- Base SHA: `18e7b41214e669bb67ed740657c73483b05e9fe8`; snapshot 2026-10-25; Version 3.3; audit 2026-10-26.
- Working directory: `/Users/milushangdi/.codex/worktrees/zzz-asset-sourcing/tier list`. Fresh clean detached worktree at fetched `origin/main`; HEAD matched remote. Original dirty checkout preserved; no checkout/pull there.
- Current data counts: 61 Agents, 9 Teams, 3 Pull Advice. Read data/icons/component/assets before downloading; only Velina bestAlternative was subsequently corrected under explicit follow-up authorization; no other business fields were changed.
- 34 baseline files: 23 Agent portraits; 6 Bangboo files; 1 Miyabi detail hero; 1 page hero; 3 legacy Team visuals. All remain byte-for-byte unchanged.
- Of 6 Bangboo files only Plugboo and Rocketboo are required by the current 9 Teams. Other 4 remain preserved. teamBanners is empty; W-Engine slots render MissingArtwork; Drive Discs render names only.

## Required inventory / Missing inventory

| Category | Required | Existing | Missing at baseline | Newly sourced | Verified / Resolved | Needs Review | Unresolved |
|---|---:|---:|---:|---:|---:|---:|---:|
| Agent portraits P0 | 61 | 23 | 38 | 38 | 61 | 0 | 0 |
| Bangboo P0 | 14 | 2 | 12 | 12 | 14 | 0 | 0 |
| W-Engine references P0 | 77 | 0 | 77 | 77 | 77 | 0 | 0 |
| Team visuals P0 | 9 | 0 | 9 | 9 | 9 | 0 | 0 |
| Agent hero P1 optional | 61 | 1 | 60 | 9 | 10 | 0 | 51 |

- W-Engine extraction now retains 183 references and 78 distinct raw strings. The refinement suffix alias `Gilded Blossom (P5 baseline)` → `Gilded Blossom` shares one asset, leaving **77/77** verified unique W-Engines. Bellicose Blaze was already required and sourced, so correcting Velina does not add an 78th unique entity.
- Required unique Bangboo: Baddieboo, Bagboo, Belion, Biggest Fan, Birkblick, Booltergeist, Booressure, Knightboo, Luckyboo, Mercury, Plugboo, Rocketboo, Sprout, Ultra Jake.
- Agent heroes: 0 additional heroes are mandatory for core use; 61 desirable, 1 existing, 9 reused from the Team assets, 51 explicitly deferred optional. No 61-hero expansion.

## Resolved assets
- 38 missing Agent portraits sourced: 17 official character-site avatar PNGs and 21 original HoYoWiki icons. Agent IDs remain the stable keys; officialName, displayName and official-source aliases are explicit per entry.
- 12 Bangboo and 77 W-Engine originals sourced from exact named HoYoWiki entries. Originals retained; 35px item slots are the quality target. The 156×156 Grill O’Wisp source is sufficient for 35px and is not enlarged.
- 9 Team visuals selected from official character artwork. No new composite/banner design. These same 9 files can optionally serve detail heroes.

| Team | Strategy | Asset | Status | Source |
|---|---|---|---|---|
| Phoenix Vortex | B — official core-Agent artwork fallback | `src/modules/zenless-zone-zero-tier-list/assets/teams/team-visual-phoenix.png` | Verified | [Official Agent record](https://zenless.hoyoverse.com/en-us/character?id=166075) |
| Claret Laceration | B — official core-Agent artwork fallback | `src/modules/zenless-zone-zero-tier-list/assets/teams/team-visual-claret.png` | Verified | [Official Agent record](https://zenless.hoyoverse.com/en-us/character?id=165587) |
| Seed Obol Electric | B — official core-Agent artwork fallback | `src/modules/zenless-zone-zero-tier-list/assets/teams/team-visual-seed.png` | Verified | [Official Agent record](https://zenless.hoyoverse.com/en-us/character?id=157829) |
| Promeia–Velina Anomaly | B — official core-Agent artwork fallback | `src/modules/zenless-zone-zero-tier-list/assets/teams/team-visual-promeia.png` | Verified | [Official Agent record](https://zenless.hoyoverse.com/en-us/character?id=163316) |
| Aria Anomaly | A — official faction artwork matches Faction Core | `src/modules/zenless-zone-zero-tier-list/assets/teams/team-visual-aria.png` | Verified | [Official Agent record](https://zenless.hoyoverse.com/en-us/character?id=161792) |
| Ye Enlightened | B — official core-Agent artwork fallback | `src/modules/zenless-zone-zero-tier-list/assets/teams/team-visual-ye-shunguang.png` | Verified | [Official Agent record](https://zenless.hoyoverse.com/en-us/character?id=160762) |
| Yixuan Rupture | B — official core-Agent artwork fallback | `src/modules/zenless-zone-zero-tier-list/assets/teams/team-visual-yixuan.png` | Verified | [Official Agent record](https://zenless.hoyoverse.com/en-us/character?id=155654) |
| Banyue Rupture | B — official core-Agent artwork fallback | `src/modules/zenless-zone-zero-tier-list/assets/teams/team-visual-banyue.png` | Verified | [Official Agent record](https://zenless.hoyoverse.com/en-us/character?id=160168) |
| Pyrois Crit | B — official core-Agent artwork fallback | `src/modules/zenless-zone-zero-tier-list/assets/teams/team-visual-pyrois.png` | Verified | [Official Agent record](https://zenless.hoyoverse.com/en-us/character?id=163768) |

## Unresolved assets
- P0 unresolved assets: none. The previous `velina-airgid.bestAlternative = Wuthering Salon` reference was corrected to **Bellicose Blaze** under explicit user authorization. [Mobalytics](https://mobalytics.gg/zzz/builds/velina-build-guide) explicitly labels it Alternative and explains the Energy Regen stat-stick use; [Prydwen](https://www.prydwen.gg/zenless/characters/velina) independently supports Energy Regen stat sticks. The old wrong-category requirement was retired with item-level evidence; no asset file was removed.
- Unresolved live Agent portraits: none. Unresolved Bangboo: none. Unresolved Team visuals: none.
- Optional hero deferrals: Rina, Alice Thymefield, Harumasa, Astra Yao, Burnice White, Caesar King, Cissia, Dialyn, Ellen Joe, Evelyn Chevalier, Grace Howard, Hugo Vlad, Jane Doe, Ju Fufu, Koleda Belobog, Lighter, Lucia, Nangong Yu, Nekomata, Norma, Orphie & Magus, Pan Yinhu, Qingyi, Remielle Dan, Roxy, Sigrid de L'Azur, Soldier 0 - Anby, Soldier 11, Starlight Billy, Sunna, Trigger, Yanagi, Yuzuha, Velina Airgid, Vivian, Von Lycaon, Yidhari, Zhao, Zhu Yuan, Anby Demara, Anton Ivanov, Ben Bigger, Billy Kid, Corin Wickes, Komano Manato, Lucy, Nicole Demara, Piper Wheel, Pulchra Fellini, Seth Lowell, Soukaku.
- Supplemental Upcoming slot: Severian Lowell is outside the 61 live Agents and cannot currently resolve through AgentPortrait’s roster lookup. Official HoYoWiki icon is empty in en/es/zh. [Official 3.3 avatar download](https://zenless.hoyoverse.com/en-us/news/166998) was read through Google Drive; its 1000×1000 stylized avatar contains an ellipsis bubble, so is Needs Review and was not copied into production assets. No changes to lookup/application logic.

## Source provenance
- Per-file sourceURL, sourcePage, sourceType, dimensions, format, alpha, bytes, SHA-256 and verification evidence are in `zzz-asset-manifest.json`. Source names and official API IDs are retained, including localized images mapped through the same entry ID.
- HoYoWiki URLs were first discovered through database pages, then independently read back through the actual HoYoWiki API with `x-rpc-wiki_app: zzz` and explicit `lang`. No source was accepted solely because a CDN responded 200.
- HoYoWiki admin assets and `event-ugc-hoyowiki` uploads are distinguished. Community uploads are attributed as community, not publisher-authored; exact named entry mappings and clean game-object visuals were checked. Third-party database UI screenshots and resized fallback candidates were not saved.
- Existing active assets use immutable baseline repository URLs as immediate provenance. Their original external download URLs are unknown; none were invented. Verified here accepts the existing project mapping plus visual identity and dimensions.
- Visual QA used labeled contact sheets of original decoded files. No image modifications or optimization were applied. No claim of extra licensing permission is made.

## Legacy assets
- Still applicable: all 23 existing portraits, Plugboo/Rocketboo, Miyabi detail art, and page hero. Butlerboo/Cryboo/Electroboo/Sharkboo remain valid unused assets outside current Team requirements.
- Mismatched but preserved: `team-miyabi-freeze.webp`, `team-evelyn-hypercarry.webp`, `team-harumasa-quicken.webp`. None maps to the current 9 Team identities; no reuse, deletion, overwrite, rename or recompression.

## Readiness
- **Final Result: PASS**
- **Ready for asset integration: Yes**
- P0: 161 logical requirements = 161 Verified + 0 Unresolved. P1: 61 = 10 Verified + 51 optional deferred. Current total: 222 = 171 approved + 51 deferred; unreviewed = 0; deleted = 0. Reconciliation: previous 223 minus one obsolete wrong-category requirement = current 222. Supplemental and legacy records remain separate; Severian remains Needs Review.
- Physical reconciliation: 34 existing + 136 new unique originals = 170 assets. No duplicate filenames, hashes, or entities within a category. Nine optional detail/Team mappings intentionally reference the same file; no duplicate copies.
- Manifest and assets checked by decode, metadata/hash readback, exact data-reference coverage, existing-file comparison to Git HEAD, and scope/diff checks. The follow-up changed exactly one data field; targeted data-suite and manifest-integrity verification are recorded below. No production/browser integration success is claimed.

Follow-up verification: existing ZZZ unit suite **6/6 passed** using the installed Vitest runtime from the original checkout, a temporary config aliasing this worktree, and the unchanged existing test file. Full manifest integrity validation passed: exact one-field source-text diff, 183 references, 77/77 engines, 161/161 P0 mappings, all 170 image hashes, all other manifest categories unchanged, no asset deletion, and `git diff --check`. No dependencies or repository test/build configuration were changed.

Only velina-airgid.bestAlternative was corrected from Wuthering Salon to Bellicose Blaze under explicit follow-up authorization. No other ZZZ business data, rankings, SEO configuration, indexability, sitemap, UI structure, application logic, or production asset mappings were modified. Asset files were preserved; the manifest and audit were refreshed.
