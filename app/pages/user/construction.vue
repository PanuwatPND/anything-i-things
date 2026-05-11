<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 px-4 py-6 text-slate-900"
  >
    <div class="mx-auto w-full max-w-md space-y-4">
      <section
        class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">
              ก่อสร้าง
            </h1>
            <p class="mt-1 text-sm text-slate-500">
              พื้นที่สำหรับจัดการงานก่อสร้าง
            </p>
          </div>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            @click="goHome"
          >
            กลับเมนูหลัก
          </button>
        </div>

        <div
          class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center"
        >
          <p class="text-sm font-semibold text-slate-700">กำลังเตรียมระบบ</p>
          <p class="mt-1 text-xs text-slate-500">
            หน้านี้พร้อมต่อยอดฟีเจอร์ก่อสร้างได้ทันที
          </p>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const router = useRouter();

const goHome = () => {
  router.push("/user");
};
</script>
