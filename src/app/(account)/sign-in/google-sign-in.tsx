"use client";
import { useState } from "react";
import { authClient } from "@/platform/auth/auth-client";
import { assertAllowedRelativeCallback } from "@/platform/auth/callback-url";
import { buttonPrimary } from "@/components/ui/styles";
export function GoogleSignIn() {
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  async function signIn() {
    setPending(true);
    setError(false);
    let callbackURL = "/account";
    const requested = new URLSearchParams(window.location.search).get("returnTo");
    if (requested) {
      try {
        callbackURL = assertAllowedRelativeCallback(requested);
      } catch {
        setError(true);
        setPending(false);
        return;
      }
    }
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL });
      if (result.error) {
        setError(true);
        setPending(false);
      }
    } catch {
      setError(true);
      setPending(false);
    }
  }
  return (
    <div>
      <button className={buttonPrimary} disabled={pending} onClick={signIn}>
        {pending ? "Connecting…" : "Continue with Google"}
      </button>
      {error && (
        <p role="alert">
          Google sign-in could not be completed. Your Vanguard draft is preserved. Try again.
        </p>
      )}
    </div>
  );
}
