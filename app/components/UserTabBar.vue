<template>
  <div class="rounded-[2rem] bg-white px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.1)]">
    <div class="grid grid-cols-4 gap-2 text-center text-xs">
      <button
        type="button"
        :class="tabClass('home')"
        @click="go('/user')"
      >
        หน้าแรก
      </button>
      <button
        type="button"
        :class="tabClass('bills')"
        @click="go('/user/bills')"
      >
        บิล
      </button>
      <button
        type="button"
        :class="tabClass('cart', true)"
        aria-label="ตะกร้า"
        @click="go('/user/cart')"
      >
        +
      </button>
      <button
        type="button"
        :class="tabClass('profile')"
        @click="go('/user/profile')"
      >
        โปรไฟล์
      </button>
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
  if (p === '/user') return 'home'
  if (p.startsWith('/user/bills')) return 'bills'
  if (p.startsWith('/user/cart')) return 'cart'
  if (p.startsWith('/user/profile')) return 'profile'
  return 'home'
})

const tabClass = (id: TabId, outlined?: boolean) => {
  const on = activeTab.value === id
  if (outlined) {
    return on
      ? 'rounded-xl border-2 border-black bg-black px-2 py-2 font-semibold text-white'
      : 'rounded-xl border border-black px-2 py-2 font-semibold text-slate-700 transition hover:bg-slate-50'
  }
  return on
    ? 'rounded-xl bg-black px-2 py-2 font-medium text-white'
    : 'rounded-xl px-2 py-2 font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800'
}

const go = (path: string) => {
  if (norm(route.path) === norm(path)) return
  router.push(path)
}
</script>
