# 8016 Vanguard Monument — 技术设计文档

**项目：** TierListBase · WoW Forever 玩家先锋纪念碑  
**版本：** 1.1 · Development Baseline  
**日期：** 2026-10-19  
**仓库：** pyxm1618/tierlistbase  
**基线：** main @ 214c7f93feded0c0b84fd5cf98618e9637a81579  
**活动页：** /wow-forever/vanguard  
**核心业务页：** /wow-forever/tier-list  

---

## 0. 技术原则

Vanguard 是 TierListBase 内页。

必须在现有项目边界内扩展，不拆独立站，不重做基础设施。

继续使用：

- Bun
- Next.js
- React
- TypeScript
- PostgreSQL
- Drizzle
- Better Auth
- Google OAuth
- 现有 SEO
- 现有 Analytics / Consent
- 现有 Security / CSP
- 现有 CI / Playwright / Vitest
- 现有 Marketing Layout
- 现有 SiteHeader / SiteFooter
- 现有 WoW Forever Tier List 数据体系

新增范围只包括：

- Vanguard 业务模块
- Three.js 2.5D Monument
- Cloudflare R2 媒体存储
- Cloudflare Workers AI Clef Flash 自动图片审核
- Vanguard Report 邮件通知

当前版本不实现技术补位、system_fill、自动补满脚本或相关后台；该问题留给后续运营决策，不进入 V1 开发范围。

禁止新增：

- 第二套账户系统
- 第二数据库
- 独立 Vanguard Admin
- CMS
- 人工审核后台
- Password Auth
- Email Magic Link
- 独立 SEO 体系
- 独立 Header / Footer
- WebSocket / Realtime 基础设施

---

## 1. 已确认的外部时间基线

Blizzard 官方确认 WoW Forever 全球上线时间：

**2026-11-04 15:00 PST**

即：

**2026-11-04T23:00:00Z**

官方来源：

World of Warcraft — “Pre-Purchase World of Warcraft: Forever Upgrades and Begin Your Next Journey in Azeroth”

https://worldofwarcraft.blizzard.com/en-gb/news/24301508

Vanguard 活动的最终 Claim 截止时间固定使用 UTC：

**EVENT_CLOSE_AT = 2026-11-04T23:00:00Z**

不要使用浏览器本地日期判断。

所有服务端写 API 统一以服务器当前 UTC 时间与 EVENT_CLOSE_AT 比较。

---

## 2. 当前仓库基线

当前项目已经具备：

- Next.js 16.3.8
- React 19.2.8
- TypeScript 5.9.3
- Bun 1.3.14
- PostgreSQL
- Drizzle ORM 0.45.2
- Better Auth 1.6.25
- Google Provider 后端支持
- Magic Link 代码能力
- Resend Email Sender
- GA4 / Clarity / Consent
- routeRegistry / metadata / canonical / sitemap
- nonce CSP / Permissions-Policy
- Vitest / Playwright
- WoW Forever Tier List 数据管线

当前 production features 中 Auth 仍关闭。

Vanguard 上线前需要开启现有 Auth，但只开启 Google。

目标 production Auth：

- auth.enabled = true
- auth.google = true
- auth.magicLink = false
- auth.password = false

如果 Report 邮件使用现有 Resend：

- email.enabled = true

Email 功能只用于系统通知，不开放 Email 登录。

---

## 3. 页面壳

新增页面放在：

src/app/(marketing)/wow-forever/vanguard/page.tsx

直接继承现有：

src/app/(marketing)/layout.tsx

因此天然复用：

- SiteHeader
- SiteFooter
- AnalyticsBoundary
- Consent
- globals
- 全站 metadata 基础

不得创建 Vanguard 专用根 Layout。

Vanguard 自己的 Legal Block 放在页面内容底部、共享 SiteFooter 上方。

---

## 4. 容量与阶段模型

总容量：

**64,128**

### WOW

- W1：2,672
- O：2,672
- W2：2,672
- WOW total：8,016

### FOREVER

- F：8,016
- O：8,016
- R1：8,016
- E1：8,016
- V：8,016
- E2：8,016
- R2：8,016
- FOREVER total：56,112

### Event Stage

建议统一由服务端函数 resolveVanguardStage(now) 计算：

1. WOW_OPEN
2. WOW_COMPLETE_WAITING
3. FOREVER_OPEN
4. COMPLETE
5. SEALED

优先级：

- 如果 now >= EVENT_CLOSE_AT → SEALED
- 否则如果 64,128 全满 → COMPLETE
- 否则如果 WOW 尚未满 → WOW_OPEN
- 否则如果 now < wowCompletedAt + 24h → WOW_COMPLETE_WAITING
- 否则 → FOREVER_OPEN

