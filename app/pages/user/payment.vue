<template>
  <div class="mx-auto w-full max-w-md space-y-4">
    <input
      ref="slipInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onSlipFile"
    />
      <!-- header -->
      <div
        class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs text-slate-500">Payment</p>
            <h1 class="mt-1 text-2xl font-bold tracking-tight">ชำระเงิน</h1>
          </div>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            @click="router.push('/user/bills')"
          >
            ดูบิลทั้งหมด
          </button>
        </div>
      </div>

      <!-- not found -->
      <div
        v-if="!receipt"
        class="rounded-3xl bg-white p-8 text-center shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
      >
        <p class="text-sm text-slate-500">ไม่พบข้อมูลออเดอร์</p>
        <button
          type="button"
          class="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          @click="router.push('/user/bills')"
        >
          กลับหน้าบิล
        </button>
      </div>

      <template v-else>
        <!-- order summary -->
        <div
          class="rounded-3xl bg-slate-900 p-5 text-white shadow-[0_8px_28px_-12px_rgba(15,23,42,0.45)]"
        >
          <p class="text-xs font-medium text-white/60">ยอดที่ต้องชำระ</p>
          <p class="mt-1 text-4xl font-bold tabular-nums tracking-tight">
            {{ formatInt(receipt.amount) }}
            <span class="text-xl font-semibold text-white/70">฿</span>
          </p>
          <div class="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
            <div class="flex justify-between gap-2">
              <span class="text-white/60">รายการ</span>
              <span class="font-medium">{{ receipt.itemName }}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-white/60">จำนวน</span>
              <span class="font-medium"
                >{{ formatInt(receipt.quantity) }} แพ็ค</span
              >
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-white/60">เลขบิล</span>
              <span class="font-medium tabular-nums">#{{ receipt.id }}</span>
            </div>
          </div>
        </div>

        <!-- payment info -->
        <div
          class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
        >
          <h2 class="font-bold text-slate-900">ช่องทางชำระเงิน</h2>
          <p class="mt-0.5 text-xs text-slate-500">
            โอนเงินแล้วแนบสลิปด้านล่าง
          </p>

          <div class="mt-4 space-y-2">
            <div
              class="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <div>
                <p
                  class="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  PromptPay
                </p>
                <!-- เปลี่ยนเป็นเบอร์จริงที่นี่ -->
                <p
                  class="mt-0.5 text-lg font-bold tabular-nums tracking-wide text-slate-900"
                >
                  {{ PROMPTPAY_NUMBER }}
                  <span class="block text-xs font-normal text-slate-500/50">นายภานุวัฒน์ เพชรสีเขียว</span>
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition active:scale-95 hover:bg-slate-50"
                @click="copyPromptPay"
              >
                {{ copied ? "คัดลอกแล้ว ✓" : "คัดลอก" }}
              </button>
            </div>
          </div>
        </div>

        <!-- slip upload -->
        <div
          class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
        >
          <h2 class="font-bold text-slate-900">แนบสลิปการโอน</h2>
          <p class="mt-0.5 text-xs text-slate-500">
            ระบบจะตรวจสอบยอดในสลิปอัตโนมัติ
          </p>

          <div class="mt-4">
            <div
              v-if="receipt.slipDataUrl"
              class="overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"
            >
              <img
                :src="receipt.slipDataUrl"
                alt="สลิปโอน"
                class="max-h-60 w-full object-contain object-center"
              />
              <div
                class="flex gap-2 border-t border-slate-200 bg-white/80 px-3 py-2 backdrop-blur-sm"
              >
                <button
                  type="button"
                  :disabled="verifying"
                  class="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                  @click="slipInputRef?.click()"
                >
                  เปลี่ยนรูป
                </button>
                <button
                  type="button"
                  :disabled="verifying"
                  class="flex-1 rounded-xl border border-rose-100 bg-rose-50 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                  @click="onRemoveSlip"
                >
                  ลบสลิป
                </button>
              </div>
            </div>

            <button
              v-else
              type="button"
              class="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 transition hover:border-slate-300 hover:bg-slate-100"
              @click="slipInputRef?.click()"
            >
              <svg
                class="h-7 w-7 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span class="text-sm font-semibold text-slate-600"
                >แนบรูปสลิป</span
              >
              <span class="text-xs text-slate-400"
                >JPG, PNG ขนาดไม่เกิน 10 MB</span
              >
            </button>
          </div>
        </div>

        <!-- error message -->
        <div
          v-if="verifyError"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <p class="font-semibold">ตรวจสลิปไม่ผ่าน</p>
          <p class="mt-1 text-rose-700">{{ verifyError }}</p>
        </div>

        <!-- verify / confirm button -->
        <button
          type="button"
          :disabled="!receipt.slipDataUrl || verifying"
          class="w-full rounded-2xl py-4 text-sm font-bold shadow-[0_8px_24px_-8px_rgba(15,23,42,0.5)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
          :class="
            receipt.slipDataUrl && !verifying ? 'bg-black text-white' : ''
          "
          @click="verifyAndConfirm"
        >
          <span v-if="verifying" class="flex items-center justify-center gap-2">
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
            กำลังตรวจสอบสลิป...
          </span>
          <span v-else-if="!receipt.slipDataUrl">กรุณาแนบสลิปก่อนยืนยัน</span>
          <span v-else>ยืนยันการชำระเงิน</span>
        </button>
      </template>
    </div>
</template>

<script setup lang="ts">
import {
  readFileAsDataUrl,
  slipImagePartsFromDataUrl,
} from "~/utils/slipImageForOcr";

definePageMeta({
  layout: "user",
  middleware: "auth",
});

// เปลี่ยนเป็นเบอร์ PromptPay จริงตรงนี้
const PROMPTPAY_NUMBER = "095-236-7130";

