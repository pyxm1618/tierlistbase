import { expect, it } from "vitest";
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
  const result = await moderateVanguardImage({
    ...input,
    fetch: async (url, init) => {
      expect(String(url)).toContain("@cf/cloudflare/clef-flash");
      const request = JSON.parse(init!.body as string);
      expect(request.model).toBe("clef-flash");
      expect(Object.keys(request.questions)).toEqual([...MODERATION_RISKS, "normal_game_combat"]);
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