### 不需要 Cron

用户需求是 WOW 满后第二天自动显示 FOREVER。

最简单实现不是后台开关，也不是 Cron Job。

在第 8,016 个 WOW Seat 成功事务中写入：

wow_completed_at

然后：

foreverUnlockAt = wow_completed_at + 24 hours

所有页面和 API 通过当前时间计算阶段。

这样：

- 不需要 Admin
- 不需要定时任务可靠性
- 不需要人工操作
- 到时间自动出现
- Server / Client 都由同一状态源决定

如果 foreverUnlockAt >= EVENT_CLOSE_AT，则 FOREVER 不开放 Claim。

---

## 5. Seat ID

公开只使用一个 Seat ID。

不再存在用户可见的顺序 Vanguard Number。

数据库内部仍可使用 UUID 主键，但不向用户展示。

### WOW

格式：

WOW-{LETTER}-{LOCAL_INDEX}

合法例子：

- WOW-W1-0001
- WOW-O-2672
- WOW-W2-0614

### FOREVER

格式：

FOREVER-{LETTER}-{LOCAL_INDEX}

合法 LETTER：

- F
- O
- R1
- E1
- V
- E2
- R2

例子：

- FOREVER-F-0001
- FOREVER-E2-0421
- FOREVER-R2-8016

### 属性

Seat ID：

- 由 build-time layout 固定产生
- 与用户 Claim 顺序无关
- 与 Monument 几何位置一一对应
- 一旦发布不可变化
- 删除内容后也不复用

---

## 6. Seat Layout

不得在运行时随机生成字形。

设计稿冻结后，通过一次性离线脚本生成固定 Seat Layout。

推荐文件：

src/modules/wow-vanguard/assets/seat-layout/wow.json

以及：

src/modules/wow-vanguard/assets/seat-layout/forever/f.json  
src/modules/wow-vanguard/assets/seat-layout/forever/o.json  
src/modules/wow-vanguard/assets/seat-layout/forever/r1.json  
src/modules/wow-vanguard/assets/seat-layout/forever/e1.json  
src/modules/wow-vanguard/assets/seat-layout/forever/v.json  
src/modules/wow-vanguard/assets/seat-layout/forever/e2.json  
src/modules/wow-vanguard/assets/seat-layout/forever/r2.json

每个 Seat：

    type VanguardSeat = {
      seatId: string;
      phase: "wow" | "forever";
      letter: "W1" | "O" | "W2" | "F" | "R1" | "E1" | "V" | "E2" | "R2";
      localIndex: number;
      x: number;
      y: number;
      z: number;
      rotation: number;
      neighbors: string[];
    };

注意 O 在 WOW 和 FOREVER 中都存在，必须由 phase + seatId 完整区分。

CI 必须硬校验：

- WOW 总数 8,016
- WOW 三字母各 2,672
- FOREVER 七字母各 8,016
- FOREVER 总数 56,112
- 总数 64,128
- Seat ID 全局唯一
- neighbors 只指向存在的 Seat

---

## 7. 数据模型

新增 schema 保持现有模块化方式，放入 Vanguard 模块并注册到 drizzle.config.ts。

数据库迁移必须通过现有：

bun run db:generate

生成并进入现有 migration verification；禁止手写 SQL 迁移冒充生成结果。

### vanguard_event_state

单例状态记录：

- id
- wow_claimed_count
- wow_completed_at nullable
- created_at
- updated_at

不需要保存 current_stage。

current_stage 永远通过 now、wow_completed_at、总席位状态和 EVENT_CLOSE_AT 计算。

wow_claimed_count 只增不减，因为成功 Seat 永久不释放。它用于避免 WOW 最后几个并发 Claim 时通过 count(*) 判断满席产生竞态。

### vanguard_inscriptions

字段：

- id UUID
- user_id nullable
- seat_id
- phase
- letter
- local_index
- display_name
- faction
- class_name
- guild_name nullable
- guild_key nullable
- battle_cry nullable
- media_id nullable
- status
- created_at

status：

- active
- hidden
- deleted

约束：

- seat_id UNIQUE
- 对 user_id IS NOT NULL 建 partial UNIQUE
- 一个仍存在的 TierListBase Account 在整个 64,128 Seat 系统中最多一条 inscription
- seat_id 必须来自固定 layout
- Faction 必须校验为 alliance / horde
- Class 必须直接复用并校验现有 WOW_CLASSES，不建立第二套职业常量
- guild_key 使用 trim + casefold 等规范化值；guild_name 保留显示原文

user_id 仅在账户删除 / 隐私删除后允许置 NULL；这不会释放 Seat。

### vanguard_seat_holds

字段：

- seat_id
- hold_token_hash
- user_id nullable
- expires_at
- created_at

