"use client";

import styles from "./limbus-tier-list.module.css";

export const detailTabs = ["Overview", "Core & Team", "Key E.G.O", "What to Get Next"] as const;

export type DetailTab = (typeof detailTabs)[number];

export function TeamDetailTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}) {
  return (
    <>
      <div className={styles.detailTabs} role="tablist" aria-label="Team detail sections">
        {detailTabs.map((tab, index) => (
          <button
            key={tab}
            id={`team-detail-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`team-detail-panel-${index}`}
            tabIndex={activeTab === tab ? 0 : -1}
            data-active={activeTab === tab ? "true" : "false"}
            onClick={() => onTabChange(tab)}
            onKeyDown={(event) => {
              let next: number | undefined;
              if (event.key === "ArrowRight") next = (index + 1) % detailTabs.length;
              if (event.key === "ArrowLeft")
                next = (index + detailTabs.length - 1) % detailTabs.length;
              if (event.key === "Home") next = 0;
              if (event.key === "End") next = detailTabs.length - 1;
              if (next === undefined) return;

              event.preventDefault();
              const nextTab = detailTabs[next]!;
              onTabChange(nextTab);
              document.getElementById(`team-detail-tab-${next}`)?.focus();
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <span className={styles.visuallyHidden} role="status">
        Active team detail tab: {activeTab}
      </span>
    </>
  );
}
