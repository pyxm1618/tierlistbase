"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { WOW_CLASSES } from "../domain/wow-context";
import type { WowSpec } from "./model";
import { SpecDetail } from "./detail";
import { SpecIcon } from "./spec-icon";
import styles from "./wow-tier-list.module.css";
export function WowWorkspace({ specs, children }: { specs: WowSpec[]; children: ReactNode }) {
  const [className, setClassName] = useState("All Classes");
  const [selectedId, setSelectedId] = useState(specs[0]?.id ?? null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visible = specs.filter(
    (spec) => className === "All Classes" || spec.className === className,
  );
  const selected = visible.find((spec) => spec.id === selectedId) ?? visible[0] ?? null;
  const drawer = specs.find((spec) => spec.id === drawerId) ?? null;
  useEffect(() => {
    if (!drawerId) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const resize = () => {
      if (window.matchMedia("(min-width: 1280px)").matches) setDrawerId(null);
    };
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      dialog.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [drawerId]);
  function select(spec: WowSpec) {
    setSelectedId(spec.id);
    if (!window.matchMedia("(min-width: 1280px)").matches) setDrawerId(spec.id);
  }
  return (
    <div className={styles.workspace} data-wow-workspace>
      <div className={styles.workspaceLeft}>
        <div className={styles.boardArea}>
          <nav className={styles.classNav} aria-label="Class Navigator">
            <h2>Classes</h2>
            {["All Classes", ...WOW_CLASSES].map((name) => (
              <button
                key={name}
                type="button"
                aria-label={name}
                aria-pressed={className === name}
                onClick={() => {
                  setClassName(name);
                  setDrawerId(null);
                }}
              >
                {name !== "All Classes" && <SpecIcon />}
                <span>{name}</span>
              </button>
            ))}
            <p>Neutral placeholder icons</p>
          </nav>
          <section className={styles.board} aria-label="Tier Board">
            <header className={styles.boardHeading}>
              <h2 id="wow-board-heading">
                {className === "All Classes" ? "All Specs" : className}{" "}
                <span>({visible.length})</span>
              </h2>
              <span>Sorted by Tier / Score</span>
            </header>
            <p className={styles.placeholderNotice}>
              Class / Spec icons: neutral placeholders · final assets pending
            </p>
            {specs.length === 0 && (
              <p className={styles.empty}>
                No recorded data for this Ranking Context. Not enough data to publish a tier.
              </p>
            )}
            {specs.length > 0 && visible.length === 0 && (
              <p className={styles.empty}>
                No recorded specs for this class in the selected context.
              </p>
            )}
            {["S", "A", "B", "C", "Pending"].map((tier) => {
              const group = visible.filter((s) => s.tier.toUpperCase() === tier.toUpperCase());
              return (
                <section
                  key={tier}
                  className={styles.tierRow}
                  data-tier={tier}
                  aria-label={`${tier} tier`}
                >
                  <div className={styles.tierLabel}>
                    <h3>{tier}</h3>
                    <span>
                      {tier === "Pending"
                        ? "Not enough data"
                        : tier === "S"
                          ? "Top performance"
                          : tier === "A"
                            ? "Strong performance"
                            : tier === "B"
                              ? "Median range"
                              : "Below median"}
                    </span>
                  </div>
                  <div className={styles.cards}>
                    {group.length === 0 ? (
                      <p className={styles.emptyTier}>
                        No {tier === "Pending" ? "pending" : "ranked"} specs
                      </p>
                    ) : (
                      group.map((spec) => (
                        <button
                          type="button"
                          key={spec.id}
                          className={styles.specCard}
                          data-spec-id={spec.id}
                          aria-pressed={selected?.id === spec.id}
                          aria-label={`${spec.name}, ${spec.role.toUpperCase()}, ${spec.tier} tier`}
                          onClick={() => select(spec)}
                        >
                          <SpecIcon />
                          <strong>{spec.specName}</strong>
                          <span>{spec.className ?? "Class not recorded"}</span>
                          <small className={styles.role}>{spec.role.toUpperCase()}</small>
                          <small>
                            {spec.rank ? `#${spec.rank}` : "Pending"} · {spec.status}
                          </small>
                        </button>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </section>
        </div>
        {children}
      </div>
      <aside className={styles.desktopDetail} aria-label="Selected Spec Detail">
        {selected ? (
          <SpecDetail key={selected.id} spec={selected} titleId="desktop-spec-title" />
        ) : (
          <p className={styles.empty}>Select a spec to inspect its performance and evidence.</p>
        )}
      </aside>
      {drawer && (
        <dialog
          ref={dialogRef}
          className={styles.drawer}
          aria-labelledby="drawer-spec-title"
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const targets = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], [tabindex="0"]',
              ),
            ).filter((target) => target.getClientRects().length > 0);
            const first = targets[0];
            const last = targets.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
          onCancel={(event) => {
            event.preventDefault();
            setDrawerId(null);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setDrawerId(null);
          }}
        >
          <div className={styles.drawerInner}>
            <button
              className={styles.close}
              type="button"
              autoFocus
              aria-label="Close Spec Detail"
              onClick={() => setDrawerId(null)}
            >
              Close ✕
            </button>
            <SpecDetail key={drawer.id} spec={drawer} titleId="drawer-spec-title" />
          </div>
        </dialog>
      )}
    </div>
  );
}
