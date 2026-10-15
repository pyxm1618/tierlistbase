# WoW Forever Tier List V1 — 合并执行需求

日期：2026-10-15（Asia/Shanghai）
目标：`/wow-forever/tier-list` 正式落地；本文件不是已完成声明。
基线：`ee400982f197646aeab6d0db526f0367f101e24e`，本轮已 fetch / checkout main / pull --ff-only 核对。
分支：`codex/wow-forever-v1-publication-gate`。

## 合并优先级与修正

原始任务所有范围、设计、数据、图片、SSR、SEO、性能、测试、Git 和 READY 条件继续生效。补充需求增加发布前数据准确性硬门禁；存在冲突时以下规则覆盖原任务对应表述：

1. Dungeon Scope 在开发前必须核对 Blizzard 当前官方 Beta 状态；过期 metadata 必须最小修正，不取决于页面是否显示 level range。
2. 原第十三节不再预设 Enhancement Shaman 为 Tank。读取 Forever Logs 当前实际 taxonomy 和角色定义，并对照 observations；Earthen Guardian 也是待 live 验证的名称，不能仅凭补充文本直接硬编码。
3. 必须比较 active phase、Blizzard Beta context 和 DB current version；不匹配或无法证明一致时禁止 Current，按真实情况 BLOCK / Preliminary / Stale。
4. Level 30 指当前 Beta level-cap context 与 near-cap Dungeon 范围；aggregate 数据无 player-level filter 时禁止写成仅 Level 30 玩家数据。
5. Forever Logs 显式归因并提供真实可访问链接，属于 READY 硬条件。
6. API payload validation、retrievedAt / checkedAt / freshnessStatus、官方事实 provenance、已审核 editorial evidence 都必须实际验收；不能以前端文案遮掩错误。
7. 原 31 条 READY 条件与新增 13 条 Data Accuracy / Publication Gate 全部必需；任一关键 Context / Role / Version / Source mismatch 为 NOT READY。
8. 补充材料中的外部事实和“够支撑”等判断是需求输入，不能代替本轮 live API、DB、官方来源和浏览器验证结果。

## 本轮设计与素材状态（按用户最新授权更新）

- Final Design: `素材/wow forever/home.png`，已实际查看，沿用原批准布局；不裁图、不抽取其中数字或职业结论。
- Hero: `素材/wow forever/hero.png`（2172×724），独立素材，已实际查看。Source: user-provided project asset. Status: approved。Hero 不再是 blocker。
- Class Icons: PLACEHOLDER / final assets pending。
- Spec Icons: PLACEHOLDER / final assets pending。
- 用户明确允许使用标明身份的中性开发占位素材，继续完成布局、数据、过滤、Detail、响应式和性能；此例外覆盖原第二十四节和 READY 第16/19条中“缺 Icons 则阻塞整个开发”的限制，但不等于正式图标已交付。
- 不从 Blizzard/Wowhead/Mobalytics 或其他站抓图，不 AI 生成伪官方图标，不新建素材系统/CMS/数据库/抓取器。
- 最小素材台账位于 `src/modules/meta-board/wow/assets/README.md`，记录素材名、最终文件、原路径、使用依据、日期、处理与批准状态。
- 最终保留 `Remaining issue: final Class/Spec visual assets pending`。

## 生产配置与最终远程验收（用户最新确认）

- Forever Logs production secret: configured（用户确认，Cloudflare Worker `tierlistbase`；不代表本轮读取了 Secret）。
- DATABASE_URL: 沿用 Cloudflare 中现有生产 Neon Secret。
- 本地无法读取生产 Secret 属环境隔离；不向用户索取值、不导出、不写仓库、不新增第二个 Secret 名称。
- 当前页面从现有数据库读取，既有发布脚本继续使用同名 FOREVER_LOGS_API_KEY。没有增加运行时导入端点、scheduler 或其他超出页面范围的基础设施。
- Forever Logs live API validation / Production DB read-back / Active phase-context consistency / Data freshness: remote production validation pending。
- 最终 READY 前后四项必须真实 PASS。本地 fixtures 与本地测试通过不能替代生产真实性验收。

## 原始正式开发任务（完整保留）

TierListBase — WoW Forever Tier List V1 最终开发任务
你现在负责 TierListBase 项目中的：
/wow-forever/tier-list

这一轮只做：
World of Warcraft: Forever Tier List V1 页面正式开发落地。
这是一个严格限定范围的页面开发任务。
不要重新讨论产品方向。
不要重新设计页面。
不要扩展 TierListBase V1。
不要把它开发成综合 World of Warcraft 网站。
不要处理历史版本的 World of Warcraft。
本轮所有内容严格聚焦：
World of Warcraft: Forever
Current Beta
Level 30
Dungeon
DPS / Tank / Healer

一、最新代码基线
开始前必须执行：
git fetch origin
git checkout main
git pull --ff-only
git status
git log -n 5 --oneline
git rev-parse HEAD
git rev-parse origin/main

审核本任务时最新 main 曾为：
ee400982f197646aeab6d0db526f0367f101e24e

