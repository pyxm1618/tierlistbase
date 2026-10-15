import { CharacterAvatar } from "./avatar";
import type { Character } from "./characters";
import styles from "./genshin-tier-list.module.css";

export function CharacterDetail({ character, titleId }: { character: Character; titleId: string }) {
  return (
    <div className={styles.detailContent}>
      <div className={styles.detailHeading}>
        <CharacterAvatar name={character.name} avatar={character.avatar} detail />
        <div>
          <p className={styles.label}>Character</p>
          <h2 id={titleId}>{character.name}</h2>
        </div>
      </div>
      <dl className={styles.characterFacts}>
        <div>
          <dt>Current Tier</dt>
          <dd>{character.tier}</dd>
        </div>
        <div>
          <dt>Element</dt>
          <dd>{character.element}</dd>
        </div>
        <div>
          <dt>Primary Role</dt>
          <dd>{character.primaryRole}</dd>
        </div>
        <div>
          <dt>Rarity</dt>
          <dd>{character.rarity}★</dd>
        </div>
      </dl>
      <section className={styles.why}>
        <h3>Why this Tier</h3>
        <p>{character.whyThisTier}</p>
      </section>
      <section>
        <h3>Strengths</h3>
        <ul>
          {character.strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Limitations</h3>
        <ul>
          {character.limitations.map((limitation, index) => (
            <li key={index}>{limitation}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Best-use Context</h3>
        <p>{character.bestUseContext}</p>
      </section>
      <section>
        <h3>Ranking Assumption</h3>
        <p>{character.rankingAssumption}</p>
      </section>
      <section>
        <h3>Evidence Summary</h3>
        <p>{character.evidenceSummary}</p>
      </section>
      <section>
        <h3>Evidence Sources</h3>
        {character.evidenceSources.length > 0 ? (
          <ul className={styles.evidenceSourceList}>
            {character.evidenceSources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.name}
                </a>
                <span>
                  {" "}
                  · {source.observationCount}{" "}
                  {source.observationCount === 1 ? "observation" : "observations"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No linked evidence sources for this character.</p>
        )}
      </section>
      <p className={styles.updated}>
        Last Updated (ranking data){" "}
        <strong>
          <time dateTime={character.updatedAt}>{character.updatedAt.slice(0, 10)}</time>
        </strong>
      </p>
    </div>
  );
}
