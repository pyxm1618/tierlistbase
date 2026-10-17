"use client";

export type ConsentState = {
  readonly essential: true;
  readonly analytics: boolean;
  readonly advertising: boolean;
};

export type GoogleConsentModeValues = {
  analytics_storage?: "granted" | "denied";
  ad_storage?: "granted" | "denied";
  ad_user_data?: "granted" | "denied";
  ad_personalization?: "granted" | "denied";
};

declare global {
  interface Window {
    __tcfapi?: (
      command: string,
      version: number,
      callback: (tcData: unknown, success: boolean) => void,
      parameter?: unknown,
    ) => void;
    googlefc?: {
      callbackQueue?: Array<(() => void) | Record<string, () => void>>;
      showRevocationMessage?: () => void;
      getGoogleConsentModeValues?: () => GoogleConsentModeValues | undefined;
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
let isSubscribedToCmp = false;

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function updateFromConsentModeValues(values?: GoogleConsentModeValues): void {
  if (!values) {
    if (currentConsent.analytics || currentConsent.advertising) {
      currentConsent = DEFAULT_FAIL_CLOSED_STATE;
      notifyListeners();
    }
    return;
  }

  const analytics = values.analytics_storage === "granted";
  const advertising = values.ad_storage === "granted";

  const nextState: ConsentState = {
    essential: true,
    analytics,
    advertising,
  };

  if (
    currentConsent.analytics !== nextState.analytics ||
    currentConsent.advertising !== nextState.advertising
  ) {
    currentConsent = nextState;
    notifyListeners();
  }
}

export function checkAndSyncConsentMode(): void {
  if (typeof window === "undefined") return;
  const values = window.googlefc?.getGoogleConsentModeValues?.();
  if (values) {
    updateFromConsentModeValues(values);
  }
}

function registerCmpListeners(): void {
  if (typeof window === "undefined" || isSubscribedToCmp) return;
  isSubscribedToCmp = true;

  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

  window.googlefc.callbackQueue.push({
    CONSENT_MODE_DATA_READY: () => {
      checkAndSyncConsentMode();
    },
    CONSENT_DATA_READY: () => {
      checkAndSyncConsentMode();
    },
  });

  if (typeof window.__tcfapi === "function") {
    try {
      window.__tcfapi("addEventListener", 2, (tcData, success) => {
        if (success && tcData) {
          checkAndSyncConsentMode();
        }
      });
    } catch {
      // ignore
    }
  }

  checkAndSyncConsentMode();
}

export function subscribeConsent(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  if (typeof window !== "undefined") {
    registerCmpListeners();

    if (typeof window.setInterval === "function") {
      const intervalId = window.setInterval(() => {
        if (typeof window.googlefc?.getGoogleConsentModeValues === "function") {
          checkAndSyncConsentMode();
        }
      }, 100);

      const timeoutId =
        typeof window.setTimeout === "function"
          ? window.setTimeout(() => {
              window.clearInterval(intervalId);
            }, 5000)
          : undefined;

      return () => {
        listeners.delete(onStoreChange);
        window.clearInterval(intervalId);
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
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

export function resetConsentStateForTesting(): void {
  currentConsent = DEFAULT_FAIL_CLOSED_STATE;
  listeners.clear();
  isSubscribedToCmp = false;
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
