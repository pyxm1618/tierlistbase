"use client";

import type { ReactNode } from "react";

import { EvidenceBadge } from "./evidence-badge";

export type EntityDetailItem = {
  entityId: string;
  entityName: string;
  entitySlug: string;
  entityType: string;
  role: string;
  tier: string;
  consensusScore: number | null;
  sourceCount: number;
  agreeingSourceCount: number;
  disagreementLevel: string;
  dataStatus: string;
  freshnessStatus: string;
  whyThisTier: string | null;
  strengths: string | null;
  constraints: string | null;
  lastUpdated: Date;
};

type EntityDetailDrawerProps = {
  item: EntityDetailItem | null;
  onClose: () => void;
};

export function EntityDetailDrawer({ item, onClose }: EntityDetailDrawerProps): ReactNode {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-surface p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {item.role.toUpperCase()} • {item.entityType.toUpperCase()}
            </span>
            <h2 id="drawer-title" className="text-2xl font-bold text-foreground">
              {item.entityName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted transition hover:bg-surface-muted hover:text-foreground"
            aria-label="Close detail drawer"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
          {/* Current Tier & Evidence */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-4">
            <div>
              <span className="text-xs text-muted">Current Tier</span>
              <div className="text-3xl font-extrabold text-foreground">{item.tier}</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted">Validation Evidence</span>
              <div className="mt-1">
                <EvidenceBadge
                  sourceCount={item.sourceCount}
                  agreeingSourceCount={item.agreeingSourceCount}
                  disagreementLevel={item.disagreementLevel}
                  dataStatus={item.dataStatus}
                  freshnessStatus={item.freshnessStatus}
                />
              </div>
            </div>
          </div>

          {/* Why This Tier */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Why This Tier
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {item.whyThisTier || "No editorial rationale published for this tier yet."}
            </p>
          </div>

          {/* Strengths */}
          {item.strengths ? (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Key Strengths
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{item.strengths}</p>
            </div>
          ) : null}

          {/* Constraints */}
          {item.constraints ? (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Constraints & Weaknesses
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{item.constraints}</p>
            </div>
          ) : null}

          {/* Metadata */}
          <div className="border-t border-border pt-4 text-xs text-muted">
            <p>Last reviewed: {new Date(item.lastUpdated).toLocaleDateString()}</p>
            <p className="mt-1">
              Data status:{" "}
              {item.dataStatus === "available"
                ? "Real statistical data available"
                : "No telemetry/log data available yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
