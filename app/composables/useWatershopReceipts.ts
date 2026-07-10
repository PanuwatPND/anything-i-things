export const RECEIPTS_STORAGE_KEY = "watershop-receipts";

export type BillStatusCode =
  | "pending"
  | "pay_later"
  | "paid"
  | "shipping"
  | "delivered"
  | "cancelled";

export const BILL_STATUS_LABEL: Record<BillStatusCode, string> = {
  pending: "รอชำระ",
  pay_later: "รอจัดส่ง · จ่ายทีหลัง",
  paid: "ชำระแล้ว",
  shipping: "กำลังจัดส่ง",
  delivered: "จัดส่งสำเร็จ",
  cancelled: "ยกเลิก",
};

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

export type OrderLineItem = { name: string; quantity: number };

export type WatershopReceipt = {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  createdAt: string;
  status: BillStatusCode;
  slipDataUrl?: string;
  slipVerification?: SlipVerification;
  /** รายการแยกตามขนาฬ — ใช้แจ้งเตือนคนส่งน้ำ */
  lineItems?: OrderLineItem[];
};

export const useWatershopReceipts = () => {
  const receipts = ref<WatershopReceipt[]>([]);

  // ──────────────── localStorage helpers ────────────────

  const loadReceipts = () => {
    if (!import.meta.client) return;
    try {
      const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
      receipts.value = raw ? (JSON.parse(raw) as WatershopReceipt[]) : [];
    } catch {
      receipts.value = [];
    }
    syncFromSupabase().catch(() => {});
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

  // ──────────────── Supabase sync ────────────────

  const syncFromSupabase = async () => {
    if (!import.meta.client) return;
    const { user } = useAuth();
    if (!user.value?.email) return;

    const sb = useSupabase();
    const { data, error } = await sb
      .from("receipts")
      .select("*")
      .eq("user_email", user.value.email)
      .order("created_at", { ascending: false });

    if (error || !data?.length) return;

    // แปลง snake_case → camelCase และรักษา slipDataUrl/slipVerification จาก localStorage
    const local = receipts.value;
    const merged: WatershopReceipt[] = data.map((row) => {
      const localItem = local.find((r) => r.id === row.id);
      return {
        id: row.id,
        itemName: row.item_name,
        quantity: row.quantity,
        amount: row.amount,
        status: row.status as BillStatusCode,
        createdAt: row.created_at,
        slipDataUrl: localItem?.slipDataUrl,
        slipVerification: localItem?.slipVerification,
        lineItems: localItem?.lineItems,
      };
    });

    saveReceipts(merged);
  };

  const pushToSupabase = (receipt: WatershopReceipt, userEmail: string) => {
    const sb = useSupabase();
    sb.from("receipts")
      .upsert({
        id: receipt.id,
        user_email: userEmail,
        item_name: receipt.itemName,
        quantity: receipt.quantity,
        amount: receipt.amount,
        status: receipt.status,
        created_at: receipt.createdAt,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn("[supabase] upsert failed", error.message);
      });
  };

  const pushStatusToSupabase = (receiptId: string, status: BillStatusCode) => {
    const sb = useSupabase();
    sb.from("receipts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", receiptId)
      .then(({ error }) => {
        if (error) console.warn("[supabase] status update failed", error.message);
      });
  };

  // ──────────────── write operations ────────────────

  const addReceipt = (receipt: WatershopReceipt) => {
    if (!import.meta.client) return;
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    const current = raw ? (JSON.parse(raw) as WatershopReceipt[]) : [];
    saveReceipts([receipt, ...current]);

    const { user } = useAuth();
    if (user.value?.email) pushToSupabase(receipt, user.value.email);
  };

  const updateStatus = (receiptId: string, status: BillStatusCode) => {
    const next = receipts.value.map((r) =>
      r.id === receiptId ? { ...r, status } : r,
    );
    saveReceipts(next);
    pushStatusToSupabase(receiptId, status);
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
