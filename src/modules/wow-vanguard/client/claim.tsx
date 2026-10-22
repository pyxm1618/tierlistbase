"use client";
import type { VanguardAssets } from "./contracts";
import { useEffect, useRef, useState } from "react";
import type { PublicInscription } from "../db/service";
import { trackVanguard } from "./tracking";
import {
  draftFromStorage,
  vanguardErrorMessage,
  runPostSuccessRitual,
  type ClaimDraft,
  type RitualFrame,
} from "./contracts";
import { VanguardClientError, vanguardRequest } from "./api";
import { validateVanguardText } from "../domain/text";
import { cropVanguardImage, decodeLocalImage } from "./crop";

export const DRAFT_KEY = "tierlistbase:vanguard:draft";
const HOLD_DURATION_MS = 4000;

export function VanguardClaim({
  seatId,
  classes,
  authenticated,
  onComplete,
  onAccepted,
  onConflict,
  onFrame,
  onPending,
}: {
  assets?: VanguardAssets;
  seatId: string;
  classes: readonly string[];
  authenticated: boolean;
  onComplete: (seat: PublicInscription) => void;
  onAccepted: (seat: PublicInscription) => void;
  onConflict: (id: string | null) => void;
  onFrame: (frame: RitualFrame) => void;
  onPending: (pending: boolean) => void;
}) {
  const [draft, setDraft] = useState<ClaimDraft>(() => {
    let saved: ClaimDraft | null = null;
    try {
      if (typeof window !== "undefined")
        saved = draftFromStorage(sessionStorage.getItem(DRAFT_KEY));
    } catch {
      /* The save effect reports unavailable storage and prevents OAuth navigation. */
    }
    return saved
      ? { ...saved, seatId }
      : { seatId, displayName: "", faction: "", className: "", guildName: "", battleCry: "" };
  });

  const renderFrame = (frame: RitualFrame) => {
    onFrame(frame);
  };
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [mediaStatus, setMediaStatus] = useState<"none" | "pending" | "approved" | "rejected">(
    "none",
  );
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 512 });
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cropDrag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  // 4000ms HOLD TO INSCRIBE states
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdStartRef = useRef<number | null>(null);
  const holdFrameIdRef = useRef<number | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredSubmit = useRef(false);
  const submission = useRef(false);
  const cancelActiveHold = useRef<() => void>(() => {});
  const frameCallback = useRef(onFrame);
  useEffect(() => {
    cancelActiveHold.current = cancelHold;
    frameCallback.current = onFrame;
  });

  function report(error: unknown) {
    const code =
      error instanceof VanguardClientError
        ? error.code
        : error instanceof Error
          ? error.message
          : "SERVICE_UNAVAILABLE";
    setNotice(
      code === "HOLD_EXPIRED"
        ? "Please try inscribing again. Your text draft is preserved."
        : vanguardErrorMessage(code),
    );
    if (error instanceof VanguardClientError && code === "SEAT_ALREADY_CLAIMED")
      onConflict(
        typeof error.details.nearestSeatId === "string" ? error.details.nearestSeatId : null,
      );
  }

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      void Promise.resolve().then(() =>
        setNotice(
          "Your browser could not save this draft. Enable session storage before signing in; keep this page open.",
        ),
      );
    }
  }, [draft]);

  useEffect(() => {
    const blur = () => cancelActiveHold.current();
    const visibility = () => {
      if (document.visibilityState === "hidden") cancelActiveHold.current();
    };
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      if (holdStartRef.current !== null) {
        holdStartRef.current = null;
        frameCallback.current("reveal");
      }
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (holdFrameIdRef.current !== null) cancelAnimationFrame(holdFrameIdRef.current);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  useEffect(() => {
    if (!bitmap) return;
    const node = canvas.current;
    const context = node?.getContext("2d");
    if (node && context) {
      node.width = node.height = 256;
      context.drawImage(bitmap, crop.x, crop.y, crop.size, crop.size, 0, 0, 256, 256);
    }
  }, [bitmap, crop]);

  useEffect(() => () => bitmap?.close(), [bitmap]);

  async function hold() {
    setBusy(true);
    setNotice("");
    try {
      const held = await vanguardRequest<{ holdToken: string }>("holds", {
        seatId,
        ...(draft.holdToken ? { holdToken: draft.holdToken } : {}),
      });
      setDraft((current) => ({ ...current, seatId, holdToken: held.holdToken }));
      return held.holdToken;
    } catch (error) {
      report(error);
      return null;
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    let saved: ClaimDraft | null = null;
    try {
      saved = draftFromStorage(sessionStorage.getItem(DRAFT_KEY));
    } catch {
      void Promise.resolve().then(() =>
        setNotice("Your saved draft could not be read. Keep this page open while you continue."),
      );
    }
    vanguardRequest<{ holdToken: string }>("holds", {
      seatId,
      ...(saved?.holdToken ? { holdToken: saved.holdToken } : {}),
    })
      .then((held) => {
        if (!cancelled) setDraft((current) => ({ ...current, seatId, holdToken: held.holdToken }));
      })
      .catch((error) => {
        if (!cancelled) report(error);
      });
    return () => {
      cancelled = true;
    };
  }, [seatId, authenticated]);

  async function choose(file: File | undefined) {
    if (!file) return;
    setNotice("");
    try {
      const decoded = await decodeLocalImage(file);
      setBitmap(decoded);
      setCrop({ x: 0, y: 0, size: Math.min(decoded.width, decoded.height) });
      setMediaId(null);
      setMediaStatus("pending");
    } catch (error) {
      report(error);
    }
  }

  async function upload() {
    if (!bitmap) return;
    setBusy(true);
    try {
      const blob = await cropVanguardImage(bitmap, crop);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = URL.createObjectURL(blob);
      setPreview(previewRef.current);
      const signed = await vanguardRequest<{
        mediaId: string;
        uploadUrl: string;
        contentType: string;
      }>("media/presign", {});
      setMediaId(signed.mediaId);
      setMediaStatus("pending");
      let response: Response;
      try {
        response = await fetch(signed.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": signed.contentType },
          body: blob,
        });
      } catch {
        throw new VanguardClientError("UPLOAD_FAILED");
      }
      if (!response.ok) throw new VanguardClientError("UPLOAD_FAILED");
      await moderate(signed.mediaId);
    } catch (error) {
      report(error);
    } finally {
      setBusy(false);
    }
  }

  async function moderate(id: string) {
    try {
      await vanguardRequest("media/complete", { mediaId: id });
      setMediaStatus("approved");
      trackVanguard("media_upload");
    } catch (error) {
      if (error instanceof VanguardClientError && error.code === "MEDIA_MODERATION_REJECTED")
        trackVanguard("media_rejected");
      setMediaStatus(
        error instanceof VanguardClientError && error.code === "MEDIA_MODERATION_REJECTED"
          ? "rejected"
          : "pending",
      );
      throw error;
    }
  }

  async function retry() {
    if (!mediaId) return;
    setBusy(true);
    try {
      await moderate(mediaId);
    } catch (error) {
      report(error);
    } finally {
      setBusy(false);
    }
  }

  async function inscribe() {
    if (submission.current || locked || busy) return;
    if (!draft.displayName || !draft.faction || !draft.className) {
      setNotice("Choose your Vanguard Name, Faction and Class.");
      onFrame("reveal");
      return;
    }
    for (const [label, value, min, max] of [
      ["Vanguard Name", draft.displayName, 2, 32],
      ["Guild", draft.guildName, 0, 48],
      ["Battle Cry", draft.battleCry, 0, 120],
    ] as const) {
      try {
        validateVanguardText(value, min, max);
      } catch {
        setNotice(
          `${label}: use plain text (${min}–${max} characters), without links or contact details.`,
        );
        onFrame("reveal");
        return;
      }
    }
    if (!classes.includes(draft.className)) {
      setNotice("Choose a valid Class.");
      onFrame("reveal");
      return;
    }
    submission.current = true;
    onPending(true);
    setBusy(true);
    try {
      const token = await hold();
      if (!token) return;
      const seat = await vanguardRequest<PublicInscription>("inscriptions", {
        ...draft,
        seatId,
        holdToken: token,
        ...(mediaStatus === "approved" && mediaId ? { mediaId } : {}),
      });
      setLocked(true);
      onAccepted(seat);
      sessionStorage.removeItem(DRAFT_KEY);
      await runPostSuccessRitual(
        renderFrame,
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      onComplete(seat);
    } catch (error) {
      report(error); // A lost response never means success: recover only from an actual server-owned inscription.
      try {
        const current = await vanguardRequest<{ inscription: PublicInscription | null }>("me");
        if (current.inscription?.seatId === seatId) {
          setLocked(true);
          onAccepted(current.inscription);
          sessionStorage.removeItem(DRAFT_KEY);
          await runPostSuccessRitual(
            renderFrame,
            matchMedia("(prefers-reduced-motion: reduce)").matches,
          );
          onComplete(current.inscription);
        }
      } catch {
        setNotice(
          (current) =>
            `${current} We couldn’t confirm the saved result. Check My Vanguard before retrying.`,
        );
      }
    } finally {
      setBusy(false);
      submission.current = false;
      onPending(false);
      onFrame("reveal");
    }
  }

  function startHold() {
    if (submission.current || locked || busy) return;
    if (holdStartRef.current !== null) return;
    if (!draft.holdToken || !(mediaStatus === "none" || mediaStatus === "approved")) return;

    hasTriggeredSubmit.current = false;
    const startTime = Date.now();
    holdStartRef.current = startTime;
    setHolding(true);
    setHoldProgress(0);
    onFrame("camera_focus");

    const updateLoop = () => {
      if (holdStartRef.current === null) return;
      const elapsed = Date.now() - holdStartRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(pct);

      if (elapsed >= 1000 && elapsed < 2500) {
        onFrame("gather");
      } else if (elapsed >= 2500 && elapsed < HOLD_DURATION_MS) {
        onFrame("faction_energy");
      }

      if (elapsed < HOLD_DURATION_MS) {
        holdFrameIdRef.current = requestAnimationFrame(updateLoop);
      }
    };
    holdFrameIdRef.current = requestAnimationFrame(updateLoop);

    holdTimeoutRef.current = setTimeout(() => {
      if (hasTriggeredSubmit.current) return;
      hasTriggeredSubmit.current = true;
      holdStartRef.current = null;
      if (holdFrameIdRef.current !== null) cancelAnimationFrame(holdFrameIdRef.current);
      setHoldProgress(100);
      setHolding(false);
      void inscribe();
    }, HOLD_DURATION_MS);
  }

  function cancelHold() {
    if (hasTriggeredSubmit.current) return;
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdFrameIdRef.current !== null) {
      cancelAnimationFrame(holdFrameIdRef.current);
      holdFrameIdRef.current = null;
    }
    if (holdStartRef.current !== null) {
      holdStartRef.current = null;
      setHolding(false);
      setHoldProgress(0);
      onFrame("reveal");
    }
  }

  const field = (key: "displayName" | "guildName" | "battleCry", label: string, max: number) => (
    <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-amber-200/90">
      <span className="font-semibold text-amber-300">{label}</span>
      <input
        value={draft[key]}
        maxLength={max * 2}
        required={key === "displayName"}
        minLength={key === "displayName" ? 2 : 0}
        onChange={(event) =>
          setDraft({ ...draft, [key]: [...event.target.value].slice(0, max).join("") })
        }
        className="rounded border border-[#7a6336] bg-[#1a1c24] px-3 py-2 text-sm text-[#f7e7c4] outline-none transition focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
      />
    </label>
  );

  if (!authenticated) {
    return (
      <section
        aria-label="Claim authentication"
        data-clarity-mask="true"
        className="w-full py-4 text-center"
      >
        <h2 className="text-xl font-bold uppercase tracking-wider text-amber-200">
          Claim this place
        </h2>
        <p className="mt-2 text-sm text-[#cfbe9f]">
          Sign in with Google to claim this place in the Monument.
        </p>
        <a
          href={`/sign-in?returnTo=${encodeURIComponent(`/wow-forever/vanguard?seat=${seatId}`)}`}
          onClick={(event) => {
            try {
              sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            } catch {
              event.preventDefault();
              setNotice(
                "Your browser could not save this Seat before signing in. Enable session storage and try again.",
              );
              return;
            }
            trackVanguard("auth_start");
          }}
          className="mt-4 inline-flex w-full items-center justify-center rounded border border-[#d4af37] bg-gradient-to-b from-[#3d331c] to-[#1e190e] px-4 py-2.5 text-center text-sm font-semibold tracking-wider text-[#fff4d8] shadow-md transition hover:border-[#ffd875] hover:from-[#524424] hover:to-[#2b2414]"
        >
          Continue with Google
        </a>
        {notice && (
          <p role="alert" className="mt-3 text-xs text-amber-200">
            {notice}
          </p>
        )}
      </section>
    );
  }

  return (
    <section aria-label="Claim your place" data-clarity-mask="true" className="w-full">
      <div className="mb-4 border-b border-[#7a6336]/40 pb-3">
        <h2 className="text-xl font-bold uppercase tracking-wider text-amber-200">
          Claim {seatId}
        </h2>
        <p className="mt-1 text-xs text-[#cfbe9f]">
          Completed inscriptions are permanent and cannot be edited.
        </p>
      </div>

      <fieldset disabled={busy || locked} className="space-y-4">
        {field("displayName", "Vanguard Name", 32)}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-amber-200/90">
            <span className="font-semibold text-amber-300">Faction</span>
            <select
              aria-label="Faction"
              required
              value={draft.faction}
              onChange={(event) =>
                setDraft({ ...draft, faction: event.target.value as ClaimDraft["faction"] })
              }
              className="rounded border border-[#7a6336] bg-[#1a1c24] px-3 py-2 text-sm text-[#f7e7c4] outline-none transition focus:border-[#d4af37]"
            >
              <option value="">Choose Faction</option>
              <option value="alliance">Alliance</option>
              <option value="horde">Horde</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-amber-200/90">
            <span className="font-semibold text-amber-300">Class</span>
            <select
              aria-label="Class"
              required
              value={draft.className}
              onChange={(event) => setDraft({ ...draft, className: event.target.value })}
              className="rounded border border-[#7a6336] bg-[#1a1c24] px-3 py-2 text-sm text-[#f7e7c4] outline-none transition focus:border-[#d4af37]"
            >
              <option value="">Choose Class</option>
              {classes.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>

        {field("guildName", "Guild (optional)", 48)}
        {field("battleCry", "Battle Cry (optional)", 120)}

        {!authenticated ? (
          <div className="pt-2">
            <a
              href={`/sign-in?returnTo=${encodeURIComponent(`/wow-forever/vanguard?seat=${seatId}`)}`}
              onClick={(event) => {
                try {
                  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                } catch {
                  event.preventDefault();
                  setNotice(
                    "Your browser could not save this draft. Enable session storage before signing in; keep this page open.",
                  );
                  return;
                }
                trackVanguard("auth_start");
              }}
              className="inline-flex w-full items-center justify-center rounded border border-[#d4af37] bg-gradient-to-b from-[#3d331c] to-[#1e190e] px-4 py-2.5 text-center text-sm font-semibold tracking-wider text-[#fff4d8] shadow-md transition hover:border-[#ffd875] hover:from-[#524424] hover:to-[#2b2414]"
            >
              Continue with Google
            </a>
          </div>
        ) : (
          <section
            aria-label="Memory Image"
            className="rounded border border-[#7a6336]/50 bg-[#161821]/80 p-3.5 space-y-2.5"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Memory Image (optional)
              </span>
              <p className="text-[11px] leading-relaxed text-[#a89b84]">
                JPG, PNG or WebP · Max 20 MB · Minimum 512×512 · 1024×1024 or larger recommended ·
                Square crop required
              </p>
              <p className="text-[10px] text-[#786e5e]">
                By uploading an image, you confirm that you have the right to use it and understand
                that it will be automatically screened before public display.
              </p>
            </div>

            <input
              aria-label="Choose Memory Image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void choose(event.target.files?.[0])}
              className="w-full text-xs text-[#cfbe9f] file:mr-3 file:rounded file:border file:border-[#7a6336] file:bg-[#2a2416] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#f7e7c4] hover:file:bg-[#3d3420]"
            />

            {bitmap && (
              <div className="space-y-2 rounded border border-[#7a6336]/30 bg-[#0d0e14] p-2.5">
                <div className="flex items-center gap-3">
                  <canvas
                    ref={canvas}
                    aria-label="Square crop preview"
                    className={"vanguard-cropPreview"}
                    tabIndex={0}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId);
                      cropDrag.current = {
                        x: event.clientX,
                        y: event.clientY,
                        left: crop.x,
                        top: crop.y,
                      };
                    }}
                    onPointerMove={(event) => {
                      const drag = cropDrag.current;
                      if (!drag) return;
                      const scale = crop.size / event.currentTarget.getBoundingClientRect().width;
                      setCrop({
                        ...crop,
                        x: Math.max(
                          0,
                          Math.min(
                            bitmap.width - crop.size,
                            drag.left - (event.clientX - drag.x) * scale,
                          ),
                        ),
                        y: Math.max(
                          0,
                          Math.min(
                            bitmap.height - crop.size,
                            drag.top - (event.clientY - drag.y) * scale,
                          ),
                        ),
                      });
                    }}
                    onPointerUp={() => {
                      cropDrag.current = null;
                    }}
                    onPointerCancel={() => {
                      cropDrag.current = null;
                    }}
                    onKeyDown={(event) => {
                      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key))
                        return;
                      event.preventDefault();
                      const step = Math.max(1, Math.round(crop.size / 30));
                      setCrop({
                        ...crop,
                        x: Math.max(
                          0,
                          Math.min(
                            bitmap.width - crop.size,
                            crop.x +
                              (event.key === "ArrowRight"
                                ? step
                                : event.key === "ArrowLeft"
                                  ? -step
                                  : 0),
                          ),
                        ),
                        y: Math.max(
                          0,
                          Math.min(
                            bitmap.height - crop.size,
                            crop.y +
                              (event.key === "ArrowDown"
                                ? step
                                : event.key === "ArrowUp"
                                  ? -step
                                  : 0),
                          ),
                        ),
                      });
                    }}
                  />
                  <div className="flex-1 space-y-1.5 text-xs text-[#cfbe9f]">
                    <div className="flex items-center justify-between">
                      <label htmlFor="vanguard-crop-zoom">Zoom</label>
                      <input
                        id="vanguard-crop-zoom"
                        type="range"
                        min={512}
                        max={Math.min(bitmap.width, bitmap.height)}
                        value={crop.size}
                        onChange={(event) =>
                          setCrop({ x: 0, y: 0, size: Number(event.target.value) })
                        }
                        className="h-1.5 w-28 accent-[#d4af37]"
                      />
                    </div>
                    <p>Drag the image to frame your memory. Arrow keys move it.</p>
                    <details>
                      <summary>Fine positioning</summary>
                      <label className="flex items-center justify-between">
                        <span>Horizontal position</span>
                        <input
                          type="range"
                          min={0}
                          max={bitmap.width - crop.size}
                          value={crop.x}
                          onChange={(event) => setCrop({ ...crop, x: Number(event.target.value) })}
                          className="h-1.5 w-28 accent-[#d4af37]"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Vertical position</span>
                        <input
                          type="range"
                          min={0}
                          max={bitmap.height - crop.size}
                          value={crop.y}
                          onChange={(event) => setCrop({ ...crop, y: Number(event.target.value) })}
                          className="h-1.5 w-28 accent-[#d4af37]"
                        />
                      </label>
                    </details>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void upload()}
                  className="w-full rounded border border-[#947a46] bg-[#2a251b] py-1.5 text-xs font-semibold uppercase tracking-wider text-[#f7e7c4] transition hover:border-[#d4af37] hover:bg-[#3d3527]"
                >
                  Upload square crop
                </button>
              </div>
            )}

            {preview && (
              <div className="flex items-center justify-between text-xs text-amber-200">
                <span>Image {mediaStatus}</span>
                {mediaStatus === "pending" && mediaId && (
                  <button
                    type="button"
                    onClick={() => void retry()}
                    className="underline text-amber-400 hover:text-amber-200"
                  >
                    Retry verification
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMediaId(null);
                setMediaStatus("none");
                setBitmap(null);
              }}
              className="text-xs text-[#9d8e78] underline hover:text-[#d4af37]"
            >
              Use Class Default Emblem
            </button>
          </section>
        )}

        {authenticated && (
          <div className="pt-2">
            <div className="relative overflow-hidden rounded border-2 border-[#b38e3e] bg-gradient-to-b from-[#382c16] to-[#1d170a] shadow-lg">
              <div
                role="progressbar"
                aria-label="Inscription progress"
                aria-valuenow={Math.round(holdProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600/40 to-yellow-400/70 transition-all duration-75"
                style={{ width: `${holdProgress}%` }}
              />
              <button
                type="button"
                aria-label="HOLD TO INSCRIBE"
                disabled={
                  !draft.holdToken || !(mediaStatus === "none" || mediaStatus === "approved")
                }
                onPointerDown={(event) => {
                  if (event.button !== 0 || !event.isPrimary) return;
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  startHold();
                }}
                onPointerUp={cancelHold}
                onPointerCancel={cancelHold}
                onTouchCancel={cancelHold}
                onLostPointerCapture={cancelHold}
                onBlur={cancelHold}
                onPointerLeave={(event) => {
                  if (!event.currentTarget.hasPointerCapture(event.pointerId)) cancelHold();
                }}
                onKeyDown={(event) => {
                  if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                    event.preventDefault();
                    startHold();
                  }
                }}
                onKeyUp={(event) => {
                  if (event.key === " " || event.key === "Enter") cancelHold();
                }}
                className="relative z-10 flex w-full touch-none flex-col items-center justify-center py-3.5 px-4 text-center select-none disabled:opacity-50"
              >
                <span className="text-base font-bold uppercase tracking-widest text-[#fff1cf] drop-shadow-md">
                  HOLD TO INSCRIBE
                </span>
                <span className="mt-0.5 text-[10px] tracking-wider text-amber-200/80 uppercase">
                  {holding ? `Inscribing... ${Math.round(holdProgress)}%` : "Hold for 4 seconds"}
                </span>
              </button>
            </div>
          </div>
        )}
      </fieldset>

      {notice && (
        <p role="alert" className="mt-3 text-xs text-rose-300">
          {notice}
        </p>
      )}

      {locked && (
        <p role="status" className="mt-2 text-center text-xs text-amber-200">
          Your inscription is accepted. Revealing your place…
        </p>
      )}
    </section>
  );
}
