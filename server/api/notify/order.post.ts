type Body = {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  buyerName?: string;
  houseNo?: string;
};

export default defineEventHandler(async (event) => {
  const b = await readBody<Body>(event);

  const lines = [
    `📦 <b>ออเดอร์ใหม่!</b>`,
    ``,
    `🛒 ${b.itemName}`,
    `📊 จำนวน ${b.quantity} ชิ้น`,
    `💰 ยอด <b>${b.amount.toLocaleString("th-TH")} ฿</b>`,
    `🔖 บิล #${b.id}`,
    b.buyerName ? `👤 ${b.buyerName}` : null,
    b.houseNo ? `🏠 บ้าน ${b.houseNo}` : null,
    ``,
    `🕐 ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegram(lines);
  return { ok: true };
});