但它只是历史参考。
真正开发时以最新 origin/main 为唯一基线。
如果远端已经更新：
不得回退到旧 SHA。
然后：
- 从最新 main 新建独立分支；
- 不直接修改 main；
- 不在旧分支继续堆代码；
- 不顺手修改无关页面。
二、本轮唯一目标
把：
/wow-forever/tier-list

正式重构成已经批准的：
WoW Forever Level 30 Beta · Dungeon Tier List

核心只服务：
排名
+
场景
+
真实表现数据
+
为什么这样排
+
版本变化
+
证据来源

用户进入页面以后应该快速完成：
1. 知道当前查看的 Beta / Level / Dungeon Context；
2. 在 DPS / Tank / Healer 中找到当前排名；
3. 通过 Class 快速过滤 Specs；
4. 点击 Spec 后理解为什么处于该 Tier；
5. 查看真实 Performance 数据；
6. 查看最近 Tier 变化；
7. 查看数据和编辑证据来源。
不开发成：
WoW Wiki
WoWhead replacement
Mobalytics replacement
Build Guide
Talent Guide
Gear Guide
Leveling Guide
PvP Guide
Racial Guide
News
Community
Forum
Compare Tool
AI Ranking Tool

三、游戏范围锁死：只允许 WoW Forever
本页面中的 World of Warcraft 只指：
World of Warcraft: Forever

禁止混入：
Retail WoW
Classic Era
Hardcore
Cataclysm Classic
Mists Classic
Season of Discovery
历史资料片
Level 60 结论
任何与当前 WoW Forever Beta 无关的信息

页面范围：
Current WoW Forever Beta
Level Cap 30
Selected near-cap Dungeons
DPS
Tank
Healer

任何传统 WoW 事实，如果没有证据证明适用于 Forever：
不要使用。
四、Final Design 是唯一视觉基准
用户已经批准最终 WoW Forever V1 设计稿。
它是：
Desktop 页面结构和视觉表现的唯一基准。
不是参考。
不是产品方向。
不是允许自由发挥的草图。
在不破坏：
- 真实数据；
- SEO；
- 性能；
- 响应式；
- Accessibility；
的前提下，尽可能严格还原 Final Design。
信息架构必须保持：
Hero
→ Ranking Context
→ 左侧 Class Navigator
→ 中间 Tier Board
→ 右侧 Spec Detail
→ Quick Insights
→ What Changed
→ Sources & Evidence
→ Methodology & FAQ

不删除。
不换顺序。
不重新发明 Generic Meta Board UI。
可以复用：
底层逻辑
数据查询
DB
共用组件
工程规范

但不能因为旧组件方便，就让设计稿迁就旧 UI。
五、Hero / Ranking Context
Hero 必须明确表达：
World of Warcraft: Forever Tier List

副标题：
Level 30 Beta · Dungeon DPS / Tank / Healer

说明文案表达类似：
Based on observed dungeon performance data and reviewed editorial evidence.

禁止出现：
Community Data
Every Dungeon
Level 60
1.14.4
未验证 Patch
历史 WoW Version

Hero 状态：
Current Beta Phase / Version
Level Cap
Last Updated / Data Updated
Data Status

Data Status：
Current
Preliminary
Stale

必须来自真实数据状态。
禁止永远硬编码 Current。
Current Beta / Version：
优先来自当前真实 API / DB。
如果不存在可靠 Build Number：
不编造。
可以显示：
Current Beta
Current Beta Phase
Beta + verified date/context

六、Ranking Context / Filters
V1 当前 Context：
Mode:
Dungeon

Role:
DPS
Tank
Healer

Level:
30

Version:
Current WoW Forever Beta

真正主要交互：
DPS / Tank / Healer

如果 Dungeon / Level 30 / Current Beta 当前只有一个有效值：
作为固定 Context 显示。
不制造：
Overall
All Roles
Leveling
PvP
Level 60
旧 Beta
不存在的 Context

Filter 必须对应真实 ranking_contexts。
不允许纯前端 hide/show 冒充 Context。
Query filters 不产生独立 SEO 页面。
七、Class Navigator
Desktop 必须恢复：
Class Navigator
+
Tier Board
+
Spec Detail

三栏决策工作区。
Class：
All Classes
Warrior
Paladin
Hunter
Rogue
Priest
Shaman
Mage
Warlock
Druid

Class Navigator：
只过滤当前 Ranking Context 中的 Specs。
它：
- 不是 Ranking Context；
- 不改变算法；
- 不产生 SEO 页面。
All Classes 恢复完整当前榜单。
八、Class / Spec 数据
正式 Ranking Entity 是：
Spec

页面必须明确：
Spec
Class
Role
Tier
Rank

优先复用：
entities.parent_entity_id
entityProfiles
已存在 Class / Spec 关系

不长期根据字符串猜 Class。
不另建第二套 WoW DB。
不为了未来游戏重构 schema。
只做当前页面所需的最小 Class → Spec 修复。
九、Tier Board
Tier Board 是第一核心。
Tier：
S
A
B
C
Pending

Pending：
证据未满足最低 Ranking Requirements。
禁止把证据不足的 Spec 强塞到 C。
当前 Tier Bands：
S >= 120
A >= 105
B >= 90
C < 90

