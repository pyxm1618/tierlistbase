import { getConsentSnapshot } from "@/components/analytics/consent-adapter";
import {
  sanitizeAnalyticsEvent,
  isAnalyticsLocationSafe,
  type AnalyticsEventName,
} from "@/platform/analytics/events";
export function trackVanguard(name: AnalyticsEventName) {
  if (
    !getConsentSnapshot().analytics ||
    !isAnalyticsLocationSafe({
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    })
  )
    return;
  const event = sanitizeAnalyticsEvent({ name });
  window.gtag?.("event", event.name, event.properties);
  window.clarity?.("event", event.name);
}
