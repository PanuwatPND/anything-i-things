<template>
  <div class="min-h-screen bg-[#ececec] px-4 pb-32 pt-8 text-slate-900">
    <div class="mx-auto w-full max-w-md space-y-4">
      <div class="rounded-3xl bg-white p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
        <div class="flex items-center gap-3">
          <img
            src="https://api.dicebear.com/9.x/initials/svg?seed=Water%20User"
            alt="profile"
            class="h-14 w-14 rounded-full border border-black/10 bg-slate-100"
          />
          <div>
            <p class="text-xs text-slate-500">โปรไฟล์ผู้ใช้งาน</p>
            <p class="text-lg font-bold">{{ user?.email }}</p>
            <p class="text-xs text-slate-500">บทบาท: {{ user?.role }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-black p-4 text-white shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
          <p class="text-xs text-white/70">บิลทั้งหมด</p>
          <p class="mt-1 text-2xl font-bold">{{ receipts.length }}</p>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
          <p class="text-xs text-slate-500">ยอดสั่งรวม</p>
          <p class="mt-1 text-2xl font-bold">{{ totalSpend }}</p>
        </div>
      </div>

      <div class="rounded-3xl bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]">
        <button class="w-full rounded-xl border border-black px-4 py-2 font-semibold hover:bg-black hover:text-white" @click="goHome">
          ไปหน้าเมนูรวม
        </button>
        <button
          class="mt-2 w-full rounded-xl bg-black px-4 py-2 font-semibold text-white hover:bg-slate-800"
          @click="onLogout"
        >
          ออกจากระบบ
        </button>
      </div>

      <UserTabBar />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

type ReceiptItem = {
  amount: number
}

const RECEIPTS_STORAGE_KEY = 'watershop-receipts'

const router = useRouter()
const { user, logout } = useAuth()
const receipts = ref<ReceiptItem[]>([])
const totalSpend = computed(() => receipts.value.reduce((sum, receipt) => sum + receipt.amount, 0))

if (import.meta.client) {
  const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY)
  receipts.value = raw ? (JSON.parse(raw) as ReceiptItem[]) : []
}

const goHome = () => {
  router.push('/user')
}

const onLogout = () => {
  logout()
  router.push('/login')
}
</script>
