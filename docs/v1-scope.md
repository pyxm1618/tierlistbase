# TierListBase V1.0 Scope Lock

> Status: **LOCKED**
>
> Locked on: 2026-10-09
>
> This document is a V1 scope summary. The authoritative V1 baselines are `docs/v1-requirements.md` for product scope and `docs/v1-technical-spec.md` for technical scope. If this summary conflicts with either locked document, the locked document takes precedence.

## 1. V1 objective

TierListBase V1.0 exists to validate one product hypothesis:

> **Can TierListBase become a better decision layer for game Tier Lists by telling users what to choose, why, under what context, and how current sources agree or disagree?**

V1 does **not** attempt to prove a multi-game platform at launch.

The architecture may be designed so additional games can be added later, but the actual V1 product and content scope is limited to **World of Warcraft: Forever**.

---

## 2. First game: World of Warcraft: Forever

V1 focuses exclusively on:

- **World of Warcraft: Forever**
- Pre-launch / Beta context before the 2026-11-04 launch
- Rankings must clearly show version/build freshness and uncertainty

Genshin Impact is **not part of V1**.

Genshin Impact is the planned second validation game after the WoW Forever model is working.

The intended expansion path is:

> WoW Forever → Genshin Impact → additional games

---

## 3. V1 public product structure

V1 has only two meaningful public product surfaces.

### 3.1 Homepage

Route:

```text
/
```

Purpose:

- Explain what TierListBase is
- Establish the brand as a game ranking / decision platform
- Feature World of Warcraft: Forever as the only supported game in V1
- Send users directly to the WoW Forever Tier List
- Establish the future multi-game positioning without publishing empty game pages

The homepage must **not** pretend that TierListBase already supports many games.

Suggested message:

> Tier lists built for decisions, not just rankings.

Supporting idea:

> See what is strongest, why, under what conditions, and how current sources agree.

### 3.2 WoW Forever Tier List page

Primary route:

```text
/wow-forever/tier-list/
```

This is the only core content/product page in V1.

It must answer:

> **Given what I want to do in WoW Forever, which class/spec should I choose?**

---

## 4. WoW Forever Tier List V1 functionality

The page should remain one coherent Tier List experience rather than being split into many thin SEO pages.

### Required ranking views

V1 should support the major decision contexts that have clear user demand:

- Overall / Best Class
- Leveling
- DPS
- Tank
- Healer
- Solo
- PvP

If reliable data for a view is not available, the page must show that it is preliminary or unavailable rather than fabricate a ranking.

### Required Tier List capabilities

- Tier rows such as S / A / B / C where appropriate
- Class / spec identity
- Role
- Current WoW Forever build / version context
- Last updated date
- Ranking status: Current / Preliminary / Stale
- Short "Why this tier" explanation
- Major strengths
- Major weaknesses / constraints
- Source count
- Source agreement / disagreement indicator
- Source references
- Tier change / changelog when rankings change

### Required filtering / interaction

Keep interaction lightweight:

- Switch ranking context
- Filter by role where useful
- Find a class/spec quickly
- Expand a class/spec for explanation and source detail

No complex personalized account system is required.

---

## 5. Consensus model in V1

V1 should begin validating the TierListBase differentiation:

> **Source → Context → Normalization → Consensus → Explanation**

For each rating, keep enough source metadata to know:

- source
- source URL
- source publish/update date when available
- WoW Forever build/version represented
- original tier/rank
- normalized score/tier
- freshness status

V1 does not need a sophisticated machine-learning ranking system.

A transparent deterministic normalization and aggregation method is preferred.

When sources disagree, show the disagreement instead of hiding it.

---

## 6. Supporting content

V1 is intentionally not a content-heavy gaming site.

Supporting/edge content may exist only when it directly supports trust, SEO, or legal/technical operation.

Allowed examples:

