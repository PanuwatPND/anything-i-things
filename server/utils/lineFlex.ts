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

function bubble(headerTitle: string, headerSub: string | undefined, headerColor: string, bodyRows: FlexBox[], badge: FlexBox): FlexBox {
  const headerContents: FlexBox[] = [
    {
      type: "text",
      text: headerTitle,
      color: "#ffffff",
      weight: "bold",
      size: "lg",
    },
  ];
  if (headerSub) {
    headerContents.push({
      type: "text",
      text: headerSub,
      color: "#cbd5e1",
      size: "xs",
      margin: "sm",
    });
  }

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

export function buildOrderFlexMessage(data: {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  buyerName?: string;
  houseNo?: string;
}) {
  const rows: FlexBox[] = [
    flexRow("เลขบิล", `#${data.id}`),
    flexRow("รายการ", `${data.itemName} × ${data.quantity}`),
    flexRow("ยอด", `${data.amount.toLocaleString("th-TH")} ฿`, "#0f172a"),
  ];
  if (data.buyerName) rows.push(flexRow("ลูกค้า", data.buyerName));

  const altText = `ออเดอร์ใหม่ #${data.id} ${data.amount.toLocaleString("th-TH")} ฿`;

  return {
    type: "flex" as const,
    altText,
    contents: bubble(
      "📦  ออเดอร์ใหม่",
      data.houseNo ? `บ้าน ${data.houseNo}` : undefined,
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
  payerHint?: string | null;
  buyerName?: string;
  houseNo?: string;
  duplicate?: boolean;
}) {
  const dup = data.duplicate === true;
  const rows: FlexBox[] = [
    flexRow("เลขบิล", `#${data.id}`),
    flexRow("รายการ", data.itemName),
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
      dup ? "⚠️  สลิปซ้ำ" : "💳  ชำระเงินแล้ว",
      data.houseNo ? `บ้าน ${data.houseNo}` : undefined,
      dup ? "#9f1239" : "#065f46",
      rows,
      dup
        ? statusBadge("ตรวจสอบด้วยมือ", "#fff1f2", "#be123c")
        : statusBadge("✔  ยืนยันแล้ว", "#ecfdf5", "#047857"),
    ),
  };
}
