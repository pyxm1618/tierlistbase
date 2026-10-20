export type SinnerName =
  | "Yi Sang"
  | "Faust"
  | "Don Quixote"
  | "Ryōshū"
  | "Meursault"
  | "Hong Lu"
  | "Heathcliff"
  | "Ishmael"
  | "Rodion"
  | "Sinclair"
  | "Outis"
  | "Gregor";

export type Rarity = "0" | "00" | "000";

export type DamageType = "Slash" | "Pierce" | "Blunt";

export type SinAffinity = "Wrath" | "Lust" | "Sloth" | "Gluttony" | "Gloom" | "Pride" | "Envy";

export type ReleaseContext = "Seasonal" | "Standard Fare" | "Walpurgisnacht" | "Event" | "Pass";

export type EgoRiskLevel = "ZAYIN" | "TETH" | "HE" | "WAW" | "ALEPH";

export type TierLevel = "SSS" | "SS" | "S" | "A" | "B" | "C";

export type TierLevelWithReview = TierLevel | "NEEDS_REVIEW";

export type ScaleGrade = "S" | "A" | "B";

export type BeginnerGrade = "A" | "B" | "C";

export type HighMediumLow = "High" | "Medium" | "Low";

export type EgoImportance = "Core" | "High" | "Medium";

export type IdentityRole = "DPS" | "Clash Specialist" | "Tank" | "Support" | "Debuffer" | "Enabler";

export type TeamCategory = "Status" | "Faction" | "Mechanic" | "Hybrid";

/**
 * 客观事实获取状态 (Availability Facts)
 * 允许在数据源发生冲突或无法实机确认时保留 null，并通过 reviewNote 详细记录
 */
export interface AvailabilityFact {
  /** 当前卡池是否可直接抽出 */
  extractableNow: boolean | null;
  /** 当前 Dispenser (碎片兑换箱) 是否可直接合成 */
  dispensableNow: boolean | null;
  /** 是否为瓦尔普吉斯之夜专属限定 */
  isWalpurgisnacht: boolean;
  /** 是否处于跨季锁箱/闭锁临时不可获取期 */
  temporarilyUnavailable: boolean;
  /** 官方获取途径注解或特定活动说明 */
  acquisitionNote: string | null;
  /** 客观获取状态存在存疑或冲突时的审阅说明 */
  reviewNote?: string;
}

/**
 * Identity 客观事实 (Facts)
 */
export interface IdentityFact {
  id: string;
  identityName: string;
  sinner: SinnerName;
  rarity: Rarity;
  damageTypes: DamageType[];
  sinAffinities: SinAffinity[];
  seasonNumber: number | null;
  releaseContext: ReleaseContext;
  releaseDate: string | null;
  factions: string[];
  availability: AvailabilityFact;
  sourceUrls: string[];
  /** 客观事实存在冲突或缺损时的审阅备注 */
  reviewNote?: string;
}

/**
 * Identity TierListBase 主观评级 (Editorial)
 */
export interface IdentityEditorial {
  overallTier: TierLevelWithReview;
  role: IdentityRole;
  archetype: string;
  generalistValue: ScaleGrade;
  beginnerFriendly: BeginnerGrade;
  teamDependency: HighMediumLow;
  notes?: string;
}

/**
 * Identity 完整 Master Record
 */
export interface IdentityRecord {
  fact: IdentityFact;
  editorial: IdentityEditorial;
}

/**
 * E.G.O 客观事实 (Facts)
 */
export interface EgoFact {
  id: string;
  egoName: string;
  sinner: SinnerName;
  riskLevel: EgoRiskLevel;
  sinCost: Partial<Record<SinAffinity, number>>;
  seasonNumber: number | null;
  releaseContext: ReleaseContext;
  releaseDate: string | null;
  availability: AvailabilityFact;
  sourceUrls: string[];
  reviewNote?: string;
}

/**
 * E.G.O TierListBase 主观评级 (Editorial)
 */
export interface EgoEditorial {
  tier: TierLevelWithReview;
  generalist: ScaleGrade;
  teamImportance: EgoImportance;
  bestTeam: string;
  bestUseCase: string;
  notes?: string;
}

/**
 * E.G.O 完整 Master Record
 */
export interface EgoRecord {
  fact: EgoFact;
  editorial: EgoEditorial;
}

/**
 * 完整 Team 构筑 Master Record
 */
export interface TeamRecord {
  id: string;
  /** 社区/来源中的真实常用名称 */
  teamName: string;
  /** TierListBase 编辑部自定义标签或展示修饰名（非官方或社区常用名） */
  editorialLabel?: string;
  category: TeamCategory;
  keyMechanic: string;
  powerTier: TierLevel;
  storyGeneral: TierLevel;
  mirrorDungeon: TierLevel;
  railwayEndgame: TierLevel;
  buildCost: HighMediumLow;
  coreDependency: HighMediumLow;
  flexibility: HighMediumLow;
  easeOfUse: HighMediumLow;
  beginnerFriendly: HighMediumLow;
  /** 核心成员 (完整人格名称，不得使用代称) */
  coreMembers: string[];
  /** 完整推荐实战主力队伍 (完整人格名称) */
  recommendedTeam: string[];
  /** 候补/下位替代成员 (完整人格名称) */
  substitutes: string[];
  /** 关键绑定/联动 E.G.O */
  keyEgo: string[];
  /** 缺失核心时的优先补强目标 / 下一步建议 */
  whatToGetNext: string;
  /** 队伍实战说明或评级注解 */
  notes?: string;
}

/**
 * 单个 Sinner 派生的最佳选型
 */
export interface SinnerPickItem {
  name: string;
  context: string;
}

export interface SinnerBestIdentity {
  sinner: SinnerName;
  bestOverall: SinnerPickItem;
  bestGeneralist: SinnerPickItem;
  bestForTeam: SinnerPickItem;
}

export interface SinnerBestEgo {
  sinner: SinnerName;
  bestOverall: SinnerPickItem;
  bestGeneralist: SinnerPickItem;
  bestForTeam: SinnerPickItem;
}

export interface MasterSourceMetadata {
  gameVersion: string;
  season: string;
  sourceUpdatedAt: string;
  reviewedAt: string;
  identitiesCount: number;
  egoCount: number;
  teamsCount: number;
  sinnersCoveredCount: number;
  primarySources: Array<{
    name: string;
    url: string;
    role: string;
  }>;
  reviewNotes: string[];
}
