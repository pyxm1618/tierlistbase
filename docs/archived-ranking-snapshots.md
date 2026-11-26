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
- 数据库版本不是合法的路径片段（防止路径逃逸）；
- 数据库版本对应的 `data/editorial/genshin-impact/<version>/` 不存在（**不会退回旧版本包**）；
- 该包 `manifest.json` 的 game / gameVersion / rankingContext / reviewStatus 与数据库不一致；
- Genshin 导出与该版本包的已审核 roster 在 tier 或 primaryRole 上不一致；
- 包的 SHA-256 与 `checksums.json` 不符。

editorial 包路径由**数据库版本**推导，不再写死。新增版本时必须同时提交该版本的已审核包，否则导出直接失败。

## 2.1 只读对生产数据做同源核对

```bash
bun --conditions=react-server scripts/verify-archived-snapshot-parity.ts \
  --database-url-file=/absolute/path/to/.env.local
```

该脚本在 `BEGIN READ ONLY` 事务内重跑仓库自身的查询函数，把提交的快照与数据库逐字段比对（覆盖全部导出字段）：
WoW 三个角色的 board 与 changes、Genshin 全量 data、以及版本与 editorial 包绑定；同时复核 editorial checksums。

每个数据集输出两个内容哈希：

- `strict`：数组按快照存储顺序比较（即实际渲染顺序），**MATCH 要求 strict 相等**；
- `ordered`：数组按元素内容排序后比较，用于区分「内容不同」与「仅顺序不同」。

退出码 0 仅当所有数据集 strict 相等且 checksums 通过。凭据只从环境变量或文件读取，不打印。

### 2.2 如何确认连接目标就是生产 Worker 使用的数据源

快照的哈希只能证明「与所连数据库一致」，不能证明「所连数据库就是生产」。生产页面本身提供了一个毫秒级指纹：
Genshin 页头展示的 `Ranking Data Captured` 直接来自 `max(ratings.updated_at)`。

```bash
# 1) 读生产页面展示的抓取时间（公开页面，无需凭据）
curl -s https://www.tierlistbase.com/genshin-impact/tier-list \
  | grep -o 'dateTime="[0-9T:.Z-]*"'
```

```sql
-- 2) 在只读事务里取同一字段（不写入）
begin read only;
select max(r.updated_at) as updated_at
from ratings r
join entities e on e.id = r.entity_id
join games g on g.id = e.game_id
where g.slug = 'genshin-impact';
rollback;
```

两者到毫秒一致，才能认定所连数据库就是生产数据源。辅助指纹（同样的只读方式）：

- `select count(*) from ratings` → 148（Genshin 121 + WoW 27）
- `select gv.version, gv.level_cap from game_versions gv join games g on g.id = gv.game_id where g.slug = 'wow-forever'` → `Beta` / `30`，
  与 WoW 页面 `Archived Beta Phase / Version` 及 `Level Cap Context` 显示一致。

三个指纹同时一致才记录为「已确认同源」。仅凭主机名、更新时间相同或 provenance 声明不构成证明。

## 2.3 变更历史的查询覆盖边界

`rating_changes` 快照只覆盖导出时抓取的那个窗口（每角色 `changesLimit = 10` 条）。因此读取路径只在能证明完整时使用快照：

| 查询 | 行为 |
| --- | --- |
| 同时给出 `rankingContextId` + `toVersionId`，且该组合已导出，`limit ≤ changesLimit` | 用快照 |
| 只给 `toVersionId`，且该版本在 `coverage.versions` 中 `complete: true` | 用快照（跨上下文汇总） |
| 只给 `toVersionId`，但该版本 `complete: false` | 回退 SQL |
| 只给 `rankingContextId`（跨版本） | 回退 SQL |
| 不给过滤条件（跨全部版本） | 回退 SQL |
| `limit > changesLimit` | 回退 SQL |
| Context / Version 不在快照中 | 回退 SQL |

**未覆盖不等于不存在**：只有落在覆盖范围内且确实无记录时，才返回空数组。`complete` 由导出器在导出时证明
（该版本的 `availableRoles` 全部导出，且不存在其它 mode / level cap），写进 `provenance.coverage`。

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
