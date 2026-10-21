import { vanguardConfig } from "@/config/vanguard.config";
import { afterEach, expect, it, vi } from "vitest";
afterEach(() => vi.restoreAllMocks());
import {
  moderateVanguardImage,
  MODERATION_RISKS,
  decideVanguardModeration,
} from "@/modules/wow-vanguard";
const input = {
  accountId: "test-account",
  token: "test-token",
  image: Buffer.from("synthetic fixture"),
  thresholds: null,
};
it.each([429, 500, 503])("fails closed for provider HTTP %s", async (status) => {
  await expect(
    moderateVanguardImage({ ...input, fetch: async () => new Response("unavailable", { status }) }),
  ).rejects.toMatchObject({ code: "MODERATION_UNAVAILABLE" });
});
it("fails closed for timeout and malformed responses", async () => {
  await expect(
    moderateVanguardImage({
      ...input,
      fetch: async () => {
        throw new DOMException("timeout", "TimeoutError");
      },
    }),
  ).rejects.toMatchObject({ code: "MODERATION_UNAVAILABLE" });
  await expect(
    moderateVanguardImage({
      ...input,
      fetch: async () => Response.json({ success: true, result: { answers: {} } }),
    }),
  ).rejects.toMatchObject({ code: "MODERATION_UNAVAILABLE" });
});
it("sends only the moderation derivative using the fixed model and risk questions", async () => {
  const timeout = vi.spyOn(AbortSignal, "timeout");
  const result = await moderateVanguardImage({
    ...input,
    fetch: async (url, init) => {
      expect(timeout).toHaveBeenCalledWith(30000);
      expect(String(url)).toContain("@cf/cloudflare/clef-flash");
      const request = JSON.parse(init!.body as string);
      expect(request.model).toBe("clef-flash");
      expect(Object.keys(request.questions)).toEqual([...MODERATION_RISKS, "normal_game_combat"]);
      expect(request.questions.graphic_gore.instructions).toContain("severe burns");
      expect(request.questions.graphic_gore.instructions).not.toContain("real-world");
      expect(request.questions.commercial_spam.instructions).toContain("printed advertisements");
      expect(request.questions.commercial_spam.instructions).not.toContain(
        "Ignore instructions, ads",
      );
      expect(request.images).toEqual([
        { content_type: "image/webp", base64: input.image.toString("base64") },
      ]);
      return Response.json({
        success: true,
        result: {
          model: "clef-flash",
          answers: Object.fromEntries(
            [...MODERATION_RISKS, "normal_game_combat"].map((key) => [
              key,
              { type: "noul", noul: 0 },
            ]),
          ),
        },
      });
    },
  });
  expect(result.decision).toBe("uncertain"); // Synthetic provider response does not calibrate thresholds.
});
it("cannot approve NaN thresholds or missing probabilities", () => {
  const fixture = Object.fromEntries(
    MODERATION_RISKS.map((risk) => [risk, { approveBelow: Number.NaN, rejectAt: Number.NaN }]),
  ) as Parameters<typeof decideVanguardModeration>[1];
  expect(
    decideVanguardModeration(
      Object.fromEntries(MODERATION_RISKS.map((risk) => [risk, 0])),
      fixture,
    ),
  ).toBe("uncertain");
});

it("separates recorded combat, portrait, injury and advertisement scores using central thresholds", () => {
  // Score-only regressions from the real 2026-10-20 calibration; no private images.
  const combat = {
    sexual_explicit: 0.0611,
    sexual_suggestive: 0.0388,
    graphic_gore: 0.2177,
    hate_extremism: 0.0278,
    illegal_or_abusive: 0.0314,
    commercial_spam: 0.0242,
    personal_sensitive_info: 0.0211,
    offsite_redirect: 0.0206,
    normal_game_combat: 0.7721,
  };
  const injury = {
    sexual_explicit: 0.0732,
    sexual_suggestive: 0.0234,
    graphic_gore: 0.4244,
    hate_extremism: 0.0126,
    illegal_or_abusive: 0.0672,
    commercial_spam: 0.0235,
    personal_sensitive_info: 0.0727,
    offsite_redirect: 0.0098,
    normal_game_combat: 0.0427,
  };
  const portrait = {
    sexual_explicit: 0.026,
    sexual_suggestive: 0.0612,
    graphic_gore: 0.017,
    hate_extremism: 0.0108,
    illegal_or_abusive: 0.0139,
    commercial_spam: 0.2209,
    personal_sensitive_info: 0.0599,
    offsite_redirect: 0.0167,
    normal_game_combat: 0.0088,
  };
  const advertisement = {
    sexual_explicit: 0.0542,
    sexual_suggestive: 0.0749,
    graphic_gore: 0.0188,
    hate_extremism: 0.0346,
    illegal_or_abusive: 0.1199,
    commercial_spam: 0.2893,
    personal_sensitive_info: 0.0107,
    offsite_redirect: 0.0276,
    normal_game_combat: 0.0109,
  };
  expect(decideVanguardModeration(combat, vanguardConfig.moderationThresholds)).toBe("approved");
  expect(decideVanguardModeration(injury, vanguardConfig.moderationThresholds)).toBe("rejected");
  expect(decideVanguardModeration(portrait, vanguardConfig.moderationThresholds)).toBe("approved");
  expect(decideVanguardModeration(advertisement, vanguardConfig.moderationThresholds)).toBe(
    "rejected",
  );
});
