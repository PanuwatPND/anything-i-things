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

        <div class="relative h-80 bg-slate-100">
          <VillageSatelliteMap :lat="coords.lat" :lng="coords.lng" />
        </div>

        <div class="space-y-2 px-4 py-3 text-xs text-slate-600">
          <p>
            สถานะ: <span class="font-semibold text-violet-700">กำลังดำเนินการจัดส่ง</span>
          </p>
          <div v-if="houseNo" class="flex items-center justify-between gap-2">
            <p>
              บ้านเลขที่ <span class="font-semibold text-slate-900">{{ houseNo }}</span>
              <span
                class="ml-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                :class="coords.confirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
              >
                {{ coords.confirmed ? "ปักหมุดยืนยันแล้ว" : "ตำแหน่งโดยประมาณ (ทางเข้าหมู่บ้าน)" }}
              </span>
            </p>
            <a
              :href="satelliteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              เปิดนำทาง
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { googleMapsLinkUrl, resolveHouseCoords } from "~/utils/villageMap";

const props = defineProps<{
  open: boolean;
  title: string;
  houseNo?: string;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

const coords = computed(() => resolveHouseCoords(props.houseNo));
const satelliteUrl = computed(() => googleMapsLinkUrl(coords.value.lat, coords.value.lng));

const onClose = () => {
  emit("close");
};
</script>
