<template>
  <div
    ref="trackRef"
    class="relative select-none overflow-hidden rounded-2xl transition-colors duration-200"
    :class="trackClass"
    role="slider"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuenow="Math.round(progress * 100)"
    :aria-disabled="disabled || locked"
    :aria-busy="isProcessing"
    :aria-label="label"
    tabindex="0"
    @keydown="onKeydown"
  >
    <!-- Progress fill — เฉพาะตอนกำลังเลื่อน -->
    <div
      v-if="!disabled && !locked"
      class="pointer-events-none absolute inset-y-0 left-0 bg-slate-800 transition-colors duration-200"
      :style="{ width: `${Math.max(thumbSize, offset + thumbSize / 2)}px` }"
    />

    <!-- Label -->
    <div
      class="pointer-events-none relative z-0 flex h-14 items-center justify-center px-4"
      :class="!locked ? 'px-14' : ''"
      :style="labelStyle"
    >
      <!-- กำลังตรวจสลิป -->
      <span
        v-if="isProcessing"
        class="flex items-center gap-2.5 text-sm font-bold text-white"
      >
        <span
          class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/35 border-t-white"
          aria-hidden="true"
        />
        {{ loadingLabel }}
      </span>

      <!-- สำเร็จ -->
      <span
        v-else-if="isSuccess"
        class="flex items-center gap-2 text-sm font-bold text-white"
      >
        <svg
          class="h-4 w-4 shrink-0"
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
        {{ successLabel }}
      </span>

      <!-- idle / disabled -->
      <span
        v-else
        class="flex items-center gap-1.5 text-sm font-bold"
        :class="disabled ? 'text-slate-400' : 'text-white/85'"
      >
        <svg
          v-if="!disabled"
          class="h-4 w-4 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
        {{ disabled ? disabledLabel : label }}
      </span>
    </div>

    <!-- Thumb — ซ่อนตอน processing เพื่อให้ข้อความโหลดเด่น -->
    <button
      v-show="!isProcessing"
      ref="thumbRef"
      type="button"
      class="absolute left-1 top-1 z-10 grid h-12 w-12 place-items-center rounded-xl transition-colors touch-none"
      :class="thumbClass"
      :style="{
        transform: `translateX(${offset}px)`,
        transition: dragging ? 'none' : 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
      }"
      :disabled="disabled || locked"
      :aria-hidden="true"
      tabindex="-1"
      @pointerdown="onPointerDown"
    >
      <svg
        v-if="isSuccess"
        class="h-5 w-5"
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
      <svg
        v-else
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    loading?: boolean;
    label?: string;
    disabledLabel?: string;
    loadingLabel?: string;
    successLabel?: string;
    threshold?: number;
  }>(),
  {
    disabled: false,
    loading: false,
    label: "เลื่อนเพื่อชำระเงิน",
    disabledLabel: "กรุณาแนบสลิปก่อน",
    loadingLabel: "กำลังตรวจสอบสลิป...",
    successLabel: "ชำระเงินสำเร็จ",
    threshold: 0.88,
  },
);

const emit = defineEmits<{
  confirm: [];
}>();

const trackRef = ref<HTMLElement | null>(null);
const thumbRef = ref<HTMLButtonElement | null>(null);
const offset = ref(0);
const dragging = ref(false);
/** เลื่อนครบแล้ว — รอผลตรวจสลิป */
const locked = ref(false);
/** ตรวจผ่านแล้ว */
const succeeded = ref(false);
const trackWidth = ref(0);
const thumbSize = 48;
const trackPadding = 4;

const isProcessing = computed(() => locked.value && !succeeded.value);
const isSuccess = computed(() => locked.value && succeeded.value);

const progress = computed(() => {
  const max = maxOffset.value;
  if (max <= 0) return 0;
  return Math.min(1, offset.value / max);
});

const maxOffset = computed(() =>
  Math.max(0, trackWidth.value - thumbSize - trackPadding * 2),
);

const trackClass = computed(() => {
  if (props.disabled) return "bg-slate-100 ring-1 ring-slate-200";
  if (isSuccess.value) return "bg-emerald-600";
  if (isProcessing.value) return "bg-slate-800";
  return "bg-slate-900";
});

const thumbClass = computed(() => {
  if (props.disabled)
    return "cursor-not-allowed bg-white text-slate-300 shadow-sm ring-1 ring-slate-200";
  if (isSuccess.value) return "bg-white text-emerald-600 shadow-lg";
  return "cursor-grab bg-white text-slate-900 shadow-lg active:cursor-grabbing";
});

const labelStyle = computed(() => {
  // ตอนโหลด/สำเร็จ โชว์ข้อความเต็ม — ไม่ fade ตาม progress
  if (locked.value || props.disabled) return { opacity: 1 };
  return { opacity: Math.max(0, 1 - progress.value * 1.4) };
});

let startX = 0;
let startOffset = 0;
let pointerId: number | null = null;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const reset = (animate = true) => {
  if (!animate) dragging.value = true;
  offset.value = 0;
  locked.value = false;
  succeeded.value = false;
  if (!animate) {
    requestAnimationFrame(() => {
      dragging.value = false;
    });
  }
};

const snapComplete = () => {
  if (locked.value) return;
  offset.value = maxOffset.value;
  locked.value = true;
  succeeded.value = false;
  emit("confirm");
};

const onPointerDown = (e: PointerEvent) => {
  if (props.disabled || props.loading || locked.value) return;
  const thumb = thumbRef.value;
  if (!thumb) return;
  e.preventDefault();
  dragging.value = true;
  startX = e.clientX;
  startOffset = offset.value;
  pointerId = e.pointerId;
  thumb.setPointerCapture(e.pointerId);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
};

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value || e.pointerId !== pointerId) return;
  const dx = e.clientX - startX;
  offset.value = clamp(startOffset + dx, 0, maxOffset.value);
};

const onPointerUp = (e: PointerEvent) => {
  if (e.pointerId !== pointerId) return;
  dragging.value = false;
  pointerId = null;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);

  if (progress.value >= props.threshold) {
    snapComplete();
  } else {
    offset.value = 0;
  }
};

const onKeydown = (e: KeyboardEvent) => {
  if (props.disabled || props.loading || locked.value) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    snapComplete();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    offset.value = clamp(offset.value + maxOffset.value * 0.2, 0, maxOffset.value);
    if (progress.value >= props.threshold) snapComplete();
  } else if (e.key === "ArrowLeft" || e.key === "Home") {
    e.preventDefault();
    offset.value = 0;
  } else if (e.key === "End") {
    e.preventDefault();
    snapComplete();
  }
};

watch(
  () => props.disabled,
  (v) => {
    if (v) reset(false);
  },
);

watch(
  () => props.loading,
  (loading, wasLoading) => {
    // ตรวจเสร็จแล้ว และยัง lock อยู่ = สำเร็จ (error จะ reset จาก parent)
    if (wasLoading && !loading && locked.value) {
      succeeded.value = true;
    }
  },
);

defineExpose({ reset });

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  const el = trackRef.value;
  if (!el || typeof ResizeObserver === "undefined") {
    trackWidth.value = el?.clientWidth ?? 0;
    return;
  }
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) trackWidth.value = entry.contentRect.width;
  });
  resizeObserver.observe(el);
  trackWidth.value = el.clientWidth;
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);
});
</script>
