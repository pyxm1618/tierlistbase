"use client";

import { useState } from "react";

import styles from "./limbus-tier-list.module.css";

const detailTabs = ["Overview", "Core & Team", "Key E.G.O", "What to Get Next"] as const;

export function TeamDetailTabs() {
  const [activeTab, setActiveTab] = useState<(typeof detailTabs)[number]>("Overview");

  return (
    <>
      <div className={styles.detailTabs} role="tablist" aria-label="Team detail sections">
        {detailTabs.map((tab, index) => (
          <button
            key={tab}
            id={`team-detail-${index}-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            tabIndex={activeTab === tab ? 0 : -1}
            data-active={activeTab === tab ? "true" : "false"}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(event) => {
              let next: number | undefined;
              if (event.key === "ArrowRight") next = (index + 1) % detailTabs.length;
              if (event.key === "ArrowLeft") next = (index + detailTabs.length - 1) % detailTabs.length;
              if (event.key === "Home") next = 0;
              if (event.key === "End") next = detailTabs.length - 1;
              if (next === undefined) return;

              event.preventDefault();
              const nextTab = detailTabs[next]!;
              setActiveTab(nextTab);
              document.getElementById(`team-detail-${next}-tab`)?.focus();
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