const route = useRoute();
const router = useRouter();
const { formatInt } = useFormatNumber();
const { user } = useAuth();
const { receipts, loadReceipts, attachSlip, removeSlip, updateStatus, updateSlipVerification } =
  useWatershopReceipts();
const { runOcr } = useSlipOcr();
const { alert } = useAlertDialog();

const slipInputRef = ref<HTMLInputElement | null>(null);
const copied = ref(false);
const verifying = ref(false);
const verifyError = ref("");

onMounted(() => loadReceipts());

const receipt = computed(() => {
  const id = route.query.id as string | undefined;
  if (!id) return null;
  return receipts.value.find((r) => r.id === id) ?? null;
});

const copyPromptPay = async () => {
  if (!import.meta.client) return;
  try {
    await navigator.clipboard.writeText(PROMPTPAY_NUMBER);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    /* clipboard blocked */
  }
};

const onSlipFile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file || !receipt.value) return;
  if (!file.type.startsWith("image/")) return;
  verifyError.value = "";
  try {
    const dataUrl = await readFileAsDataUrl(file);
    attachSlip(receipt.value.id, dataUrl);
  } catch {
    /* ignore */
  }
};

const onRemoveSlip = () => {
  if (!receipt.value) return;
  verifyError.value = "";
  removeSlip(receipt.value.id);
};

const fetchErrorMessage = (e: unknown): string => {
  if (e && typeof e === "object") {
    const err = e as {
      data?: { statusMessage?: string };
      statusMessage?: string;
    };
    return (
      err.data?.statusMessage ||
      err.statusMessage ||
      (e instanceof Error ? e.message : "")
    );
  }
  return e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
};

const fetchErrorStatus = (e: unknown): number => {
  if (e && typeof e === "object" && "statusCode" in e) {
    return Number((e as { statusCode?: number }).statusCode) || 0;
  }
  return 0;
};

const sendPaymentNotify = (r: NonNullable<typeof receipt.value>, payerHint?: string | null) =>
  $fetch<{ ok: boolean; duplicate?: boolean }>("/api/notify/payment", {
    method: "POST",
    body: {
      id: r.id,
      itemName: r.itemName,
      amount: r.amount,
      quantity: r.quantity,
      payerHint,
      buyerName: user.value?.name,
      houseNo: user.value?.houseNo,
      lineItems: r.lineItems,
    },
  });

const verifyAndConfirm = async () => {
  const r = receipt.value;
  if (!r?.slipDataUrl || verifying.value) return;

  verifying.value = true;
  verifyError.value = "";

  try {
    const parts = await slipImagePartsFromDataUrl(r.slipDataUrl);
    if (!parts) throw new Error("ย่อรูปไม่ได้ — ลองแนบรูปใหม่");

    let ocrResult: Awaited<ReturnType<typeof runOcr>>;
    try {
      ocrResult = await runOcr(r.id, parts, r.amount);
    } catch (fetchErr) {
      const status = fetchErrorStatus(fetchErr);
      // OCR ไม่พร้อม — บันทึกชำระแล้ว แจ้ง admin ตรวจสลิปทีหลัง
      if (status === 503) {
        updateSlipVerification(r.id, {
          amountFromOcr: false,
          ocrMessage: "ระบบตรวจสลิปไม่พร้อม — รอแอดมินตรวจ",
          ocrReadAt: new Date().toISOString(),
        });
        await sendPaymentNotify(r, null).catch(() => {});
        updateStatus(r.id, "paid");
        await alert({
          title: "บันทึกการชำระแล้ว",
          description: `ระบบตรวจสลิปอัตโนมัติไม่พร้อมชั่วคราว — ยอด ${formatInt(r.amount)} ฿ ถูกบันทึกแล้ว แอดมินจะตรวจสลิปให้ภายหลัง`,
          confirmText: "ดูบิล",
        });
        await router.push("/user/bills");
        return;
      }
      if (status === 429) {
        throw new Error(
          fetchErrorMessage(fetchErr) ||
            "ระบบตรวจสลิปใช้งานเกินโควต้า — รอ 1–2 นาทีแล้วลองอีกครั้ง",
        );
      }
      throw new Error(fetchErrorMessage(fetchErr) || "ตรวจสอบสลิปไม่สำเร็จ");
    }

    if (ocrResult.amountBaht == null) {
      throw new Error("ไม่พบยอดเงินบนสลิป — กรุณาถ่ายรูปใหม่ให้ตัวเลขชัดเจน");
    }

    if (ocrResult.amountBaht !== r.amount) {
      throw new Error(
        `ยอดบนสลิป (${formatInt(ocrResult.amountBaht)} ฿) ไม่ตรงกับยอดสั่งซื้อ (${formatInt(r.amount)} ฿) — กรุณาตรวจสอบอีกครั้ง`,
      );
    }

    // เช็ค duplicate ก่อน — ถ้าซ้ำให้ block ทันที
    const notifyRes = await sendPaymentNotify(r, ocrResult.payerHint);

    if (notifyRes.duplicate) {
      throw new Error(
        "พบสลิปยอดนี้ในระบบแล้วภายใน 24 ชั่วโมง — ไม่สามารถใช้สลิปซ้ำได้ กรุณาติดต่อแอดมิน",
      );
    }

    updateStatus(r.id, "paid");

    await alert({
      title: "ชำระเงินสำเร็จ",
      description: `ยอด ${formatInt(r.amount)} ฿ ตรงกับสลิป — รอการจัดส่ง`,
      confirmText: "ดูบิล",
    });
    await router.push("/user/bills");
  } catch (err) {
    verifyError.value =
      err instanceof Error ? err.message : "ตรวจสลิปไม่สำเร็จ";
  } finally {
    verifying.value = false;
  }
};
</script>
