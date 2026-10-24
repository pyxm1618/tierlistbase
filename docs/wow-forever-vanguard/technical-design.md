# 8016 Vanguard Monument — 当前技术设计

> 项目：TierListBase · WoW Forever Vanguard
> 状态：CURRENT TECHNICAL SSOT
> 最近同步：2026-10-23
> 基线：main @ 5fc2cbe02b7c9a06e31805a7d3ecf44beb57e8de

产品规则以 `requirements.md` 为准。本文只描述当前已经采用的技术边界，不保留开发阶段的实施计划、PR 状态或已废弃方案。

## 1. 运行栈

- Bun 1.3.14
- Next.js 16.4.1
- React 19.2.9
- TypeScript
- PostgreSQL / Neon
- Drizzle
- Better Auth 1.6.25
- Vinext 1.1.0
- Vite 8.3.3
- Cloudflare Workers
- Cloudflare R2
- Cloudflare Workers AI
- Three.js

生产由 GitHub Actions 构建 Vinext 并部署到 Cloudflare。Vanguard 不是独立站，也不使用独立数据库。

## 2. 产品与账户边界

活动页：`/wow-forever/vanguard`

账户页：`/account/vanguard`

生产登录：

- Google OAuth：开启
- Magic Link：关闭
- Password：关闭

浏览 Monument 不要求登录；Claim Seat 需要登录。

数据库和服务端事务保证：

- 一个已完成 Seat 只能属于一个账户；
- 一个账户全局只能拥有一个已完成 Seat；
- Hold 有时效；
- Inscription 完成后不可由参与者编辑；
- 账户删除不会释放 Seat 供其他人重新 Claim。

## 3. 活动状态

固定截止时间：

`2026-11-04T23:00:00Z`

总容量：

- WOW：8,016
- FOREVER：56,112
- 合计：64,128

状态由服务端时间、WOW 完成时间和 Seat 状态共同决定。客户端显示不是权威。

WOW 完成后按产品规则进入 24 小时完成展示，再开放 FOREVER。截止时间优先级高于任何客户端倒计时。

## 4. 数据模型

Vanguard 数据属于现有 PostgreSQL 应用数据库。

核心领域包括：

- event state
- inscriptions
- seat holds
- media
- reports

数据库唯一约束、事务和锁是账号/Seat 并发正确性的最终边界。

公开 API/Manifest/Focus 不得返回 email、Google identity、内部 user id、IP 或其他账户私有字段。

## 5. Seat Layout

运行时使用十组最终布局：

- WOW：W1 / O / W2
- FOREVER：F / O / R1 / E1 / V / E2 / R2

最终运行文件位于：

`public/wow-forever/vanguard/layouts/**`

两个 FINAL 源布局保留在：

- `docs/wow-forever-vanguard/implementation/seat-layout/vanguard-seat-layout-8016-final.json`
- `docs/wow-forever-vanguard/implementation/seat-layout/vanguard-forever-seat-layout-56112.json`

`scripts/generate-vanguard-layouts.ts` 直接读取这两个源文件，验证容量、坐标、mask 包含关系、重叠和稳定 Seat ID，然后生成 `.f32` 布局与 metadata。

不要删除或手工重排这两个 FINAL 源文件，除非对应生成器、测试和产品规则在同一变更中被明确更新。

## 6. 渲染与输入

Monument 使用 Three.js/InstancedMesh 渲染大量 Seat，不为每个 Seat 创建 React 组件。

核心输入：

- Mouse
- Touch
- Keyboard

**当前产品不使用 Camera、MediaPipe 或 Gesture Control。**

Vanguard 不需要 Camera permission，也不应重新引入旧开发阶段的 MediaPipe/WASM/Hand Landmarker 方案。

`prefers-reduced-motion` 只降低非必要动画，不得隐藏业务状态、错误或成功结果。

## 7. 图片上传、存储与审核

用户图片流程：

