import type { ProductConfig } from "@/platform/config/types";

const enabledTestFeaturesConfig = {
  auth: { enabled: true, google: false, magicLink: true, password: false },
  email: { enabled: true },
  commerce: { enabled: false, oneTime: false, subscriptions: false, credits: false },
  analytics: { enabled: true, ga4: true, clarity: true, consentRequired: true },
} as const satisfies ProductConfig["features"];

const vanguardEnabledTestFeaturesConfig = {
  ...enabledTestFeaturesConfig,
  auth: { enabled: true, google: true, magicLink: false, password: false },
} as const satisfies ProductConfig["features"];

const commerceEnabledTestFeaturesConfig = {
  ...enabledTestFeaturesConfig,
  commerce: { enabled: true, oneTime: false, subscriptions: true, credits: true },
} as const satisfies ProductConfig["features"];

const analyticsEnabledPerformanceFeaturesConfig = {
  auth: { enabled: false, google: false, magicLink: false, password: false },
  email: { enabled: false },
  commerce: { enabled: false, oneTime: false, subscriptions: false, credits: false },
  analytics: { enabled: true, ga4: true, clarity: true, consentRequired: true },
} as const satisfies ProductConfig["features"];

const neutralFeaturesConfig = {
  auth: { enabled: false, google: false, magicLink: false, password: false },
  email: { enabled: false },
  commerce: { enabled: false, oneTime: false, subscriptions: false, credits: false },
  analytics: { enabled: false, ga4: false, clarity: false, consentRequired: true },
} as const satisfies ProductConfig["features"];

const productionFeaturesConfig = {
  ...neutralFeaturesConfig,
  auth: { enabled: true, google: true, magicLink: false, password: false },
  email: { enabled: true },
  analytics: process.env.GA4_MEASUREMENT_ID
    ? { enabled: true, ga4: true, clarity: true, consentRequired: true }
    : neutralFeaturesConfig.analytics,
} as const satisfies ProductConfig["features"];

const useEnabledTestProfile =
  process.env.APP_ENV === "test" && process.env.CREAT_WEB_E2E_ENABLED_FEATURES === "1";
const useCommerceEnabledTestProfile =
  useEnabledTestProfile && process.env.CREAT_WEB_E2E_COMMERCE === "1";
const useAnalyticsEnabledPerformanceProfile =
  process.env.APP_ENV === "test" && process.env.CREAT_WEB_PERFORMANCE_ANALYTICS === "1";
const useProductionProfile = process.env.APP_ENV === "production";

export const featuresConfig =
  process.env.APP_ENV === "test" && process.env.CREAT_WEB_E2E_VANGUARD === "1"
    ? vanguardEnabledTestFeaturesConfig
    : useCommerceEnabledTestProfile
      ? commerceEnabledTestFeaturesConfig
      : useEnabledTestProfile
        ? enabledTestFeaturesConfig
        : useAnalyticsEnabledPerformanceProfile
          ? analyticsEnabledPerformanceFeaturesConfig
          : useProductionProfile
            ? productionFeaturesConfig
            : neutralFeaturesConfig;
