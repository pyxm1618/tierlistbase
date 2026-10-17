"use client";

export type ConsentState = {
  readonly essential: true;
  readonly analytics: boolean;
  readonly advertising: boolean;
};

export interface TCFData {
  eventStatus?: "tcloaded" | "cmpuishown" | "useractioncomplete";
  cmpStatus?: "stub" | "loading" | "loaded" | "error";
  purpose?: {
    consents?: Record<number | string, boolean>;
  };
  vendor?: {
    consents?: Record<number | string, boolean>;
  };
  gdprApplies?: boolean;
}

declare global {
  interface Window {
    __tcfapi?: (
      command: string,
      version: number,
      callback: (tcData: TCFData | null, success: boolean) => void,
      parameter?: unknown,
    ) => void;
    googlefc?: {
      callbackQueue?: Array<(() => void) | Record<string, () => void>>;
      showRevocationMessage?: () => void;
    };
  }
}

const DEFAULT_FAIL_CLOSED_STATE: ConsentState = {
  essential: true,
  analytics: false,
  advertising: false,
};

let currentConsent: ConsentState = DEFAULT_FAIL_CLOSED_STATE;
const listeners = new Set<() => void>();
let tcfListenerRegistered = false;

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function parseConsentFromTCData(tcData: TCFData | null): ConsentState {
  if (!tcData) return DEFAULT_FAIL_CLOSED_STATE;

  if (tcData.eventStatus === "cmpuishown") {
    return DEFAULT_FAIL_CLOSED_STATE;
  }

  const consents = tcData.purpose?.consents;
  if (!consents) return DEFAULT_FAIL_CLOSED_STATE;

  const analytics = Boolean(consents[1] && consents[8]);
  const advertising = Boolean(consents[1] && (consents[2] || consents[3] || consents[4]));

  return {
    essential: true,
    analytics,
    advertising,
  };
}

function registerTCFListener(): void {
  if (typeof window === "undefined" || tcfListenerRegistered) return;
  if (typeof window.__tcfapi !== "function") return;

  try {
    tcfListenerRegistered = true;
    window.__tcfapi("addEventListener", 2, (tcData, success) => {
      if (!success || !tcData) {
        currentConsent = DEFAULT_FAIL_CLOSED_STATE;
        notifyListeners();
        return;
      }

      currentConsent = parseConsentFromTCData(tcData);
      notifyListeners();
    });
  } catch {
    currentConsent = DEFAULT_FAIL_CLOSED_STATE;
    notifyListeners();
  }
}

export function subscribeConsent(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  if (typeof window !== "undefined") {
    registerTCFListener();

    if (!tcfListenerRegistered) {
      const intervalId = window.setInterval(() => {
        if (typeof window.__tcfapi === "function") {
          window.clearInterval(intervalId);
          registerTCFListener();
        }
      }, 100);

      const timeoutId = window.setTimeout(() => {
        window.clearInterval(intervalId);
      }, 5000);

      return () => {
        listeners.delete(onStoreChange);
        window.clearInterval(intervalId);
        window.clearTimeout(timeoutId);
      };
    }
  }

  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getConsentSnapshot(): ConsentState {
  return currentConsent;
}

export function getServerConsentSnapshot(): ConsentState {
  return DEFAULT_FAIL_CLOSED_STATE;
}

export function openPrivacySettings(): void {
  if (typeof window === "undefined") return;

  const gfc = window.googlefc;
  if (typeof gfc?.showRevocationMessage === "function") {
    gfc.showRevocationMessage();
    return;
  }

  if (gfc && Array.isArray(gfc.callbackQueue)) {
    gfc.callbackQueue.push(() => {
      window.googlefc?.showRevocationMessage?.();
    });
    return;
  }

  window.dispatchEvent(new CustomEvent("tierlistbase:open-privacy-settings"));
}
