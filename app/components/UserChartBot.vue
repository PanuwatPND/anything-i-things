<template>
  <ClientOnly>
    <div
      class="pointer-events-none fixed right-4 z-50 flex flex-col-reverse items-end gap-2"
      :style="{ bottom: fabBottom }"
    >
      <button
        type="button"
        class="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_12px_28px_-8px_rgba(15,23,42,0.55)] ring-2 ring-white/90 transition hover:bg-slate-800 active:scale-95"
        :aria-expanded="open"
        aria-controls="user-chart-bot-panel"
        aria-label="เปิดกราฟสรุปยอด 7 วัน"
        @click="open = !open"
      >
        <svg
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 16v-5" />
          <path d="M12 16V8" />
          <path d="M16 16v-3" />
          <path d="M20 16V6" />
        </svg>
      </button>

      <Transition name="chart-bot">
        <div
          v-if="open"
          id="user-chart-bot-panel"
          class="pointer-events-auto w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white p-4 shadow-[0_14px_36px_-16px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.06]"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold text-slate-900">สรุป 7 วัน</p>
              <p class="mt-0.5 text-[11px] text-slate-500">ยอดจากใบเสร็จในเครื่องนี้</p>
            </div>
            <p class="shrink-0 text-right">
              <span class="block text-[10px] font-medium text-slate-500">รวม</span>
              <span class="text-sm font-bold tabular-nums text-slate-900">{{ formatInt(weekTotal) }} ฿</span>
            </p>
          </div>
          <div class="mt-3 -mx-1">
            <apexchart
              type="bar"
              height="140"
              width="100%"
              :options="chartOptions"
              :series="chartSeries"
            />
          </div>
        </div>
      </Transition>
    </div>
    <template #fallback />
  </ClientOnly>
</template>

<script setup lang="ts">
type ReceiptItem = {
  id: string
  itemName: string
  quantity: number
  amount: number
  createdAt: string
}

const RECEIPTS_STORAGE_KEY = 'watershop-receipts'

const route = useRoute()
const { formatInt } = useFormatNumber()

const open = ref(false)

const norm = (path: string) => path.replace(/\/$/, '') || '/'

const hasTabBar = computed(() => {
  const p = norm(route.path)
  const bases = ['/user/water', '/user/bills', '/user/cart', '/user/profile'] as const
  return bases.some((base) => p === base || p.startsWith(`${base}/`))
})

const fabBottom = computed(() =>
  hasTabBar.value
    ? 'calc(env(safe-area-inset-bottom) + 5.75rem)'
    : 'calc(env(safe-area-inset-bottom) + 1.25rem)',
)

const receipts = ref<ReceiptItem[]>([])

const loadReceipts = () => {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY)
    receipts.value = raw ? (JSON.parse(raw) as ReceiptItem[]) : []
  } catch {
    receipts.value = []
  }
}

const dayLabels = computed(() => {
  const labels: string[] = []
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (6 - i))
    labels.push(d.toLocaleDateString('th-TH', { weekday: 'short' }))
  }
  return labels
})

const weekBuckets = computed(() => {
  const buckets = [0, 0, 0, 0, 0, 0, 0]
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 6)

  for (const r of receipts.value) {
    const day = new Date(r.createdAt)
    day.setHours(0, 0, 0, 0)
    const idx = Math.round((day.getTime() - start.getTime()) / 86400000)
    if (idx >= 0 && idx <= 6) buckets[idx]! += r.amount
  }
  return buckets
})

const weekTotal = computed(() => weekBuckets.value.reduce((a, b) => a + b, 0))

const chartSeries = computed(() => [
  {
    name: 'ยอด (฿)',
    data: weekBuckets.value,
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 400 },
    fontFamily: 'inherit',
    foreColor: '#64748b',
  },
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '70%',
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: dayLabels.value,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { fontSize: '10px', fontWeight: 600 },
    },
  },
  yaxis: { show: false },
  grid: {
    show: true,
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  colors: ['#0f172a'],
  tooltip: {
    theme: 'light',
    y: {
      formatter: (val: number) => `${formatInt(val)} ฿`,
    },
  },
}))

onMounted(() => {
  loadReceipts()
  window.addEventListener('focus', loadReceipts)
})

watch(
  () => route.fullPath,
  () => {
    loadReceipts()
  },
)

onUnmounted(() => {
  window.removeEventListener('focus', loadReceipts)
})
</script>

<style scoped>
.chart-bot-enter-active,
.chart-bot-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.chart-bot-enter-from,
.chart-bot-leave-to {
  opacity: 0;
  transform: translateY(0.5rem) scale(0.97);
  transform-origin: bottom right;
}
</style>
