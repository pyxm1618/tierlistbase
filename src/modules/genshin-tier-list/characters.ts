export const roles = ["All", "Main DPS", "Sub DPS", "Support"] as const;
export const elements = [
  "All",
  "Pyro",
  "Hydro",
  "Electro",
  "Cryo",
  "Anemo",
  "Geo",
  "Dendro",
] as const;
export type Role = (typeof roles)[number];
export type Element = (typeof elements)[number];

export const tiers = [
  {
    name: "S",
    label: "Exceptional",
    definition: "Exceptional overall performance across the reference endgame conditions.",
    color: "#ff5078",
  },
  {
    name: "A+",
    label: "Highly recommended",
    definition: "Excellent performance with few meaningful limitations.",
    color: "#ffa445",
  },
  {
    name: "A",
    label: "Strong & reliable",
    definition: "Strong and reliable performance in most relevant situations.",
    color: "#ffdc65",
  },
  {
    name: "B+",
    label: "Valuable in context",
    definition: "Strong value when the encounter suits the character's strengths.",
    color: "#ded353",
  },
  {
    name: "B",
    label: "Viable choices",
    definition: "Viable overall, with more noticeable tradeoffs.",
    color: "#8ce881",
  },
  {
    name: "C",
    label: "Situational",
    definition: "Useful in specific conditions, with limited overall flexibility.",
    color: "#67a8ff",
  },
  {
    name: "D",
    label: "Limited effectiveness",
    definition: "Significant constraints reduce overall endgame effectiveness.",
    color: "#c18bff",
  },
  {
    name: "E",
    label: "Niche use",
    definition: "Narrow uses with substantial practical limitations.",
    color: "#b4b9d0",
  },
  {
    name: "F",
    label: "Lowest overall",
    definition: "Lowest relative overall performance under the stated assumptions.",
    color: "#a3a7c0",
  },
  {
    name: "Pending Evaluation",
    label: "Awaiting evidence",
    definition: "Evidence is insufficient or formal evaluation is not yet complete.",
    color: "#bca0ed",
  },
] as const;
export type Tier = (typeof tiers)[number]["name"];

export type Character = {
  id: string;
  name: string;
  element: Exclude<Element, "All">;
  role: Exclude<Role, "All">;
  rarity: 4 | 5;
  tier: Tier;
  why: string;
  strengths: string;
  limitations: string;
  bestUse: string;
  evidence: string;
};

