"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  changesByMode,
  characterById,
  characters,
  elementOptions,
  evidenceSources,
  insightsByMode,
  methodologyFaq,
  modeOptions,
  roleOptions,
  tierCopy,
  weaponOptions,
  type CharacterScores,
  type GenshinElement,
  type GenshinMode,
  type GenshinRole,
  type GenshinTier,
  type GenshinWeapon,
} from "./data";
import styles from "./genshin-tier-list.module.css";

const TIERS: GenshinTier[] = ["S", "A", "B", "C"];
const detailTabs = ["综合评价", "详细数据", "培养建议", "配队推荐", "版本变化", "来源佐证"] as const;
type DetailTab = (typeof detailTabs)[number];

const elementColors: Record<GenshinElement, string> = {
  水: "#2f9bff",
  火: "#ff654f",
  冰: "#7ad8ff",
  雷: "#a779ff",
  风: "#52d6be",
  岩: "#d5a73d",
  草: "#79c84c",
};

export function GenshinTierList() {
  const [mode, setMode] = useState<GenshinMode>("abyss");
  const [role, setRole] = useState<GenshinRole | "all">("all");
  const [element, setElement] = useState<GenshinElement | "all">("all");
  const [rarity, setRarity] = useState<4 | 5 | "all">("all");
  const [weapon, setWeapon] = useState<GenshinWeapon | "all">("all");
  const [selectedId, setSelectedId] = useState("neuvillette");
  const [detailTab, setDetailTab] = useState<DetailTab>("综合评价");

  const filtered = useMemo(
    () =>
      characters.filter((character) => {
        if (role !== "all" && !character.roles.includes(role)) return false;
        if (element !== "all" && character.element !== element) return false;
        if (rarity !== "all" && character.rarity !== rarity) return false;
        if (weapon !== "all" && character.weapon !== weapon) return false;
        return true;
      }),
    [element, rarity, role, weapon],
  );

  const selected =
    filtered.find((character) => character.id === selectedId) ??
    filtered[0] ??
    characters.find((character) => character.id === selectedId) ??
    characters[0]!;

  const modeLabel = modeOptions.find((option) => option.value === mode)?.label ?? "当前模式";
  const selectedTier = selected.tiers[mode];

  const groups = TIERS.map((tier) => ({
    tier,
    items: filtered.filter((character) => character.tiers[mode] === tier),
  }));

  function resetFilters() {
    setMode("abyss");
    setRole("all");
    setElement("all");
    setRarity("all");
    setWeapon("all");
    setSelectedId("neuvillette");
    setDetailTab("综合评价");
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero} data-ia-section="ranking-context" aria-labelledby="genshin-title">
          <Image
            src="/images/genshin-tier/hero.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 100vw, 1800px"
            className={styles.heroImage}
          />
          <div className={styles.heroShade} />
          <div className={styles.heroContent}>
            <div className={styles.breadcrumb}>Home　›　Genshin Impact　›　Tier List</div>
            <div className={styles.heroGrid}>
              <div className={styles.heroTitleBlock}>
                <div className={styles.gameBadge}>✦ Genshin Impact</div>
                <div>
                  <h1 id="genshin-title">Genshin Impact Tier List</h1>
                  <p>
                    基于多方数据与分析的角色强度决策页面。当前为设计与信息架构演示，
                    后续将用真实数据、版本和证据替换演示内容。
                  </p>
                </div>
              </div>
              <dl className={styles.statusGrid}>
                <StatusCard label="当前版本" value="5.2（演示）" />
                <StatusCard label="更新时间" value="2024-12-10" sub="演示日期" />
                <div className={styles.statusCard}>
                  <dt>数据状态</dt>
                  <dd className={styles.demoStatus}><span /> 演示数据</dd>
                  <small>仅供结构验证，非实时</small>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className={styles.filters} data-ia-section="game-specific-filters" aria-label="角色筛选条件">
          <FilterSelect label="游戏模式" value={mode} onChange={(value) => setMode(value as GenshinMode)}>
            {modeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="角色定位" value={role} onChange={(value) => setRole(value as GenshinRole | "all")}>
            <option value="all">全部定位</option>
            {roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </FilterSelect>
          <FilterSelect label="元素" value={element} onChange={(value) => setElement(value as GenshinElement | "all")}>
            <option value="all">全部元素</option>
            {elementOptions.map((option) => <option key={option} value={option}>{option}元素</option>)}
          </FilterSelect>
          <FilterSelect label="稀有度" value={String(rarity)} onChange={(value) => setRarity(value === "all" ? "all" : Number(value) as 4 | 5)}>
            <option value="all">全部稀有度</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★</option>
          </FilterSelect>
          <FilterSelect label="武器类型" value={weapon} onChange={(value) => setWeapon(value as GenshinWeapon | "all")}>
            <option value="all">全部武器</option>
            {weaponOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </FilterSelect>
          <button type="button" onClick={resetFilters} className={styles.resetButton}>↻　重置筛选</button>
        </section>

        <section className={styles.decisionGrid} aria-label="Tier Board 与角色详情">
          <div className={styles.board} data-ia-section="tier-board">
            <div className={styles.boardMeta}>
              <div>
                <strong>{modeLabel} · 当前排名</strong>
                <span>纯筛选条件只缩小角色集合；游戏模式切换 Ranking Context。</span>
              </div>
              <span>{filtered.length} 个角色</span>
            </div>
            {groups.map(({ tier, items }) => (
              <div className={styles.tierRow} key={tier}>
                <div className={styles.tierLabel} data-tier={tier}>
                  <b>{tier}</b>
                  <strong>{tierCopy[tier].title}</strong>
                  <span>{tierCopy[tier].description}</span>
                </div>
                <div className={styles.characterGrid}>
                  {items.length > 0 ? (
                    items.map((character) => {
                      const active = selected.id === character.id;
                      return (
                        <button
                          type="button"
                          key={character.id}
                          className={active ? styles.characterCardActive : styles.characterCard}
                          onClick={() => {
                            setSelectedId(character.id);
                            setDetailTab("综合评价");
                          }}
                          aria-pressed={active}
                          data-character-name={character.name}
                        >
                          <span
                            className={styles.characterPortrait}
                            style={{ "--element-color": elementColors[character.element] } as React.CSSProperties}
                            aria-hidden="true"
                          >
                            {character.name.slice(0, 1)}
                          </span>
                          <span className={styles.elementTag} style={{ color: elementColors[character.element] }}>
                            ● {character.element}
                          </span>
                          <strong>{character.name}</strong>
                          <span className={styles.stars}>{"★".repeat(character.rarity)}</span>
                          <span className={styles.roleTag}>{character.roleLabel}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className={styles.emptyTier}>当前筛选下没有属于此 Tier 的角色。</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <aside className={styles.detailPanel} data-ia-section="selected-entity-detail" aria-live="polite">
            <div className={styles.detailHero}>
              <div
                className={styles.detailPortrait}
                style={{ "--element-color": elementColors[selected.element] } as React.CSSProperties}
                aria-hidden="true"
              >
                {selected.name.slice(0, 1)}
              </div>
              <div className={styles.detailIdentity}>
                <h2>{selected.name}</h2>
                <div className={styles.detailMeta}>
                  <span>{selected.roleLabel}</span>
                  <span style={{ color: elementColors[selected.element] }}>● {selected.element}元素</span>
                  <span>{selected.weapon}</span>
                  <span>{selected.rarity}星</span>
                </div>
              </div>
              <div className={styles.bigTier} data-tier={selectedTier}>
                <b>{selectedTier}</b>
                <span>{tierCopy[selectedTier].title}</span>
              </div>
              <RadarChart scores={selected.scores} />
            </div>

            <div className={styles.detailTabs} role="tablist" aria-label="角色详情">
              {detailTabs.map((tab) => (
                <button
                  type="button"
                  key={tab}
                  role="tab"
                  aria-selected={detailTab === tab}
                  className={detailTab === tab ? styles.detailTabActive : styles.detailTab}
                  onClick={() => setDetailTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className={styles.detailBody} role="tabpanel">
              <DetailContent tab={detailTab} selectedId={selected.id} mode={mode} />
            </div>
          </aside>
        </section>

        <div className={styles.supportGrid}>
          <section className={styles.supportCard} data-ia-section="quick-insights" aria-labelledby="insights-title">
            <header>
              <div>
                <span>💡</span>
                <h2 id="insights-title">快速洞察</h2>
              </div>
              <small>{modeLabel}</small>
            </header>
            <div className={styles.insightGrid}>
              {insightsByMode[mode].map((insight) => {
                const character = characterById(insight.characterId);
                return (
                  <article key={insight.label}>
                    <span>{insight.label}</span>
                    <strong>{character?.name ?? "待定"}</strong>
                    <small>{insight.note}</small>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.supportCard} data-ia-section="version-changes" aria-labelledby="changes-title">
            <header>
              <div>
                <span>🏆</span>
                <h2 id="changes-title">版本变化</h2>
              </div>
              <small>演示变化记录</small>
            </header>
            <div className={styles.changeList}>
              {changesByMode[mode].map((change) => {
                const character = characterById(change.characterId);
                return (
                  <div key={change.characterId}>
                    <strong>{character?.name ?? change.characterId}</strong>
                    <span className={change.direction === "down" ? styles.down : styles.up}>
                      {change.from} → {change.to}
                    </span>
                    <small>{change.reason}</small>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.supportCard} data-ia-section="sources-evidence" aria-labelledby="sources-title">
            <header>
              <div>
                <span>🗄</span>
                <h2 id="sources-title">数据来源与排名证据</h2>
              </div>
              <small>真实来源待接入</small>
            </header>
            <p className={styles.demoNotice}>
              当前全部为演示占位。来源类别不等于证据；真实版本必须保存具体来源、版本、更新时间、
              支持的结论与数据局限。
            </p>
            <div className={styles.sourceList}>
              {evidenceSources.map((source) => (
                <article key={source.name}>
                  <div>
                    <strong>{source.name}</strong>
                    <span>{source.type}</span>
                  </div>
                  <p>{source.scope}</p>
                  <small>{source.note}</small>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.supportCard} data-ia-section="methodology-faq" aria-labelledby="faq-title">
            <header>
              <div>
                <span>📄</span>
                <h2 id="faq-title">评级方法与常见问题</h2>
              </div>
              <small>V1 方法说明</small>
            </header>
            <div className={styles.faqList}>
              {methodologyFaq.map((item, index) => (
                <details key={item.question}>
                  <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={styles.statusCard}>
      <dt>{label}</dt>
      <dd>{value}</dd>
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.filterControl}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function DetailContent({ tab, selectedId, mode }: { tab: DetailTab; selectedId: string; mode: GenshinMode }) {
  const character = characterById(selectedId)!;
  const change = changesByMode[mode].find((item) => item.characterId === selectedId);
  const team = character.team.map((id) => characterById(id)).filter(Boolean);

  if (tab === "详细数据") {
    return (
      <div className={styles.metricGrid}>
        <Metric label="输出能力" value={character.scores.output} />
        <Metric label="对群能力" value={character.scores.aoe} />
        <Metric label="生存能力" value={character.scores.survivability} />
        <Metric label="辅助能力" value={character.scores.utility} />
        <Metric label="泛用性" value={character.scores.versatility} />
        <p className={styles.metricDisclaimer}>以上为演示指标，用于验证字段与布局；没有真实算法前不得作为正式评分发布。</p>
      </div>
    );
  }

  if (tab === "培养建议") {
    return (
      <section>
        <h3>培养重点（演示）</h3>
        <ul className={styles.bulletList}>{character.buildTips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
      </section>
    );
  }

  if (tab === "配队推荐") {
    return (
      <section>
        <h3>推荐队友（演示）</h3>
        <div className={styles.teamList}>
          {team.map((member) => member ? (
            <div key={member.id}>
              <span style={{ color: elementColors[member.element] }}>●</span>
              <strong>{member.name}</strong>
              <small>{member.roleLabel}</small>
            </div>
          ) : null)}
        </div>
      </section>
    );
  }

  if (tab === "版本变化") {
    return (
      <section>
        <h3>最近变化</h3>
        {change ? (
          <div className={styles.changeDetail}>
            <strong>{change.from} → {change.to}</strong>
            <p>{change.reason}</p>
          </div>
        ) : (
          <p className={styles.muted}>当前演示 Context 中没有记录该角色的 Tier 变化。</p>
        )}
      </section>
    );
  }

  if (tab === "来源佐证") {
    return (
      <section>
        <h3>当前证据状态</h3>
        <div className={styles.evidenceWarning}>
          真实 Genshin 数据源尚未接入。V1 不会用“93% 可信度”等神秘分数替代证据；
          正式数据必须能回溯到具体来源、版本、更新时间和支持的结论。
        </div>
      </section>
    );
  }

  return (
    <>
      <div className={styles.summaryStrip}>
        <div><span>综合评级</span><strong>{character.tiers[mode]}</strong></div>
        <div><span>当前模式</span><strong>{modeOptions.find((item) => item.value === mode)?.label}</strong></div>
        <div><span>稀有度</span><strong>{character.rarity} 星</strong></div>
      </div>
      <p className={styles.characterSummary}>{character.summary}</p>
      <div className={styles.proConGrid}>
        <section className={styles.proBox}>
          <h3>✓ 优势</h3>
          <ul>{character.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className={styles.conBox}>
          <h3>✕ 劣势</h3>
          <ul>{character.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </div>
      <section className={styles.bestFor}>
        <h3>适用场景</h3>
        <div>{character.bestFor.map((item) => <span key={item}>{item}</span>)}</div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value.toFixed(1)}</strong>
      <div><i style={{ width: String(value * 10) + "%" }} /></div>
    </div>
  );
}

function RadarChart({ scores }: { scores: CharacterScores }) {
  const values = [scores.output, scores.aoe, scores.survivability, scores.versatility, scores.utility];
  const points = values
    .map((value, index) => {
      const angle = (-90 + index * 72) * (Math.PI / 180);
      const radius = 46 * (value / 10);
      return String(60 + Math.cos(angle) * radius) + "," + String(60 + Math.sin(angle) * radius);
    })
    .join(" ");

  return (
    <div className={styles.radar} aria-label="演示能力雷达图">
      <svg viewBox="0 0 120 120" role="img">
        <polygon points="60,10 108,45 90,102 30,102 12,45" className={styles.radarOuter} />
        <polygon points="60,27 92,50 80,88 40,88 28,50" className={styles.radarInner} />
        <polygon points={points} className={styles.radarValue} />
      </svg>
      <span>演示指标</span>
    </div>
  );
}
