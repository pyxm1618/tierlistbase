import { expect, it, vi } from "vitest";
import { createVanguardThumbnailLookup } from "@/modules/wow-vanguard";
it("caches missing images and reserves read budget for user Focus", async () => {
  let now = 0;
  const read = vi.fn(async () => null);
  const lookup = createVanguardThumbnailLookup(read, () => now);
  await lookup("WOW-W1-0001");
  await lookup("WOW-W1-0001");
  expect(read).toHaveBeenCalledTimes(1);
  for (let index = 2; index <= 45; index++)
    await lookup(`WOW-W1-${String(index).padStart(4, "0")}`);
  expect(read).toHaveBeenCalledTimes(40);
  now = 60001;
  await lookup("WOW-W1-0045");
  expect(read).toHaveBeenCalledTimes(41);
});
