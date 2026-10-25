import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/account-shell";
import { bodyText, card, cardTitle, metaText, panel, subTitle } from "@/components/ui/styles";
import { getAccountContext } from "@/platform/auth/account-context";

const destinations = [
  {
    href: "/account/security",
    label: "Security",
    body: "Manage your account security and account deletion.",
  },
] as const;

export default async function AccountPage() {
  const context = await getAccountContext(await headers());
  if (!context) redirect("/sign-in");

  return (
    <AccountShell
      eyebrow="Account"
      title="My Account"
      titleId="account-title"
      intro={`Welcome, ${context.user.name}.`}
    >
      <section aria-labelledby="account-information-title" className={`${panel} p-5`}>
        <h2 id="account-information-title" className={subTitle}>
          Account information
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className={metaText}>Display name</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{context.user.name}</dd>
          </div>
          <div>
            <dt className={metaText}>Email</dt>
            <dd className="mt-1 break-all text-sm font-medium text-foreground">
              {context.user.email}
            </dd>
          </div>
        </dl>
      </section>

      <nav aria-label="Account navigation" className="mt-6 grid gap-4">
        {destinations.map((item) => (
          <Link key={item.href} href={item.href} className={`${card} block hover:border-accent`}>
            <span className={cardTitle}>{item.label}</span>
            <span className={`mt-2 block ${bodyText}`}>{item.body}</span>
          </Link>
        ))}
      </nav>
    </AccountShell>
  );
}
