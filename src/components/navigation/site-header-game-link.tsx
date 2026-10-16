"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
      prefetch={true}
      aria-current={active ? "page" : undefined}
    >
      {children}
      <SiteHeaderLinkStatus />
    </Link>
  );
}
