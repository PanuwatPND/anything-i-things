<template>
  <div class="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 px-4 py-6">
    <div class="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl" />
    <div class="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-slate-300/30 blur-3xl" />

    <div class="mx-auto w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-[0_24px_44px_rgba(0,0,0,0.12)]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            LunarWater
          </p>
          <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            เข้าสู่ระบบ
          </h1>
          <p class="mt-2 text-sm text-slate-600">
            เริ่มใช้งานได้ทันที เลือกบทบาทก่อนเข้าสู่ระบบ
          </p>
        </div>
        <div class="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
          </svg>
        </div>
      </div>

      <form class="mt-7 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="email">อีเมล (ไม่บังคับ)</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            class="w-full rounded-xl border border-slate-300/80 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none ring-black/20 transition focus:border-slate-500 focus:bg-white focus:ring"
            placeholder="เช่น user@watershop.local"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="password">รหัสผ่าน (ไม่บังคับ)</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-xl border border-slate-300/80 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none ring-black/20 transition focus:border-slate-500 focus:bg-white focus:ring"
            placeholder="เว้นว่างได้"
          />
        </div>

        <div>
          <p class="mb-2 text-sm font-medium text-slate-700">เลือกบทบาท</p>
          <div class="grid grid-cols-2 gap-2">
            <label
              class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition"
              :class="
                role === 'user'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-[0_8px_18px_rgba(15,23,42,0.2)]'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              "
            >
              <input v-model="role" type="radio" value="user" />
              <span>ผู้ใช้งาน</span>
            </label>
            <label
              class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition"
              :class="
                role === 'admin'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-[0_8px_18px_rgba(15,23,42,0.2)]'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              "
            >
              <input v-model="role" type="radio" value="admin" />
              <span>ผู้ดูแลระบบ</span>
            </label>
          </div>
          <p class="mt-2 text-[11px] text-slate-500">
            บทบาทผู้ใช้งานจะเข้าสู่หน้าสั่งน้ำโดยตรง
          </p>
        </div>

        <p v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
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
