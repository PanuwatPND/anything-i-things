<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 px-4 pb-32 pt-2 text-slate-900">
    <div class="mx-auto w-full max-w-md space-y-4">
      <div class="rounded-3xl bg-white p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
        <div class="flex items-center gap-3">
          <img
            :src="avatarPreview"
            alt="profile"
            class="h-14 w-14 rounded-full border border-black/10 bg-slate-100"
          />
          <div>
            <p class="text-xs text-slate-500">โปรไฟล์ผู้ใช้งาน</p>
            <p class="text-lg font-bold">{{ displayName }}</p>
            <p class="text-xs text-slate-500">{{ user?.email }}</p>
            <p class="text-xs text-slate-500">บทบาท: {{ user?.role }}</p>
          </div>
        </div>
      </div>

      <form class="rounded-3xl bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]" @submit.prevent="saveProfile">
        <p class="text-sm font-semibold text-slate-900">แก้ไขข้อมูลโปรไฟล์</p>
        <p class="mt-1 text-xs text-slate-500">สามารถอัปเดตชื่อ บ้านเลขที่ และรูปโปรไฟล์ได้</p>

        <div class="mt-4 space-y-3">
          <label class="block">
            <span class="text-xs font-medium text-slate-600">ชื่อ</span>
            <input
              v-model="form.name"
              type="text"
              class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="กรอกชื่อของคุณ"
            />
          </label>

          <label class="block">
            <span class="text-xs font-medium text-slate-600">บ้านเลขที่</span>
            <input
              v-model="form.houseNo"
              type="text"
              class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="เช่น 99/99"
            />
          </label>

          <div>
            <label class="text-xs font-medium text-slate-600">รูปโปรไฟล์</label>
            <div class="mt-2 flex items-center gap-3">
              <img :src="avatarPreview" alt="avatar preview" class="h-12 w-12 rounded-full border border-black/10 bg-slate-100" />
              <input
                type="file"
                accept="image/*"
                class="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                @change="onAvatarSelect"
              />
            </div>
          </div>
        </div>

        <p v-if="notice" class="mt-3 text-xs text-emerald-600">{{ notice }}</p>

        <button
          type="submit"
          class="mt-4 w-full rounded-xl bg-black px-4 py-2 font-semibold text-white hover:bg-slate-800"
        >
          บันทึกข้อมูลโปรไฟล์
        </button>
      </form>

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
  layout: 'user',
  middleware: 'auth',
})

type ReceiptItem = {
  amount: number
}

const RECEIPTS_STORAGE_KEY = 'watershop-receipts'
const DEFAULT_AVATAR = 'https://api.dicebear.com/9.x/initials/svg?seed=Water%20User'

const router = useRouter()
const { user, logout, updateProfile } = useAuth()
const receipts = ref<ReceiptItem[]>([])
const totalSpend = computed(() => receipts.value.reduce((sum, receipt) => sum + receipt.amount, 0))
const notice = ref('')
const form = reactive({
  name: '',
  houseNo: '',
  avatar: '',
})

const avatarPreview = computed(() => form.avatar || DEFAULT_AVATAR)
const displayName = computed(() => user.value?.name || 'ผู้ใช้งานทั่วไป')

if (import.meta.client) {
  const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY)
  receipts.value = raw ? (JSON.parse(raw) as ReceiptItem[]) : []
}

watchEffect(() => {
  form.name = user.value?.name ?? ''
  form.houseNo = user.value?.houseNo ?? ''
  form.avatar = user.value?.avatar ?? ''
})

const goHome = () => {
  router.push('/user')
}

const onLogout = () => {
  logout()
  router.push('/login')
}

const saveProfile = () => {
  updateProfile({
    name: form.name,
    houseNo: form.houseNo,
    avatar: form.avatar,
  })
  notice.value = 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว'
}

const onAvatarSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // เก็บเป็น base64 เพื่อใช้งานใน localStorage ได้ทันที
  const toBase64 = (blob: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
      reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปได้'))
      reader.readAsDataURL(blob)
    })

  try {
    form.avatar = await toBase64(file)
  } catch {
    notice.value = 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  }
}
</script>