约束：

- seat_id 只有一个有效 Hold
- Hold 默认 180 秒
- Hold 不得越过 EVENT_CLOSE_AT 赋予提交权

### vanguard_media

字段：

- id
- owner_user_id
- private_master_key
- moderation_key
- public_detail_key nullable
- public_wow_thumb_key nullable
- public_forever_thumb_key nullable
- mime
- width
- height
- byte_size
- sha256
- moderation_status
- moderation_model
- moderation_result
- created_at
- moderated_at

moderation_status：

- pending
- approved
- rejected
- hidden

### vanguard_reports

字段：

- id
- inscription_id
- reporter_user_id nullable
- reason
- status
- created_at

reason enum：

- sexual_graphic
- hate_impersonation
- privacy
- spam_promotion
- other

status：

- new
- reviewed
- actioned
- dismissed

不建设 Report 管理 UI。

---

## 8. 一账户一席

规则作用于整个 64,128 席系统。

最终 Claim 事务必须同时验证：

1. Event 仍开放
2. 当前 phase 允许 Claim
3. Seat 当前允许 Claim
4. Hold 有效
5. Seat 尚未占用
6. 当前 user_id 尚无 user inscription
7. 上传图片如使用，必须 moderation_status = approved
8. DB UNIQUE 约束最终兜底

如果用户已经拥有 Seat：

API 返回 409：

ACCOUNT_ALREADY_INSCRIBED

前端显示：

**You already have a place in the Monument.**

并提供：

**VIEW MY SEAT**

---

## 9. Google Only Auth

继续使用 Better Auth。

V1 只开放 Google OAuth。

不开放：

- Magic Link
- Password

需要：

- production features 开启 auth.enabled
- auth.google = true
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- BETTER_AUTH_SECRET

现有 createAuth 已经支持 socialProviders.google。

需要给现有 Sign-In 页面增加 Google Sign-In 入口。

Vanguard 不建立自己的登录页面和账户表。

正式顺序是先选 Seat 并创建 Hold，再进行 Google 登录，OAuth 返回原 Seat 后才进入 Claim 表单。

登录回跳必须恢复：

- seatId
- hold token

Google 登录返回后必须重新验证 Seat Hold：

- Hold 仍有效：继续
- Hold 已过期但 Seat 仍为空：重新创建 Hold
- Seat 已被别人占用：提示冲突并返回最近空 Seat 建议

Vanguard Name / Faction / Class / Guild / Battle Cry 的正式填写发生在 Google 登录之后，因此不把“先填完整 Claim 再登录”作为产品流程。Memory Image 的实际 File 选择、裁切、上传同样放在 Google 登录完成以后，避免为了 OAuth 跳转额外引入本地 Blob 持久化。

Google / Email 账户资料不得自动显示为 Vanguard Name。

---

## 10. Claim 流程

状态机：

    HERO
      ↓
    MONUMENT
      ↔ SCATTER
      ↔ FOCUS
      ↓
    SEAT_HOLD
      ↓
    AUTH_REQUIRED
      ↓
    AUTHENTICATED
      ↓
    CLAIM_DRAFT
      ↓
    MEDIA_PREP / DEFAULT_EMBLEM
      ↓
    MEDIA_MODERATION (if uploaded)
      ↓
    READY_TO_INSCRIBE
      ↓
    HOLD_4_SECONDS
      ↓
    SUBMISSION_PENDING (Claim fully locked)
      ↓
    INSCRIBING / LOST_RESPONSE_RECOVERY
      ↓
    POST_SUCCESS_RITUAL (~1.1s)
      ↓
    REVEAL
      ↓
    SHARE / TIER_LIST / MONUMENT

HOLD TO INSCRIBE 在开始前必须通过全部客户端可验证字段与媒体状态校验；服务端 inscriptionSchema 仍是最终权威验证。达到 4 秒阈值后直到成功、明确失败或 /me lost-response recovery 完成，Claim 字段、上传、裁切、Default Emblem 切换和再次 HOLD 都保持 disabled。

成功 Inscription 后不进入编辑状态。

用户账户页只提供查看和分享，不提供 PATCH 编辑表单。

因此原有 PATCH /api/vanguard/me 不再作为 V1 必需 API。

---

## 11. API

### Public

GET /api/vanguard/manifest

返回：

- stage
- occupied counts
- wow completed time
- forever unlock time
- event close time
- 当前 phase 最小占用数据
- ETag

GET /api/vanguard/inscriptions/:seatId

返回公开 Focus 信息。

GET /api/vanguard/search

支持：

- Seat ID
- Vanguard Name
- Guild

POST /api/vanguard/reports

写举报记录并触发通知。

### Claim

POST /api/vanguard/holds

