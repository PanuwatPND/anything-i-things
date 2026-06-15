type Body = {
  id: string;
  itemName: string;
  amount: number;
  payerHint?: string | null;
  buyerName?: string;
};

export default defineEventHandler(async (event) => {
  const b = await readBody<Body>(event);

  const lines = [
    `💸 <b>ชำระเงินแล้ว!</b>`,
    ``,
    `🔖 บิล #${b.id} · ${b.itemName}`,
    `💰 ยอด <b>${b.amount.toLocaleString("th-TH")} ฿</b>`,
    b.buyerName ? `👤 ${b.buyerName}` : null,
    b.payerHint ? `🏦 ผู้โอน: ${b.payerHint}` : null,
    ``,
    `🕐 ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegram(lines);
  return { ok: true };
});
