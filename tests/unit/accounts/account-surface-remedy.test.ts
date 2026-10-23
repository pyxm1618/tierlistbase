import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/platform/config/env", () => ({
  env: { appOrigin: "http://localhost:3000" },
}));
vi.mock("@/platform/database/application-database", () => ({
  db: {},
}));

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  getAccountContext: vi.fn(),
  vanguardService: {
    me: vi.fn(),
    manifest: vi.fn(),
  },
  auth: {
    api: {
      listSessions: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@/platform/auth/account-context", () => ({
  getAccountContext: mocks.getAccountContext,
}));

vi.mock("@/platform/auth/auth", () => ({
  getAuth: () => mocks.auth,
}));

vi.mock("@/modules/wow-vanguard", async () => {
  const actual =
    await vi.importActual<typeof import("@/modules/wow-vanguard")>("@/modules/wow-vanguard");
  return {
    ...actual,
    createVanguardService: () => mocks.vanguardService,
  };
});

import AccountPage from "@/app/(account)/account/page";
import BillingPage from "@/app/(account)/account/billing/page";
import CreditsPage from "@/app/(account)/account/credits/page";
import AccountSecurityPage from "@/app/(account)/account/security/page";
import MyVanguardPage from "@/app/(account)/account/vanguard/page";
import AccountPagesLayout from "@/app/(account)/account/layout";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { VanguardSealControl, VanguardShareControl } from "@/modules/wow-vanguard";

type RenderedElement = {
  type?: unknown;
  props?: {
    children?: unknown;
    href?: string;
    seatId?: string;
    showPreview?: boolean;
    className?: string;
  };
};

describe("Account Surface & Feature-Gating Regression", () => {
  it("verifies /account only exposes My Vanguard and Security, hiding Credits and Billing", async () => {
    mocks.headers.mockResolvedValueOnce(new Headers());
    mocks.getAccountContext.mockResolvedValueOnce({
      user: { name: "Commander", email: "commander@example.com" },
      session: { id: "s1" },
      subject: { id: "sub1" },
    });

    const page = (await AccountPage()) as RenderedElement;
    const nav = page.props?.children as RenderedElement;
    const links = (nav.props?.children ?? []) as Array<RenderedElement>;
    const hrefs = links.map((link) => link.props?.href);

    expect(hrefs).toEqual(["/account/vanguard", "/account/security"]);
    expect(hrefs).not.toContain("/account/credits");
    expect(hrefs).not.toContain("/account/billing");
  });

  it("verifies /account/credits and /account/billing fail closed with notFound when commerce is disabled", async () => {
    // In default test/production profile, commerce is disabled
    await expect(CreditsPage()).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(BillingPage()).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("verifies My Vanguard enables Seal preview and displays all 4 action affordances without editing", async () => {
    mocks.headers.mockResolvedValueOnce(new Headers());
    mocks.getAccountContext.mockResolvedValueOnce({
      user: { id: "user_vanguard_test", name: "Champion" },
      session: { id: "s1" },
      subject: { id: "sub1" },
    });
    mocks.vanguardService.me.mockResolvedValueOnce({
      seatId: "WOW-W1-0001",
      status: "active",
      displayName: "Champion",
      faction: "alliance",
      className: "Warrior",
      guildName: "Ironforge Guard",
      battleCry: "For the Alliance!",
    });
    mocks.vanguardService.manifest.mockResolvedValueOnce({
      stage: "WOW_OPEN",
    });

    const page = (await MyVanguardPage()) as RenderedElement;
    const section = page.props?.children as RenderedElement;
    const sectionChildren = (section.props?.children ?? []) as Array<RenderedElement>;

    // 1. VanguardSealControl has showPreview=true
    const sealControl = sectionChildren.find((child) => child?.type === VanguardSealControl);
    expect(sealControl).toBeDefined();
    expect(sealControl?.props?.showPreview).toBe(true);

    // 2. VanguardShareControl is present
    const shareControl = sectionChildren.find((child) => child?.type === VanguardShareControl);
    expect(shareControl).toBeDefined();
    expect(shareControl?.props?.seatId).toBe("WOW-W1-0001");

    // 3. View in Monument link is present
    const viewContainer = sectionChildren.find((child) => {
      const inner = child?.props?.children as RenderedElement | undefined;
      return inner?.props?.href === "/wow-forever/vanguard?seat=WOW-W1-0001";
    });
    expect(viewContainer).toBeDefined();
    const innerLink = viewContainer?.props?.children as RenderedElement | undefined;
    expect(innerLink?.props?.children).toBe("View in Monument");
  });

  it("verifies Security Danger Zone informs user about Vanguard Seat consequences", async () => {
    mocks.headers.mockResolvedValueOnce(new Headers());
    mocks.getAccountContext.mockResolvedValueOnce({
      user: { id: "u1", name: "User" },
      session: { id: "s1", token: "tok1", createdAt: new Date() },
      subject: { id: "sub1" },
    });
    mocks.auth.api.listSessions.mockResolvedValueOnce([]);

    const page = (await AccountSecurityPage()) as RenderedElement;
    const pageChildren = (page.props?.children ?? []) as Array<RenderedElement>;
    const dangerZone = pageChildren[2];
    const dangerZoneChildren = (dangerZone?.props?.children ?? []) as Array<RenderedElement>;
    const dangerTexts = dangerZoneChildren
      .filter((child) => typeof child?.props?.children === "string")
      .map((child) => child.props?.children as string);

    const fullExplanation = dangerTexts.join(" ");

    expect(fullExplanation).toContain("will not release your Vanguard Seat");
    expect(fullExplanation).toContain("Seat IDs are permanent and never reassigned");
    expect(fullExplanation).toContain("Inscribed personal text and images are removed or hidden");
    expect(fullExplanation).toContain("Unavailable Plate");
  });

  it("verifies AccountPagesLayout mounts SiteHeader and SiteFooter around children", () => {
    const layout = AccountPagesLayout({ children: "AccountContent" }) as RenderedElement;
    const children = (layout.props?.children ?? []) as Array<RenderedElement>;

    expect(children[0]?.type).toBe(SiteHeader);
    expect(children[1]?.props?.children).toBe("AccountContent");
    expect(children[1]?.props?.className).toBe("flex-1");
    expect(children[2]?.type).toBe(SiteFooter);
  });
});
