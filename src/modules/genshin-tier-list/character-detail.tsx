import { CharacterAvatar } from "./avatar";
import type { Character } from "./characters";
import styles from "./genshin-tier-list.module.css";

export function CharacterDetail({ character, titleId }: { character: Character; titleId: string }) {
  return (
    <div className={styles.detailContent}>
      <p className={styles.mockLabel}>MOCK RATING · PLACEHOLDER AVATAR</p>
      <div className={styles.detailHeading}>
        <CharacterAvatar name={character.name} detail />
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
          <dd>{character.role}</dd>
        </div>
        <div>
          <dt>Rarity</dt>
          <dd>{character.rarity}★</dd>
        </div>
      </dl>
      <section className={styles.why}>
        <h3>Why this Tier</h3>
        <p>{character.why}</p>
      </section>
      <section>
        <h3>Strengths</h3>
        <p>{character.strengths}</p>
      </section>
      <section>
        <h3>Limitations</h3>
        <p>{character.limitations}</p>
      </section>
      <section>
        <h3>Best-use Context</h3>
        <p>{character.bestUse}</p>
      </section>
      <section>
        <h3>Ranking Assumption</h3>
        <p>
          {character.rarity === 5
            ? "5★: C0 / No Signature Weapon"
            : "4★: C6 / Accessible 4★ Weapon"}
          . Endgame Overall; main reference content pending verification.
        </p>
      </section>
      <section>
        <h3>Evidence Summary</h3>
        <p>{character.evidence}</p>
      </section>
      <p className={styles.updated}>
        Last Updated <strong>Pending verification</strong>
      </p>
    </div>
  );
}
