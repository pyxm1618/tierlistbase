import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/account-shell";
import { getAccountContext } from "@/platform/auth/account-context";
import { db } from "@/platform/database/application-database";

import {
  VanguardMemoryPlate,
  VanguardSealControl,
  VanguardShareControl,
  createVanguardService,
} from "@/modules/wow-vanguard";
export default async function MyVanguardPage() {
  const account = await getAccountContext(await headers());
  if (!account) redirect("/sign-in?returnTo=%2Faccount%2Fvanguard");
  const service = createVanguardService(db);
  const [seat, manifest] = await Promise.all([service.me(account.user.id), service.manifest()]);
  return (
    <AccountShell
      eyebrow="Account"
      title="My Vanguard"
      titleId="vanguard-title"
      intro="Your permanent place in the Monument."
    >
      {seat ? (
        <section data-clarity-mask="true">
          <h2>{seat.seatId}</h2>
          <VanguardMemoryPlate seat={seat} />
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
          <VanguardSealControl seat={seat} />
          <VanguardShareControl seatId={seat.seatId} />
          <Link href={`/wow-forever/vanguard?seat=${seat.seatId}`}>View in Monument</Link>
        </section>
      ) : (
        <Link href="/wow-forever/vanguard">
          {manifest.stage === "WOW_OPEN" || manifest.stage === "FOREVER_OPEN"
            ? "Claim your place"
            : "Explore the Monument"}
        </Link>
      )}
    </AccountShell>
  );
}
