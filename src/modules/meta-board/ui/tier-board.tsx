"use client";

import { useState, type ReactNode } from "react";

import type { BoardTierGroup, MetaBoardData } from "../db/queries";
import { ContextFilters } from "./context-filters";
import { EntityDetailDrawer, type EntityDetailItem } from "./entity-detail-drawer";
import { EvidenceBadge } from "./evidence-badge";

type TierBoardProps = {
  data: MetaBoardData;
};

const TIER_COLORS: Record<string, string> = {
  S: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  A: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  B: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  C: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  D: "bg-slate-500/10 text-slate-600 border-slate-500/30",
};

export function TierBoard({ data }: TierBoardProps): ReactNode {
  const [selectedEntity, setSelectedEntity] = useState<EntityDetailItem | null>(null);

  const currentMode = data.activeContext?.mode ?? "overall";
  const currentRole = data.activeContext?.role ?? "all";

  return (
    <div className="w-full">
      {/* Real Filter Toolbar */}
      <ContextFilters
        currentMode={currentMode}
        currentRole={currentRole}
        availableModes={data.availableModes}
        availableRoles={data.availableRoles}
      />

      {/* Main Tier Board Grid or Honest Empty State */}
      <div className="mt-8">
        {!data.hasData || data.tiers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-muted/50 p-12 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              No reviewed ranking data published yet
            </h3>
            <p className="mt-2 text-sm text-muted">
              Ranking data for context ({currentMode} • {currentRole}) is currently in Preliminary
              or Unreviewed state. TierListBase never fabricates artificial rankings.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.tiers.map((group: BoardTierGroup) => {
              const colorClass =
                TIER_COLORS[group.tier.toUpperCase()] ??
                "bg-surface-muted text-foreground border-border";

              return (
                <div
                  key={group.tier}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs sm:flex-row"
                >
                  {/* Tier Label */}
                  <div
                    className={`flex items-center justify-center border-b sm:border-b-0 sm:border-r border-border p-4 sm:w-24 ${colorClass}`}
                  >
                    <span className="text-3xl font-black tracking-tight">{group.tier}</span>
                  </div>

                  {/* Entities in this Tier */}
                  <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {group.items.map((item) => (
                      <button
                        key={item.entityId}
                        type="button"
                        onClick={() => setSelectedEntity(item)}
                        className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-3 text-left transition hover:border-accent hover:shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground group-hover:text-accent">
                              {item.entityName}
                            </span>
                            <span className="text-[10px] font-medium uppercase text-muted">
                              {item.role}
                            </span>
                          </div>
                          {item.whyThisTier ? (
                            <p className="mt-1 line-clamp-2 text-xs text-muted">
                              {item.whyThisTier}
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-3 border-t border-border/50 pt-2">
                          <EvidenceBadge
                            sourceCount={item.sourceCount}
                            agreeingSourceCount={item.agreeingSourceCount}
                            disagreementLevel={item.disagreementLevel}
                            dataStatus={item.dataStatus}
                            freshnessStatus={item.freshnessStatus}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drilldown Drawer */}
      <EntityDetailDrawer item={selectedEntity} onClose={() => setSelectedEntity(null)} />
    </div>
  );
}
