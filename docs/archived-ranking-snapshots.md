# 归档榜单快照 Runbook

> 状态：CURRENT OPERATING RUNBOOK
> 适用：`/wow-forever/tier-list`、`/genshin-impact/tier-list`

这两个页面是归档榜单，排名已冻结，不再按请求读数据库。公开页面读取仓库内的物化快照：

| 页面 | 快照文件 |
| --- | --- |
| WoW Forever | `src/modules/meta-board/db/archived-snapshots/wow-forever.json` |
| Genshin Impact | `src/modules/genshin-tier-list/archived-snapshots/genshin-impact.json` |

## 1. 权威来源不变

数据库仍是唯一权威来源，现有发布工具不变：

- WoW：`scripts/update-wow-forever-data.ts`（需要 `--review` 与 `FOREVER_LOGS_API_KEY`）
- Genshin：`scripts/reviewed-editorial.ts`（导入 `data/editorial/genshin-impact/<version>/`）

快照只是把已发布的结果物化下来，不参与排名计算，也不替代上述工具。

## 2. 刷新快照

任何一次已批准的发布之后，重新导出：

```bash
bun --conditions=react-server scripts/export-archived-ranking-snapshots.ts \
  --database-url-file=/absolute/path/to/.env.local
```

`--database-url-file` 用于避免连接串出现在 argv、shell 历史或日志里；也可以直接用 `DATABASE_URL` 环境变量。
凭据需要对这些表有 `SELECT`：`games`、`game_versions`、`ranking_contexts`、`entities`、`entity_profiles`、
`ratings`、`sources`、`source_ratings`、`rating_changes`、`evidence_observations`。

只导出单个游戏可用 `--games=wow-forever` 或 `--games=genshin-impact`。

脚本是只读的，并且在以下情况**拒绝写入**：

- 某个 WoW 角色没有数据或没有 tier；
- Genshin 快照不可用或角色数为 0；
- Genshin 导出与 `data/editorial/genshin-impact/7.1/` 的已审核 roster 在 tier 或 primaryRole 上不一致；
- editorial 包的 SHA-256 与 `checksums.json` 不符。

## 3. 提交前检查

导出后审阅 JSON diff，重点看：

- `provenance.exportedAt`、`provenance.version`、`provenance.counts` 是否符合本次发布；
- 角色 / 职业 / tier / 证据条数是否与发布记录一致；
- 不应出现凭据或完整数据库端点（`provenance.databaseTarget` 只记录区域）。

然后运行：

```bash
bunx vitest run --config vitest.config.ts tests/unit/meta-board/archived-snapshot.test.ts \
  tests/unit/genshin-tier-list/archived-snapshot.test.ts
```

测试会独立复核：快照覆盖全部归档角色、时间戳可解析、证据齐全、Genshin 每个角色的 tier/role 与
已审核 editorial 包逐条一致，并验证页面读取路径不会触达数据库。

## 4. 数据库读取路径仍然保留

`getGameMetaBoardData` / `getRecentRatingChanges` / `loadGenshinData` 只有在**未显式传入 db 句柄**时才走快照；
显式传入 `db` 的调用（发布器、read-back、集成测试）仍然读真实数据库。查询语义（mode、levelCap、build、
未知 role）与 SQL 路径保持一致，快照不覆盖的查询会自动回退数据库。

## 5. 失败处理

- 快照损坏或时间戳非法：读取路径直接抛错，页面显示既有不可用提示，不会展示未经验证的数据。
- 快照缺失：构建期即失败（registry 静态导入），不会静默回退到运行时数据库。
- 不要手工编辑快照 JSON；重新导出即可。
