<template>
  <div class="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 py-6">
    <div class="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

    <div class="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-[0_24px_44px_rgba(0,0,0,0.35)]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            LunarWater Admin
          </p>
          <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            เข้าสู่ระบบผู้ดูแล
          </h1>
          <p class="mt-2 text-sm text-slate-600">
            สำหรับทีมจัดการออเดอร์และสต็อกเท่านั้น
          </p>
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
            placeholder="admin@watershop.local"
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

        <p v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
          :disabled="isLoading"
        >
          {{ isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ Admin" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "guest",
});

const router = useRouter();
const { login } = useAuth();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const onSubmit = async () => {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    await login(email.value, password.value, "admin");
    await router.push(`/loading?to=${encodeURIComponent("/admin")}`);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ";
  } finally {
    isLoading.value = false;
  }
};
</script>