创建 / 刷新 Hold。

POST /api/vanguard/media/presign

登录后获取私有 R2 上传 URL。

POST /api/vanguard/media/complete

验证 R2 对象、处理衍生图并开始审核。

POST /api/vanguard/inscriptions

最终正式铭刻。

GET /api/vanguard/me

返回当前账户唯一 inscription。

### 不需要

- PATCH /api/vanguard/me
- Admin API
- Moderation Dashboard API

### API 通用边界

所有 Vanguard API 必须：

- 使用 zod 做输入校验
- 复用现有 session / client-ip / rate-limit 边界
- Write API 使用 no-store
- 公开 Manifest / Focus 不返回 email、Google name、Google subject、IP、内部 user_id 或其他账户私有字段
- 错误必须映射为本文定义的稳定 error code，不能依赖自由文本判断

---

## 12. 活动截止硬限制

统一配置：

    export const EVENT_CLOSE_AT = "2026-11-04T23:00:00Z";

所有写 API 开头调用：

assertVanguardWriteOpen(now)

以下 API 在截止后必须拒绝：

- holds
- media/presign
- media/complete
- inscriptions

推荐状态码：

410 Gone

错误：

EVENT_SEALED

客户端不能通过修改本地时间绕过。

Seat Hold 的 expires_at 即使晚于截止，也不允许截止后最终提交。

---

## 13. WOW 完成事务

当真实用户写入 WOW inscription 时，在同一数据库事务内：

1. 锁定 vanguard_event_state 单例行
2. 再次验证 Event、账户、Hold 与目标 Seat
3. 写入 Seat inscription
4. 原子执行 wow_claimed_count = wow_claimed_count + 1
5. 如果新值恰好达到 8,016 且 wow_completed_at 为空，则写入数据库时间
6. commit

不得通过“插入后再 count(*)”来决定第 8,016 个 Seat，避免最后几个并发 Claim 同时提交时漏掉完成状态。

不得依赖客户端宣布 WOW 满。

不得重复覆盖 wow_completed_at。

FOREVER 解锁时间由：

wow_completed_at + 24h

唯一确定。

### 截止时间判定

最终 Inscription 是否有效，以数据库事务内正式写入前取得的数据库时间为准。

- 该时间 < EVENT_CLOSE_AT：允许写入并完成事务；前端动画可以在截止后结束
- 该时间 >= EVENT_CLOSE_AT：返回 EVENT_SEALED
- 不使用浏览器本地时间作为权威时钟
- Seat Hold 的创建时间、按钮按下时间和动画结束时间都不能绕过截止点

---

## 14. 技术补位

当前版本不实现技术补位、system_fill、自动补满脚本或相关后台。

如果未来运营决定需要补位，另开独立变更设计，不提前进入 V1 数据模型、API、脚本或 Analytics。

---

## 15. UGC 文本安全

所有 Vanguard Name / Guild / Battle Cry：

- Unicode normalization
- HTML escape
- 纯文本存储与渲染
- 不允许 HTML / Markdown / 富文本
- Vanguard Name 2–32 字符
- Guild 最多 48 字符
- Battle Cry 最多 120 字符
- 拒绝 URL、Email、手机号、Discord 邀请和明显站外导流内容

服务端必须再次校验，不能只依赖前端。

---

## 15A. 图片输入规则

用户本地选择：

- JPEG
- PNG
- WebP
- 最大 20 MB
- 最小 512×512
- 推荐 1024×1024 或以上

客户端：

1. decode
2. 1:1 crop
3. resize
4. 输出最高 2048×2048 标准母版
5. 推荐 WebP
6. 上传 R2

不要把手机超高分辨率原图原样上传。

可信处理层必须移除 EXIF / GPS 等元数据，不把拍摄位置等信息带入长期公开媒体。

R2 完成接口再次验证：

- MIME
- magic bytes
- width / height
- byte size
- hash

标准母版建议硬上限：

- 2048×2048
- 4 MB

超过则删除对象并返回 422。

---

## 16. WOW 与 FOREVER 图片尺寸

用户只上传一套标准母版。

系统生成：

- moderation：512px
- detail：1024px
- WOW thumbnail：256px
- FOREVER thumbnail：128px

原因：

WOW 一个字母约 2,672 Seat，单格相对更大。

FOREVER 每字母 8,016 Seat，单格更小。

不让用户选择两种上传模式。

尺寸差异由系统衍生图解决。

---

## 17. R2 存储

固定使用 Cloudflare R2。

推荐两类存储边界：

### Private

保存：

- master
- moderation derivative

不可公共访问。

### Approved public media

审核通过后才生成 / 发布：

- detail
- wow thumbnail
- forever thumbnail

可以继续挂在：

media.tierlistbase.com

