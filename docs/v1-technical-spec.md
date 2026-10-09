# TierListBase V1.0 技术方案冻结文档

> Status: **LOCKED**
>
> Version: **V1.0**
>
> Locked on: **2026-10-09**
>
> 本文是 TierListBase V1.0 的正式技术基线。V1 实现不得擅自替换核心技术栈、引入 Auth / Payment / Community 等未批准子系统，或为了未来需求提前过度设计。

## 1. V1 技术目标

技术方案只服务一个产品目标：

> **稳定、可维护、可 SEO 地交付一个以 Neon 数据库驱动的 WoW Forever Tier List。**

V1 不追求平台化基础设施完整度。

## 2. 锁定技术栈

V1 正式技术栈：

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Hosting:** Vercel
- **Database:** Neon PostgreSQL
- **Database Driver:** `@neondatabase/serverless`
- **ORM / Schema:** Drizzle ORM
- **Migrations:** Drizzle Kit
- **Repository:** GitHub `pyxm1618/tierlistbase`
- **Production source of truth:** GitHub `main`
- **Rendering:** Server-first
- **SEO:** SSR / Server Components / 可缓存服务端 HTML

禁止使用已 sunset 的 `@vercel/postgres`。

## 3. Neon 从 V1 开始即为正式数据库

V1 不采用“先静态 JSON、以后再迁移数据库”的方案。

Neon 从第一版开始保存正式业务数据。

原因：

- Tier 数据会持续更新
- 必须保留 Version / Build
- 必须保留 Sources
- 必须保留 Source Ratings
- 必须形成 Consensus
- 必须保留 Tier Changes
- 后续扩第二个游戏时必须复用同一结构

## 4. V1 数据模型

V1 至少建立以下表。

### 4.1 games

保存游戏级信息。

核心字段：

- id
- slug
- name
- publisher
- current_version_id
- created_at
- updated_at

V1 只有一条核心游戏记录：

- World of Warcraft: Forever

### 4.2 game_versions

保存 WoW Forever Build / Version。

核心字段：

- id
- game_id
- version
- build
- status
- release_date
- notes
- created_at

### 4.3 entities

保存可排名对象。

WoW Forever 中 Entity 主要是：

- Class
- Spec

核心字段：

- id
- game_id
- parent_entity_id
- entity_type
- slug
- name
- role
- status

### 4.4 ranking_contexts

保存排名场景。

V1 固定包含：

- overall
- leveling
- dps
- tank
- healer
- solo
- pvp

核心字段：

- id
- game_id
- slug
- name
- description

### 4.5 sources

保存来源。

核心字段：

- id
- name
- url
- source_type
- published_at
- updated_at_source
- checked_at
- freshness_status

### 4.6 source_ratings

保存某个来源对某 Entity 在某 Context 下的原始评级。

核心字段：

- id
- source_id
- entity_id
- ranking_context_id
- game_version_id
- raw_tier
- raw_rank
- normalized_score
- normalized_tier
- collected_at

### 4.7 ratings

保存 TierListBase 最终发布评级。

核心字段：

- id
- entity_id
- ranking_context_id
- game_version_id
- tier
- consensus_score
- source_count
- agreement_level
- freshness_status
- why_this_tier
- strengths
- constraints
- published_at
- updated_at

### 4.8 rating_changes

保存评级变化历史。

核心字段：

- id
- rating_id
- entity_id
- ranking_context_id
- game_version_id
- previous_tier
- new_tier
- reason
- changed_at

## 5. Consensus 机制

V1 使用透明、确定性的规则。

基本流程：

```text
Source Rating
→ Version / Freshness Filter
→ Source-specific Normalization
→ Normalized Score
→ Aggregation
→ Consensus Tier
→ Human Review
→ Published Rating
```

V1 不使用：

- Machine Learning
- LLM 自动决定 Tier
- 黑箱评分算法

当来源冲突明显时，必须保留并展示 disagreement。

## 6. 数据写入方式

由于 V1 明确没有 Login / Auth，因此：

> **V1 不开发 Web Admin。**

数据维护通过开发者侧完成：

- Drizzle migrations
- Seed scripts
- Import scripts
- Manual reviewed data files / scripts
- Neon console 仅用于必要维护

所有可重复的数据变更应优先进入仓库脚本，而不是长期依赖手工 SQL。

V2 再评估是否需要带认证的 Admin。

## 7. 数据读取方式

生产页面只需要公开读取已发布 Tier 数据。

原则：

- 数据库访问只发生在 server side
- `DATABASE_URL` 不得暴露到浏览器
- 不在 Client Component 中直接连接 Neon
- SQL / ORM 查询必须参数化
- 公共页面不提供写接口

## 8. Neon / Drizzle 连接规范

使用：

- `@neondatabase/serverless`
- `drizzle-orm/neon-http`

采用延迟初始化 DB client，避免在缺少环境变量时于 build evaluation 阶段直接崩溃。

环境变量：

```text
DATABASE_URL
```

