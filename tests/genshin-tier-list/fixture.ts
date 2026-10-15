import characters from "../../data/editorial/genshin-impact/7.1/character-master.json";
import ratings from "../../data/editorial/genshin-impact/7.1/ratings.json";

// Approved package, kept outside production imports. Deliberately non-alphabetical
// to ensure the board never treats row order as a ranking within a tier.
export const reviewedRows = characters
  .map((character) => {
    const rating = ratings.find((row) => row.entitySlug === character.slug)!;
    return {
      id: character.slug,
      name: character.name,
      metadata: character,
      ratingId: `rating-${character.slug}`,
      profileId: character.slug,
      ...rating,
      strengths: JSON.stringify(rating.strengths),
      constraints: JSON.stringify(rating.limitations),
      updatedAt: new Date("2026-10-14T12:00:00Z"),
    };
  })
  .reverse();
