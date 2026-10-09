# TierListBase 终局产品形态

> Status: **LONG-TERM PRODUCT NORTH STAR**
>
> Date: **2026-10-09**
>
> 说明：本文描述 TierListBase 的长期终局，不改变已经冻结的 V1 产品与技术范围。V1 仍以 `docs/v1-requirements.md` 和 `docs/v1-technical-spec.md` 为执行基线。

## 1. 终局定义

TierListBase 的终局不是：

- 一个 Tier List 搜索引擎；
- 一个“输入问题 → 返回答案”的 AI 问答产品；
- 一个大型游戏 Wiki；
- 一个综合游戏媒体；
- 一个 Reddit / Discord 替代品；
- 一个堆积大量静态 Tier List 文章的目录站。

终局应是：

> **玩家想快速看懂一个游戏当前 Meta 时，会主动打开的视觉参考站。**

英文可以概括为：

> **The place players go to see the current meta.**

更具体地说：

> **TierListBase = 多个游戏的 Live Meta Board 集合。**

每个游戏都有一个持续更新、可浏览、可比较、可讨论的 Meta Board。

---

## 2. 用户为什么需要这个产品

Tier List 用户的核心需求不是只得到一句“谁最好”。

真实使用过程通常包括四个 Job。

### 2.1 Orientation — 快速认识环境

用户可能是：

- 新玩家；
- 回归玩家；
- 新 Patch 玩家；
- 正在考虑换 Main 的玩家。

他们希望快速建立全局认知：

- 谁在 S / A / B；
- 哪些对象属于什么 Role；
- 当前版本的大致格局；
- 哪些角色 / Class / Spec 值得优先关注。

这种需求更适合视觉化、可浏览的完整状态面板，而不是线性的 AI 问答。

### 2.2 Decision — 做选择

用户进一步需要：

- Main 谁；
- 抽谁；
- 练谁；
- 选哪个 Class / Spec；
- 某种玩法下谁最好。

TierListBase 应让用户直接从完整 Meta 中做相对比较，而不是只给孤立结论。

### 2.3 Monitoring — 跟踪变化

活跃用户会关心：

- 新 Patch 后谁升了；
- 谁跌了；
- 为什么变化；
- 哪些排名仍然稳定；
- 哪些排名因为新数据出现分歧。

这构成 TierListBase 的持续复访价值。

### 2.4 Validation / Discussion — 验证与讨论

看到排名后，用户天然会继续问：

- 为什么是这个 Tier；
- 别人是否同意；
- 专家、数据和社区是否一致；
- 某个排名是否有争议；
- 自己的实战体验是否不同。

这部分需求决定了终局中需要社区层，但社区必须围绕 Ranking 本身。

---

## 3. 终局的核心产品单位：Game Meta Board

终局仍然以“游戏”为主要用户入口。

一个游戏不是一篇文章，而是一个完整的动态 Meta Board。

例如：

```text
World of Warcraft: Forever
Build / Patch / Updated Time

[ Overall ] [ DPS ] [ Tank ] [ Healer ] [ PvP ] [ Leveling ]

S   ...
A   ...
B   ...
C   ...

Biggest Movers
Best For
Why This Tier
Sources
Expert / Data / Community
Discussion
```

用户应该能够在一个核心体验里：

> **看全局 → 切条件 → 比较 → 理解 → 看变化 → 验证 → 讨论。**

---

## 4. 首页终局

首页不是一个游戏链接目录，也不以 AI 搜索框为核心。

首页的核心职责是：

> **帮助玩家发现哪些游戏 Meta 正在变化，以及快速进入自己关心的游戏。**

长期首页可包含：

### 4.1 Current / Trending Games

展示正在被大量查看或刚发生重大变化的游戏。

每个游戏卡片应该体现状态，而不是只有 Logo：

- 当前 Version / Patch；
- 最近更新时间；
- 最近 Tier 变化数量；
- 当前热门 Ranking；
- 是否有重大 Meta Shift。

### 4.2 Recently Updated

告诉用户：

- 哪些游戏刚更新；
- 哪些榜单刚重新计算；
- 哪些版本刚上线。

### 4.3 Biggest Meta Changes

跨游戏展示：

- 最大 Tier 上升；
- 最大 Tier 下跌；
- 新进入 S Tier；
- 高争议变化。

