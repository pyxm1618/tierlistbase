# WoW Forever Class & Spec Icons Blizzard First-Party Acquisition & Canary Report

## 1. 摘要与环境确认

- **执行时间**: 2026-10-15
- **执行环境**: 本地真实网络环境、Node.js + Sharp + 系统原生工具链
- **第一方连通性验证**:
  - Blizzard 官方站点 (`worldofwarcraft.blizzard.com` / `news.blizzard.com`): HTTP 200 PASS
  - Blizzard 官方 CDN (`render.worldofwarcraft.com` / `bnetcmsus-a.akamaihd.net`): HTTP 200 PASS
- **合规红线遵守**:
  - 第三方素材禁止: 100% 遵守 (NO)
  - AI 生成图片禁止: 100% 遵守 (NO)
  - 截官方截图裁切禁止: 100% 遵守 (NO)
  - 伪造超分 (Fake Upscale) 禁止: 100% 遵守 (NO)
  - 强行凑数映射禁止: 100% 遵守 (NO)

---

## 2. 5 个 Canary 验证结果 (5 / 5 PASS)

| Type | Name | Source Page | Asset URL | Status | Content-Type | Format | Dimensions | File Size | SHA256 | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Class | Warrior | `https://worldofwarcraft.blizzard.com/en-us/game/classes` | `https://render.worldofwarcraft.com/us/icons/56/classicon_warrior.jpg` | HTTP 200 | `image/jpeg` | JPEG | 56x56 | 2,337 B | `7ede428c9a375cd2d03bc495a4956e4a0e16c1a271aee3828c2cbd0b7de95c08` | **PASS** |
| Class | Priest | `https://worldofwarcraft.blizzard.com/en-us/game/classes` | `https://render.worldofwarcraft.com/us/icons/56/classicon_priest.jpg` | HTTP 200 | `image/jpeg` | JPEG | 56x56 | 2,520 B | `3e71c540e3c29e8cfb798fc9c3c4f6d4acb5bb5a5b69290cab00a528025eaae9` | **PASS** |
| Spec | Warrior::Arms | `https://worldofwarcraft.blizzard.com/en-us/game/classes/warrior` | `https://render.worldofwarcraft.com/us/icons/56/132355.jpg` | HTTP 200 | `image/jpeg` | JPEG | 56x56 | 2,494 B | `31b8e463d160cfede7b180b754110afa3bc8080316a6dd80f15176de0094189a` | **PASS** |
| Spec | Priest::Discipline | `https://worldofwarcraft.blizzard.com/en-us/game/classes/priest` | `https://render.worldofwarcraft.com/us/icons/56/135940.jpg` | HTTP 200 | `image/jpeg` | JPEG | 56x56 | 2,916 B | `cf2247377c866d1b76dafa13e47c583e530969731f8b651e33564812b21c7eb8` | **PASS** |
| Spec | Shaman::Elemental | `https://worldofwarcraft.blizzard.com/en-us/game/classes/shaman` | `https://render.worldofwarcraft.com/us/icons/56/136048.jpg` | HTTP 200 | `image/jpeg` | JPEG | 56x56 | 2,111 B | `6a452250ae8cffa98943954db6761ea922f1fc18a4e6b1f0519cca67bb71ffa4` | **PASS** |

所有 Canary 图标均成功转换为同尺寸 (56x56) 无损 WebP 并存储在证据目录与候选目录中。

---

## 3. 全量获取结果 (生产 SSOT: 9 Class + 27 Spec)

### 3.1 Class 图标 (9 / 9 Acquired - 100%)
所有 9 个职业图标均直接从暴雪第一方官方 CDN 获取，尺寸均为 56x56，转换为同尺寸 WebP：
1. **Warrior**: `https://render.worldofwarcraft.com/us/icons/56/classicon_warrior.jpg` (`7ede428c...`)
2. **Paladin**: `https://render.worldofwarcraft.com/us/icons/56/classicon_paladin.jpg` (`896263bb...`)
3. **Hunter**: `https://render.worldofwarcraft.com/us/icons/56/classicon_hunter.jpg` (`751e1801...`)
4. **Rogue**: `https://render.worldofwarcraft.com/us/icons/56/classicon_rogue.jpg` (`323fbbe3...`)
5. **Priest**: `https://render.worldofwarcraft.com/us/icons/56/classicon_priest.jpg` (`3e71c540...`)
6. **Shaman**: `https://render.worldofwarcraft.com/us/icons/56/classicon_shaman.jpg` (`43ddb234...`)
7. **Mage**: `https://render.worldofwarcraft.com/us/icons/56/classicon_mage.jpg` (`6df0d59e...`)
8. **Warlock**: `https://render.worldofwarcraft.com/us/icons/56/classicon_warlock.jpg` (`4b5f9ce4...`)
9. **Druid**: `https://render.worldofwarcraft.com/us/icons/56/classicon_druid.jpg` (`19d1cbba...`)

### 3.2 Spec 图标 (27 / 27 Acquired - 100%)

