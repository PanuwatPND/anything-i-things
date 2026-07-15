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
        class="fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-[2px]"
        @click="onClose"
        @wheel.prevent
        @touchmove.prevent
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
        ref="sheetRef"
        class="fixed inset-x-0 bottom-0 z-[61] flex max-h-[90vh] flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.28)]"
      >
        <!-- drag handle -->
        <div class="flex shrink-0 justify-center pb-1 pt-3">
          <div class="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <!-- header (ไม่เลื่อน) -->
        <div class="relative shrink-0 px-5 pb-3 pt-1">
          <button
            type="button"
            class="absolute right-4 top-0 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 active:scale-95"
            aria-label="ปิด"
            @click="onClose"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div class="pr-12">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                :class="
                  stage === 'shipping'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-amber-100 text-amber-800'
                "
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="stage === 'shipping' ? 'bg-sky-500' : 'bg-amber-500'"
                />
                {{ stage === "shipping" ? "กำลังส่ง" : "เตรียมของ" }}
              </span>
              <span
                class="truncate text-[11px] font-medium tabular-nums text-slate-400"
              >
                #{{ orderId }}
              </span>
            </div>

            <h2
              class="mt-2.5 text-[1.35rem] font-bold leading-snug tracking-tight text-slate-900"
            >
              {{ stageLabel }}
            </h2>
          </div>
        </div>

        <!-- stepper (ไม่เลื่อน) -->
        <div
          class="mx-5 mb-3 shrink-0 rounded-2xl bg-slate-50 px-3 py-3.5 ring-1 ring-slate-100"
        >
          <div class="flex items-start justify-between">
            <div
              v-for="(step, i) in steps"
              :key="step.key"
              class="flex flex-1 flex-col items-center"
            >
              <div class="flex w-full items-center">
                <div
                  class="h-0.5 flex-1"
                  :class="
                    i === 0
                      ? 'invisible'
                      : step.filled
                        ? 'bg-slate-900'
                        : 'bg-slate-200'
                  "
                />
                <div
                  class="grid h-8 w-8 shrink-0 place-items-center rounded-full ring-2 ring-white"
                  :class="
                    step.done
                      ? 'bg-emerald-500 text-white'
                      : step.current
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-400'
                  "
                >
                  <svg
                    v-if="step.done"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <!-- package -->
                  <svg
                    v-else-if="step.key === 'order'"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m7.5 4.27 9 5.15" />
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                  <!-- clipboard / prep -->
                  <svg
                    v-else-if="step.key === 'prep'"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <path d="M12 11h4" />
                    <path d="M12 16h4" />
                    <path d="M8 11h.01" />
                    <path d="M8 16h.01" />
                  </svg>
                  <!-- truck -->
                  <svg
                    v-else
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                    <path d="M15 18H9" />
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                    <circle cx="17" cy="18" r="2" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                </div>
                <div
                  class="h-0.5 flex-1"
                  :class="
                    i === steps.length - 1
                      ? 'invisible'
                      : steps[i + 1]?.filled
                        ? 'bg-slate-900'
                        : 'bg-slate-200'
                  "
                />
              </div>
              <p
                class="mt-1.5 text-center text-[10px] leading-tight"
                :class="
                  step.current
                    ? 'font-semibold text-slate-900'
                    : 'text-slate-400'
                "
              >
                {{ step.label }}
              </p>
            </div>
          </div>
        </div>

        <!-- map นอก scroll — ลากแล้วไม่ดึง list ด้านหลัง/ชีท -->
        <div
          ref="mapWrapRef"
          class="relative mx-5 h-52 shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] sm:h-60"
          style="touch-action: none"
          @wheel.stop
          @mousedown.stop
        >
          <VillageSatelliteMap
            compact
            basemap="vector"
            animate-route
            :markers="markers"
            :route="routePoints"
            :zoom="17"
          />
          <div
            class="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5"
          >
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80"
            >
              <span class="h-2 w-2 rounded-full bg-emerald-500" />
              ร้าน
            </span>
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80"
            >
              <span class="h-2 w-2 rounded-full bg-rose-500" />
              บ้านคุณ
            </span>
          </div>
        </div>

        <!-- รายละเอียด + ปุ่ม (เลื่อนได้เฉพาะตรงนี้) -->
        <div
          ref="scrollRef"
          class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3"
        >
          <p class="truncate text-xs text-slate-500">
            ร้าน LunarWater · บ้านเลขที่ {{ shopHouseNo }}
            <span class="mx-1 text-slate-300">→</span>
            บ้านเลขที่ {{ houseNo }}
          </p>

          <div class="mt-4 flex gap-2">
            <a
              :href="navigationUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 rounded-2xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition active:scale-[0.99]"
            >
              เปิดนำทาง
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
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
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

