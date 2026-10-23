# TierListBase 产品方向

> 状态：CURRENT PRODUCT DIRECTION
> 最近同步：2026-10-23

## 1. 产品定义

TierListBase 的核心不是“做很多 Tier List 页面”，也不是做一个 Wiki、媒体站或通用 UGC 排名工具。

核心定义：

> **TierListBase = 帮玩家快速看懂一个游戏当前 Meta 的视觉化、可验证排名系统。**

它需要回答四类真实问题：

1. **Orientation** — 当前环境里谁强、谁弱、整体格局是什么。
2. **Decision** — 我应该选什么角色、职业、专精、队伍或其他决策对象。
3. **Monitoring** — 版本变化以后，哪些排名真的改变了。
4. **Validation** — 为什么这样排，依据是什么，不同来源为什么可能不同。

“Base”的价值是可复用的排名实体、版本、上下文、来源、证据与变化记录，而不是某一张静态榜单。

## 2. 当前产品状态

当前产品已经不是单游戏 V1。

当前 indexable 核心页面包括：

- TierListBase 首页
- WoW Forever Tier List
- Genshin Impact Tier List
- WoW Forever Vanguard
- About

ZZZ、NIKKE、Limbus Company 已存在独立游戏模块/公开页面，但当前路由策略为 public noindex。是否转为 indexable 应按实际内容完整度、搜索意图和 SEO 验收单独决定，而不是因为模块已经存在就自动开放索引。

Vanguard 是 WoW Forever 的社区纪念活动，与 Tier List 主业务联动，但不是 TierListBase 的通用产品形态替代品。

## 3. 核心产品单位：Game Meta Board

长期最重要的产品单位是每个游戏的 **Game Meta Board**。

一个成熟的游戏页优先包含：

- Current Rankings
- Context / Mode / Version
- Best For / Use Case
- Changes
- Why This Tier
- Sources / Evidence
- Freshness / Last Updated

第一屏必须先帮助用户得到答案；解释和证据服务于信任，而不是抢占主榜单。

## 4. 排名必须带上下文

“谁最强”通常不是无条件问题。

排名至少要能够表达：

- 游戏版本
- 模式 / 内容类型
- 角色、职业、专精或其他被排名实体
- 职责 / Role
- 数据或编辑证据
- 新鲜度
- 适用条件与局限

不同上下文需要不同榜单或筛选，不要把本质不同的对象硬塞进一张榜。

## 5. 数据与可信度原则

正式排名与证据必须可区分：

- 已审阅事实
- 数据观察
- 编辑判断
- 暂无足够证据 / Pending
- 社区意见（未来如启用）

缺数据时展示未知或 Pending，不伪造确定性。

来源数量本身不是目标。优先保留能解释排名、可追溯且与当前版本匹配的来源。

## 6. Freshness 是核心能力

Tier List 最大问题之一是过期。

产品应该让用户知道：

- 当前版本是什么；
- 数据/来源何时检查；
- 排名何时发布；
- 是否仍满足当前 freshness policy；
- 与上一个有效版本相比发生了什么。

更新机制应优先于无限增加静态 SEO 页面。

## 7. 首页方向

首页长期应成为整个 TierListBase 的 Meta 入口，而不是简单游戏目录。

优先结构：

- Current / Trending Games
- Recently Updated
- Biggest Meta Changes
- Explore Games

只有已有真实数据时才展示“变化”和“最近更新”，不要用假动态填充首页。

## 8. 社区方向

长期可以有社区层，但只能围绕 Ranking 服务。

可接受方向包括：

- Community Rating / Vote
- 对正式榜单的讨论
- 对证据或变化的反馈

正式 Rating 与 Community Rating 必须分离。社区意见不能静默覆盖正式排名。

不把 TierListBase 做成 Reddit / Discord 替代品，也不为了社区而增加与排名无关的通用社交功能。

## 9. 内容扩张原则

是否新增一个游戏、榜单或 SEO 页面，看它是否解决独立用户任务，而不是“能不能做”。

值得新增通常需要同时满足：

- 存在独立搜索或浏览需求；
- 排名对象/上下文有清晰边界；
- 有足够真实数据或可审阅依据；
- 页面能比现有页提供新的决策价值；
- 有持续更新路径。

同义关键词不应拆成多个低价值页面。

## 10. 当前非目标

除非有独立需求验证，不优先做：

- 大型 Wiki；
- 泛游戏新闻；
- 通用论坛/私信系统；
- AI 问答替代整个浏览体验；
- 大量低差异 SEO 页；
- 为了“功能完整”而开启支付、积分、订阅等当前没有产品需求的能力。

## 11. 终局

TierListBase 的终局不是“Tier List 搜索引擎”，而是：

> **The place players go to see, understand, and verify the current meta.**

竞争力来自五件事：

1. **Visual Meta Experience**
2. **Freshness**
3. **Trust / Evidence**
4. **History / Changes**
5. **Ranking-centered Community**

任何新功能都应至少增强其中一项，否则默认不进入产品范围。
