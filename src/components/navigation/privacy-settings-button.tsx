"use client";

import { openPrivacySettings } from "@/components/analytics/consent-adapter";

export function PrivacySettingsButton() {
  return (
    <button
      type="button"
      onClick={openPrivacySettings}
      className="cursor-pointer text-left text-slate-400 transition-colors hover:text-slate-200"
    >
      Privacy & cookie settings
    </button>
  );
}
