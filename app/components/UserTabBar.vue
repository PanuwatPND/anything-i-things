<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
  >
    <div
      class="pointer-events-auto mx-auto w-full max-w-md rounded-3xl bg-white p-2 shadow-[0_14px_36px_-16px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.06]"
    >
      <div class="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          :class="tabClass('home')"
          @click="go('/user/water')"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
          </svg>
          <span>หน้าแรก</span>
        </button>
        <button
          type="button"
          :class="tabClass('bills')"
          @click="go('/user/bills')"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 3h12v18l-2.5-1.8L13 21l-2.5-1.8L8 21l-2-1.4V3Z" />
            <path d="M9 8h6M9 12h6" />
          </svg>
          <span>บิล</span>
        </button>
        <button
          type="button"
          :class="tabClass('cart')"
          aria-label="ตะกร้า"
          @click="go('/user/cart')"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
            <path d="M3 4h2l2.4 10.5a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H7" />
          </svg>
          <span>ตะกร้า</span>
        </button>
        <button
          type="button"
          :class="tabClass('profile')"
          @click="go('/user/profile')"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20a7 7 0 0 1 14 0" />
          </svg>
          <span>โปรไฟล์</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

type TabId = 'home' | 'bills' | 'cart' | 'profile'

const norm = (path: string) => path.replace(/\/$/, '') || '/'

const activeTab = computed<TabId>(() => {
  const p = norm(route.path)
  if (p.startsWith('/user/water')) return 'home'
  if (p.startsWith('/user/bills')) return 'bills'
  if (p.startsWith('/user/cart')) return 'cart'
  if (p.startsWith('/user/profile')) return 'profile'
  return 'home'
})

const tabClass = (id: TabId) => {
  const on = activeTab.value === id
  return on
    ? 'flex h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900 text-xs font-semibold text-white shadow-sm transition'
    : 'flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800'
}

const go = (path: string) => {
  if (norm(route.path) === norm(path)) return
  router.push(path)
}
</script>
