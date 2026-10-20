"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PublicInscription } from "../db/service";
import Link from "next/link";
import { VanguardFocusVisual } from "./focus-visual";
import { VanguardMemoryPlate } from "./plate";
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
}: {
  entered?: boolean;
  audioController: import("../experience/audio").VanguardAudioController;
  initialMusic: boolean;
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicInscription[]>([]);
  const [notice, setNotice] = useState("");
  const [frame, setFrame] = useState<RitualFrame | null>(null);
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
    try {
      parseSeatId(id);
      if (resume && claimOpen && !mine && parseSeatId(id).phase === manifest.phase) {
        setSelected(id);
        setFocus(null);
        setRevealed(false);
        return;
      }
      const seat = await vanguardRequest<PublicInscription>(
        `inscriptions/${encodeURIComponent(id)}`,
      );
      setFocus(seat);
      setSelected(null);
      setRevealed(false);
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
      // This counter invalidates an in-flight camera startup; it does not reference a DOM node.
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      className="space-y-6"
      onKeyDown={(event) => {
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
      <div className="flex justify-end">
        <button onClick={() => void toggleMusic()}>{music ? "Music On" : "Music Off"}</button>
      </div>
      <div className="flex flex-wrap gap-4">
        <button
          disabled={!monumentEntered || ritualLocked || cameraPending}
          onClick={() => void enableCamera()}
        >
          {camera ? "Disable Gesture Control" : "Enable Gesture Control"}
        </button>
        <Link href="/account/vanguard">My Vanguard</Link>
      </div>
      <video ref={video} muted playsInline hidden />
      {!assets.bgm && <p>Background music is unavailable.</p>}
      <p role="status">
        {manifest.stage === "SEALED"
          ? "THE MONUMENT IS SEALED"
          : manifest.stage === "COMPLETE"
            ? "THE MONUMENT IS COMPLETE"
            : manifest.stage === "WOW_COMPLETE_WAITING"
              ? "WOW IS COMPLETE"
              : `${manifest.counts.total.toLocaleString("en-US")} places inscribed`}
      </p>
      {manifest.stage === "SEALED" && (
        <p>The inscription period has ended. Every completed Vanguard remains here to explore.</p>
      )}
      {manifest.stage === "WOW_COMPLETE_WAITING" && (
        <p>
          FOREVER AWAKENS IN …{" "}
          <time dateTime={manifest.foreverUnlockAt!}>{countdown ?? manifest.foreverUnlockAt}</time>
        </p>
      )}
      {!monumentEntered && (
        <button
          onClick={() => {
            void audio.current?.unlock();
            setMonumentEntered(true);
            trackVanguard("vanguard_enter");
          }}
        >
          ENTER THE MONUMENT
        </button>
      )}
      {monumentEntered && (
        <VanguardCanvas
          manifest={manifest}
          assets={assets}
          onNearby={setNearby}
          focusSeat={focus?.seatId ?? null}
          onSeat={(id) => {
            if (!ritualLocked) void choose(id);
          }}
          onController={(controller) => {
            scene.current = controller;
          }}
        />
      )}
      {claimOpen && !mine && nearby.length > 0 && (
        <section aria-label="Nearby available places">
          <p>Stand beside this Vanguard. Availability is rechecked when you select a place.</p>
          {nearby.map((id) => (
            <button disabled={ritualLocked} key={id} onClick={() => void choose(id)}>
              {id}
            </button>
          ))}
        </section>
      )}
      {scatter && (
        <p>
          AMBIGUOUS_ASSET: final Scatter movement is not defined by the supplied keyframes. Mouse
          and touch browsing remain available.
        </p>
      )}
      <form onSubmit={search}>
        <label>
          Search Seat ID, Vanguard Name or Guild
          <input
            value={query}
            maxLength={48}
            minLength={2}
            required
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button disabled={ritualLocked}>Search</button>
      </form>
      <ul>
        {results.map((seat) => (
          <li key={seat.seatId}>
            <button disabled={ritualLocked} onClick={() => void choose(seat.seatId)}>
              {seat.seatId}
              {seat.status === "active" ? ` · ${seat.displayName}` : " · Unavailable"}
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!ritualLocked) void choose(query);
        }}
      >
        <label>
          Seat ID
          <input
            value={query}
            maxLength={24}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="WOW-W1-0001"
          />
        </label>
        <button disabled={ritualLocked}>Focus Seat</button>
      </form>
      {notice && <p role="alert">{notice}</p>}
      {mine && <button onClick={() => void choose(mine.seatId)}>VIEW MY SEAT</button>}
      {suggested && claimOpen && (
        <button onClick={() => void choose(suggested)}>Choose nearby seat {suggested}</button>
      )}
      {focus && (
        <section aria-label={revealed ? "Vanguard Reveal" : "Vanguard Focus"}>
          <h2>{revealed ? "Your place in the Monument" : focus.seatId}</h2>
          {active ? (
            <>
              <VanguardFocusVisual seat={active} assets={assets} />
              <p>
                {active.displayName} · {active.seatId}
              </p>
              <VanguardMemoryPlate
                key={active.seatId}
                seat={active}
                {...(assets.plates?.[active.faction === "alliance" ? "alliance" : "horde"]
                  ? { frame: assets.plates[active.faction === "alliance" ? "alliance" : "horde"] }
                  : {})}
                {...(assets.emblems[active.className]
                  ? { emblem: assets.emblems[active.className] }
                  : {})}
              />
              <dl>
                <dt>Faction</dt>
                <dd>{active.faction}</dd>
                <dt>Class</dt>
                <dd>{active.className}</dd>
                {active.guildName && (
                  <>
                    <dt>Guild</dt>
                    <dd>{active.guildName}</dd>
                  </>
                )}
                {active.battleCry && (
                  <>
                    <dt>Battle Cry</dt>
                    <dd>{active.battleCry}</dd>
                  </>
                )}
              </dl>
              {revealed && (
                <VanguardSealControl
                  seat={active}
                  assets={assets}
                  onSave={() => trackVanguard("seal_save")}
                />
              )}
              <button onClick={() => void share(active)}>STAND BESIDE ME</button>
              <p>
                <a
                  href={tierLink(active.className)}
                  onClick={() => trackVanguard("tier_list_click")}
                >
                  {revealed
                    ? `See how ${active.className} is performing in WoW Forever`
                    : `View ${active.className} Tier List`}
                </a>
              </p>
              <details>
                <summary>Report</summary>
                <label>
                  Reason
                  <select
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                  >
                    <option value="sexual_graphic">Sexual / Graphic Content</option>
                    <option value="hate_impersonation">Hate / Harassment / Impersonation</option>
                    <option value="privacy">Privacy</option>
                    <option value="spam_promotion">Spam / Promotion</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <button disabled={reporting} onClick={() => void report()}>
                  Submit Report
                </button>
              </details>
            </>
          ) : (
            <p>Unavailable Plate</p>
          )}
        </section>
      )}
      {selected && claimOpen && !mine && (
        <VanguardClaim
          key={selected}
          seatId={selected}
          classes={classes}
          assets={assets}
          authenticated={authenticated}
          onConflict={setSuggested}
          onPending={setSubmissionPending}
          onFrame={(next) => {
            setFrame(next);
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
            trackVanguard("claim_complete");
          }}
        />
      )}

      <p>
        <Link href="/wow-forever/tier-list" onClick={() => trackVanguard("tier_list_click")}>
          WoW Forever Tier List
        </Link>
      </p>
      <button
        disabled={ritualLocked}
        onClick={() => {
          setFocus(null);
          setSelected(null);
          setRevealed(false);
          scene.current?.gather();
        }}
      >
        Continue exploring
      </button>
    </section>
  );
}
