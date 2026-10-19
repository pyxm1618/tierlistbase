import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { routeRegistry } from "@/config/routes.config";
import { metadataForRoute } from "@/platform/seo/metadata";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { headers } from "next/headers";
import { getAccountContext } from "@/platform/auth/account-context";
import { WOW_CLASSES } from "@/modules/meta-board";
import { vanguardAssets } from "@/config/vanguard.config";
import { VanguardEntry, seatIdSchema, createVanguardService } from "@/modules/wow-vanguard";
import { db } from "@/platform/database/application-database";
export function generateMetadata(): Metadata {
  return metadataForRoute(routeRegistry, "/wow-forever/vanguard", currentSeoEnvironment());
}
export default async function VanguardPage({
  searchParams,
}: {
  searchParams: Promise<{ seat?: string }>;
}) {
  const requested = (await searchParams).seat;
  const seat = seatIdSchema.safeParse(requested);
  const account = await getAccountContext(await headers());
  const manifest = await createVanguardService(db).manifest();
  const heading = {
    WOW_OPEN: "8016 Vanguard Monument",
    WOW_COMPLETE_WAITING: "WOW IS COMPLETE",
    FOREVER_OPEN: "FOREVER IS OPEN",
    COMPLETE: "THE MONUMENT IS COMPLETE",
    SEALED: "THE MONUMENT IS SEALED",
  }[manifest.stage];
  const hero: { src: string; width: number; height: number } | undefined = (
    vanguardAssets.hero as Partial<
      Record<"wow" | "forever", { src: string; width: number; height: number }>
    >
  )[manifest.phase];
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header>
        <h1 className="text-4xl font-bold">{heading}</h1>
        <p className="mt-6">
          8,016 days connect November 23, 2004 and November 4, 2026. A permanent place for the
          players and memories that made this journey.
        </p>
        <p className="mt-4">
          WOW begins with 8,016 places. The complete Monument has 64,128 seats.
        </p>
        <p role="status" className="mt-4">
          {manifest.counts.total.toLocaleString("en-US")} places inscribed.
        </p>
        {manifest.stage === "SEALED" && (
          <p>The inscription period has ended. Every completed Vanguard remains here to explore.</p>
        )}
        {manifest.stage === "WOW_COMPLETE_WAITING" && (
          <p>
            FOREVER AWAKENS IN …{" "}
            <time dateTime={manifest.foreverUnlockAt!}>{manifest.foreverUnlockAt}</time>
          </p>
        )}
      </header>
      <section aria-label="Monument" className="my-10 border border-slate-500 p-8">
        {hero ? (
          <Image
            unoptimized
            src={hero.src}
            width={hero.width}
            height={hero.height}
            alt=""
            priority
          />
        ) : (
          <p>DEV PLACEHOLDER · Final Monument artwork and seat layout pending.</p>
        )}
      </section>
      <VanguardEntry
        manifest={manifest}
        classes={WOW_CLASSES}
        assets={vanguardAssets}
        initialSeat={seat.success ? seat.data : null}
        authenticated={Boolean(account)}
      />
      <p>
        <Link href="/account/vanguard">My Vanguard</Link>
      </p>
      <p className="mt-8">
        <Link href="/wow-forever/tier-list">WoW Forever Tier List</Link>
      </p>
      <p className="mt-12 text-sm">
        8016 Vanguard Monument is an unofficial community tribute and is not affiliated with,
        endorsed by, or sponsored by Blizzard Entertainment.
      </p>
    </main>
  );
}
