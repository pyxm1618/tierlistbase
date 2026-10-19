import { expect, it } from "vitest";
import { createVanguardLayoutLookup } from "@/modules/wow-vanguard";
it("fails closed without final assets and never loads FOREVER for WOW", async () => {
  const absent = createVanguardLayoutLookup({}, async () => {
    throw new Error("should not fetch");
  });
  await expect(absent.exists("WOW-O-0001")).rejects.toMatchObject({ code: "LAYOUT_UNAVAILABLE" });
  const loaded: string[] = [];
  const urls = Object.fromEntries(
    ["W1", "O", "W2"].map((letter) => [`wow:${letter}`, `/wow-${letter}.f32`]),
  );
  const lookup = createVanguardLayoutLookup(urls, async (url) => {
    loaded.push(url);
    const positions = new Float32Array(2672 * 4);
    for (let index = 0; index < 2672; index++) positions[index * 4] = index;
    return positions.buffer;
  });
  expect(await lookup.exists("WOW-O-0001")).toBe(true);
  expect(loaded.sort()).toEqual(["/wow-O.f32", "/wow-W1.f32", "/wow-W2.f32"]);
  expect(
    await lookup.nearest("WOW-O-0001", new Set(["WOW-O-0001", "WOW-W1-0001", "WOW-W2-0001"])),
  ).toBe("WOW-W1-0002");
});