1. 浏览器本地选择/裁切；
2. 服务端创建受限 presigned upload；
3. 上传到 private R2 pending 区；
4. 服务端规范化/去 metadata；
5. Cloudflare Workers AI Clef Flash 自动审核；
6. 只有 approved derivative 才进入公共存储/显示；
7. rejected、uncertain、timeout、provider error 均 fail closed。

Private pending bucket 与 public derivative bucket 必须分离。

当前外部 R2 配置源文件：

- `implementation/r2/cors.production.json`
- `implementation/r2/lifecycle.private.json`

pending 前缀执行 24 小时 lifecycle。永久已批准内容不能被该规则误删。

Vanguard runtime service composition 在：

`src/config/vanguard-runtime.config.ts`

服务端需要的 Vanguard R2 / Workers AI 凭据不得进入客户端 bundle。

## 8. 当前正式资产

运行时资产唯一事实源：

`src/config/vanguard.config.ts`

当前配置包含：

- WOW / FOREVER 主视觉及移动端派生图
- 十组 Seat Layout
- Base / Alliance / Horde Plate
- Focus
- 5 帧 Inscription Ritual
- 特效
- 9 个原创 Class Emblem
- BGM 与 SFX
- Vanguard Seal portrait / square

不要以旧 closeout/status 文档判断是否“还缺素材”。

## 9. API 与服务端原则

Vanguard API 位于 `/api/vanguard/**`。

主要能力包括：

- manifest/search
- hold
- inscription
- me
- media presign/complete
- reports

所有写入路径必须：

- 使用当前账户主体；
- 服务端重新验证 Seat / event stage / ownership；
- 不信任客户端时间、Seat 状态或媒体审核状态；
- 维持幂等/事务边界；
- 对外返回稳定、有界错误，不泄露内部 provider 数据。

## 10. 举报与删除

Report 只记录固定原因与必要审计信息，不把举报直接等价为自动删除。

隐私/法律/账户删除触发的隐藏或删除必须同时处理：

- 数据库公开状态；
- public media 撤销；
- CDN/cache 清理；
- Seat 保持占用但显示为不可用中性状态。

## 11. SEO、Analytics 与隐私

Vanguard 是 TierListBase 主站内页，沿用现有 SEO、Consent、Privacy/Terms 与 Analytics 边界。

Analytics 不记录 Google user id、email、私人图片内容或其他不必要个人信息。

当前法律/provider 事实以 `src/config/legal.config.ts` 为准。

## 12. 性能与测试

必须重点保护：

- 首屏 Hero/LCP
- Manifest/layout 请求体
- 移动端内存与渲染预算
- Seat picking / pan / pinch
- reduced motion
- 64,128 容量与 ID 稳定性
- 并发 Claim
- media fail-closed
- account deletion / media revoke

对应测试分布在：

- `tests/unit/wow-vanguard/**`
- `tests/integration/vanguard*.test.ts`
- `tests/e2e/vanguard-*.spec.ts`
- `tests/performance/vanguard-*.spec.ts`

## 13. 部署

CI 位于 `.github/workflows/ci.yml`。

生产 deploy 只在 push 到 `main` 时运行：

1. checkout current commit；
2. `bun run build:vinext`；
3. 再次读取远端 current main；
4. 若 workflow SHA 已不是 current main，拒绝 stale deploy；
5. `bun run deploy:vinext` 发布到 Cloudflare。

不要把 Vercel 当成当前 Vanguard 或 TierListBase 的生产部署路径。

## 14. 当前事实源

发生冲突时按以下优先级核对：

1. 数据库约束和当前执行代码
2. `src/config/vanguard.config.ts`
3. `src/config/vanguard-runtime.config.ts`
4. `src/config/features.config.ts`
5. `src/config/legal.config.ts`
6. `requirements.md`
7. 本文

任何开发阶段 status/closeout/evidence 文档都不再属于当前工作树。
