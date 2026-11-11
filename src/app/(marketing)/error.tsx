"use client";

import Link from "next/link";

/**
 * Marketing route error boundary.
 *
 * The presentation intentionally mirrors `SupportStatePage` (same artwork, same
 * shade gradients, same type scale and button treatment) but cannot import
 * `status-page.module.css`: a route's error boundary is part of the segment
 * bundle, so that stylesheet would become render-blocking CSS for every
 * marketing page. Expressing the same design with utilities that already ship in
 * `globals.css` keeps the visual result while adding zero stylesheet requests.
 */
const buttonBase =
  "inline-flex min-h-[54px] min-w-[220px] cursor-pointer items-center justify-center rounded-[7px] border-[1.5px] bg-[rgba(2,15,27,0.82)] px-6 py-3 font-[inherit] text-base font-extrabold text-[#f8fbff] transition hover:-translate-y-px hover:bg-[rgba(8,31,50,0.95)] focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-white motion-reduce:transition-none";

export default function MarketingError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <main className="relative isolate flex min-h-[clamp(620px,74vh,900px)] flex-1 items-end justify-center overflow-hidden bg-[#02101c] text-[#f7f9ff] max-[700px]:min-h-[650px] max-[430px]:min-h-[620px]">
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- static artwork, delivered directly */}
        <img
          src="/images/support/error-hero.webp"
          alt=""
          decoding="async"
          className="h-full w-full object-cover object-[center_42%] max-[700px]:object-top"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#02101c_0%,rgba(2,16,28,0.97)_13%,rgba(2,16,28,0.6)_34%,transparent_62%),linear-gradient(90deg,rgba(1,12,23,0.28),transparent_30%,transparent_70%,rgba(1,12,23,0.28))] max-[700px]:bg-[linear-gradient(0deg,#02101c_0%,rgba(2,16,28,0.98)_20%,rgba(2,16,28,0.58)_48%,transparent_72%)]"
      />
      <section className="mx-auto w-[calc(100%_-_32px)] max-w-[1000px] pt-[clamp(360px,44vw,650px)] pb-[clamp(42px,5vw,72px)] text-center max-[700px]:pt-[350px] max-[700px]:pb-[38px] max-[430px]:pt-[320px]">
        <h1 className="font-serif text-[clamp(3rem,5.7vw,6.2rem)] leading-[0.98] font-extrabold tracking-[-0.04em] text-balance [text-shadow:0_3px_24px_rgba(0,6,14,0.95)] max-[700px]:text-[clamp(2.75rem,13vw,4.2rem)] max-[430px]:text-[clamp(2.55rem,12.5vw,3.45rem)]">
          Something Went{" "}
          <span className="bg-gradient-to-r from-[#49c3ff] to-[#746dff] bg-clip-text text-transparent">
            Wrong
          </span>
        </h1>
        <p className="mx-auto mt-[18px] max-w-[820px] text-[clamp(1rem,1.4vw,1.3rem)] leading-[1.5] font-[650] text-[#f3f7ff] max-[700px]:mt-[15px] max-[700px]:text-base">
          We couldn&apos;t load this page right now. Please try again.
        </p>
        <p className="mx-auto mt-2 max-w-[760px] text-[clamp(0.9rem,1.12vw,1.04rem)] leading-[1.5] text-[#b9c9df]">
          If the problem continues, you can return to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-[11px]">
          <button
            className={`${buttonBase} border-[#ffd04f] shadow-[0_0_18px_rgba(255,197,61,0.12)] max-[700px]:mx-auto max-[700px]:w-[min(100%,360px)]`}
            type="button"
            onClick={reset}
          >
            Try Again
          </button>
          <Link
            className={`${buttonBase} border-[#41b9ff] shadow-[0_0_18px_rgba(54,174,255,0.11)] max-[700px]:mx-auto max-[700px]:w-[min(100%,360px)]`}
            href="/"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
