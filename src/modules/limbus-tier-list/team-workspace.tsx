"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";

import { AssetSlot } from "./asset-slot";
import type { RatingValue, TeamDetail, TeamRow, TierValue } from "./data";
import styles from "./limbus-tier-list.module.css";
import { TeamDetailTabs, type DetailTab } from "./team-detail-tabs";

function TierBadge({ value }: { value: TierValue }) {
  return (
    <span className={styles.tierBadge} data-tier={value}>
      {value === "NEEDS_REVIEW" ? "Review" : value}
    </span>
  );
}

function RatingBadge({
  value,
  compact = false,
}: {
  value: RatingValue | TierValue | string;
  compact?: boolean;
}) {
  return (
    <span
      className={[styles.ratingBadge, compact ? styles.ratingBadgeCompact : ""]
        .filter(Boolean)
        .join(" ")}
      data-rating={value}
    >
      {value}
    </span>
  );
}

export function TeamWorkspace({
  teamRows,
  teamDetails,
  teamArtwork,
  identityArtwork,
  egoArtwork,
  bannerImage,
}: {
  teamRows: TeamRow[];
  teamDetails: TeamDetail[];
  teamArtwork: Readonly<Record<string, string>>;
  identityArtwork: Readonly<Record<string, string>>;
  egoArtwork: Readonly<Record<string, string>>;
  bannerImage: StaticImageData;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("status-bleed");
  const [activeTab, setActiveTab] = useState<DetailTab>("Overview");

  const selectedTeam = teamDetails.find((team) => team.id === selectedTeamId) ?? teamDetails[0]!;

  return (
    <div className={styles.teamWorkspace}>
      <div className={styles.tableFrame}>
        <table className={[styles.dataTable, styles.teamTable].join(" ")}>
          <thead>
            <tr>
              <th>#</th>
              <th>Tier</th>
              <th>Team / Build</th>
              <th>Type</th>
              <th>Key Mechanic</th>
              <th>Power</th>
              <th>Story / General</th>
              <th>MD</th>
              <th>Railway</th>
              <th>Build Cost</th>
              <th>Beginner Friendly</th>
            </tr>
          </thead>
          <tbody>
            {teamRows.map((row) => {
              const isSelected = row.id === selectedTeamId;
              return (
                <tr key={row.id} data-selected={isSelected ? "true" : "false"}>
                  <td className={styles.rankCell}>{row.rank}</td>
                  <td>
                    <TierBadge value={row.tier} />
                  </td>
                  <td>
                    <div className={styles.nameCell}>
                      <AssetSlot compact src={teamArtwork[row.id]} />
                      <button
                        type="button"
                        className={styles.teamSelectBtn}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTeamId(row.id)}
                      >
                        <strong>{row.team}</strong>
                      </button>
                    </div>
                  </td>
                  <td>{row.type}</td>
                  <td>
                    <span className={styles.mechanicText}>{row.keyMechanic}</span>
                  </td>
                  <td>
                    <RatingBadge value={row.power} compact />
                  </td>
                  <td>
                    <RatingBadge value={row.storyGeneral} compact />
                  </td>
                  <td>
                    <RatingBadge value={row.mirrorDungeon} compact />
                  </td>
                  <td>
                    <RatingBadge value={row.railway} compact />
                  </td>
                  <td>
                    <RatingBadge value={row.buildCost} compact />
                  </td>
                  <td>
                    <RatingBadge value={row.beginnerFriendly} compact />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <article className={styles.teamDetail} id="team-details">
        <div className={styles.teamDetailHeader}>
          <span className={styles.detailNumber}>02</span>
          <strong>TEAM DETAILS</strong>
          <a href="#team-tier-list">View All Teams →</a>
        </div>
        <div className={styles.teamDetailHero}>
          <Image
            src={bannerImage}
            alt=""
            fill
            sizes="(max-width: 760px) calc(100vw - 28px), 420px"
            className={styles.teamBannerImage}
          />
          <div className={styles.teamBannerShade} />
          <div className={styles.teamDetailTitle}>
            <h3>{selectedTeam.team}</h3>
            <div>
              <TierBadge value={selectedTeam.powerTier} />
              <span className={styles.typeChip}>{selectedTeam.category}</span>
              <span className={styles.mechanicText}>{selectedTeam.keyMechanic}</span>
            </div>
          </div>
        </div>
        <TeamDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "Overview" && (
          <div
            role="tabpanel"
            id="team-detail-panel-0"
            aria-labelledby="team-detail-tab-0"
            tabIndex={0}
            className={styles.teamTabPanel}
          >
            <div className={styles.teamMetrics}>
              <dl>
                <div>
                  <dt>Power Tier</dt>
                  <dd>
                    <RatingBadge value={selectedTeam.powerTier} compact />
                  </dd>
                </div>
                <div>
                  <dt>Story / General</dt>
                  <dd>
                    <RatingBadge value={selectedTeam.storyGeneral} compact />
                  </dd>
                </div>
                <div>
                  <dt>Mirror Dungeon</dt>
                  <dd>
                    <RatingBadge value={selectedTeam.mirrorDungeon} compact />
                  </dd>
                </div>
                <div>
                  <dt>Railway / Endgame</dt>
                  <dd>
                    <RatingBadge value={selectedTeam.railwayEndgame} compact />
                  </dd>
                </div>
              </dl>
              <dl>
                <div>
                  <dt>Build Cost</dt>
                  <dd>
                    <RatingBadge value={selectedTeam.buildCost} compact />
                  </dd>
                </div>
                <div>
                  <dt>Core Dependency</dt>
                  <dd>
                    <RatingBadge value={selectedTeam.coreDependency} compact />
                  </dd>
                </div>
                <div>
                  <dt>Flexibility</dt>
                  <dd>
                    <RatingBadge value={selectedTeam.flexibility} compact />
                  </dd>
                </div>
                <div>
                  <dt>Ease of Use</dt>
                  <dd>
                    <RatingBadge value={selectedTeam.easeOfUse} compact />
                  </dd>
                </div>
                <div>
                  <dt>Beginner Friendly</dt>
                  <dd>
                    <RatingBadge value={selectedTeam.beginnerFriendly} compact />
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "Core & Team" && (
          <div
            role="tabpanel"
            id="team-detail-panel-1"
            aria-labelledby="team-detail-tab-1"
            tabIndex={0}
            className={styles.teamTabPanel}
          >
            <div className={styles.teamPieces}>
              <div>
                <h4>Core Members</h4>
                <div className={styles.assetStrip}>
                  {selectedTeam.coreMembers.map((member) => (
                    <span key={member} title={member}>
                      <AssetSlot compact src={identityArtwork[member]} alt={member} />
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4>Recommended Team</h4>
                <div className={styles.assetStrip}>
                  {selectedTeam.recommendedTeam.map((member) => (
                    <span key={member} title={member}>
                      <AssetSlot compact src={identityArtwork[member]} alt={member} />
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4>Substitutes / Alternatives</h4>
                <div className={styles.assetStrip}>
                  {selectedTeam.substitutes.map((member) => (
                    <span key={member} title={member}>
                      <AssetSlot compact src={identityArtwork[member]} alt={member} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Key E.G.O" && (
          <div
            role="tabpanel"
            id="team-detail-panel-2"
            aria-labelledby="team-detail-tab-2"
            tabIndex={0}
            className={styles.teamTabPanel}
          >
            <div className={styles.teamPiecesSingle}>
              <h4>Key E.G.O</h4>
              <div className={styles.assetStrip}>
                {selectedTeam.keyEgo.map((ego) => (
                  <span key={ego} title={ego}>
                    <AssetSlot compact src={egoArtwork[ego]} alt={ego} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "What to Get Next" && (
          <div
            role="tabpanel"
            id="team-detail-panel-3"
            aria-labelledby="team-detail-tab-3"
            tabIndex={0}
            className={styles.teamTabPanel}
          >
            <div className={styles.teamPiecesSingle}>
              <div className={styles.missingNext}>
                <h4>Missing One / What to Get Next</h4>
                <p>
                  {selectedTeam.missingOne}
                  <span aria-hidden="true">›</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