公共路径只包含 approved derivative。

数据库不存二进制。

Object Key 必须由服务器生成，用户不可指定任意路径。

推荐结构：

    vanguard/pending/{mediaId}/master.webp
    vanguard/pending/{mediaId}/moderation.webp

成功 Inscription 后的长期资产：

    vanguard/permanent/{mediaId}/detail.webp
    vanguard/permanent/{mediaId}/wow-256.webp
    vanguard/permanent/{mediaId}/forever-128.webp

未 approved 的对象绝不能进入公共媒体路径。

### 临时媒体清理

R2 的 pending 前缀设置 24 小时生命周期删除规则。

因此以下对象不会长期堆积：

- 用户上传后离开页面
- Hold 过期后未提交
- rejected
- 长期 pending
- 审核通过但最终没有完成 Inscription 的临时媒体

正式 Inscription 使用的长期公共衍生图必须位于 permanent 前缀，不能被 pending 生命周期删除。

---

## 18. R2 Presigned Upload

浏览器不把图片经 Vercel API 中转。

流程：

1. 用户已登录
2. POST media/presign
3. Server 创建短效 Presigned PUT URL
4. 浏览器直接 PUT 到 private R2
5. POST media/complete
6. Server HEAD / fetch 验证对象
7. 处理图片
8. 自动审核

Presigned URL：

- 短时有效
- object key 服务器生成
- 绑定目标 content type
- 完成接口再次做大小和 MIME 验证
- presign API 必须登录且限流，避免被当成任意对象存储入口

R2 Bucket 使用最小化 CORS：

- Production Origin 只允许 https://www.tierlistbase.com
- 只开放上传实际需要的方法，例如 PUT / HEAD
- 只开放上传实际需要的请求头，例如 Content-Type
- Preview / staging origin 单独配置，生产环境不使用无条件 wildcard

Cloudflare / R2 凭据全部保持 server-only，不得进入客户端 Bundle。

---

## 19. 自动图片审核

固定：

**Cloudflare Workers AI @cf/cloudflare/clef-flash**

由 TierListBase Server API 调用 Workers AI。

不要求为 Vanguard 新建独立 Cloudflare Worker 服务。

审核输入：

- 512px moderation derivative
- 固定 decision schema

至少判断：

- sexual_explicit
- sexual_suggestive
- graphic_gore
- hate_extremism
- illegal_or_abusive
- commercial_spam
- personal_sensitive_info
- offsite_redirect
- normal_game_combat

业务层根据概率映射：

- approved
- rejected
- uncertain

### Fail Closed

只有 approved 图片能公开。

以下情况都不公开：

- pending
- rejected
- uncertain
- timeout
- 429
- provider error

用户可以：

- Retry
- 换图片
- 使用 Default Emblem

因为最终提交后禁止修改，所以如果用户选择使用图片，该图片必须在 Inscription 事务之前 approved。

---

## 20. Moderation 阈值

不在需求文档里拍一个固定概率。

在上线前用真实样本校准：

- 正常角色截图
- WoW 战斗截图
- 公会合照
- 正常人物照片
- 广告
- 二维码
- 性内容测试图
- 极端血腥测试图

阈值集中写在：

src/config/vanguard.config.ts

不得散落在前端。

普通 WoW 战斗不得被 normal_game_combat 以外的单一 violence 信号机械拒绝。

---

## 21. Workers AI Billing

账户前提：

**Workers Paid**

采用 Cloudflare 标准 Workers AI usage-based billing。

不要求为 Vanguard 购买 AI Gateway prepaid credits。

不设计预充值逻辑。

费用进入现有 Cloudflare 账户账单。

---

## 22. Report

每个公开 Focus 提供 Report。

POST /api/vanguard/reports

服务端：

1. zod 校验固定 reason
2. rate limit
3. 写 vanguard_reports
4. 发送通知邮件到 TierListBase support address

通知邮件包含：

- Seat ID
- reason
- report timestamp
- 公开链接

一条 Report 不自动 hidden。

不开发管理后台。

确认违规后，运营使用现有数据库 / 运维方式：

- inscription.status = hidden
- media.moderation_status = hidden
- 公共端立刻回退为中性 Hidden Plate
- 删除或撤销对应公开 detail / WOW thumbnail / FOREVER thumbnail 的 R2 公共对象
- 同时清除这些 URL 的 CDN 缓存，确保旧公共 URL 不继续返回已隐藏图片

### Email

可复用仓库现有 Resend Email Sender。

保持：

- auth.magicLink = false

但可以：

- email.enabled = true

只用于系统邮件通知。

---

## 23. 删除 / 隐藏

成功 inscription 的 Seat 永久占用。

无论：

