// Offline validation/conversion of user-supplied FINAL layouts. No repacking or public serials.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { z } from "zod";
import sharp from "sharp";
import { format, resolveConfig } from "prettier";
const root = "public/wow-forever/vanguard";
const inputs = "docs/wow-forever-vanguard/implementation/seat-layout";
const seatSchema = z.object({
  id: z.number().int().positive(),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  width: z.literal(4),
  height: z.literal(4),
});
const schema = z.object({
  status: z.literal("FINAL"),
  letters: z.record(
    z.string(),
    z.object({ maskFile: z.string(), seatCount: z.number().int(), seats: z.array(seatSchema) }),
  ),
});
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const sources = [
  {
    phase: "wow",
    file: "vanguard-seat-layout-8016-final.json",
    width: 1672,
    height: 941,
    scale: 1,
    count: 2672,
    firstId: 1,
    keys: { w_left: "W1", o_center: "O", w_right: "W2" },
  },
  {
    phase: "forever",
    file: "vanguard-forever-seat-layout-56112.json",
    width: 1774,
    height: 887,
    scale: 4,
    count: 8016,
    firstId: 8017,
    keys: { f: "F", o: "O", r1: "R1", e1: "E1", v: "V", e2: "E2", r2: "R2" },
  },
];
let total = 0;
for (const source of sources) {
  const raw = await readFile(`${inputs}/${source.file}`);
  const supplied = JSON.parse(raw.toString());
  const layout = schema.parse(supplied);
  if (
    source.phase === "wow"
      ? supplied.canvas?.width !== source.width || supplied.canvas?.height !== source.height
      : supplied.logicalScale !== source.scale ||
        supplied.logicalMaster?.width !== source.width * source.scale ||
        supplied.logicalMaster?.height !== source.height * source.scale ||
        JSON.stringify(supplied.sourceViewBox) !==
          JSON.stringify([0, 0, source.width, source.height])
  )
    throw new Error("Supplied layout coordinate metadata mismatch");
  if (Object.keys(layout.letters).length !== Object.keys(source.keys).length)
    throw new Error("Unexpected layout groups");
  const occupied = new Uint8Array(source.width * source.scale * source.height * source.scale);
  const metadata: Record<string, unknown> = {};
  let ordinal = 0;
  for (const [key, letter] of Object.entries(source.keys)) {
    const group = layout.letters[key];
    if (!group || group.seatCount !== source.count || group.seats.length !== source.count)
      throw new Error(`Invalid capacity ${source.phase}:${key}`);
    if (!/^vanguard-mask-[a-z0-9-]+\.svg$/.test(group.maskFile))
      throw new Error("Invalid mask filename");
    const mask = await readFile(`${root}/masks/${group.maskFile}`);
    const { data, info } = await sharp(mask, { density: 72 * source.scale })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const width = source.width * source.scale,
      height = source.height * source.scale;
    if (info.width !== width || info.height !== height)
      throw new Error("Mask/hero coordinate mismatch");
    const positions = new Float32Array(source.count * 4);
    for (const [index, seat] of group.seats.entries()) {
      if (seat.id !== source.firstId + ordinal * source.count + index)
        throw new Error("Unstable supplied row order / ID range");
      if (seat.x + 4 > width || seat.y + 4 > height) throw new Error("Out-of-bounds Seat");
      for (let y = seat.y; y < seat.y + 4; y++)
        for (let x = seat.x; x < seat.x + 4; x++) {
          const pixel = y * width + x;
          if (data[pixel * 4 + 3] !== 255)
            throw new Error(
              `Incomplete rectangle containment ${source.phase}:${letter}:${index + 1}`,
            );
          if (occupied[pixel]) throw new Error("Overlapping Seat rectangles");
          occupied[pixel] = 1;
        }
      positions.set(
        [
          ((seat.x + 2) / source.scale - source.width / 2) / 10,
          (source.height / 2 - (seat.y + 2) / source.scale) / 10,
          0,
          0,
        ],
        index * 4,
      );
    }
    const bytes = Buffer.from(positions.buffer);
    await writeFile(`${root}/layouts/${source.phase}-${letter}.f32`, bytes);
    metadata[letter] = {
      count: source.count,
      scale: 4 / source.scale / 10,
      sha256: hash(bytes),
      maskFile: group.maskFile,
      maskSha256: hash(mask),
      sourceLayout: source.file,
      sourceSha256: hash(raw),
      coordinateSystem: {
        width: source.width,
        height: source.height,
        logicalScale: source.scale,
        worldDivisor: 10,
        origin: [source.width / 2, source.height / 2],
      },
      ordering: "supplied FINAL array order; public local index = row + 1",
    };
    ordinal++;
    total += source.count;
  }
  await writeFile(
    `${root}/layouts/${source.phase}-layout.json`,
    await format(JSON.stringify(metadata), {
      ...(await resolveConfig("package.json")),
      parser: "json",
    }),
  );
}
if (total !== 64128) throw new Error("Invalid final Monument capacity");
console.log(
  JSON.stringify({
    wow: 8016,
    forever: 56112,
    total,
    fullRectangleContainmentFailures: 0,
    overlapPixels: 0,
  }),
);
