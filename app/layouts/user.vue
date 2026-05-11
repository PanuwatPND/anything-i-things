<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
    <div class="px-4 pt-[max(env(safe-area-inset-top),0.6rem)]">
      <div class="mx-auto w-full max-w-md">
        <UserTopHeader />
      </div>
    </div>
    <div class="pt-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Keep header as a single static instance (no floating clone).
</script>