### 4.4 Explore Games

提供结构化游戏发现入口。

首页的本质不是“所有链接的集合”，而是：

> **整个 TierListBase 当前 Meta 状态的入口面板。**

---

## 5. 游戏页面的长期信息结构

每个游戏终局至少围绕以下几类信息组织：

### 5.1 Current Rankings

核心 Tier List。

根据游戏不同，可能包括：

- Overall
- Role
- Mode
- Patch
- Rank
- Investment
- Platform
- 其他真实用户条件

不是所有游戏都必须拥有相同维度。

### 5.2 Best For

把 Tier List 转成用户任务：

- Best for Beginners
- Best for Solo
- Best for PvP
- Best for Low Investment
- Best Main
- Best Pull

具体分类由游戏需求决定。

### 5.3 Changes

长期保存：

- Previous Tier
- Current Tier
- Change Date
- Change Reason
- Version

让用户看到 Meta 如何变化。

### 5.4 Why This Tier

每个排名应该能解释：

- 为什么；
- 主要优势；
- 主要限制；
- 对哪些条件敏感。

### 5.5 Sources / Evidence

用户应能看到：

- 数据来源；
- 专业来源；
- Source Count；
- Agreement / Disagreement；
- Freshness。

---

## 6. 为什么不能做成 AI 式 Ranking Search Engine

如果 TierListBase 的主要体验变成：

> 用户输入问题 → 系统返回一句最佳答案

那么它很容易被通用大模型替代。

TierListBase 的核心优势必须来自：

- 一次看到完整 Meta；
- 空间化视觉比较；
- 相对位置；
- 多 Context 切换；
- Version / Patch；
- 历史变化；
- 来源分歧；
- 社区反馈；
- 可持续浏览。

AI 可以回答一个问题。

TierListBase 应该让用户：

> **一眼看懂整个局面，并自己发现信息。**

因此终局产品必须保持强视觉、强浏览、强状态感，而不是退化为纯搜索数据库。

---

## 7. 终局社区：必须有，但只围绕 Ranking

TierListBase 的终局应该拥有社区层。

原因不是为了成为“游戏平台社区”，而是因为 Tier List 天然产生：

- 争议；
- 验证；
- 实战反例；
- 用户经验；
- 来源冲突；
- 版本变化后的讨论。

如果完全没有社区，用户在产生疑问后会离开 TierListBase，前往 Reddit / Discord / YouTube Comments。

终局应尽量完成：

> **看排名 → 理解 → 验证 → 表达观点 → 看别人观点**

这一闭环。

---

## 8. 社区的正确形态：Community Around the Ranking

社区内容必须附着在明确的 Ranking / Entity / Change 上。

允许的长期能力可以包括：

- Agree / Disagree
- Community Tier / Community Score
- Comments
- Replies
- Upvote / Helpful
- Report
- 基础用户身份 / Reputation
- Moderation

例如：

```text
Paladin — S Tier

TierListBase Rating: S
Expert Consensus: S
Data Rating: A+
Community Rating: A

82% agree
18% disagree

Top Discussion
...
```

重点是：

> **社区讨论为什么这个 Ranking 对或不对。**

---

## 9. 终局不做什么社区

默认不建设：

- 独立 Community 首页；
- 泛游戏 Posts Feed；
- Subreddit 式版块；
- Friends；
- DMs；
- Groups；
- Social Graph；
- Influencer System；
- 与 Ranking 无关的话题论坛；
- Discord 替代品。

除非未来真实用户行为证明这些功能存在强需求，否则不应为了“社区完整度”加入。

TierListBase 不需要成为：

> **Community about the game**

而应该坚持：

> **Community around the ranking**

---

## 10. Community Rating 与正式 Rating 必须分离

社区票数不能直接决定 TierListBase 的正式排名。

长期应该区分不同视角，例如：

```text
TierListBase Rating
Expert Consensus
Data Rating
Community Rating
```

原因：

- Fan bias
- Brigading
- Bot manipulation
- 新角色情绪
- 小样本
- Creator influence

不同视角之间的差异本身就是重要信息。

例如：

```text
Expert: S
Data: A
Community: S
```

或：

```text
Expert: B
Community: S
```

TierListBase 应展示这种分歧，而不是强行平均成一个“最终真理”。

---

## 11. 社区的长期价值

