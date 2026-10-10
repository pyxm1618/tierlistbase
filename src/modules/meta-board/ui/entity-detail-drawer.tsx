"use client";

import type { ReactNode } from "react";

import { EvidenceBadge } from "./evidence-badge";

import type { BoardEntityItem, SourceEvidenceItem } from "../db/queries";

export type EntityDetailItem = BoardEntityItem;

type EntityDetailDrawerProps = {
  item: EntityDetailItem | null;
  onClose: () => void;
};

export function EntityDetailDrawer({ item, onClose }: EntityDetailDrawerProps): ReactNode {
  if (!item) return null;

  const expertSources = item.sources.filter(
    (s) => s.sourceType === "expert" || s.sourceType === "aggregator",
  );
  const dataSources = item.sources.filter((s) => s.sourceType === "data");

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="flex h-full w-full max-w-lg flex-col border-l border-border bg-surface p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span>{item.role.toUpperCase()}</span>
              <span>•</span>
              <span>{item.entityType.toUpperCase()}</span>
            </div>
            <h2 id="drawer-title" className="mt-1 text-2xl font-bold text-foreground">
              {item.entityName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-surface-muted hover:text-foreground"
            aria-label="Close detail drawer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
          {/* Key Status Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface-muted/60 p-4">
            <div>
              <span className="text-xs text-muted">Current Tier</span>
              <div className="text-2xl font-extrabold text-foreground">{item.tier}</div>
            </div>
            <div>
              <span className="text-xs text-muted">Current Context</span>
              <div className="text-sm font-semibold text-foreground">
                {item.currentContextLabel}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted">Version / Build</span>
              <div className="text-sm font-medium text-foreground">
                v{item.versionString} {item.buildString ? `(Build ${item.buildString})` : ""}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted">Data & Freshness</span>
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

          {/* Agreement Metrics */}
          <div className="rounded-lg border border-border/80 bg-surface p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Source Agreement:</span>
              <span className="font-semibold text-foreground">
                {item.sourceCount > 0
                  ? `${item.agreeingSourceCount}/${item.sourceCount} sources agree (${(item.agreementRatio * 100).toFixed(0)}%)`
                  : "No sources recorded"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted">Disagreement Classification:</span>
              <span className="capitalize text-foreground font-medium">
                {item.disagreementLevel}
              </span>
            </div>
          </div>

          {/* Why This Tier */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Why This Tier
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">
              {item.whyThisTier || "No verified editorial rationale recorded for this tier yet."}
            </p>
          </div>

          {/* Strengths & Constraints */}
          {item.strengths ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Key Strengths
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.strengths}</p>
            </div>
          ) : null}

          {item.constraints ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Constraints & Trade-offs
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.constraints}</p>
            </div>
          ) : null}

          {/* Latest Tier Change */}
          <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Latest Tier Change
            </h3>
            {item.latestTierChange ? (
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {item.latestTierChange.previousTier} → {item.latestTierChange.newTier}
                  </span>
                  <span className="rounded bg-surface px-1.5 py-0.5 font-medium capitalize text-muted">
                    {item.latestTierChange.changeType}
                  </span>
                </div>
                {item.latestTierChange.reason ? (
                  <p className="text-muted">Reason: {item.latestTierChange.reason}</p>
                ) : null}
                <p className="text-[11px] text-muted/80">
                  Recorded: {new Date(item.latestTierChange.changedAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-muted">No prior tier transitions recorded in DB.</p>
            )}
          </div>

          {/* Source Evidence Section */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Source Evidence & Audit Trail</h3>
              <span className="text-[11px] text-muted">
                Date Range:{" "}
                <span className="font-medium text-foreground">
                  {computeSourceDateRange(item.sources)}
                </span>
              </span>
            </div>

            {/* Editorial / Expert Reviews */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Expert & Editorial Sources ({expertSources.length})
              </h4>
              {expertSources.length === 0 ? (
                <p className="mt-1.5 text-xs text-muted">
                  No expert reviews linked to this entity.
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {expertSources.map((source: SourceEvidenceItem) => (
                    <SourceEvidenceCard key={source.sourceId} source={source} />
                  ))}
                </div>
              )}
            </div>

            {/* Statistical & Metric Evidence */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Statistical & Metric Sources ({dataSources.length})
              </h4>
              {dataSources.length === 0 ? (
                <p className="mt-1.5 text-xs text-muted">
                  No statistical performance logs recorded for this entity.
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {dataSources.map((source: SourceEvidenceItem) => (
                    <SourceEvidenceCard key={source.sourceId} source={source} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="border-t border-border pt-4 text-xs text-muted">
            <p>Last DB record updated: {new Date(item.lastUpdated).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function computeSourceDateRange(sources: SourceEvidenceItem[]): string {
  const timestamps: number[] = [];
  for (const s of sources) {
    if (s.publishedAt) timestamps.push(new Date(s.publishedAt).getTime());
    if (s.updatedAtSource) timestamps.push(new Date(s.updatedAtSource).getTime());
  }
  if (timestamps.length === 0) return "N/A";
  const minDate = new Date(Math.min(...timestamps)).toISOString().split("T")[0] ?? "N/A";
  const maxDate = new Date(Math.max(...timestamps)).toISOString().split("T")[0] ?? "N/A";
  return minDate === maxDate ? minDate : `${minDate} ~ ${maxDate}`;
}

function SourceEvidenceCard({ source }: { source: SourceEvidenceItem }): ReactNode {
  const publishedDate = source.publishedAt
    ? new Date(source.publishedAt).toISOString().split("T")[0]
    : "N/A";
  const updatedDate = source.updatedAtSource
    ? new Date(source.updatedAtSource).toISOString().split("T")[0]
    : "N/A";
  const checkedDate = source.checkedAt
    ? new Date(source.checkedAt).toISOString().split("T")[0]
    : "N/A";

  const normDisplay = source.normalizedTier
    ? source.normalizedScore !== null
      ? `${source.normalizedTier} (Score: ${source.normalizedScore})`
      : source.normalizedTier
    : "N/A";

  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            {source.sourceName} ↗
          </a>
          <p className="max-w-xs truncate text-[11px] text-muted">{source.sourceUrl}</p>
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-foreground">Raw Tier: {source.rawTier}</span>
          <p className="text-[11px] text-muted">Norm: {normDisplay}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 rounded bg-surface-muted/40 p-2 text-[11px]">
        <div>
          <span className="text-muted">Type: </span>
          <span className="font-medium capitalize text-foreground">{source.sourceType}</span>
        </div>
        <div>
          <span className="text-muted">Publisher: </span>
          <span className="font-medium text-foreground">{source.publisher || "N/A"}</span>
        </div>
        <div>
          <span className="text-muted">Raw Rank: </span>
          <span className="font-mono text-foreground">{source.rawRank ?? "N/A"}</span>
        </div>
        <div>
          <span className="text-muted">Raw Score: </span>
          <span className="font-mono text-foreground">{source.rawScore ?? "N/A"}</span>
        </div>
        <div>
          <span className="text-muted">Freshness: </span>
          <span className="capitalize text-foreground">{source.sourceFreshness}</span>
        </div>
        <div>
          <span className="text-muted">Version Match: </span>
          <span
            className={
              source.versionMatch ? "font-medium text-foreground" : "font-medium text-amber-500"
            }
          >
            {source.versionMatch ? "Match" : "Mismatch"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-muted">
        <span>Published: {publishedDate}</span>
        <span>•</span>
        <span>Updated: {updatedDate}</span>
        <span>•</span>
        <span>Checked: {checkedDate}</span>
      </div>

      {source.notes ? (
        <p className="border-t border-border/40 pt-1 text-[11px] italic text-muted">
          {source.notes}
        </p>
      ) : null}
    </div>
  );
}