const sheetRef = ref<HTMLElement | null>(null);
const mapWrapRef = ref<HTMLElement | null>(null);
const scrollRef = ref<HTMLElement | null>(null);

const originCoords = computed(() => resolveHouseCoords(props.shopHouseNo));
const destCoords = computed(() => resolveHouseCoords(props.houseNo));

let lockedScrollY = 0;
let lockCount = 0;

const onDocWheel = (e: WheelEvent) => {
  const target = e.target as Node | null;
  if (!target) {
    e.preventDefault();
    return;
  }
  // อนุญาต scroll เฉพาะในโซนรายละเอียดด้านล่าง
  if (scrollRef.value?.contains(target)) return;
  // บนแผนที่ — ให้ Leaflet ซูมได้ แต่ไม่ให้หน้าหลังเลื่อน
  if (mapWrapRef.value?.contains(target)) {
    // ไม่ prevent — Leaflet ใช้ wheel ซูม — body ถูกล็อกอยู่แล้ว
    return;
  }
  // นอก sheet หรือส่วนอื่นของ sheet
  if (!sheetRef.value?.contains(target)) {
    e.preventDefault();
  }
};

const onDocTouchMove = (e: TouchEvent) => {
  const target = e.target as Node | null;
  if (!target) {
    e.preventDefault();
    return;
  }
  if (scrollRef.value?.contains(target)) return;
  if (mapWrapRef.value?.contains(target)) return;
  if (!sheetRef.value?.contains(target)) {
    e.preventDefault();
  }
};

const lockBodyScroll = () => {
  if (!import.meta.client) return;
  lockCount += 1;
  if (lockCount > 1) return;

  lockedScrollY = window.scrollY;
  const html = document.documentElement;
  const body = document.body;

  html.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  body.style.position = "fixed";
  body.style.top = `-${lockedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";

  document.addEventListener("wheel", onDocWheel, {
    passive: false,
    capture: true,
  });
  document.addEventListener("touchmove", onDocTouchMove, {
    passive: false,
    capture: true,
  });
};

const unlockBodyScroll = () => {
  if (!import.meta.client) return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.removeEventListener("wheel", onDocWheel, true);
  document.removeEventListener("touchmove", onDocTouchMove, true);

  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = "";
  html.style.overscrollBehavior = "";
  body.style.overflow = "";
  body.style.overscrollBehavior = "";
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  window.scrollTo(0, lockedScrollY);
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) lockBodyScroll();
    else unlockBodyScroll();
  },
  { immediate: true },
);

onUnmounted(() => {
  // บังคับปลดถ้ายังล็อกอยู่
  if (lockCount > 0) {
    lockCount = 1;
    unlockBodyScroll();
  }
});

const stageLabel = computed(() =>
  props.stage === "shipping" ? "กำลังนำส่งถึงบ้านคุณ" : "กำลังจัดเตรียมจัดส่ง",
);

const steps = computed(() => {
  const shipping = props.stage === "shipping";
  return [
    { key: "order", label: "รับออเดอร์", done: true, current: false, filled: true },
    { key: "prep", label: "เตรียมของ", done: shipping, current: !shipping, filled: true },
    { key: "ship", label: "กำลังส่ง", done: false, current: shipping, filled: shipping },
  ];
});

const straightLine = computed(() => [
  { lat: originCoords.value.lat, lng: originCoords.value.lng },
  { lat: destCoords.value.lat, lng: destCoords.value.lng },
]);

const roadRoute = ref<{ lat: number; lng: number }[] | null>(null);
const routePoints = computed(() => roadRoute.value ?? straightLine.value);

const loadRoute = async () => {
  roadRoute.value = null;
  const route = await fetchRoadRoute(originCoords.value, destCoords.value);
  roadRoute.value = route;
};

watch(
  () => [
    props.open,
    originCoords.value.lat,
    originCoords.value.lng,
    destCoords.value.lat,
    destCoords.value.lng,
  ],
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

const navigationUrl = computed(() =>
  googleMapsNavigationUrl(destCoords.value.lat, destCoords.value.lng),
);

const onClose = () => emit("close");
const onConfirm = () => emit("confirm");
</script>
