"use client";
import { useState } from "react";
import { authClient } from "@/platform/auth/auth-client";
import { assertAllowedRelativeCallback } from "@/platform/auth/callback-url";
import styles from "./sign-in.module.css";
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
    <div className={styles.action}>
      <button
        type="button"
        className={styles.googleButton}
        disabled={pending}
        aria-busy={pending}
        onClick={signIn}
      >
        <svg className={styles.googleIcon} aria-hidden="true" viewBox="0 0 48 48">
          <path
            fill="#4285F4"
            d="M43.61 24.46c0-1.36-.12-2.66-.35-3.92H24v7.42h11a9.4 9.4 0 0 1-4.08 6.18v5.14h6.61c3.87-3.56 6.08-8.8 6.08-14.82Z"
          />
          <path
            fill="#34A853"
            d="M24 44c5.51 0 10.13-1.83 13.53-4.95l-6.61-5.14c-1.83 1.23-4.17 1.97-6.92 1.97-5.32 0-9.84-3.59-11.46-8.42H5.72v5.3A20.44 20.44 0 0 0 24 44Z"
          />
          <path
            fill="#FBBC05"
            d="M12.54 27.46A12.3 12.3 0 0 1 11.9 24c0-1.2.22-2.37.64-3.46v-5.3H5.72A20 20 0 0 0 3.55 24c0 3.22.78 6.26 2.17 8.76l6.82-5.3Z"
          />
          <path
            fill="#EA4335"
            d="M24 12.12c3 0 5.68 1.03 7.8 3.05l5.85-5.85A19.6 19.6 0 0 0 24 4 20.44 20.44 0 0 0 5.72 15.24l6.82 5.3C14.16 15.71 18.68 12.12 24 12.12Z"
          />
        </svg>
        {pending ? "Connecting…" : "Continue with Google"}
      </button>
      {error && (
        <p role="alert" className={styles.error}>
          Google sign-in could not be completed. Your Vanguard draft is preserved. Try again.
        </p>
      )}
    </div>
  );
}
