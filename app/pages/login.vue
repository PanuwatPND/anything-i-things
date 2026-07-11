<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0b1220] text-white">
  <!-- background -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div class="absolute -right-16 top-32 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
      <div class="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
      <div
        class="absolute inset-0 opacity-[0.35]"
        style="background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px); background-size: 24px 24px;"
      />
    </div>

    <div class="relative mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 py-10">
      <!-- hero -->
      <div class="mb-8 text-center">
        <div class="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
          <img src="/app-icon.png" alt="LunarWater" class="h-14 w-14 rounded-2xl object-cover shadow-lg" />
        </div>
        <p class="mt-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-cyan-100">
          LunarWater · หมู่บ้าน
        </p>
        <h1 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          สั่งน้ำดื่มง่ายๆ
        </h1>
        <p class="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-300">
          เข้าใช้งานได้ทันที — ไม่ต้องมีอีเมลก็ได้ แค่ระบุบ้านเลขที่
        </p>
      </div>

      <!-- form card -->
      <div class="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-300" for="email">
              อีเมล <span class="font-normal normal-case text-slate-500">(ไม่บังคับ)</span>
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              class="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-cyan-400/30 transition focus:border-cyan-400/40 focus:bg-white/15 focus:ring-2"
              placeholder="เช่น user@email.com"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-300" for="password">
              รหัสผ่าน <span class="font-normal normal-case text-slate-500">(ไม่บังคับ)</span>
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-cyan-400/30 transition focus:border-cyan-400/40 focus:bg-white/15 focus:ring-2"
              placeholder="เว้นว่างได้"
            />
          </div>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="!email.trim()">
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-300" for="houseNo">
                บ้านเลขที่ <span class="text-rose-300">*</span>
              </label>
              <input
                id="houseNo"
                v-model="houseNo"
                type="text"
                inputmode="numeric"
                autocomplete="street-address"
                class="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-cyan-400/30 transition focus:border-cyan-400/40 focus:bg-white/15 focus:ring-2"
                placeholder="เช่น 12"
              />
              <p class="mt-2 text-[11px] leading-relaxed text-slate-400">
                ใช้จัดส่งและแจ้งออเดอร์ — แก้ได้ภายหลังที่โปรไฟล์
              </p>
            </div>
          </Transition>

          <p
            v-if="errorMessage"
            class="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-100"
          >
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            class="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-[0_12px_32px_-8px_rgba(34,211,238,0.55)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isLoading"
          >
            <span class="relative z-10">{{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าใช้งาน' }}</span>
            <span
              class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
          </button>
        </form>
      </div>

      <!-- features -->
      <ul class="mt-6 grid grid-cols-3 gap-2 text-center text-[10px] font-medium text-slate-400">
        <li class="rounded-2xl border border-white/5 bg-white/5 px-2 py-3 backdrop-blur-sm">
          <span class="mb-1 block text-base">💧</span>
          สั่งน้ำ
        </li>
        <li class="rounded-2xl border border-white/5 bg-white/5 px-2 py-3 backdrop-blur-sm">
          <span class="mb-1 block text-base">📱</span>
          QR จ่าย
        </li>
        <li class="rounded-2xl border border-white/5 bg-white/5 px-2 py-3 backdrop-blur-sm">
          <span class="mb-1 block text-base">🛵</span>
          สั่งด่วน
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false,
})

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const houseNo = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  errorMessage.value = ''
  if (!email.value.trim() && !houseNo.value.trim()) {
    errorMessage.value = 'กรุณาระบุบ้านเลขที่ หรือกรอกอีเมล'
    return
  }
  isLoading.value = true

  try {
    await login(email.value, password.value, 'user', {
      houseNo: houseNo.value.trim(),
    })
    await router.push(`/loading?to=${encodeURIComponent('/user/water')}`)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}
</script>
