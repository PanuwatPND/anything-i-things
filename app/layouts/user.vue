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
    <div :class="['min-h-screen', showHeader && 'user-layout-main-offset']">
      <div>
        <slot />
      </div>
    </div>
    <UserFinanceChatDock />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const showHeader = computed(() => route.path !== "/user");
</script>

<style scoped>
/* สูงรวม = safe-area + แถบ header — ต้องเท่ากับบล็อก fixed ด้านบน (ไม่บวกช่องเกินเพื่อกันแถบขาว) */
.user-layout-main-offset {
  padding-top: calc(max(env(safe-area-inset-top), 0.5rem) + 4.75rem);
}
</style>
