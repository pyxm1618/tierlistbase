"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition, type ReactNode } from "react";

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
  const [isPending, startTransition] = useTransition();
  const navigationLocked = useRef(false);

  useEffect(() => {
    if (!isPending) navigationLocked.current = false;
  }, [isPending]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedMode = searchParams.get("mode") ?? currentMode;
  const selectedRole = searchParams.get("role") ?? currentRole;

  function updateFilter(key: "mode" | "role" | "level" | "build", value: string | null) {
    if (navigationLocked.current) return;
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
    if (query === searchParams.toString()) return;

    navigationLocked.current = true;
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  const hasAnyFilters =
    availableModes.length > 0 ||
    availableRoles.length > 0 ||
    availableLevels.length > 0 ||
    availableBuilds.length > 0;

  if (!hasAnyFilters) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-center text-xs text-muted">
        No ranking contexts or builds configured in database yet.
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-border bg-surface p-3 shadow-sm sm:p-4"
      aria-busy={isPending}
      data-filter-pending={isPending}
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {availableModes.length > 0 ? (
          <FilterGroup label="Game Mode">
            {availableModes.map((mode) => {
              const active = mode.toLowerCase() === selectedMode.toLowerCase();
              return (
                <FilterButton
                  key={mode}
                  active={active}
                  disabled={isPending}
                  label={mode}
                  onClick={() => {
                    if (!active) updateFilter("mode", mode.toLowerCase());
                  }}
                />
              );
            })}
          </FilterGroup>
        ) : null}

        {availableRoles.length > 0 ? (
          <FilterGroup label="Role">
            {availableRoles.map((role) => {
              const active = role.toLowerCase() === selectedRole.toLowerCase();
              return (
                <FilterButton
                  key={role}
                  active={active}
                  disabled={isPending}
                  label={role}
                  uppercase
                  onClick={() => {
                    if (!active) updateFilter("role", role.toLowerCase());
                  }}
                />
              );
            })}
          </FilterGroup>
        ) : null}

        {availableLevels.length > 0 ? (
          <FilterGroup label="Level">
            {availableLevels.map((level) => {
              const active = currentLevel === level;
              return (
                <FilterButton
                  key={level}
                  active={active}
                  disabled={isPending}
                  label={`Lv ${level}`}
                  onClick={() => updateFilter("level", active ? null : String(level))}
                />
              );
            })}
          </FilterGroup>
        ) : null}

        {availableBuilds.length > 0 ? (
          <FilterGroup label="Version / Build">
            {availableBuilds.map((build) => {
              const active = currentBuild === build;
              return (
                <FilterButton
                  key={build}
                  active={active}
                  disabled={isPending}
                  label={build}
                  onClick={() => updateFilter("build", active ? null : build)}
                />
              );
            })}
          </FilterGroup>
        ) : null}
      </div>

      <p role="status" className="min-h-4 px-1 pt-3 text-xs text-muted">
        {isPending ? "Loading ranking context…" : "Filters select published ranking contexts."}
      </p>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background/40 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  disabled,
  label,
  uppercase = false,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  uppercase?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={`min-w-0 break-all rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
        uppercase ? "uppercase" : "capitalize"
      } ${
        active
          ? "border-accent bg-accent text-accent-foreground shadow-xs"
          : "border-transparent bg-surface-muted text-muted hover:border-border hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
