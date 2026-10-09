# TierListBase V1.0 产品需求冻结文档

> Status: **LOCKED — REVISED FROM END-STATE**
>
> Version: **V1.0**
>
> Revised on: **2026-10-09**
>
> 本文是 TierListBase V1.0 的正式产品需求基线。它已经根据 `docs/end-state.md` 与最新竞品调研重新收敛。开发、设计、数据和 SEO 实现均以本文为准。

## 1. V1 的本质

V1 不是“做一篇更漂亮的 Tier List 文章”。

V1 要交付：

> **第一个最小可用的 Game Meta Board：World of Warcraft: Forever Tier List。**

用户进入后，应快速完成四件事：

1. **Orientation**：一眼看懂当前 Meta 的总体格局；
2. **Decision**：按真实场景判断自己该选什么；
3. **Monitoring**：知道这次回来哪些排名变了；
4. **Validation**：知道排名为什么这样、来源是否一致、哪里仍不确定。

V1 不验证多游戏规模化，不验证社区，不验证付费。

---

## 2. V1 唯一游戏

V1 只支持：

- **World of Warcraft: Forever**

其他游戏全部属于后续版本。

---

## 3. V1 的 SEO 与 URL 原则

### 3.1 主核心页

V1 的主产品页固定为：

```text
/wow-forever/tier-list/
```

核心关键词：

> **wow forever tier list**

原因：

- `tier list` 是产品与 SEO 的核心搜索意图；
- URL 必须服务真实关键词，而不是为了信息架构“整齐”而牺牲搜索意图；
- 页面本身同时承担产品体验与搜索入口。

### 3.2 关键词验证后的 WoW 子页

V1 不再绝对禁止额外 WoW 内页。

如果真实关键词数据证明某个搜索意图同时满足：

1. 有独立且足够的搜索需求；
2. 用户任务与主页面明显不同；
3. 能提供实质不同的内容，而不是换标题复制同一张榜；

则可以增加独立 URL，例如：

```text
/wow-forever/dps-tier-list/
/wow-forever/pvp-tier-list/
/wow-forever/leveling-tier-list/
/wow-forever/tank-tier-list/
/wow-forever/best-class/
```

是否建立这些页面，必须以真实关键词与 SERP 研究决定，不能预先批量生成。

原则：

> **关键词决定入口，用户任务决定页面是否值得独立存在。**

---

## 4. 首页

Route:

```text
/
```

V1 首页只负责：

- 解释 TierListBase 是什么；
- 展示当前唯一支持的游戏：World of Warcraft: Forever；
- 展示当前版本 / Meta 是否更新；
- 引导进入 WoW Forever Tier List；
- 让用户感受到未来会有更多 Game Meta Board，但不创建空白游戏页。

首页不是 News、Wiki、攻略门户。

---

## 5. WoW Forever Tier List：首屏必须先解决核心需求

用户搜索 Tier List 进入页面后，**Tier Board 必须是绝对主角**。

首屏附近必须直接看到：

- H1：WoW Forever Tier List
- 当前 Patch / Build
- 当前 Level Cap
- Last Updated
- Current / Preliminary / Stale 状态
- Tier Board

禁止把以下内容挡在 Tier Board 前面：

- 大段 SEO 文案
- 长篇方法论
- 大量说明卡片
- 文章式导语

用户应在约 5–10 秒内看懂当前格局。

---

## 6. V1 Tier Board

Tier Board 应采用直观的 S / A / B / C 等分层，并支持 WoW Forever 真正有意义的结构化条件。

### 6.1 必须支持的筛选维度

V1 至少支持：

**Mode**
- Overall
- Leveling
- Dungeon
- PvP
- 其他场景只有在数据可靠时才开启

**Role**
- All
- DPS
- Tank
- Healer

**Level / Build**
- 只展示当前真实存在且有数据支撑的等级 / Build
- 未开放等级不得伪造排名

V1 不要求所有游戏未来都使用相同筛选维度。

### 6.2 筛选原则

- 筛选必须改变真实 Ranking Context；
- 不只是前端隐藏/显示；
- 数据不足时显示 Unavailable / Preliminary；
- 不允许为了“填满界面”生成无依据排名。

---

## 7. Class / Spec 详情

用户点击任意 Class / Spec 后，在当前页面通过 Drawer / Expand 等方式看到：

- 当前 Tier
- 当前 Context
- Why This Tier
- 主要优势
- 主要限制
- 更适合什么玩家 / 场景
- 来源数量
- 来源一致性 / 分歧
- 对应版本 / Build
- Last Updated
- 最近一次 Tier 变化
- Change Reason

V1 不需要为每个 Class / Spec 建完整 Wiki 页面。

---

## 8. V1 的可信度表达

V1 不使用神秘的“Meta Confidence 82.7/100”之类伪精确分数。

优先展示用户能理解、能验证的证据：

- `4 / 5 sources agree`
- Source Count
- Source freshness
- Source date range
- Build / Patch match
- Data available / unavailable
- Agreement / Disagreement
- Preliminary / Current / Stale

原则：

