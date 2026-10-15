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
  element: string;
  primaryRole: Exclude<Role, "All">;
  rarity: 4 | 5;
  weapon: string;
  officialReleaseVersion: string;
  officialUrl: string;
  tier: Tier;
  whyThisTier: string;
  strengths: string[];
  limitations: string[];
  bestUseContext: string;
  rankingAssumption: string;
  evidenceSummary: string;
  updatedAt: string;
  evidenceSources: {
    id: string;
    name: string;
    url: string;
    observationCount: number;
  }[];
};

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
        (role === "All" || character.primaryRole === role) &&
        (element === "All" || character.element.split(" / ").includes(element)),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}
