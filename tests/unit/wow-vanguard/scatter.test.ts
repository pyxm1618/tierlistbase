import { expect, it } from "vitest";
import { Matrix4, PlaneGeometry, MeshBasicMaterial } from "three";
import {
  createVanguardInstances,
  createVanguardScatterTargets,
  applyVanguardScatter,
} from "@/modules/wow-vanguard";
it("scatters deterministically and gathers exactly without changing layout or identity", () => {
  const positions = new Float32Array(2672 * 4);
  for (let i = 0; i < 2672; i++) positions[i * 4] = i / 100;
  const groups = [{ phase: "wow" as const, letter: "W1", positions, neighbors: new Map() }];
  const original = positions.slice();
  const targets = createVanguardScatterTargets(groups, false);
  expect(createVanguardScatterTargets(groups, false)).toEqual(targets);
  const reduced = createVanguardScatterTargets(groups, true);
  expect(Math.abs(reduced[0]![0]! - positions[0]!)).toBeLessThan(
    Math.abs(targets[0]![0]! - positions[0]!),
  );
  const geometry = new PlaneGeometry(1, 1),
    material = new MeshBasicMaterial();
  const meshes = createVanguardInstances(groups, geometry, material);
  const before = new Matrix4();
  meshes[0]!.getMatrixAt(12, before);
  applyVanguardScatter(meshes, groups, targets, 1);
  const scattered = new Matrix4();
  meshes[0]!.getMatrixAt(12, scattered);
  expect(scattered.equals(before)).toBe(false);
  applyVanguardScatter(meshes, groups, targets, 0);
  const after = new Matrix4();
  meshes[0]!.getMatrixAt(12, after);
  expect(after.equals(before)).toBe(true);
  expect(positions).toEqual(original);
  expect(meshes[0]!.count).toBe(2672);
  meshes[0]!.dispose();
  geometry.dispose();
  material.dispose();
});
