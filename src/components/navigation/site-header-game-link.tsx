"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

function closeAncestorDetails(event: MouseEvent<HTMLAnchorElement>) {
  let details = event.currentTarget.closest("details");

  while (details) {
    details.open = false;
    details = details.parentElement?.closest("details") ?? null;
  }
}

export function SiteHeaderLinkStatus() {
  const { pending } = useLinkStatus();
  return <span hidden aria-hidden="true" data-navigation-pending={pending} />;
}

export function SiteHeaderGameLink({
  href,
  className,
  children,
}: Readonly<{
  href: string;
  className: string;
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={
        className +
        " has-[[data-navigation-pending=true]]:cursor-progress has-[[data-navigation-pending=true]]:opacity-60 has-[[data-navigation-pending=true]]:transition-none" +
        (active ? " border-b-2 border-amber-400 text-amber-300" : "")
      }
      prefetch={false}
      aria-current={active ? "page" : undefined}
      onClick={closeAncestorDetails}
    >
      {children}
      <SiteHeaderLinkStatus />
    </Link>
  );
}
