type Body = {
  id: string;
  itemName: string;
  amount: number;
  payerHint?: string | null;
  buyerName?: string;
};

/** in-memory cache — key = "amount:payerKey", value = timestamp ms */
const paidCache = new Map<string, number>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function cacheKey(amount: number, payerHint: string | null | undefined): string {
  const payer = (payerHint ?? "").toLowerCase().replace(/\s+/g, "");
  return `${Math.round(amount)}:${payer}`;
}

function isDuplicate(key: string): boolean {
  const ts = paidCache.get(key);
  if (!ts) return false;
  return Date.now() - ts < CACHE_TTL_MS;
}

function sweepCache() {
  const cutoff = Date.now() - CACHE_TTL_MS;
  for (const [k, t] of paidCache) {
    if (t < cutoff) paidCache.delete(k);
  }
}

const SEP = "─────────────────";

function thaiTime() {
  return new Date().toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function row(label: string, value: string) {
  return `${label.padEnd(6, " ")}${value}`;
}

export default defineEventHandler(async (event) => {
  const b = await readBody<Body>(event);

  sweepCache();
  const key = cacheKey(b.amount, b.payerHint);
  const duplicate = isDuplicate(key);
  if (!duplicate) paidCache.set(key, Date.now());

  const statusText = duplicate
    ? "⚠️ <b>สลิปซ้ำ — ตรวจด้วยมือ</b>"
    : "✅ ชำระเงินแล้ว";

  const header = duplicate ? `⚠️ <b>สลิปซ้ำ!</b>` : `💳 <b>ชำระเงินแล้ว</b>`;

  const lines = [
    header,
    SEP,
    row("บิล", `#${b.id}`),
    row("รายการ", b.itemName),
    row("ยอด", `<b>${b.amount.toLocaleString("th-TH")} ฿</b>`),
    b.buyerName ? row("ลูกค้า", b.buyerName) : null,
    b.payerHint ? row("ผู้โอน", b.payerHint) : null,
    row("สถานะ", statusText),
    SEP,
    `🕐 ${thaiTime()}`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegram(lines);
  return { ok: true, duplicate };
});
