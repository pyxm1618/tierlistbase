export type GenshinMode = "abyss" | "overworld";
export type GenshinTier = "S" | "A" | "B" | "C";
export type GenshinElement = "水" | "火" | "冰" | "雷" | "风" | "岩" | "草";
export type GenshinWeapon = "单手剑" | "双手剑" | "长柄武器" | "弓" | "法器";
export type GenshinRole = "主C" | "副C" | "辅助" | "治疗" | "护盾";

export type CharacterScores = {
  output: number;
  aoe: number;
  survivability: number;
  utility: number;
  versatility: number;
};

export type GenshinCharacter = {
  id: string;
  name: string;
  element: GenshinElement;
  rarity: 4 | 5;
  weapon: GenshinWeapon;
  roles: GenshinRole[];
  roleLabel: string;
  tiers: Record<GenshinMode, GenshinTier>;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  scores: CharacterScores;
  team: string[];
  buildTips: string[];
};

export type GenshinChange = {
  characterId: string;
  from: GenshinTier;
  to: GenshinTier;
  direction: "up" | "down" | "stable";
  reason: string;
};

export const modeOptions: { value: GenshinMode; label: string }[] = [
  { value: "abyss", label: "深渊螺旋" },
  { value: "overworld", label: "大世界探索" },
];

export const tierCopy: Record<GenshinTier, { title: string; description: string }> = {
  S: { title: "版本顶级", description: "在当前演示场景中处于第一梯队" },
  A: { title: "强势选择", description: "在特定场景表现优秀且具有培养价值" },
  B: { title: "有特定价值", description: "需要合适队伍或场景才能发挥优势" },
  C: { title: "场景受限", description: "当前演示环境中存在明显限制或更优替代" },
};

export const elementOptions: GenshinElement[] = ["水", "火", "冰", "雷", "风", "岩", "草"];
export const weaponOptions: GenshinWeapon[] = ["单手剑", "双手剑", "长柄武器", "弓", "法器"];
export const roleOptions: GenshinRole[] = ["主C", "副C", "辅助", "治疗", "护盾"];

