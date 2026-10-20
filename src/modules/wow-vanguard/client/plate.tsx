"use client";
import Image from "next/image";
import { useState } from "react";
import type { PublicInscription } from "../db/service";
export function VanguardMemoryPlate({
  seat,
  emblem,
  frame,
}: {
  seat: PublicInscription;
  emblem?: string;
  frame?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (seat.status !== "active") return <p>Unavailable Plate</p>;
  return (
    <div data-clarity-mask="true" className="relative aspect-square w-full max-w-80">
      {frame && (
        <Image
          unoptimized
          src={frame}
          alt=""
          width={1254}
          height={1254}
          className="absolute inset-0 h-full w-full"
        />
      )}
      <div
        className={
          frame
            ? "absolute left-[17%] right-[17%] top-[16%] bottom-[20%] overflow-hidden rounded-lg"
            : ""
        }
      >
        {seat.image && !failed ? (
          <Image
            unoptimized
            src={seat.image.detail}
            alt="Memory Image"
            className="h-full w-full object-contain"
            width={512}
            height={512}
            onError={() => setFailed(true)}
          />
        ) : emblem ? (
          <Image
            unoptimized
            src={emblem}
            alt={`${seat.className} Default Emblem`}
            className="h-full w-full object-contain"
            width={256}
            height={256}
          />
        ) : (
          <p>{seat.className} Default Emblem is unavailable.</p>
        )}
      </div>
    </div>
  );
}
