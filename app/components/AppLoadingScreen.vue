<template>
  <div
    class="relative grid min-h-screen place-items-center overflow-hidden bg-[#06080d] px-6 text-white"
  >
    <div
      class="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-[54%] rounded-full bg-sky-400/10 blur-3xl"
    />
    <div
      class="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-[44%] rounded-full bg-cyan-300/10 blur-2xl"
    />

    <div class="relative -translate-y-6 flex w-full max-w-sm flex-col items-center text-center">
      <div class="logo-stage grid place-items-center p-2">
        <div v-if="!complete" class="logo-floor" />
        <div v-if="!complete" class="logo-halo" />
        <div v-if="!complete" class="logo-orbit">
          <span class="logo-orbit-dot" />
        </div>
        <img
          v-if="!complete"
          :src="logoSrc"
          alt="POND loading"
          class="logo-core h-28 w-28 object-contain"
        />
        <p v-else class="brand-wordmark brand-reveal"><span class="brand-caret">|</span><span class="brand-text-wrap"><span class="brand-text">{{ brandText }}</span></span></p>
      </div>

      <p class="mt-7 text-base font-medium tracking-wide text-slate-200">
        {{ message }}
      </p>
      <div v-if="!complete" class="mt-4 flex items-center gap-2">
        <span class="pulse-dot pulse-dot-1" />
        <span class="pulse-dot pulse-dot-2" />
        <span class="pulse-dot pulse-dot-3" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    message?: string;
    logoSrc?: string;
    brandText?: string;
    complete?: boolean;
  }>(),
  {
    message: "กำลังเตรียมหน้าถัดไป...",
    logoSrc: "/loading_app.png",
    brandText: "LunarWater",
    complete: false,
  },
);

</script>

<style scoped>
.logo-stage {
  min-height: 120px;
  perspective: 800px;
}

.logo-floor {
  grid-area: 1 / 1;
  width: 86px;
  height: 18px;
  border-radius: 9999px;
  transform: translateY(42px);
  background: radial-gradient(
    ellipse at center,
    rgba(14, 116, 144, 0.35) 0%,
    rgba(14, 116, 144, 0.04) 70%,
    rgba(14, 116, 144, 0) 100%
  );
  filter: blur(4px);
  animation: floor-breathe 1.9s ease-in-out infinite;
}

.logo-halo {
  grid-area: 1 / 1;
  height: 128px;
  width: 128px;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    rgba(56, 189, 248, 0.2) 0%,
    rgba(56, 189, 248, 0) 68%
  );
  animation: halo-pulse 1.8s ease-in-out infinite;
}

.logo-orbit {
  grid-area: 1 / 1;
  position: relative;
  height: 122px;
  width: 122px;
  animation: orbit-spin 3.5s linear infinite;
}

.logo-orbit-dot {
  position: absolute;
  left: 50%;
  top: 0;
  height: 6px;
  width: 6px;
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  background: rgb(103 232 249 / 0.95);
  box-shadow: 0 0 8px rgba(103, 232, 249, 0.8);
}

.logo-core {
  grid-area: 1 / 1;
  animation:
    logo-float 2.2s ease-in-out infinite,
    logo-breathe 1.8s ease-in-out infinite;
  filter:
    drop-shadow(0 0 16px rgba(56, 189, 248, 0.2))
    drop-shadow(0 10px 22px rgba(2, 6, 23, 0.55));
}

.brand-wordmark {
  grid-area: 1 / 1;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  font-family:
    "Manrope",
    "Avenir Next",
    "SF Pro Display",
    "Inter",
    "Segoe UI",
    sans-serif;
  color: rgb(226 232 240 / 0.98);
  text-shadow:
    0 0 18px rgba(56, 189, 248, 0.22),
    0 8px 28px rgba(0, 0, 0, 0.4);
}

.brand-reveal {
  animation: wordmark-in 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.brand-caret {
  display: inline-block;
  margin-right: 0.01em;
  opacity: 0.95;
  transform: translateY(1px);
  animation:
    caret-blink 220ms steps(1, end) 3,
    caret-out 180ms ease 520ms forwards;
}

.brand-text-wrap {
  display: inline-block;
  overflow: hidden;
  width: 0;
  white-space: nowrap;
  animation: text-expand 620ms cubic-bezier(0.22, 1, 0.36, 1) 120ms forwards;
}

.brand-text {
  display: inline-block;
  transform: translateX(-8px);
  opacity: 0;
  animation: text-fade 460ms ease 170ms forwards;
}

.pulse-dot {
  height: 7px;
  width: 7px;
  border-radius: 9999px;
  background: rgb(103 232 249 / 0.9);
  animation: pulse-dot 1.1s ease-in-out infinite;
}

.pulse-dot-2 {
  animation-delay: 0.15s;
}

.pulse-dot-3 {
  animation-delay: 0.3s;
}

@keyframes logo-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes floor-breathe {
  0%,
  100% {
    opacity: 0.45;
    transform: translateY(42px) scale(0.95);
  }
  50% {
    opacity: 0.75;
    transform: translateY(42px) scale(1.05);
  }
}

@keyframes halo-pulse {
  0%,
  100% {
    transform: scale(0.94);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.03);
    opacity: 0.95;
  }
}

@keyframes orbit-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes logo-breathe {
  0%,
  100% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes wordmark-in {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
    letter-spacing: 0.04em;
    filter: blur(6px);
  }
  70% {
    opacity: 1;
    transform: translateY(0) scale(1.01);
    letter-spacing: 0.012em;
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    letter-spacing: 0.01em;
    filter: blur(0);
  }
}

@keyframes caret-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0.25;
  }
}

@keyframes caret-out {
  from {
    opacity: 0.95;
    transform: translateY(1px) scaleX(1);
  }
  to {
    opacity: 0;
    transform: translateY(1px) scaleX(0.75);
  }
}

@keyframes text-expand {
  from {
    width: 0;
  }
  to {
    width: 10.2ch;
  }
}

@keyframes text-fade {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: translateY(0) scale(0.9);
    opacity: 0.35;
  }
  50% {
    transform: translateY(-2px) scale(1.15);
    opacity: 1;
  }
}
</style>
