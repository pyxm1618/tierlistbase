# TierListBase 技术方向与关键难点

> 状态：早期技术方向草案  
> 说明：本文用于记录 TierListBase 当前阶段的技术判断、核心难点和实现边界，不是最终架构设计。

## 1. 总体判断

TierListBase 第一版的技术难度属于：

> **中等。**

它不需要训练大模型，也不需要复杂机器学习。

真正困难的部分不是前端页面，而是：

1. 数据模型；
2. 数据采集；
3. 多来源标准化；
4. 评级机制；
5. 版本更新；
6. 数据可信度；
7. 版权和数据库权利边界。

核心技术资产应是：

> **结构化数据库 + 来源体系 + 版本体系 + 透明的评级规则。**

---

## 2. “模型”是什么意思

这里的“模型”不是 AI 大模型。

主要分成两类。

### 2.1 数据模型

数据模型决定：

- 存什么；
- 每个对象之间是什么关系；
- 一个 Tier 是如何和角色、版本、模式、条件关联的。

错误的数据模型会导致后续每扩一个游戏都要重构。

例如不能只存：

```text
Character → S Tier
```

更合理的逻辑是：

```text
Character
+ Game
+ Version
+ Role
+ Game Mode
+ Constellation
+ Investment
+ Team Context
→ Rating
```

核心关系可抽象为：

> **Entity × Context → Rating**

---

### 2.2 评级模型

评级模型指：

> 最终 Tier 是按照什么规则计算或决定的。

例如未来可能综合：

- Expert Rating
- Data Rating
- Consensus Rating
- TierListBase Editorial Rating

再经过一套公开的规则得到最终结果。

这是一套：

> **规则 / 算法机制**

而不是让 ChatGPT 随机决定谁是 S Tier。

---

## 3. 建议的核心数据对象

早期可以至少考虑以下实体。

### 3.1 Game

字段示例：

- id
- name
- slug
- publisher
- current_version
- last_updated

### 3.2 GameVersion

- id
- game_id
- version
- release_date
- status
- notes

### 3.3 Entity / Character

不同游戏未来可能不只是 Character，因此底层可以考虑更通用的 Entity。

字段示例：

- id
- game_id
- name
- slug
- type
- rarity
- role
- element / class / position
- release_version

### 3.4 Context

用来描述评级条件，例如：

- game mode
- role
- constellation
- rank
- platform
- map
- investment level
- team condition

不同游戏允许有不同 Context。

### 3.5 Rating

字段示例：

- entity_id
- context_id
- version_id
- tier
- normalized_score
- rating_type
- source_count
- confidence
- updated_at

### 3.6 Source

必须单独设计来源表。

字段示例：

- name
- url
- source_type
- publisher
- last_checked_at
- version
- freshness_status
- trust_level

### 3.7 SourceRating

保存：

> 某个来源，在某个版本、某个条件下，给某角色什么评级。

这样才能形成 Consensus。

---

## 4. 为什么数据库是核心资产

TierListBase 的页面只是数据的一种表现形式。

如果底层数据正确，同一套数据可以生成：

```text
/genshin-impact/tier-list
/genshin-impact/dps-tier-list
/genshin-impact/f2p-tier-list
/genshin-impact/c0-tier-list
/genshin-impact/spiral-abyss-tier-list
```

也可以复制到：

```text
/honkai-star-rail/
/wuthering-waves/
/zenless-zone-zero/
```

因此：

> **数据库设计的优先级高于具体页面 UI。**

---

## 5. 技术难度拆解

粗略评估：

| 模块 | 难度 |
|---|---|
| Tier List UI | ★★ |
| 搜索 / 筛选 | ★★ |
| SEO 页面生成 | ★★ |
| 管理后台 | ★★ |
| 数据库设计 | ★★★ |
| Compare 功能 | ★★★ |
| Consensus 算法 | ★★★ |
| 多来源采集 | ★★★★ |
| 自动版本更新 | ★★★★ |
| 评级可信度 | ★★★★★ |

最大困难不是：

> “网页能不能写出来”

而是：

> “这个排名是否持续准确、可解释、可维护。”

---

## 6. 数据来源分层

数据不能全部采用同一种采集方式。

### 6.1 第一层：官方事实数据

优先获取：

- 角色名称
- 星级
- 属性
- 武器
- 职业
- 发布时间
- 游戏版本
- 技能基础信息

