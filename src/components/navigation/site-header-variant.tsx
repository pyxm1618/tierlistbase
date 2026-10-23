"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const LimbusHeader = dynamic(
  () => import("./site-header-variant-limbus").then((mod) => mod.LimbusHeader),
  { ssr: true },
);

export function SiteHeaderVariant({
  children,
  brand,
  account,
}: {
  children: ReactNode;
  brand: ReactNode;
  account?: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname !== "/limbus-company/tier-list") return children;

  return <LimbusHeader brand={brand} account={account} />;
}
