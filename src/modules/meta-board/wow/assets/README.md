# WoW V1 minimal asset ledger

| asset name | final filename | original source/path | rights/usage basis | date | transformations | approval status |
| --- | --- | --- | --- | --- | --- | --- |
| WoW Hero | hero-3b7bb10711.webp | 素材/wow forever/hero.png (2172 × 724) | Source: user-provided project asset. No external source or copyright ownership asserted. | 2026-10-15 | Existing sharp: WebP quality 85; original dimensions retained; 299436 bytes; SHA-256 filename. No design crop or upscale. | FINAL / approved |
| Class icon placeholder | neutral-placeholder.webp | Local geometric SVG source encoded to WebP; neutral square and plus sign | Local development placeholder expressly permitted by user; no official WoW imagery or identity claimed. | 2026-10-15 | SVG rasterized once at 128 × 128; WebP. Static import emits content-hashed build URL. | PLACEHOLDER / final assets pending |
| Spec icon placeholder | neutral-placeholder.webp | Same neutral development asset as Class placeholder | Same user-approved placeholder exception; no external imagery. | 2026-10-15 | Reused static import; no extra asset sizes or infrastructure. | PLACEHOLDER / final assets pending |
| Approved layout reference | Not shipped | 素材/wow forever/home.png | User-provided Final Design reference only | 2026-10-15 | Viewed for layout. No cropping or extraction into production assets. | Approved design reference |

Hero uses next/image with the existing Genshin `priority` convention as the only large preload. Icons are lazy, with 24/36/56px layout bounds and explicit sizes. Static imports provide build-time content hashing and Next immutable build-asset caching. No fixed public URL is made immutable. Text, labels, scores and buttons are DOM content. Final icon assets remain a delivery issue and are visibly labelled on the page.
