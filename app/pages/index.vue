<template>
  <div class="min-h-screen bg-[#ececec] px-4 py-10">
    <div class="mx-auto w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-[0_24px_44px_rgba(0,0,0,0.15)]">
      <p class="text-sm text-slate-500">กำลังพาไปหน้าที่เหมาะกับสิทธิ์ผู้ใช้...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { user, hydrate } = useAuth()

onMounted(async () => {
  hydrate()
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  if (user.value.role === 'admin') {
    await navigateTo('/admin')
  } else {
    await navigateTo('/user/water')
  }
})
</script>
