"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  subscribeConsent,
} from "@/components/analytics/consent-adapter";
import {
  isAnalyticsLocationSafe,
  sanitizeAnalyticsEvent,
  type SanitizedAnalyticsEvent,
} from "@/platform/analytics/events";

const SCRIPT_IDS = ["creat-web-ga4", "creat-web-clarity"] as const;
const ANALYTICS_COOKIE_PREFIXES = ["_ga", "_clck", "_clsk"] as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

function loadScript(id: string, src: string): void {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.append(script);
}

function emitAnalyticsEvent(event: SanitizedAnalyticsEvent): void {
  window.gtag?.("event", event.name, event.properties);
  window.clarity?.("event", event.name);
}

function startGa4(measurementId: string): void {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("consent", "default", { analytics_storage: "granted" });
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  loadScript(
    "creat-web-ga4",
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
  );
}

function startClarity(projectId: string): void {
  const clarity = ((...args: unknown[]) => {
    clarity.q = clarity.q ?? [];
    clarity.q.push(args);
  }) as NonNullable<Window["clarity"]>;
  window.clarity = window.clarity ?? clarity;
  window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
  loadScript("creat-web-clarity", `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`);
}

function clearAnalyticsCookies(): void {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=", 1)[0]?.trim();
    if (!name || !ANALYTICS_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))) continue;
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}

function stopAnalytics(): void {
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
  for (const scriptId of SCRIPT_IDS) document.getElementById(scriptId)?.remove();
  clearAnalyticsCookies();
  window.dataLayer = [];
  delete window.gtag;
  delete window.clarity;
}

export function AnalyticsClient({
  ga4MeasurementId,
  clarityProjectId,
  consentRequired,
}: Readonly<{
  ga4MeasurementId?: string;
  clarityProjectId?: string;
  consentRequired: boolean;
}>) {
  const consentState = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  const analyticsAllowed = !consentRequired || consentState.analytics;

  useEffect(() => {
    if (!analyticsAllowed) {
      stopAnalytics();
      return;
    }

    if (
      !isAnalyticsLocationSafe({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      })
    ) {
      stopAnalytics();
      return;
    }

    if (ga4MeasurementId) startGa4(ga4MeasurementId);
    if (clarityProjectId) startClarity(clarityProjectId);

    emitAnalyticsEvent(
      sanitizeAnalyticsEvent({
        name: "page_view",
        properties: {
          path: window.location.pathname,
          locale: document.documentElement.lang || "en",
        },
      }),
    );

    return stopAnalytics;
  }, [analyticsAllowed, clarityProjectId, ga4MeasurementId]);

  return null;
}
