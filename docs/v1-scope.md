# TierListBase V1.0 Scope Lock

> Status: **LOCKED — REVISED 2026-10-09**
>
> 本文件仅作为 V1 摘要。正式产品基线见 `docs/v1-requirements.md`，正式技术基线见 `docs/v1-technical-spec.md`。如有冲突，以两份正式文档为准。

## V1 一句话

> **World of Warcraft: Forever 的第一个最小 Game Meta Board，以 `wow forever tier list` 为核心 SEO 入口。**

主 URL：

```text
/wow-forever/tier-list/
```

## V1 必须有

- Tier Board 是页面视觉中心
- Patch / Build / Level / Last Updated / Freshness
- Mode / Role / 有效 Level 的真实 Context Filters
- Class / Spec 详情：Why、优势、限制、适用场景
- Sources / Source Count / Agreement / Disagreement
- Expert 与真实 Data 概念分离
- Ranking Changes / History
- Neon 正式数据库
- SSR / Server Components
- SEO 基础设施
- 真实关键词验证后允许增加 WoW 独立 SEO 子页

## SEO 子页规则

额外 WoW 页面只有同时满足：

1. 有真实独立关键词需求；
2. 有不同用户任务；
3. 有实质不同内容；

才允许建立。

普通 Filter 不自动生成可索引页面。

## V1 明确没有

- Auth / Login / Account
- Payment / Subscription
- Community Voting
- Comments / Replies
- UGC / Tier Maker
- AI 自动排名
- AI Chat 作为核心体验
- News / Wiki / Quest / 完整 Build Guide
- 其他游戏
- 空白占位页
- 大规模 Programmatic SEO

## 可信度原则

不使用“82.7% Meta Confidence”之类神秘分数。

优先展示：

- 4/5 sources agree
- source freshness
- source dates
- Patch / Build match
- data available / unavailable
- disagreement

## V1 验收体验

第一次访问：

- 10 秒看懂当前格局
- 30 秒找到自己场景下值得考虑的职业 / 专精
- 1 分钟理解为什么与有多可信

回访：

- 10 秒知道自上次以后什么变了

V1 的目标不是做完整终局，而是从第一天就以终局正确的产品骨架开始。
