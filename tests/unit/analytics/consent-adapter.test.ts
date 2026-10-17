import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  openPrivacySettings,
  subscribeConsent,
  type TCFData,
} from "@/components/analytics/consent-adapter";

describe("consent adapter", () => {
  let tcfCallback: ((tcData: TCFData | null, success: boolean) => void) | null = null;

  beforeEach(() => {
    tcfCallback = null;
    (globalThis as unknown as { window?: unknown }).window = globalThis.window ?? {};
    delete (window as unknown as { __tcfapi?: unknown }).__tcfapi;
    delete (window as unknown as { googlefc?: unknown }).googlefc;
  });

  afterEach(() => {
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

  it("correctly maps TCF purpose consents to analytics and advertising", () => {
    window.__tcfapi = vi.fn((command, version, cb) => {
      if (command === "addEventListener") {
        tcfCallback = cb;
      }
    });

    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    expect(window.__tcfapi).toHaveBeenCalledWith("addEventListener", 2, expect.any(Function));

    // When cmpuishown is active, remain fail-closed
    tcfCallback?.(
      {
        eventStatus: "cmpuishown",
        purpose: { consents: { 1: true, 8: true, 2: true } },
      },
      true,
    );
    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: false,
      advertising: false,
    });

    // When analytics and advertising purposes are granted
    tcfCallback?.(
      {
        eventStatus: "useractioncomplete",
        purpose: { consents: { 1: true, 8: true, 2: true } },
      },
      true,
    );
    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: true,
      advertising: true,
    });
    expect(listener).toHaveBeenCalled();

    // Reject non-essential: only purpose 1 without purpose 8 or 2
    tcfCallback?.(
      {
        eventStatus: "useractioncomplete",
        purpose: { consents: { 1: false, 8: false, 2: false } },
      },
      true,
    );
    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: false,
      advertising: false,
    });

    // Independent analytics: purpose 1 + 8 granted, advertising rejected
    tcfCallback?.(
      {
        eventStatus: "useractioncomplete",
        purpose: { consents: { 1: true, 8: true, 2: false, 3: false, 4: false } },
      },
      true,
    );
    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: true,
      advertising: false,
    });

    // Independent advertising: purpose 1 + 2 granted, analytics rejected
    tcfCallback?.(
      {
        eventStatus: "useractioncomplete",
        purpose: { consents: { 1: true, 8: false, 2: true } },
      },
      true,
    );
    expect(getConsentSnapshot()).toEqual({
      essential: true,
      analytics: false,
      advertising: true,
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
