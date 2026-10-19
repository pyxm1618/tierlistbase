"use client";
import { trackVanguard } from "./tracking";
import { useEffect, useState } from "react";
import type { VanguardAssets, VanguardManifest } from "./contracts";
export function VanguardEntry(props: {
  manifest: VanguardManifest;
  classes: readonly string[];
  assets: VanguardAssets;
  initialSeat: string | null;
  authenticated: boolean;
}) {
  const [Experience, setExperience] = useState<React.ComponentType<
    typeof props & { entered?: boolean }
  > | null>(null);
  const [failed, setFailed] = useState(false);
  const [music, setMusic] = useState(false);
  const [entered, setEntered] = useState(false);
  async function load(enter: boolean) {
    if (enter) {
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
    <Experience {...props} entered={entered} />
  ) : (
    <section>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            const enabled = !music;
            setMusic(enabled);
            localStorage.setItem("tierlistbase:vanguard:music", enabled ? "1" : "0");
          }}
        >
          {music ? "Music On" : "Music Off"}
        </button>
      </div>
      <button type="button" onClick={() => void load(true)}>
        ENTER THE MONUMENT
      </button>
      {failed && <p role="alert">The Monument could not load. Try again.</p>}
    </section>
  );
}
