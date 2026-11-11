"use client";

import { useEffect } from "react";

import { scheduleAdSenseBootstrap } from "@/components/analytics/adsense-scheduling";

// Kept as a client component on purpose: it attaches the AdSense bootstrap after
// the document has loaded instead of shipping it as an eager `<head>` script
// that competes with the LCP image. See `adsense-scheduling.ts` for the policy.
export function AdSenseBootstrap() {
  useEffect(() => scheduleAdSenseBootstrap(window), []);

  return null;
}
