# TierListBase 技术方向与关键难点

> 状态：**方向说明 — 已对齐 V1 正式技术基线**
>
> 更新：2026-10-09
>
> **执行权威不是本文。** V1 开发必须以 `docs/v1-technical-spec.md` 为正式技术基线，并以 GitHub `pyxm1618/creat-web` 0.2.3 为通用 Web 技术底座。本文只保留 TierListBase 的产品技术难点和领域判断；如与正式技术基线冲突，以正式技术基线为准。

## 1. 当前技术结论

TierListBase V1 不是从零搭建一个新 Web 技术平台。

正确结构是：

```text
Create Web 0.2.3
→ TierListBase 产品配置
→ TierListBase 产品模块
→ TierListBase 业务数据模型
→ WoW Forever Game Meta Board
```

Create Web 已负责并继续负责：

- Next.js / TypeScript / Bun 基础工程；
- postgres.js + Drizzle；
- migration pipeline；
- SEO Route Registry；
- 安全、CSP 与环境边界；
- Feature Flags；
- 测试、性能、E2E、release gates；
- Vercel 通用运行约定。

TierListBase 不重复建设这些基础设施。

## 2. TierListBase 真正需要开发的技术资产

真正的产品技术资产是：

> **结构化 Ranking 数据 + Context + Version + Sources + Normalization + Consensus + History。**

核心关系：

> **Entity × Context × Version → Rating**

V1 只服务 World of Warcraft: Forever，但数据结构不应把 Class / Spec、Context、Version 写死成无法扩展的页面常量。

## 3. V1 数据责任

Neon PostgreSQL 从 V1 开始保存正式业务数据：

- Game
- Game Version / Build / Level Cap
- Class / Spec Entity
- Ranking Context
- Source
- Source Rating
- Published Rating
- Rating Change

正式 Tier 数据不得长期存在于 React array、JSON fixture 或静态 TypeScript 常量中。

数据库服务商是 Neon；数据库连接和 ORM 方案严格沿用 Create Web 0.2.3：

- `postgres`
- `drizzle-orm/postgres-js`
- Drizzle Kit migrations

不另建 Neon 专属驱动体系。

## 4. 数据标准化

不同来源可能使用：

- T0 / T1 / T2
- SS / S / A
- S+ / S / A
- 数值排名

因此需要可解释的 source-specific normalization。

基本链路：

```text
Source Rating
→ Build / Version / Level match
→ Freshness
→ Source-specific normalization
→ Consensus
→ Disagreement
→ Human review
→ Published Rating
```

不得直接平均 Tier 字符串，也不得让 LLM 自动决定正式 Tier。

## 5. Freshness 与 History

每个正式 Ranking 必须能回答：

- 对应哪个 Patch / Build / Level？
- 来源什么时候发布/更新？
- 当前是否 Current / Preliminary / Stale？
- 上一次是什么 Tier？
- 为什么变化？

Ranking Change 是结构化业务数据，不是临时文章。

## 6. Trust

V1 的信任表达应使用可验证事实：

- Source count
- Agreeing source count
- Source date range
- Build match
- Freshness
- Data available / unavailable
- Disagreement

不使用“82.7% Meta Confidence”这类无法验证的神秘分数。

Expert / Editorial、真实 performance data 与未来 Community 必须概念分离。

## 7. 数据维护

V1 没有 Auth，也没有 Public Admin。

数据维护采用：

- Seed / Import scripts
- Source ingestion scripts
- Human-reviewed publish scripts
- Drizzle migrations
- 必要时 Neon Console

原则：

> **Correctness > Traceability > Automation**

早期不建设管理后台、通用爬虫平台、实时队列或完整 CMS。

## 8. SEO 技术边界

SEO 仍然属于 Create Web，而不是 TierListBase 自己重新发明。

页面定义统一进入：

- `src/config/routes.config.ts`
- `src/config/seo.config.ts`
- `src/config/seo-landings.config.tsx`

不建立 `seo_pages` 数据库表作为第二套页面注册系统。

V1 主页面：

```text
/wow-forever/tier-list
```

Create Web 使用 `trailingSlash: false`，Canonical、Sitemap、内部链接统一采用无尾部斜杠 URL。

只有真实关键词与独立用户任务得到验证后，才新增 WoW SEO 子页。普通 filter state 不自动生成可索引页面。

## 9. 产品代码边界

TierListBase 产品逻辑遵循 Create Web 的产品模块规则：

```text
src/modules/<product>/
  domain/
  ui/
  index.ts
```

TierListBase-specific Ranking 规则不能污染通用 platform 层。

如果实现正式业务 schema 时发现 starter 缺少通用的产品 schema 组合能力，只允许做最小、通用、经过测试的底座扩展；不能因此另起数据库架构。

## 10. Feature 与部署边界

V1：

- Auth OFF
- Email OFF
- Commerce OFF
- Subscription OFF
- Credits OFF
- Community 不建设
- Analytics 默认 OFF，另行批准后再开启

“OFF”表示使用 Create Web 的 Feature Flag 关闭，并不意味着删除已经验证的通用模块。

TierListBase 保持自己的 Vercel Git 部署策略：

- 仅 `main` 自动部署；
- 非 main 分支不自动部署；
- 不复制 V1 不需要的 Commerce / Credits / Account cron。

## 11. V1 核心技术验收

V1 技术上至少要证明：

1. Create Web 0.2.3 基线被正确继承；
2. Neon + postgres.js + Drizzle 正常运行；
3. migrations 可从空库和既有基线安全前进；
4. 正式 Tier 数据来自数据库；
5. 默认 Tier Board 服务端渲染；
6. Mode / Role / Level / Build 是真实 Ranking Context；
7. Source / Freshness / Disagreement 可追溯；
8. Ranking History 可生成和展示；
9. Create Web SEO Route Registry 正常工作；
10. filters 不制造重复索引页；
11. Auth / Commerce 等 V1 非需求保持关闭；
12. Create Web 的安全、性能、E2E 和 release gates 没有被削弱。

## 12. 当前开发顺序

```text
对齐 Create Web 基线
→ 建立 TierListBase 产品模块与业务 schema
→ 接 Neon
→ 导入 WoW Forever 基础事实
→ 实现 Context / Source / Normalization / Consensus
→ 实现默认 Tier Board
→ 实现详情与 Changes
→ 完成 SEO / 性能 / E2E
→ Production 验收
```

V1 不因为未来可能支持其他游戏、社区或付费而提前扩大范围。