export const characters: GenshinCharacter[] = [
  {
    id: "neuvillette",
    name: "那维莱特",
    element: "水",
    rarity: 5,
    weapon: "法器",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "S", overworld: "S" },
    summary: "演示结论：持续输出、范围伤害与操作稳定性都很突出，是当前概念数据中的高优先级主C。",
    strengths: ["持续输出能力强", "范围覆盖优秀", "操作节奏稳定", "队伍要求相对宽松"],
    weaknesses: ["对打断抗性较敏感", "需要一定站场时间", "部分队伍依赖特定反应支持"],
    bestFor: ["深渊持续作战", "群体环境", "希望操作稳定的玩家"],
    scores: { output: 9.8, aoe: 9.2, survivability: 8.5, utility: 7.5, versatility: 9.0 },
    team: ["furina", "kazuha", "zhongli"],
    buildTips: ["优先保证核心输出属性", "围绕持续站场安排辅助时间轴", "根据队伍补足抗打断或生存能力"],
  },
  {
    id: "furina",
    name: "芙宁娜",
    element: "水",
    rarity: 5,
    weapon: "单手剑",
    roles: ["副C", "辅助"],
    roleLabel: "副C/辅助",
    tiers: { abyss: "S", overworld: "S" },
    summary: "演示结论：兼具后台伤害与团队增益，在多种队伍中具备较高泛用性。",
    strengths: ["团队增益覆盖广", "后台输出稳定", "适配多种主C"],
    weaknesses: ["队伍生命变化管理更重要", "完整收益依赖队伍配置"],
    bestFor: ["多核队伍", "需要团队增益的体系"],
    scores: { output: 8.4, aoe: 8.1, survivability: 6.8, utility: 9.7, versatility: 9.8 },
    team: ["neuvillette", "baizhu", "kazuha"],
    buildTips: ["优先保证技能循环", "与治疗角色形成稳定联动"],
  },
  {
    id: "kazuha",
    name: "枫原万叶",
    element: "风",
    rarity: 5,
    weapon: "单手剑",
    roles: ["辅助", "副C"],
    roleLabel: "辅助",
    tiers: { abyss: "S", overworld: "S" },
    summary: "演示结论：聚怪、减抗和增伤能力让他成为元素队伍中的高泛用辅助。",
    strengths: ["聚怪能力强", "元素增益优秀", "大世界体验好"],
    weaknesses: ["面对不可聚怪目标收益下降"],
    bestFor: ["元素输出队", "群怪环境", "大世界探索"],
    scores: { output: 6.8, aoe: 8.6, survivability: 7.0, utility: 9.8, versatility: 9.6 },
    team: ["neuvillette", "furina", "bennett"],
    buildTips: ["优先保证元素精通与循环", "根据敌人分布安排聚怪窗口"],
  },
  {
    id: "nahida",
    name: "纳西妲",
    element: "草",
    rarity: 5,
    weapon: "法器",
    roles: ["辅助", "副C"],
    roleLabel: "副C/辅助",
    tiers: { abyss: "S", overworld: "S" },
    summary: "演示结论：草元素附着和反应体系覆盖能力出色，队伍构筑空间很大。",
    strengths: ["草附着稳定", "反应体系核心", "后台能力强"],
    weaknesses: ["部分队伍更依赖元素反应搭配"],
    bestFor: ["草反应体系", "多目标环境"],
    scores: { output: 8.0, aoe: 8.8, survivability: 6.5, utility: 9.5, versatility: 9.2 },
    team: ["alhaitham", "yelan", "baizhu"],
    buildTips: ["围绕反应队伍配置属性", "保证技能覆盖与后台时间"],
  },
  {
    id: "zhongli",
    name: "钟离",
    element: "岩",
    rarity: 5,
    weapon: "长柄武器",
    roles: ["护盾", "辅助"],
    roleLabel: "护盾/辅助",
    tiers: { abyss: "S", overworld: "S" },
    summary: "演示结论：高稳定护盾显著降低操作压力，适合强调舒适度与容错的队伍。",
    strengths: ["护盾稳定", "容错率高", "适配范围广"],
    weaknesses: ["纯输出贡献有限"],
    bestFor: ["高压环境", "需要抗打断的主C", "新手队伍"],
    scores: { output: 4.5, aoe: 5.0, survivability: 10, utility: 9.4, versatility: 9.3 },
    team: ["neuvillette", "hu-tao", "yoimiya"],
    buildTips: ["优先保证护盾覆盖", "按队伍需要平衡生存与辅助能力"],
  },
  {
    id: "bennett",
    name: "班尼特",
    element: "火",
    rarity: 4,
    weapon: "单手剑",
    roles: ["辅助", "治疗"],
    roleLabel: "治疗/辅助",
    tiers: { abyss: "S", overworld: "A" },
    summary: "演示结论：治疗与攻击增益兼具，仍是大量输出体系中的低成本高价值辅助。",
    strengths: ["增益直接", "治疗稳定", "培养成本相对友好"],
    weaknesses: ["增益区域有站位限制"],
    bestFor: ["攻击力体系", "低成本队伍"],
    scores: { output: 4.8, aoe: 4.0, survivability: 8.0, utility: 9.6, versatility: 9.0 },
    team: ["raiden", "xiangling", "kazuha"],
    buildTips: ["优先保证充能循环", "根据队伍安排爆发释放窗口"],
  },
  {
    id: "arlecchino",
    name: "阿蕾奇诺",
    element: "火",
    rarity: 5,
    weapon: "长柄武器",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "A", overworld: "A" },
    summary: "演示结论：单体持续输出强，但对输出窗口与生存管理有更高要求。",
    strengths: ["单体输出高", "爆发窗口明确"],
    weaknesses: ["操作失误成本较高", "生存管理要求更高"],
    bestFor: ["单体高压环境", "熟悉输出节奏的玩家"],
    scores: { output: 9.2, aoe: 7.0, survivability: 5.7, utility: 4.0, versatility: 7.6 },
    team: ["bennett", "kazuha", "zhongli"],
    buildTips: ["稳定完成核心输出循环", "优先解决生存与抗打断问题"],
  },
  {
    id: "raiden",
    name: "雷电将军",
    element: "雷",
    rarity: 5,
    weapon: "长柄武器",
    roles: ["主C", "辅助"],
    roleLabel: "主C/辅助",
    tiers: { abyss: "A", overworld: "A" },
    summary: "演示结论：兼具充能支持与爆发输出，在成熟体系中仍具较高价值。",
    strengths: ["充能支持", "爆发集中", "体系成熟"],
    weaknesses: ["不同队伍中的定位差异较大"],
    bestFor: ["循环型队伍", "爆发窗口明确的环境"],
    scores: { output: 8.7, aoe: 8.0, survivability: 7.0, utility: 8.6, versatility: 8.5 },
    team: ["bennett", "xiangling", "xingqiu"],
    buildTips: ["优先保证循环", "根据队伍决定输出或辅助权重"],
  },
  {
    id: "alhaitham",
    name: "艾尔海森",
    element: "草",
    rarity: 5,
    weapon: "单手剑",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "A", overworld: "A" },
    summary: "演示结论：草反应体系下输出上限较高，但对技能节奏和队伍搭配有要求。",
    strengths: ["反应输出高", "单体与多目标兼顾"],
    weaknesses: ["操作节奏要求较高"],
    bestFor: ["草反应体系", "熟悉机制的玩家"],
    scores: { output: 9.0, aoe: 8.1, survivability: 6.5, utility: 5.8, versatility: 8.0 },
    team: ["nahida", "yelan", "baizhu"],
    buildTips: ["围绕镜片节奏安排输出", "保持草反应覆盖"],
  },
  {
    id: "yelan",
    name: "夜兰",
    element: "水",
    rarity: 5,
    weapon: "弓",
    roles: ["副C", "辅助"],
    roleLabel: "副C/辅助",
    tiers: { abyss: "A", overworld: "S" },
    summary: "演示结论：后台水伤、增伤与跑图能力兼具，适合需要灵活副C的队伍。",
    strengths: ["后台输出强", "增益实用", "探索移动优秀"],
    weaknesses: ["部分队伍对充能要求较高"],
    bestFor: ["普攻驱动队伍", "大世界探索"],
    scores: { output: 8.8, aoe: 7.5, survivability: 6.8, utility: 8.7, versatility: 9.2 },
    team: ["hu-tao", "xingqiu", "zhongli"],
    buildTips: ["保证充能循环", "根据队伍补足生命与输出属性"],
  },
  {
    id: "xiangling",
    name: "香菱",
    element: "火",
    rarity: 4,
    weapon: "长柄武器",
    roles: ["副C"],
    roleLabel: "副C",
    tiers: { abyss: "A", overworld: "A" },
    summary: "演示结论：后台火伤与成熟反应队伍让她保持较高性价比。",
    strengths: ["后台范围伤害", "低成本高收益"],
    weaknesses: ["充能需求高", "常与班尼特绑定"],
    bestFor: ["反应队伍", "低成本配队"],
    scores: { output: 8.5, aoe: 8.6, survivability: 5.5, utility: 5.0, versatility: 8.6 },
    team: ["bennett", "raiden", "xingqiu"],
    buildTips: ["优先解决充能", "让技能循环与队伍增益对齐"],
  },
  {
    id: "xingqiu",
    name: "行秋",
    element: "水",
    rarity: 4,
    weapon: "单手剑",
    roles: ["副C", "辅助"],
    roleLabel: "副C/辅助",
    tiers: { abyss: "A", overworld: "A" },
    summary: "演示结论：后台水附着、减伤和抗打断形成稳定的综合价值。",
    strengths: ["水附着稳定", "减伤与抗打断", "适配体系多"],
    weaknesses: ["技能循环依赖充能"],
    bestFor: ["普攻驱动队伍", "蒸发/绽放体系"],
    scores: { output: 8.0, aoe: 6.8, survivability: 7.8, utility: 8.8, versatility: 9.3 },
    team: ["hu-tao", "xiangling", "raiden"],
    buildTips: ["保证充能", "按队伍节奏释放技能"],
  },
  {
    id: "yoimiya",
    name: "宵宫",
    element: "火",
    rarity: 5,
    weapon: "弓",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "B", overworld: "A" },
    summary: "演示结论：单体输出直接，但面对群体和频繁打断时更依赖队伍保护。",
    strengths: ["单体输出稳定", "操作逻辑清晰"],
    weaknesses: ["群体能力有限", "需要抗打断支持"],
    bestFor: ["单体环境", "远程输出偏好"],
    scores: { output: 8.0, aoe: 4.8, survivability: 5.2, utility: 3.8, versatility: 6.5 },
    team: ["yelan", "zhongli", "bennett"],
    buildTips: ["优先保证完整普攻段", "搭配护盾提高输出稳定性"],
  },
  {
    id: "hu-tao",
    name: "胡桃",
    element: "火",
    rarity: 5,
    weapon: "长柄武器",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "B", overworld: "B" },
    summary: "演示结论：爆发与单体能力仍有价值，但输出操作与生存管理要求更高。",
    strengths: ["单体爆发高", "成熟蒸发体系"],
    weaknesses: ["操作门槛较高", "生命值管理要求高"],
    bestFor: ["单体Boss", "熟悉取消动作的玩家"],
    scores: { output: 8.7, aoe: 5.5, survivability: 5.4, utility: 3.5, versatility: 6.8 },
    team: ["yelan", "xingqiu", "zhongli"],
    buildTips: ["围绕蒸发覆盖输出", "控制生命区间与抗打断"],
  },
  {
    id: "shenhe",
    name: "申鹤",
    element: "冰",
    rarity: 5,
    weapon: "长柄武器",
    roles: ["辅助"],
    roleLabel: "辅助",
    tiers: { abyss: "B", overworld: "B" },
    summary: "演示结论：在冰元素专属体系中价值明确，但跨体系泛用性有限。",
    strengths: ["冰系专属增益强"],
    weaknesses: ["队伍适配范围窄"],
    bestFor: ["冰元素主C体系"],
    scores: { output: 4.5, aoe: 4.5, survivability: 6.0, utility: 8.8, versatility: 5.2 },
    team: ["ayaka", "kazuha", "furina"],
    buildTips: ["围绕冰系主C构筑", "保证辅助技能覆盖输出窗口"],
  },
  {
    id: "ayaka",
    name: "神里绫华",
    element: "冰",
    rarity: 5,
    weapon: "单手剑",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "B", overworld: "B" },
    summary: "演示结论：爆发窗口依旧集中，但对冻结环境和敌人类型较敏感。",
    strengths: ["爆发集中", "冰系体系成熟"],
    weaknesses: ["面对不可冻结目标体验下降"],
    bestFor: ["冻结队", "可控输出窗口"],
    scores: { output: 8.2, aoe: 7.6, survivability: 6.2, utility: 4.0, versatility: 6.6 },
    team: ["shenhe", "kazuha", "furina"],
    buildTips: ["确保爆发命中完整", "围绕冻结或减抗窗口输出"],
  },
  {
    id: "yae",
    name: "八重神子",
    element: "雷",
    rarity: 5,
    weapon: "法器",
    roles: ["副C"],
    roleLabel: "副C",
    tiers: { abyss: "B", overworld: "A" },
    summary: "演示结论：后台输出舒适，但完整收益更依赖站场时间与反应体系。",
    strengths: ["后台输出稳定", "大世界舒适"],
    weaknesses: ["部署动作占用时间"],
    bestFor: ["激化体系", "大世界"],
    scores: { output: 7.8, aoe: 7.4, survivability: 5.6, utility: 4.8, versatility: 7.5 },
    team: ["nahida", "baizhu", "kazuha"],
    buildTips: ["合理安排杀生樱部署", "结合激化体系提升收益"],
  },
  {
    id: "baizhu",
    name: "白术",
    element: "草",
    rarity: 5,
    weapon: "法器",
    roles: ["治疗", "辅助"],
    roleLabel: "治疗/辅助",
    tiers: { abyss: "B", overworld: "A" },
    summary: "演示结论：治疗和草体系辅助兼具，稳定性高但纯输出贡献有限。",
    strengths: ["治疗稳定", "草体系适配好"],
    weaknesses: ["输出贡献有限"],
    bestFor: ["草反应队", "需要稳定治疗的队伍"],
    scores: { output: 3.8, aoe: 4.0, survivability: 9.1, utility: 8.8, versatility: 8.0 },
    team: ["nahida", "alhaitham", "furina"],
    buildTips: ["优先保证治疗与循环", "根据队伍补充充能"],
  },
  {
    id: "klee",
    name: "可莉",
    element: "火",
    rarity: 5,
    weapon: "法器",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "B", overworld: "B" },
    summary: "演示结论：仍可在合适体系输出，但操作距离与动作节奏限制较明显。",
    strengths: ["火伤直接", "范围爆发尚可"],
    weaknesses: ["手感要求高", "攻击距离短"],
    bestFor: ["偏好近距离法器输出的玩家"],
    scores: { output: 7.3, aoe: 6.8, survivability: 4.8, utility: 3.2, versatility: 5.5 },
    team: ["bennett", "kazuha", "zhongli"],
    buildTips: ["利用护盾提高输出完整度", "熟悉动作节奏后再追求上限"],
  },
  {
    id: "keqing",
    name: "刻晴",
    element: "雷",
    rarity: 5,
    weapon: "单手剑",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "C", overworld: "B" },
    summary: "演示结论：激化体系能改善表现，但同定位仍存在更高效率选择。",
    strengths: ["机动性高", "激化体系可用"],
    weaknesses: ["输出上限受限"],
    bestFor: ["激化玩法", "大世界机动"],
    scores: { output: 7.0, aoe: 6.4, survivability: 6.5, utility: 4.0, versatility: 6.2 },
    team: ["nahida", "kazuha", "baizhu"],
    buildTips: ["围绕激化反应构筑", "利用机动性维持输出节奏"],
  },
  {
    id: "eula",
    name: "优菈",
    element: "冰",
    rarity: 5,
    weapon: "双手剑",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "C", overworld: "B" },
    summary: "演示结论：物理爆发仍有特色，但当前演示环境中的泛用性较低。",
    strengths: ["单次爆发高", "玩法辨识度强"],
    weaknesses: ["爆发容易受敌人机制影响", "体系选择有限"],
    bestFor: ["物理玩法爱好者"],
    scores: { output: 7.2, aoe: 5.8, survivability: 6.3, utility: 2.8, versatility: 4.5 },
    team: ["raiden", "zhongli", "bennett"],
    buildTips: ["确保爆发窗口完整", "搭配减抗与充能支持"],
  },
  {
    id: "diluc",
    name: "迪卢克",
    element: "火",
    rarity: 5,
    weapon: "双手剑",
    roles: ["主C"],
    roleLabel: "主C",
    tiers: { abyss: "C", overworld: "B" },
    summary: "演示结论：操作直观但输出效率偏传统，适合作为稳定易懂的火系主C。",
    strengths: ["操作直观", "循环简单"],
    weaknesses: ["同定位输出竞争激烈"],
    bestFor: ["新手主C过渡", "传统蒸发队"],
    scores: { output: 6.9, aoe: 6.0, survivability: 6.3, utility: 3.0, versatility: 5.8 },
    team: ["xingqiu", "bennett", "kazuha"],
    buildTips: ["保证蒸发覆盖", "保持技能与普攻穿插节奏"],
  },
  {
    id: "jean",
    name: "琴",
    element: "风",
    rarity: 5,
    weapon: "单手剑",
    roles: ["治疗", "辅助"],
    roleLabel: "治疗/辅助",
    tiers: { abyss: "C", overworld: "A" },
    summary: "演示结论：治疗、风套与探索能力兼具，但在专门化辅助比较中优势不突出。",
    strengths: ["治疗直接", "功能全面", "探索舒适"],
    weaknesses: ["专项增益能力有限"],
    bestFor: ["通用治疗位", "大世界探索"],
    scores: { output: 5.2, aoe: 5.5, survivability: 8.5, utility: 7.4, versatility: 8.0 },
    team: ["furina", "neuvillette", "bennett"],
    buildTips: ["根据队伍需求选择治疗或辅助属性", "保证爆发循环"],
  },
  {
    id: "qiqi",
    name: "七七",
    element: "冰",
    rarity: 5,
    weapon: "单手剑",
    roles: ["治疗"],
    roleLabel: "治疗",
    tiers: { abyss: "C", overworld: "B" },
    summary: "演示结论：治疗量高但功能集中，队伍增益与能量循环较弱。",
    strengths: ["治疗量高", "生存稳定"],
    weaknesses: ["功能单一", "能量循环弱"],
    bestFor: ["只需要高治疗量的场景"],
    scores: { output: 3.2, aoe: 3.0, survivability: 9.5, utility: 5.0, versatility: 4.8 },
    team: ["eula", "raiden", "zhongli"],
    buildTips: ["优先保证治疗覆盖", "通过队伍其他位置补足能量与增益"],
  },
];

