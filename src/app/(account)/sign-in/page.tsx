import type { Metadata } from "next";

import { AccountShell } from "@/components/account/account-shell";
import { featuresConfig } from "@/config/features.config";
import { GoogleSignIn } from "./google-sign-in";
import { env } from "@/platform/config/env";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <AccountShell
      eyebrow="Account access"
      title="Sign in securely"
      titleId="sign-in-title"
      intro={
        featuresConfig.auth.google
          ? "Continue with your Google account."
          : "No password is required. We will send a single-use confirmation link."
      }
    >
      {featuresConfig.auth.google ? <GoogleSignIn /> : null}
      {featuresConfig.auth.magicLink ? (
        <SignInForm turnstileSiteKey={env.turnstileSiteKey} />
      ) : null}
    </AccountShell>
  );
}
