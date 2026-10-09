# TierListBase V1.0 技术方案冻结文档

> Status: **LOCKED — REVISED FROM END-STATE**
>
> Version: **V1.0**
>
> Revised on: **2026-10-09**
>
> 本文是 TierListBase V1.0 的正式技术基线，与 `docs/v1-requirements.md` 配套。

## 1. 技术目标

V1 技术只服务一个目标：

> **稳定、快速、可 SEO、可追溯地交付一个 Neon 驱动的 WoW Forever Tier List / 最小 Game Meta Board。**

技术设计必须支持：

- 当前 Ranking
- Context Filters
- Source Evidence
- Consensus
- Version / Build
- Ranking History
- SEO keyword pages when validated

不为 V2+ 功能提前建设复杂平台。

---

## 2. 锁定技术栈

V1：

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Hosting:** Vercel
- **Database:** Neon PostgreSQL
- **Driver:** `@neondatabase/serverless`
- **ORM:** Drizzle ORM
- **Migrations:** Drizzle Kit
- **Repository:** GitHub `pyxm1618/tierlistbase`
- **Production branch:** `main`
- **Rendering:** Server-first
- **SEO:** SSR / Server Components / cached server HTML

禁止使用已 sunset 的 `@vercel/postgres`。

---

## 3. Neon 从 V1 即为正式数据源

V1 不允许把正式 Tier 数据长期硬编码在：

- React arrays
- JSON fixtures
- static TypeScript constants

Neon 必须保存正式业务数据。

原因：

- Ranking 会随 Build 变化；
- Context 不止一个；
- Source 需要追溯；
- Consensus 需要计算；
- History 必须保留；
- 后续 validated SEO pages 需要复用同一数据源。

---

## 4. V1 数据模型

### 4.1 games

核心字段：

- id
- slug
- name
- publisher
- status
- current_version_id
- created_at
- updated_at

V1 只有 World of Warcraft: Forever。

### 4.2 game_versions

核心字段：

- id
- game_id
- version
- build
- level_cap
- status
- release_date
- valid_from
- valid_to
- notes
- created_at

用于明确：

> 一个 Ranking 到底属于哪个 Patch / Build / Level。

### 4.3 entities

保存 Class / Spec。

字段：

- id
- game_id
- parent_entity_id
- entity_type
- slug
- name
- role
- status
- sort_order

### 4.4 ranking_contexts

V1 不再把 Context 仅理解成一个简单 slug。

至少支持：

- id
- game_id
- slug
- mode
- role
- level_cap
- label
- status

WoW V1 的主要 context：

- overall
- leveling
- dungeon
- pvp

Role：

- all
- dps
- tank
- healer

Context 必须可用于真实数据库查询与 Consensus 计算，而不是只做前端 UI 状态。

### 4.5 sources

字段：

- id
- name
- url
- source_type
- publisher
- published_at
- updated_at_source
- checked_at
- freshness_status
- notes

`source_type` V1 至少区分：

- expert / editorial
- data
- aggregator

不建立 Community source。

### 4.6 source_ratings

字段：

- id
- source_id
- entity_id
- ranking_context_id
- game_version_id
- raw_tier
- raw_rank
- raw_score
- normalized_score
- normalized_tier
- source_sample_size
- collected_at
- notes

### 4.7 ratings

保存正式发布的 TierListBase Ranking。

字段：

- id
- entity_id
- ranking_context_id
- game_version_id
- tier
- consensus_score
- source_count
- agreeing_source_count
- disagreement_level
- data_status
- freshness_status
- why_this_tier
- strengths
- constraints
- published_at
- updated_at

注意：

- `consensus_score` 可用于内部算法；
- UI 不得把它直接包装成“82.7% 可信度”；
- 用户侧优先展示来源数量、agreeing sources、freshness、data availability。

### 4.8 rating_changes

字段：

