# Genshin V1 image provenance

- `hero-f958fb67df.webp`: user-supplied approved source `素材/漂浮群岛与辉煌天空之城.png` (2131×738); encoded by existing sharp as WebP quality 85 (330,538 bytes). No design screenshot crop. Only this LCP image has priority/preload. Static import supplies Next build-time hashed URL and immutable build asset caching.
- `mock-avatar-1914c60a0f.webp`: existing project asset `public/icons/icon-512x512.png`, resized to a single 256×256 WebP (11,694 bytes). Uniform branded placeholder, not a character portrait. User explicitly approved uniform Mock avatars on 2026-10-14. No external avatar fetches or guessed provenance. Character card initials are live text.

Every avatar uses next/image, declared dimensions via a fixed container, sizes and lazy loading. Detail avatar mounts only when selected. No hand-maintained DPR variants. Original source PNGs and the design screenshot are not shipped by this change.

Replace the mock avatar with approved original character images only when available, retaining static imports or content hashes. Replace data fixtures independently of layout; no database schema changes are needed.
