import "./vanguard.css";
import type { Metadata } from "next";
import Link from "next/link";
import { routeRegistry } from "@/config/routes.config";
import { JsonLd } from "@/components/seo/json-ld";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";
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
  const route = routeRegistry.get("/wow-forever/vanguard");
  if (route.class !== "public_indexable") throw new Error("Vanguard must be indexable");
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
  const hero:
    | { src: string; mobileSrc?: string; width: number; height: number }
    | undefined = (
    vanguardAssets.hero as Partial<
      Record<
        "wow" | "forever",
        { src: string; mobileSrc?: string; width: number; height: number }
      >
    >
  )[manifest.phase];

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center bg-[#07080c] text-[#f7e7c4]">
      <JsonLd
        value={webApplicationJsonLd({
          name: route.h1,
          url: `${routeRegistry.site.canonicalOrigin}/wow-forever/vanguard`,
          description: route.description,
        })}
      />

      {/* Single Unified Vanguard Monument Stage: SSR Hero + Interactive Scene + HUD + Overlays */}
      <VanguardEntry
        manifest={manifest}
        classes={WOW_CLASSES}
        assets={vanguardAssets}
        initialSeat={seat.success ? seat.data : null}
        authenticated={Boolean(account)}
        heading={heading}
        hero={hero}
      />

      {/* Supporting Legal, SEO and Community Information (Below the Stage) */}
      <section
        aria-label="Monument information and community tribute"
        className="mx-auto w-full max-w-4xl px-6 py-10 text-center text-xs leading-relaxed text-[#8c7e6c]"
      >
        <div className="mb-4 flex items-center justify-center gap-6 text-xs">
          <Link
            href="/wow-forever/tier-list"
            className="text-[#b59f77] transition-colors hover:text-[#dfcaa2]"
          >
            WoW Forever Tier List
          </Link>
        </div>

        <p className="mx-auto max-w-2xl text-[#9d8e78]">
          8,016 days connect November 23, 2004 and November 4, 2026. A permanent place for the
          players and memories that made this journey. WOW begins with 8,016 places. The complete
          Monument has 64,128 seats.
        </p>

        <p className="mt-4 text-[11px] text-[#6e6354]">
          8016 Vanguard Monument is an unofficial community tribute and is not affiliated with,
          endorsed by, or sponsored by Blizzard Entertainment.
        </p>
      </section>
    </main>
  );
}
