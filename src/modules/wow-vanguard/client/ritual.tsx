"use client";
import Image from "next/image";
import type { PublicInscription } from "../db/service";
import type { RitualFrame, VanguardAssets } from "./contracts";
import { VanguardMemoryPlate } from "./plate";
const stageForFrame = {
  camera_focus: "charge",
  gather: "charge",
  memory: "charge",
  faction_energy: "charge",
  plate_formation: "form",
  name_and_seat: "inscribe",
  stone_carve: "inscribe",
  metal_resonance: "inscribe",
  plate_insert: "lock",
  seat_ignite: "ignite",
  camera_pull_back: "ignite",
  reveal: "ignite",
} as const;
export function VanguardRitual({
  seat,
  frame,
  assets,
}: {
  seat: PublicInscription;
  frame: RitualFrame;
  assets: VanguardAssets;
}) {
  if (seat.status !== "active") return null;
  const art = assets.ritual?.[stageForFrame[frame]];
  const effect =
    assets.effects?.[
      frame === "seat_ignite" ? "ignite" : seat.faction === "alliance" ? "alliance" : "horde"
    ];
  return (
    <section
      aria-label="Inscription ritual"
      role="status"
      data-clarity-mask="true"
      className="mx-auto max-w-sm text-center"
    >
      <div className="relative aspect-square">
        {art ? (
          <Image
            unoptimized
            src={art}
            alt=""
            width={1254}
            height={1254}
            className="absolute inset-0 h-full w-full motion-safe:transition-opacity"
          />
        ) : (
          <p>Animation artwork is unavailable. Your inscription is accepted.</p>
        )}
        <div className="absolute inset-[15%] flex items-center justify-center">
          <VanguardMemoryPlate
            seat={seat}
            {...(assets.emblems[seat.className] ? { emblem: assets.emblems[seat.className] } : {})}
          />
        </div>
        {effect && (
          <Image
            unoptimized
            src={effect}
            alt=""
            width={1341}
            height={1173}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain motion-safe:transition-opacity"
          />
        )}
      </div>
      <p>{seat.displayName}</p>
      <p>{seat.seatId}</p>
      <p>Inscription accepted · {frame.replaceAll("_", " ")}</p>
    </section>
  );
}
