<template>
  <div class="relative">
    <AppLoadingScreen
      message="พรีวิวหน้า Loading..."
      :complete="isComplete"
    />

    <div class="absolute left-4 top-4 z-20">
      <button
        type="button"
        class="rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/45"
        @click="goBack"
      >
        กลับเมนูหลัก
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const isComplete = ref(false);

onMounted(() => {
  window.setTimeout(() => {
    isComplete.value = true;
  }, 1200);
});

const goBack = () => {
  router.push("/user");
};
</script>
