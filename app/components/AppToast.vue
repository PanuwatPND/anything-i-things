<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-4 top-4 z-[200] flex flex-col items-end gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="app-toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex w-72 items-start gap-3 overflow-hidden rounded-2xl bg-white py-3 pl-4 pr-3 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.2)] ring-1 ring-black/[0.05]"
          :role="t.type === 'error' ? 'alert' : 'status'"
        >
          <!-- icon -->
          <div
            class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            :class="{
              'bg-emerald-100 text-emerald-600': t.type === 'success',
              'bg-rose-100 text-rose-600': t.type === 'error',
              'bg-sky-100 text-sky-600': t.type === 'info',
            }"
          >
            <!-- success checkmark -->
            <svg
              v-if="t.type === 'success'"
              class="h-3 w-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="2,6 5,9 10,3" />
            </svg>
            <!-- error x -->
            <svg
              v-else-if="t.type === 'error'"
              class="h-3 w-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="3" y1="3" x2="9" y2="9" />
              <line x1="9" y1="3" x2="3" y2="9" />
            </svg>
            <!-- info dot -->
            <svg
              v-else
              class="h-3 w-3"
              viewBox="0 0 12 12"
              fill="currentColor"
            >
              <circle cx="6" cy="4" r="1" />
              <rect x="5" y="6" width="2" height="4" rx="1" />
            </svg>
          </div>

          <!-- text -->
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-900">{{ t.title }}</p>
            <p v-if="t.description" class="mt-0.5 text-xs leading-snug text-slate-500">
              {{ t.description }}
            </p>
          </div>

          <!-- close -->
          <button
            type="button"
            class="mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="ปิด"
            @click="remove(t.id)"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="3" x2="11" y2="11" />
              <line x1="11" y1="3" x2="3" y2="11" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<style>
.app-toast-enter-active {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}
.app-toast-leave-active {
  transition: transform 0.18s ease-in, opacity 0.18s ease;
}
.app-toast-enter-from {
  transform: translateX(110%);
  opacity: 0;
}
.app-toast-leave-to {
  transform: translateX(110%);
  opacity: 0;
}
.app-toast-move {
  transition: transform 0.2s ease;
}
</style>
