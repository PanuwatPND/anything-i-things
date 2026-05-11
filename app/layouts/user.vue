<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100"
  >
    <div class="sticky top-0 z-30">
      <div class="mx-auto w-full max-w-md ">
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