insufficient evidence -> Pending

除非发现真实 bug，否则本轮不改。
每张 Spec Card 重点：
Spec Icon
Spec Name
Class
Role
Rank
Data Status

卡片负责快速扫描。
长解释全部进入 Detail。
十、绝不伪造 Ranking
当前真实数据链路：
Forever Logs Public API
→ observations
→ role filtering
→ sample filtering
→ same-dungeon normalization
→ cross-dungeon aggregation
→ TierListBase score
→ S/A/B/C/Pending
→ Neon
→ page

必须沿用。
禁止为设计稿：
- 写静态假排名；
- 把 Arms Warrior 118.4 等示例值写进 Production；
- 为视觉完整补假 Parses；
- 用其他 WoW 版本填空。
缺数据只能显示：
Pending
Not enough data
No recorded data
N/A

十一、Forever Logs
优先复用已有：
src/modules/meta-board/data/forever-logs-publisher.ts
src/modules/meta-board/domain/forever-logs-data-ranking.ts
src/modules/meta-board/domain/forever-logs-data-tier.ts
scripts/update-wow-forever-data.ts

不写第二套 Forever Logs Client。
不重做 ranking pipeline。
当前可能使用：
avg_dps
avg_hps
avg_dtps

median
avg
min
max
totalParses
percentiles
location
difficulty
bracket
damageMode
retrievedAt
normalizedScore

所有页面 Performance 数据优先从现有真实链路读取。
十二、Dungeon Scope
当前 Level 30 Beta 已批准 near-cap dungeons：
City of Dalaran
Excavation Site: Wetlands
Razorfen Downs
Uldaman

检查当前 metadata。
已知：
Excavation Site: Wetlands

旧代码可能存在过期 24–29 range。
如果页面必须显示 Dungeon level range：
先依据当前可靠 WoW Forever Beta 事实确认。
如果 UI 根本不需要：
不扩大工作范围。
十三、Role 边界
不重写现有 DPS / Healer / Tank Role 系统。
只检查已知边界：
Enhancement Shaman Tank

检查真实 Forever Logs / 已存 observation：
Enhancement Shaman
avg_dtps
Tank context

如果有可靠 observations：
不允许旧静态 role map 错误过滤。
如果没有足够证据：
保持现状。
不因为第三方 Tier List 就复制其角色分类结论。
十四、Spec Detail
Spec Detail 是第二核心。
Desktop：
固定右侧 Detail Panel

点击 Spec：
Detail 更新。
默认可以选择当前榜单第一个有效 Spec。
Tablet / Mobile：
Drawer / Dialog

必须支持：
Esc
backdrop close
focus trap
focus restore
body scroll lock

Mobile 不删除 Detail。
十五、Detail Tabs
严格只有：
Overview
Performance
Evidence
Changes

禁止增加：
Build
Gear
Talents
Rotation
Best Build
Leveling
PvP
Guide

十六、Overview
显示：
Spec Icon
Spec Name
Class
Role
Current Tier
Rank
Current Context
Why This Tier
Key Strengths
Limitations

Why This Tier：
优先来自真实数据解释。
如果存在审核后的 editorial rationale，可以加入。
如果当前只有 Data Ranking：
解释必须诚实围绕：
score
sample
dungeon coverage
current Beta scope

禁止前端临时生成伪专家结论。
禁止复制 Wowhead / Mobalytics 原文。
十七、Performance
删除任何假雷达图。
必须使用真实可计算数据：
TierListBase Data Score
Rank
Parses
Dungeon Coverage

Dungeon Breakdown 至少：
Dungeon
Relative / Normalized Score
Median
Parses

数据来自真实 observations / stored evidence。
无数据：
N/A
insufficient sample

不补假值。
十八、Performance Score 语义
保持：
同 Dungeon 内归一化

100：
当前 Dungeon 符合条件 Specs 的中位表现基准。
跨 Dungeon：
按 included parses 加权

例如：
118.4

不能解释为：
118.4 DPS
118.4%
118.4 confidence

它只是：
TierListBase relative Performance Score

十九、Sources & Evidence
页面设计中的来源角色：
Forever Logs
→ Primary Performance Data

Blizzard
→ Official Beta / Game Context

Wowhead
→ Editorial Cross-check

Mobalytics
→ Editorial Cross-check

禁止出现：
Community Source
Community Consensus

如果 DB 当前只有 Forever Logs source rating：
不要假装 Wowhead / Mobalytics 已参与排名算法。
只有来源真正：
- 被审核；
- 被存储；
- 与当前 context/version/entity 关联；
才允许显示具体 cross-check 结论。
二十、Source Agreement
如果只有：
1 performance data source

禁止写：
1 / 1 sources agree

应写：
1 performance data source

或：
Performance data available

只有真正存在多个独立可比较 rating source 时，才允许：
2 / 3 sources agree

二十一、Quick Insights
只允许真实可计算：
Top Performance
Largest Sample
Widest Coverage
Biggest Mover
Needs More Data

