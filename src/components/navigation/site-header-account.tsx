"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/platform/auth/auth-client";

export function SiteHeaderAccount({
  authenticated,
  mobile = false,
  className,
}: {
  authenticated: boolean;
  mobile?: boolean;
  className: string;
}) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!authenticated)
    return (
      <Link href="/sign-in" className={className} prefetch={false}>
        Sign in
      </Link>
    );
  const links = (
    <>
      <Link href="/account" className={className} prefetch={false}>
        My Account
      </Link>
      <Link href="/account/vanguard" className={className} prefetch={false}>
        My Vanguard
      </Link>
      <Link href="/account/security" className={className} prefetch={false}>
        Security
      </Link>
      <button
        type="button"
        className={className + " text-left"}
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setFailed(false);
          try {
            const result = await authClient.signOut();
            if (result.error) throw new Error("Sign out failed");
            // A new server render clears both personalized Header and protected-route router caches.
            window.location.reload();
          } catch {
            setPending(false);
            setFailed(true);
          }
        }}
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {failed && <p role="alert">Sign out could not be completed. Try again.</p>}
    </>
  );
  if (mobile)
    return (
      <>
        <span className={className}>Account</span>
        {links}
      </>
    );
  return (
    <details className="relative">
      <summary className={className + " cursor-pointer list-none"}>
        Account <span aria-hidden="true">▾</span>
      </summary>
      <div className="absolute right-0 top-full z-50 flex min-w-44 flex-col rounded-lg border border-[#265174] bg-[#061b30] p-2 shadow-xl">
        {links}
      </div>
    </details>
  );
}
