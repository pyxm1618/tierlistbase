import { expectTypeOf, it } from "vitest";
import type {
  ClassKey,
  FactionKey,
  RarityKey,
  Luminary,
  UpcomingLuminary,
  Tier,
} from "@/modules/dragon-traveler-tier-list";
it("keeps enums closed and upcoming records out of the ranked type", () => {
  expectTypeOf<string>().not.toExtend<ClassKey>();
  expectTypeOf<string>().not.toExtend<FactionKey>();
  expectTypeOf<string>().not.toExtend<RarityKey>();
  expectTypeOf<UpcomingLuminary>().not.toExtend<Luminary>();
  expectTypeOf<Luminary["viewTiers"]>().toEqualTypeOf<
    Readonly<Record<"Overall" | "PvE" | "PvP", Tier>>
  >();
});