#### A. 暴雪官方第一方正式专精 (25 项 PASS):
1. **Druid::Feral Combat**: `https://render.worldofwarcraft.com/us/icons/56/132115.jpg` (官方页面对应 Feral)
2. **Druid::Guardian**: `https://render.worldofwarcraft.com/us/icons/56/132276.jpg`
3. **Druid::Restoration**: `https://render.worldofwarcraft.com/us/icons/56/136041.jpg`
4. **Hunter::Beast Mastery**: `https://render.worldofwarcraft.com/us/icons/56/461112.jpg`
5. **Hunter::Marksmanship**: `https://render.worldofwarcraft.com/us/icons/56/236179.jpg`
6. **Hunter::Survival**: `https://render.worldofwarcraft.com/us/icons/56/461113.jpg`
7. **Mage::Arcane**: `https://render.worldofwarcraft.com/us/icons/56/135932.jpg`
8. **Mage::Fire**: `https://render.worldofwarcraft.com/us/icons/56/135810.jpg`
9. **Mage::Frost**: `https://render.worldofwarcraft.com/us/icons/56/135846.jpg`
10. **Paladin::Holy**: `https://render.worldofwarcraft.com/us/icons/56/135920.jpg`
11. **Paladin::Protection**: `https://render.worldofwarcraft.com/us/icons/56/236264.jpg`
12. **Paladin::Retribution**: `https://render.worldofwarcraft.com/us/icons/56/135873.jpg`
13. **Priest::Discipline**: `https://render.worldofwarcraft.com/us/icons/56/135940.jpg`
14. **Priest::Holy**: `https://render.worldofwarcraft.com/us/icons/56/237542.jpg`
15. **Priest::Shadow**: `https://render.worldofwarcraft.com/us/icons/56/136207.jpg`
16. **Rogue::Assassination**: `https://render.worldofwarcraft.com/us/icons/56/236270.jpg`
17. **Rogue::Combat**: `https://render.worldofwarcraft.com/us/icons/56/ability_backstab.jpg` (来源页面: `https://news.blizzard.com/en-us/article/24310968/world-of-warcraft-forever-class-deep-dives-rogue-and-warlock`，像素级视觉匹配官方文章内嵌截图 `T4J4HEVFEIKM1791322637596.png` 中 Combat 天赋树专精标题左侧原图，非截图裁切，使用暴雪官方第一方独立资产)
18. **Rogue::Subtlety**: `https://render.worldofwarcraft.com/us/icons/56/132320.jpg`
19. **Shaman::Elemental**: `https://render.worldofwarcraft.com/us/icons/56/136048.jpg`
20. **Shaman::Enhancement**: `https://render.worldofwarcraft.com/us/icons/56/237581.jpg`
21. **Shaman::Restoration**: `https://render.worldofwarcraft.com/us/icons/56/136052.jpg`
22. **Warlock::Affliction**: `https://render.worldofwarcraft.com/us/icons/56/136145.jpg`
23. **Warlock::Destruction**: `https://render.worldofwarcraft.com/us/icons/56/136186.jpg`
24. **Warrior::Arms**: `https://render.worldofwarcraft.com/us/icons/56/132355.jpg`
25. **Warrior::Protection**: `https://render.worldofwarcraft.com/us/icons/56/132341.jpg`

#### B. 派生分析 Cohort 映射专精 (2 项 PASS - 明确记录 derived_cohort):
1. **Warrior::Gladiator** (`PASS`):
   - **底层正式专精**: Protection Warrior
   - **映射依据**: `docs/wow-forever-v1/evidence/production/taxonomy-review-evidence.json` (`cohortSpecs["Warrior::Gladiator"].baseSpec = "Protection"`) 与 `docs/wow-forever-v1/production-data-acceptance.md` 第 14 行。
   - **处理方式**: 复用已验证的 Protection Warrior 第一方图标，并在 Manifest 中明确注明 `mappingType: derived_cohort`，绝非暴雪官方独立专精。
2. **Paladin::Justicar** (`PASS`):
   - **底层正式专精**: Protection Paladin
   - **映射依据**: `docs/wow-forever-v1/evidence/production/taxonomy-review-evidence.json` (`cohortSpecs["Paladin::Justicar"].baseSpec = "Protection"`) 与 `docs/wow-forever-v1/production-data-acceptance.md` 第 14 行。
   - **处理方式**: 复用已验证的 Protection Paladin 第一方图标，并在 Manifest 中明确注明 `mappingType: derived_cohort`，绝非暴雪官方独立专精。

---

## 4. 交付文件路径

- **原始下载验证文件**:
  - `docs/wow-forever-v1/evidence/icon-canary/original/classes/` (9 个 JPG)
  - `docs/wow-forever-v1/evidence/icon-canary/original/specs/` (27 个 JPG)
- **WebP Canary 证据文件**:
  - `docs/wow-forever-v1/evidence/icon-canary/webp/classes/` (9 个 WebP)
  - `docs/wow-forever-v1/evidence/icon-canary/webp/specs/` (27 个 WebP)
- **正式候选 WebP 文件**:
  - `src/modules/meta-board/wow/assets/icons/classes/` (9 个 WebP)
  - `src/modules/meta-board/wow/assets/icons/specs/` (27 个 WebP)
- **Manifest 文件**:
  - `docs/wow-forever-v1/evidence/icon-canary/manifest.json` (包含全部 36 项元数据及 2 项明确标注的 derived_cohort)