通过 Vercel Project Environment Variables 管理。

禁止：

- 将连接字符串提交到 GitHub
- 在 `NEXT_PUBLIC_*` 中放数据库凭证

## 9. 页面渲染

核心 Tier List 内容必须服务端输出。

推荐结构：

- Server Components：读取 Tier 数据、Sources、Version
- Client Components：只负责 Tabs、Filters、Expand/Collapse 等交互

核心 SEO 内容不得依赖浏览器 JS 执行后才出现。

页面可以使用 Next.js 缓存 / revalidation，但数据库仍然是唯一数据源。

## 10. 页面范围

V1 只实现：

```text
/
/wow-forever/tier-list/
```

以及必要的边缘页面：

- About
- Methodology
- Privacy
- Terms / Disclaimer
- 404

不创建其他游戏 Route。

## 11. SEO 技术要求

必须实现：

- Next.js Metadata API
- Unique title
- Meta description
- Canonical
- Open Graph
- robots.txt
- sitemap.xml
- semantic HTML
- server-rendered H1/H2
- crawlable internal links
- stable URLs
- visible version/build
- visible last updated
- appropriate structured data only when semantically valid

禁止：

- 客户端渲染空壳
- 为筛选参数批量制造 indexable duplicate pages
- 自动生成大量薄页面
- 虚假 Schema

## 12. Create Web 的定位

Create Web 可以用于：

- 视觉探索
- 页面脚手架
- UI 原型
- 初步组件生成

但它不是独立的运行时依赖，也不是技术架构来源。

任何 Create Web 生成的代码最终必须：

1. 写入 GitHub 仓库；
2. 符合本技术文档；
3. 使用锁定技术栈；
4. 接入 Neon；
5. 通过正常 CI / Build；
6. 不私自增加 Auth、Payment 或其他系统。

如果 Create Web 输出与本文件冲突：

> **以本文件为准。**

## 13. Vercel 部署

生产部署：

- Source: GitHub
- Production branch: `main`
- Hosting: Vercel

继续保持：

- 非 `main` 分支不自动触发正式部署
- `main` 为 Production source of truth

V1 不需要复杂多环境发布系统。

## 14. V1 明确不引入的技术系统

以下技术全部不属于 V1：

- Better Auth
- NextAuth / Auth.js
- Clerk
- OAuth
- Session Store
- Stripe
- Payment Webhook
- Subscription System
- Redis
- Queue
- Realtime
- WebSocket
- AI SDK
- LLM Ranking Pipeline
- Vector Database
- Search Engine Cluster
- CMS
- Public Admin
- Community System
- User-generated Content Backend
- General-purpose Crawler Platform

除非 V1 产品需求文档正式变更，否则不得加入。

## 15. 数据采集技术边界

V1 允许：

- 官方公开数据
- 手工整理
- 半自动脚本
- 合法 API
- 少量可审计抓取
- 多来源人工审核

V1 不建设：

- 大规模爬虫平台
- 自动全网采集
- 高频实时更新系统

数据优先级：

> Correctness > Traceability > Automation

## 16. 测试与 CI

V1 至少要求：

- lint
- TypeScript typecheck
- unit tests for normalization / consensus logic
- database schema / migration validation
- production build
- basic page smoke test

关键逻辑必须有测试：

- Tier normalization
- Consensus aggregation
- Freshness calculation
- Context filtering

## 17. 性能原则

V1 目标：

- 首屏不依赖重型客户端 JS
- 数据展示以 Server Components 为主
- 图片优化
- 避免不必要第三方脚本
- 不为动画牺牲 Core Web Vitals

V1 不做为了性能分数而进行的过度架构。

## 18. 安全原则

由于无账号、无支付，V1 攻击面应保持很小。

必须保证：

- 所有 Secrets server-only
- 数据库无客户端直连
- 无公共写入端点
- 输入参数校验
- DB 查询参数化
- 依赖版本保持受支持状态

## 19. V1 技术验收标准

V1 技术完成必须同时满足：

1. Next.js + TypeScript 正常 build。
2. Vercel 可从 `main` 部署。
3. Neon 已真实接入。
4. Drizzle schema 和 migrations 可重复执行。
5. 核心 Tier 数据真实来自 Neon，而不是硬编码前端数组。
6. 首页可正常读取并展示当前游戏状态。
7. WoW Forever Tier List 服务端输出核心数据。
8. Ranking Context 可切换。
9. Sources / Version / Freshness 可追溯。
10. Consensus 逻辑有测试。
11. SEO 基础设施完整。
12. 无 Auth / Login / Payment 代码或依赖。
13. 无其他游戏功能。
14. Production 不依赖 Create Web 平台运行。

## 20. 技术变更规则

V1 实现期间，如有人提出替换以下任一项：

- Next.js
- Vercel
- Neon
- Drizzle
- GitHub source of truth
- 无 Auth
- 无 Payment
- 单游戏范围

必须先修改并重新批准本文。

未经修改本文：

> **技术范围保持冻结。**
