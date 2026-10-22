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
  if (seat.status !== "active") return null;
  return (
    <div
      className={`vanguard-focusVisual ${!assets.focus ? "vanguard-focusFallback" : ""}`}
      data-clarity-mask="true"
    >
      {assets.focus && (
        <Image
          unoptimized
          src={assets.focus}
          alt=""
          width={1774}
          height={887}
          className="absolute inset-0 h-full w-full"
        />
      )}
      <div className="absolute left-[7.5%] top-[21%] w-[29%]">
        <VanguardMemoryPlate
          key={`${seat.seatId}:${seat.image?.detail ?? "emblem"}`}
          seat={seat}
          {...(assets.emblems[seat.className] ? { emblem: assets.emblems[seat.className] } : {})}
        />
      </div>
      <p className={"vanguard-focusName"}>{seat.displayName}</p>
      <p className={"vanguard-focusSeat"}>{seat.seatId}</p>
      <p className={"vanguard-focusFaction"}>
        {seat.faction} · {seat.className}
      </p>
      <p className={"vanguard-focusGuild"}>{seat.guildName}</p>
      <p className={"vanguard-focusCry"}>{seat.battleCry}</p>
    </div>
  );
}
