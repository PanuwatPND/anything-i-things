<template>
  <div class="relative min-h-screen overflow-hidden bg-[#ececec] px-4 py-10">
    <div class="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-black/5 blur-2xl" />
    <div class="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-black/5 blur-2xl" />

    <div class="mx-auto w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-[0_24px_44px_rgba(0,0,0,0.15)] float-in">
      <p class="inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">Water Shop</p>
      <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">ยินดีต้อนรับ</h1>
      <p class="mt-2 text-sm text-slate-600">กดเข้าสู่ระบบได้ทันที ไม่บังคับกรอกอีเมล/รหัสผ่าน</p>

      <form class="mt-7 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="email">อีเมล (ไม่บังคับ)</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            class="w-full rounded-xl border border-slate-300/80 bg-white px-3 py-2.5 text-slate-800 outline-none ring-black/20 transition focus:ring"
            placeholder="เว้นว่างได้"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="password">รหัสผ่าน (ไม่บังคับ)</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-xl border border-slate-300/80 bg-white px-3 py-2.5 text-slate-800 outline-none ring-black/20 transition focus:ring"
            placeholder="เว้นว่างได้"
          />
        </div>

        <div>
          <p class="mb-2 text-sm font-medium text-slate-700">เลือกบทบาท</p>
          <div class="grid grid-cols-2 gap-2">
            <label
              class="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition"
              :class="
                role === 'user'
                  ? 'border-black bg-black text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              "
            >
              <input v-model="role" type="radio" value="user" />
              <span>user (สั่งน้ำ)</span>
            </label>
            <label
              class="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition"
              :class="
                role === 'admin'
                  ? 'border-black bg-black text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              "
            >
              <input v-model="role" type="radio" value="admin" />
              <span>admin (จัดการ stock)</span>
            </label>
          </div>
        </div>

        <p v-if="errorMessage" class="text-sm text-rose-600">{{ errorMessage }}</p>

        <button
          type="submit"
          class="w-full rounded-xl bg-black px-4 py-2.5 font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
          :disabled="isLoading"
        >
          {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const role = ref<'user' | 'admin'>('user')
const isLoading = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await login(email.value, password.value, role.value)
    const destination = role.value === 'admin' ? '/admin' : '/user/water'
    await router.push(`/loading?to=${encodeURIComponent(destination)}`)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}
</script>
