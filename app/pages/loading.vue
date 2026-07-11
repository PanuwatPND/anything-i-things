<template>
  <AppLoadingScreen :complete="isComplete" />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const isComplete = ref(false);

onMounted(() => {
  const to = typeof route.query.to === "string" ? route.query.to : "/user";

  window.setTimeout(() => {
    isComplete.value = true;
  }, 900);

  window.setTimeout(() => {
    router.replace(to);
  }, 1650);
});
</script>
