# TierListBase V1.0 产品需求冻结文档

> Status: **LOCKED**
>
> Version: **V1.0**
>
> Locked on: **2026-10-09**
>
> 本文是 TierListBase V1.0 的正式产品需求基线。开发、设计、数据和 SEO 实现均以本文为准。任何新增需求如未明确写入本文，默认属于 V2+。

## 1. V1 产品目标

TierListBase V1.0 只验证一个核心命题：

> **用户能否通过一个比普通 Tier List 更清晰、更可信、更有上下文的页面，快速决定在 World of Warcraft: Forever 中该选什么 Class / Spec。**

V1 不验证多游戏规模化，不验证社区，不验证付费。

## 2. V1 唯一游戏

V1 只支持：

- **World of Warcraft: Forever**

明确不包含：

- Genshin Impact
- Honkai: Star Rail
- Wuthering Waves
- Zenless Zone Zero
- League of Legends
- Valorant
- 任何其他游戏

未来扩展顺序暂定：

> WoW Forever → Genshin Impact → 更多游戏

但这些都不属于 V1。

## 3. V1 页面范围

V1 只有两个核心公开页面。

### 3.1 首页

Route:

```text
/
```

首页职责：

- 说明 TierListBase 是什么
- 明确品牌聚焦于游戏中的 Ranking / Tier List 决策
- 展示当前唯一支持的游戏：World of Warcraft: Forever
- 引导进入 WoW Forever Tier List
- 可以表达未来会支持更多游戏，但不能出现空白游戏页或伪装成已经支持

首页不是内容门户，不做 News、Wiki、攻略聚合。

### 3.2 WoW Forever Tier List 核心页

Route:

```text
/wow-forever/tier-list/
```

这是 V1 唯一核心产品页。

必须回答：

> **根据我现在想玩的内容，我应该选择哪个 Class / Spec？**

## 4. V1 Tier List 维度

第一版在同一核心页面内提供以下主要视图：

- Overall / Best Class
- Leveling
- DPS
- Tank
- Healer
- Solo
- PvP

原则：

- 不为每个维度拆大量薄 SEO 页面
- 数据不足时必须明确标记 Preliminary / Unavailable
- 不允许为了“完整”而编造排名

## 5. 每个 Class / Spec 必须展示的信息

至少包含：

- Class / Spec 名称
- Role
- 当前 Tier
- 当前 Ranking Context
- WoW Forever Version / Build
- Last Updated
- Freshness Status
  - Current
  - Preliminary
  - Stale
- Why This Tier
- 主要优势
- 主要限制 / 劣势
- Source Count
- Source Agreement / Disagreement
- Source References

有历史变化时增加：

- Previous Tier
- Current Tier
- Change Date
- Change Reason

## 6. V1 交互

只做必要交互：

- 切换 Ranking Context
- 按 Role 筛选
- 快速查找 Class / Spec
- 展开查看 Why This Tier / Sources / Constraints

不做复杂个性化。

## 7. V1 核心产品差异化

V1 必须验证这条链路：

> **Source → Context → Normalization → Consensus → Explanation**

TierListBase 不是简单给出一张 S/A/B/C 表。

用户应该能够看到：

- 这个排名基于什么条件
- 当前版本是什么
- 有多少来源
- 来源是否一致
- 为什么最终得到这个 Tier

当来源冲突时：

> **展示冲突，不隐藏冲突。**

## 8. 数据可信度要求

每条 Rating 至少能够追溯：

- Source
- Source URL
- Source publish/update date（如可得）
- 对应 WoW Forever Build / Version
- 原始 Tier / Rank
- 标准化后的值
- Freshness Status

禁止：

- 无来源直接生成 Tier
- AI 独立决定 Tier
- 将过期数据冒充 Current
- 把推测写成确定事实

## 9. SEO：V1 必须开启

SEO 属于 V1 核心能力，不是后续项。

必须具备：

- 页面可公开抓取
- 核心正文服务端输出
- 唯一 Title
- Meta Description
- Canonical
- 正确 H1/H2 层级
- robots.txt
- sitemap.xml
- Open Graph
- 合理 structured data
- Mobile-first
- Core Web Vitals 基础达标
- 稳定 URL
- 可抓取内部链接
- 更新时间可见
- Version / Build 可见
- Sources / Methodology 可见

首版主要满足的搜索意图：

- wow forever tier list
- wow forever class tier list
- wow forever best class
- wow forever dps tier list
- wow forever tank tier list
- wow forever healer tier list
- wow forever leveling tier list
- wow forever pvp tier list

原则：

> 优先用一个高质量核心页覆盖相关意图，不批量制造薄页面。

## 10. 允许的边缘页面

仅允许与信任、SEO、法律或技术运行直接相关的边缘页面，例如：

- About
- Methodology
- Privacy
- Terms / Disclaimer
- 404

这些不是独立业务模块。

## 11. V1 明确关闭的功能

以下全部 **OFF**：

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
- Checkout
- Paid Tier
- Community Voting
- User-generated Tier List
- Tier List Maker
- Comments
- Forum
- Social Profile
- Personalized Account Analysis
- AI Ranking
- News
- Quest Guide
- Wiki
- 独立 Build Guide 系统
- 独立 Weapons / Items 数据库
- 多游戏
- 空白游戏占位页

## 12. V1 不做“综合 WoW 网站”

TierListBase 不与 Wowhead / Icy Veins 等大型攻略站竞争内容覆盖率。

V1 只做：

> **Ranking / Decision Layer**

允许提供的附加信息必须直接帮助：

- 选 Class / Spec
- 理解 Tier
- 判断适用场景
- 判断来源可信度
- 判断版本新鲜度

## 13. V1 成功标准

V1 上线后至少满足：

1. 用户进入首页后能立即理解 TierListBase 做什么。
2. 用户进入 WoW Forever 页面后能快速找到适合自己目标的 Class / Spec。
3. 排名明确显示 Context。
4. 排名明确显示 Version / Build。
5. 排名明确显示更新时间与 Freshness。
6. 用户可以理解 Why This Tier。
7. 用户可以看到 Sources 和来源一致性。
8. 搜索引擎可以完整抓取核心内容。
9. 更新 Tier 数据时不需要重写页面结构。
10. 后续加入 Genshin Impact 时不需要推翻整个产品模型。

## 14. 范围判断规则

任何新需求进入 V1 前，只问一个问题：

> **它是否直接提升 WoW Forever Tier List 的决策价值、可信度、新鲜度、SEO 或必要维护能力？**

- Yes → 可以评估进入 V1
- No → V2+

未经明确修改本文，不得扩展范围。
