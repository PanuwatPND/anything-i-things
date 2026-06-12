export const RECEIPTS_STORAGE_KEY = "watershop-receipts";

/** ข้อมูลการตรวจสลิป — ยอดอาจมาจาก Gemini Vision หรือพิมพ์มือ */
export type SlipVerification = {
  /** ยอดที่เห็นบนสลิป — จาก Gemini หรือพิมพ์มือ */
  amountOnSlip?: number;
  /** เช่น ชื่อผู้โอน, ธนาคาร, เลขท้ายบัญชี */
  payerHint?: string;
  /** หมายเหตุจากแอดมิน */
  note?: string;
  checkedAt?: string;
  /** เวลาที่เรียก Gemini ล่าสุด */
  ocrReadAt?: string;
  /** confidence จาก Gemini (0–100) */
  ocrConfidence?: number;
  /** true เมื่อ amountOnSlip ล่าสุดมาจาก Gemini Vision */
  amountFromOcr?: boolean;
  /** ข้อความสถานะจากระบบอ่านสลิป */
  ocrMessage?: string;
};

export type WatershopReceipt = {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  createdAt: string;
  /** รูปสลิปโอน (data URL) — แนบได้จากหน้าแอดมิน */
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
      return rest;
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
      return {
        ...r,
        slipVerification: { ...prev, ...patch },
      };
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
    attachSlip,
    removeSlip,
    updateSlipVerification,
    saveVerificationDraft,
  };
};
