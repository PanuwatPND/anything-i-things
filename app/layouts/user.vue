<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100"
  >
    <header
      v-if="showHeader"
      class="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100"
    >
      <div class="mx-auto flex w-full max-w-md items-center">
        <UserTopHeader class="w-full px-4" />
      </div>
    </header>
    <div
      :class="[
        'min-h-screen',
        showHeader && 'user-layout-main-offset',
        showTabBar && 'pb-[calc(env(safe-area-inset-bottom)+4.25rem)]',
      ]"
    >
      <div class="px-4 py-2">
        <slot />
      </div>
    </div>
    <UserFinanceChatDock />
    <UserTabBar v-if="showTabBar" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const showHeader = computed(() => route.path !== "/user");
const showTabBar = computed(() => !route.path.startsWith("/user/payment"));
</script>

<style scoped>
.user-layout-main-offset {
  padding-top: calc(max(env(safe-area-inset-top), 0.5rem) + 4.75rem);
}
</style>