- id
- entity_id
- ranking_context_id
- from_version_id
- to_version_id
- previous_tier
- new_tier
- change_type
- reason
- evidence
- changed_at

### 4.9 seo_pages

V1 允许为真实验证过的 WoW 关键词增加独立页面，因此需要轻量页面配置层。

字段：

- id
- game_id
- slug
- primary_keyword
- search_intent
- ranking_context_id
- title
- meta_description
- canonical_path
- index_status
- status
- created_at
- updated_at

规则：

- 只允许人工批准创建；
- 不允许批量自动生成；
- 页面必须对应真实独立搜索意图；
- 不得为普通 filter state 自动创建 SEO page。

---

## 5. Consensus

流程：

```text
Source Rating
→ Version / Build / Level match
→ Freshness filter
→ Source-specific normalization
→ Aggregation
→ Disagreement calculation
→ Human review
→ Published Rating
```

V1 不允许：

- LLM 自动决定最终 Tier
- 黑箱 ML 排名
- 直接平均字符串 Tier
- 把 Community 投票混入正式 Tier

当来源分歧明显时，必须保留该分歧。

---

## 6. Data 与 Expert 分离

数据模型必须允许：

- Expert / Editorial Rating
- Real performance data

分别存在。

如果真实统计数据不存在：

- `data_status = unavailable`
- 页面明确显示“暂无可靠数据”

不得用编辑意见假装 Data。

Community 属于后续版本，不进入 V1 数据链路。

---

## 7. 数据写入与更新

V1 无 Auth，因此不做公共 Web Admin。

数据维护通过：

- Drizzle migrations
- Seed scripts
- Import scripts
- Source ingestion scripts
- Human-reviewed publish scripts
- 必要时 Neon console

原则：

> **Correctness > Traceability > Automation**

每次可重复更新应尽量脚本化。

V1 不建设：

- 大规模 crawler platform
- real-time ingestion
- queue system

---

## 8. 页面与 Route

V1 必须：

```text
/
/wow-forever/tier-list/
```

允许在真实关键词验证后新增：

```text
/wow-forever/<validated-keyword-page>/
```

例如：

```text
/wow-forever/dps-tier-list/
```

但技术上必须通过 `seo_pages` 或等价显式配置批准，不能由 filter 参数自动派生成可索引页面。

---

## 9. Tier Board 渲染

核心 Tier Board 必须：

- 服务端输出默认 Context；
- HTML 中直接存在核心实体与 Tier；
- 不依赖浏览器 JS 才出现主内容。

Client Components 仅负责：

- Mode / Role / Level filter interaction
- Drawer / Expand
- lightweight transitions

筛选后的即时视图可以 client-side 更新，但默认 SEO 内容必须 server-rendered。

---

## 10. Filter 与 URL

普通交互筛选：

- 可以使用本地 state 或非索引 query state；
- 不应自动创建 crawlable duplicate URL。

当某个筛选组合被升级成独立 SEO page：

- 使用稳定 path；
- Unique title / description；
- canonical 自指；
- 服务端直接渲染该 Context；
- 页面内容必须具有独立价值。

---

## 11. Class / Spec Detail

V1 通过 Drawer / Expand 实现，不要求独立实体页面。

详情数据必须来自 DB：

- rating
- context
- why_this_tier
- strengths
- constraints
- source evidence
- latest change

不创建完整 Wiki 数据模型。

---

## 12. Evidence / Trust UI

技术层必须提供足够数据支持这些用户可见字段：

- source_count
- agreeing_source_count
- disagreement_level
- freshness_status
- source date range
- build match
- data_status
- change history

禁止前端自行发明“可信度分数”。

如未来需要综合置信模型，必须另行批准并公开方法。

---

## 13. Change Tracking

每次发布新 Rating 时：

1. 找到前一有效 Rating；
2. 比较 tier / context / version；
3. 如发生有效变化，写入 `rating_changes`；
4. 保存 reason / evidence；
5. 前端展示最近变化。

