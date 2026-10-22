import type { Metadata } from "next";

import styles from "./sign-in.module.css";

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
  if (featuresConfig.auth.google) {
    return (
      <main className={styles.hero}>
        <section className={styles.panel} aria-labelledby="sign-in-title">
          <h1 id="sign-in-title" className={styles.title}>
            Sign in to TierListBase
          </h1>
          <p className={styles.description}>
            Continue with Google to access your account
            <br className={styles.desktopBreak} /> and continue where you left off.
          </p>
          <GoogleSignIn />
          <p className={styles.supporting}>
            Google is the only supported sign-in method.
            <br />
            No password required.
          </p>
        </section>
      </main>
    );
  }

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
