import { expect, it } from "vitest";
import { PlaneGeometry, MeshBasicMaterial } from "three";
import { createVanguardInstances, vanguardDeviceBudget } from "@/modules/wow-vanguard";
it("uses one InstancedMesh per WOW letter with 8016 total and no textures", () => {
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial();
  const groups = ["W1", "O", "W2"].map((letter) => ({
    phase: "wow" as const,
    letter,
    positions: new Float32Array(2672 * 4),
    neighbors: new Map(),
  })); // Synthetic test fixture, never a shipped layout.
  const meshes = createVanguardInstances(groups, geometry, material);
  expect(meshes).toHaveLength(3);
  expect(meshes.map((mesh) => mesh.count)).toEqual([2672, 2672, 2672]);
  expect(material.map).toBeNull();
  for (const mesh of meshes) mesh.dispose();
  geometry.dispose();
  material.dispose();
});
it("reduces device cost without changing capacity or claim rules", () => {
  expect(vanguardDeviceBudget({ width: 390, dpr: 3, memory: 2, reducedMotion: true })).toEqual({
    dpr: 1,
    maxThumbnails: 8,
    bloom: false,
    particles: false,
  });
  expect(
    vanguardDeviceBudget({ width: 1920, dpr: 2, memory: 16, reducedMotion: false }).maxThumbnails,
  ).toBe(32);
});
it("recommends actual geometric neighbors, excluding occupied places", async () => {
  const { nearbyVanguardSeats } = await import("@/modules/wow-vanguard");
  const positions = new Float32Array(2672 * 4);
  for (let index = 0; index < 2672; index++) positions[index * 4] = 1000 + index;
  positions[0] = 0;
  positions[4] = 3;
  positions[8] = 1;
  positions[12] = 2;
  const groups = [{ phase: "wow" as const, letter: "W1", positions, neighbors: new Map() }];
  expect(
    nearbyVanguardSeats(groups, "WOW-W1-0001", new Set(["WOW-W1-0001", "WOW-W1-0003"]), 2),
  ).toEqual(["WOW-W1-0004", "WOW-W1-0002"]);
});
it("maps left mouse and one-finger touch to pan when rotation is disabled", async () => {
  const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
  const { OrthographicCamera, MOUSE, TOUCH } = await import("three");
  const { configureVanguardControls } = await import("@/modules/wow-vanguard");
  const controls = new OrbitControls(new OrthographicCamera());
  configureVanguardControls(controls);
  expect(controls.enableRotate).toBe(false);
  expect(controls.mouseButtons.LEFT).toBe(MOUSE.PAN);
  expect(controls.touches.ONE).toBe(TOUCH.PAN);
  expect(controls.touches.TWO).toBe(TOUCH.DOLLY_PAN);
});
it("keeps resolved Alliance and Horde tint through occupancy polling", async () => {
  const { createVanguardSeatColors } = await import("@/modules/wow-vanguard");
  const colors = createVanguardSeatColors();
  colors.setFaction("WOW-W1-0001", "alliance");
  colors.setFaction("WOW-W1-0002", "horde");
  expect(colors.color("WOW-W1-0001", true)).toBe(0x589eff);
  expect(colors.color("WOW-W1-0002", true)).toBe(0xff5353);
  expect(colors.color("WOW-W1-0001", false)).toBe(0x59616d);
  expect(colors.color("WOW-W1-0001", true)).toBe(0x589eff);
});
