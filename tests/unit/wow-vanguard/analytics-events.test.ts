import { expect, it } from "vitest";
import { sanitizeAnalyticsEvent } from "@/platform/analytics/events";
it("never forwards inscription fields on any Vanguard analytics event", () => {
  for (const name of [
    "vanguard_enter",
    "vanguard_focus",
    "claim_start",
    "auth_start",
    "media_upload",
    "media_rejected",
    "claim_complete",
    "seal_save",
    "share",
    "invite_open",
    "tier_list_click",
    "report_submit",
  ] as const)
    expect(
      sanitizeAnalyticsEvent({
        name,
        properties: {
          displayName: "secret",
          guild: "secret",
          battleCry: "secret",
          email: "secret@example.test",
          userId: "private",
          image: "content",
        },
      }),
    ).toEqual({ name, properties: {} });
});
