import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";
import {
  cards,
  cardPools,
  characters,
  potions,
  relics,
  snapshot,
  sources,
} from "@/modules/slay-the-spire-2-tier-list";

describe("Slay the Spire 2 snapshot integrity", () => {
  it("uses the reviewed Main v0.107.1 snapshot without inventing coverage", () => {
    expect(snapshot.date).toBe("2026-11-06");
    expect(snapshot.mainVersion).toBe("v0.107.1");
    expect(snapshot.betaVersion).toBe("v0.111.0");
    expect(snapshot.rankingScope).toBe("Main branch only");
    expect(snapshot.counts).toEqual({
      rawCards: 577,
      cards: 503,
      rankedCards: 402,
      cardsNeedsReview: 101,
      relics: 296,
      rankedRelics: 259,
      relicsNeedsReview: 37,
      characters: 5,
      potions: 63,
      rankedPotions: 63,
      potionsNeedsReview: 0,
    });
  });

  it("keeps IDs unique and card pools mapped to real current objects", () => {
    expect(new Set(cards.map((item) => item.id)).size).toBe(cards.length);
    expect(new Set(relics.map((item) => item.id)).size).toBe(relics.length);
    expect(new Set(potions.map((item) => item.id)).size).toBe(potions.length);
    expect(new Set(characters.map((item) => item.id)).size).toBe(characters.length);
    expect(new Set(cards.map((item) => item.pool))).toEqual(new Set(cardPools));
    for (const card of cards) {
      expect(["S", "A", "B", "C", "D", "Needs Review"]).toContain(card.tier);
      expect(card.sourceIds).toContain("game-data-v01071");
      if (card.pool === "colorless") expect(card.tier).toBe("Needs Review");
      expect(card.image).toMatch(/^https:\/\/spire-codex\.com\/static\/images\/cards\//);
    }
  });

  it("preserves source-native relic and character labels instead of normalizing them", () => {
    for (const relic of relics)
      expect(["S", "A", "B", "C", "D", "E", "F", "G", "Needs Review"]).toContain(relic.tier);
    expect(relics.find((item) => item.name === "Burning Blood")?.tier).toBe("G");
    expect(characters.map((item) => [item.name, item.rank])).toEqual(
      expect.arrayContaining([
        ["The Silent", "Top"],
        ["The Regent", "Top"],
        ["The Necrobinder", "Middle"],
        ["The Ironclad", "Middle"],
        ["The Defect", "Last"],
      ]),
    );
  });

  it("maps every ranked item to a declared evidence source", () => {
    const sourceIds = new Set(sources.map((source) => source.id));
    for (const item of [...cards, ...relics, ...characters, ...potions])
      for (const sourceId of item.sourceIds) expect(sourceIds.has(sourceId)).toBe(true);
    expect(JSON.stringify({ cards, relics, characters, potions })).not.toMatch(
      /\b(TODO|TBD|lorem ipsum|placeholder art|coming soon)\b/i,
    );
  });

  it("registers production SEO, canonical and sitemap using the existing registry", () => {
    const route = "/slay-the-spire-2/tier-list";
    expect(routeRegistry.get(route).class).toBe("public_indexable");
    const metadata = metadataForRoute(routeRegistry, route, "production");
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(
      "https://www.tierlistbase.com/slay-the-spire-2/tier-list",
    );
    expect(routeRegistry.sitemapEntries().some((entry) => entry.route === route)).toBe(true);
  });

  it("keeps asset provenance explicit and the hero as a local formal development asset", () => {
    const root = path.join(process.cwd(), "src/modules/slay-the-spire-2-tier-list/assets");
    const provenance = JSON.parse(readFileSync(path.join(root, "provenance.json"), "utf8")) as {
      key: string;
      asset: string;
      source: string;
      verification: string;
    }[];
    expect(provenance).toHaveLength(5);
    expect(provenance.some((entry) => entry.key === "hero-spire")).toBe(true);
    expect(
      readFileSync(
        path.join(process.cwd(), "public/images/slay-the-spire-2/hero-spire.svg"),
        "utf8",
      ),
    ).toContain("<svg");
  });

  it("reads the reviewed version and snapshot date from the snapshot record, not UI literals", () => {
    expect(snapshot.mainVersion).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(snapshot.betaVersion).toMatch(/^v\d+\.\d+\.\d+$/);

    const component = readFileSync(
      path.join(
        process.cwd(),
        "src/modules/slay-the-spire-2-tier-list/slay-the-spire-2-tier-list.tsx",
      ),
      "utf8",
    );

    // Round 3C: the rendered page must not hardcode a build-specific version or snapshot date.
    expect(component).not.toMatch(/\bv\d+\.\d+\.\d+\b/);
    expect(component).toContain("snapshot.mainVersion");
    expect(component).toContain("snapshot.betaVersion");
    expect(component).toContain("snapshotDateLabel(snapshot.date)");
    expect(component).not.toMatch(
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4}\b/,
    );
  });
});
