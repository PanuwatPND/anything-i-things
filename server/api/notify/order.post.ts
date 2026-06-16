type Body = {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  buyerName?: string;
  houseNo?: string;
};

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
  return `${label.padEnd(6, " ")}${value}`;
}

export default defineEventHandler(async (event) => {
  const b = await readBody<Body>(event);

  const lines = [
    b.houseNo ? `📦 <b>ออเดอร์ใหม่</b>                       ${b.houseNo}` : `📦 <b>ออเดอร์ใหม่</b>`,
    SEP,
    row("รายการ", `${b.itemName} × ${b.quantity}`),
    row("ยอด", `<b>${b.amount.toLocaleString("th-TH")} ฿</b>`),
    b.buyerName ? row("ลูกค้า", b.buyerName) : null,
    row("สถานะ", "◔ รอชำระเงิน"),
    SEP,
    `⏲ ${thaiTime()}`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegram(lines);
  return { ok: true };
});
