<template>
  <div class="flex flex-col items-center">
    <div
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <img
        v-if="qrUrl"
        :src="qrUrl"
        alt="QR PromptPay"
        class="h-[200px] w-[200px] object-contain"
      />
      <div
        v-else
        class="flex h-[200px] w-[200px] items-center justify-center text-xs text-slate-400"
      >
        กำลังสร้าง QR...
      </div>
    </div>
    <p class="mt-2 text-center text-[11px] text-slate-500">
      สแกนจ่ายยอด
      <span class="font-bold tabular-nums text-slate-800">{{ formatInt(amount) }} ฿</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { PROMPTPAY_PHONE, promptPayQrDataUrl } from "~/utils/promptPay";

const props = defineProps<{ amount: number }>();
const { formatInt } = useFormatNumber();
const qrUrl = ref("");

watch(
  () => props.amount,
  async (amount) => {
    if (!import.meta.client || amount <= 0) return;
    try {
      qrUrl.value = await promptPayQrDataUrl(amount, PROMPTPAY_PHONE);
    } catch {
      qrUrl.value = "";
    }
  },
  { immediate: true },
);
</script>
