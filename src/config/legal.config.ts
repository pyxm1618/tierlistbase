import type { LegalConfig } from "@/platform/legal/types";

export const legalConfig = {
  releaseStatus: "draft",
  operator: {
    legalName: "Wang Yufei",
    establishment: "People's Republic of China",
    supportEmail: "support@tierlistbase.com",
  },
  dataCategories: [
    "Google account identity and session data; Vanguard public text, optional image, inscription and report records",
    "request, network, and security metadata processed by hosting/security infrastructure",
    "support correspondence only when a visitor chooses to email the published support address",
    "optional analytics event and session-interaction data only when a visitor explicitly consents",
  ],
  authMethods: ["Google OAuth through the existing TierListBase account system"],
  processors: [
    {
      name: "Google OAuth",
      purpose: "Google account sign-in and identity verification for TierListBase accounts.",
      privacyUrl: "https://policies.google.com/privacy",
    },
    {
      name: "Google Privacy & Messaging",
      purpose:
        "Google publisher and privacy-consent infrastructure used to present and manage visitor privacy choices. TierListBase does not currently render commercial advertising units.",
      privacyUrl: "https://policies.google.com/privacy",
    },
    {
      name: "Resend",
      purpose: "Transactional system and Vanguard report notification email delivery.",
      privacyUrl: "https://resend.com/legal/privacy-policy",
    },
    {
      name: "Cloudflare",
      purpose:
        "Cloudflare Workers hosting, edge delivery/security, private R2 uploads and approved image storage, and Workers AI automated image screening. Cloudflare may process request and security metadata needed to deliver and protect the site.",
      privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    },
    {
      name: "Neon",
      purpose:
        "PostgreSQL hosting for TierListBase game, ranking and evidence data, existing Google account/session records, Vanguard inscriptions, holds, media metadata and reports. Images are stored in Cloudflare R2, not as database binaries.",
      privacyUrl: "https://neon.com/privacy-policy",
    },
    {
      name: "Dynadot",
      purpose:
        "Email hosting for support correspondence voluntarily sent to support@tierlistbase.com.",
    },
    {
      name: "Google Analytics",
      purpose: "Optional website analytics loaded only after explicit visitor consent.",
      privacyUrl: "https://policies.google.com/privacy",
    },
    {
      name: "Microsoft Clarity",
      purpose:
        "Optional session analytics and interaction measurement loaded only after explicit visitor consent.",
      privacyUrl: "https://privacy.microsoft.com/privacystatement",
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
      category: "Vanguard pending images",
      period: "24-hour R2 pending-prefix lifecycle",
      basis: "temporary upload validation and automated screening",
    },
    {
      category: "Completed Vanguard inscriptions",
      period:
        "retained for the permanent Monument archive, subject to privacy, legal and moderation removal",
      basis:
        "requested public inscription and community tribute; neutral Seat identity is retained after removal",
    },
    {
      category: "infrastructure request and security metadata",
      period:
        "no fixed public period is asserted; retention depends on verified provider configuration and operational need",
      basis: "site delivery, security, abuse prevention, and troubleshooting",
    },
  ],
  accountDeletion: {
    enabled: true,
    summary:
      "Use the existing Account security and account deletion flow, or contact support for privacy or legal removal. Your public Vanguard text and images are removed or hidden; the account binding is detached. The Seat and Seat ID remain occupied as an Unavailable Plate and are never reassigned.",
  },
  internationalTransfers:
    "TierListBase uses infrastructure providers that operate internationally. This notice does not claim that request or security metadata remains in a single country or region.",
  documents: {
    privacy: { version: "1.2", effectiveDate: "2026-10-19", reviewStatus: "draft" },
    terms: { version: "1.2", effectiveDate: "2026-10-19", reviewStatus: "draft" },
    acceptable_use: { version: "1.2", effectiveDate: "2026-10-19", reviewStatus: "draft" },
    refund_policy: { version: "1.0", effectiveDate: "2026-10-09", reviewStatus: "reviewed" },
    account_deletion: { version: "1.2", effectiveDate: "2026-10-19", reviewStatus: "draft" },
  },
  content: {
    privacy: [
      {
        heading: "Vanguard images and reports",
        paragraphs: [
          "Selected images are cropped and normalized, screened automatically by Cloudflare Workers AI, and published only after approval. Metadata such as EXIF and GPS is removed. Private pending R2 objects have a 24-hour deletion lifecycle; completed inscriptions use separate permanent storage. Public inscriptions remain browsable after the event closes, subject to privacy, legal and moderation removal.",
          "Reports contain a fixed reason, Seat ID, timestamp and public Seat link and notify support through Resend. A single report does not automatically hide content. Approved images and public text may be hidden or deleted for policy, privacy or legal reasons.",
        ],
      },
      {
        heading: "Scope and service status",
        paragraphs: [
          "TierListBase provides public game rankings and the Vanguard community Monument. Browsing is public. Vanguard participation uses Google sign-in through the existing TierListBase account system. Vanguard seats are free; no payments, subscriptions or credits are required. TierListBase may load Google publisher and privacy-consent infrastructure on public and legal pages so visitors can manage privacy choices; commercial advertising units are not currently rendered. Optional Google Analytics (GA4) and Microsoft Clarity analytics are available only if a visitor grants explicit consent.",
        ],
      },
      {
        heading: "Information processed",
        paragraphs: [
          "When you request a page, hosting and security infrastructure may process technical information needed to deliver and protect the service, such as IP address, request and routing metadata, browser or user-agent information, timestamps, and security signals. Google sign-in creates an account and session. Vanguard stores a separately chosen public name, faction, class, optional guild, battle cry, optional image and permanent Seat ID. Your Google name and email are not automatically used as a public Vanguard Name.",
          "The Contact page is a mailto link, not a web form. If you choose to send an email to the published support address, the sender details and content you include in that email are processed as support correspondence outside the website form flow.",
        ],
      },
      {
        heading: "Why this information is processed",
        paragraphs: [
          "Technical request and security information is used to deliver pages, maintain service reliability, prevent abuse, investigate errors, and protect the service. Where UK or EU data-protection law applies, these limited operational and security purposes may rely on legitimate interests, subject to the applicable necessity and balancing requirements.",
          "Account and session information supports Google sign-in, the global one-account-one-seat rule and account security. Submitted Vanguard text and approved images support the public Monument, Focus, Seal and Seat sharing; image screening and reports support content safety and privacy removal.",
          "Support correspondence is used only to receive and respond to the message and for related operational or legal record-keeping where necessary.",
        ],
      },
      {
        heading: "Infrastructure providers",
        paragraphs: [
          "Cloudflare provides Cloudflare Workers hosting, edge delivery/security, private R2 uploads and approved image storage, and Workers AI automated image screening. Cloudflare processes end-user request and security metadata as part of delivering and protecting the site.",
          "Neon provides the production PostgreSQL database used for game, ranking, source, and evidence data. The same database also stores existing account and session records, Vanguard inscriptions, holds, image metadata and reports.",
          "Dynadot provides email hosting for support correspondence voluntarily sent to support@tierlistbase.com. Dynadot is not used to process general website visits.",
          "Google provides OAuth sign-in. Cloudflare R2 stores images, Workers AI screens images before public display, and Resend delivers system and report notifications. These functional services are separate from optional consent-based analytics.",
        ],
      },
      {
        heading: "Cookies and browser storage",
        paragraphs: [
          "TierListBase uses necessary account session cookies. Vanguard may store text drafts across Google sign-in and music preferences in your browser. If you choose to allow optional analytics, Google Analytics and Microsoft Clarity may set analytics measurement cookies, and your consent choice is stored in local browser storage. If analytics consent is declined or withdrawn, analytics cookies are removed and the consent choice remains stored locally so the site can remember your preference.",
          "Cloudflare security features may set strictly necessary security or challenge cookies when needed to protect or deliver the site. The exact cookie depends on the Cloudflare protection feature triggered. TierListBase does not use those cookies for advertising or behavioral profiling.",
        ],
      },
      {
        heading: "Analytics and advertising",
        paragraphs: [
          "Optional Google Analytics (GA4) and Microsoft Clarity are available on TierListBase public pages only after explicit visitor consent. If consent is not granted, or if it is withdrawn, these analytics providers are not loaded. Clarity is used for session and interaction analytics, while GA4 is used for aggregate website measurement.",
          "TierListBase currently has Google publisher verification or authorization metadata, including ads.txt, and may load Google publisher and privacy-consent infrastructure to support privacy choices. TierListBase does not currently render commercial advertising units or serve display ads. If advertising is enabled later, the relevant privacy disclosures and consent controls must be reviewed before activation.",
        ],
      },
      {
        heading: "Retention and international processing",
        paragraphs: [
          "TierListBase does not publish an unverified fixed retention period for infrastructure logs or optional analytics data. Request, security, and consent-based analytics data may be retained according to the applicable provider configuration and policies, subject to applicable requirements.",
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
        heading: "Vanguard display license",
        paragraphs: [
          "You retain rights in your uploaded content and confirm that you have the right to submit it. You grant TierListBase a non-exclusive license to store, normalize, screen and display your submitted text and images in the Monument, Focus and Vanguard Seal and related Seat sharing, subject to applicable removal rights. Vanguard is an unofficial community tribute and is not affiliated with, endorsed by, or sponsored by Blizzard Entertainment.",
        ],
      },
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
        heading: "Accounts and Vanguard participation",
        paragraphs: [
          "Browsing is public. Claiming a Vanguard Seat requires Google sign-in. One account may hold only one completed Seat across both stages. A completed inscription is locked and cannot be edited by the participant.",
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
        heading: "Vanguard content",
        paragraphs: [
          "Do not submit sexual or graphic content, hate, harassment, impersonation, unlawful or abusive material, private sensitive information, spam, advertising, QR codes or offsite promotion. Text must be plain text without URLs, email addresses, phone numbers or Discord invitations. Content is screened automatically and may be reported, hidden or deleted. A removed Seat is never reassigned.",
        ],
      },
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
        heading: "Deleting your account",
        paragraphs: [
          "Use Account → Security and account deletion, or contact support@tierlistbase.com for privacy or legal removal. Account deletion detaches your account from the inscription and removes or hides public personal text and images. Public media is revoked and its CDN cache purged. The Seat and Seat ID remain as a neutral Unavailable Plate and are never released or reassigned.",
        ],
      },
    ],
  },
} as const satisfies LegalConfig;
