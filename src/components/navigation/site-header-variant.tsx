"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const limbusHeaderCss = `
.tlb-limbus-header {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid rgba(107, 78, 63, 0.72);
  background: rgba(3, 11, 17, 0.93);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.52);
  backdrop-filter: blur(6px);
  color: #edf2f3;
  font-family: "Arial Narrow", "Roboto Condensed", Arial, sans-serif;
}
.tlb-limbus-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(calc(100% - 24px), 1540px);
  min-height: 36px;
  margin: 0 auto;
  gap: 24px;
}
.tlb-limbus-header-inner > a img {
  width: 24px;
  height: 23px;
}
.tlb-limbus-header-navigation {
  display: flex;
  align-items: center;
  gap: 28px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.tlb-limbus-header-navigation a {
  color: inherit;
  text-decoration: none;
}
.tlb-limbus-header-navigation a:hover {
  color: #ed1f2b;
}
.tlb-limbus-header-navigation a:focus-visible {
  outline: 2px solid #ed1f2b;
  outline-offset: 4px;
}
.tlb-limbus-header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
  font-weight: 700;
}
.tlb-limbus-header-controls button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 28px;
  border: 0;
  background: transparent;
  color: #aeb8bd;
  font: inherit;
}
.tlb-limbus-header-controls svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}
.tlb-limbus-header-controls .tlb-limbus-header-search {
  width: 150px;
  justify-content: flex-start;
  padding: 0 10px;
  border: 1px solid #2f414b;
  border-radius: 3px;
  background: #0b1821;
}
.tlb-limbus-header-theme {
  padding: 0;
}
@media (max-width: 900px) {
  .tlb-limbus-header-inner {
    gap: 14px;
  }
  .tlb-limbus-header-navigation {
    gap: 16px;
  }
  .tlb-limbus-header-controls {
    gap: 10px;
  }
  .tlb-limbus-header-controls .tlb-limbus-header-search {
    width: 28px;
    padding: 0;
    justify-content: center;
  }
  .tlb-limbus-header-search span {
    display: none;
  }
}
@media (max-width: 620px) {
  .tlb-limbus-header-inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    width: calc(100% - 16px);
    gap: 0 8px;
    padding-top: 6px;
  }
  .tlb-limbus-header-navigation {
    grid-row: 2;
    grid-column: 1 / -1;
    justify-content: space-around;
    min-height: 34px;
    gap: 12px;
  }
  .tlb-limbus-header-controls {
    grid-row: 1;
    grid-column: 2;
  }
}
`;

export function SiteHeaderVariant({
  children,
  brand,
  account,
}: {
  children: ReactNode;
  brand: ReactNode;
  account?: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname !== "/limbus-company/tier-list") return children;

  return (
    <>
      <style>{limbusHeaderCss}</style>
      <header className="tlb-limbus-header">
        <div className="tlb-limbus-header-inner">
          {brand}
          <nav className="tlb-limbus-header-navigation" aria-label="Primary navigation">
            <Link href="/#explore">Games</Link>
            <Link href="/#popular-rankings">Tier Lists</Link>
            <span aria-disabled="true" title="Guides are not available in this preview">
              Guides
            </span>
            <span aria-disabled="true" title="Tools are not available in this preview">
              Tools
            </span>
          </nav>
          <div className="tlb-limbus-header-controls" aria-label="Header controls">
            {account}
            <button
              type="button"
              disabled
              aria-label="Search"
              title="Site search is not available in this preview"
              className="tlb-limbus-header-search"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
              <span>Search</span>
            </button>
            <span lang="en" title="English">
              EN
            </span>
            <button
              type="button"
              disabled
              aria-label="Theme"
              title="Theme follows your device settings"
              className="tlb-limbus-header-theme"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