- Methodology section
- Sources section
- About / project explanation
- Privacy page if required
- Terms / disclaimer if required
- 404 page
- robots.txt
- sitemap.xml

These are **not separate product pillars**.

Methodology and sources should preferably live inside or directly support the WoW Forever Tier List experience rather than becoming a large article network.

---

## 7. Explicitly disabled in V1

The following are **OFF** in V1:

- User registration
- User login
- User accounts
- Authentication
- Payments
- Subscriptions
- Credits
- Checkout
- Paid features
- Community voting
- User-generated Tier Lists
- Tier List Maker
- Comments
- Forums
- Social profiles
- Personalized account analysis
- AI-generated ranking decisions
- News
- Quest guides
- Full wiki
- Build guides as a separate content system
- Weapons/items database as a separate product
- Additional games
- Empty placeholder game pages

If a feature is not required to make the WoW Forever Tier List more useful, trustworthy, indexable, or maintainable, it is out of scope for V1.

---

## 8. SEO is ON and mandatory

Unlike account/payment features, SEO is a V1 requirement.

### Required technical SEO

- Publicly indexable pages
- Server-rendered or statically rendered core content
- Core Tier List content must not depend on client-only JavaScript to become visible
- Unique title and meta description
- Canonical URL
- Semantic heading hierarchy
- Crawlable internal links
- sitemap.xml
- robots.txt
- Open Graph metadata
- Appropriate structured data where valid
- Fast Core Web Vitals
- Mobile-first responsive layout
- Stable URLs
- No indexable empty/filter pages
- No mass-generated thin pages

### Required content SEO principles

- Original wording and analysis
- Clear version/build freshness
- Visible update date
- Methodology transparency
- Source attribution
- Useful explanation beyond a simple copied S/A/B/C grid
- No bulk copying of competitor text or databases

The initial SEO objective is to build authority around:

- WoW Forever tier list
- WoW Forever class tier list
- WoW Forever best class
- WoW Forever DPS / Tank / Healer / Leveling / PvP intent

V1 should satisfy these intents primarily through the single strong WoW Forever Tier List page, not through dozens of thin landing pages.

---

## 9. Data and update model

V1 should support a lightweight structured data layer for:

- Game
- Version / build
- Class / spec
- Ranking context
- Rating
- Source
- Source rating
- Tier change

The first implementation may use manual or semi-automated ingestion.

V1 does **not** require:

- a general-purpose crawler platform
- real-time ingestion
- full automation
- machine learning

The priority is correctness and traceability.

---

## 10. Build approach

### Production source of truth

The GitHub repository remains the source of truth for the production website.

The production implementation should use a normal web stack suitable for:

- public SEO
- custom domain
- version-controlled code
- structured data
- future database integration
- future multi-game expansion

### Create Web / Codex Sites

A Create Web / Sites-style builder may be used for:

- rapid visual prototypes
- layout exploration
- early interaction validation

It is **not the production foundation for V1**.

Reasons:

- V1 is a public SEO product, not just a lightweight internal site
- TierListBase will need structured and frequently updated data
- the production site must remain fully version-controlled in GitHub
- future expansion requires a conventional maintainable application architecture

---

## 11. V1 success criteria

V1 is successful when:

1. A user can land on TierListBase and immediately understand what the site does.
2. A WoW Forever player can quickly answer "what should I play for my goal?"
3. Rankings clearly show context, build/version and freshness.
4. Users can understand why a class/spec is ranked where it is.
5. Users can see how much current sources agree or disagree.
6. Search engines can crawl and index the core content cleanly.
7. Updating rankings does not require rebuilding the product architecture.
8. The underlying data model can later support Genshin Impact without rewriting the entire system.

---

## 12. Scope rule

For V1, use this decision rule:

> **Does this directly improve the WoW Forever Tier List decision experience, trust, freshness, SEO, or maintainability?**

- If **yes**, it may be considered.
- If **no**, it is V2+.

This rule is intended to prevent scope creep and over-design.