Biggest Mover：
只有真实 rating_changes 才显示。
没有历史：
No recorded movement yet

或隐藏该结论。
禁止：
Best Overall
Most Versatile
Best for New Players
Best for Beginners
Best for Speed
Best for Raids

二十二、What's Changed
必须复用：
rating_changes

不另造历史。
展现可分：
Moved Up
Moved Down
Stable

但这里有一个严格数据语义：
没有 rating_changes 记录，不等于 Stable。
Stable 只有在存在可比较的 previous/current rating，并明确证明 Tier 未变化时才能使用。
如果：
- 第一次发布；
- 没有前一个可比较版本；
- 没有 change record；
- 历史尚未采集；
则必须显示：
No recorded tier changes yet

或等价 unavailable 状态。
同时：
Tier 下降不能直接写 Nerfed。
Tier 上升不能直接写 Buffed。
除非有 Blizzard 官方 balance-change evidence。
页面描述的是：
Ranking movement

不是 patch notes。
二十三、Methodology / FAQ
Methodology 保持简洁并真实说明：
Same-dungeon normalization
Cross-dungeon weighting
Role-specific metrics

Data Requirements：
>= 5 parses per dungeon
>= 2 near-cap dungeons
>= 20 included parses

Tier Bands：
S >= 120
A >= 105
B >= 90
C < 90
insufficient evidence -> Pending

禁止新增：
AI confidence
Authority score
ML ranking
LLM ranking
black-box score

二十四、正式图片资产
页面正式 V1 至少需要：
WoW Forever Hero
Class Icon
Spec Icon

不允许最终继续使用：
Spec 名称前两个字母

作为正式视觉。
资产来源优先：
项目已有合法素材
已批准/允许使用的 Blizzard / WoW 素材
项目已有授权素材

禁止：
- 从 Wowhead / Mobalytics 页面复制图片；
- 网络随机抓图；
- AI 随机生成错误职业图标；
- 为了解决图片问题重构整个项目。
如果缺正式素材：
列出缺失清单并 BLOCK，不允许伪造。
二十五、严禁重犯首页图片 P0
禁止从 Final Design / 页面截图里直接裁 Hero、Class Icon、Spec Icon 作为正式资源。
禁止：
UI screenshot crop
baked-in page text
baked-in labels
baked-in buttons
baked-in DOM content

正式图片只负责视觉素材。
页面文字、数字、标签、按钮全部必须是真实 DOM。
禁止把低清设计截图：
AI upscale
2x enlarge
4x enlarge

后冒充高清资源。
不允许 fake upscale。
二十六、图片工程规范
沿用项目当前 Genshin / Homepage 已验证图片体系。
不建立第二套图片系统。
正确链路：
approved high-resolution source
↓
WebP
↓
versioned/content-hashed asset
↓
next/image
↓
sizes/srcset
↓
browser selects correct viewport/DPR variant

不人工维护：
@1x
@2x
@3x

除非项目已有特殊必要用途。
正式图片：
WebP 优先
next/image
正确 width/height 或 fill
稳定 aspect-ratio
正确 sizes

Next.js 已能够生成设备所需响应式候选，不需要自己建立多尺寸图片基础设施。
二十七、图片缓存 / 版本化
新增正式 Hero / Class / Spec 图片优先采用：
content-hash
或
versioned filename

例如：
wow-forever-hero-a1b2c3.webp
warrior-d4e5f6.webp
arms-warrior-89abcd.webp

原则：
图片内容变化
→
URL 也变化

这样浏览器 / CDN 才能安全缓存，并自动 cache bust。
不要新增：
Cloudinary
Imgix
新 CDN
Service Worker image cache
图片数据库
新资产 pipeline

沿用当前项目现有静态资源 / Next Image / Cloudflare 能力。
如果设置长期：
immutable

必须只针对内容已经版本化的资源。
不允许固定裸 URL 内容不断变化却长期 immutable。
二十八、图片加载优先级
Hero 是唯一允许高优先级加载的大型视觉资产。
先检查项目当前 Next.js 版本以及当前 Genshin 已验证实现。
使用当前项目已经采用并验证的一种方式。
不重复叠加：
preload
+
priority
+
多套 fetchPriority

Hero：
唯一大型 preload candidate

Class Icons：
不 preload

Spec Icons：
不 preload

非首屏 Spec：
lazy

Detail 中图片：
按实际选中状态正常加载，不做全量 preload。
禁止几十张 Spec 图 eager load。
不写自定义 JS image loader。
二十九、Responsive Image / sizes
每种图片必须根据真实 CSS layout 设置合理 sizes。
不允许所有图片无脑：
sizes="100vw"

实际检查：
390
768
1024
1280
1440
1920
2560

必须避免：
手机下载 2K 大图
桌面拿超小图片硬拉伸

抽查真实浏览器：
currentSrc
naturalWidth
renderedWidth
encodedBodySize
DPR

不需要开发新的图片分析框架。
使用当前 Playwright / Chromium 即可。
三十、响应式
Desktop：
Class Navigator
+
Tier Board
+
Spec Detail

保持三栏。
重点：
1440
1920
2560