export const changesByMode: Record<GenshinMode, GenshinChange[]> = {
  abyss: [
    {
      characterId: "neuvillette",
      from: "A",
      to: "S",
      direction: "up",
      reason: "演示：持续输出与覆盖能力在当前概念环境中进一步提升。",
    },
    {
      characterId: "alhaitham",
      from: "B",
      to: "A",
      direction: "up",
      reason: "演示：草反应体系在当前场景中的综合表现提升。",
    },
    {
      characterId: "raiden",
      from: "S",
      to: "A",
      direction: "down",
      reason: "演示：同定位竞争加剧，当前场景相对排名下降。",
    },
    {
      characterId: "klee",
      from: "C",
      to: "B",
      direction: "up",
      reason: "演示：特定配队下的表现改善，但仍受操作与距离限制。",
    },
  ],
  overworld: [
    {
      characterId: "yelan",
      from: "A",
      to: "S",
      direction: "up",
      reason: "演示：移动能力与后台输出在探索场景权重更高。",
    },
    {
      characterId: "jean",
      from: "C",
      to: "A",
      direction: "up",
      reason: "演示：治疗、风系功能与探索舒适度在大世界场景更加重要。",
    },
  ],
};

export const insightsByMode: Record<
  GenshinMode,
  { label: string; characterId: string; note: string }[]
