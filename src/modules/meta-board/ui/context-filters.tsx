"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type ContextFiltersProps = {
  currentMode: string;
  currentRole: string;
  availableModes: string[];
  availableRoles: string[];
};

export function ContextFilters({
  currentMode,
  currentRole,
  availableModes,
  availableRoles,
}: ContextFiltersProps): ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: "mode" | "role", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overall" && key === "mode") {
      params.delete("mode");
    } else if (value === "all" && key === "role") {
      params.delete("role");
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Mode Filter */}
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

      {/* Role Filter */}
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
    </div>
  );
}
