import { createVanguardThumbnailLookup } from "./thumbnails";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { SeatLayoutGroup } from "../domain/layout";
import { buildSeatId, parseSeatId } from "../domain/event";
export function createVanguardScatterTargets(
  groups: readonly SeatLayoutGroup[],
  reducedMotion: boolean,
) {
  const monumentBounds = new THREE.Box3();
  for (const group of groups)
    for (let i = 0; i < group.positions.length; i += 4)
      monumentBounds.expandByPoint(
        new THREE.Vector3(group.positions[i]!, group.positions[i + 1]!, group.positions[i + 2]!),
      );
  const monumentCenter = monumentBounds.getCenter(new THREE.Vector3());
  const monumentSize = monumentBounds.getSize(new THREE.Vector3());
  const backgroundWidth = options.backgroundSize?.width ?? 167.2;
  const backgroundHeight = options.backgroundSize?.height ?? 94.1;
  const center = options.background
    ? new THREE.Vector3(0, 0, monumentCenter.z)
    : monumentCenter.clone();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10000);
  camera.position.set(center.x, center.y, monumentBounds.max.z + 100);
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
  let cameraMotion:
    | {
        startedAt: number;
        duration: number;
        fromTarget: THREE.Vector3;
        toTarget: THREE.Vector3;
        fromX: number;
        fromY: number;
        toX: number;
        toY: number;
        fromZoom: number;
        toZoom: number;
        resolve: () => void;
      }
    | null = null;
  const focusMarkerGeometry = new THREE.RingGeometry(0.62, 0.92, 32);
  const focusMarkerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd875,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthTest: false,
  });
  const focusMarker = new THREE.Mesh(focusMarkerGeometry, focusMarkerMaterial);
  focusMarker.visible = false;
  focusMarker.renderOrder = 20;
  scene.add(focusMarker);
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
  function overviewHeight(width: number, height: number) {
    const aspect = width / Math.max(1, height);
    const subjectHeight = monumentSize.y + 4;
    const subjectWidthAsHeight = (monumentSize.x + 4) / aspect;
    if (!options.background) return Math.max(subjectHeight, subjectWidthAsHeight);
    const backgroundFrame =
      width < 768
        ? Math.max(backgroundHeight, backgroundWidth / aspect)
        : Math.min(backgroundHeight, backgroundWidth / aspect);
    return Math.max(backgroundFrame, subjectHeight, subjectWidthAsHeight);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const frameHeight = overviewHeight(width, height);
    camera.left = (-frameHeight * aspect) / 2;
    camera.right = (frameHeight * aspect) / 2;
    camera.top = frameHeight / 2;
    camera.bottom = -frameHeight / 2;
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
  function cameraEase(progress: number) {
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }
  function animateCamera(target: THREE.Vector3, zoom: number, duration = 600) {
    if (cameraMotion) {
      cameraMotion.resolve();
      cameraMotion = null;
    }
    if (options.reducedMotion) {
      controls.target.copy(target);
      camera.position.x = target.x;
      camera.position.y = target.y;
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      return Promise.resolve();
    }
    controls.enabled = false;
    return new Promise<void>((resolve) => {
      cameraMotion = {
        startedAt: performance.now(),
        duration,
        fromTarget: controls.target.clone(),
        toTarget: target.clone(),
        fromX: camera.position.x,
        fromY: camera.position.y,
        toX: target.x,
        toY: target.y,
        fromZoom: camera.zoom,
        toZoom: zoom,
        resolve,
      };
    });
  }
  function showFocusMarker(group: SeatLayoutGroup, index: number) {
    const offset = index * 4;
    focusMarker.position.set(
      group.positions[offset]!,
      group.positions[offset + 1]!,
      group.positions[offset + 2]! + 0.03,
    );
    focusMarker.scale.setScalar(Math.max(1, group.scale ?? 1));
    focusMarker.visible = true;
  }
  function clearFocusMarker() {
    focusMarker.visible = false;
  }

  function render(now: number) {
    if (stopped) return;
    if (cameraMotion) {
      const progress = Math.min(1, Math.max(0, (now - cameraMotion.startedAt) / cameraMotion.duration));
      const eased = cameraEase(progress);
      controls.target.lerpVectors(cameraMotion.fromTarget, cameraMotion.toTarget, eased);
      camera.position.x = THREE.MathUtils.lerp(cameraMotion.fromX, cameraMotion.toX, eased);
      camera.position.y = THREE.MathUtils.lerp(cameraMotion.fromY, cameraMotion.toY, eased);
      camera.zoom = THREE.MathUtils.lerp(cameraMotion.fromZoom, cameraMotion.toZoom, eased);
      camera.updateProjectionMatrix();
      if (progress >= 1) {
        const resolve = cameraMotion.resolve;
        cameraMotion = null;
        controls.enabled = true;
        resolve();
      }
    }
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
      const identity = parseSeatId(seatId);
      const group = groups.find(
        (candidate) =>
          candidate.phase === identity.phase && candidate.letter === identity.letter,
      );
      if (!group) return Promise.resolve();
      const index = identity.localIndex - 1;
      const offset = index * 4;
      const target = new THREE.Vector3(
        group.positions[offset]!,
        group.positions[offset + 1]!,
        group.positions[offset + 2]!,
      );
      showFocusMarker(group, index);
      return animateCamera(target, 8, 600);
    },
    gather() {
      scatterTarget = 0;
      clearFocusMarker();
      void animateCamera(center, 1, 500);
    },
    dispose() {
      stopped = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
      if (cameraMotion) {
        cameraMotion.resolve();
        cameraMotion = null;
      }
      controls.dispose();
      for (const id of tiles.keys()) clearTile(id);
      scene.remove(focusMarker);
      focusMarkerGeometry.dispose();
      focusMarkerMaterial.dispose();
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
