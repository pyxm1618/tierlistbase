"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PublicInscription } from "../db/service";
import Link from "next/link";
import styles from "./vanguard.module.css";
import { VanguardRitual } from "./ritual";
import Image from "next/image";
import { VanguardFocusVisual } from "./focus-visual";
import { parseSeatId } from "../domain/event";
import {
  vanguardErrorMessage,
  draftFromStorage,
  ritualSound,
  type VanguardManifest,
  type VanguardAssets,
  type RitualFrame,
} from "./contracts";
import { VanguardClientError, vanguardRequest, pollVanguardManifest } from "./api";
import { VanguardClaim, DRAFT_KEY } from "./claim";
import { VanguardCanvas } from "./canvas";
import { VanguardSealControl } from "./seal";
import { trackVanguard } from "./tracking";

export function VanguardExperience({
  manifest: initial,
  assets,
  classes,
  initialSeat,
  authenticated,
  entered = true,
  audioController,
  initialMusic,
  initialSearch = false,
}: {
  entered?: boolean;
  audioController: import("../experience/audio").VanguardAudioController;
  initialMusic: boolean;
  initialSearch?: boolean;
  manifest: VanguardManifest;
  assets: VanguardAssets;
  classes: readonly string[];
  initialSeat: string | null;
  authenticated: boolean;
}) {
  const [monumentEntered, setMonumentEntered] = useState(entered);
  const [submissionPending, setSubmissionPending] = useState(false);
  const [manifest, setManifest] = useState(initial);
  const [focus, setFocus] = useState<PublicInscription | null>(null);
  const [mine, setMine] = useState<PublicInscription | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(initialSearch);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicInscription[]>([]);
  const [notice, setNotice] = useState("");
  const [frame, setFrame] = useState<RitualFrame | null>(null);
  const [acceptedSeat, setAcceptedSeat] = useState<PublicInscription | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [music, setMusic] = useState(initialMusic);
  const [camera, setCamera] = useState(false);
  const [cameraPending, setCameraPending] = useState(false);
  const cameraGeneration = useRef(0);
  const [scatter, setScatter] = useState(false);
  const [nearby, setNearby] = useState<string[]>([]);
  const [suggested, setSuggested] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("privacy");
  const [reporting, setReporting] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!manifest.foreverUnlockAt) return;
    const update = () => {
      const seconds = Math.max(
        0,
        Math.ceil((Date.parse(manifest.foreverUnlockAt!) - Date.now()) / 1000),
      );
      setCountdown(
        `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
      );
    };
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [manifest.foreverUnlockAt]);

  const video = useRef<HTMLVideoElement>(null);
  const stopCamera = useRef<(() => void) | null>(null);
  const scene = useRef<{
    pick: (x: number, y: number) => void;
    gather: () => void;
    scatter: () => void;
    focus?: (id: string) => void;
  } | null>(null);
  const audio = useRef(audioController);
  const select = useRef<(id: string, resume?: boolean) => Promise<void>>(async () => {});
  const ritualLocked = submissionPending || (frame !== null && frame !== "reveal");
  const claimOpen = manifest.stage === "WOW_OPEN" || manifest.stage === "FOREVER_OPEN";

  function error(error: unknown) {
    setNotice(
      vanguardErrorMessage(
        error instanceof VanguardClientError ? error.code : "SERVICE_UNAVAILABLE",
      ),
    );
  }

  async function choose(id: string, resume = false) {
    if (scatter) scene.current?.gather();
    setScatter(false);
    try {
      parseSeatId(id);
      if (resume && claimOpen && !mine && parseSeatId(id).phase === manifest.phase) {
        setSelected(id);
        setFocus(null);
        setRevealed(false);
        setSearchOpen(false);
        return;
      }
      const seat = await vanguardRequest<PublicInscription>(
        `inscriptions/${encodeURIComponent(id)}`,
      );
      scene.current?.focus?.(id);
      setFocus(seat);
      setSelected(null);
      setRevealed(false);
      setSearchOpen(false);
      trackVanguard("vanguard_focus");
      await audio.current?.sfx("focus");
    } catch (cause) {
      if (cause instanceof VanguardClientError && cause.code === "SEAT_NOT_FOUND") {
        if (!claimOpen || parseSeatId(id).phase !== manifest.phase) {
          setNotice(
            manifest.stage === "SEALED"
              ? vanguardErrorMessage("EVENT_SEALED")
              : vanguardErrorMessage("PHASE_NOT_OPEN"),
          );
          return;
        }
        if (mine) {
          setNotice(vanguardErrorMessage("ACCOUNT_ALREADY_INSCRIBED"));
          return;
        }
        setSelected(id);
        setFocus(null);
        setSuggested(null);
        setRevealed(false);
        setSearchOpen(false);
        trackVanguard("claim_start");
      } else error(cause);
    }
  }

  useEffect(() => {
    select.current = choose;
  });

  useEffect(() => pollVanguardManifest(initial, setManifest, error), [initial]);

  useEffect(() => {
    if (authenticated)
      vanguardRequest<{ inscription: PublicInscription | null }>("me")
        .then((value) => setMine(value.inscription))
        .catch(error);
    return () => {
      cameraGeneration.current++;
      stopCamera.current?.();
    };
  }, [assets, authenticated]);

  useEffect(() => {
    try {
      const saved = draftFromStorage(sessionStorage.getItem(DRAFT_KEY));
      const id = initialSeat ?? saved?.seatId;
      if (id) void select.current(id, saved?.seatId === id);
      if (initialSeat) trackVanguard("invite_open");
    } catch {
      setNotice("Your saved draft could not be read. Select a seat to continue.");
    }
  }, [initialSeat]);

  useEffect(() => {
    if (!(searchOpen || focus || selected)) return;
    const panel = document.querySelector<HTMLElement>("[data-monument-stage] [data-stage-panel]");
    panel
      ?.querySelector<HTMLElement>('input:not([type="file"]), button:not(:disabled), a[href]')
      ?.focus({ preventScroll: true });
  }, [searchOpen, focus, selected, revealed]);

  async function toggleMusic() {
    const enabled = !music;
    setMusic(enabled);
    localStorage.setItem("tierlistbase:vanguard:music", enabled ? "1" : "0");
    try {
      await audio.current?.unlock();
      await audio.current?.setMusic(enabled);
    } catch {
      setNotice("The music asset could not be loaded. Browsing remains available.");
    }
  }

  async function enableCamera() {
    if (camera) {
      stopCamera.current?.();
      stopCamera.current = null;
      setCamera(false);
      return;
    }
    if (!video.current || cameraPending) return;
    const generation = ++cameraGeneration.current;
    setCameraPending(true);
    try {
      const { enableVanguardGestures } = await import("../experience/gestures");
      const stop = await enableVanguardGestures(
        video.current,
        (gesture, point) => {
          if (gesture === "fist") {
            scene.current?.gather();
            setScatter(false);
          }
          if (gesture === "open_palm") setScatter(true);
          if (gesture === "pinch") scene.current?.pick(point.x, point.y);
        },
        () => {
          setCamera(false);
          setNotice("Gesture detection stopped. Continue with mouse, pointer or touch.");
        },
      );
      if (generation !== cameraGeneration.current) {
        stop();
        return;
      }
      stopCamera.current = stop;
      setCamera(true);
    } catch {
      setCamera(false);
      setNotice("Gesture control is unavailable. Continue with mouse, pointer or touch.");
    } finally {
      if (generation === cameraGeneration.current) setCameraPending(false);
    }
  }

  async function search(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await vanguardRequest<{ results: PublicInscription[] }>(
        `search?q=${encodeURIComponent(query)}`,
      );
      setResults(result.results);
    } catch (cause) {
      error(cause);
    }
  }

  async function share(seat: PublicInscription) {
    const url = `${location.origin}/wow-forever/vanguard?seat=${encodeURIComponent(seat.seatId)}`;
    try {
      if (navigator.share) await navigator.share({ title: "STAND BESIDE ME", url });
      else await navigator.clipboard.writeText(url);
      trackVanguard("share");
      setNotice("Your Seat link is ready to share.");
    } catch {
      setNotice(`Share your Seat link: ${url}`);
    }
  }

  async function report() {
    if (!focus) return;
    setReporting(true);
    try {
      await vanguardRequest("reports", { seatId: focus.seatId, reason: reportReason });
      setNotice("Report received. Thank you.");
      trackVanguard("report_submit");
    } catch (cause) {
      error(cause);
    } finally {
      setReporting(false);
    }
  }

  const active = focus?.status === "active" ? focus : null;
  const tierLink = (name: string) => `/wow-forever/tier-list?class=${encodeURIComponent(name)}`;

  return (
    <section
      aria-label="Monument experience"
      data-clarity-mask="true"
      className={styles.experience}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !ritualLocked) {
          setSearchOpen(false);
          setFocus(null);
          setSelected(null);
          setRevealed(false);
          event.currentTarget.querySelector<HTMLButtonElement>("[data-search-trigger]")?.focus();
        }
        if (event.key === "Tab") {
          const panel = event.currentTarget.querySelector<HTMLElement>(`[data-stage-panel]`);
          const nodes = panel
            ? Array.from(
                panel.querySelectorAll<HTMLElement>(
                  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), summary, [tabindex]:not([tabindex="-1"])',
                ),
              ).filter(
                (node) =>
                  node.tabIndex >= 0 &&
                  node.getClientRects().length > 0 &&
                  (!node.closest("details:not([open])") ||
                    node ===
                      node.closest("details:not([open])")?.querySelector(":scope > summary")) &&
                  getComputedStyle(node).visibility !== "hidden" &&
                  !node.closest("[inert]"),
              )
            : [];
          if (nodes?.length) {
            const first = nodes[0]!;
            const last = nodes[nodes.length - 1]!;
            if (
              event.shiftKey &&
              (document.activeElement === first || !panel?.contains(document.activeElement))
            ) {
              event.preventDefault();
              last.focus();
            } else if (
              !event.shiftKey &&
              (document.activeElement === last || !panel?.contains(document.activeElement))
            ) {
              event.preventDefault();
              first.focus();
            }
          }
        }
        if (!event.repeat && (event.key === " " || event.key === "Enter"))
          void audio.current
            ?.unlock()
            .catch(() => setNotice("Audio could not start. Browsing remains available."));
      }}
      onPointerDown={() => {
        void audio.current
          ?.unlock()
          .catch(() => setNotice("Audio could not start. Browsing remains available."));
      }}
    >
      <video ref={video} muted playsInline hidden />

      {/* Main Monument Stage Container */}
      <div className={styles.stageViewport}>
        {/* Interactive WebGL Canvas */}
        {monumentEntered && (
          <VanguardCanvas
            manifest={manifest}
            assets={assets}
            scatter={scatter}
            onNearby={setNearby}
            overview={revealed}
            focusSeat={focus?.seatId ?? null}
            onSeat={(id) => {
              if (!ritualLocked) void choose(id);
            }}
            onController={(controller) => {
              scene.current = controller;
            }}
          />
        )}

        {/* Ambient Vignette Overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,transparent_60%,rgba(5,6,8,0.75)_100%)]" />

        {/* Top Monument HUD Bar */}
        <header className="pointer-events-auto absolute left-3 right-3 top-3 z-30 flex flex-wrap items-center justify-between gap-2.5">
          {/* Status & Countdown */}
          <div className="flex items-center gap-2 rounded border border-[#7a6336]/40 bg-[#0d0f17]/85 px-3 py-1.5 backdrop-blur-md shadow-md">
            <p
              role="status"
              className="text-xs font-semibold uppercase tracking-widest text-[#dfcaa2]"
            >
              {manifest.stage === "SEALED"
                ? "THE MONUMENT IS SEALED"
                : manifest.stage === "COMPLETE"
                  ? "THE MONUMENT IS COMPLETE"
                  : manifest.stage === "WOW_COMPLETE_WAITING"
                    ? "WOW IS COMPLETE"
                    : `${manifest.counts.total.toLocaleString("en-US")} places inscribed`}
            </p>
            {manifest.stage === "SEALED" && (
              <span className="hidden text-xs text-[#9d8e78] sm:inline">
                · The inscription period has ended.
              </span>
            )}
            {manifest.stage === "WOW_COMPLETE_WAITING" && (
              <span className="text-xs text-amber-300">
                · FOREVER AWAKENS IN …{" "}
                <time dateTime={manifest.foreverUnlockAt!}>
                  {countdown ?? manifest.foreverUnlockAt}
                </time>
              </span>
            )}
          </div>

          {/* HUD Action Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={ritualLocked}
              data-search-trigger
              onClick={() => {
                setSearchOpen(true);
                setFocus(null);
                setSelected(null);
              }}
              className="rounded border border-[#7a6336] bg-[#221f18]/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] backdrop-blur-md transition hover:border-[#d4af37] hover:bg-[#332e23] disabled:opacity-40"
            >
              Search
            </button>

            <Link
              href="/account/vanguard"
              className="rounded border border-[#7a6336] bg-[#221f18]/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] backdrop-blur-md transition hover:border-[#d4af37] hover:bg-[#332e23]"
            >
              My Vanguard
            </Link>

            <button
              type="button"
              disabled={!monumentEntered || ritualLocked || cameraPending}
              onClick={() => void enableCamera()}
              className="inline-flex rounded border border-[#7a6336]/60 bg-[#161821]/80 px-2.5 py-1 text-xs text-[#cfbe9f] backdrop-blur-md transition hover:border-[#d4af37] disabled:opacity-40"
            >
              {camera ? "Disable Gesture Control" : "Enable Gesture Control"}
            </button>

            <button
              type="button"
              onClick={() => void toggleMusic()}
              className="rounded border border-[#7a6336] bg-[#221f18]/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] backdrop-blur-md transition hover:border-[#d4af37] hover:bg-[#332e23]"
            >
              {music ? "Music On" : "Music Off"}
            </button>
          </div>
        </header>

        {/* Scattered State Notice */}
        {scatter && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 rounded border border-[#7a6336]/40 bg-[#0d0f17]/90 px-3 py-1 text-xs text-amber-200">
            <p role="status">Scatter view · make a fist to gather the Monument.</p>
          </div>
        )}

        {/* Hero CTA fallback if not yet entered */}
        {!monumentEntered && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 pb-12 text-center">
            <div className="pointer-events-auto flex max-w-xl flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  void audio.current?.unlock();
                  setMonumentEntered(true);
                  trackVanguard("vanguard_enter");
                }}
                className="rounded-md border-2 border-[#c9a44e] bg-gradient-to-b from-[#44371e] via-[#201a0e] to-[#130f08] px-8 py-3.5 text-lg font-bold uppercase tracking-widest text-[#fff1cf] shadow-[0_0_24px_rgba(201,164,78,0.35)] transition hover:border-[#ffd875] hover:from-[#574627] hover:to-[#1a150b] hover:shadow-[0_0_32px_rgba(255,216,117,0.6)]"
              >
                ENTER THE MONUMENT
              </button>
            </div>
          </div>
        )}

        {/* Search Overlay Modal */}
        {searchOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Monument panel"
            className={styles.stageOverlayBackdrop}
          >
            <div data-stage-panel className={`${styles.stageModalPanel} ${styles.searchPanel}`}>
              <button
                type="button"
                aria-label="Close Search"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded border border-[#7a6336]/50 text-sm text-[#cfbe9f] hover:border-[#d4af37] hover:text-white"
              >
                <span aria-hidden="true">✕</span>
              </button>

              <h2 className="mb-4 text-base font-bold uppercase tracking-wider text-amber-200">
                Search the Monument
              </h2>

              <form onSubmit={search} className="space-y-3">
                <label className="flex flex-col gap-1 text-xs text-amber-200/90">
                  <span>Search Seat ID, Vanguard Name or Guild</span>
                  <input
                    value={query}
                    maxLength={48}
                    minLength={2}
                    required
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="e.g. WOW-W1-0001 or Vanguard"
                    className="rounded border border-[#7a6336] bg-[#1a1c24] px-3 py-2 text-sm text-[#f7e7c4] outline-none transition focus:border-[#d4af37]"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    disabled={ritualLocked}
                    className="flex-1 rounded border border-[#947a46] bg-[#2a251b] py-2 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] transition hover:border-[#d4af37] hover:bg-[#3d3527] disabled:opacity-40"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    disabled={ritualLocked || !query}
                    onClick={() => {
                      if (!ritualLocked && query) void choose(query);
                    }}
                    className="rounded border border-[#7a6336] bg-[#1a1c24] px-3 py-2 text-xs text-[#cfbe9f] hover:border-[#d4af37]"
                  >
                    Focus Seat
                  </button>
                </div>
              </form>

              {results.length > 0 && (
                <ul className="mt-4 max-h-48 space-y-1.5 overflow-y-auto border-t border-[#7a6336]/40 pt-3">
                  {results.map((seat) => (
                    <li key={seat.seatId}>
                      <button
                        type="button"
                        disabled={ritualLocked}
                        onClick={() => void choose(seat.seatId)}
                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs text-[#dfcaa2] transition hover:bg-[#1f222e]"
                      >
                        <span className="font-semibold">{seat.seatId}</span>
                        <span className="text-[#a89b84]">
                          {seat.status === "active" ? seat.displayName : "Unavailable"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Focus Overlay / Focus Panel */}
        {focus && !revealed && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Monument panel"
            className={styles.stageOverlayBackdrop}
          >
            <section
              data-stage-panel
              aria-label="Vanguard Focus"
              className={`${styles.stageModalPanel} ${styles.focusPanel}`}
            >
              <button
                type="button"
                aria-label="Close Focus"
                onClick={() => setFocus(null)}
                className="absolute right-3 top-3 z-50 flex h-7 w-7 items-center justify-center rounded border border-[#7a6336]/50 text-sm text-[#cfbe9f] hover:border-[#d4af37] hover:text-white"
              >
                <span aria-hidden="true">✕</span>
              </button>

              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-amber-200">
                Vanguard Memory
              </h2>

              {active ? (
                <div className="space-y-4">
                  {/* Single Unified Focus Panel Visual */}
                  <VanguardFocusVisual seat={active} assets={assets} />

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#7a6336]/40 pt-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void share(active)}
                        className="rounded border border-[#947a46] bg-[#2a251b] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] shadow transition hover:border-[#d4af37] hover:bg-[#3d3527]"
                      >
                        STAND BESIDE ME
                      </button>

                      <a
                        href={tierLink(active.className)}
                        onClick={() => trackVanguard("tier_list_click")}
                        className="text-xs text-[#b59f77] underline hover:text-[#dfcaa2]"
                      >
                        View {active.className} Tier List
                      </a>
                    </div>

                    {/* Low-priority Report Accordion */}
                    <details className="text-xs text-[#8c7e6c]">
                      <summary className="cursor-pointer hover:text-amber-200">Report</summary>
                      <div className="mt-2 flex flex-col gap-2 rounded border border-[#7a6336]/30 bg-[#0d0e14] p-2">
                        <label className="flex flex-col gap-1">
                          <span>Reason</span>
                          <select
                            value={reportReason}
                            onChange={(event) => setReportReason(event.target.value)}
                            className="rounded border border-[#7a6336] bg-[#1a1c24] px-2 py-1 text-xs text-[#f7e7c4]"
                          >
                            <option value="sexual_graphic">Sexual / Graphic Content</option>
                            <option value="hate_impersonation">
                              Hate / Harassment / Impersonation
                            </option>
                            <option value="privacy">Privacy</option>
                            <option value="spam_promotion">Spam / Promotion</option>
                            <option value="other">Other</option>
                          </select>
                        </label>
                        <button
                          type="button"
                          disabled={reporting}
                          onClick={() => void report()}
                          className="rounded border border-[#7a6336] bg-[#1f1a14] py-1 text-xs text-[#cfbe9f] hover:border-[#d4af37]"
                        >
                          Submit Report
                        </button>
                      </div>
                    </details>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[#cfbe9f]">Unavailable Plate</p>
              )}
            </section>
          </div>
        )}

        {/* Claim Overlay Modal */}
        {selected && (claimOpen || submissionPending || acceptedSeat) && !mine && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Monument panel"
            className={styles.stageOverlayBackdrop}
          >
            <div data-stage-panel className={`${styles.stageModalPanel} ${styles.claimPanel}`}>
              <button
                type="button"
                aria-label="Close Claim"
                disabled={ritualLocked}
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-50 flex h-7 w-7 items-center justify-center rounded border border-[#7a6336]/50 text-sm text-[#cfbe9f] hover:border-[#d4af37] hover:text-white"
              >
                <span aria-hidden="true">✕</span>
              </button>

              {suggested && claimOpen && (
                <button
                  type="button"
                  onClick={() => void choose(suggested)}
                  className="mb-4 mt-8 w-full rounded border border-amber-400 px-4 py-2 text-sm text-amber-200"
                >
                  Choose nearby seat {suggested}
                </button>
              )}
              <VanguardClaim
                key={selected}
                seatId={selected}
                classes={classes}
                assets={assets}
                authenticated={authenticated}
                onAccepted={setAcceptedSeat}
                onConflict={setSuggested}
                onPending={setSubmissionPending}
                onFrame={(next) => {
                  setFrame(next === "reveal" ? null : next);
                  if (next === "camera_focus" && selected) scene.current?.focus?.(selected);
                  if (next === "camera_pull_back") scene.current?.gather();
                  audio.current?.duck(next !== "reveal");
                  const channel = ritualSound(next);
                  if (channel)
                    void audio.current
                      ?.sfx(channel)
                      .catch(() =>
                        setNotice("A sound asset could not load. Your inscription is preserved."),
                      );
                }}
                onComplete={(seat) => {
                  setFocus(seat);
                  setMine(seat);
                  setSelected(null);
                  setRevealed(true);
                  setAcceptedSeat(null);
                  trackVanguard("claim_complete");
                }}
              />
            </div>
          </div>
        )}

        {frame && !acceptedSeat && assets.effects?.focus && (
          <div aria-label="Inscription charge" className={styles.charge} data-frame={frame}>
            <Image unoptimized src={assets.effects?.focus} alt="" width={1254} height={1254} />
          </div>
        )}
        {submissionPending && !acceptedSeat && (
          <p role="status" className={styles.sealing}>
            Sealing · awaiting confirmation…
          </p>
        )}
        {acceptedSeat && frame && (
          <VanguardRitual seat={acceptedSeat} frame={frame} assets={assets} />
        )}
        {/* Reveal Overlay Modal */}
        {focus && revealed && active && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Monument panel"
            className={styles.stageOverlayBackdrop}
          >
            <section
              data-stage-panel
              aria-label="Vanguard Reveal"
              className={`${styles.stageModalPanel} ${styles.revealPanel}`}
            >
              <h2 className="mb-4 text-center text-xl font-bold uppercase tracking-widest text-[#fff1cf] drop-shadow-md">
                Your place in the Monument
              </h2>

              <VanguardFocusVisual seat={active} assets={assets} />

              <div className="my-5 flex flex-col items-center">
                <VanguardSealControl
                  showPreview
                  seat={active}
                  assets={assets}
                  onSave={() => trackVanguard("seal_save")}
                />
              </div>

              <div className="flex flex-col items-center gap-3 border-t border-[#7a6336]/40 pt-4">
                <div className="flex w-full flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => void share(active)}
                    className="rounded border border-[#947a46] bg-[#2a251b] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] shadow transition hover:border-[#d4af37] hover:bg-[#3d3527]"
                  >
                    STAND BESIDE ME
                  </button>

                  <a
                    href={tierLink(active.className)}
                    onClick={() => trackVanguard("tier_list_click")}
                    className="inline-flex items-center rounded border border-[#7a6336]/60 bg-[#161821] px-4 py-2 text-xs font-medium text-amber-200 transition hover:border-[#d4af37]"
                  >
                    See how {active.className} is performing in WoW Forever
                  </a>
                </div>

                <button
                  type="button"
                  disabled={ritualLocked}
                  onClick={() => {
                    setFocus(null);
                    setSelected(null);
                    setRevealed(false);
                    setScatter(false);
                    scene.current?.gather();
                  }}
                  className="mt-2 text-xs text-[#9d8e78] underline hover:text-[#d4af37]"
                >
                  Continue exploring
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Nearby Available Seats Indicator */}
        {claimOpen && !mine && nearby.length > 0 && (
          <aside
            aria-label="Nearby available places"
            className="absolute bottom-3 left-3 z-20 flex max-w-xs flex-col gap-1 rounded border border-[#7a6336]/40 bg-[#0d0f17]/90 p-2.5 backdrop-blur-md shadow-lg"
          >
            <p className="text-[11px] text-[#cfbe9f]">
              Stand beside this Vanguard. Availability is rechecked when selected.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {nearby.slice(0, 4).map((id) => (
                <button
                  key={id}
                  disabled={ritualLocked}
                  onClick={() => void choose(id)}
                  className="rounded border border-[#7a6336] bg-[#1a1c24] px-2 py-0.5 text-xs text-[#dfcaa2] hover:border-[#d4af37]"
                >
                  {id}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* User Inscription Quick Access */}
        {mine && !focus && (
          <div className="absolute bottom-3 right-3 z-20">
            <button
              type="button"
              onClick={() => void choose(mine.seatId)}
              className="rounded border border-[#d4af37] bg-gradient-to-b from-[#3d331c] to-[#1e190e] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#fff4d8] shadow-lg transition hover:border-[#ffd875]"
            >
              VIEW MY SEAT
            </button>
          </div>
        )}

        {/* Global Floating Notice */}
        {notice && (
          <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded border border-[#7a6336] bg-[#11131a]/95 px-4 py-2 shadow-2xl backdrop-blur-md">
            <p role="alert" className="text-xs text-amber-200">
              {notice}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
