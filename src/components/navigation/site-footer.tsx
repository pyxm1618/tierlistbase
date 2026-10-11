import Link from "next/link";

import { Brand } from "@/components/navigation/site-header";

const links = [
  { label: "About", href: "/#why-tierlistbase" },
  { label: "How Rankings Work", href: "/wow-forever/tier-list" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

const moreLinks = [
  { label: "Acceptable use", href: "/acceptable-use" },
  { label: "Refunds", href: "/refund-policy" },
  { label: "Account deletion", href: "/account-deletion" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteFooter() {
  return <footer className="mt-auto border-t border-[#16354d] bg-[#020e19] text-white">
    <div className="mx-auto flex w-[min(calc(100%-32px),1820px)] flex-col gap-5 py-7 sm:w-[min(calc(100%-6.6vw),1820px)] lg:flex-row lg:items-center lg:justify-between">
      <div className="shrink-0">
        <Brand />
        <p className="mt-2 text-[.8rem] text-slate-300">For players who want to understand the meta.</p>
      </div>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
        {links.map(({label,href}) => <Link className="text-[.82rem] text-slate-300 hover:text-white" href={href} key={href}>{label}</Link>)}
      </nav>
    </div>
    <div className="mx-auto flex w-[min(calc(100%-32px),1820px)] flex-wrap items-center justify-between gap-3 border-t border-[#16354d] py-4 text-xs text-slate-400 sm:w-[min(calc(100%-6.6vw),1820px)]">
      <span>© {new Date().getUTCFullYear()} TierListBase</span>
      <nav aria-label="Additional legal links" className="flex flex-wrap gap-x-4 gap-y-2">
        {moreLinks.map(({label,href}) => <Link className="hover:text-slate-200" key={href} href={href}>{label}</Link>)}
      </nav>
    </div>
  </footer>;
}
