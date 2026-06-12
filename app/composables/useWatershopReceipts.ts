export const RECEIPTS_STORAGE_KEY = "watershop-receipts";

export type BillStatusCode =
  | "pending"
  | "paid"
  | "shipping"
  | "delivered"
  | "cancelled";

export const BILL_STATUS_LABEL: Record<BillStatusCode, string> = {
  pending: "รอชำระ",
  paid: "ชำระแล้ว",
  shipping: "กำลังจัดส่ง",
  delivered: "จัดส่งสำเร็จ",
  cancelled: "ยกเลิก",
};

/** ข้อมูลการตรวจสลิป — ยอดอาจมาจาก Gemini Vision หรือพิมพ์มือ */
export type SlipVerification = {
  amountOnSlip?: number;
  payerHint?: string;
  note?: string;
  checkedAt?: string;
  ocrReadAt?: string;
  ocrConfidence?: number;
  amountFromOcr?: boolean;
  ocrMessage?: string;
};

export type WatershopReceipt = {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  createdAt: string;
  status: BillStatusCode;
  slipDataUrl?: string;
  slipVerification?: SlipVerification;
};

export const useWatershopReceipts = () => {
  const receipts = ref<WatershopReceipt[]>([]);

  const loadReceipts = () => {
    if (!import.meta.client) return;
    try {
      const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
      receipts.value = raw ? (JSON.parse(raw) as WatershopReceipt[]) : [];
    } catch {
      receipts.value = [];
    }
  };

  const saveReceipts = (next: WatershopReceipt[]) => {
    if (!import.meta.client) return;
    localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(next));
    receipts.value = next;
  };

  const orderedReceipts = computed(() =>
    [...receipts.value].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  const addReceipt = (receipt: WatershopReceipt) => {
    if (!import.meta.client) return;
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    const current = raw ? (JSON.parse(raw) as WatershopReceipt[]) : [];
    saveReceipts([receipt, ...current]);
  };

  const updateStatus = (receiptId: string, status: BillStatusCode) => {
    const next = receipts.value.map((r) =>
      r.id === receiptId ? { ...r, status } : r,
    );
    saveReceipts(next);
  };

  const attachSlip = (receiptId: string, dataUrl: string) => {
    const next = receipts.value.map((r) =>
      r.id === receiptId ? { ...r, slipDataUrl: dataUrl } : r,
    );
    saveReceipts(next);
  };

  const removeSlip = (receiptId: string) => {
    const next = receipts.value.map((r) => {
      if (r.id !== receiptId) return r;
      const { slipDataUrl: _, slipVerification: __, ...rest } = r;
      return rest as WatershopReceipt;
    });
    saveReceipts(next);
  };

  const updateSlipVerification = (
    receiptId: string,
    patch: Partial<SlipVerification>,
  ) => {
    const next = receipts.value.map((r) => {
      if (r.id !== receiptId) return r;
      const prev = r.slipVerification ?? {};
      return { ...r, slipVerification: { ...prev, ...patch } };
    });
    saveReceipts(next);
  };

  const saveVerificationDraft = (
    receiptId: string,
    body: {
      amountOnSlip: number | undefined;
      payerHint: string | undefined;
      note: string | undefined;
    },
  ) => {
    updateSlipVerification(receiptId, {
      amountOnSlip: body.amountOnSlip,
      payerHint: body.payerHint,
      note: body.note,
      checkedAt: new Date().toISOString(),
      amountFromOcr: false,
      ocrMessage: undefined,
    });
  };

  return {
    receipts,
    orderedReceipts,
    loadReceipts,
    saveReceipts,
    addReceipt,
    updateStatus,
    attachSlip,
    removeSlip,
    updateSlipVerification,
    saveVerificationDraft,
  };
};