不因为宽屏无限拉宽。
Tablet：
- Tier Board 为主体；
- Class Navigator 可以压缩成紧凑选择；
- Spec Detail → Drawer。
Mobile：
不硬塞三栏。
但必须保留：
Role
Class
Tier Board
Spec Detail Drawer

检查：
信息优先级
card density
字体可读性
Tier Board 扫描效率
Detail usability

不能只验：
没有横向滚动条

三十一、Client Boundary / Server-first
页面核心继续：
Server-first

Tier Board 默认 Context：
必须在服务器输出 HTML 中存在。
禁止把整个：
page.tsx

改成：
"use client"

Client JS 只负责必要交互：
Role switch
Class filter
Spec selection
Detail tabs
Drawer/Dialog

不要把：
Hero
Methodology
Sources
FAQ
static content

全部塞进客户端 bundle。
不引入：
Redux
Zustand
新状态框架
大型 UI framework
chart library

如果轻量 React local state 已足够：
就使用它。
三十二、Query / DB 性能
不允许因为 UI 重构造成：
- 重复 DB 请求；
- 同一个 Context 查询多次；
- Class filter 每次重新请求无关数据；
- 每点击 Spec 重新拉完整榜单；
- 每个 Spec 独立 N+1 请求 evidence。
优先复用：
getGameMetaBoardData
getRecentRatingChanges
当前 evidence query
当前 Forever Logs stored data

当前页面需要的数据尽量由服务器一次组织好。
前端纯展示型：
Class filtering
Spec selection
tabs

应优先本地交互。
三十三、与 Genshin 页关系
可以参考最新：
/genshin-impact/tier-list

已验证的：
Hero/context 层级
Board + Detail
Mobile Detail Drawer
WebP
content-hashed assets
responsive sizes/srcset
Hero preload strategy
avatar lazy loading
responsive visual QA
performance gates

但不要：
直接复制 Genshin 页面为 WoW 页面。
WoW 拥有更强数据能力：
Forever Logs
Performance
Dungeon Breakdown
Rating Changes
Evidence

所以 WoW 应是：
real Meta / Performance Decision Board

不影响 Genshin 页面。
三十四、架构复用
优先继续复用：
getGameMetaBoardData
getRecentRatingChanges

games
game_versions
entities
entity_profiles
ranking_contexts
sources
source_ratings
evidence_observations
ratings
rating_changes

和现有 Forever Logs pipeline。
禁止：
第二套 ranking data store
wow-only database
duplicate queries
Meta Board Domain rewrite
新 ORM
新 state framework

页面 UI 可以 WoW 专属。
底层成熟逻辑继续复用。
三十五、SEO
正式 Route：
/wow-forever/tier-list

Core Tier Board server rendered。
默认 Ranking Context 初始 HTML 可见。
保留：
Title
Meta Description
Canonical
Open Graph
robots
sitemap
semantic H1/H2
appropriate structured data

Query filters：
不得自动成为独立可索引页面。
不新增：
/wow-forever/dps-tier-list
/wow-forever/tank-tier-list
/wow-forever/healer-tier-list

除非以后经过独立关键词验证。
三十六、性能
沿用项目当前性能基础设施。
不建立新体系。
禁止因为设计稿还原引入：
巨大 client bundle
整页 client component
全角色图片 eager load
重复 DB calls
重型 chart library
UI framework
runtime image infrastructure

继续满足项目当前性能门禁：
CLS <= 0.1
LCP <= 2.5s
INP <= 200ms
script budget
oversized-image budget
accessibility
console errors = 0

当前已有：
/wow-forever/tier-list

性能测试。
沿用并补充页面新交互覆盖，不重新建设 performance suite。
三十七、Backend 范围
本轮主要是：
WoW Forever V1 页面正式落地

只允许页面真实展示所必需的最小 backend/data 修正：
Class / Spec mapping
Forever Logs observations read
Enhancement Shaman role edge
stale Dungeon metadata

禁止借本轮：
Ranking Engine rewrite
DB rewrite
CMS
Admin
crawler platform
queue
scheduler
Community backend
Auth
Payment
AI pipeline

如果页面无法完成必须依赖超出范围的 backend 修改：
STOP。
报告：
blocker
required change
affected files

不擅自扩大。
三十八、Shared Header / Footer
必须继续使用整站：
SiteHeader
SiteFooter

不为 WoW 页面复制导航。
不创建第二套 Footer。
不主动修改全站 Header/Footer。
除非存在一个明确共享 bug。
即使存在：
只做最小修复。
三十九、不得主动修改
本轮禁止主动改：
Homepage
Genshin 页面
Better Auth
Login
Registration
Email
Payment
Subscription
Credits
Cloudflare deployment architecture
DNS
Analytics
Other games
SEO new pages
Community
News

四十、数据真实性
任何用户可见事实必须属于：
A. Forever Logs current real data
B. Blizzard current WoW Forever official facts
C. manually reviewed editorial evidence
D. explicit unavailable / pending state

禁止：
- 为 UI 好看编数字；
- 复制 Final Design 数字；
- 用 Retail/Classic 补空；
- 旧 Beta 当 Current；
- 把 Wowhead / Mobalytics 观点直接当 TierListBase fact。
四十一、视觉实现
目标不是：
redesign a better WoW page