> = {
  abyss: [
    { label: "最强输出", characterId: "neuvillette", note: "演示结论" },
    { label: "最泛用辅助", characterId: "kazuha", note: "演示结论" },
    { label: "最佳治疗", characterId: "baizhu", note: "演示结论" },
    { label: "最佳泛用角色", characterId: "furina", note: "演示结论" },
  ],
  overworld: [
    { label: "探索机动", characterId: "yelan", note: "演示结论" },
    { label: "最泛用辅助", characterId: "kazuha", note: "演示结论" },
    { label: "最稳生存", characterId: "zhongli", note: "演示结论" },
    { label: "综合泛用", characterId: "furina", note: "演示结论" },
  ],
};

export const evidenceSources = [
  {
    name: "官方公告（演示占位）",
    type: "官方",
    scope: "版本内容与角色调整说明",
    updated: "待接真实来源",
    note: "可证明版本改动，不直接证明 Tier 结论。",
  },
  {
    name: "公开实战统计（演示占位）",
    type: "数据",
    scope: "深渊或公开战斗数据",
    updated: "待接真实来源",
    note: "未来用于支持使用率、表现与场景数据；当前未接入。",
  },
  {
    name: "专业攻略（演示占位）",
    type: "专家",
    scope: "角色机制与配队分析",
    updated: "待接真实来源",
    note: "未来逐条记录来源、适用版本与支持的判断。",
  },
  {
    name: "公开社区信号（演示占位）",
    type: "公开讨论",
    scope: "仅作外部参考信号",
    updated: "待接真实来源",
    note: "V1 不建立站内投票或社区评分，也不把讨论直接等同于事实。",
  },
] as const;

