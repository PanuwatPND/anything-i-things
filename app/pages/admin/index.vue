<template>
  <div class="min-h-screen bg-[#ececec] px-4 py-8 text-slate-900">
    <div class="mx-auto w-full max-w-4xl">
      <div class="mb-4 flex items-start justify-between gap-4 rounded-3xl border border-black/10 bg-white p-5 shadow-[0_16px_34px_rgba(0,0,0,0.12)]">
        <div>
          <p class="text-sm text-slate-500">Admin Panel</p>
          <h1 class="text-2xl font-bold tracking-tight">จัดการ Stock น้ำ</h1>
          <p class="mt-2 text-sm text-slate-600">
            ล็อกอินด้วย: <span class="font-medium">{{ user?.email }}</span>
          </p>
        </div>
        <button
          class="rounded-xl border border-black px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
          @click="onLogout"
        >
          ออกจากระบบ
        </button>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div class="rounded-2xl bg-black p-4 text-white shadow-[0_12px_26px_rgba(0,0,0,0.25)] soft-pop">
          <p class="text-xs text-white/75">จำนวนเมนู</p>
          <p class="mt-1 text-2xl font-bold">{{ formatInt(items.length) }}</p>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-[0_12px_26px_rgba(0,0,0,0.16)] soft-pop">
          <p class="text-xs text-slate-500">สต็อกรวม</p>
          <p class="mt-1 text-2xl font-bold">{{ formatInt(totalStock) }}</p>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-[0_12px_26px_rgba(0,0,0,0.16)] soft-pop">
          <p class="text-xs text-slate-500">ใกล้หมด (<= 5)</p>
          <p class="mt-1 text-2xl font-bold">{{ formatInt(lowStockItems) }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_22px_rgba(0,0,0,0.1)] md:flex-row md:items-center md:justify-between soft-pop"
        >
          <div class="flex items-center gap-3">
            <div class="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-black/5">
              <img
                :src="item.image"
                :alt="item.name"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <p class="font-semibold">{{ item.name }}</p>
              <p class="text-sm text-slate-500">
                ราคา {{ formatInt(item.price) }} บาท · 1 แพ็ค = {{ formatInt(item.bottlesPerPack) }} ขวด
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-xl border border-black/30 bg-white px-3 py-1 text-sm font-semibold transition hover:bg-black hover:text-white"
              @click="adjust(item.id, item.stock - 1)"
            >
              -
            </button>
            <input
              :value="item.stock"
              type="number"
              min="0"
              class="no-spin w-24 rounded-xl border border-black/30 bg-white px-2 py-1 text-center text-slate-900 outline-none ring-black/20 focus:ring"
              @change="onInput(item.id, $event)"
            />
            <button
              class="rounded-xl border border-black/30 bg-white px-3 py-1 text-sm font-semibold transition hover:bg-black hover:text-white"
              @click="adjust(item.id, item.stock + 1)"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
})

const router = useRouter()
const { formatInt } = useFormatNumber()
const { user, logout } = useAuth()
const { items, hydrateShop, ensureCatalog, updateStock } = useLocalWatershop()
const totalStock = computed(() => items.value.reduce((sum, item) => sum + item.stock, 0))
const lowStockItems = computed(() => items.value.filter((item) => item.stock <= 5).length)

if (import.meta.client) {
  hydrateShop()
  ensureCatalog()
}

const adjust = (id: string, nextStock: number) => {
  updateStock(id, nextStock)
}

const onInput = (id: string, event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  updateStock(id, value)
}

const onLogout = () => {
  logout()
  router.push('/login')
}
</script>
