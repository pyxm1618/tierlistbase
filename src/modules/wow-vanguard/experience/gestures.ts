export type HandPoint = { x: number; y: number; z: number };
export type VanguardGesture = "fist" | "open_palm" | "pinch" | "none";
export function classifyVanguardHand(points: readonly HandPoint[]): VanguardGesture {
  if (
    points.length !== 21 ||
    points.some((point) => ![point.x, point.y, point.z].every(Number.isFinite))
  )
    return "none";
  const distance = (a: number, b: number) =>
    Math.hypot(points[a]!.x - points[b]!.x, points[a]!.y - points[b]!.y);
  const scale = distance(0, 9);
  if (scale < 0.01) return "none";
  if (distance(4, 8) < scale * 0.3) return "pinch";
  const extended = [8, 12, 16, 20].filter(
    (tip) => distance(tip, 0) > distance(tip - 2, 0) * 1.15,
  ).length;
  if (extended === 4) return "open_palm";
  if (extended === 0) return "fist";
  return "none";
}
// Called only by the explicit Enable Gesture Control action, never mount or ENTER.
export async function enableVanguardGestures(
  video: HTMLVideoElement,
  onGesture: (gesture: VanguardGesture, point: HandPoint) => void,
  onFailure: (error: unknown) => void,
) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480, facingMode: "user" },
    audio: false,
  });
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let detector: import("@mediapipe/tasks-vision").HandLandmarker | undefined;
  const stop = () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
    stream.getTracks().forEach((track) => track.stop());
    detector?.close();
    video.srcObject = null;
  };
  try {
    video.srcObject = stream;
    await video.play();
    const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
    detector = await HandLandmarker.createFromOptions(
      await FilesetResolver.forVisionTasks("/vendor/vanguard/mediapipe-1.1.1"),
      {
        baseOptions: { modelAssetPath: "/vendor/vanguard/hand_landmarker-v1.task" },
        runningMode: "VIDEO",
        numHands: 1,
      },
    );
    let lastVideoTime = -1;
    let candidate: VanguardGesture = "none";
    let stable = 0;
    let emitted: VanguardGesture = "none";
    const detect = () => {
      if (cancelled) return;
      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        try {
          const result = detector!.detectForVideo(video, performance.now());
          const hand = result.landmarks[0];
          const gesture = hand ? classifyVanguardHand(hand) : "none";
          if (gesture === candidate) stable++;
          else {
            candidate = gesture;
            stable = 1;
          }
          if (stable >= 3 && gesture !== emitted) {
            emitted = gesture;
            if (hand?.[8]) onGesture(gesture, hand[8]);
          }
        } catch (error) {
          stop();
          onFailure(error);
          return;
        }
      }
      timer = setTimeout(detect, 50);
    };
    detect();
    return stop;
  } catch (error) {
    stop();
    throw error;
  }
}
