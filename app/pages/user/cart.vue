<template>
  <div class="min-h-screen bg-[#ececec] px-4 pb-32 pt-8 text-slate-900">
    <div class="mx-auto w-full max-w-md space-y-4">
      <div class="rounded-3xl bg-white p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500">Cart</p>
            <h1 class="text-xl font-bold">ตะกร้าของฉัน</h1>
          </div>
          <button class="rounded-xl border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white" @click="goHome">
            กลับ
          </button>
        </div>
      </div>

      <div class="rounded-3xl bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.12)]">
        <div v-if="cartItems.length === 0" class="rounded-2xl bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
          ยังไม่มีสินค้าในตะกร้า
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="flex items-center gap-3 rounded-2xl border border-black/10 bg-slate-50 p-3"
          >
            <div class="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
              <img
                :src="imageOf(item.id)"
                :alt="item.name"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold">{{ item.name }}</p>
              <p class="text-xs text-slate-500">
                1 แพ็ค = {{ bottlesOf(item.id) }} ขวด · 35 ฿ · 3 แพ็ค 100 ฿
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <input
                :value="item.quantity"
                type="number"
                min="1"
                class="no-spin w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-sm"
                @change="onQtyChange(item.id, $event)"
              />
              <button class="rounded-lg border border-black/20 px-2 py-1 text-xs hover:bg-black hover:text-white" @click="removeItem(item.id)">
                ลบ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-3xl bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.12)]">
        <div class="mb-3 flex items-center justify-between text-sm">
          <span class="text-slate-500">จำนวนทั้งหมด</span>
          <span class="font-semibold">
            {{ totalCount }} รายการ · {{ totalBottles }} แพ็ค
          </span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span class="text-slate-600">ยอดรวม</span>
          <span class="text-2xl font-bold">{{ totalAmount }} ฿</span>
        </div>

        <p v-if="message" class="mb-3 rounded-xl bg-black px-3 py-2 text-xs text-white">{{ message }}</p>

        <button
          class="w-full rounded-xl bg-black px-4 py-2.5 font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="cartItems.length === 0 || isCheckingOut"
          @click="checkout"
        >
          {{ isCheckingOut ? 'กำลังยืนยัน...' : 'ยืนยันสั่งซื้อ' }}
        </button>
      </div>

      <UserTabBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { WATER_CATALOG } from '~/composables/useLocalWatershop'

definePageMeta({
  middleware: 'auth',
})

const imageOf = (id: string) =>
  WATER_CATALOG.find((d) => d.id === id)?.image ?? '/products/water-bottle.png'
const bottlesOf = (id: string) =>
  WATER_CATALOG.find((d) => d.id === id)?.bottlesPerPack ?? 6

type ReceiptItem = {
  id: string
  itemName: string
  quantity: number
  amount: number
  createdAt: string
}

const RECEIPTS_STORAGE_KEY = 'watershop-receipts'

const router = useRouter()
const shop = useLocalWatershop()
const {
  items,
  cartItems,
  placeOrder,
  hydrateShop,
  ensureCatalog,
  updateQuantity,
  removeItem,
  clearCart,
  totalAmount,
  totalCount,
  totalBottles,
} = shop
const isCheckingOut = ref(false)
const message = ref('')

if (import.meta.client) {
  hydrateShop()
  ensureCatalog()
}

const goHome = () => {
  router.push('/user')
}

const onQtyChange = (id: string, event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  updateQuantity(id, value)
}

const checkout = async () => {
  message.value = ''
  isCheckingOut.value = true

  try {
    ensureCatalog()
    for (const cartItem of cartItems.value) {
      const stockItem = items.value.find((item) => item.id === cartItem.id)
      if (!stockItem) throw new Error(`ไม่พบสินค้า ${cartItem.name}`)
      if (stockItem.stock < cartItem.quantity) {
        throw new Error(`สต็อก ${cartItem.name} ไม่พอ`)
      }
    }

    const newReceipts: ReceiptItem[] = []
    for (const cartItem of cartItems.value) {
      const result = placeOrder(cartItem.id, cartItem.quantity)
      newReceipts.push({
        id: `${Date.now()}${Math.floor(Math.random() * 100)}`.slice(-6),
        itemName: result.itemName,
        quantity: cartItem.quantity,
        amount: result.amount,
        createdAt: new Date().toISOString(),
      })
    }

    if (import.meta.client) {
      const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY)
      const currentReceipts = raw ? (JSON.parse(raw) as ReceiptItem[]) : []
      localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify([...newReceipts, ...currentReceipts]))
    }

    clearCart()
    message.value = 'สั่งซื้อสำเร็จแล้ว'
    setTimeout(() => router.push('/user'), 500)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'สั่งซื้อไม่สำเร็จ'
  } finally {
    isCheckingOut.value = false
  }
}
</script>
