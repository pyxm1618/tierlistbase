import { vanguardAssets } from "@/config/vanguard.config";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/account-shell";
import { bodyText, buttonSecondary } from "@/components/ui/styles";
import {
  VanguardMemoryPlate,
  VanguardSealControl,
  VanguardShareControl,
  createVanguardService,
} from "@/modules/wow-vanguard";
import { getAccountContext } from "@/platform/auth/account-context";
import { db } from "@/platform/database/application-database";

export default async function MyVanguardPage() {
  const account = await getAccountContext(await headers());
  if (!account) redirect("/sign-in?returnTo=%2Fwow-forever%2Fvanguard%2Fmy");

  const service = createVanguardService(db);
  const [seat, manifest] = await Promise.all([service.me(account.user.id), service.manifest()]);
  const claimOpen = manifest.stage === "WOW_OPEN" || manifest.stage === "FOREVER_OPEN";

  return (
    <AccountShell
      eyebrow="WoW Forever · Vanguard Monument"
      title="My Vanguard"
      titleId="vanguard-title"
      intro="Your place in the WoW Forever Vanguard Monument."
    >
      <div className="mb-6">
        <Link href="/wow-forever/vanguard" className={buttonSecondary}>
          Vanguard Monument
        </Link>
      </div>

      {seat ? (
        <section data-clarity-mask="true">
          <h2>{seat.seatId}</h2>
          <VanguardMemoryPlate
            seat={seat}
            {...(seat.status === "active"
              ? {
                  emblem: vanguardAssets.emblems[seat.className],
                  frame: vanguardAssets.plates[seat.faction === "alliance" ? "alliance" : "horde"],
                }
              : {})}
          />
          {seat.status === "active" ? (
            <dl>
              {Object.entries({
                "Vanguard Name": seat.displayName,
                Faction: seat.faction,
                Class: seat.className,
                Guild: seat.guildName,
                "Battle Cry": seat.battleCry,
              }).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>Unavailable Plate</p>
          )}
          <VanguardSealControl seat={seat} assets={vanguardAssets} showPreview={true} />
          <VanguardShareControl seatId={seat.seatId} />
          <div className="mt-4">
            <Link href={`/wow-forever/vanguard?seat=${seat.seatId}`} className={buttonSecondary}>
              View in Monument
            </Link>
          </div>
        </section>
      ) : (
        <section>
          <p className={bodyText}>
            You haven&apos;t claimed a place in the 8,016 Vanguard Monument.
          </p>
          <div className="mt-4">
            <Link href="/wow-forever/vanguard" className={buttonSecondary}>
              {claimOpen ? "Claim your place" : "Explore the Monument"}
            </Link>
          </div>
        </section>
      )}
    </AccountShell>
  );
}
