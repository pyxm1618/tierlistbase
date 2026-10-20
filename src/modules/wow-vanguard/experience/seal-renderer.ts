import QRCode from "qrcode";
import { parseSeatId } from "../domain/event";
import type { SealInput, SealRenderer, VanguardAssets } from "../client/contracts";

export function sealTextLines(
  text: string,
  maxWidth: number,
  measure: (text: string) => number,
  maxLines: number,
) {
  const lines: string[] = [];
  let line = "";
  for (const char of text) {
    if (line && measure(line + char) > maxWidth) {
      lines.push(line);
      line = "";
    }
    line += char;
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const result = lines.slice(0, maxLines);
  let last = result.at(-1)!;
  while (last && measure(last + "…") > maxWidth) last = [...last].slice(0, -1).join("");
  result[maxLines - 1] = last + "…";
  return result;
}
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Seal image unavailable"));
    image.src = src;
  });
}
export function createVanguardSealRenderer(assets: VanguardAssets): SealRenderer {
  return {
    async render(input: SealInput, format: "9:16" | "1:1") {
      const story = format === "9:16";
      const source = story ? assets.seal.portrait : assets.seal.square;
      const hero = assets.hero[input.seatId.startsWith("WOW-") ? "wow" : "forever"];
      const emblem = assets.emblems[input.className];
      if (!source || !hero || !emblem) throw new Error("Final Seal assets unavailable");
      const canvas = document.createElement("canvas");
      canvas.width = story ? 1080 : 1254;
      canvas.height = story ? 1920 : 1254;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      // Slot coordinates measured from the unchanged supplied templates (941x1672 / 1254x1254).
      const sx = canvas.width / (story ? 941 : 1254),
        sy = canvas.height / (story ? 1672 : 1254);
      ctx.scale(sx, sy);
      ctx.drawImage(await loadImage(source), 0, 0, story ? 941 : 1254, story ? 1672 : 1254);
      let memory: HTMLImageElement;
      try {
        memory = await loadImage(input.image?.detail ?? emblem);
      } catch {
        memory = await loadImage(emblem);
      }
      const portrait = story ? [370, 612, 200, 176] : [176, 136, 226, 194];
      // Fit without distorting the approved square image; retain the supplied frame.
      const side = Math.min(portrait[2]!, portrait[3]!);
      ctx.drawImage(memory, portrait[0]! + (portrait[2]! - side) / 2, portrait[1]!, side, side);
      const text = (
        value: string,
        x: number,
        y: number,
        width: number,
        size: number,
        lines = 1,
      ) => {
        ctx.fillStyle = "#f3dfba";
        ctx.textBaseline = "top";
        let fontSize = size;
        let fitted: string[] = [];
        do {
          ctx.font = `${fontSize}px Georgia, serif`;
          fitted = sealTextLines(value, width, (t) => ctx.measureText(t).width, lines);
          if (fitted.join("") === value || fontSize <= 10) break;
          fontSize--;
        } while (true);
        fitted.forEach((line, i) => ctx.fillText(line, x, y + i * (fontSize + 5)));
      };
      const x = story ? 235 : 190,
        width = story ? 560 : 382;
      text(input.displayName, x, story ? 877 : 473, width, story ? 30 : 27, 2);
      text(input.seatId, x, story ? 962 : 570, width, story ? 23 : 20);
      text(
        input.faction === "alliance" ? "Alliance" : "Horde",
        story ? 185 : 166,
        story ? 1056 : 676,
        story ? 610 : 390,
        25,
      );
      text(input.className, story ? 185 : 166, story ? 1138 : 770, story ? 610 : 390, 25);
      text(input.guildName ?? "—", story ? 185 : 166, story ? 1210 : 850, story ? 610 : 390, 17, 2);
      if (story) text(input.battleCry ?? "", 150, 1305, 650, 22, 3);
      else text(new Date(input.inscribedAt).toISOString().slice(0, 10), 150, 978, 375, 21);
      if (story)
        text(
          `Inscribed ${new Date(input.inscribedAt).toISOString().slice(0, 10)}`,
          135,
          1380,
          600,
          18,
        );
      const location = story ? [82, 1440, 555, 140] : [614, 944, 354, 176];
      ctx.drawImage(await loadImage(hero.src), ...(location as [number, number, number, number]));
      const identity = parseSeatId(input.seatId);
      const layoutUrl = assets.layouts[`${identity.phase}:${identity.letter}`];
      if (!layoutUrl) throw new Error("Seal location layout unavailable");
      const response = await fetch(layoutUrl, { cache: "force-cache" });
      if (!response.ok) throw new Error("Seal location layout unavailable");
      const positions = new Float32Array(await response.arrayBuffer());
      const offset = (identity.localIndex - 1) * 4;
      if (positions.length !== (identity.phase === "wow" ? 2672 : 8016) * 4)
        throw new Error("Seal location layout invalid");
      const px = (positions[offset]! * 10 + 836) / 1672,
        py = (470.5 - positions[offset + 1]! * 10) / 941;
      ctx.fillStyle = "#fff5b0";
      ctx.strokeStyle = "#09101b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        location[0]! + px * location[2]!,
        location[1]! + py * location[3]!,
        5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.stroke();
      text(
        input.monumentLocation,
        location[0]! + 6,
        location[1]! + location[3]! - 24,
        location[2]! - 12,
        17,
      );
      const qr = document.createElement("canvas");
      await QRCode.toCanvas(qr, input.qrPayload, {
        errorCorrectionLevel: "M",
        margin: 4,
        width: 320,
      });
      const qrSlot = story ? [721, 1455, 110] : [1050, 972, 130];
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qr, qrSlot[0]!, qrSlot[1]!, qrSlot[2]!, qrSlot[2]!);
      ctx.imageSmoothingEnabled = true;
      text(
        input.disclaimer,
        story ? 255 : 400,
        story ? 1622 : 1173,
        story ? 450 : 510,
        story ? 18 : 21,
      );
      return await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Seal encoding failed"))),
          "image/png",
        ),
      );
    },
  };
}
