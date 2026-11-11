// AdSense bootstrap scheduling.
//
// `adsbygoogle.js` is what pulls show_ads_impl, lidar, sodar and the
// FundingChoices CMP into the page. Attaching it as an eager `<script async>` in
// `<head>` made roughly 295 KiB of third-party JavaScript compete with the
// homepage LCP image, even though no ad pixel sits above the fold. This module
// attaches the very same script from the document instead, once the largest
// contentful paint has settled (or as soon as the user shows intent), so the
// request never sits on the first-paint/LCP critical path.
//
// Waiting for `load` is not enough: on image-light documents `load` can fire long
// before the hero image reports its LCP entry, and the ad request would then race
// the paint it is supposed to stay behind. The LCP candidate stream is therefore
// the trigger, with a hard ceiling for pages that never report one.
//
// Consent ordering is unchanged: `adsbygoogle.js` is also the single entry point
// that loads the FundingChoices CMP, so no ad request can happen before the CMP
// has had a chance to run.

export const ADSENSE_SCRIPT_ID = "tierlistbase-adsense";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2804737462866511";

const ADSENSE_SCRIPT_SELECTOR =
  'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

/** Quiet period after the last LCP candidate before the script is attached. */
const LCP_SETTLE_MS = 600;

/** Ceiling for pages that never report an LCP entry. */
const LCP_MAX_WAIT_MS = 4_000;

/** Fallback when the browser has no PerformanceObserver at all. */
const IDLE_TIMEOUT_MS = 1_500;

const INTERACTION_EVENTS = ["pointerdown", "touchstart", "keydown", "scroll"] as const;

type SchedulingWindow = {
  document: Document;
  setTimeout: (handler: () => void, delay: number) => number;
  clearTimeout: (handle: number) => void;
  addEventListener: (type: string, listener: () => void, options?: AddEventListenerOptions) => void;
  removeEventListener: (type: string, listener: () => void, options?: EventListenerOptions) => void;
  requestIdleCallback?: (handler: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
  PerformanceObserver?: typeof PerformanceObserver;
};

export function attachAdSenseScript(documentRef: Document = document): void {
  if (documentRef.getElementById(ADSENSE_SCRIPT_ID)) return;
  if (documentRef.querySelector(ADSENSE_SCRIPT_SELECTOR)) return;

  const script = documentRef.createElement("script");
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = ADSENSE_SRC;
  documentRef.head.append(script);
}

/**
 * Attaches the AdSense bootstrap once the page has stopped competing with
 * itself. Returns a cleanup function for React effect teardown; it never removes
 * an already attached script, because the mounted layout keeps serving later
 * routes.
 */
export function scheduleAdSenseBootstrap(windowRef: Window = window): () => void {
  const view = windowRef as unknown as SchedulingWindow;
  let attached = false;
  let lcpObserver: PerformanceObserver | undefined;
  let settleTimer: number | undefined;
  let maxWaitTimer: number | undefined;
  let idleTimer: number | undefined;
  let idleHandle: number | undefined;
  const interactionListeners: Array<{ type: string; listener: () => void }> = [];

  const releaseTimers = () => {
    for (const handle of [settleTimer, maxWaitTimer, idleTimer]) {
      if (handle !== undefined) view.clearTimeout(handle);
    }
    settleTimer = undefined;
    maxWaitTimer = undefined;
    idleTimer = undefined;
    if (idleHandle !== undefined) {
      view.cancelIdleCallback?.(idleHandle);
      idleHandle = undefined;
    }
  };

  const detachListeners = () => {
    for (const { type, listener } of interactionListeners.splice(0)) {
      view.removeEventListener(type, listener, { capture: true });
    }
  };

  const attach = () => {
    if (attached) return;
    attached = true;
    lcpObserver?.disconnect();
    lcpObserver = undefined;
    releaseTimers();
    detachListeners();
    attachAdSenseScript(view.document);
  };

  const attachWhenIdle = () => {
    if (typeof view.requestIdleCallback === "function") {
      idleHandle = view.requestIdleCallback(attach, { timeout: IDLE_TIMEOUT_MS });
      return;
    }
    idleTimer = view.setTimeout(attach, IDLE_TIMEOUT_MS);
  };

  const attachAfterLcpSettles = () => {
    const Observer = view.PerformanceObserver;
    if (typeof Observer !== "function") {
      attachWhenIdle();
      return;
    }
    try {
      lcpObserver = new Observer(() => {
        if (settleTimer !== undefined) view.clearTimeout(settleTimer);
        settleTimer = view.setTimeout(attach, LCP_SETTLE_MS);
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      lcpObserver = undefined;
      attachWhenIdle();
      return;
    }
    maxWaitTimer = view.setTimeout(attach, LCP_MAX_WAIT_MS);
  };

  for (const type of INTERACTION_EVENTS) {
    const listener = () => attach();
    interactionListeners.push({ type, listener });
    view.addEventListener(type, listener, { once: true, passive: true, capture: true });
  }

  attachAfterLcpSettles();

  return () => {
    lcpObserver?.disconnect();
    lcpObserver = undefined;
    releaseTimers();
    detachListeners();
  };
}
