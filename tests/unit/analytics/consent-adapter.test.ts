import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkAndSyncConsentMode,
  getConsentSnapshot,
  getServerConsentSnapshot,
  openPrivacySettings,
  resetConsentStateForTesting,
  subscribeConsent,
} from "@/components/analytics/consent-adapter";

describe("consent adapter", () => {
  beforeEach(() => {
    resetConsentStateForTesting();
    (globalThis as unknown as { window?: unknown }).window = globalThis.window ?? {};
    delete (window as unknown as { __tcfapi?: unknown }).__tcfapi;
    delete (window as unknown as { googlefc?: unknown }).googlefc;
  });

  afterEach(() => {
    resetConsentStateForTesting();
    vi.restoreAllMocks();
  });

  it("defaults to fail-closed state on server and client", () => {
    expect(getServerConsentSnapshot()).toEqual({
      essential: true,
      analytics: false,
      advertising: false,
    });
    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: false,
      advertising: false,
    });
  });

  it("correctly syncs consent state from Google Consent Mode values", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    // Initial state: fail-closed
    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: false,
      advertising: false,
    });

    // Consent Mode ready with both granted
    window.googlefc = {
      getGoogleConsentModeValues: vi.fn().mockReturnValue({
        analytics_storage: "granted",
        ad_storage: "granted",
      }),
    };
    checkAndSyncConsentMode();

    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: true,
      advertising: true,
    });
    expect(listener).toHaveBeenCalled();

    // Reject non-essential: both denied
    window.googlefc.getGoogleConsentModeValues = vi.fn().mockReturnValue({
      analytics_storage: "denied",
      ad_storage: "denied",
    });
    checkAndSyncConsentMode();

    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: false,
      advertising: false,
    });

    // Independent analytics: analytics_storage granted, ad_storage denied
    window.googlefc.getGoogleConsentModeValues = vi.fn().mockReturnValue({
      analytics_storage: "granted",
      ad_storage: "denied",
    });
    checkAndSyncConsentMode();

    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: true,
      advertising: false,
    });

    // Independent advertising: analytics_storage denied, ad_storage granted
    window.googlefc.getGoogleConsentModeValues = vi.fn().mockReturnValue({
      analytics_storage: "denied",
      ad_storage: "granted",
    });
    checkAndSyncConsentMode();

    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: false,
      advertising: true,
    });

    unsubscribe();
  });

  it("registers callbacks into window.googlefc.callbackQueue", () => {
    const queue: Array<(() => void) | Record<string, () => void>> = [];
    window.googlefc = {
      callbackQueue: queue,
      getGoogleConsentModeValues: vi.fn().mockReturnValue({
        analytics_storage: "granted",
        ad_storage: "denied",
      }),
    };

    const unsubscribe = subscribeConsent(vi.fn());
    expect(queue.length).toBe(1);

    const queuedObj = queue[0] as Record<string, () => void>;
    expect(typeof queuedObj.CONSENT_MODE_DATA_READY).toBe("function");

    queuedObj.CONSENT_MODE_DATA_READY?.();
    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: true,
      advertising: false,
    });

    unsubscribe();
  });

  it("reopens privacy settings via official googlefc methods", () => {
    const showRevocationMessage = vi.fn();
    window.googlefc = { showRevocationMessage };

    openPrivacySettings();
    expect(showRevocationMessage).toHaveBeenCalledTimes(1);

    // Queue style when showRevocationMessage is not immediately ready
    const queue: Array<(() => void) | Record<string, () => void>> = [];
    window.googlefc = {
      callbackQueue: queue,
    };
    openPrivacySettings();
    expect(queue.length).toBe(1);
    const queueShow = vi.fn();
    window.googlefc.showRevocationMessage = queueShow;
    const queuedFn = queue[0];
    if (typeof queuedFn === "function") {
      queuedFn();
      expect(queueShow).toHaveBeenCalledTimes(1);
    }
  });
});
