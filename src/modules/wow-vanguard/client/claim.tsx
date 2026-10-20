"use client";
import { VanguardRitual } from "./ritual";
import type { VanguardAssets } from "./contracts";
import { useEffect, useRef, useState } from "react";
import type { PublicInscription } from "../db/service";
import { trackVanguard } from "./tracking";
import {
  draftFromStorage,
  vanguardErrorMessage,
  runVanguardRitual,
  type ClaimDraft,
  type RitualFrame,
} from "./contracts";
import { VanguardClientError, vanguardRequest } from "./api";
import { validateVanguardText } from "../domain/text";
import { cropVanguardImage, decodeLocalImage } from "./crop";
export const DRAFT_KEY = "tierlistbase:vanguard:draft";
export function VanguardClaim({
  seatId,
  classes,
  authenticated,
  onComplete,
  onConflict,
  onFrame,
  onPending,
  assets,
}: {
  assets?: VanguardAssets;
  seatId: string;
  classes: readonly string[];
  authenticated: boolean;
  onComplete: (seat: PublicInscription) => void;
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
  const [acceptedSeat, setAcceptedSeat] = useState<PublicInscription | null>(null);
  const [ritualFrame, setRitualFrame] = useState<RitualFrame>("camera_focus");
  const renderFrame = (frame: RitualFrame) => {
    setRitualFrame(frame);
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
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submission = useRef(false);
  function report(error: unknown) {
    const code =
      error instanceof VanguardClientError
        ? error.code
        : error instanceof Error
          ? error.message
          : "SERVICE_UNAVAILABLE";
    setNotice(vanguardErrorMessage(code));
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
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
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
    }; // Hold is revalidated on OAuth return; text remains in sessionStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return;
      }
    }
    if (!classes.includes(draft.className)) {
      setNotice("Choose a valid Class.");
      return;
    }
    submission.current = true;
    onPending(true);
    setBusy(true);
    try {
      const token = draft.holdToken ?? (await hold());
      if (!token) return;
      const seat = await vanguardRequest<PublicInscription>("inscriptions", {
        ...draft,
        seatId,
        holdToken: token,
        ...(mediaStatus === "approved" && mediaId ? { mediaId } : {}),
      });
      setLocked(true);
      setAcceptedSeat(seat);
      sessionStorage.removeItem(DRAFT_KEY);
      await runVanguardRitual(renderFrame, matchMedia("(prefers-reduced-motion: reduce)").matches);
      onComplete(seat);
    } catch (error) {
      report(error); // A lost response never means success: recover only from an actual server-owned inscription.
      try {
        const current = await vanguardRequest<{ inscription: PublicInscription | null }>("me");
        if (current.inscription?.seatId === seatId) {
          setLocked(true);
          setAcceptedSeat(current.inscription);
          sessionStorage.removeItem(DRAFT_KEY);
          await runVanguardRitual(
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
    }
  }
  function startHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      void inscribe();
    }, 800);
  }
  function cancelHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  }
  const field = (key: "displayName" | "guildName" | "battleCry", label: string, max: number) => (
    <label>
      {label}
      <input
        value={draft[key]}
        maxLength={max * 2}
        required={key === "displayName"}
        minLength={key === "displayName" ? 2 : 0}
        onChange={(event) =>
          setDraft({ ...draft, [key]: [...event.target.value].slice(0, max).join("") })
        }
      />
    </label>
  );
  return (
    <section aria-label="Claim your place" data-clarity-mask="true">
      <h2>Claim {seatId}</h2>
      <p>Completed inscriptions are permanent and cannot be edited.</p>
      <fieldset disabled={busy || locked}>
        {field("displayName", "Vanguard Name", 32)}
        <label>
          Faction
          <select
            aria-label="Faction"
            required
            value={draft.faction}
            onChange={(event) =>
              setDraft({ ...draft, faction: event.target.value as ClaimDraft["faction"] })
            }
          >
            <option value="">Choose Faction</option>
            <option value="alliance">Alliance</option>
            <option value="horde">Horde</option>
          </select>
        </label>
        <label>
          Class
          <select
            aria-label="Class"
            required
            value={draft.className}
            onChange={(event) => setDraft({ ...draft, className: event.target.value })}
          >
            <option value="">Choose Class</option>
            {classes.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        {field("guildName", "Guild (optional)", 48)}
        {field("battleCry", "Battle Cry (optional)", 120)}
        {!authenticated ? (
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
          >
            Continue with Google
          </a>
        ) : (
          <section aria-label="Memory Image">
            <p>
              JPG, PNG or WebP · Max 20 MB · Minimum 512×512 · 1024×1024 or larger recommended ·
              Square crop required
            </p>
            <p>
              By uploading an image, you confirm that you have the right to use it and understand
              that it will be automatically screened before public display.
            </p>
            <input
              aria-label="Choose Memory Image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void choose(event.target.files?.[0])}
            />
            {bitmap && (
              <div>
                <canvas ref={canvas} aria-label="Square crop preview" />
                <label>
                  Crop size
                  <input
                    type="range"
                    min={512}
                    max={Math.min(bitmap.width, bitmap.height)}
                    value={crop.size}
                    onChange={(event) => setCrop({ x: 0, y: 0, size: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Crop left
                  <input
                    type="range"
                    min={0}
                    max={bitmap.width - crop.size}
                    value={crop.x}
                    onChange={(event) => setCrop({ ...crop, x: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Crop top
                  <input
                    type="range"
                    min={0}
                    max={bitmap.height - crop.size}
                    value={crop.y}
                    onChange={(event) => setCrop({ ...crop, y: Number(event.target.value) })}
                  />
                </label>
                <button type="button" onClick={() => void upload()}>
                  Upload square crop
                </button>
              </div>
            )}
            {preview && <p>Image {mediaStatus}</p>}
            {mediaStatus === "pending" && mediaId && (
              <button type="button" onClick={() => void retry()}>
                Retry verification
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMediaId(null);
                setMediaStatus("none");
                setBitmap(null);
              }}
            >
              Use Class Default Emblem
            </button>
          </section>
        )}
        <button type="button" onClick={() => void hold()}>
          Renew Seat Hold
        </button>
        {authenticated && (
          <button
            type="button"
            disabled={!draft.holdToken || !(mediaStatus === "none" || mediaStatus === "approved")}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              startHold();
            }}
            onPointerUp={cancelHold}
            onPointerCancel={cancelHold}
            onPointerLeave={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) cancelHold();
            }}
            onKeyDown={(event) => {
              if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                event.preventDefault();
                startHold();
              }
            }}
            onKeyUp={cancelHold}
          >
            HOLD TO INSCRIBE
          </button>
        )}
      </fieldset>
      {notice && <p role="alert">{notice}</p>}
      {locked && acceptedSeat && assets && (
        <VanguardRitual seat={acceptedSeat} frame={ritualFrame} assets={assets} />
      )}
      {locked && <p role="status">Your inscription is accepted. Revealing your place…</p>}
    </section>
  );
}