优先来源：

1. 官方 API；
2. 官方网站；
3. 官方公告；
4. 官方公开数据；
5. 合法开放数据集。

这是最稳定的数据层。

---

### 6.2 第二层：实战 / Meta 数据

可能包括：

- Win Rate
- Pick Rate
- Ban Rate
- Usage Rate
- Clear Rate
- Abyss Usage

不同游戏难度差异很大。

例如竞技游戏通常更容易找到：

- 官方 API；
- 第三方统计 API；
- Match 数据。

但原神这类游戏并不会公开全部 Meta 数据，因此往往需要结合：

- 公开统计；
- 专业社区数据；
- 多个 Tier List；
- 编辑评价。

因此 TierListBase 不能假设所有游戏都能使用同一种数据管线。

---

### 6.3 第三层：专业 Tier List 来源

例如记录：

```text
Source A → S
Source B → S+
Source C → A
Source D → S
```

然后做标准化。

这是 Consensus Tier List 的基础。

需要保存：

- 来源是谁；
- 数据抓取时间；
- 对应版本；
- 原始 Tier；
- 标准化分值；
- 是否仍然有效。

---

## 7. Tier 标准化是关键问题

不同网站使用不同评级体系：

- T0 / T1 / T2
- SS / S / A
- S+ / S / A
- S / A / B / C / D

不能直接平均字符串。

需要建立标准化映射，例如：

```text
100 = top tier
90
80
70
...
```

然后：

```text
Raw Tier
↓
Source-specific normalization
↓
Normalized Score
↓
Consensus Score
↓
Consensus Tier
```

注意：

> 标准化规则本身必须可解释，而且不能频繁随意改变。

---

## 8. Consensus 评级建议

第一阶段不应设计过于复杂。

可以先采用：

```text
可信来源
↓
统一版本过滤
↓
Tier 标准化
↓
剔除过期来源
↓
计算中位数 / 加权平均
↓
形成 Consensus Rating
```

建议同时显示：

- Consensus Tier
- Source count
- Agreement level
- Source disagreement

例如：

```text
Consensus: S
Sources: 7
Agreement: High
Range: A+ – S+
```

这样比单独显示一个 S 更有信息价值。

---

## 9. Freshness / 版本更新机制

这是项目长期运行的核心难点之一。

每个 Rating 必须关联：

- 游戏版本；
- 数据来源版本；
- 更新时间；
- 来源最后检查时间。

至少需要状态：

- Current
- Possibly stale
- Outdated

当游戏发布新版本时，应触发：

1. 创建新版本；
2. 检查新角色；
3. 检查角色调整；
4. 检查玩法变化；
5. 重新检查来源；
6. 标记旧评级；
7. 生成评级变化记录。

未来可以自动化，但第一版允许：

> 自动发现 + 人工审核

而不是追求完全自动。

---

## 10. Changelog 应视为数据，而不是文章

建议保存：

- old_tier
- new_tier
- version
- changed_at
- reason
- evidence

这样可以自动生成：

> Character A: A → S

并让用户知道：

> 为什么升了？

长期来看，这也是 SEO 和用户信任资产。

---

## 11. Trust 是最高难度模块

用户最终会问：

> 你凭什么这么排？

因此任何 Rating 最终都应该能追溯到：

```text
Rating
↓
Context
↓
Version
↓
Sources
↓
Evidence
↓
Methodology
```

一个理想的角色评级卡可能显示：

```text
Tier: S

4/5 expert sources: S or above
Data performance: High
Investment: Medium
Team dependency: Low

Version: 7.1
Updated: 2026-10-xx
Sources: 5
```

核心目标不是追求“绝对正确”，而是：

> **透明、可验证、可解释。**

---

## 12. AI 的正确位置

第一版不应让 AI 决定排名。

AI 更适合做辅助：

- 阅读 Patch Notes；
- 提取角色变化；
- 汇总多个来源；
- 生成变化摘要；
- 生成评级解释草稿；
- 标记来源之间的冲突；
- 检测异常数据；
- 辅助内容翻译。

最终 Tier 应来自：

> 数据 + 规则 + 可追踪来源 + 必要的人审。

---

## 13. 管理后台比想象中重要

建议 MVP 就保留一个轻量后台。

至少支持：

