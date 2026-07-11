<template>
  <Transition name="pwa-prompt">
    <div
      v-if="showPrompt"
      class="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-40 mx-auto max-w-md"
    >
      <div
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
      >
        <div class="flex items-start gap-3">
          <img
            src="/app-icon.png"
            alt=""
            class="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">เพิ่ม LunarWater ลงหน้าจอ</p>
            <p v-if="canInstall" class="mt-1 text-xs leading-relaxed text-slate-500">
              กดติดตั้งเพื่อเปิดแอปได้ทันทีเหมือนแอปมือถือ ไม่ต้องพิมพ์ URL ใหม่
            </p>
            <p v-else class="mt-1 text-xs leading-relaxed text-slate-500">
              กด <span class="font-semibold text-slate-700">แชร์</span>
              แล้วเลือก
              <span class="font-semibold text-slate-700">เพิ่มไปที่หน้าจอโฮม</span>
              (Add to Home Screen)
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="ปิด"
            @click="dismissForDays()"
          >
            ✕
          </button>
        </div>

        <button
          v-if="canInstall"
          type="button"
          class="mt-3 w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
          @click="onInstall"
        >
          ติดตั้งแอป
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { canInstall, showPrompt, install, dismissForDays } = usePwaInstall();

const onInstall = async () => {
  const accepted = await install();
  if (!accepted) dismissForDays(3);
};
</script>

<style scoped>
.pwa-prompt-enter-active,
.pwa-prompt-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.pwa-prompt-enter-from,
.pwa-prompt-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