Ranking-native Community 可以产生 TierListBase 自有的一方数据：

- Community Rating
- Agree / Disagree History
- Patch 前后用户态度变化
- 高频争议 Entity
- 用户评论
- Helpful Votes

长期它会增强：

- Trust
- Retention
- Freshness
- Differentiation
- First-party Data

这也是 TierListBase 相比纯 AI 问答产品更难被完全替代的重要资产之一。

---

## 12. 社区的真实成本

社区前端功能本身并不是最大难点。

真正长期成本是：

- Spam
- Bot
- Harassment
- Hate
- Threats
- Defamation
- Copyright complaints
- Adult / unsafe content
- Personal information exposure
- Ban evasion
- Moderation disputes

因此“Comment + Reply”不能被理解为只有几张数据库表。

社区意味着长期需要：

- Report
- Moderation
- Rate Limit
- Spam Detection
- Account Enforcement
- Audit Trail
- Content Removal
- Appeal / Complaint handling
- Legal / Abuse contact

---

## 13. 法律与合规原则

不能假设“海外言论自由，所以社区基本无需管理”。

TierListBase 是私人平台，可以制定并执行 Community Guidelines。

长期开放 UGC 时，应针对实际运营地区评估并落实：

- 英国 Online Safety Act；
- UK GDPR / Children's Code；
- 欧盟 Digital Services Act；
- 美国 COPPA；
- DMCA notice-and-takedown；
- 诽谤、骚扰和非法内容处理；
- 未成年人保护。

因此：

> **社区应该在核心 Meta Board 产品被验证以后再逐步开放，而不是在 MVP 阶段顺手加入。**

---

## 14. 内容领域边界

当前终局优先定义为：

> **Games**

目标用户是：

> 新玩家、回归玩家、追踪 Meta 的活跃玩家，以及正在做角色 / Class / Champion 选择的人。

动漫、影视等领域未来可以重新评估，但当前不应为了理论上的 Tier List 通用性提前扩展产品定义。

先证明：

> **TierListBase 能否成为玩家查看游戏当前 Meta 的默认目的地。**

---

## 15. 终局竞争力

长期竞争力不应该建立在“我们也有 AI”。

核心应来自：

### 15.1 Visual Meta Experience

用户打开页面就能快速看懂整个游戏当前格局。

### 15.2 Freshness

Version、Build、Patch、Last Updated、Freshness 始终清晰。

### 15.3 Trust

来源、数据、Methodology、Agreement / Disagreement 可追溯。

### 15.4 History

保存长期 Tier 变化和 Meta Shift。

### 15.5 Community Layer

拥有真实玩家的第一方观点和争议数据。

这些共同构成：

> **一个持续更新、可浏览、可验证、可讨论的游戏 Meta 状态系统。**

---

## 16. 长期产品结构

概念上可以理解为：

```text
TierListBase
│
├── Home
│   ├── Trending Games
│   ├── Recently Updated
│   ├── Biggest Meta Changes
│   └── Explore Games
│
├── Game A Meta Board
│   ├── Rankings
│   ├── Best For
│   ├── Changes
│   ├── Why / Sources
│   └── Community
│
├── Game B Meta Board
│   └── ...
│
└── More Games
```

是否需要独立三级 / 四级 URL，由：

- 独立用户需求；
- 独立 SEO Intent；
- 内容深度；

决定。

不能为了网站规模人为拆页。

---

## 17. 终局一句话

TierListBase 最终不是：

> **一个提供 Tier List 答案的网站。**

而是：

> **玩家进入、回归或追踪一个游戏时，用来快速看懂当前 Meta、判断变化、验证排名并参与排名讨论的地方。**

英文 North Star：

> **The place players go to see, understand, and discuss the current meta.**

---

## 18. 与 V1 的关系

本文是长期 North Star，不自动增加 V1 范围。

当前 V1 继续严格执行：

- 仅 World of Warcraft: Forever；
- 仅首页 + 一个核心 Tier List / Meta 页面；
- 无注册；
- 无登录；
- 无支付；
- 无社区；
- Neon + Next.js + Drizzle + Vercel；
- SEO 开启。

V1 的目标是做出：

> **第一个最小可用 Game Meta Board。**

后续版本是否增加社区、更多游戏和更丰富的 Meta 能力，必须基于真实用户需求和使用数据逐步决定。