- 用户请求删除
- 隐私请求
- 违规隐藏
- 法律原因删除

都不重新释放 Seat。

对外：

- Seat ID 保留
- Monument 几何位置保留
- 个人图片和文字可以清除
- 显示中性 Hidden / Unavailable Plate

数据库不得重新分配该 Seat。

任何 hidden / deleted 操作都必须同步删除 / 撤销公共媒体对象并清除对应 CDN 缓存；不能只改数据库状态。

账户删除时：

- inscription.user_id 置 NULL
- Seat 与 Seat ID 永久保留
- 用户公开图片和个人文字按隐私删除规则清除 / 隐藏
- 不把该 Seat 重新开放

---

## 24. Three.js 渲染

### 首屏

SSR 静态 Hero 作为 LCP。

不加载：

- Three.js
- 音频大资源

点击 ENTER 后动态加载体验。

### WOW

三个 InstancedMesh 分组或等价结构。

总实例：

8,016

### FOREVER

七个字母各自独立 InstancedMesh。

每个：

8,016

总计：

56,112

不要为每个 Seat 创建 React Component。

### 远景

只渲染：

- Base Plate
- occupied state
- faction tint
- minimal glow

不加载玩家纹理。

### 中景

只为当前可见距离范围加载 thumbnail。

### Focus

仅当前 Seat 加载 1024px detail。

### 移动端

根据：

- viewport
- DPR
- deviceMemory

降低：

- bloom
- particles
- simultaneous thumbnails

FOREVER 不能一次把 56,112 张纹理送入 GPU。

如果 prefers-reduced-motion 开启：

- 减少非必要镜头飞行
- 降低 / 关闭 Bloom 与粒子
- 保留必要的状态切换、成功确认和错误反馈
- 不因为 reduced motion 改变 Claim 业务结果

---

## 25. Input Controls

Vanguard 不使用 Camera、MediaPipe 或 Gesture Control。

核心交互由：

- Mouse
- Touch
- Keyboard

完成。prefers-reduced-motion 只减少非必要镜头动画，不改变 Claim 业务结果。

---

## 26. Camera Security

Vanguard 不设置 Camera route override。

继续使用全站默认：

camera=()

不为 Vanguard 引入 Camera Permission、MediaPipe model / WASM 或第三方视觉运行时。

---

## 27. 背景音乐与 SFX

### BGM

原创背景音乐。

右上角 Music Toggle。

只控制 BGM。

客户端保存用户选择，可使用 localStorage。

第一次播放必须服从浏览器用户手势规则。

### SFX

以下为独立短音效通道：

- focus
- inscription
- stone carve
- metal resonance
- seat ignite
- reveal

BGM Off 不等于 SFX Off。

SFX 只有在浏览器已经允许 AudioContext 后播放。

音频加载不得阻塞 LCP。

---

## 28. Reveal 与 Tier List

Inscription 成功后：

1. 播放刻碑
2. Fly-out 显示本人位置
3. Reveal Panel
4. 生成 Vanguard Seal
5. 展示分享
6. 展示 Class Tier List CTA

CTA：

**See how {Class} is performing in WoW Forever**

URL：

/wow-forever/tier-list?class={Class}

现有 Tier List 需要支持 class searchParam。

要求：

- canonical 仍指向 /wow-forever/tier-list
- role 切换保留 class 参数
- 不产生新的参数 SEO 页面
- Vanguard 客户端不直接请求 Forever Logs

Focus 其他玩家也可以提供低优先级：

**View {Class} Tier List**

SEALED 状态继续保留固定 Tier List 入口。

---

## 29. Vanguard Seal

使用固定 renderer，不用 DOM screenshot。

可以使用：

- Canvas
- Server Image Renderer

输出：

- 9:16
- 1:1

数据：

- approved Memory Image 或 Default Emblem
- Vanguard Name
- Seat ID
- Faction
- Class
- Guild nullable
- Inscribed date
- Monument location thumbnail
- Stand Beside Me QR
- Unofficial Community Tribute

不包含：

- Email
- Google Name
- Google User ID
- DB UUID
- IP

二维码：

/wow-forever/vanguard?seat={SeatID}

---

## 30. My Vanguard

/account/vanguard

复用 AccountShell。

用户只有一个 Seat。

显示：

- Memory Plate
- Seat ID
- Faction
- Class
- Guild
- Battle Cry
- Seal
- View in Monument
- Share

不提供编辑按钮。

如果账户无 Seat：

**Claim your place**

如果活动已经 SEALED：

只允许浏览，不显示 Claim CTA。

---

## 31. 搜索

搜索支持：

- Seat ID 精确匹配
- Vanguard Name 前缀 / 合理文本匹配
- Guild 前缀 / 合理文本匹配

要求：

