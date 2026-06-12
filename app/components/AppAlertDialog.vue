<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="app-backdrop">
      <div
        v-if="state.open"
        class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="respond(false)"
      />
    </Transition>

    <!-- Panel -->
    <Transition name="app-dialog">
      <div
        v-if="state.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc="respond(false)"
      >
        <div
          ref="panelRef"
          role="alertdialog"
          aria-modal="true"
          class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_64px_-16px_rgba(15,23,42,0.32)] ring-1 ring-black/[0.04]"
          @click.stop
        >
          <h2 class="text-base font-bold text-slate-900">
            {{ state.title }}
          </h2>
          <p
            v-if="state.description"
            class="mt-1.5 text-sm leading-relaxed text-slate-500"
          >
            {{ state.description }}
          </p>

          <div class="mt-5 flex justify-end gap-2">
            <button
              v-if="state.showCancel"
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              @click="respond(false)"
            >
              {{ state.cancelText }}
            </button>
            <button
              ref="confirmRef"
              type="button"
              class="rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              :class="
                state.variant === 'destructive'
                  ? 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500'
                  : 'bg-slate-900 text-white hover:bg-slate-700 focus-visible:ring-slate-900'
              "
              @click="respond(true)"
            >
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { state, respond } = useAlertDialog()
const confirmRef = ref<HTMLButtonElement | null>(null)

watch(
  () => state.value.open,
  (open) => {
    if (open) {
      nextTick(() => confirmRef.value?.focus())
    }
  },
)
</script>

<style>
.app-backdrop-enter-active,
.app-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.app-backdrop-enter-from,
.app-backdrop-leave-to {
  opacity: 0;
}

.app-dialog-enter-active {
  transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.app-dialog-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease-in;
}
.app-dialog-enter-from,
.app-dialog-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(4px);
}
</style>
