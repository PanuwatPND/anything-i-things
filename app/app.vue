<template>
  <div>
    <ClientOnly>
      <Teleport to="body">
        <Transition name="route-blur">
          <div
            v-if="routeNavBlur"
            class="pointer-events-auto fixed inset-0 z-[100] bg-white/25 backdrop-blur-md"
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
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const routeNavBlur = useState('route-nav-blur', () => false)
</script>

<style>
.route-blur-enter-active,
.route-blur-leave-active {
  transition: opacity 0.22s ease;
}

.route-blur-enter-from,
.route-blur-leave-to {
  opacity: 0;
}
</style>