- 复用现有限流
- 不提供按账户标识、Email、Google 信息查询
- 不提供无上限批量导出 / 枚举接口
- 返回结果只包含公开 Seat 信息

---

## 32. SEO

活动唯一索引 URL：

/wow-forever/vanguard

Seat link：

/wow-forever/vanguard?seat=WOW-W1-0614

Canonical：

/wow-forever/vanguard

不生成 64,128 个可索引玩家页。

SSR 页面必须有：

- 8016 故事
- 64,128 结构说明
- Unofficial 声明
- Tier List 正常链接
- 当前活动状态文本

Three Canvas 不得是搜索引擎唯一内容。

---

## 33. Analytics

复用 GA4 / Clarity / Consent。

事件建议：

- vanguard_enter
- vanguard_focus
- claim_start
- auth_start
- media_upload
- media_rejected
- claim_complete
- seal_save
- share
- invite_open
- tier_list_click
- report_submit

不发送：

- Vanguard Name
- Guild
- Battle Cry
- Google User ID
- Email
- Memory Image 内容

SAFE_QUERY_KEYS 如需要 seat / class 参数，必须按现有安全逻辑显式加入。

---

## 34. Performance

### LCP

静态 Hero。

### JS

首屏不加载：

- Three.js
- Clef client
- 高码率音频

### Manifest

不得返回全部 64,128 个完整用户对象。

返回：

- stage
- counts
- compact occupancy
- version / ETag

详情按 Focus 请求。

### Seat Layout 传输

64,128 个 Seat 的渲染布局必须保持紧凑：

- WOW 与 FOREVER 分阶段加载
- FOREVER 按字母拆分静态布局文件
- 基础渲染布局只包含 seat index / position / rotation 等必要字段
- 不把长 Seat ID 字符串和 neighbors 数组重复塞进每个首屏渲染对象
- 坐标数据优先使用紧凑 JSON 或 TypedArray / ArrayBuffer 等等价紧凑表示
- neighbors / Stand Beside Me 邻接信息只在 Focus 或需要推荐邻近 Seat 时按需读取
- 不因 64,128 Seat 把非必要结构塞进首屏 JS Bundle

### Polling

V1 使用 10–20 秒 ETag polling。

不使用 WebSocket。

---

## 35. 缓存

- Static visual assets：immutable
- Seat layout：immutable
- Manifest：short cache + ETag
- Public Focus data：short cache
- My Vanguard：no-store
- Write APIs：no-store
- Private master / moderation image：private
- Approved thumbnail/detail：hashed long cache
- Tier List：沿用现有策略

---

## 36. Error Contract

至少支持：

400 INVALID_INPUT  
401 AUTH_REQUIRED  
409 SEAT_ALREADY_CLAIMED  
409 ACCOUNT_ALREADY_INSCRIBED  
410 EVENT_SEALED  
410 PHASE_NOT_OPEN  
422 MEDIA_FORMAT_INVALID  
422 MEDIA_TOO_LARGE  
422 MEDIA_TOO_SMALL  
422 MEDIA_MODERATION_REJECTED  
429 RATE_LIMITED  
503 MODERATION_UNAVAILABLE  

客户端不得只显示 “Something went wrong”。

每个错误必须映射到明确用户提示。

---

## 37. 法律配置必须同步更新

当前 legal.config.ts 仍描述：

- public read-only
- authentication disabled
- no accounts
- no visitor account profile

Vanguard 上线后这些陈述不再准确。

必须更新现有全站：

- Privacy
- Terms
- Acceptable Use
- Account Deletion

不新建 Vanguard 专用法律页面。

需要覆盖：

- Google OAuth
- Account data
- UGC
- R2 storage
- Workers AI moderation
- display license
- report / hide / delete
- account deletion

---

## 38. 测试

### Capacity

- WOW = 8,016
- W1/O/W2 = 2,672 each
- FOREVER = 56,112
- each FOREVER letter = 8,016
- total = 64,128
- Seat ID unique

### Stage

- WOW open
- WOW 8015 → 8016 atomic completion under concurrent claims
- wow_claimed_count cannot miss / double-count completion
- 24h waiting
- FOREVER automatic open
- no FOREVER before unlock
- final cutoff at exact UTC
- no final submit after cutoff

### Account

- one account one Seat globally
- same Google account cannot claim second Seat
- no Magic Link
- login return preserves claim draft
- login return with expired Hold but free Seat recreates Hold
- login return with Seat already claimed preserves draft and recommends nearest Seat
- account deletion detaches user_id but never reopens Seat

### Media

- format
- >20MB local rejection
- <512 rejection
- normalized master <=2048
- server hard size check
- EXIF / GPS removed
- R2 private pending
- pending lifecycle cleanup
- only approved public
- hidden / deleted media removes public object and purges CDN
- 1024 / 256 / 128 derivatives

