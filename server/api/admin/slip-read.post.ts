/**
 * อ่านข้อมูลจากภาพสลิปด้วย Gemini Vision (API key อยู่ที่เซิร์ฟเวอร์เท่านั้น)
 *
 * ตั้งค่า: NUXT_GEMINI_API_KEY ใน .env (คีย์จาก Google AI Studio)
 * โมเดล (ถ้าต้องการ): NUXT_GEMINI_MODEL เช่น gemini-2.5-flash
 */

type SlipReadBody = {
  imageBase64?: string;
  mimeType?: string;
  orderAmountHint?: number;
};

type ParsedSlip = {
  amountBaht: number | null;
  payerHint: string | null;
  confidence: number;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string; code?: number };
};

/** ~600 KB หลัง base64 — ฝั่ง client ควรย่อรูปก่อนส่งแล้ว */
const MAX_IMAGE_CHARS = 900_000;

/** บังคับให้ Gemini ตอบเป็น JSON ตาม schema (ลดกรณีตอบเป็นข้อความ/ markdown) */
const SLIP_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    amountBaht: {
      type: "number",
      nullable: true,
      description: "ยอดโอนเป็นบาท หรือ null ถ้าอ่านไม่ชัด",
    },
    payerHint: {
      type: "string",
      nullable: true,
      description: "ชื่อผู้โอน/บัญชี หรือ null",
    },
    confidence: {
      type: "number",
      description: "ความมั่นใจ 0-100",
    },
  },
  required: ["amountBaht", "payerHint", "confidence"],
} as const;

function sanitizeGeminiErrorMessage(raw: string): string {
  return raw
    .replace(/key=AIza[\w-]+/gi, "key=[redacted]")
    .slice(0, 400);
}

function geminiRateLimitMessage(): string {
  return "Gemini ใช้งานเกินโควต้า (429) — รอ 1–2 นาทีแล้วลองอีกครั้ง (ห้ามกดซ้ำเร็วๆ) หรือดู Usage ใน Google AI Studio";
}

function fetchErrorStatus(err: unknown): number {
  if (err && typeof err === "object" && "statusCode" in err) {
    const n = Number((err as { statusCode?: number }).statusCode);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function stripJsonFence(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "");
  }
  return t.trim();
}

/** ดึง object แรกจากข้อความ (กรณีมีคำอธิบายก่อน/หลัง JSON) */
function extractJsonPayload(text: string): string | null {
  const stripped = stripJsonFence(text);
  try {
    JSON.parse(stripped);
    return stripped;
  } catch {
    /* continue */
  }

  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start < 0 || end <= start) return null;

  const slice = stripped.slice(start, end + 1);
  try {
    JSON.parse(slice);
    return slice;
  } catch {
    return null;
  }
}

