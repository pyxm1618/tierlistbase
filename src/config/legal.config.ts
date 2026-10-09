import type { LegalConfig } from "@/platform/legal/types";

export const legalConfig = {
  releaseStatus: "draft",
  operator: {
    legalName: "TierListBase (Pending Corporate Registration Review)",
    jurisdiction: "Pending Legal Review",
    supportEmail: "contact@tierlistbase.com",
  },
  minimumAge: 18,
  dataCategories: ["essential technical and security events (no personal accounts)"],
  authMethods: ["none (authentication disabled in V1)"],
  processors: [
    {
      name: "Resend",
      purpose: "Dormant and inactive in TierListBase V1 (disabled feature flag)",
      privacyUrl: "https://resend.com/legal/privacy-policy",
    },
  ],
  paymentModel: "none",
  oneTimePurchases: false,
  subscriptions: false,
  credits: false,
  refundPolicy: {
    summary:
      "TierListBase V1 is a free, publicly accessible information service without paid tiers, subscriptions, or digital credits. No payment processing is enabled.",
    cancellationSummary:
      "No paid subscriptions exist on TierListBase V1. Recurring billing and subscription mechanisms are entirely disabled.",
  },
  subscriptionTerms: null,
  retentionRules: [
    {
      category: "server security logs",
      period: "ephemeral log rotation period",
      basis: "infrastructure security and abuse prevention",
    },
  ],
  accountDeletion: {
    enabled: false,
    summary:
      "User account registration and login are disabled in V1. No active accounts or personal identities are collected or held by TierListBase.",
  },
  internationalTransfers:
    "TierListBase V1 is hosted on global edge infrastructure. No personal user data is transferred or retained.",
  documents: {
    privacy: { version: "draft-1", effectiveDate: "2026-10-09", reviewStatus: "draft" },
    terms: { version: "draft-1", effectiveDate: "2026-10-09", reviewStatus: "draft" },
    acceptable_use: { version: "draft-1", effectiveDate: "2026-10-09", reviewStatus: "draft" },
    refund_policy: { version: "draft-1", effectiveDate: "2026-10-09", reviewStatus: "draft" },
    account_deletion: { version: "draft-1", effectiveDate: "2026-10-09", reviewStatus: "draft" },
  },
  content: {
    privacy: [
      {
        heading: "Scope and service status",
        paragraphs: [
          "TierListBase V1 is a public read-only game meta rankings board. User accounts, authentication, cookies for profile tracking, and commercial payments are disabled.",
        ],
      },
      {
        heading: "Data collection",
        paragraphs: [
          "The service does not collect user account identifiers, passwords, or personal credentials. Only standard ephemeral server logs for security and abuse prevention are processed.",
        ],
      },
      {
        heading: "External processors",
        paragraphs: [
          "No third-party email delivery, analytics, or payment processors are activated for user tracking in V1.",
        ],
      },
    ],
    terms: [
      {
        heading: "Service overview",
        paragraphs: [
          "TierListBase provides multi-source consensus game rankings for World of Warcraft: Forever. Rankings are analytical syntheses of publicly available data and expert commentary.",
        ],
      },
      {
        heading: "No account required",
        paragraphs: [
          "All meta board features in V1 are freely accessible without account registration, user logins, or subscription fees.",
        ],
      },
    ],
    acceptable_use: [
      {
        heading: "Baseline restrictions",
        paragraphs: [
          "Do not use the service to violate applicable law, disrupt infrastructure availability, circumvent security controls, distribute malware, or perform abusive denial-of-service queries.",
        ],
      },
    ],
    refund_policy: [
      {
        heading: "Free service status",
        paragraphs: [
          "TierListBase V1 has no enabled paid product, subscription, or token purchase. All features are free and unmonetized.",
        ],
      },
    ],
    account_deletion: [
      {
        heading: "Account Deletion Status",
        paragraphs: [
          "TierListBase V1 does not offer user registration, authentication, or user accounts. Consequently, no user profile or account data is held by the service.",
        ],
      },
    ],
  },
} as const satisfies LegalConfig;