不能通过覆盖旧行来丢失历史。

---

## 14. SEO 技术要求

必须：

- Next.js Metadata API
- unique Title
- Meta Description
- Canonical
- Open Graph
- robots.txt
- sitemap.xml
- semantic HTML
- server-rendered H1/H2
- crawlable internal links
- visible Patch / Build / Updated
- valid structured data only
- no fake schema
- no indexable empty filter pages
- no mass thin pages

核心目标词页面：

> `/wow-forever/tier-list/`

必须天然围绕 `wow forever tier list` 服务端输出内容。

---

## 15. 首页技术要求

首页从 DB 读取：

- 当前支持游戏
- 当前版本
- last updated
- 主要 Tier List 入口

V1 只有 WoW Forever。

不得生成空白未来游戏卡片对应的 indexable route。

---

## 16. Create Web 的边界

Create Web 可以用于：

- 页面设计探索
- 组件草图
- UI scaffold

但所有正式代码必须：

1. 进入 GitHub；
2. 符合本文架构；
3. 使用 Neon 正式数据；
4. 通过 CI / build；
5. 不引入未批准 Auth / Payment / Community。

Production 不依赖 Create Web 平台运行。

---

## 17. V1 不引入的系统

不引入：

- Better Auth
- Auth.js
- Clerk
- OAuth
- Session Store
- Stripe
- Payment
- Subscription
- Redis
- Realtime
- WebSocket
- Community backend
- Comments
- Vote system
- User profiles
- AI SDK
- LLM ranking pipeline
- Vector DB
- Search cluster
- CMS
- Public Admin
- General-purpose crawler platform

---

## 18. 测试与 CI

至少：

- lint
- TypeScript typecheck
- unit tests
- DB schema validation
- migration validation
- production build
- core page smoke test
- SEO metadata tests

关键逻辑测试：

- source normalization
- consensus aggregation
- disagreement calculation
- freshness calculation
- context filtering
- rating change generation
- SEO page whitelist / no accidental indexable filter pages

---

## 19. 性能

目标：

- Tier Board 首屏 server-rendered
- 避免重型 client bundle
- Filter / Drawer 按需交互
- 图片优化
- 无不必要第三方脚本
- 不为了动画牺牲 Core Web Vitals

动效只用于：

- hover
- filter transition
- drawer
- loading / state feedback

不做装饰性重动画。

---

## 20. 安全

V1 无账号、无支付、无公共写接口。

必须：

- Secrets server-only
- `DATABASE_URL` 不暴露客户端
- 参数化查询
- 输入校验
- import/publish scripts 明确权限边界
- 依赖使用受支持版本

---

## 21. V1 技术验收

V1 完成必须同时满足：

1. Next.js + TypeScript 可正常 build；
2. Vercel 从 `main` 正常生产部署；
3. Neon 已真实接入；
4. Drizzle migrations 可重复执行；
5. 正式 Tier 数据来自 Neon；
6. `/wow-forever/tier-list/` 服务端输出完整默认 Tier Board；
7. Mode / Role / Level Context 可真实查询；
8. Class / Spec Drawer 数据来自 DB；
9. Source / Version / Freshness / Disagreement 可追溯；
10. Rating Changes 可生成并展示；
11. 无伪造 confidence score；
12. SEO 基础设施完整；
13. 普通 filters 不产生可索引重复页；
14. 新 SEO 子页必须通过明确 whitelist / config；
15. 无 Auth / Payment / Community 系统；
16. 无其他游戏功能；
17. Production 不依赖 Create Web。

---

## 22. 技术变更规则

以下核心决策若要修改，必须先改本文并重新批准：

- Next.js
- Vercel
- Neon
- Drizzle
- GitHub `main` source of truth
- keyword-driven SEO route strategy
- no Auth
- no Payment
- no Community in V1
- single-game V1 scope

未经修改本文：

> **V1 技术范围保持冻结。**
