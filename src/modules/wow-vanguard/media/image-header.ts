import { VanguardError } from "../domain/event";
export function vanguardImageHeader(bytes: Buffer) {
  const invalid = () => {
    throw new VanguardError("MEDIA_FORMAT_INVALID", 422);
  };
  if (bytes.length < 12) throw new VanguardError("MEDIA_DECODE_FAILED", 422);
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    if (bytes.length < 33 || bytes.toString("ascii", 12, 16) !== "IHDR") return invalid();
    for (let offset = 8; offset + 12 <= bytes.length; ) {
      const size = bytes.readUInt32BE(offset);
      if (size > bytes.length - offset - 12) return invalid();
      if (bytes.toString("ascii", offset + 4, offset + 8) === "acTL") return invalid();
      offset += size + 12;
    }
    return { mime: "image/png", width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset++] !== 255) return invalid();
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || marker === 216) continue;
      if (offset + 2 > bytes.length) return invalid();
      const size = bytes.readUInt16BE(offset);
      if (size < 2 || size > bytes.length - offset) return invalid();
      if (
        marker !== undefined &&
        [192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)
      ) {
        if (size < 8) return invalid();
        return {
          mime: "image/jpeg",
          width: bytes.readUInt16BE(offset + 5),
          height: bytes.readUInt16BE(offset + 3),
        };
      }
      offset += size;
    }
    return invalid();
  }
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    if (bytes.readUInt32LE(4) + 8 !== bytes.length) return invalid();
    for (let offset = 12; offset + 8 <= bytes.length; ) {
      const size = bytes.readUInt32LE(offset + 4);
      const start = offset + 8;
      if (size > bytes.length - start) return invalid();
      const type = bytes.toString("ascii", offset, offset + 4);
      if (type === "VP8X") {
        if (size < 10 || bytes[start]! & 2) return invalid();
        return {
          mime: "image/webp",
          width: bytes.readUIntLE(start + 4, 3) + 1,
          height: bytes.readUIntLE(start + 7, 3) + 1,
        };
      }
      if (type === "VP8L") {
        if (size < 5 || bytes[start] !== 47) return invalid();
        const packed = bytes.readUInt32LE(start + 1);
        return {
          mime: "image/webp",
          width: (packed & 0x3fff) + 1,
          height: ((packed >>> 14) & 0x3fff) + 1,
        };
      }
      if (type === "VP8 ") {
        if (size < 10 || bytes.toString("hex", start + 3, start + 6) !== "9d012a") return invalid();
        return {
          mime: "image/webp",
          width: bytes.readUInt16LE(start + 6) & 0x3fff,
          height: bytes.readUInt16LE(start + 8) & 0x3fff,
        };
      }
      offset = start + size + (size & 1);
    }
  }
  return invalid();
}
export function stripVanguardWebpMetadata(bytes: Buffer) {
  const chunks: Buffer[] = [];
  for (let offset = 12; offset + 8 <= bytes.length; ) {
    const size = bytes.readUInt32LE(offset + 4);
    const type = bytes.toString("ascii", offset, offset + 4);
    const end = offset + 8 + size + (size & 1);
    if (end > bytes.length) throw new VanguardError("MEDIA_FORMAT_INVALID", 422);
    if (["VP8X", "VP8 ", "VP8L", "ALPH"].includes(type)) {
      const chunk = Buffer.from(bytes.subarray(offset, end));
      if (type === "VP8X") chunk[8] = chunk[8]! & ~(32 | 8 | 4);
      chunks.push(chunk);
    }
    offset = end;
  }
  const payload = Buffer.concat([Buffer.from("WEBP"), ...chunks]);
  const header = Buffer.alloc(8);
  header.write("RIFF");
  header.writeUInt32LE(payload.length, 4);
  return Buffer.concat([header, payload]);
}
