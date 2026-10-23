import type { ReactNode } from "react";

import AccountRootLayout from "../(account)/layout";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export { metadata } from "../(account)/layout";

export default function SignInLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AccountRootLayout>
      <div className="flex min-h-screen flex-col bg-[#061428]">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </AccountRootLayout>
  );
}
