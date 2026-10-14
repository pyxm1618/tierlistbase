import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { inlineLink } from "@/components/ui/styles";
import { legalConfig } from "@/config/legal.config";
import { routeRegistry } from "@/config/routes.config";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

export const metadata: Metadata = metadataForRoute(
  routeRegistry,
  "/privacy",
  currentSeoEnvironment(),
);

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Notice"
      document={legalConfig.documents.privacy}
      sections={legalConfig.content.privacy}
    >
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Advertising choices
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          You can manage some advertising personalization choices or opt out of personalized Google
          ads through{" "}
          <a className={inlineLink} href="https://adssettings.google.com/">
            Google Ad Settings
          </a>
          . Learn more about{" "}
          <a className={inlineLink} href="https://policies.google.com/technologies/partner-sites">
            how Google uses information from partner sites and apps
          </a>
          .
        </p>
      </section>
    </LegalDocument>
  );
}