而是：
faithfully implement approved Final Design

保持：
黑金 WoW 风格
模块顺序
Tier 色彩
左中右决策工作区
视觉密度

禁止新增：
大动画
3D
video background
glassmorphism redesign
新 marketing section
新 CTA
新信息层

四十二、真实浏览器验收
必须真实 Chromium 验证：
390
768
1024
1280
1440
1920
2560

不能只看单元测试。
至少检查：
Layout
- Header/Footer 正常；
- Hero 不严重裁切；
- 三栏 Desktop 正确；
- 2560 不无限拉宽；
- Mobile Drawer 正常；
- 无 horizontal overflow。
Ranking
- DPS / Tank / Healer 正确；
- Class filter 正确；
- Pending 正确；
- Spec rank 不串；
- selected Spec 与 Detail 一致。
Data
- Score；
- Parse count；
- Dungeon coverage；
- Dungeon Breakdown；
- Evidence；
- rating changes；
全部属于当前 Context。
Images
- Hero 清晰；
- Class/Spec Icons 清晰；
- 无设计稿截图裁片；
- 无 fake upscale；
- Hero 唯一 preload；
- 非首屏图片 lazy；
- 手机不下载异常巨大图片；
- 1920/2560 不用小图硬拉伸；
- 无 CLS。
至少保留：
390
1440
1920

三个完整页面截图作为验收证据。
不引入 Percy / Chromatic / Storybook。
使用现有 Playwright 即可。
四十三、自动测试
至少覆盖：
1. /wow-forever/tier-list SSR 正常；
2. 默认 Dungeon DPS 有真实排名；
3. DPS / Tank / Healer 正确；
4. Class filter 正确；
5. Tier / Pending 正确；
6. Spec Detail 与选中 Spec 一致；
7. Performance 当前 Spec 正确；
8. Dungeon Breakdown 当前 Spec 正确；
9. sample/coverage 不串数据；
10. Evidence 不跨 Context；
11. What Changed 不跨 Context/version；
12. 无假的 source agreement；
13. 无 Community Data；
14. 无 Level 60 / Retail / Classic；
15. Drawer accessibility；
16. canonical 不被 query 污染；
17. default Tier content SSR 可见；
18. Genshin 无 regression；
19. Homepage 无 regression；
20. image loading strategy 正确；
21. 当前 performance gates 正常。
不允许删除/放宽现有测试来让 CI 通过。
四十四、实现前 Gap Audit
不要一上来写代码。
先对照：
Final Design
vs
latest /wow-forever/tier-list

只输出简短 gap：
Existing and reusable:
-
-

Needs modification:
-
-

Missing:
-
-

Data already supported:
-
-

Data not currently supported:
-
-

Image assets available:
-
-

Image assets missing:
-
-

然后直接实施。
不把 Gap Audit 扩展成新的产品方案。
四十五、Git
开发必须：
latest origin/main
→ new branch
→ implementation
→ tests
→ final fetch origin
→ confirm main did not advance
→ rebase/update if required
→ rerun tests
→ open PR

不自动合并 PR。
不 force push main。
不修改其他并行工作。
四十六、最终报告
最终只报告：
Base SHA:

Final origin/main checked:

Branch:

PR:

Main WoW files changed:

Implemented modules:

Real data used:

Pending / N/A fields:

Ranking logic changed:
YES / NO

Database schema changed:
YES / NO

Forever Logs pipeline changed:
YES / NO

If YES, exact reason:

Images:
Hero:
Class icons:
Spec icons:

Image strategy:
WebP:
hashed/versioned assets:
Hero preload:
non-critical lazy:
responsive sizes:

Viewport acceptance:
390:
768:
1024:
1280:
1440:
1920:
2560:

Performance:
CLS:
LCP:
INP:
oversized images:

Tests:

Genshin regression:

Homepage regression:

Remaining issues:

Final:
READY / NOT READY

如果没有剩余问题：
Remaining issues: None

四十七、READY 硬条件
只有下面全部成立才可以写：
READY

1. Final Design 信息架构完整落地；
2. 当前 Forever Beta / Level 30 / Dungeon 范围正确；
3. DPS / Tank / Healer 都是真实 Context；
4. Class Navigator 可用；
5. Tier Board 使用真实数据；
6. Pending 语义正确；
7. Spec Detail 与当前 Spec 对齐；
8. Performance 使用真实数据；
9. Dungeon Breakdown 不串数据；
10. Sources / Evidence 真实；
11. 无假 source agreement；
12. rating_changes 语义正确；
13. 无 change record 不冒充 Stable；
14. 没有 Retail / Classic / Level 60 数据；
15. 没有设计稿示例数字进入 Production；
16. Hero/Class/Spec 正式图片来源合规；
17. 没有设计稿截图裁图；
18. 没有 fake upscale；
19. 正式图片 WebP + next/image；
20. 图片 URL 采用合理版本化/cache-busting；
21. Hero 是唯一大型高优先级图片；
22. 非首屏图片 lazy；
23. responsive sizes/srcset 实际合理；
24. Mobile / Desktop 无异常图片下载；
25. 页面保持 server-first；
26. 没有整页 use client；
27. 没有增加重型库或基础设施；
28. 390–2560 真实浏览器验收通过；
29. 当前性能门禁通过；
30. Genshin / Homepage 无回归；
31. 没有修改本任务范围之外的产品。
任意一项失败：
NOT READY

