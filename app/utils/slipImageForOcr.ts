/** ย่อรูปก่อนส่ง Gemini — ลดโควต้า token (TPM) และขนาด payload */
export const SLIP_OCR_MAX_EDGE = 1280;
export const SLIP_OCR_JPEG_QUALITY = 0.82;

export type SlipImageParts = { mimeType: string; base64: string };

export function parseDataUrlBase64(dataUrl: string): SlipImageParts | null {
  const m = /^data:([^;,]+);base64,(.+)$/s.exec(dataUrl);
  if (!m?.[1] || m[2] == null) return null;
  return {
    mimeType: m[1].trim(),
    base64: m[2].trim().replace(/\s+/gu, ""),
  };
}

export async function slipImagePartsForOcr(
  file: File,
): Promise<SlipImageParts | null> {
  if (!import.meta.client || !file.type.startsWith("image/")) return null;

  try {
    const bitmap = await createImageBitmap(file);
    const longEdge = Math.max(bitmap.width, bitmap.height);
    const scale =
      longEdge > SLIP_OCR_MAX_EDGE ? SLIP_OCR_MAX_EDGE / longEdge : 1;
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return null;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    return parseDataUrlBase64(
      canvas.toDataURL("image/jpeg", SLIP_OCR_JPEG_QUALITY),
    );
  } catch {
    return null;
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("read failed"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}
