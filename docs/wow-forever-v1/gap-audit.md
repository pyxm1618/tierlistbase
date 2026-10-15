# WoW V1 Gap Audit / 验收台账

日期：2026-10-15。页面功能已经实现；图标按用户新授权使用中性占位素材。最终生产发布验收 NOT READY：认证 Forever Logs active phase / live taxonomy / 生产 Neon 一致性为 remote production validation pending。不得用本地 fixture 证明真实排名已验收。

## Existing and reusable

- 继续使用 Server Component route、getGameMetaBoardData/getRecentRatingChanges、原归一化和Tier Bands、原DB表、SiteHeader/Footer及现有测试体系。
- 未修改数据库schema，未增加依赖或独立ranking store。

## Needs modification — 已实施

- 按home.png落地Hero、固定Context、Class Navigator、Tier Board、四Tabs Detail、Quick Insights、What Changed、Sources & Evidence、Methodology & FAQ。
- 按Class本地过滤；Role真实路由查询；Drawer焦点锁/恢复/Escape/Backdrop/scroll lock。
- 批量读取entity_profiles和存储source_ratings.notes；不N+1、不按字符串推断Class。
- Wetlands metadata、显式active phase、reviewed taxonomy、版本发布门禁；缺数据/冲突保留Pending或Preliminary/Stale。
- 发现共享Homepage缓存日期bug，仅做一行Date归一化和回归测试。

## Missing / Data not currently verified

- 生产 Worker tierlistbase 的 FOREVER_LOGS_API_KEY 与生产 Neon DATABASE_URL 已配置（用户确认）；本地无权读取 Cloudflare Secret，无法执行认证 API/生产 DB 核查，属于环境隔离。
- 当前生产Neon的Class/Spec回填、observations、context/version/phase一致性和真实默认排名尚未核验或刷新。
- 正式Class/Spec视觉素材待补；此项遵循用户例外，不阻塞功能实现。

## Data already supported

- Parser/schema validation、5 parses/dungeon、2 dungeons、20 included parses、同Dungeon归一化、跨Dungeon按parses加权、既定S/A/B/C/Pending不变。
- 新publisher要求 `--review <path>` 和已有API密钥；review记录官方source、checkedAt、phase/name、levelCap、四Dungeon、当前逐Spec roles。24h为显式发布freshness政策，不是统计confidence。
- 本地publisher→Postgres→共享query→presentation roundtrip通过。旧记录缺class metadata时保留Unknown，下一次经过gate的publisher会写parent关系和profile，不前端猜名字。

## Image assets available

- 素材/wow forever/home.png：批准Final Design，仅作视觉对照，不裁正式资源。
- 素材/wow forever/hero.png：用户提供并批准，2172×724→299436-byte hashed WebP；静态import/next/image/唯一大型priority。
- 中性Class/Spec placeholder：本地几何图形→WebP，静态import的URL由Next带hash，lazy，明确可见标注。
- 最小素材台账：src/modules/meta-board/wow/assets/README.md。

## Image assets missing

- Class Icons: PLACEHOLDER / final assets pending。
- Spec Icons: PLACEHOLDER / final assets pending。
- Hero: FINAL / approved。未从任何外站抓图片或AI生成伪官方图标。

## 逐项状态

44项全部登记且已审查。Pass表示该项的明确代码/本地验收边界成立；生产数据未核验的项保持Unknown。无unknown→reject的压缩。