function parseSlipJson(text: string): ParsedSlip | null {
  const payload = extractJsonPayload(text);
  if (!payload) return null;

  try {
    const obj = JSON.parse(payload) as Record<string, unknown>;
    const amountRaw = obj.amountBaht;
    let amountBaht: number | null = null;
    if (typeof amountRaw === "number" && Number.isFinite(amountRaw)) {
      amountBaht = Math.round(amountRaw * 100) / 100;
    } else if (typeof amountRaw === "string" && amountRaw.trim()) {
      const n = Number.parseFloat(amountRaw.replace(/,/g, ""));
      if (Number.isFinite(n)) amountBaht = Math.round(n * 100) / 100;
    }

    const payerRaw = obj.payerHint;
    let payerHint: string | null = null;
    if (typeof payerRaw === "string" && payerRaw.trim()) {
      payerHint = payerRaw.trim().slice(0, 240);
    }

    let confidence = Number(obj.confidence);
    if (!Number.isFinite(confidence)) confidence = 0;
    confidence = Math.min(100, Math.max(0, confidence));

    return { amountBaht, payerHint, confidence };
  } catch {
    return null;
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiKey = String(config.geminiApiKey ?? "").trim();
  const model = String(config.geminiModel ?? "gemini-2.5-flash").trim();

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage:
        "ยังไม่ได้ตั้งค่า Gemini API — เพิ่ม NUXT_GEMINI_API_KEY ใน .env",
    });
  }

  let body: SlipReadBody = {};
  try {
    body = await readBody<SlipReadBody>(event);
  } catch {
    body = {};
  }

  const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
  const mimeType =
    typeof body.mimeType === "string" && body.mimeType.trim()
      ? body.mimeType.trim().slice(0, 80)
      : "image/jpeg";

  if (!imageBase64 || imageBase64.length > MAX_IMAGE_CHARS) {
    throw createError({
      statusCode: 400,
      statusMessage: imageBase64
        ? "รูปใหญ่เกินไปสำหรับ OCR — ลองถ่ายใหม่หรือครอปให้เล็กลง"
        : "รูปภาพไม่ถูกต้อง",
    });
  }

  const hint =
    typeof body.orderAmountHint === "number" &&
    Number.isFinite(body.orderAmountHint) &&
    body.orderAmountHint > 0
      ? body.orderAmountHint
      : null;

  const hintLine =
    hint != null
      ? `ยอดในระบบของใบเสร็จนี้ประมาณ ${hint} บาท — ใช้เป็นแค่คำใบ้เทียบกับตัวเลขบนสลิปเท่านั้น`
      : "ไม่มียอดในระบบเป็นตัวช่วย — ให้อ่านจากภาพอย่างระมัดระวัง";

  const prompt = `อ่านสลิปโอนเงินไทย (พร้อมเพย์ / ธนาคาร / PromptPay) จากภาพ

${hintLine}

กติกา:
- amountBaht = ยอดโอนหลักเป็นบาท (ตัวเลขเดียว) ถ้าไม่ชัดให้ null
- payerHint = ชื่อผู้โอน/บัญชี/เลขท้ายบัญชี ถ้าไม่มีให้ null
- confidence = 0–100`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const geminiBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 256,
      responseMimeType: "application/json",
      responseSchema: SLIP_RESPONSE_SCHEMA,
    },
  };

  let apiJson: GeminiGenerateResponse;
  try {
    apiJson = await $fetch<GeminiGenerateResponse>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: geminiBody,
    });
  } catch (err: unknown) {
    const status = fetchErrorStatus(err);
    const raw =
      err instanceof Error
        ? err.message
        : typeof err === "object" &&
            err &&
            "statusMessage" in err &&
            typeof (err as { statusMessage?: unknown }).statusMessage === "string"
          ? (err as { statusMessage: string }).statusMessage
          : "เรียก Gemini ไม่สำเร็จ";

    if (status === 429 || /429|too many requests/i.test(raw)) {
      throw createError({
        statusCode: 429,
        statusMessage: geminiRateLimitMessage(),
      });
    }

    throw createError({
      statusCode: 502,
      statusMessage: sanitizeGeminiErrorMessage(raw),
    });
  }

  if (apiJson.error?.message) {
    throw createError({
      statusCode: 502,
      statusMessage: apiJson.error.message.slice(0, 400),
    });
  }

  const c0 = apiJson.candidates?.[0];
  const finish = c0?.finishReason;
  if (finish === "MAX_TOKENS") {
    throw createError({
      statusCode: 502,
      statusMessage: "คำตอบจาก Gemini ไม่ครบ (ถูกตัด) — ลองอัปโหลดใหม่",
    });
  }
  if (finish === "SAFETY" || finish === "RECITATION") {
    throw createError({
      statusCode: 502,
      statusMessage: `Gemini ปฏิเสธการตอบ (${finish})`,
    });
  }

  const parts = c0?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("").trim();

  if (!text) {
    throw createError({
      statusCode: 502,
      statusMessage: "Gemini ไม่ส่งข้อความกลับมา",
    });
  }

  const parsed = parseSlipJson(text);
  if (!parsed) {
    const preview = text.replace(/\s+/gu, " ").slice(0, 100);
    throw createError({
      statusCode: 502,
      statusMessage: import.meta.dev
        ? `แปลง JSON ไม่ได้ — ได้รับ: ${preview}${text.length > 100 ? "…" : ""}`
        : "แปลงผลจาก Gemini เป็น JSON ไม่ได้ — ลองอัปโหลดสลิปใหม่",
    });
  }

  return parsed;
});
