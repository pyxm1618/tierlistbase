"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeaderGameLink({
  href,
  className,
  children,
}: Readonly<{
  href: string;
  className: string;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={
        className + (active ? " border-b-2 border-amber-400 text-amber-300" : "")
      }
      prefetch={true}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
