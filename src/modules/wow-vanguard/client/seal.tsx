"use client";
import { useState } from "react";
import type { PublicInscription } from "../db/service";
import { sealInput, type SealRenderer } from "./contracts";
export function VanguardSealControl({
  seat,
  renderer,
  onSave,
}: {
  seat: PublicInscription;
  renderer?: SealRenderer;
  onSave?: () => void;
}) {
  const [error, setError] = useState("");
  async function save(format: "9:16" | "1:1") {
    if (!renderer || seat.status !== "active") return;
    try {
      const blob = await renderer.render(sealInput(seat, location.origin), format);
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
      {!renderer && <p>DEV PLACEHOLDER · BLOCKED_ASSET: final 9:16 and 1:1 Seal.</p>}
      <button disabled={!renderer || seat.status !== "active"} onClick={() => void save("9:16")}>
        Save 9:16
      </button>
      <button disabled={!renderer || seat.status !== "active"} onClick={() => void save("1:1")}>
        Save 1:1
      </button>
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
    <div>
      <button type="button" onClick={() => void share()}>
        Share · STAND BESIDE ME
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
