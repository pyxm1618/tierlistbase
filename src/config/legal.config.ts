import type { LegalConfig } from "@/platform/legal/types";

export const legalConfig = {
  releaseStatus: "draft",
  operator: {
    legalName: "Wang Yufei",
    establishment: "People's Republic of China",
    supportEmail: "support@tierlistbase.com",
  },
  dataCategories: [
    "request, network, and security metadata processed by hosting/security infrastructure",
    "support correspondence only when a visitor chooses to email the published support address",
    "no account, payment, advertising-profile, or analytics-profile data in V1",
  ],
  authMethods: ["none (authentication disabled in V1)"],
  processors: [
    {
      name: "Cloudflare",
      purpose:
        "Cloudflare Workers hosting and edge delivery/security. Cloudflare may process request and security metadata needed to deliver and protect the site.",
      privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    },
    {
      name: "Neon",
      purpose:
        "PostgreSQL database hosting for TierListBase game, ranking, source, and evidence data. The application does not intentionally store visitor account profiles in this database in V1.",
      privacyUrl: "https://neon.com/privacy-policy",
    },
    {
      name: "Dynadot",
      purpose:
        "Email hosting for support correspondence voluntarily sent to support@tierlistbase.com.",
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
      "No paid subscriptions exist on TierListBase V1. Recurring billing and subscription mechanisms are disabled.",
  },
  subscriptionTerms: null,
  retentionRules: [
    {
      category: "infrastructure request and security metadata",
      period:
        "no fixed public period is asserted; retention depends on verified provider configuration and operational need",
      basis: "site delivery, security, abuse prevention, and troubleshooting",
    },
  ],
  accountDeletion: {
    enabled: false,
    summary:
      "User account registration and login are disabled in V1. TierListBase does not maintain active user accounts or account profiles.",
  },
  internationalTransfers:
    "TierListBase uses infrastructure providers that operate internationally. This notice does not claim that request or security metadata remains in a single country or region.",
  documents: {
    privacy: { version: "draft-4", effectiveDate: "2026-10-16", reviewStatus: "draft" },
    terms: { version: "draft-3", effectiveDate: "2026-10-16", reviewStatus: "draft" },
    acceptable_use: { version: "draft-1", effectiveDate: "2026-10-09", reviewStatus: "draft" },
    refund_policy: { version: "draft-1", effectiveDate: "2026-10-09", reviewStatus: "draft" },
    account_deletion: { version: "draft-1", effectiveDate: "2026-10-09", reviewStatus: "draft" },
  },
  content: {
    privacy: [
      {
        heading: "Scope and service status",
        paragraphs: [
          "TierListBase V1 is a public, read-only game ranking and analysis service. User registration, authentication, payments, subscriptions, Google Analytics, Microsoft Clarity, and ad serving are not enabled in the current production product.",
        ],
      },
      {
        heading: "Information processed",
        paragraphs: [
          "When you request a page, hosting and security infrastructure may process technical information needed to deliver and protect the service, such as IP address, request and routing metadata, browser or user-agent information, timestamps, and security signals. TierListBase does not intentionally build visitor profiles or store account credentials in its application database in V1.",
          "The Contact page is a mailto link, not a web form. If you choose to send an email to the published support address, the sender details and content you include in that email are processed as support correspondence outside the website form flow.",
        ],
      },
      {
        heading: "Why this information is processed",
        paragraphs: [
          "Technical request and security information is used to deliver pages, maintain service reliability, prevent abuse, investigate errors, and protect the service. Where UK or EU data-protection law applies, these limited operational and security purposes may rely on legitimate interests, subject to the applicable necessity and balancing requirements.",
          "Support correspondence is used only to receive and respond to the message and for related operational or legal record-keeping where necessary.",
        ],
      },
      {
        heading: "Infrastructure providers",
        paragraphs: [
          "Cloudflare provides Cloudflare Workers hosting and edge delivery/security. Cloudflare processes end-user request and security metadata as part of delivering and protecting the site.",
          "Neon provides the production PostgreSQL database used for game, ranking, source, and evidence data. TierListBase V1 does not use that database for visitor account profiles because accounts are disabled.",
          "Dynadot provides email hosting for support correspondence voluntarily sent to support@tierlistbase.com. Dynadot is not used to process general website visits.",
          "No third-party authentication, analytics, advertising, or payment service is activated by the TierListBase V1 application runtime.",
        ],
      },
      {
        heading: "Cookies and browser storage",
        paragraphs: [
          "The TierListBase application does not currently use profile, analytics, advertising, or personalization cookies, and it does not write analytics-consent preferences to browser storage in normal production use because analytics is disabled.",
          "Cloudflare security features may set strictly necessary security or challenge cookies when needed to protect or deliver the site. The exact cookie depends on the Cloudflare protection feature triggered. TierListBase does not use those cookies for advertising or behavioral profiling.",
        ],
      },
      {
        heading: "Analytics and advertising",
        paragraphs: [
          "Google Analytics and Microsoft Clarity are not currently loaded on TierListBase public pages.",
          "TierListBase currently has Google publisher verification or authorization metadata, including ads.txt, but does not load Google ad-serving scripts or display ads in V1. If advertising or optional analytics is enabled later, the relevant privacy disclosures and consent controls must be reviewed before activation.",
        ],
      },
      {
        heading: "Retention and international processing",
        paragraphs: [
          "TierListBase does not publish an unverified fixed retention period for infrastructure logs. Request and security metadata may be retained according to provider configuration and for as long as reasonably needed for site delivery, security, abuse prevention, and troubleshooting, subject to applicable requirements.",
          "Cloudflare operates global infrastructure, and infrastructure providers may process data in more than one country according to their service configuration and contractual terms. TierListBase therefore does not claim that request or security metadata remains only in the UK, EEA, or any other single region.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Where applicable data-protection law gives you rights in relation to personal information, those rights may include access, rectification, erasure, restriction, objection, portability where applicable, withdrawal of consent where processing is based on consent, and the right to complain to the relevant supervisory authority. These rights are subject to the conditions and exceptions in the applicable law.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "TierListBase is operated by Wang Yufei, an individual established in the People's Republic of China. Privacy or support questions may be sent to support@tierlistbase.com.",
        ],
      },
    ],
    terms: [
      {
        heading: "Service overview",
        paragraphs: [
          "TierListBase provides public game ranking and analysis pages for Genshin Impact and World of Warcraft: Forever. The service combines reviewed source material, performance data where available, and TierListBase editorial analysis.",
        ],
      },
      {
        heading: "Informational service and ranking limitations",
        paragraphs: [
          "Tier lists, scores, tier placements, explanations, and change records are informational analysis, not official game guidance or a guarantee of in-game results. Rankings depend on the stated methodology, version, sample coverage, available evidence, and editorial assumptions, all of which may change.",
        ],
      },
      {
        heading: "Third-party sources and links",
        paragraphs: [
          "TierListBase may cite or link to third-party sources, including game publishers, Forever Logs, and other documented evidence sources. Source links and attribution identify where evidence came from; they do not transfer ownership of third-party material to TierListBase or make TierListBase responsible for the availability, accuracy, or terms of external sites.",
          "Where a third-party source imposes attribution, access, redistribution, or other usage conditions, those conditions remain applicable independently of these Terms.",
        ],
      },
      {
        heading: "Intellectual property and non-affiliation",
        paragraphs: [
          "TierListBase original analysis, ranking presentation, and original site content are distinct from third-party game intellectual property. Game names, character names, class and specialization names, trademarks, logos, icons, artwork, and other publisher-owned material remain the property of their respective rights holders.",
          "Genshin Impact and related intellectual property are owned by COGNOSPHERE PTE. LTD. and its licensors. World of Warcraft, Warcraft, Blizzard, and related intellectual property are owned by Blizzard Entertainment, Inc. and its licensors. TierListBase is an independent third-party site and is not affiliated with, sponsored by, or endorsed by COGNOSPHERE, HoYoverse, Blizzard Entertainment, or Forever Logs.",
        ],
      },
      {
        heading: "No account or paid service in V1",
        paragraphs: [
          "TierListBase V1 is accessible without account registration, login, subscription, payment, or digital credits. TierListBase V1 does not currently offer account registration, billing, payment, subscription, or digital-credit features.",
        ],
      },
      {
        heading: "Availability and changes",
        paragraphs: [
          "TierListBase may update rankings, evidence, methodology, pages, or service availability as the product and source material change. No fixed uptime, permanent availability, or permanent preservation of any ranking is promised.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "You must not use TierListBase to violate applicable law, interfere with site security or availability, distribute malware, bypass access controls, or perform abusive automated traffic. The separate Acceptable Use Policy provides the current baseline restrictions.",
        ],
      },
      {
        heading: "Disclaimers and liability",
        paragraphs: [
          "To the extent permitted by applicable law, TierListBase is provided on an as-available basis without a warranty that rankings, source links, third-party data, or service availability will always be complete, current, accurate, or uninterrupted.",
          "To the extent permitted by applicable law, TierListBase is not responsible for losses arising solely from reliance on a ranking, a third-party source changing or becoming unavailable, or temporary service interruption. Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "TierListBase is operated by Wang Yufei, an individual established in the People's Republic of China. Questions about these Terms may be sent to support@tierlistbase.com.",
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
