type FlexBox = Record<string, unknown>;

function thaiTime() {
  return new Date().toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function flexRow(label: string, value: string, valueColor = "#0f172a"): FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      { type: "text", text: label, color: "#64748b", size: "sm", flex: 2 },
      {
        type: "text",
        text: value,
        color: valueColor,
        size: "sm",
        weight: "bold",
        align: "end",
        wrap: true,
        flex: 5,
      },
    ],
  };
}

function statusBadge(text: string, bg: string, color: string): FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    backgroundColor: bg,
    cornerRadius: "8px",
    paddingAll: "10px",
    contents: [
      {
        type: "text",
        text,
        color,
        size: "sm",
        weight: "bold",
        align: "center",
        wrap: true,
      },
    ],
  };
}

function orderHeader(title: string, houseNo?: string): FlexBox[] {
  if (!houseNo) {
    return [{ type: "text", text: title, color: "#ffffff", weight: "bold", size: "lg" }];
  }
  return [
    {
      type: "box",
      layout: "horizontal",
      alignItems: "center",
      contents: [
        { type: "text", text: title, color: "#ffffff", weight: "bold", size: "lg", flex: 0 },
        {
          type: "text",
          text: `บ้าน ${houseNo}`,
          color: "#e2e8f0",
          size: "lg",
          weight: "bold",
          align: "end",
          flex: 1,
          gravity: "center",
        },
      ],
    },
  ];
}

function bubble(
  headerContents: FlexBox[],
  headerColor: string,
  bodyRows: FlexBox[],
  badge: FlexBox,
): FlexBox {
  return {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: headerColor,
      paddingAll: "18px",
      contents: headerContents,
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "18px",
      contents: bodyRows,
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "18px",
      paddingTop: "0px",
      contents: [
        badge,
        {
          type: "text",
          text: thaiTime(),
          color: "#94a3b8",
          size: "xs",
          align: "end",
        },
      ],
    },
  };
}

export type LineOrderItem = { name: string; quantity: number };

/** ชื่อสั้นสำหรับคนส่งน้ำ */
export function formatDeliveryItemLabel(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("600")) return "ขนาดกลาง (600ml)";
  if (n.includes("1500")) return "ขนาดใหญ่ (1500ml)";
  return name;
}

function itemRows(lineItems: LineOrderItem[] | undefined, fallback: { itemName: string; quantity: number }): FlexBox[] {
  if (lineItems?.length) {
    return lineItems.map((item) =>
      flexRow(formatDeliveryItemLabel(item.name), `× ${item.quantity} แพ็ค`),
    );
  }
  return [flexRow("รายการ", `${fallback.itemName} × ${fallback.quantity}`)];
}

export function formatDeliveryItemsText(
  lineItems: LineOrderItem[] | undefined,
  fallback: { itemName: string; quantity: number },
): string {
  if (lineItems?.length) {
    return lineItems
      .map((item) => `${formatDeliveryItemLabel(item.name)} × ${item.quantity} แพ็ค`)
      .join("\n");
  }
  return `${fallback.itemName} × ${fallback.quantity}`;
}

export function buildOrderFlexMessage(data: {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  buyerName?: string;
  houseNo?: string;
  lineItems?: LineOrderItem[];
}) {
  const rows: FlexBox[] = [
    flexRow("เลขบิล", `#${data.id}`),
    ...itemRows(data.lineItems, { itemName: data.itemName, quantity: data.quantity }),
    flexRow("ยอด", `${data.amount.toLocaleString("th-TH")} ฿`, "#0f172a"),
  ];
  if (data.buyerName) rows.push(flexRow("ลูกค้า", data.buyerName));

  const itemsSummary = formatDeliveryItemsText(data.lineItems, {
    itemName: data.itemName,
    quantity: data.quantity,
  });
  const altText = `ออเดอร์ใหม่ #${data.id} ${itemsSummary} ${data.amount.toLocaleString("th-TH")} ฿`;

  return {
    type: "flex" as const,
    altText,
    contents: bubble(
      orderHeader("📦  ออเดอร์ใหม่", data.houseNo),
      "#0f172a",
      rows,
      statusBadge("◔  รอชำระเงิน", "#fffbeb", "#b45309"),
    ),
  };
}

export function buildPaymentFlexMessage(data: {
  id: string;
  itemName: string;
  amount: number;
  quantity?: number;
  payerHint?: string | null;
  buyerName?: string;
  houseNo?: string;
  duplicate?: boolean;
  lineItems?: LineOrderItem[];
}) {
  const dup = data.duplicate === true;
  const rows: FlexBox[] = [
    flexRow("เลขบิล", `#${data.id}`),
    ...itemRows(data.lineItems, { itemName: data.itemName, quantity: data.quantity ?? 0 }),
    flexRow("ยอด", `${data.amount.toLocaleString("th-TH")} ฿`, dup ? "#be123c" : "#047857"),
  ];
  if (data.buyerName) rows.push(flexRow("ลูกค้า", data.buyerName));
  if (data.payerHint) rows.push(flexRow("ผู้โอน", data.payerHint));

  const altText = dup
    ? `⚠️ สลิปซ้ำ #${data.id}`
    : `ชำระเงินแล้ว #${data.id} ${data.amount.toLocaleString("th-TH")} ฿`;

  return {
    type: "flex" as const,
    altText,
    contents: bubble(
      orderHeader(dup ? "⚠️  สลิปซ้ำ" : "💳  ชำระเงินแล้ว", data.houseNo),
      dup ? "#9f1239" : "#065f46",
      rows,
      dup
        ? statusBadge("ตรวจสอบด้วยมือ", "#fff1f2", "#be123c")
        : statusBadge("✔  ยืนยันแล้ว", "#ecfdf5", "#047857"),
    ),
  };
}
