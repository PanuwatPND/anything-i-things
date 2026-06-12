<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 px-4 pb-32 pt-2 text-slate-900"
  >
    <div class="mx-auto w-full max-w-md space-y-4">
      <div
        class="rounded-[2rem] bg-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
      >
        <p class="text-xs text-slate-500">Billing</p>
        <h1 class="mt-1 text-xl font-bold">บิล / ใบเสร็จ</h1>
        <p class="mt-1 text-xs text-slate-500">
          รายการสั่งซื้อที่บันทึกในเครื่องนี้
        </p>
      </div>

      <div
        class="rounded-[2rem] bg-white p-4 shadow-[0_16px_36px_rgba(0,0,0,0.1)]"
      >
        <div
          v-if="orderedReceipts.length === 0"
          class="rounded-xl border border-dashed border-black/20 bg-slate-50 px-3 py-8 text-center text-sm text-slate-600"
        >
          ยังไม่มีบิล — สั่งซื้อจากตะกร้าแล้วจะแสดงที่นี่
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="r in orderedReceipts"
            :key="r.id"
            class="rounded-xl border border-black/10 bg-slate-50 p-3 text-sm transition-all"
            :class="{ 'cursor-pointer hover:bg-amber-50 hover:border-amber-200 active:scale-[0.99]': statusOf(r).code === 'pending' }"
            @click="statusOf(r).code === 'pending' ? router.push(`/user/payment?id=${r.id}`) : undefined"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-semibold text-slate-900">{{ r.itemName }}</p>
                <p class="mt-0.5 text-xs text-slate-500">
                  {{ formatDate(r.createdAt) }} ·
                  {{ formatInt(r.quantity) }} ชิ้น
                </p>
                <button
                  v-if="statusOf(r).code === 'shipping'"
                  type="button"
                  class="mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold underline underline-offset-2"
                  :class="statusClass(statusOf(r).code)"
                  @click.stop="openTracking(r)"
                >
                  {{ statusOf(r).label }} · ดูแผนที่
                </button>
                <span
                  v-else-if="statusOf(r).code === 'pending'"
                  class="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  :class="statusClass(statusOf(r).code)"
                >
                  {{ statusOf(r).label }} · กดเพื่อชำระ
                </span>
                <p
                  v-else
                  class="mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  :class="statusClass(statusOf(r).code)"
                >
                  {{ statusOf(r).label }}
                </p>
              </div>
              <p class="shrink-0 font-semibold tabular-nums">
                {{ formatInt(r.amount) }} ฿
              </p>
            </div>
          </li>
        </ul>
      </div>

    </div>
  </div>

  <DeliveryTrackingModal
    :open="trackingOpen"
    :title="trackingTitle"
    @close="trackingOpen = false"
  />
</template>

<script setup lang="ts">
import {
  type WatershopReceipt,
  type BillStatusCode,
  BILL_STATUS_LABEL,
} from "~/composables/useWatershopReceipts";

definePageMeta({
  layout: "user",
  middleware: "auth",
});

const router = useRouter();
const { formatInt } = useFormatNumber();
const { orderedReceipts, loadReceipts } = useWatershopReceipts();
const trackingOpen = ref(false);
const trackingTitle = ref("รายการจัดส่ง");

onMounted(() => loadReceipts());

const statusOf = (r: WatershopReceipt) => {
  const code = (r.status ?? "pending") as BillStatusCode;
  return { code, label: BILL_STATUS_LABEL[code] };
};

const statusClass = (code: BillStatusCode) => {
  if (code === "pending") return "bg-amber-100 text-amber-700";
  if (code === "paid") return "bg-sky-100 text-sky-700";
  if (code === "shipping") return "bg-violet-100 text-violet-700";
  if (code === "delivered") return "bg-emerald-100 text-emerald-700";
  return "bg-rose-100 text-rose-700";
};

const openTracking = (receipt: WatershopReceipt) => {
  trackingTitle.value = receipt.itemName;
  trackingOpen.value = true;
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};
</script>