export const methodologyFaq = [
  {
    question: "我们如何进行角色评级？",
    answer:
      "V1 将评级限定在明确的 Ranking Context 中；当前页面使用演示数据验证信息架构。真实上线后，只有经过版本、场景和来源校验的数据才进入最终 Tier。",
  },
  {
    question: "S / A / B / C 分别代表什么？",
    answer:
      "它们表达当前场景下的相对决策优先级，而不是角色的永久强弱。不同模式可以得到不同结果。",
  },
  {
    question: "不同游戏模式的排名有什么区别？",
    answer:
      "模式会改变 Ranking Context。深渊更看重限时战斗表现，大世界会提高探索、舒适度和泛用能力的权重。",
  },
  {
    question: "Tier List 多久更新一次？",
    answer:
      "真实版本将随有证据支持的版本变化更新，并保留历史变化。当前演示日期不是实时更新承诺。",
  },
  {
    question: "为什么不同网站的排名不一样？",
    answer:
      "不同榜单可能使用不同版本、场景、评价维度和数据源。TierListBase 的目标是把这些前提和证据显式展示。",
  },
  {
    question: "高 Tier 是否意味着所有玩家都应该培养？",
    answer:
      "不是。Tier 只回答当前场景下的相对强度与决策价值；角色喜好、账号资源、操作习惯和已有队伍仍然重要。",
  },
] as const;

export function characterById(id: string): GenshinCharacter | undefined {
  return characters.find((character) => character.id === id);
}
