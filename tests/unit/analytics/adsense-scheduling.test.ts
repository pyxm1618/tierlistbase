import { beforeEach, describe, expect, it } from "vitest";

import {
  ADSENSE_SCRIPT_ID,
  attachAdSenseScript,
  scheduleAdSenseBootstrap,
} from "@/components/analytics/adsense-scheduling";

type FakeScript = {
  tag: string;
  id: string;
  async: boolean;
  crossOrigin: string;
  src: string;
};

class FakePerformanceObserver {
  static instances: FakePerformanceObserver[] = [];

  readonly observed: Array<{ type?: string; buffered?: boolean }> = [];
  disconnected = false;

  constructor(private readonly callback: () => void) {
    FakePerformanceObserver.instances.push(this);
  }

  observe(options: { type?: string; buffered?: boolean }) {
    this.observed.push(options);
  }

  disconnect() {
    this.disconnected = true;
  }

  emit() {
    this.callback();
  }
}

function createFakeWindow(
  { readyState, requestIdleCallback, performanceObserver } = {
    readyState: "loading" as DocumentReadyState,
    requestIdleCallback: false,
    performanceObserver: false,
  },
) {
  const appended: FakeScript[] = [];
  let currentReadyState = readyState;

  const documentRef = {
    get readyState() {
      return currentReadyState;
    },
    getElementById: (id: string) => appended.find((node) => node.id === id) ?? null,
    querySelector: (selector: string) =>
      appended.find(
        (node) => selector.includes("adsbygoogle.js") && node.src.includes("adsbygoogle"),
      ) ?? null,
    createElement: (tag: string): FakeScript => ({
      tag,
      id: "",
      async: false,
      crossOrigin: "",
      src: "",
    }),
    head: { append: (node: FakeScript) => void appended.push(node) },
  };

  const listeners = new Map<string, Set<() => void>>();
  const timers = new Map<number, { handler: () => void; delay: number }>();
  const idleCallbacks = new Map<number, () => void>();
  let nextHandle = 1;

  const windowRef = {
    document: documentRef,
    addEventListener: (type: string, listener: () => void) => {
      const bucket = listeners.get(type) ?? new Set<() => void>();
      bucket.add(listener);
      listeners.set(type, bucket);
    },
    removeEventListener: (type: string, listener: () => void) => {
      listeners.get(type)?.delete(listener);
    },
    setTimeout: (handler: () => void, delay: number) => {
      const handle = nextHandle++;
      timers.set(handle, { handler, delay });
      return handle;
    },
    clearTimeout: (handle: number) => void timers.delete(handle),
    ...(requestIdleCallback
      ? {
          requestIdleCallback: (handler: () => void) => {
            const handle = nextHandle++;
            idleCallbacks.set(handle, handler);
            return handle;
          },
          cancelIdleCallback: (handle: number) => void idleCallbacks.delete(handle),
        }
      : {}),
    ...(performanceObserver ? { PerformanceObserver: FakePerformanceObserver } : {}),
  };

  return {
    windowRef,
    appended,
    setReadyState: (next: DocumentReadyState) => {
      currentReadyState = next;
    },
    dispatch: (type: string) => {
      for (const listener of [...(listeners.get(type) ?? [])]) listener();
    },
    listenerCount: (type: string) => listeners.get(type)?.size ?? 0,
    pendingDelays: () => [...timers.values()].map((timer) => timer.delay).sort((a, b) => a - b),
    runTimers: () => {
      for (const [handle, { handler }] of [...timers.entries()]) {
        timers.delete(handle);
        handler();
      }
    },
    runIdleCallbacks: () => {
      for (const [handle, handler] of [...idleCallbacks.entries()]) {
        idleCallbacks.delete(handle);
        handler();
      }
    },
  };
}

function asWindow(windowRef: object): Window {
  return windowRef as unknown as Window;
}

