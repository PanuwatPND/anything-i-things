<template>
  <div>
    <ClientOnly>
      <Teleport to="body">
        <Transition name="route-blur">
          <div
            v-if="routeNavBlur"
            class="pointer-events-auto fixed inset-0 z-[100] bg-slate-100/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />
        </Transition>
      </Teleport>
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <AppAlertDialog />
      <AppToast />
      <PwaInstallPrompt />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const routeNavBlur = useState('route-nav-blur', () => false)
</script>

<style>
.route-blur-enter-active,
.route-blur-leave-active {
  transition: opacity 0.18s ease;
}

.route-blur-enter-from,
.route-blur-leave-to {
  opacity: 0;
}
</style>