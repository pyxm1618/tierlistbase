"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { CharacterAvatar } from "./avatar";
import { CharacterDetail } from "./character-detail";
import {
  elements,
  filterCharacters,
  roles,
  tiers,
  type Character,
  type Element,
  type Role,
} from "./characters";
import styles from "./genshin-tier-list.module.css";

function subscribeToMobile(callback: () => void) {
  const media = window.matchMedia("(max-width: 1023px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function isMobile() {
  return window.matchMedia("(max-width: 1023px)").matches;
}
function serverMobileSnapshot() {
  return false;
}

function MobileDetail({ character, onClose }: { character: Character; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className={styles.drawer}
      aria-labelledby="mobile-character-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.drawerHeader}>
        <span>Character Detail</span>
        <button autoFocus type="button" aria-label="Close character details" onClick={onClose}>
          ✕
        </button>
      </div>
      <CharacterDetail character={character} titleId="mobile-character-title" />
    </dialog>
  );
}

export function GenshinTierBoard({
  characters,
  changes,
}: {
  characters: readonly Character[];
  changes: ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role>("All");
  const [element, setElement] = useState<Element>("All");
  const [selected, setSelected] = useState<Character | null>(null);
  const mobile = useSyncExternalStore(subscribeToMobile, isMobile, serverMobileSnapshot);
  const filtered = filterCharacters(characters, search, role, element);
  return (
    <>
      <section
        className={styles.filters}
        data-ia-section="search-filters"
        aria-label="Search and filters"
      >
        <label className={styles.search}>
          <span className={styles.label}>Search</span>
          <input
            type="search"
            aria-label="Search characters"
            placeholder="Search characters…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelected(null);
            }}
          />
        </label>
        <fieldset>
          <legend>Role</legend>
          <div className={styles.filterOptions}>
            {roles.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={role === option}
                onClick={() => {
                  setRole(option);
                  setSelected(null);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Element</legend>
          <div className={styles.filterOptions}>
            {elements.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={element === option}
                onClick={() => {
                  setElement(option);
                  setSelected(null);
                }}
              >
                <span className={styles.elementDot} data-element={option} aria-hidden="true" />
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      </section>
      <div className={styles.workspace}>
        <section
          className={styles.board}
          data-ia-section="tier-board"
          aria-labelledby="overall-heading"
          aria-label="Genshin Impact Tier List"
        >
          <div className={styles.boardHeading}>
            <h2 id="overall-heading">Overall Tier Board</h2>
            <span>A–Z within each tier</span>
          </div>
          <p className={styles.results} role="status">
            {filtered.length
              ? `${filtered.length} characters`
              : "No characters match these filters."}
          </p>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={styles.tierRow}
              data-tier={tier.name}
              style={{ "--tier-color": tier.color } as CSSProperties}
            >
              <div className={styles.tierLabel}>
                <strong
                  className={tier.name === "Pending Evaluation" ? styles.pendingSymbol : undefined}
                >
                  {tier.name === "Pending Evaluation" ? "?" : tier.name}
                </strong>
                <div>
                  <h3>{tier.name === "Pending Evaluation" ? tier.name : tier.label}</h3>
                  <p>
                    {tier.name === "Pending Evaluation"
                      ? "Evidence not yet sufficient"
                      : tier.definition}
                  </p>
                </div>
              </div>
              <div className={styles.cards}>
                {filtered
                  .filter((character) => character.tier === tier.name)
                  .map((character) => (
                    <button
                      key={character.id}
                      type="button"
                      className={styles.card}
                      data-character-card
                      data-selected={selected?.id === character.id}
                      aria-pressed={selected?.id === character.id}
                      aria-label={`${character.name}, ${character.element}, ${character.primaryRole}, ${character.rarity} stars`}
                      onClick={() => setSelected(character)}
                    >
                      <CharacterAvatar name={character.name} />
                      <span className={styles.stars} aria-hidden="true">
                        {"★".repeat(character.rarity)}
                      </span>
                      <span className={styles.name} data-character-name>
                        {character.name}
                      </span>
                      <span className={styles.cardMeta}>
                        <span data-element={character.element}>
                          {character.element.includes(" / ")
                            ? "Multiple elements"
                            : character.element}
                        </span>
                        <span>{character.primaryRole}</span>
                      </span>
                    </button>
                  ))}
                {!filtered.some((character) => character.tier === tier.name) && (
                  <p className={styles.emptyTier}>No matching characters</p>
                )}
              </div>
            </div>
          ))}
        </section>
        <aside className={styles.sidebar}>
          <section
            className={styles.detailPanel}
            data-ia-section="character-detail"
            aria-label="Character Detail"
          >
            {selected && !mobile ? (
              <CharacterDetail character={selected} titleId="desktop-character-title" />
            ) : (
              <div className={styles.emptyDetail}>
                <span className={styles.emptyConstellation} aria-hidden="true">
                  ✦
                </span>
                <h2>Select a character to view details</h2>
                <p>
                  Click any character from the tier list to see why they are placed in that tier.
                </p>
                <span className={styles.label}>
                  Reviewed data · select a character for evidence
                </span>
              </div>
            )}
          </section>
          {changes}
        </aside>
      </div>
      {selected && mobile && (
        <MobileDetail character={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
