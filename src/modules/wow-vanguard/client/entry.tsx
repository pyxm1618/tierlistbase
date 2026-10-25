"use client";
import Image from "next/image";
import Link from "next/link";
import { trackVanguard } from "./tracking";
import { useEffect, useState } from "react";
import { createVanguardAudio } from "../experience/audio";
import type { VanguardAssets, VanguardManifest } from "./contracts";

export function VanguardEntry(props: {
  manifest: VanguardManifest;
  classes: readonly string[];
  assets: VanguardAssets;
  initialSeat: string | null;
  authenticated: boolean;
  heading?: string | undefined;
  hero?: { src: string; mobileSrc?: string; width: number; height: number } | undefined;
}) {
  const [Experience, setExperience] = useState<React.ComponentType<
    typeof props & {
      entered?: boolean;
      audioController: ReturnType<typeof createVanguardAudio>;
      initialMusic: boolean;
      initialSearch: boolean;
    }
  > | null>(null);
  const [audioController] = useState(() => createVanguardAudio(props.assets));
  const [initialSearch, setInitialSearch] = useState(false);
  const [failed, setFailed] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [music, setMusic] = useState(true);
  const [entered, setEntered] = useState(Boolean(props.initialSeat));

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        const stored = localStorage.getItem("tierlistbase:vanguard:music");
        const enabled = stored !== "0";
        setMusic(enabled);
        void audioController.setMusic(enabled);
      }
    });
    return () => {
      active = false;
      void audioController.close();
    };
  }, [audioController]);

  async function load(enter: boolean) {
    if (enter) {
      setAudioError(false);
      void audioController
        .setMusic(music)
        .then(() => audioController.unlock())
        .catch(() => setAudioError(true));
      setEntered(true);
      trackVanguard("vanguard_enter");
    }
    try {
      const experienceModule = await import("./experience");
      setExperience(() => experienceModule.VanguardExperience);
    } catch {
      setFailed(true);
    }
  }

  // Deep link automatically enters interactive canvas and focuses without requiring manual ENTER click
  useEffect(() => {
    if (!props.initialSeat) return;
    let cancelled = false;

    import("./experience")
      .then((experienceModule) => {
        if (!cancelled) setExperience(() => experienceModule.VanguardExperience);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [props.initialSeat, audioController]);

  const headingText =
    props.heading ??
    {
      WOW_OPEN: "8016 Vanguard Monument",
      WOW_COMPLETE_WAITING: "WOW IS COMPLETE",
      FOREVER_OPEN: "FOREVER IS OPEN",
      COMPLETE: "THE MONUMENT IS COMPLETE",
      SEALED: "THE MONUMENT IS SEALED",
    }[props.manifest.stage];
  const showEventStatus =
    props.manifest.stage === "SEALED" ||
    props.manifest.stage === "COMPLETE" ||
    props.manifest.stage === "WOW_COMPLETE_WAITING";

  return (
    <section aria-label="Monument Stage" data-monument-stage className={"vanguard-stageRoot"}>
      {Experience && entered ? (
        <>
          <Experience
            {...props}
            entered={entered}
            audioController={audioController}
            initialMusic={music}
            initialSearch={initialSearch}
          />
          {audioError && (
            <p role="alert" className="absolute bottom-2 right-4 z-50 text-xs text-rose-300">
              The background music could not load. Try Music On again. Browsing remains available.
            </p>
          )}
        </>
      ) : (
        <section aria-label="Monument" className={"vanguard-stageViewport"}>
          {/* Static Hero Artwork as primary SSR / LCP visual */}
          {props.hero ? (
            <picture>
              {props.hero.mobileSrc && (
                <source
                  media="(max-width: 640px)"
                  srcSet={props.hero.mobileSrc}
                  type="image/webp"
                />
              )}
              <Image
                unoptimized
                src={props.hero.src}
                width={props.hero.width}
                height={props.hero.height}
                alt=""
                loading="eager"
                fetchPriority="high"
                className="vanguard-heroArtwork absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-500"
              />
            </picture>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-amber-200">
              <p>MISSING_ASSET: final {props.manifest.phase.toUpperCase()} Monument artwork.</p>
            </div>
          )}

          {/* Ambient Vignette Overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,transparent_60%,rgba(5,6,8,0.75)_100%)]" />

          {/* Top Stage HUD */}
          <header className="pointer-events-auto absolute left-3 right-3 top-3 z-30 flex flex-wrap items-center justify-between gap-2.5">
            {showEventStatus ? (
              <div className="flex items-center gap-2 rounded border border-[#7a6336]/40 bg-[#0d0f17]/85 px-3 py-1.5 backdrop-blur-md shadow-md">
                <p
                  role="status"
                  className="text-xs font-semibold uppercase tracking-widest text-[#dfcaa2]"
                >
                  {props.manifest.stage === "SEALED"
                    ? "THE MONUMENT IS SEALED"
                    : props.manifest.stage === "COMPLETE"
                      ? "THE MONUMENT IS COMPLETE"
                      : "WOW IS COMPLETE"}
                </p>
              </div>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setInitialSearch(true);
                  void load(true);
                }}
                className="rounded border border-[#7a6336] bg-[#221f18]/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] backdrop-blur-md transition hover:border-[#d4af37] hover:bg-[#332e23]"
              >
                Search
              </button>
              <Link
                href="/wow-forever/vanguard/my"
                className="rounded border border-[#7a6336] bg-[#221f18]/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] backdrop-blur-md transition hover:border-[#d4af37] hover:bg-[#332e23]"
              >
                My Vanguard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAudioError(false);
                  const enabled = !music;
                  setMusic(enabled);
                  localStorage.setItem("tierlistbase:vanguard:music", enabled ? "1" : "0");
                  void Promise.all([
                    audioController.setMusic(enabled),
                    audioController.unlock(),
                  ]).catch(() => setAudioError(true));
                }}
                className="rounded border border-[#7a6336] bg-[#221f18]/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] backdrop-blur-md transition hover:border-[#d4af37] hover:bg-[#332e23]"
              >
                {music ? "Music On" : "Music Off"}
              </button>
            </div>
          </header>

          {/* Center / Bottom Monument Call-to-Action Layer */}
          <div className={"vanguard-heroIntroContent"}>
            <div className={"vanguard-heroIntroInner"}>
              <h1 className={"vanguard-monumentTitle"}>{headingText}</h1>

              <p className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                {props.manifest.stage === "WOW_OPEN"
                  ? `${props.manifest.counts.total.toLocaleString("en-US")} / 8,016 FOUNDING PLACES INSCRIBED`
                  : props.manifest.stage === "FOREVER_OPEN"
                    ? `${props.manifest.counts.total.toLocaleString("en-US")} / 64,128 PLACES INSCRIBED`
                    : props.manifest.stage === "SEALED"
                      ? "The inscription period has ended. Every completed Vanguard remains here to explore."
                      : props.manifest.stage === "WOW_COMPLETE_WAITING"
                        ? `FOREVER AWAKENS IN … ${props.manifest.foreverUnlockAt ?? ""}`
                        : "THE MONUMENT IS COMPLETE"}
              </p>
              {(props.manifest.stage === "WOW_OPEN" || props.manifest.stage === "FOREVER_OPEN") && (
                <p className="max-w-md text-xs text-[#cfbe9f]">
                  A limited-time community tribute before WoW Forever launches — leave one permanent
                  Seat.
                </p>
              )}

              {/* Primary Epic CTA */}
              <button
                type="button"
                onClick={() => void load(true)}
                className="mt-2 rounded-md border-2 border-[#c9a44e] bg-gradient-to-b from-[#44371e] via-[#201a0e] to-[#130f08] px-8 py-3 text-base font-bold uppercase tracking-widest text-[#fff1cf] shadow-[0_0_24px_rgba(201,164,78,0.35)] transition hover:border-[#ffd875] hover:from-[#574627] hover:to-[#1a150b] hover:shadow-[0_0_32px_rgba(255,216,117,0.6)] sm:text-lg"
              >
                ENTER THE MONUMENT
              </button>
            </div>
          </div>

          {audioError && (
            <p role="alert" className="absolute bottom-2 right-4 z-50 text-xs text-rose-300">
              The background music could not load. Try Music On again. Browsing remains available.
            </p>
          )}
          {failed && (
            <p role="alert" className="absolute bottom-2 left-4 z-50 text-xs text-rose-300">
              The Monument could not load. Try again.
            </p>
          )}
        </section>
      )}
    </section>
  );
}
