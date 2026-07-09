<template>
  <div class="mx-auto w-full max-w-lg space-y-4">
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

        <div class="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="group flex min-h-[148px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            @click="go('/user/water')"
          >
            <div class="flex items-start justify-between gap-2">
              <div
                class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700"
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
              <span
                class="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200"
              >
                พร้อมใช้
              </span>
            </div>
            <div class="mt-2 min-h-0 flex-1">
              <p class="text-base font-bold leading-snug text-slate-900">
                สั่งน้ำ
              </p>
              <p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                จัดการออเดอร์และตะกร้า
              </p>
            </div>
          </button>

          <button
            type="button"
            class="group flex min-h-[148px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            @click="go('/user/construction')"
          >
            <div class="flex items-start justify-between gap-2">
              <div
                class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"
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
              <span
                class="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200"
              >
                เข้าใช้งาน
              </span>
            </div>
            <div class="mt-2 min-h-0 flex-1">
              <p class="text-base font-bold leading-snug text-slate-900">
                ก่อสร้าง
              </p>
              <p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                งานหน้างานและติดตามโปรเจกต์
              </p>
            </div>
          </button>

          <button
            type="button"
            class="group flex min-h-[148px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            @click="go('/user/community-pimnara')"
          >
            <div class="flex items-start justify-between gap-2">
              <div
                class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span
                class="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200"
              >
                เข้าใช้งาน
              </span>
            </div>
            <div class="mt-2 min-h-0 flex-1">
              <p class="text-base font-bold leading-snug text-slate-900">
                Community Pimnara
              </p>
              <p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                ชุมชน ข่าวสาร และกิจกรรม
              </p>
            </div>
          </button>
        </div>
      </section>

    </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "user",
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
