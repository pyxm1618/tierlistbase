# WoW Forever 排名数据发布 Runbook

> 状态：CURRENT OPERATING RUNBOOK
> 最近同步：2026-10-23

本文件只说明**以后如何安全刷新/发布 WoW Forever 排名数据**。它不保存某次 PR、某次生产 read-back 或某个旧版本的验收历史。

## 1. 权威入口

发布脚本：

`scripts/update-wow-forever-data.ts`

运行时需要服务端条件：

```bash
bun --conditions=react-server scripts/update-wow-forever-data.ts \
  --review /absolute/path/to/reviewed-context.json
```

默认是 dry-run。

只有明确获得生产写入授权时才追加：

```bash
--publish
```

不要直接用临时 SQL 绕过 publisher。

## 2. 发布前必须确认

Review record 必须来自本次真实检查，而不是复制旧报告。

至少确认：

- 唯一 active phase
- exact phase number / phase name
- 当前 level cap
- 当前官方 Blizzard context/source
- 当前 Forever Logs taxonomy
- 当前 dungeon scope
- 当前 Class::Spec -> Role 映射
- real checkedAt，且满足 publisher freshness policy
- 所有返回数据与 review context 一致

如果 active phase 不唯一、taxonomy 不匹配、上下文错位、响应结构异常或 freshness 过期，停止发布。

## 3. 数据原则

- 不使用“最大 phase id”替代明确 active phase。
- 不用历史静态 role map 覆盖当前已审阅 taxonomy。
- 不因为缺 observation 就创造 observation。
- 不把低样本/低覆盖强行升级为确定排名。
- Pending 必须真实表达证据不足。
- 同一 phase refresh 不能静默删除此前已存的实体/上下文记录。
- 历史版本保留；新 reviewed snapshot 不覆盖历史 snapshot。
- 页面不得把无效/错 phase/不完整 stored performance 当成当前事实。

## 4. Dry-run

任何生产 publish 前先 dry-run。

检查至少包括：

- candidate 总数
- DPS / Tank / Healer 数量
- Pending 数量
- role eligibility
- dungeon coverage
- parse/sample thresholds
- source/version/context
- 与当前已存同 phase 数据的 completeness 对比

Dry-run 有任何未知 taxonomy、缺失必要 context 或 destructive delta 时，先调查，不要靠放宽 gate 让结果通过。

## 5. Production publish

生产写入只使用现有 server-side Secret/数据库配置。

执行时：

1. 使用与 dry-run 完全相同的 review record；
2. 再次确认 review freshness；
3. 执行 `--publish`；
4. 不并行运行第二次 publisher；
5. 不手工补写排名表；
6. 不打印或复制 Secret。

## 6. Read-back

发布后必须做只读 read-back，至少核对：

- current version pointer
- phase metadata
- contexts
- entities / class parent relationship
- ratings
- source ratings/evidence
- role
- score/tier/rank
- parse/coverage
- source checked/retrieved timestamps
- JSON metadata 类型正确

发现 storage-shape 错误时，停止继续写入。先修 publisher/test，再重新 dry-run 和 publish；不要直接手工修生产行来掩盖脚本问题。

## 7. 页面验证

用当前应用代码读取生产数据，至少验证：

- default
- DPS
- Tank
- Healer
- Detail
- source attribution
- Pending/N/A 行为
- freshness/status 文案

页面与数据库结果不一致时，视为发布未完成。

## 8. 失败处理

禁止：

- 为了“凑绿”降低数据 gate；
- 猜测 phase/taxonomy；
- 删除历史数据来规避冲突；
- 用 fixtures 冒充 production acceptance；
- 在聊天、日志或仓库提交 production secrets；
- 在 publisher 失败后直接改 DB 得到想要的结果。

先定位是外部 API、review、publisher、数据库还是 presentation 问题，再在对应边界做最小修复。
