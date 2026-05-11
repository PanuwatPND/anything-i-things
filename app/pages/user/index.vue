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
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">
              เมนูหลัก
            </h1>
            <p class="mt-1 text-sm text-slate-500">
              เลือกบริการที่ต้องการใช้งาน
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              @click="go('/loading-preview')"
            >
              ดูพรีวิว Loading
            </button>
            <button
              type="button"
              class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              @click="goProfile"
            >
              โปรไฟล์
            </button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3">
          <button
            type="button"
            class="group rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            @click="go('/user/water')"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-700"
                >
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M12 3s-5 5-5 9a5 5 0 0 0 10 0c0-4-5-9-5-9Z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-bold text-slate-900">สั่งน้ำ</p>
                  <p class="text-xs text-slate-500">จัดการออเดอร์และตะกร้า</p>
                </div>
              </div>
              <span
                class="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200"
              >
                พร้อมใช้
              </span>
            </div>
          </button>

          <button
            type="button"
            class="group rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            @click="go('/user/construction')"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700"
                >
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V9l7-5 7 5v12" />
                    <path d="M9 21v-6h6v6" />
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-bold text-slate-900">ก่อสร้าง</p>
                  <p class="text-xs text-slate-500">งานหน้างานและติดตามโปรเจกต์</p>
                </div>
              </div>
              <span
                class="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200"
              >
                เข้าใช้งาน
              </span>
            </div>
          </button>
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

const go = (path: string) => {
  router.push(path);
};

const goProfile = () => {
  router.push("/user/profile");
};
</script>
