"use client";
import Image from "next/image";
import type { PublicInscription } from "../db/service";
import type { VanguardAssets } from "./contracts";
import { VanguardMemoryPlate } from "./plate";
export function VanguardFocusVisual({
  seat,
  assets,
}: {
  seat: PublicInscription;
  assets: VanguardAssets;
}) {
  if (seat.status !== "active" || !assets.focus) return null;
  return (
    <div className="relative aspect-[2/1] w-full" data-clarity-mask="true">
      <Image
        unoptimized
        src={assets.focus}
        alt=""
        width={1774}
        height={887}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute left-[7.5%] top-[21%] w-[29%]">
        <VanguardMemoryPlate
          key={`${seat.seatId}:${seat.image?.detail ?? "emblem"}`}
          seat={seat}
          {...(assets.emblems[seat.className] ? { emblem: assets.emblems[seat.className] } : {})}
        />
      </div>
      <div className="absolute left-[43%] right-[8%] top-[22%] overflow-hidden text-[clamp(8px,1.5vw,22px)] text-amber-100">
        <p className="truncate">{seat.displayName}</p>
        <p className="truncate">{seat.seatId}</p>
      </div>
      <p className="absolute left-[43%] right-[8%] top-[36%] truncate text-[clamp(8px,1.5vw,22px)] text-amber-100">
        {seat.faction} · {seat.className}
      </p>
      <p className="absolute left-[43%] right-[8%] top-[48%] truncate text-[clamp(8px,1.5vw,22px)] text-amber-100">
        {seat.guildName}
      </p>
      <p className="absolute left-[43%] right-[8%] top-[66%] line-clamp-2 text-[clamp(8px,1.5vw,22px)] text-amber-100">
        {seat.battleCry}
      </p>
    </div>
  );
}