| ID | Requirement | State | Evidence / next action |
| --- | --- | --- | --- |
| READY-01 | Final Design 信息架构完整落地； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-02 | 当前 Forever Beta / Level 30 / Dungeon 范围正确； | deferred / unknown | 官方 Level30 / Dungeon facts已核对；当前认证 active phase/DB未核对。 |
| READY-03 | DPS / Tank / Healer 都是真实 Context； | deferred / unknown | 真实查询与本地3 Context 测试通过；生产实际 Context 仍待只读核查。 |
| READY-04 | Class Navigator 可用； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-05 | Tier Board 使用真实数据； | deferred / unknown | 页面只读数据库；真实 Forever Logs/Neon刷新未执行，本地截图是显式合成测试数据。 |
| READY-06 | Pending 语义正确； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-07 | Spec Detail 与当前 Spec 对齐； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-08 | Performance 使用真实数据； | deferred / unknown | 数据库performance roundtrip与展示测试通过；当前生产数据有效性未验收。 |
| READY-09 | Dungeon Breakdown 不串数据； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-10 | Sources / Evidence 真实； | deferred / unknown | 来源角色与归因已实现；生产关联 evidence 待核查。 |
| READY-11 | 无假 source agreement； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-12 | rating_changes 语义正确； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-13 | 无 change record 不冒充 Stable； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-14 | 没有 Retail / Classic / Level 60 数据； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-15 | 没有设计稿示例数字进入 Production； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-16 | Hero/Class/Spec 正式图片来源合规； | deferred / waiting | Hero FINAL/approved；Class/Spec PLACEHOLDER，按用户例外不阻塞功能开发。 |
| READY-17 | 没有设计稿截图裁图； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-18 | 没有 fake upscale； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-19 | 正式图片 WebP + next/image； | deferred / waiting | Hero和中性占位图均为WebP+next/image；正式Class/Spec素材待补。 |
| READY-20 | 图片 URL 采用合理版本化/cache-busting； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-21 | Hero 是唯一大型高优先级图片； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-22 | 非首屏图片 lazy； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-23 | responsive sizes/srcset 实际合理； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-24 | Mobile / Desktop 无异常图片下载； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-25 | 页面保持 server-first； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-26 | 没有整页 use client； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-27 | 没有增加重型库或基础设施； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| READY-28 | 390–2560 真实浏览器验收通过； | approved / pass | Playwright desktop/mobile 28/28，覆盖390/768/1024/1280/1440/1920/2560；截图明确标记synthetic。 |
| READY-29 | 当前性能门禁通过； | approved / pass | 现有marketing performance20/20 + analytics-on1/1通过；本机实验室值，不是生产RUM。 |
| READY-30 | Genshin / Homepage 无回归； | approved / pass | 现有Homepage/Genshin功能回归18/18通过；含共享缓存日期bug最小修复。 |
| READY-31 | 没有修改本任务范围之外的产品。 | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| DATA-01 | Forever Logs active phase 与当前 Beta context 一致； | deferred / unknown | 认证 live active phase 本地不可读（Cloudflare Secret 环境隔离）；代码门禁不允许历史fallback。 |
| DATA-02 | Blizzard 官方当前 Level Cap / Dungeon availability 已核对； | approved / pass | 本轮读取 Blizzard 官方主题JSON，含10月1日Level30与near-cap范围及10月8日City of Dalaran开放。 |
| DATA-03 | 所有参与 ranking 的 dungeon metadata 未过期； | approved / pass | Wetlands修正26-31；Razorfen25+ / Uldaman30+核对；City of Dalaran不臆测数值范围（null）。 |
| DATA-04 | DPS / Healer / Tank 的 spec-role mapping 与 Forever Logs 当前 live taxonomy 一致； | deferred / unknown | Live taxonomy认证核查待完成；代码只接受逐项review，含实际observations角色验证。 |
| DATA-05 | 不使用历史静态 role map 覆盖 live data； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| DATA-06 | 当前页面不得把 near-cap dungeon aggregate data 描述成“仅 Level 30 玩家数据”； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| DATA-07 | API payload 必须通过现有 parser/schema validation； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| DATA-08 | retrievedAt / checkedAt / freshnessStatus 必须真实； | deferred / unknown | 本地时间/状态测试通过；生产实际retrievedAt/checkedAt未读。 |
| DATA-09 | active phase / DB current version 无法对应时禁止标记 Current； | deferred / unknown | 代码强制review/phase/version一致；生产DB current version尚未核对。 |
| DATA-10 | Forever Logs 必须在页面显式 attribution 并提供有效链接； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| DATA-11 | Blizzard facts 必须来自当前官方 Forever Beta source； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| DATA-12 | Editorial evidence 未审核/未入库，不允许进入 Ranking explanation； | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |
| DATA-13 | 任何数据存在冲突时，优先显示 Pending / Preliminary / Stale，而不是猜测。 | approved / pass | 源码与相应本地自动验收通过；不代表生产发布已执行。 |

计数核对：original total 44 = approved / pass 33 + deferred / waiting 2 + deferred / unknown 9 + confirmed reject / fail 0 + unreviewed 0。