- 新增游戏；
- 新增版本；
- 新增角色；
- 编辑角色属性；
- 新增来源；
- 录入 Source Rating；
- 调整标准化映射；
- 发布 / 撤回 Rating；
- 查看过期来源；
- 查看待审核更新。

如果没有后台，后续每次版本更新都修改代码会非常低效。

---

## 14. 数据采集策略

原则上推荐：

> **官方事实优先，第三方评级作为来源，而不是直接复制整个竞争对手网站。**

数据管线可以分为：

```text
Source
↓
Fetcher / Manual Import
↓
Raw Data
↓
Normalizer
↓
Validation
↓
Review
↓
Published Data
```

第一版不必一开始构建复杂爬虫平台。

可以先：

- 手工录入；
- 半自动脚本；
- API；
- 少量合法抓取。

等确认产品有价值后再提高自动化程度。

---

## 15. 版权与数据权利边界

### 15.1 可以独立使用的内容

通常可以独立处理：

- 客观事实；
- 自己产生的评分；
- 自己设计的算法；
- 自己得出的结论；
- 自己撰写的解释。

但应保存来源以支持事实核验。

---

### 15.2 不应直接复制的内容

不要直接复制：

- 竞争对手原创文章；
- 角色评价文本；
- 页面结构和完整内容；
- 竞争对手的大规模完整数据库；
- 未获得许可的图片、美术和 Logo。

“重新改写几个词”不等于自动规避版权问题。

---

### 15.3 数据库权利风险

尤其面向英国和欧洲时，应注意：

> 数据库中的事实本身不等于整个数据库可以被任意批量复制。

如果竞争对手为了：

- 数据收集；
- 验证；
- 整理；
- 呈现

投入了大量资源，其数据库可能存在独立保护。

因此不建议：

> 整库抓取某一家 Tier List 网站 → 改字段名 → 作为自己的数据库发布。

更合理的是：

> 多来源独立收集 → 标准化 → 自己计算 → 自己解释。

---

## 16. 游戏素材版权要单独处理

角色：

- 头像
- 立绘
- Logo
- 游戏截图

和 Tier 数据不是同一类法律问题。

即使 Tier 数据可以使用，也不代表游戏角色美术可以无限制商业使用。

正式上线前，需要逐个确认：

- 游戏厂商 Fan Content Policy；
- Media Kit；
- 商标政策；
- 商业使用限制。

这应作为独立合规任务处理。

---

## 17. 推荐的技术边界

第一版不要做：

- AI 自动打分；
- 全互联网无差别爬虫；
- 实时更新所有游戏；
- 完整用户账号个性化评分；
- 复杂机器学习排序；
- 大规模社区投票；
- Tier Maker。

先建立：

1. 一个游戏；
2. 一套可靠数据结构；
3. 一套来源机制；
4. 一套标准化方法；
5. 一个版本更新流程；
6. 一个可解释的 Consensus。

---

## 18. MVP 技术目标

V1 已锁定为 World of Warcraft: Forever。首版至少做到：

- 游戏 / 版本或 Build / Class / Spec 数据结构；
- Tier List；
- Role / Mode；
- Search / Filter；
- 来源记录；
- 多来源 Tier 标准化；
- Consensus Rating；
- Version + Updated Date；
- Why this Tier；
- 简单 Changelog；
- 基础管理后台。

暂时不需要：

- AI 推理排名；
- 用户建榜；
- 社区评分；
- 全自动爬虫。

---

## 19. 最核心的三个技术问题

### 19.1 数据标准化

不同来源如何转换成统一评分。

### 19.2 Freshness

新 Patch 出现后：

> 怎么知道哪些数据已经过期？

### 19.3 Trust

每一个 Tier 是否能够回答：

> 为什么？

如果这三件事解决，TierListBase 就开始拥有真正的产品壁垒。

---

## 20. 当前技术结论

TierListBase 并不是一个高门槛 AI 项目。

它更像：

> **结构化排名数据库 + 数据管线 + 版本系统 + 评级引擎 + 内容展示层。**

第一版技术复杂度可控。

真正长期有价值的资产是：

- 数据结构；
- 历史数据；
- 来源记录；
- 标准化规则；
- 版本变化；
- 可信度体系。

因此开发顺序应该是：

> **先定数据模型 → 再定评级机制 → 做 WoW Forever V1 → 用 Genshin Impact 验证第二种游戏模型 → 再扩更多游戏。**
