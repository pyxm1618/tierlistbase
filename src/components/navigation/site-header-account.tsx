"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { authClient } from "@/platform/auth/auth-client";

const VANGUARD_PATH = "/wow-forever/vanguard";
const SEAT_ID = /^(WOW|FOREVER)-[A-Z][12]?-[0-9]{4}$/;

export function SiteHeaderAccount({
  authenticated,
  name,
  email,
  mobile = false,
  className,
}: {
  authenticated: boolean;
  name: string | null;
  email: string | null;
  mobile?: boolean;
  className: string;
}) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [signInHref, setSignInHref] = useState("/sign-in");
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.pathname !== VANGUARD_PATH) return;
    const params = new URLSearchParams(window.location.search);
    const seat = params.get("seat");
    const returnTo = seat && SEAT_ID.test(seat) ? `${VANGUARD_PATH}?seat=${encodeURIComponent(seat)}` : VANGUARD_PATH;
    setSignInHref(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      requestAnimationFrame(() => trigger.current?.focus());
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !menu.current?.contains(target) && !trigger.current?.contains(target)) close();
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!authenticated)
    return (
      <Link href={signInHref} className={className} prefetch={false}>
        Sign in
      </Link>
    );

  const closeMenu = () => {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  };
  const identity = name?.trim() || "Account";
  const linkClass = className + " w-full text-left";

  async function signOut() {
    closeMenu();
    setPending(true);
    setFailed(false);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      window.location.reload();
    } catch {
      setPending(false);
      setFailed(true);
    }
  }

  const links = (
    <>
      <Link href="/account/vanguard" role="menuitem" className={linkClass} prefetch={false} onClick={closeMenu}>
        My Vanguard
      </Link>
      <Link href="/account" role="menuitem" className={linkClass} prefetch={false} onClick={closeMenu}>
        My Account
      </Link>
      <Link href="/account/security" role="menuitem" className={linkClass} prefetch={false} onClick={closeMenu}>
        Security
      </Link>
      <button
        type="button"
        role="menuitem"
        className={linkClass}
        disabled={pending}
        onClick={() => void signOut()}
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </>
  );

  if (mobile)
    return (
      <div className="flex flex-col gap-1 border-t border-[#265174] pt-2">
        <div className="px-2 py-1">
          <p className="truncate text-sm font-semibold text-white">{identity}</p>
          {email ? <p className="truncate text-xs text-slate-400">{email}</p> : null}
        </div>
        {links}
        {failed && <p role="alert" className="px-2 text-xs text-rose-300">Sign out could not be completed. Try again.</p>}
      </div>
    );

  function moveMenuFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
    if (!items.length) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? (current + 1 + items.length) % items.length
            : (current - 1 + items.length) % items.length;
    items[next]?.focus();
  }

  return (
    <div className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="site-account-menu"
        className={className + " inline-flex max-w-48 items-center gap-1"}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
          }
        }}
      >
        <span className="truncate">{identity}</span> <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div
          ref={menu}
          id="site-account-menu"
          role="menu"
          aria-label="Account menu"
          onKeyDown={moveMenuFocus}
          className="absolute right-0 top-full z-50 mt-1 flex min-w-60 flex-col rounded-lg border border-[#265174] bg-[#061b30] p-2 shadow-xl"
        >
          <div className="border-b border-[#265174] px-2 py-2">
            <p className="truncate text-sm font-semibold text-white">{identity}</p>
            {email ? <p className="truncate text-xs text-slate-400">{email}</p> : null}
          </div>
          {links}
          {failed && <p role="alert" className="px-2 py-1 text-xs text-rose-300">Sign out could not be completed. Try again.</p>}
        </div>
      ) : null}
    </div>
  );
}
