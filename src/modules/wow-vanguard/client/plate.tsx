"use client";
import Image from "next/image";
import { useState } from "react";
import type { PublicInscription } from "../db/service";
export function VanguardMemoryPlate({
  seat,
  emblem,
}: {
  seat: PublicInscription;
  emblem?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (seat.status !== "active") return <p>Unavailable Plate</p>;
  return (
    <div data-clarity-mask="true">
      {seat.image && !failed ? (
        <Image
          unoptimized
          src={seat.image.detail}
          alt="Memory Image"
          width={512}
          height={512}
          onError={() => setFailed(true)}
        />
      ) : emblem ? (
        <Image
          unoptimized
          src={emblem}
          alt={`${seat.className} Default Emblem`}
          width={256}
          height={256}
        />
      ) : (
        <p>DEV PLACEHOLDER · {seat.className} Default Emblem · BLOCKED_ASSET</p>
      )}
    </div>
  );
}
