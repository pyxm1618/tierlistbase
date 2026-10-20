// Offline deterministic packing of the supplied final WOW SVG masks. Never runs in a browser.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { format, resolveConfig } from "prettier";
const root = "public/wow-forever/vanguard";
const masks = { W1: "w-left", O: "o-center", W2: "w-right" };
await mkdir(`${root}/layouts`, { recursive: true });
const output: Record<string, unknown> = {};
for (const [letter, file] of Object.entries(masks)) {
  const source = await readFile(`${root}/masks/vanguard-mask-${file}.svg`);
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width !== 1672 || info.height !== 941) throw new Error("WOW mask coordinate mismatch");
  const inside = (x: number, y: number) =>
    x >= 0 &&
    y >= 0 &&
    x < 1672 &&
    y < 941 &&
    data[(Math.floor(y) * 1672 + Math.floor(x)) * 4 + 3] === 255;
  let points: [number, number][] = [];
  let spacing = 0;
  for (let step = 400; step >= 40; step--) {
    spacing = step / 20;
    const half = spacing * 0.41;
    points = [];
    for (let y = spacing / 2; y < 941; y += spacing)
      for (let x = spacing / 2; x < 1672; x += spacing) {
        if (
          inside(x, y) &&
          [-half, half].every((dx) => [-half, half].every((dy) => inside(x + dx, y + dy)))
        )
          points.push([x, y]);
      }
    if (points.length >= 2672) break;
  }
  if (points.length < 2672) throw new Error(`Insufficient packing ${letter}`);
  const positions = new Float32Array(2672 * 4);
  for (let i = 0; i < 2672; i++) {
    const [x, y] = points[Math.floor((i * points.length) / 2672)]!;
    positions.set([(x - 836) / 10, (470.5 - y) / 10, 0, 0], i * 4);
    if (!inside(positions[i * 4]! * 10 + 836, 470.5 - positions[i * 4 + 1]! * 10))
      throw new Error("Float32 coordinate left mask");
  }
  const bytes = Buffer.from(positions.buffer);
  const hash = createHash("sha256").update(bytes).digest("hex");
  await writeFile(`${root}/layouts/wow-${letter}.f32`, bytes);
  output[letter] = {
    count: 2672,
    scale: (spacing * 0.82) / 10,
    spacing,
    sha256: hash,
    maskSha256: createHash("sha256").update(source).digest("hex"),
    coordinateSystem: { width: 1672, height: 941, worldDivisor: 10, origin: [836, 470.5] },
    ordering: "row-major; deterministic evenly distributed subset",
  };
}
await writeFile(
  `${root}/layouts/wow-layout.json`,
  await format(JSON.stringify(output), {
    ...(await resolveConfig("package.json")),
    parser: "json",
  }),
);
console.log(JSON.stringify(output));
