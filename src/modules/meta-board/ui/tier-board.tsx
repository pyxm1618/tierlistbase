"use client";

import { useState, type ReactNode } from "react";

import type { BoardTierGroup, MetaBoardData } from "../db/queries";
import { ContextFilters } from "./context-filters";
import { EntityDetailDrawer, type EntityDetailItem } from "./entity-detail-drawer";
import { EntityDetailPanel } from "./entity-detail-panel";
import { EvidenceBadge } from "./evidence-badge";

type TierBoardProps = {
  data: MetaBoardData;
  children?: ReactNode;
};

const TIER_COLORS: Record<string, string> = {
  S: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  A: "border-orange-500/30 bg-orange-500/10 text-orange-500",
  B: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  C: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  D: "border-slate-500/30 bg-slate-500/10 text-slate-500",
};

const TIER_COPY: Record<string, string> = {
  S: "Best in slot",
  A: "Strong",
  B: "Good",
  C: "Situational",
  D: "Niche",
};

export function TierBoard({ data, children }: TierBoardProps): ReactNode {
  const firstEntity = data.tiers.flatMap((group) => group.items)[0] ?? null;
  const [selectedEntity, setSelectedEntity] = useState<EntityDetailItem | null>(firstEntity);
  const [drawerEntity, setDrawerEntity] = useState<EntityDetailItem | null>(null);

  const currentMode = data.activeContext?.mode ?? "overall";
  const currentRole = data.activeContext?.role ?? "all";

  function selectEntity(item: EntityDetailItem) {
    setSelectedEntity(item);
    if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1400px)").matches) {
      setDrawerEntity(item);
    }
  }

  return (
    <div className="group/board w-full">
      <ContextFilters
        currentMode={currentMode}
        currentRole={currentRole}
        currentLevel={data.activeContext?.levelCap}
        currentBuild={data.version?.build}
        availableModes={data.availableModes}
        availableRoles={data.availableRoles}
        availableLevels={data.availableLevels}
        availableBuilds={data.availableBuilds}
      />

      <div className="mt-3 grid items-start gap-4 min-[1400px]:grid-cols-[minmax(0,1fr)_380px] min-[1580px]:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className="relative min-h-64">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 hidden rounded-2xl border border-border bg-surface p-4 group-has-[[data-filter-pending=true]]/board:block"
            >
              <div className="grid h-full grid-rows-4 gap-2 animate-pulse">
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className="rounded-xl bg-surface-muted" />
                ))}
              </div>
            </div>

            <div className="group-has-[[data-filter-pending=true]]/board:invisible">
              {!data.hasData || data.tiers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    No reviewed ranking data published yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
                    {data.activeContext
                      ? `Ranking data for context (${data.activeContext.label}) is currently in Preliminary or Unreviewed state.`
                      : "No active ranking context found for this configuration."}{" "}
                    TierListBase never fabricates artificial rankings.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Ranked Entities (
                        {data.tiers.reduce((count, group) => count + group.items.length, 0)})
                      </p>
                      <p className="text-xs text-muted">
                        {data.activeContext?.label ?? "Current ranking context"}
                      </p>
                    </div>
                    {data.availableRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-3 text-[11px] text-muted">
                        {data.availableRoles.map((role) => (
                          <span key={role} className="capitalize">
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="divide-y divide-border">
                    {data.tiers.map((group: BoardTierGroup) => {
                      const colorClass =
                        TIER_COLORS[group.tier.toUpperCase()] ??
                        "border-border bg-surface-muted text-foreground";
                      const tierCopy = TIER_COPY[group.tier.toUpperCase()] ?? "Ranked";

                      return (
                        <div
                          key={group.tier}
                          className="grid min-h-28 grid-cols-[78px_minmax(0,1fr)] sm:grid-cols-[104px_minmax(0,1fr)]"
                        >
                          <div
                            className={`flex flex-col items-center justify-center border-r border-border px-2 py-4 text-center ${colorClass}`}
                          >
                            <span className="text-3xl font-black tracking-tight sm:text-4xl">
                              {group.tier}
                            </span>
                            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-current/80">
                              {tierCopy}
                            </span>
                          </div>

                          <div className="grid min-w-0 grid-cols-1 gap-2 p-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {group.items.map((item) => {
                              const active = selectedEntity?.entityId === item.entityId;

                              return (
                                <button
                                  key={item.entityId}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() => selectEntity(item)}
                                  className={`group min-w-0 rounded-xl border p-3 text-left transition ${
                                    active
                                      ? "border-accent bg-accent/8 shadow-sm"
                                      : "border-border bg-background/35 hover:border-accent/60 hover:bg-surface-muted/50"
                                  }`}
                                >
                                  <div className="flex min-w-0 items-start gap-2.5">
                                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-muted text-xs font-black text-foreground">
                                      {item.entityName.slice(0, 2).toUpperCase()}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex min-w-0 items-start justify-between gap-2">
                                        <span className="min-w-0 break-words text-sm font-semibold text-foreground group-hover:text-accent">
                                          {item.entityName}
                                        </span>
                                        <span className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted">
                                          {item.role}
                                        </span>
                                      </div>
                                      {item.whyThisTier ? (
                                        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted">
                                          {item.whyThisTier}
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>

                                  <div className="mt-2 border-t border-border/60 pt-2">
                                    <EvidenceBadge
                                      sourceCount={item.sourceCount}
                                      agreeingSourceCount={item.agreeingSourceCount}
                                      disagreementLevel={item.disagreementLevel}
                                      dataStatus={
                                        item.sources.some((source) => source.sourceType === "data")
                                          ? item.dataStatus
                                          : "unavailable"
                                      }
                                      freshnessStatus={item.freshnessStatus}
                                    />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {children}
        </div>

        <div className="hidden min-[1400px]:block">
          <EntityDetailPanel item={selectedEntity} />
        </div>
      </div>

      <EntityDetailDrawer item={drawerEntity} onClose={() => setDrawerEntity(null)} />
    </div>
  );
}
