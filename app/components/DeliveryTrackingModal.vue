<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3"
      @click.self="onClose"
    >
      <div
        class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_24px_54px_rgba(0,0,0,0.35)]"
      >
        <div class="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <div>
            <p class="text-xs text-slate-500">ติดตามสถานะจัดส่ง</p>
            <p class="text-sm font-semibold text-slate-900">{{ title }}</p>
          </div>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            @click="onClose"
          >
            ปิด
          </button>
        </div>

        <div class="relative h-80 bg-[#e6e7ea]">
          <svg class="absolute inset-0 h-full w-full" viewBox="0 0 360 320" fill="none">
            <path d="M0 65h360M0 138h360M0 210h360M76 0v320M164 0v320M252 0v320" stroke="#f3f4f6" />
            <path
              d="M255 48C248 70 230 83 220 96C199 121 206 145 191 164C172 188 138 194 128 218C120 236 133 253 128 270"
              stroke="#1d6fff"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="256" cy="46" r="11" fill="#1d6fff" />
            <circle cx="256" cy="46" r="4" fill="#fff" />
            <circle cx="128" cy="272" r="11" fill="#1d6fff" />
            <circle cx="128" cy="272" r="4" fill="#fff" />
          </svg>
          <button
            type="button"
            class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-sm text-slate-700 shadow"
          >
            ☰
          </button>
        </div>

        <div class="space-y-2 px-4 py-3 text-xs text-slate-600">
          <p>
            สถานะ: <span class="font-semibold text-violet-700">กำลังดำเนินการจัดส่ง</span>
          </p>
          <p>
            จุดรับ: คลังสินค้า LunarWater · ปลายทาง: ลูกค้า
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const onClose = () => {
  emit('close')
}
</script>
