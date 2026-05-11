<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100"
  >
    <div v-if="showHeader" class="sticky top-0 z-30">
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
const route = useRoute();
const showHeader = computed(() => route.path !== "/user");
</script>
