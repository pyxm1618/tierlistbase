import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  getAccountContext: vi.fn(),
  sessionRows: [] as Array<{
    id: string;
    createdAt: Date;
    expiresAt: Date;
    userAgent: string | null;
  }>,
  vanguardService: {
    me: vi.fn(),
    manifest: vi.fn(),
  },
  auth: {
    api: {},
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/platform/config/env", () => ({
  env: { appOrigin: "http://localhost:3000" },
}));
vi.mock("@/platform/database/application-database", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(async () => mocks.sessionRows),
        })),
      })),
    })),
  },
}));

const mockFeaturesConfig = {
  auth: { enabled: true, google: true, magicLink: false, password: false },
  email: { enabled: true },
  commerce: { enabled: false, oneTime: false, subscriptions: false, credits: false },
  analytics: { enabled: false, ga4: false, clarity: false, consentRequired: true },
};

vi.mock("@/config/features.config", () => ({
  get featuresConfig() {
    return mockFeaturesConfig;
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
import AccountPagesLayout from "@/app/(account)/account/layout";
import MyVanguardPage from "@/app/(account)/wow-forever/vanguard/my/page";
import MyVanguardLayout from "@/app/(account)/wow-forever/vanguard/my/layout";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { VanguardSealControl, VanguardShareControl } from "@/modules/wow-vanguard";

type RenderedElement = {
  type?: unknown;
  props?: {
    children?: unknown;
    href?: string;
    seatId?: string;
    showPreview?: boolean;
    className?: string;
    title?: string;
  };
};

describe("Account Surface & Feature-Gating Regression", () => {
  it("keeps /account global-only and exposes Security without game-specific destinations", async () => {
    mocks.headers.mockResolvedValueOnce(new Headers());
    mocks.getAccountContext.mockResolvedValueOnce({
      user: { name: "Commander", email: "commander@example.com" },
      session: { id: "s1" },
      subject: { id: "sub1" },
    });

    const page = (await AccountPage()) as RenderedElement;
    expect(page.props?.title).toBe("My Account");

    const pageChildren = (page.props?.children ?? []) as Array<RenderedElement>;
    const nav = pageChildren.find((child) => child?.type === "nav");
    const links = (nav?.props?.children ?? []) as Array<RenderedElement>;
    const hrefs = links.map((link) => link.props?.href);

    expect(hrefs).toEqual(["/account/security"]);
    expect(hrefs).not.toContain("/account/vanguard");
    expect(hrefs).not.toContain("/account/credits");
    expect(hrefs).not.toContain("/account/billing");
  });

  it("verifies /account/credits and /account/billing fail closed with notFound when commerce is disabled", async () => {
    await expect(CreditsPage()).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(BillingPage()).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("keeps My Vanguard in WoW Forever context and preserves existing owned-seat actions", async () => {
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
    expect(page.props?.title).toBe("My Vanguard");

    const pageChildren = (page.props?.children ?? []) as Array<RenderedElement>;
    const contextLinkContainer = pageChildren[0];
    const contextLink = contextLinkContainer?.props?.children as RenderedElement | undefined;
    expect(contextLink?.props?.href).toBe("/wow-forever/vanguard");

    const section = pageChildren.find((child) => child?.type === "section");
    const sectionChildren = (section?.props?.children ?? []) as Array<RenderedElement>;

    const sealControl = sectionChildren.find((child) => child?.type === VanguardSealControl);
    expect(sealControl).toBeDefined();
    expect(sealControl?.props?.showPreview).toBe(true);

    const shareControl = sectionChildren.find((child) => child?.type === VanguardShareControl);
    expect(shareControl).toBeDefined();
    expect(shareControl?.props?.seatId).toBe("WOW-W1-0001");

    const viewContainer = sectionChildren.find((child) => {
      const inner = child?.props?.children as RenderedElement | undefined;
      return inner?.props?.href === "/wow-forever/vanguard?seat=WOW-W1-0001";
    });
    expect(viewContainer).toBeDefined();
  });

  it("keeps the existing Vanguard claim flow for users without a seat", async () => {
    mocks.headers.mockResolvedValueOnce(new Headers());
    mocks.getAccountContext.mockResolvedValueOnce({
      user: { id: "user_without_seat", name: "New Player" },
      session: { id: "s1" },
      subject: { id: "sub1" },
    });
    mocks.vanguardService.me.mockResolvedValueOnce(null);
    mocks.vanguardService.manifest.mockResolvedValueOnce({ stage: "WOW_OPEN" });

    const page = (await MyVanguardPage()) as RenderedElement;
    const pageChildren = (page.props?.children ?? []) as Array<RenderedElement>;
    const section = pageChildren.find((child) => child?.type === "section");
    const sectionChildren = (section?.props?.children ?? []) as Array<RenderedElement>;
    const actionContainer = sectionChildren.find((child) => child?.type === "div");
    const action = actionContainer?.props?.children as RenderedElement | undefined;

    expect(action?.props?.href).toBe("/wow-forever/vanguard");
    expect(action?.props?.children).toBe("Claim your place");
  });

  it("renders Security from existing session storage without requiring a fresh-session list call", async () => {
    const createdAt = new Date("2026-10-25T00:00:00Z");
    const expiresAt = new Date("2026-11-01T00:00:00Z");
    mocks.sessionRows = [{ id: "s1", createdAt, expiresAt, userAgent: "Test browser" }];
    mocks.headers.mockResolvedValueOnce(new Headers());
    mocks.getAccountContext.mockResolvedValueOnce({
      user: { id: "u1", name: "User" },
      session: { id: "s1", createdAt },
      subject: { id: "sub1" },
    });

    const page = (await AccountSecurityPage()) as RenderedElement;
    expect(page.props?.title).toBe("Security");

    const pageChildren = (page.props?.children ?? []) as Array<RenderedElement>;
    const dangerZone = pageChildren[3];
    const dangerZoneChildren = (dangerZone?.props?.children ?? []) as Array<RenderedElement>;
    const dangerTexts = dangerZoneChildren
      .filter((child) => typeof child?.props?.children === "string")
      .map((child) => child.props?.children as string)
      .join(" ");

    expect(dangerTexts).toContain("will not release your Vanguard Seat");
    expect(dangerTexts).toContain("Seat IDs are permanent and never reassigned");
    expect(dangerTexts).toContain("Inscribed personal text and images are removed or hidden");
    expect(dangerTexts).toContain("Unavailable Plate");
  });

  it("mounts the shared site shell around Account and My Vanguard private pages", () => {
    for (const layout of [AccountPagesLayout, MyVanguardLayout]) {
      const rendered = layout({ children: "PrivateContent" }) as RenderedElement;
      const children = (rendered.props?.children ?? []) as Array<RenderedElement>;

      expect(children[0]?.type).toBe(SiteHeader);
      expect(children[1]?.props?.children).toBe("PrivateContent");
      expect(children[1]?.props?.className).toBe("flex-1");
      expect(children[2]?.type).toBe(SiteFooter);
    }
  });
});
