import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

/** เบอร์ PromptPay (ตัวเลขอย่างเดียว) */
export const PROMPTPAY_PHONE = "0952367130";

export const PROMPTPAY_DISPLAY = "095-236-7130";

export async function promptPayQrDataUrl(
  amount: number,
  phone = PROMPTPAY_PHONE,
): Promise<string> {
  const payload = generatePayload(phone, { amount });
  return QRCode.toDataURL(payload, {
    width: 280,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}
