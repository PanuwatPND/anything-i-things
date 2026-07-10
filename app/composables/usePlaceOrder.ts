import {
  type BillStatusCode,
  type WatershopReceipt,
} from "~/composables/useWatershopReceipts";
import { useLocalWatershop, getPackPrice } from "~/composables/useLocalWatershop";

export type OrderLine = { id: string; name: string; quantity: number };

export function usePlaceOrder() {
  const router = useRouter();
  const { formatInt } = useFormatNumber();
  const { user } = useAuth();
  const { confirm } = useAlertDialog();
  const { success } = useToast();
  const { addReceipt } = useWatershopReceipts();
  const { items, cartItems, placeOrder, ensureCatalog, clearCart, totalAmount } =
    useLocalWatershop();

  const assertStock = (lines: OrderLine[]) => {
    ensureCatalog();
    for (const line of lines) {
      const stockItem = items.value.find((item) => item.id === line.id);
      if (!stockItem) throw new Error(`ไม่พบสินค้า ${line.name}`);
      if (stockItem.stock < line.quantity) {
        throw new Error(`สต็อก ${line.name} ไม่พอ`);
      }
    }
  };

  const buildReceipt = (
    lines: OrderLine[],
    status: BillStatusCode,
    amount: number,
    totalQty: number,
  ): WatershopReceipt => {
    const summaryName =
      lines.length === 1
        ? lines[0]!.name
        : `ออเดอร์รวม ${formatInt(lines.length)} รายการ`;
    const lineItems = lines.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    }));

    return {
      id: `${Date.now()}${Math.floor(Math.random() * 100)}`.slice(-6),
      itemName: summaryName,
      quantity: totalQty,
      amount,
      createdAt: new Date().toISOString(),
      status,
      lineItems,
    };
  };

  const notifyOrder = (receipt: WatershopReceipt) => {
    $fetch("/api/notify/order", {
      method: "POST",
      body: {
        id: receipt.id,
        itemName: receipt.itemName,
        quantity: receipt.quantity,
        amount: receipt.amount,
        buyerName: user.value?.name,
        houseNo: user.value?.houseNo,
        lineItems: receipt.lineItems,
        payLater: receipt.status === "pay_later",
      },
    }).catch(() => {});
  };

  const submitLines = async (
    lines: OrderLine[],
    status: BillStatusCode,
    options?: { clearCart?: boolean },
  ) => {
    if (!user.value?.houseNo?.trim() && status === "pay_later") {
      throw new Error("กรุณาระบุบ้านเลขที่ในโปรไฟล์ก่อนสั่งด่วน");
    }

    assertStock(lines);

    for (const line of lines) {
      placeOrder(line.id, line.quantity);
    }

    const totalQty = lines.reduce((sum, line) => sum + line.quantity, 0);
    const amount = getPackPrice(totalQty);
    const receipt = buildReceipt(lines, status, amount, totalQty);
    addReceipt(receipt);
    notifyOrder(receipt);

    if (options?.clearCart) clearCart();

    return receipt;
  };

  const checkoutCart = async (status: BillStatusCode) => {
    const lines: OrderLine[] = cartItems.value.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
    }));

    if (lines.length === 0) return;

    const isPayLater = status === "pay_later";
    const confirmed = await confirm({
      title: isPayLater ? "สั่งด่วน" : "ยืนยันการสั่งซื้อ",
      description: isPayLater
        ? `รอจัดส่งก่อน · ชำระ ${formatInt(totalAmount.value)} ฿ ทีหลัง`
        : `ออเดอร์ ${formatInt(lines.length)} รายการ · ${formatInt(totalAmount.value)} ฿`,
      confirmText: isPayLater ? "สั่งด่วน" : "ยืนยัน",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    const receipt = await submitLines(lines, status, { clearCart: true });

    if (isPayLater) {
      success("สั่งด่วนแล้ว", "รอจัดส่ง — ชำระเงินทีหลังได้ที่หน้าบิล");
      await router.push("/user/bills");
    } else {
      success("สั่งซื้อสำเร็จ", "กรุณาชำระเงินและแนบสลิป");
      await router.push(`/user/payment?id=${receipt.id}`);
    }
  };

  return {
    checkoutCart,
    submitLines,
    totalAmount,
  };
}