不得降低标准。
不得通过扩大 V1 范围解决问题。
最终原则
本轮唯一成果必须是：
World of Warcraft: Forever
Current Beta
Level 30
Dungeon
DPS / Tank / Healer
Tier List

路径：
/wow-forever/tier-list

并且同时满足：
Final Design 严格对齐
真实 Forever Logs / reviewed evidence
Server-first
企业级图片加载与缓存实践
企业级响应式与性能实践
不扩散
不过度设计
不进入其他 WoW 版本
不影响其他产品页

任何不能直接帮助完成这一页的工作，都不要做。

## 本轮补充输入（完整保留；外部事实须另行验证）

不是“只设计了页面就完事”。你这份 WoW 提示词里，**数据来源、数据链路、算法口径、证据边界其实已经写得比较深了**：明确要求 `Forever Logs Public API → observations → role/sample filtering → same-dungeon normalization → cross-dungeon aggregation → TierListBase score → Tier → Neon → page`，并且把 `avg_dps / avg_hps / avg_dtps`、median、parses、percentiles、location 等数据都列进去了。粘贴的文本 (1) 同时也明确区分 Forever Logs、Blizzard、Wowhead、Mobalytics 的职责，禁止制造假多源共识。粘贴的文本 (1)

但我刚刚进一步对照了**当前真实代码 + Forever Logs 官方说明 + Blizzard 当前 Beta 说明**。结论是：

> **数据架构足够支撑这个 V1 页面，但现在还不能说“数据准确性已经百分之百闭环”。**
>
> 提示词大约已经覆盖 90%，还必须再加一个“数据发布前硬验收门”。否则开发 AI 可能把现有代码里的旧数据错误原样展示出来。

### 这个页面的数据来源实际上是够的

| 页面需要的数据 | 应该来自哪里 | 是否足够 |
|---|---|---|
| Current Beta / Level Cap / Dungeon availability | Blizzard 官方 Beta Notes | ✅ |
| DPS / HPS / DTPS 表现 | Forever Logs Public API | ✅ |
| Median / Parses / Percentiles | Forever Logs | ✅ |
| Dungeon Breakdown | Forever Logs aggregate statistics | ✅ |
| Dungeon Coverage | Forever Logs observations | ✅ |
| Relative Performance Score | TierListBase 对 Forever Logs 数据计算 | ✅ |
| S/A/B/C/Pending | TierListBase 明确 Tier Bands | ✅ |
| Spec Rank | 当前 Role 内按真实 Score 排序 | ✅ |
| Why This Tier | Score + sample + coverage 的数据解释 | ✅ |
| Tier Changes | `rating_changes` | ✅ |
| Blizzard balance/context | Blizzard 官方来源 | ✅ |
| Wowhead / Mobalytics editorial | 只有审核并入库后才可展示 | ✅，但不是当前核心排名数据 |