describe("AdSense bootstrap scheduling", () => {
  beforeEach(() => {
    FakePerformanceObserver.instances = [];
  });

  it("observes the LCP candidate stream instead of attaching on load", () => {
    const fake = createFakeWindow({
      readyState: "loading",
      requestIdleCallback: false,
      performanceObserver: true,
    });
    scheduleAdSenseBootstrap(asWindow(fake.windowRef));

    const observer = FakePerformanceObserver.instances[0]!;
    expect(observer.observed).toEqual([{ type: "largest-contentful-paint", buffered: true }]);
    expect(fake.appended).toHaveLength(0);
    // Only the LCP ceiling is armed before any paint has been reported.
    expect(fake.pendingDelays()).toEqual([4_000]);
  });

  it("attaches the same script tag only after the LCP candidate settles", () => {
    const fake = createFakeWindow({
      readyState: "loading",
      requestIdleCallback: false,
      performanceObserver: true,
    });
    scheduleAdSenseBootstrap(asWindow(fake.windowRef));

    FakePerformanceObserver.instances[0]!.emit();
    expect(fake.appended).toHaveLength(0);
    expect(fake.pendingDelays()).toEqual([600, 4_000]);

    fake.runTimers();

    expect(fake.appended).toHaveLength(1);
    const script = fake.appended[0]!;
    expect(script.tag).toBe("script");
    expect(script.id).toBe(ADSENSE_SCRIPT_ID);
    expect(script.async).toBe(true);
    expect(script.crossOrigin).toBe("anonymous");
    expect(script.src).toContain("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
  });

  it("restarts the settle window while new LCP candidates keep arriving", () => {
    const fake = createFakeWindow({
      readyState: "loading",
      requestIdleCallback: false,
      performanceObserver: true,
    });
    scheduleAdSenseBootstrap(asWindow(fake.windowRef));

    const observer = FakePerformanceObserver.instances[0]!;
    observer.emit();
    observer.emit();

    // The first settle timer was cleared and replaced, so only one is pending.
    expect(fake.pendingDelays()).toEqual([600, 4_000]);

    fake.runTimers();
    expect(fake.appended).toHaveLength(1);
  });

  it("attaches immediately on the first user interaction", () => {
    const fake = createFakeWindow({
      readyState: "loading",
      requestIdleCallback: false,
      performanceObserver: true,
    });
    scheduleAdSenseBootstrap(asWindow(fake.windowRef));

    fake.dispatch("pointerdown");

    expect(fake.appended).toHaveLength(1);
    expect(fake.pendingDelays()).toEqual([]);
    expect(fake.listenerCount("pointerdown")).toBe(0);
    expect(FakePerformanceObserver.instances[0]!.disconnected).toBe(true);
  });

  it("attaches through the ceiling when no LCP candidate is ever reported", () => {
    const fake = createFakeWindow({
      readyState: "loading",
      requestIdleCallback: false,
      performanceObserver: true,
    });
    scheduleAdSenseBootstrap(asWindow(fake.windowRef));

    fake.runTimers();

    expect(fake.appended).toHaveLength(1);
  });

  it("falls back to an idle callback without PerformanceObserver support", () => {
    const fake = createFakeWindow({
      readyState: "loading",
      requestIdleCallback: true,
      performanceObserver: false,
    });
    scheduleAdSenseBootstrap(asWindow(fake.windowRef));

    expect(fake.appended).toHaveLength(0);
    fake.runIdleCallbacks();
    expect(fake.appended).toHaveLength(1);
  });

  it("falls back to a timeout when there is neither idle nor observer support", () => {
    const fake = createFakeWindow({
      readyState: "loading",
      requestIdleCallback: false,
      performanceObserver: false,
    });
    scheduleAdSenseBootstrap(asWindow(fake.windowRef));

    expect(fake.pendingDelays()).toEqual([1_500]);
    fake.runTimers();
    expect(fake.appended).toHaveLength(1);
  });

  it("never attaches a second AdSense script", () => {
    const fake = createFakeWindow({
      readyState: "complete",
      requestIdleCallback: false,
      performanceObserver: true,
    });
    scheduleAdSenseBootstrap(asWindow(fake.windowRef));
    scheduleAdSenseBootstrap(asWindow(fake.windowRef));

    fake.runTimers();
    fake.runTimers();

    expect(fake.appended).toHaveLength(1);

    attachAdSenseScript(fake.windowRef.document as unknown as Document);
    expect(fake.appended).toHaveLength(1);
  });

  it("drops pending work when the effect is torn down before the paint settles", () => {
    const fake = createFakeWindow({
      readyState: "loading",
      requestIdleCallback: false,
      performanceObserver: true,
    });
    const teardown = scheduleAdSenseBootstrap(asWindow(fake.windowRef));

    teardown();
    fake.dispatch("pointerdown");
    fake.runTimers();

    expect(fake.appended).toHaveLength(0);
  });
});
