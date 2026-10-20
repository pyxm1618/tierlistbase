"use client";
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
}) {
  const [Experience, setExperience] = useState<React.ComponentType<
    typeof props & {
      entered?: boolean;
      audioController: ReturnType<typeof createVanguardAudio>;
      initialMusic: boolean;
    }
  > | null>(null);
  const [audioController] = useState(() => createVanguardAudio(props.assets));
  const [failed, setFailed] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [music, setMusic] = useState(false);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        const saved = localStorage.getItem("tierlistbase:vanguard:music") === "1";
        setMusic(saved);
        void audioController.setMusic(saved);
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
      void audioController.unlock().catch(() => setAudioError(true));
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
  }, [props.initialSeat]);
  return Experience ? (
    <>
      <Experience
        {...props}
        entered={entered}
        audioController={audioController}
        initialMusic={music}
      />
      {audioError && (
        <p role="alert">
          The background music could not load. Try Music On again. Browsing remains available.
        </p>
      )}
    </>
  ) : (
    <section>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setAudioError(false);
            const enabled = !music;
            setMusic(enabled);
            localStorage.setItem("tierlistbase:vanguard:music", enabled ? "1" : "0");
            void Promise.all([audioController.setMusic(enabled), audioController.unlock()]).catch(
              () => setAudioError(true),
            );
          }}
        >
          {music ? "Music On" : "Music Off"}
        </button>
      </div>
      <button type="button" onClick={() => void load(true)}>
        ENTER THE MONUMENT
      </button>
      {audioError && (
        <p role="alert">
          The background music could not load. Try Music On again. Browsing remains available.
        </p>
      )}
      {failed && <p role="alert">The Monument could not load. Try again.</p>}
    </section>
  );
}
