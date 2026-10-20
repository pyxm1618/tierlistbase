"use client";

export function HomeHeroImage() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- direct-static responsive delivery bypasses /_next/image optimizer
    <img
      src="/images/home/hero.webp"
      srcSet="/images/home/hero-384.webp 384w, /images/home/hero-640.webp 640w, /images/home/hero-768.webp 768w, /images/home/hero-1080.webp 1080w, /images/home/hero-1536.webp 1536w, /images/home/hero.webp 2172w"
      sizes="(max-width: 700px) 88vw, 68vw"
      alt=""
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className="tlb-cover tlb-hero-cover"
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
        inset: 0,
        color: "transparent",
      }}
    />
  );
}
