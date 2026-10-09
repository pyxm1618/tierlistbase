"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type ContextFiltersProps = {
  currentMode: string;
  currentRole: string;
  currentLevel?: number | null | undefined;
  currentBuild?: string | null | undefined;
  availableModes: string[];
  availableRoles: string[];
  availableLevels: number[];
  availableBuilds: string[];
};

export function ContextFilters({
  currentMode,
  currentRole,
  currentLevel,
  currentBuild,
  availableModes,
  availableRoles,
  availableLevels,
  availableBuilds,
}: ContextFiltersProps): ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: "mode" | "role" | "level" | "build", value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (
      value === null ||
      value === "" ||
      (key === "mode" && value === "overall") ||
      (key === "role" && value === "all")
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const hasAnyFilters =
    availableModes.length > 0 ||
    availableRoles.length > 0 ||
    availableLevels.length > 0 ||
    availableBuilds.length > 0;

  if (!hasAnyFilters) {
    return (
      <div className="rounded-lg border border-border/50 bg-surface-muted/30 p-3 text-center text-xs text-muted">
        No ranking contexts or builds configured in database yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5">
      <div className="flex flex-wrap items-center gap-6">
        {/* Mode Filter */}
        {availableModes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Mode:</span>
            <div className="flex flex-wrap gap-1">
              {availableModes.map((mode) => {
                const active = mode.toLowerCase() === currentMode.toLowerCase();
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateFilter("mode", mode.toLowerCase())}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                      active
                        ? "bg-foreground text-background shadow-xs"
                        : "bg-surface-muted text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Role Filter */}
        {availableRoles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Role:</span>
            <div className="flex flex-wrap gap-1">
              {availableRoles.map((role) => {
                const active = role.toLowerCase() === currentRole.toLowerCase();
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => updateFilter("role", role.toLowerCase())}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium uppercase transition ${
                      active
                        ? "bg-foreground text-background shadow-xs"
                        : "bg-surface-muted text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Level Cap Filter */}
        {availableLevels.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Level:
            </span>
            <div className="flex flex-wrap gap-1">
              {availableLevels.map((lvl) => {
                const active = currentLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => updateFilter("level", active ? null : String(lvl))}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-foreground text-background shadow-xs"
                        : "bg-surface-muted text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    Lv {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Build / Patch Filter */}
        {availableBuilds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Build:
            </span>
            <div className="flex flex-wrap gap-1">
              {availableBuilds.map((b) => {
                const active = currentBuild === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => updateFilter("build", active ? null : b)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-foreground text-background shadow-xs"
                        : "bg-surface-muted text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