Forever Logs 自己明确说，公共 API 就是给第三方 Tier List、spec guide、Discord bot 这类产品使用的，并提供站点使用的 aggregate statistics；公开展示要求明显归因并链接回 Forever Logs。[Forever Logs](https://foreverlogs.gg/faq?utm_source=chatgpt.com)

所以**Forever Logs 作为这张 WoW 页面主要 Performance 数据源，是成立的**。不是我们想象出来的用途。

---

### 但我发现了 4 个必须真正解决的数据准确性问题

**第一，当前代码里 Dungeon metadata 已经有一处明确过期。**

当前代码还是：

```text
Excavation Site: Wetlands
24–29
```

但 Blizzard 当前官方 Beta Notes 明确是：

```text
Excavation Site: Wetlands (26–31)
Razorfen Downs (25+)
Uldaman (30+)
```

并且 10 月 8 日又明确开放了新的 `City of Dalaran` dungeon。[暴雪论坛](https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-8/2360696)

你的提示词已经发现了这个问题，但不能只写：

> 如果要显示就检查。

应该进一步要求：

> **开发前必须把当前参与 ranking 的 Dungeon Scope 与 Blizzard 官方当前 Beta 状态核对一次。发现 metadata 不一致必须最小修正后才能 READY。**

否则页面虽然“有数据”，但 Context 本身可能错。

---

**第二，Tank Role 目前存在真实冲突，而且原提示词里的“Enhancement Shaman Tank”本身也值得纠正。**

当前代码的 `TANK_SPECS` 只有：

```text
Druid Guardian
Druid Feral Combat
Paladin Protection
Warrior Protection
```

没有 Shaman。

而 Forever Logs 当前 FAQ 明确写的是 Shaman Tank Spec：

```text
Earthen Guardian
```

不是我们提示词里之前写的 `Enhancement Shaman Tank`。Forever Logs 还明确说明 Tank 是按 encounter 检测的角色，而不是简单角色静态标签。[Forever Logs](https://foreverlogs.gg/faq?utm_source=chatgpt.com)

所以这里不能继续写死：

> 检查 Enhancement Shaman Tank。

应该改成：

> **检查 Forever Logs 当前 live spec/role taxonomy；Shaman Tank 以 Forever Logs 当前实际返回和官方角色定义为准，不允许沿用历史静态推断。**

这就是你说的“不是有没有数据，而是数据准确不准确”。

---

**第三，Current Beta / Phase 现在的代码还存在硬编码风险。**

当前 pipeline 确实会先调用：

```text
/phases
```

查 active phase。

这很好。

但真正 publish DB 时，代码又固定写：

```text
version = Beta 2026-10-08
versionId = wow-forever | beta | 2026-10-08 | level-30
status = current
```

也就是说：

> API 已经能知道 active phase，
> 但数据库 Version 仍然可能固定在 10 月 8 日。

如果明天 Forever Beta phase 发生变化而代码没同步：

**页面可能仍然显示旧版本为 Current。**

所以必须补一个硬规则：

> 发布前比较 Forever Logs active phase、Blizzard 当前 Beta context 和 DB current version；三者不能合理对应时不得自动发布为 `Current`，只能 BLOCK / Preliminary / Stale。

这才是真正的数据 freshness gate。

---

**第四，“Level 30”的语义必须非常准确。**

这是最容易让用户误解的一点。

当前代码自己已经承认：

> Forever Logs aggregate statistics **没有 player-level filter**。

也就是说我们能确认的是：

```text
当前 Beta level cap = 30
+
选择 near-cap dungeons
```

但不能声称：

```text
这些 parse 全都是 Level 30 玩家
```

所以页面正确表述应该是：

```text
Level 30 Beta context
Near-cap Dungeon performance
```

而不是：

```text
Level 30 players only
```

这一点如果写错，数据是真的、统计也是真的，但**结论的语义仍然会失真**。

---

## 还有一个必须补：Forever Logs attribution

Forever Logs 官方条款明确要求：

> Public display requires visible attribution linking back to Forever Logs. [Forever Logs](https://foreverlogs.gg/docs/api?utm_source=chatgpt.com)

所以 `Sources & Evidence` 里不能只写文字：

```text
Forever Logs
Primary Performance Data
```

必须有真实可访问链接回 Forever Logs。

这应该成为 READY 条件，而不是可选 UI。

---

## 所以，“这些数据真的够支撑页面吗？”

**够。**

但要准确理解“够”：

这套数据足够支撑：

```text
WoW Forever
Current Beta
Dungeon
DPS / Tank / Healer

Performance ranking
Tier
Rank
Score
Parses
Coverage
Dungeon Breakdown
Pending
Data freshness
Ranking movement
Evidence
```

也就是我们当前这个 **Performance Decision Board**。

它**不够支撑**：

```text
Best for Beginners
Most Versatile
Best Build
Best Gear
Best PvP
Best Raid
Pull Recommendation
完整专家主观结论
```

而你的提示词已经明确禁止这些，所以**业务范围和数据能力实际上是匹配的**。这点非常关键。

---

### 我建议给最终提示词再补一个“数据准确性硬门禁”

直接增加下面这一段即可，不需要重写整份提示词：

> **Data Accuracy / Publication Gate**
>
> 本页面不能因为 API 能返回数据就直接视为 READY。
>
> 发布前必须验证：
>
> ```text
> 1. Forever Logs active phase 与当前 Beta context 一致；
> 2. Blizzard 官方当前 Level Cap / Dungeon availability 已核对；
> 3. 所有参与 ranking 的 dungeon metadata 未过期；
> 4. DPS / Healer / Tank 的 spec-role mapping 与 Forever Logs 当前 live taxonomy 一致；
> 5. 不使用历史静态 role map 覆盖 live data；
> 6. 当前页面不得把 near-cap dungeon aggregate data 描述成“仅 Level 30 玩家数据”；
> 7. API payload 必须通过现有 parser/schema validation；
> 8. retrievedAt / checkedAt / freshnessStatus 必须真实；
> 9. active phase / DB current version 无法对应时禁止标记 Current；
> 10. Forever Logs 必须在页面显式 attribution 并提供有效链接；
> 11. Blizzard facts 必须来自当前官方 Forever Beta source；
> 12. Editorial evidence 未审核/未入库，不允许进入 Ranking explanation；
> 13. 任何数据存在冲突时，优先显示 Pending / Preliminary / Stale，而不是猜测。
> ```
>
> 发现任一关键 Context / Role / Version / Source mismatch：
>
> ```text
> NOT READY
> ```
>
> 不允许通过前端文案掩盖数据问题。

加上这一段以后，我才会说：

> **这不是“设计了一张 WoW 页面”，而是已经把“数据从哪里来、怎么计算、哪些能说、哪些不能说、什么情况下不能发布”一起锁死了。**

也就是你真正要的：**页面业务和数据能力是一体的，而不是 UI 先做完，数据以后再说。**
