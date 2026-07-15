<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[60] bg-black/50"
        @click="onClose"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="open"
        class="fixed inset-x-0 bottom-0 z-[61] flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.25)]"
      >
        <!-- drag handle -->
        <div class="flex shrink-0 justify-center pb-1 pt-3">
          <div class="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <!-- scrollable content -->
        <div class="min-h-0 flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+20px)]">
          <!-- status header -->
          <div class="relative bg-violet-50 px-5 pb-4 pt-2">
            <button
              type="button"
              class="absolute right-4 top-2 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80 text-slate-500 transition hover:bg-white"
              aria-label="ปิด"
              @click="onClose"
            >
              ✕
            </button>
            <p class="truncate pr-10 text-xs font-semibold text-violet-700">{{ itemName }} · #{{ orderId }}</p>
            <p class="mt-1 text-xl font-bold text-violet-900">{{ stageLabel }}</p>
            <p class="mt-1 text-sm text-violet-700">คาดว่าถึงใน {{ etaMinutes }} นาที</p>
          </div>

          <!-- stepper -->
          <div class="flex items-start justify-between px-7 pb-4 pt-4">
            <div
              v-for="(step, i) in steps"
              :key="step.key"
              class="flex flex-1 flex-col items-center"
            >
              <div class="flex w-full items-center">
                <div
                  class="h-0.5 flex-1"
                  :class="i === 0 ? 'invisible' : step.filled ? 'bg-violet-400' : 'bg-slate-200'"
                />
                <div
                  class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm"
                  :class="
                    step.done
                      ? 'bg-emerald-500 text-white'
                      : step.current
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                  "
                >
                  <span v-if="step.done">✓</span>
                  <span v-else>{{ step.icon }}</span>
                </div>
                <div
                  class="h-0.5 flex-1"
                  :class="i === steps.length - 1 ? 'invisible' : steps[i + 1]?.filled ? 'bg-violet-400' : 'bg-slate-200'"
                />
              </div>
              <p
                class="mt-1.5 text-center text-[10px] leading-tight"
                :class="step.current ? 'font-semibold text-slate-900' : 'text-slate-400'"
              >
                {{ step.label }}
              </p>
            </div>
          </div>

          <!-- map -->
          <div
            class="relative mx-5 h-52 shrink-0 overflow-hidden rounded-2xl bg-slate-200 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] sm:h-60"
          >
            <VillageSatelliteMap
              compact
              :markers="markers"
              :route="routePoints"
              :zoom="17"
            />
            <!-- legend chips -->
            <div
              class="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5"
            >
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm"
              >
                <span class="h-2 w-2 rounded-full bg-emerald-500" />
                ร้าน
              </span>
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm"
              >
                <span class="h-2 w-2 rounded-full bg-rose-500" />
                บ้านคุณ
              </span>
            </div>
            <div
              class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent"
            />
          </div>

          <div class="px-5 pt-3">
            <p class="truncate text-xs text-slate-500">
              ร้าน LunarWater · บ้านเลขที่ {{ shopHouseNo }}
              <span class="mx-1 text-slate-300">→</span>
              บ้านเลขที่ {{ houseNo }}
              <span
                class="ml-1 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                :class="destCoords.confirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
              >
                {{ destCoords.confirmed ? "ปักหมุดแล้ว" : "ตำแหน่งโดยประมาณ" }}
              </span>
            </p>
            <p class="mt-1 text-[11px] leading-relaxed text-slate-400">
              {{
                routeIsRoad
                  ? "เส้นทางตามถนนจริงโดยประมาณ · ระยะทาง " + distanceKmValue.toFixed(1) + " กม."
                  : "ยังหาเส้นทางตามถนนไม่ได้ ใช้เส้นตรงโดยประมาณแทน"
              }}
            </p>

            <div class="mt-4 flex gap-2">
              <a
                :href="navigationUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 rounded-2xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition active:scale-[0.99]"
              >
                🧭 เปิดนำทาง
              </a>
              <button
                type="button"
                class="flex-1 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.99]"
                @click="onConfirm"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  distanceKm,
  estimateDeliveryMinutes,
  fetchRoadRoute,
  googleMapsNavigationUrl,
  resolveHouseCoords,
} from "~/utils/villageMap";

const props = withDefaults(
  defineProps<{
    open: boolean;
    itemName: string;
    houseNo?: string;
    shopHouseNo?: string;
    orderId?: string;
    stage?: "preparing" | "shipping";
  }>(),
  { shopHouseNo: "68", orderId: "", stage: "preparing" },
);

const emit = defineEmits<{
  (event: "close"): void;
  (event: "confirm"): void;
}>();

const originCoords = computed(() => resolveHouseCoords(props.shopHouseNo));
const destCoords = computed(() => resolveHouseCoords(props.houseNo));

// กันหน้าหลังเลื่อนได้ตอน sheet เปิดอยู่ (ไม่งั้นจะรู้สึกเหมือนลากทะลุ)
watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return;
    document.body.style.overflow = isOpen ? "hidden" : "";
  },
  { immediate: true },
);

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = "";
});

const stageLabel = computed(() =>
  props.stage === "shipping" ? "กำลังนำส่งถึงบ้านคุณ" : "กำลังจัดเตรียมจัดส่ง",
);

const steps = computed(() => {
  const shipping = props.stage === "shipping";
  return [
    { key: "order", label: "รับออเดอร์", icon: "📦", done: true, current: false, filled: true },
    { key: "prep", label: "เตรียมของ", icon: "🧺", done: shipping, current: !shipping, filled: true },
    { key: "ship", label: "กำลังส่ง", icon: "🛵", done: false, current: shipping, filled: shipping },
  ];
});

const straightLine = computed(() => [
  { lat: originCoords.value.lat, lng: originCoords.value.lng },
  { lat: destCoords.value.lat, lng: destCoords.value.lng },
]);

const roadRoute = ref<{ lat: number; lng: number }[] | null>(null);
const routeIsRoad = computed(() => !!roadRoute.value);
const routePoints = computed(() => roadRoute.value ?? straightLine.value);

const loadRoute = async () => {
  roadRoute.value = null;
  const route = await fetchRoadRoute(originCoords.value, destCoords.value);
  roadRoute.value = route;
};

watch(
  () => [props.open, originCoords.value.lat, originCoords.value.lng, destCoords.value.lat, destCoords.value.lng],
  () => {
    if (props.open) loadRoute();
  },
  { immediate: true },
);

const markers = computed(() => [
  {
    lat: originCoords.value.lat,
    lng: originCoords.value.lng,
    color: "#059669",
    label: "ร้าน LunarWater",
    confirmed: true,
    shape: "shop" as const,
  },
  {
    lat: destCoords.value.lat,
    lng: destCoords.value.lng,
    color: "#e11d48",
    label: `บ้านเลขที่ ${props.houseNo ?? ""}`,
    confirmed: destCoords.value.confirmed,
    shape: "home" as const,
  },
]);

const distanceKmValue = computed(() => distanceKm(originCoords.value, destCoords.value));
const etaMinutes = computed(() => estimateDeliveryMinutes(distanceKmValue.value));
const navigationUrl = computed(() => googleMapsNavigationUrl(destCoords.value.lat, destCoords.value.lng));

const onClose = () => emit("close");
const onConfirm = () => emit("confirm");
</script>