> **给证据，不制造神秘可信度。**

---

## 9. Expert / Data / Community 必须概念分离

长期产品会存在不同视角：

- Expert / Editorial
- Real performance data
- Community

V1 中：

- **Expert / Source Consensus：ON**
- **真实 Data：只有真实存在时才展示**
- **Community：OFF**

如果某类数据不存在，必须显示：

> Not available yet

不能把专家意见冒充数据，也不能提前伪造社区评分。

---

## 10. Sources & Consensus

V1 必须验证：

> **Source → Context → Normalization → Consensus → Explanation**

每条 Source Rating 至少能够追溯：

- Source
- Source URL
- Source publish/update date
- 对应 Patch / Build / Level
- 原始 Tier / Rank
- 标准化结果
- Freshness

当来源冲突时：

> **展示冲突，不隐藏冲突。**

正式 Tier 不应只是简单平均字符串。

---

## 11. What Changed / Ranking History

V1 必须从第一版开始保存并展示排名变化。

至少包括：

- Entity / Spec
- Previous Tier
- Current Tier
- Ranking Context
- Version / Build
- Changed At
- Change Reason

页面应让回访用户快速看到：

> **“我上次来以后发生了什么？”**

这不是附加内容，而是 V1 的复访价值之一。

---

## 12. Quick Insights

V1 可以在 Tier Board 周围提供少量高价值摘要，例如：

- 当前跨来源最稳定
- 练级强势选择
- 当前争议最大的职业 / 专精
- 最近上升 / 下降最大的对象

这些摘要必须来自当前真实数据，不允许手工编造“惊喜卡片”。

---

## 13. V1 交互

必须：

- Mode 切换
- Role 筛选
- 有效 Level / Build 切换
- Class / Spec Drawer / Expand
- 来源 / 分歧展开
- 变化查看

可以：

- 轻量 hover
- 平滑切换
- 明确的 loading / empty / unavailable 状态

不做：

- AI 聊天式问答作为核心体验
- 复杂个性化推荐
- 大型 Compare 工具

---

## 14. 社区：V1 关闭

终局明确需要 Ranking-native Community，但 V1 不开放：

- Agree / Disagree
- Community Tier
- Comments
- Replies
- Upvote
- User Profile
- Forum

原因不是社区不重要，而是：

- V1 首先验证 Meta Board 是否有价值；
- 低流量时社区会出现空场；
- 社区一旦开放会引入 Moderation、Spam、未成年人和合规成本。

数据模型不得为了 V1 提前建设完整社区系统。

---

## 15. SEO：V1 必须开启

必须具备：

- 可公开抓取
- Server-rendered 核心 Tier 内容
- Unique Title / Meta Description
- Canonical
- H1/H2 层级
- robots.txt
- sitemap.xml
- Open Graph
- 合理 Structured Data
- Mobile-first
- Core Web Vitals
- 可见 Version / Build / Updated Date
- Sources / Methodology
- 原创解释

### 15.1 Filter 与 SEO URL 的关系

普通前端筛选状态：

- 不自动生成可索引 URL；
- 不制造大量 query-param duplicate pages。

只有当某个筛选维度被真实关键词数据验证为独立搜索意图时，才升级为独立 SEO 页面。

---

## 16. V1 明确关闭

以下全部 OFF：

- Register
- Login
- User Account
- Authentication
- Better Auth
- OAuth
- Payment
- Stripe
- Subscription
- Credits
- Community
- UGC
- Tier List Maker
- Comments
- Forum
- Social Profile
- AI-generated ranking decisions
- AI chat as primary UX
- News
- Quest Guide
- Full Wiki
- 独立 Build Guide 系统
- 多游戏
- 空白游戏占位页
- 大规模自动生成 SEO 页面

---

## 17. V1 不做综合 WoW 网站

TierListBase V1 只做：

> **Ranking / Meta / Decision Layer**

不是：

- Wowhead 替代品
- Icy Veins 替代品
- Wiki
- News site
- Build database

任何附加信息都必须直接帮助：

- 看懂当前 Meta
- 做 Class / Spec 选择
- 理解 Tier
- 判断 Context
- 看懂变化
- 判断来源可信度

---

## 18. V1 成功标准

### 第一次访问

用户进入 WoW Forever Tier List：

- **10 秒内**看懂当前大致格局；
- **30 秒内**按自己的场景找到值得重点考虑的职业 / 专精；
- **1 分钟内**理解为什么这样排、来源是否一致、哪些地方仍不确定。

### 回访

用户再次进入：

- **10 秒内**知道自上次以后哪些排名发生了变化。

### SEO

- 主核心词页面能稳定被抓取和索引；
- 未来只在真实关键词验证后扩展 WoW 子页；
- 不制造薄页和重复页面。

---

## 19. V1 范围判断规则

任何新需求进入 V1 前，必须回答：

> **它是否直接提升 WoW Forever Tier List 的浏览效率、场景判断、可信度、变化追踪、SEO 或必要维护能力？**

- Yes → 可以评估
- No → V2+

未经正式修改本文，不得扩展范围。
