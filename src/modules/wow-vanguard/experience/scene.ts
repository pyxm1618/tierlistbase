import { createVanguardThumbnailLookup } from "./thumbnails";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { SeatLayoutGroup } from "../domain/layout";
import { buildSeatId, parseSeatId } from "../domain/event";
export function createVanguardScatterTargets(
  groups: readonly SeatLayoutGroup[],
  reducedMotion: boolean,
) {
  const bounds = new THREE.Box3();
  for (const group of groups)
    for (let i = 0; i < group.positions.length; i += 4)
      bounds.expandByPoint(
        new THREE.Vector3(group.positions[i]!, group.positions[i + 1]!, group.positions[i + 2]!),
      );
  const size = bounds.getSize(new THREE.Vector3());
  const strength = reducedMotion ? 0.12 : 1;
  return groups.map((group) => {
    let seed = 2166136261;
    for (const char of `${group.phase}:${group.letter}`)
      seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
    const targets = group.positions.slice();
    for (let i = 0; i < targets.length / 4; i++) {
      let value = Math.imul(seed ^ (i + 1), 2246822519) >>> 0;
      value = (value ^ (value >>> 13)) >>> 0;
      const rx = (value & 65535) / 65535 - 0.5,
        ry = (value >>> 16) / 65535 - 0.5;
      targets[i * 4] =
        group.positions[i * 4]! +
        strength * (group.positions[i * 4]! * 0.12 + rx * Math.max(size.x, 1) * 0.12);
      targets[i * 4 + 1] =
        group.positions[i * 4 + 1]! +
        strength * (group.positions[i * 4 + 1]! * 0.12 + ry * Math.max(size.y, 1) * 0.12);
    }
    return targets;
  });
}
export function applyVanguardScatter(
  meshes: readonly THREE.InstancedMesh[],
  groups: readonly SeatLayoutGroup[],
  targets: readonly Float32Array[],
  amount: number,
) {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1)
    throw new Error("Invalid Scatter interpolation");
  const transform = new THREE.Object3D();
  groups.forEach((group, groupIndex) => {
    const target = targets[groupIndex]!;
    for (let i = 0; i < group.positions.length / 4; i++) {
      const offset = i * 4;
      transform.position.set(
        group.positions[offset]! + (target[offset]! - group.positions[offset]!) * amount,
        group.positions[offset + 1]! +
          (target[offset + 1]! - group.positions[offset + 1]!) * amount,
        group.positions[offset + 2]!,
      );
      transform.rotation.z = group.positions[offset + 3]!;
      transform.scale.setScalar(group.scale ?? 1);
      transform.updateMatrix();
      meshes[groupIndex]!.setMatrixAt(i, transform.matrix);
    }
    meshes[groupIndex]!.instanceMatrix.needsUpdate = true;
  });
}
export function createVanguardSeatColors() {
  const factions = new Map<string, number>();
  return {
    setFaction(id: string, faction: string) {
      factions.set(id, faction === "alliance" ? 0x589eff : 0xff5353);
    },
    color(id: string, occupied: boolean) {
      return occupied ? (factions.get(id) ?? 0xffdc90) : 0x59616d;
    },
  };
}
export function vanguardDeviceBudget(input: {
  width: number;
  dpr: number;
  memory: number;
  reducedMotion: boolean;
}) {
  const low = input.width < 768 || input.memory <= 4;
  return {
    dpr: Math.min(input.dpr, low ? 1 : 2),
    maxThumbnails: low ? 8 : 32,
    bloom: !low && !input.reducedMotion,
    particles: !low && !input.reducedMotion,
  };
}
export function createVanguardInstances(
  groups: readonly SeatLayoutGroup[],
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
) {
  return groups.map((group) => {
    const count = group.phase === "wow" ? 2672 : 8016;
    if (group.positions.length !== count * 4 || !group.positions.every(Number.isFinite))
      throw new Error("Invalid Vanguard render layout");
    buildSeatId(group.phase, group.letter, count);
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const transform = new THREE.Object3D();
    for (let index = 0; index < count; index++) {
      const offset = index * 4;
      transform.position.set(
        group.positions[offset]!,
        group.positions[offset + 1]!,
        group.positions[offset + 2]!,
      );
      transform.scale.setScalar(group.scale ?? 1);
      transform.rotation.z = group.positions[offset + 3]!;
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
    return mesh;
  });
}
export async function loadVanguardGroup(
  phase: "wow" | "forever",
  letter: string,
  url: string,
): Promise<SeatLayoutGroup> {
  if (!url.startsWith("/") || url.startsWith("//")) throw new Error("Layout must be self-hosted");
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error("Layout asset unavailable");
  const bytes = await response.arrayBuffer();
  const count = phase === "wow" ? 2672 : 8016;
  if (bytes.byteLength !== count * 16) throw new Error("Invalid layout byte length");
  const positions = new Float32Array(bytes);
  if (!positions.every(Number.isFinite)) throw new Error("Invalid layout coordinates");
  buildSeatId(phase, letter, count);
  return { phase, letter, positions, neighbors: new Map() };
}
export function createVanguardScene(
  canvas: HTMLCanvasElement,
  groups: readonly SeatLayoutGroup[],
  plate: THREE.Texture,
  options: {
    background?: THREE.Texture;
    backgroundSize?: { width: number; height: number };
    occupied: ReadonlySet<string>;
    reducedMotion: boolean;
    onSeat: (seatId: string) => void;
    thumbnail: (seatId: string) => Promise<string | null>;
    onError: (error: unknown) => void;
  },
) {
  const thumbnailLookup = createVanguardThumbnailLookup(options.thumbnail);
  const budget = vanguardDeviceBudget({
    width: innerWidth,
    dpr: devicePixelRatio,
    memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4,
    reducedMotion: options.reducedMotion,
  });
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: budget.dpr > 1 });
  renderer.setPixelRatio(budget.dpr);
  const scene = new THREE.Scene();
  const geometry = new THREE.PlaneGeometry(1, 1);
  plate.colorSpace = THREE.SRGBColorSpace;
  if (options.background) options.background.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: plate, transparent: true });
  const meshes = createVanguardInstances(groups, geometry, material);
  const scatterTargets = createVanguardScatterTargets(groups, options.reducedMotion);
  let scatterAmount = 0,
    scatterTarget = 0,
    lastMotion = 0;
  // Conservative bounds cover both endpoints for correct hit testing throughout motion.
  groups.forEach((group, groupIndex) => {
    const box = meshes[groupIndex]!.boundingBox!;
    const half = (group.scale ?? 1) / 2;
    const target = scatterTargets[groupIndex]!;
    for (let i = 0; i < target.length; i += 4) {
      box.expandByPoint(
        new THREE.Vector3(target[i]! - half, target[i + 1]! - half, target[i + 2]!),
      );
      box.expandByPoint(
        new THREE.Vector3(target[i]! + half, target[i + 1]! + half, target[i + 2]!),
      );
    }
    meshes[groupIndex]!.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
  });
  meshes.forEach((mesh) => scene.add(mesh));
  if (options.background) {
    const background = new THREE.Mesh(
      new THREE.PlaneGeometry(
        options.backgroundSize?.width ?? 167.2,
        options.backgroundSize?.height ?? 94.1,
      ),
      new THREE.MeshBasicMaterial({ map: options.background }),
    );
    background.position.z = -0.1;
    scene.add(background);
  }
  const bounds = new THREE.Box3();
  for (const group of groups)
    for (let i = 0; i < group.positions.length; i += 4)
      bounds.expandByPoint(
        new THREE.Vector3(group.positions[i]!, group.positions[i + 1]!, group.positions[i + 2]!),
      );
  if (options.background)
    bounds
      .expandByPoint(
        new THREE.Vector3(
          -(options.backgroundSize?.width ?? 167.2) / 2,
          -(options.backgroundSize?.height ?? 94.1) / 2,
          0,
        ),
      )
      .expandByPoint(
        new THREE.Vector3(
          (options.backgroundSize?.width ?? 167.2) / 2,
          (options.backgroundSize?.height ?? 94.1) / 2,
          0,
        ),
      );
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const camera = new THREE.OrthographicCamera(
    -size.x / 2 - 2,
    size.x / 2 + 2,
    size.y / 2 + 2,
    -size.y / 2 - 2,
    0.1,
    10000,
  );
  camera.position.set(center.x, center.y, bounds.max.z + 100);
  camera.lookAt(center);
  const controls = new OrbitControls(camera, canvas);
  configureVanguardControls(controls);
  controls.enableDamping = !options.reducedMotion;
  controls.target.copy(center);
  controls.minZoom = 0.4;
  controls.maxZoom = 100;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const tiles = new Map<string, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>();
  const loading = new Set<string>();
  let stopped = false;
  let lastThumb = 0;
  let raf = 0;
  let refreshing = false;
  let visibleIds = new Set<string>();
  let occupied = options.occupied;
  const seatColors = createVanguardSeatColors();
  function colorSeats() {
    for (const [groupIndex, group] of groups.entries()) {
      for (let i = 0; i < group.positions.length / 4; i++)
        meshes[groupIndex]!.setColorAt(
          i,
          new THREE.Color(
            seatColors.color(
              buildSeatId(group.phase, group.letter, i + 1),
              occupied.has(buildSeatId(group.phase, group.letter, i + 1)),
            ),
          ),
        );
      meshes[groupIndex]!.instanceColor!.needsUpdate = true;
    }
  }
  colorSeats();
  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    const aspect = rect.width / Math.max(1, rect.height);
    const height = Math.max(size.y + 4, (size.x + 4) / aspect);
    camera.left = (-height * aspect) / 2;
    camera.right = (height * aspect) / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  function pick(x: number, y: number) {
    pointer.set(x * 2 - 1, 1 - y * 2);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(meshes)[0];
    if (hit?.instanceId !== undefined) {
      const group = groups[meshes.indexOf(hit.object as (typeof meshes)[number])]!;
      options.onSeat(buildSeatId(group.phase, group.letter, hit.instanceId + 1));
    }
  }
  let down: { x: number; y: number } | null = null;
  const pointerDown = (event: PointerEvent) => {
    down = { x: event.clientX, y: event.clientY };
  };
  const pointerUp = (event: PointerEvent) => {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) < 6) {
      const rect = canvas.getBoundingClientRect();
      pick((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    }
    down = null;
  };
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);
  function clearTile(id: string) {
    const tile = tiles.get(id);
    if (tile) {
      scene.remove(tile);
      tile.material.map?.dispose();
      tile.material.dispose();
      tile.geometry.dispose();
      tiles.delete(id);
    }
  }
  async function refreshThumbnails() {
    if (refreshing) return;
    refreshing = true;
    try {
      const pixels =
        ((canvas.clientHeight * camera.zoom) / (camera.top - camera.bottom)) *
        Math.min(...groups.map((group) => group.scale ?? 1));
      const wanted = new Map<string, THREE.Vector3>();
      if (pixels >= 8) {
        const projection = new THREE.Matrix4().multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse,
        );
        for (const [groupIndex, group] of groups.entries()) {
          for (
            let index = 0;
            index < group.positions.length / 4 && wanted.size < budget.maxThumbnails;
            index++
          ) {
            const id = buildSeatId(group.phase, group.letter, index + 1);
            if (!occupied.has(id)) continue;
            const offset = index * 4;
            const eased = scatterAmount * scatterAmount * (3 - 2 * scatterAmount);
            const target = scatterTargets[groupIndex]!;
            const position = new THREE.Vector3(
              group.positions[offset]! + (target[offset]! - group.positions[offset]!) * eased,
              group.positions[offset + 1]! +
                (target[offset + 1]! - group.positions[offset + 1]!) * eased,
              group.positions[offset + 2]!,
            );
            const projected = position.clone().applyMatrix4(projection);
            if (Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1) wanted.set(id, position);
          }
        }
      }
      visibleIds = new Set(wanted.keys());
      for (const id of tiles.keys()) if (!visibleIds.has(id)) clearTile(id);
      for (const id of wanted.keys()) {
        if (tiles.has(id) || loading.has(id)) continue;
        loading.add(id);
        try {
          const url = await thumbnailLookup(id);
          if (!url || stopped || !visibleIds.has(id)) continue;
          const texture = await new THREE.TextureLoader().loadAsync(url);
          texture.colorSpace = THREE.SRGBColorSpace;
          if (stopped || !visibleIds.has(id) || tiles.size >= budget.maxThumbnails) {
            texture.dispose();
            continue;
          }
          const tile = new THREE.Mesh(
            new THREE.PlaneGeometry(
              0.8 * (groups.find((g) => g.letter === parseSeatId(id).letter)?.scale ?? 1),
              0.8 * (groups.find((g) => g.letter === parseSeatId(id).letter)?.scale ?? 1),
            ),
            new THREE.MeshBasicMaterial({ map: texture }),
          );
          const identity = parseSeatId(id),
            groupIndex = groups.findIndex((group) => group.letter === identity.letter),
            group = groups[groupIndex]!,
            target = scatterTargets[groupIndex]!,
            offset = (identity.localIndex - 1) * 4;
          const eased = scatterAmount * scatterAmount * (3 - 2 * scatterAmount);
          tile.position.set(
            group.positions[offset]! + (target[offset]! - group.positions[offset]!) * eased,
            group.positions[offset + 1]! +
              (target[offset + 1]! - group.positions[offset + 1]!) * eased,
            group.positions[offset + 2]!,
          );
          tile.position.z += 0.01;
          scene.add(tile);
          tiles.set(id, tile);
        } catch (error) {
          options.onError(error);
        } finally {
          loading.delete(id);
        }
      }
    } finally {
      refreshing = false;
    }
  }
  function render(now: number) {
    if (stopped) return;
    if (scatterAmount !== scatterTarget) {
      const step =
        Math.min(50, Math.max(0, now - lastMotion)) / (options.reducedMotion ? 160 : 650);
      scatterAmount =
        scatterTarget > scatterAmount
          ? Math.min(scatterTarget, scatterAmount + step)
          : Math.max(scatterTarget, scatterAmount - step);
      const eased = scatterAmount * scatterAmount * (3 - 2 * scatterAmount);
      applyVanguardScatter(meshes, groups, scatterTargets, eased);
      for (const [id, tile] of tiles) {
        const identity = parseSeatId(id),
          groupIndex = groups.findIndex((group) => group.letter === identity.letter);
        const group = groups[groupIndex]!,
          target = scatterTargets[groupIndex]!,
          offset = (identity.localIndex - 1) * 4;
        tile.position.x =
          group.positions[offset]! + (target[offset]! - group.positions[offset]!) * eased;
        tile.position.y =
          group.positions[offset + 1]! +
          (target[offset + 1]! - group.positions[offset + 1]!) * eased;
      }
    }
    lastMotion = now;
    controls.update();
    renderer.render(scene, camera);
    if (now - lastThumb > 1000) {
      lastThumb = now;
      void refreshThumbnails();
    }
    raf = requestAnimationFrame(render);
  }
  raf = requestAnimationFrame(render);
  return {
    pick,
    scatter() {
      scatterTarget = 1;
    },
    setFaction(seatId: string, faction: string) {
      const identity = parseSeatId(seatId),
        index = groups.findIndex((g) => g.phase === identity.phase && g.letter === identity.letter);
      if (index < 0) return;
      seatColors.setFaction(seatId, faction);
      meshes[index]!.setColorAt(
        identity.localIndex - 1,
        new THREE.Color(faction === "alliance" ? 0x589eff : 0xff5353),
      );
      meshes[index]!.instanceColor!.needsUpdate = true;
    },
    updateOccupancy(next: ReadonlySet<string>) {
      occupied = next;
      colorSeats();
    },
    focus(seatId: string) {
      scatterTarget = 0;
      for (const group of groups) {
        for (let index = 0; index < group.positions.length / 4; index++) {
          if (buildSeatId(group.phase, group.letter, index + 1) !== seatId) continue;
          const offset = index * 4;
          controls.target.set(
            group.positions[offset]!,
            group.positions[offset + 1]!,
            group.positions[offset + 2]!,
          );
          camera.position.x = controls.target.x;
          camera.position.y = controls.target.y;
          camera.zoom = Math.max(8, camera.zoom);
          camera.updateProjectionMatrix();
          return;
        }
      }
    },
    gather() {
      scatterTarget = 0;
      controls.target.copy(center);
      camera.position.x = center.x;
      camera.position.y = center.y;
      camera.zoom = 1;
      camera.updateProjectionMatrix();
    },
    dispose() {
      stopped = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
      controls.dispose();
      for (const id of tiles.keys()) clearTile(id);
      meshes.forEach((mesh) => mesh.dispose());
      geometry.dispose();
      material.dispose();
      plate.dispose();
      if (options.background) {
        scene.children
          .filter(
            (obj) => !meshes.includes(obj as (typeof meshes)[number]) && obj instanceof THREE.Mesh,
          )
          .forEach((obj) => {
            const mesh = obj as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
            mesh.geometry.dispose();
            mesh.material.dispose();
          });
        options.background.dispose();
      }
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

export function nearbyVanguardSeats(
  groups: readonly SeatLayoutGroup[],
  seatId: string,
  occupied: ReadonlySet<string>,
  limit = 6,
) {
  const source = parseSeatId(seatId);
  const group = groups.find(
    (group) => group.phase === source.phase && group.letter === source.letter,
  );
  if (!group) return [];
  const offset = (source.localIndex - 1) * 4;
  const candidates: { id: string; distance: number }[] = [];
  for (const target of groups) {
    if (target.phase !== source.phase) continue;
    for (let index = 0; index < target.positions.length / 4; index++) {
      const id = buildSeatId(target.phase, target.letter, index + 1);
      if (id === seatId || occupied.has(id)) continue;
      const at = index * 4;
      const distance = Math.hypot(
        target.positions[at]! - group.positions[offset]!,
        target.positions[at + 1]! - group.positions[offset + 1]!,
        target.positions[at + 2]! - group.positions[offset + 2]!,
      );
      candidates.push({ id, distance });
    }
  }
  return candidates
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((item) => item.id);
}

export function configureVanguardControls(controls: OrbitControls) {
  controls.enableRotate = false;
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
  controls.touches.ONE = THREE.TOUCH.PAN;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
}
