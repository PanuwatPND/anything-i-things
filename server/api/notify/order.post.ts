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
  return `${label.padEnd(6, " ")}${value}`;
}

async function getNotifySettings(event: Parameters<typeof serverSupabase>[0]) {
  const sb = serverSupabase(event);
  const { data } = await sb.from("settings").select("key, value");
  const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  return {
    telegram: map["notify_telegram"] !== "false",
    line: map["notify_line"] === "true",
    lineRecipients: lineRecipientsFromSettings(map),
  };
}

export default defineEventHandler(async (event) => {
  const b = await readBody<Body>(event);

  const tgText = [
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

  const lineText = [
    `📦 ออเดอร์ใหม่${b.houseNo ? `  ${b.houseNo}` : ""}`,
    SEP,
    `รายการ  ${b.itemName} × ${b.quantity}`,
    `ยอด     ${b.amount.toLocaleString("th-TH")} ฿`,
    b.buyerName ? `ลูกค้า  ${b.buyerName}` : null,
    `สถานะ  ◔ รอชำระเงิน`,
    SEP,
    `⏲ ${thaiTime()}`,
  ]
    .filter(Boolean)
    .join("\n");

  const settings = await getNotifySettings(event).catch(() => ({
    telegram: true,
    line: false,
    lineRecipients: [] as string[],
  }));

  await Promise.all([
    settings.telegram ? sendTelegram(tgText) : Promise.resolve(),
    settings.line ? sendLine(lineText, settings.lineRecipients) : Promise.resolve(),
  ]);

  return { ok: true };
});
