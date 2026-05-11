<template>
  <div class="min-h-screen bg-[#ececec] px-4 py-6 text-slate-900">
    <div class="mx-auto w-full max-w-md space-y-4">
      <div class="rounded-[2rem] bg-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        <p class="text-xs text-slate-500">Billing</p>
        <h1 class="mt-1 text-xl font-bold">บิล / ใบเสร็จ</h1>
        <p class="mt-1 text-xs text-slate-500">รายการสั่งซื้อที่บันทึกในเครื่องนี้</p>
      </div>

      <div class="rounded-[2rem] bg-white p-4 shadow-[0_16px_36px_rgba(0,0,0,0.1)]">
        <div
          v-if="receipts.length === 0"
          class="rounded-xl border border-dashed border-black/20 bg-slate-50 px-3 py-8 text-center text-sm text-slate-600"
        >
          ยังไม่มีบิล — สั่งซื้อจากตะกร้าแล้วจะแสดงที่นี่
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="r in receipts"
            :key="r.id"
            class="rounded-xl border border-black/10 bg-slate-50 p-3 text-sm"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-semibold text-slate-900">{{ r.itemName }}</p>
                <p class="mt-0.5 text-xs text-slate-500">
                  {{ formatDate(r.createdAt) }} · {{ r.quantity }} ชิ้น
                </p>
              </div>
              <p class="shrink-0 font-semibold tabular-nums">{{ r.amount }} ฿</p>
            </div>
          </li>
        </ul>
      </div>

      <UserTabBar />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

type ReceiptItem = {
  id: string
  itemName: string
  quantity: number
  amount: number
  createdAt: string
}

const RECEIPTS_STORAGE_KEY = 'watershop-receipts'

const receipts = ref<ReceiptItem[]>([])

const loadReceipts = () => {
  if (!import.meta.client) return
  const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY)
  receipts.value = raw ? (JSON.parse(raw) as ReceiptItem[]) : []
}

onMounted(() => {
  loadReceipts()
})

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('th-TH', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}
</script>