### Moderation

- normal WoW screenshot
- normal combat
- person photo
- sexual test
- gore test
- spam / QR
- model timeout
- fail closed

### Concurrency

- two users same Seat
- one wins
- one receives 409 and nearest Seat recommendation

### Closed State

- page still browsable
- Claim disabled
- empty Seat click gets sealed message
- share links still work
- Tier List links still work

### Report

- reason validation
- rate limit
- DB record
- email notification
- report does not auto-hide

### Visual / E2E

Viewport:

- 390
- 768
- 1024
- 1440
- 1920

Flows:

- mouse
- touch
- keyboard
- upload approved
- upload rejected
- default emblem
- inscription
- reveal
- seal
- Stand Beside Me
- Tier List deep link

---

## 39. 实施顺序

1. 冻结 WOW / FOREVER 最终视觉
2. 冻结 Memory Plate
3. 生成全部 Seat Layout
4. 新建 Vanguard module / route
5. 新增 schema / migration
6. 实现 Event Stage / cutoff
7. 实现 Hold / one-account-one-seat
8. 开启 Google Auth
9. 配置 R2
10. 实现浏览器 crop / normalize
11. 实现 media/presign / complete
12. 接入 Clef Flash
13. 校准 moderation threshold
14. 实现 WOW Three.js
15. 实现 FOREVER Seven-Letter Three.js
16. 实现 24h automatic unlock
17. 验证 Mouse / Touch / Keyboard 核心输入
18. 实现 Inscription Ritual
19. 实现 Reveal / Seal
20. 实现 Stand Beside Me
21. 实现 Class Tier List deep link
22. 实现 Report + Email notification
23. 实现 My Vanguard read-only
24. 更新全站 Legal
25. 补全部测试
26. CI / multi-viewport / real-device acceptance
27. Production launch

---

## 40. 建议新增文件

核心：

- src/app/(marketing)/wow-forever/vanguard/page.tsx
- src/app/(account)/account/vanguard/page.tsx
- src/app/api/vanguard/**
- src/config/vanguard.config.ts
- src/modules/wow-vanguard/**
- src/modules/wow-vanguard/db/schema.ts
- src/modules/wow-vanguard/assets/seat-layout/**
- tests 对应文件

文档：

- docs/wow-forever-vanguard/requirements.md
- docs/wow-forever-vanguard/technical-design.md

---

## 41. 预计修改的现有文件

至少可能涉及：

- src/config/routes.config.ts
- src/config/features.config.ts
- src/config/legal.config.ts
- drizzle.config.ts
- next.config.ts
- src/platform/security/content-security-policy.ts
- src/platform/analytics/events.ts
- src/app/(account)/sign-in/**
- src/app/(account)/account/page.tsx
- src/app/(marketing)/wow-forever/tier-list/page.tsx
- src/modules/meta-board/wow/workspace.tsx
- src/modules/meta-board/wow/role-links.tsx

不要因为 Vanguard 去重构无关模块。

---

## 42. 开发完成定义

只有满足以下条件才算 Ready：

- 64,128 Seat 布局硬校验通过
- WOW / FOREVER 阶段严格正确
- WOW 未满绝不出现 FOREVER
- WOW 满后 24h 自动出现 FOREVER
- 2026-11-04T23:00:00Z 后绝不新增 inscription
- 已有内容截止后仍永久浏览
- Google Only Auth
- 一账户一席全局约束
- Seat ID 是唯一公开编号
- 成功后全部字段锁死
- R2 正常
- Clef Flash 正常
- 未 approved 图片绝不公开
- Report 通知可用
- 无 Admin
- Music Toggle 正常
- SFX 正常
- Mouse / Touch / Keyboard 都可完成核心流程
- Reveal / Seal / Stand Beside Me 完整
- Class Tier List Deep Link 正常
- SEO / Legal / Security / Analytics 正确
- 全站回归测试通过

---

## 43. 冻结结论

本技术方案聚焦 Vanguard 活动本身，不增加与目标无关的平台建设。

已钉死：

- 现有 TierListBase 架构
- Google Only
- PostgreSQL / Drizzle
- 64,128 总 Seat
- WOW 先行
- FOREVER 24h 后自动解锁
- UTC 硬截止
- 一账户一席
- 唯一 Seat ID
- 提交成功锁死
- R2
- Clef Flash
- 统一图片母版 + 1024 / 256 / 128 衍生图
- Report → DB + Email
- 无 Admin
- BGM Toggle
- SFX 独立
- Tier List Class Deep Link

除视觉资产制作与具体发布部署时刻外，不再保留影响核心开发的产品歧义。
