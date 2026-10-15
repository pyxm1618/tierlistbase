import type { GenshinData } from "./data";
import { tiers } from "./characters";
import styles from "./genshin-tier-list.module.css";

const methodology = [
  ["Endgame Performance", "Performance in challenging endgame content."],
  ["Team Contribution", "Value provided to the team and its overall performance."],
  ["Flexibility", "Usefulness across multiple relevant compositions and encounters."],
  ["Replaceability", "How easily comparable alternatives provide the same value."],
  ["Consistency", "Reliable performance across different scenarios."],
] as const;
const evidence = [
  ["Official Facts", "Character facts and official version information."],
  ["Observed Performance Data", "Observed endgame performance with recorded context."],
  ["Editorial Cross-check", "Mechanics and analysis checked against documented evidence."],
] as const;
const faq = [
  [
    "How is this Genshin Impact Tier List created?",
    "The list considers Endgame Performance, Team Contribution, Flexibility, Replaceability and Consistency. Official facts, observed performance data and editorial cross-check provide the evidence structure. Current ratings use reviewed database records.",
  ],
  ["What version is this Tier List for?", "The current database version is {version}."],
  [
    "What endgame content is considered?",
    "The scope is Endgame Overall. Reference encounters and team contexts are recorded in each character’s reviewed Best-use Context.",
  ],
  [
    "What investment level is assumed?",
    "5★ characters use C0 / No Signature Weapon. 4★ characters use C6 / Accessible 4★ Weapon. The same baseline applies throughout the Overall list.",
  ],
  [
    "Why do characters move between tiers?",
    "A character may move when reviewed evidence changes the overall assessment under the shared assumptions. New Characters are derived from official release versions; Tier Changes show recorded version history.",
  ],
  [
    "Can lower-tier characters still clear endgame?",
    "Tiers describe relative overall value under stated assumptions, not a guarantee or a restriction on clearing content. Encounter conditions and execution still matter.",
  ],
] as const;

export function GenshinChanges({ data }: { data: GenshinData }) {
  const newCharacters = data.characters.filter(
    (character) => character.officialReleaseVersion === data.version,
  );
  return (
    <section className={styles.changes} data-ia-section="changes" aria-labelledby="changes-heading">
      <h2 id="changes-heading">
        <span aria-hidden="true">▤</span> What&apos;s Changed
      </h2>
      <p className={styles.label}>Version {data.version}</p>
      <h3>New Characters</h3>
      <ul>
        {newCharacters.map((character) => (
          <li key={character.id}>
            <span className={styles.newBadge}>NEW</span>
            <strong>{character.name}</strong>
            <span>Official release version {data.version}</span>
          </li>
        ))}
      </ul>
      <h3>Tier Changes</h3>
      {data.changes.length ? (
        <ul>
          {data.changes.map((change) => (
            <li key={change.id}>
              <span className={styles.moveBadge}>
                {change.previousTier} → {change.newTier}
              </span>
              <strong>{change.name}</strong>
              {change.reason && <span>{change.reason}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No published tier changes recorded for this version.</p>
      )}
    </section>
  );
}

export function GenshinEditorial({ data }: { data: GenshinData }) {
  return (
    <div className={styles.editorial}>
      <section
        className={styles.editorialPanel}
        data-ia-section="methodology"
        aria-labelledby="methodology-heading"
      >
        <h2 id="methodology-heading">
          <span aria-hidden="true">◈</span> Ranking Methodology
        </h2>
        <p>Five dimensions inform the overall assessment.</p>
        <ol className={styles.numberedList}>
          {methodology.map(([name, explanation]) => (
            <li key={name}>
              <strong>{name}</strong>
              <span>{explanation}</span>
            </li>
          ))}
        </ol>
      </section>
      <section
        className={styles.editorialPanel}
        data-ia-section="sources"
        aria-labelledby="evidence-heading"
      >
        <h2 id="evidence-heading">
          <span aria-hidden="true">▱</span> Sources &amp; Evidence
        </h2>
        <p>
          {data.sources.length} evidence-linked sources · {data.evidenceCount} verified evidence
          observations
        </p>
        <ol className={styles.numberedList}>
          {evidence.map(([name, explanation]) => (
            <li key={name}>
              <strong>{name}</strong>
              <span>{explanation}</span>
            </li>
          ))}
        </ol>
      </section>
      <section
        className={styles.editorialPanel}
        data-ia-section="tier-definitions"
        aria-labelledby="definitions-heading"
      >
        <h2 id="definitions-heading">
          <span aria-hidden="true">▥</span> Tier Definitions
        </h2>
        <dl className={styles.definitions}>
          {tiers.map((tier) => (
            <div key={tier.name}>
              <dt style={{ color: tier.color }}>{tier.name}</dt>
              <dd>{tier.definition}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section
        className={styles.editorialPanel}
        data-ia-section="faq"
        aria-labelledby="faq-heading"
      >
        <h2 id="faq-heading">
          <span aria-hidden="true">?</span> FAQ
        </h2>
        {faq.map(([question, answer]) => (
          <details key={question} className={styles.faq}>
            <summary>
              {question}
              <span aria-hidden="true">＋</span>
            </summary>
            <p>{answer.replace("{version}", data.version)}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