// UI fixtures only. Names identify familiar characters; every assignment and
// rationale below is mock editorial content, not a published character rating.
const characterFixtures: readonly [string, Character["element"], Character["role"], 4 | 5, Tier][] =
  [
    ["Neuvillette", "Hydro", "Main DPS", 5, "S"],
    ["Furina", "Hydro", "Support", 5, "S"],
    ["Arlecchino", "Pyro", "Main DPS", 5, "S"],
    ["Nahida", "Dendro", "Support", 5, "S"],
    ["Zhongli", "Geo", "Support", 5, "S"],
    ["Bennett", "Pyro", "Support", 4, "S"],
    ["Alhaitham", "Dendro", "Main DPS", 5, "A+"],
    ["Raiden Shogun", "Electro", "Sub DPS", 5, "A+"],
    ["Yelan", "Hydro", "Sub DPS", 5, "A+"],
    ["Kaedehara Kazuha", "Anemo", "Support", 5, "A+"],
    ["Hu Tao", "Pyro", "Main DPS", 5, "A+"],
    ["Yae Miko", "Electro", "Sub DPS", 5, "A+"],
    ["Xiangling", "Pyro", "Sub DPS", 4, "A"],
    ["Xingqiu", "Hydro", "Sub DPS", 4, "A"],
    ["Kamisato Ayaka", "Cryo", "Main DPS", 5, "A"],
    ["Ganyu", "Cryo", "Main DPS", 5, "A"],
    ["Shenhe", "Cryo", "Support", 5, "A"],
    ["Sangonomiya Kokomi", "Hydro", "Support", 5, "A"],
    ["Tighnari", "Dendro", "Main DPS", 5, "B+"],
    ["Nilou", "Hydro", "Support", 5, "B+"],
    ["Cyno", "Electro", "Main DPS", 5, "B+"],
    ["Wanderer", "Anemo", "Main DPS", 5, "B+"],
    ["Yoimiya", "Pyro", "Main DPS", 5, "B+"],
    ["Baizhu", "Dendro", "Support", 5, "B+"],
    ["Eula", "Cryo", "Main DPS", 5, "B"],
    ["Arataki Itto", "Geo", "Main DPS", 5, "B"],
    ["Keqing", "Electro", "Main DPS", 5, "B"],
    ["Mona", "Hydro", "Support", 5, "B"],
    ["Jean", "Anemo", "Support", 5, "B"],
    ["Diluc", "Pyro", "Main DPS", 5, "B"],
    ["Klee", "Pyro", "Main DPS", 5, "C"],
    ["Qiqi", "Cryo", "Support", 5, "C"],
    ["Tartaglia", "Hydro", "Main DPS", 5, "C"],
    ["Kaeya", "Cryo", "Sub DPS", 4, "C"],
    ["Lisa", "Electro", "Sub DPS", 4, "C"],
    ["Sayu", "Anemo", "Support", 4, "C"],
    ["Amber", "Pyro", "Support", 4, "D"],
    ["Xinyan", "Pyro", "Support", 4, "D"],
    ["Razor", "Electro", "Main DPS", 4, "D"],
    ["Noelle", "Geo", "Main DPS", 4, "D"],
    ["Thoma", "Pyro", "Support", 4, "D"],
    ["Kujou Sara", "Electro", "Support", 4, "D"],
    ["Aloy", "Cryo", "Main DPS", 5, "E"],
    ["Freminet", "Cryo", "Main DPS", 4, "E"],
    ["Mika", "Cryo", "Support", 4, "E"],
    ["Dori", "Electro", "Support", 4, "E"],
    ["Candace", "Hydro", "Support", 4, "E"],
    ["Collei", "Dendro", "Sub DPS", 4, "E"],
    ["Dehya", "Pyro", "Main DPS", 5, "F"],
    ["Sethos", "Electro", "Main DPS", 4, "F"],
    ["Kaveh", "Dendro", "Main DPS", 4, "F"],
    ["Lynette", "Anemo", "Sub DPS", 4, "F"],
    ["Mavuika", "Pyro", "Main DPS", 5, "Pending Evaluation"],
    ["Citlali", "Cryo", "Support", 5, "Pending Evaluation"],
  ];

export const mockCharacters: Character[] = characterFixtures.map(
  ([name, element, role, rarity, tier]) => ({
    id: name.toLowerCase().replaceAll(" ", "-"),
    name,
    element,
    role,
    rarity,
    tier,
    why:
      tier === "Pending Evaluation"
        ? "Mock: this character has not completed formal evaluation. No ranked tier is assigned."
        : `Mock: this example places ${name} in ${tier} to demonstrate how an overall rationale will be presented. It is not a verified assessment.`,
    strengths: "Mock: reliable contribution when the encounter matches the stated role.",
    limitations:
      "Mock: effectiveness may depend on encounter conditions and investment assumptions.",
    bestUse: "Mock: sustained endgame encounters within the shared Overall context.",
    evidence:
      "Placeholder: official facts, observed performance and editorial cross-check await verification. No verified sources are attached.",
  }),
);

export function filterCharacters(
  characters: readonly Character[],
  search: string,
  role: Role,
  element: Element,
): Character[] {
  const query = search.trim().toLocaleLowerCase("en");
  return characters
    .filter(
      (character) =>
        character.name.toLocaleLowerCase("en").includes(query) &&
        (role === "All" || character.role === role) &&
        (element === "All" || character.element === element),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}
