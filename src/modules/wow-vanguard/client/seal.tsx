"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { buttonSecondary } from "@/components/ui/styles";
import type { PublicInscription } from "../db/service";
import { sealInput, type VanguardAssets, type SealRenderer } from "./contracts";
export function VanguardSealControl({
  seat,
  renderer,
  assets,
  onSave,
  showPreview = false,
}: {
  seat: PublicInscription;
  renderer?: SealRenderer;
  assets?: VanguardAssets;
  onSave?: () => void;
  showPreview?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const ready = Boolean(
    renderer ||
    (assets?.seal.portrait &&
      assets.seal.square &&
      assets.hero[seat.seatId.startsWith("WOW-") ? "wow" : "forever"]),
  );
  useEffect(() => {
    if (!showPreview || !ready || seat.status !== "active") return;
    const input = sealInput(seat, location.origin);
    let cancelled = false;
    let url: string | null = null;
    async function renderPreview() {
      try {
        const activeRenderer =
          renderer ??
          (await import("../experience/seal-renderer")).createVanguardSealRenderer(assets!);
        const blob = await activeRenderer.render(input, "9:16");
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPreview(url);
      } catch {
        if (!cancelled) setError("The Vanguard Seal could not be rendered. Try again.");
      }
    }
    void renderPreview();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [assets, ready, renderer, seat, showPreview]);
  async function save(format: "9:16" | "1:1") {
    if (!ready || seat.status !== "active") return;
    try {
      const activeRenderer =
        renderer ??
        (await import("../experience/seal-renderer")).createVanguardSealRenderer(assets!);
      const blob = await activeRenderer.render(sealInput(seat, location.origin), format);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${seat.seatId}-${format.replace(":", "x")}.png`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      onSave?.();
    } catch {
      setError("The Vanguard Seal could not be rendered. Try again.");
    }
  }
  return (
    <section aria-label="Vanguard Seal">
      <h3>Vanguard Seal</h3>
      {preview && (
        <div className="flex w-full justify-center">
          <Image
            unoptimized
            src={preview}
            alt="Your Vanguard Seal"
            width={144}
            height={256}
            className="h-40 w-auto sm:h-56"
          />
        </div>
      )}
      {!ready && (
        <p>
          MISSING_ASSET: the final Monument location artwork/layout for this phase is unavailable.
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={buttonSecondary}
          disabled={!ready || seat.status !== "active"}
          onClick={() => void save("9:16")}
        >
          Save 9:16
        </button>
        <button
          type="button"
          className={buttonSecondary}
          disabled={!ready || seat.status !== "active"}
          onClick={() => void save("1:1")}
        >
          Save 1:1
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
export function VanguardShareControl({ seatId }: { seatId: string }) {
  const [message, setMessage] = useState("");
  async function share() {
    const url = `${location.origin}/wow-forever/vanguard?seat=${encodeURIComponent(seatId)}`;
    try {
      if (navigator.share) await navigator.share({ title: "STAND BESIDE ME", url });
      else await navigator.clipboard.writeText(url);
      setMessage("Your Seat link is ready to share.");
    } catch {
      setMessage(`Share your Seat link: ${url}`);
    }
  }
  return (
    <div className="mt-4">
      <button type="button" className={buttonSecondary} onClick={() => void share()}>
        Share · STAND BESIDE ME
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
