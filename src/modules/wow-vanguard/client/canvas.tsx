"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { VanguardAssets, VanguardManifest } from "./contracts";
import { buildSeatId, parseSeatId, WOW_LETTERS, FOREVER_LETTERS } from "../domain/event";
import { vanguardRequest } from "./api";
import type { PublicInscription } from "../db/service";
export type VanguardFocusResult = "focused" | "cancelled" | "unavailable";
export function occupiedSeats(manifest: VanguardManifest, phase = manifest.phase) {
  const bytes = Uint8Array.from(atob(manifest.occupancy), (character) => character.charCodeAt(0));
  // Completed WOW is permanently full; archive occupancy can be reconstructed
  // from the server counter without a second full manifest or client phase authority.
  if (phase !== manifest.phase && phase === "wow" && manifest.counts.wow === 8016) {
    return new Set(
      ["W1", "O", "W2"].flatMap((letter) =>
        Array.from({ length: 2672 }, (_, index) => buildSeatId("wow", letter, index + 1)),
      ),
    );
  }
  if (phase !== manifest.phase) return new Set<string>();
  const letters =
    manifest.phase === "wow" ? ["W1", "O", "W2"] : ["F", "O", "R1", "E1", "V", "E2", "R2"];
  const perLetter = manifest.phase === "wow" ? 2672 : 8016;
  const result = new Set<string>();
  for (let index = 0; index < perLetter * letters.length; index++)
    if ((bytes[index >> 3] ?? 0) & (1 << (index & 7)))
      result.add(
        buildSeatId(
          manifest.phase,
          letters[Math.floor(index / perLetter)]!,
          (index % perLetter) + 1,
        ),
      );
  return result;
}
export function VanguardCanvas({
  manifest,
  assets,
  overview = false,
  focusSeat,
  focusIsOccupied = false,
  focusVersion = 0,
  onFocusComplete,
  onSeat,
  onController,
  onNearby,
}: {
  manifest: VanguardManifest;
  overview?: boolean;
  assets: VanguardAssets;
  focusSeat: string | null;
  focusIsOccupied?: boolean;
  focusVersion?: number;
  onFocusComplete: (version: number, result: VanguardFocusResult) => void;
  onSeat: (seatId: string) => void;
  onNearby: (ids: string[]) => void;
  onController: (
    controller: {
      pick: (x: number, y: number) => void;
      gather: () => void;
      focus: (seatId: string) => Promise<boolean>;
    } | null,
  ) => void;
}) {
  const phase = focusSeat ? parseSeatId(focusSeat).phase : manifest.phase;
  const [keyboardIndex, setKeyboardIndex] = useState(0);
  const [keyboardActive, setKeyboardActive] = useState(false);
  const keyboardHelpId = useId();
  const letters = phase === "wow" ? WOW_LETTERS : FOREVER_LETTERS;
  const perLetter = phase === "wow" ? 2672 : 8016;
  const seatIndex = keyboardIndex % (letters.length * perLetter);
  const keyboardSeat = buildSeatId(
    phase,
    letters[Math.floor(seatIndex / perLetter)]!,
    (seatIndex % perLetter) + 1,
  );
  const focused = useRef(focusSeat);
  useEffect(() => {
    focused.current = focusSeat;
  }, [focusSeat]);
  const occupancy = () => {
    const occupied = occupiedSeats(manifest, phase);
    if (focusIsOccupied && focusSeat && parseSeatId(focusSeat).phase === phase)
      occupied.add(focusSeat);
    return occupied;
  };
  const canvas = useRef<HTMLCanvasElement>(null);
  const selection = useRef(onSeat);
  const focusCallback = useRef(onFocusComplete);
  const controllerCallback = useRef(onController);
  const nearbyCallback = useRef(onNearby);
  const loadedGroups = useRef<import("../domain/layout").SeatLayoutGroup[]>([]);
  const controller = useRef<ReturnType<
    typeof import("../experience/scene").createVanguardScene
  > | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rendererFailed = useRef(false);
  useEffect(() => {
    nearbyCallback.current = onNearby;
    focusCallback.current = onFocusComplete;
    selection.current = onSeat;
    controllerCallback.current = onController;
  }, [onSeat, onController, onNearby, onFocusComplete]);
  useEffect(() => {
    rendererFailed.current = false;
    let cancelled = false;
    let active: typeof controller.current = null;
    async function load() {
      await Promise.resolve();
      if (cancelled) return;
      setError(null);
      if (!canvas.current || !assets.plate) return;
      const letters = phase === "wow" ? ["W1", "O", "W2"] : ["F", "O", "R1", "E1", "V", "E2", "R2"];
      if (letters.some((letter) => !assets.layouts[`${phase}:${letter}`])) return;
      try {
        const [{ createVanguardScene, loadVanguardGroup, nearbyVanguardSeats }, { TextureLoader }] =
          await Promise.all([import("../experience/scene"), import("three")]);
        const groups = await Promise.all(
          letters.map((letter) =>
            loadVanguardGroup(phase, letter, assets.layouts[`${phase}:${letter}`]!),
          ),
        );
        groups.forEach((group) => {
          group.scale = assets.layoutScales?.[`${phase}:${group.letter}`] ?? 1;
        });
        const plate = await new TextureLoader().loadAsync(assets.plate);
        const background = assets.hero[phase]
          ? await new TextureLoader().loadAsync(assets.hero[phase]!.src)
          : undefined;
        if (cancelled) {
          plate.dispose();
          background?.dispose();
          return;
        }
        active = createVanguardScene(canvas.current, groups, plate, {
          ...(background
            ? {
                background,
                backgroundSize: {
                  width: assets.hero[phase]!.width / 10,
                  height: assets.hero[phase]!.height / 10,
                },
              }
            : {}),
          occupied: occupancy(),
          reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
          onSeat: (id) => selection.current(id),
          thumbnail: async (id) => {
            const seat = await vanguardRequest<PublicInscription>(`inscriptions/${id}`);
            if (seat.status !== "active") return null;
            active?.setFaction(id, seat.faction);
            return (
              (phase === "wow" ? seat.image?.wow : seat.image?.forever) ??
              assets.emblems[seat.className] ??
              null
            );
          },
          onError: () =>
            setError(
              "Some Monument images could not load. Focus and text browsing remain available.",
            ),
        });
        loadedGroups.current = groups;
        if (
          focused.current &&
          phase === manifest.phase &&
          (manifest.stage === "WOW_OPEN" || manifest.stage === "FOREVER_OPEN")
        ) {
          nearbyCallback.current(
            nearbyVanguardSeats(groups, focused.current, occupiedSeats(manifest)),
          );
        }
        controller.current = active;
        controllerCallback.current(active);
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      } catch {
        if (!cancelled) {
          rendererFailed.current = true;
          setError(
            "The Monument renderer could not load. Search and text browsing remain available.",
          );
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
      active?.dispose();
      setReady(false);
      loadedGroups.current = [];
      nearbyCallback.current([]);
      controller.current = null;
      controllerCallback.current(null);
    };
    // A phase changes the layout. Occupancy updates use the controller below and keep camera position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, assets]);
  useEffect(() => {
    const occupied = occupiedSeats(manifest, phase);
    if (focusIsOccupied && focusSeat && parseSeatId(focusSeat).phase === phase)
      occupied.add(focusSeat);
    controller.current?.updateOccupancy(occupied);
  }, [manifest, phase, focusSeat, focusIsOccupied]);
  useEffect(() => {
    if (overview) controller.current?.gather();
  }, [overview]);
  useEffect(() => {
    let cancelled = false;
    if (
      focusSeat &&
      loadedGroups.current.length &&
      phase === manifest.phase &&
      (manifest.stage === "WOW_OPEN" || manifest.stage === "FOREVER_OPEN")
    ) {
      const groups = loadedGroups.current;
      import("../experience/scene").then(({ nearbyVanguardSeats }) => {
        if (!cancelled)
          nearbyCallback.current(nearbyVanguardSeats(groups, focusSeat, occupiedSeats(manifest)));
      });
    } else nearbyCallback.current([]);
    return () => {
      cancelled = true;
    };
  }, [focusSeat, manifest, phase]);
  const blocked =
    !assets.plate ||
    !assets.hero[phase] ||
    !(phase === "wow" ? ["W1", "O", "W2"] : ["F", "O", "R1", "E1", "V", "E2", "R2"]).every(
      (letter) => assets.layouts[`${phase}:${letter}`],
    );
  const unavailable = !ready && (blocked || error !== null);
  useEffect(() => {
    if (!focusSeat || overview) return;
    // Text browsing remains usable when the renderer or its assets are unavailable.
    if (blocked || rendererFailed.current) {
      focusCallback.current(focusVersion, "unavailable");
      return;
    }
    if (!ready || !controller.current) return;
    let cancelled = false;
    void controller.current.focus(focusSeat).then((completed) => {
      if (!cancelled) focusCallback.current(focusVersion, completed ? "focused" : "cancelled");
    });
    return () => {
      cancelled = true;
    };
  }, [focusSeat, focusVersion, ready, overview, unavailable, blocked]);
  return (
    <section
      aria-label="Monument canvas"
      className="vanguard-canvasShell absolute inset-0 h-full w-full"
      style={
        !ready && assets.hero[phase]
          ? {
              backgroundImage: `url(${assets.hero[phase]!.src})`,
            }
          : undefined
      }
    >
      {blocked ? (
        <div className="flex h-full w-full items-center justify-center p-6 text-center text-amber-200">
          <p>MISSING_ASSET: final {phase.toUpperCase()} Monument / Mask-derived Seat Layout.</p>
        </div>
      ) : (
        <canvas
          key={phase}
          ref={canvas}
          aria-label="Interactive Monument. Drag to pan, scroll or pinch to zoom."
          aria-describedby={keyboardHelpId}
          tabIndex={ready ? 0 : -1}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-400"
          onFocus={() => setKeyboardActive(true)}
          onBlur={() => setKeyboardActive(false)}
          onKeyDown={(event) => {
            if (!ready) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selection.current(keyboardSeat);
              return;
            }
            if (
              !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(
                event.key,
              )
            )
              return;
            event.preventDefault();
            const total = letters.length * perLetter;
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? total - 1
                  : (seatIndex +
                      (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) +
                      total) %
                    total;
            setKeyboardIndex(next);
            void controller.current?.focus(
              buildSeatId(phase, letters[Math.floor(next / perLetter)]!, (next % perLetter) + 1),
            );
          }}
          style={{
            width: "100%",
            height: "100%",
            touchAction: "none",
            display: "block",
            opacity: ready ? 1 : 0,
            transition: "opacity .3s ease",
          }}
        />
      )}
      <p
        id={keyboardHelpId}
        className={
          keyboardActive
            ? "pointer-events-none absolute bottom-4 left-4 right-4 z-20 rounded bg-[#0d0f17]/95 p-2 text-xs text-amber-200"
            : "sr-only"
        }
      >
        Arrow keys select previous or next Seat. Home / End select the first / last Seat. Enter or
        Space opens the selected Seat.
        <span role="status"> Selected Seat {keyboardSeat}</span>
      </p>
      {error && (
        <p role="status" className="absolute bottom-4 left-4 z-20 text-xs text-amber-300">
          {error}
        </p>
      )}
    </section>
  );
}
