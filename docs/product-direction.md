# TierListBase 产品方向与需求大纲

> 状态：早期产品方向草案  
> 说明：本文不是正式 PRD，而是当前阶段已经形成的产品判断、用户需求与范围边界。后续应在验证首个核心页面（Genshin Impact Tier List）后继续迭代。

## 1. 项目定位

TierListBase 不应只是“再做一个 Tier List 网站”，也不应在第一阶段直接做成 TierMaker 式的 UGC 排名工具。

当前更合理的方向是：

> **TierListBase = 一个结构化排名数据库，告诉用户谁更好、为什么更好、在什么条件下更好，以及其他可信来源怎么看。**

英文可概括为：

> **A structured ranking database that shows what is best, why, under what conditions, and what credible sources think.**

“Base”意味着核心资产不是某一张榜，而是底层可复用的排名数据、上下文、来源和版本记录。

---

## 2. 首个切入点

第一阶段以：

- **Genshin Impact Tier List**

作为首个核心页面和验证场景。

原神适合作为第一个模板，因为它同时具备：

- 大量角色；
- 高频版本更新；
- 不同玩法模式；
- 命座、队友、投入度等复杂条件；
- 用户明确存在“抽谁、练谁、谁更强”的决策需求；
- 市场上已有大量 Tier List，可用于验证产品差异化。

但 TierListBase 的底层结构不能只为原神设计，应保证后续可扩展到：

- Honkai: Star Rail
- Wuthering Waves
- Zenless Zone Zero
- League of Legends
- Valorant
- Brawl Stars
- Marvel Rivals
- 其他游戏

动漫、影视、音乐、体育、Food 等“观点型 Tier List”可以作为更后期方向，不应成为 MVP 重点。

---

## 3. 对 Tier List 用户需求的核心理解

用户搜索 “tier list” 表面是在问：

> 谁最强？

实际上通常在问：

- 我应该抽谁？
- 我应该练谁？
- 当前版本谁最强？
- 谁最适合我的账号？
- 谁适合 F2P / 低投入？
- 谁适合特定模式？
- 没有某个关键队友还能不能用？
- 某角色为什么是 S Tier？
- 为什么不同网站排名不一样？
- 新版本里谁升了、谁降了？
- 两个角色到底该选谁？

因此，Tier List 本质上不是简单的排名内容，而是一种：

> **决策界面。**

用户完整行为链更接近：

> **发现 → 理解 → 比较 → 决策**

---

## 4. Tier List 的两大类型

### 4.1 Utility Tier List

用于真实决策。

典型场景：

- 原神：抽谁、练谁、不同模式谁更强；
- LoL：当前版本、位置、段位下谁更强；
- Valorant：地图、段位、版本下谁更适合；
- Brawl Stars：基于真实胜率、选取率判断 Meta。

这是 TierListBase 第一阶段应该重点服务的类型。

### 4.2 Opinion Tier List

用于表达观点和社交。

例如：

- 最喜欢的动漫角色；
- 最强反派；
- 最好看的角色设计；
- 最佳电影；
- 最喜欢的水果。

这种需求更接近 TierMaker 的 UGC 模型。

第一阶段不建议把它作为核心。

---

## 5. 当前产品原则

### 5.1 第一层极简

用户进入页面后，应在几秒钟内看到真正的 Tier List。

不能因为加入复杂条件而把首页做成 Excel。

首屏应快速提供：

- 当前版本；
- Tier List；
- 角色头像；
- S / A / B / C 等等级；
- 基础筛选。

### 5.2 第二层解释

点击角色后，用户应知道：

- 为什么是这个 Tier；
- 角色适合什么定位；
- 适合什么模式；
- 是否依赖特定队友；
- 投入要求高不高；
- 操作难度如何。

### 5.3 第三层决策

进一步回答：

- 值不值得抽；
- 值不值得练；
- 与另一个角色相比应该选谁；
- 是否适合当前账号；
- 当前版本是否值得投入资源。

---

## 6. 原神页面的核心信息结构

第一版不一定全部实现，但底层方向应支持：

### 6.1 Tier List 主体

- Overall
- Spiral Abyss
- Stygian Onslaught
- Exploration（可后置）

角色维度：

- Main DPS
- Sub DPS / Damage Support
- Support / Sustain

筛选：

- Search
- Element
- Rarity
- Weapon
- Constellation（后续）

### 6.2 角色卡 / 详情

建议逐步支持：

- Overall Tier
- Role Tier
- Mode Tier
- Constellation context
- Investment level
- Team dependency
- Skill requirement
- Best partners
- Flexibility
- Pull Value
- Build Value
- Account Value
- Why this tier
- Pros / Cons
- Version
- Last updated
- Tier change
- Reason for change
- Sources

---

## 7. 最大的用户痛点

### 7.1 Tier List 缺少上下文

同一个角色在不同条件下结果可能不同：

- C0 vs C2
- 有无专武
- 有无关键队友
- Abyss vs Stygian
- 高手 vs 普通玩家
- 高投入 vs 低投入

因此不能简单理解为：

> Character = Tier

更合理的是：

> **Entity × Context → Rating**

---

### 7.2 不同网站排名不一致

用户会问：

> 为什么这个站是 S，另一个站是 A？

这会直接产生信任问题。

TierListBase 应明确：

- 评级依据；
- 来源；
- 更新时间；
- 版本；
- 评分条件；
- 是否存在来源分歧。

---

### 7.3 榜单容易过期

游戏 Tier List 对版本高度敏感。

必须长期展示：

- Game Version
- Last Updated
- Changelog
- Tier movement
- Source freshness

过期的 Tier List 价值极低。

---

## 8. Consensus Tier List 是重要方向

TierListBase 不必声称：

> “我们的主观判断一定最正确。”

可以引入多个可信来源形成共识。

例如：

- Source A: S
- Source B: S+
- Source C: A
- Source D: S

标准化后得到：

- Consensus score
- Consensus tier
- Source count
- Source disagreement

未来可形成：

- Expert Rating
- Data Rating
- Consensus Rating
- TierListBase Rating

这是 TierListBase 与普通攻略站之间最有潜力形成差异化的部分之一。

---

## 9. 不建议第一阶段做的事情

暂不把以下内容作为核心：

- 大规模 Community Voting；
- Tier List Maker；
- 用户拖拽制作自己的榜单；
- Anime / Movies / Food 等泛娱乐分类；
- AI 自动决定 Tier；
- 过度复杂的个性化账号分析。

这些都可以后续扩展，但会显著分散第一阶段注意力。

---

## 10. 当前产品定义

现阶段可以把 TierListBase 定义为：

> **一个可信、透明、带上下文、可持续更新的 Tier List 数据库。**

它需要回答四个问题：

1. **谁更强？**
2. **为什么？**
3. **在什么条件下？**
4. **其他可信来源怎么看？**

---

## 11. 第一阶段成功标准

第一阶段先证明：

- 用户打开 Genshin Impact Tier List 后能快速得到答案；
- 排名结果有明确上下文；
- 用户能理解为什么某角色处于某个 Tier；
- 榜单明确标注版本和更新时间；
- 来源和评级规则透明；
- 数据结构可以复制到第二个游戏，而不是为原神单独重写。

如果首个页面验证成功，再扩展：

> Genshin → HSR → WuWa / ZZZ → 其他游戏

而不是一开始追求覆盖所有 Tier List 领域。
