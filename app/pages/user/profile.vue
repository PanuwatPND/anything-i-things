<template>
  <div class="mx-auto w-full max-w-md space-y-4 pb-4">
    <div
      class="rounded-3xl bg-white p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]"
    >
      <div class="flex items-center gap-3">
        <img
          :src="avatarPreview"
          alt="profile"
          class="h-16 w-16 rounded-full border border-black/10 bg-slate-100 object-cover"
        />
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500">บ้าน {{ houseLabel }}</p>
          <p class="truncate text-lg font-bold text-slate-900">{{ displayName }}</p>
          <p v-if="user?.email" class="truncate text-xs text-slate-500">
            {{ user.email }}
          </p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <div
          class="rounded-2xl bg-black p-3.5 text-white shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
        >
          <p class="text-[11px] text-white/70">บิลทั้งหมด</p>
          <p class="mt-0.5 text-xl font-bold">{{ formatInt(receipts.length) }}</p>
        </div>
        <div
          class="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200"
        >
          <p class="text-[11px] text-slate-500">ยอดสั่งรวม</p>
          <p class="mt-0.5 text-xl font-bold text-slate-900">
            {{ formatInt(totalSpend) }} ฿
          </p>
        </div>
      </div>
    </div>

    <form
      class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
      @submit.prevent="saveProfile"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-slate-900">แก้ไขโปรไฟล์</p>
          <p class="mt-0.5 text-xs text-slate-500">
            ใช้ตอนสั่งน้ำและแจ้งเตือนการจัดส่ง
          </p>
        </div>
        <span
          v-if="isDirty"
          class="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/80"
        >
          มีการแก้ไข
        </span>
      </div>

      <div class="mt-5">
        <p class="text-xs font-medium text-slate-600">รูปโปรไฟล์</p>
        <div class="mt-2 flex items-center gap-3">
          <img
            :src="avatarPreview"
            alt="avatar preview"
            class="h-14 w-14 rounded-full bg-slate-100 object-cover ring-1 ring-slate-200"
          />
          <div class="min-w-0 flex-1">
            <label
              class="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              เปลี่ยนรูป
              <input
                ref="avatarInputRef"
                type="file"
                accept="image/*"
                class="sr-only"
                @change="onAvatarSelect"
              />
            </label>
            <p class="mt-1.5 truncate text-[11px] text-slate-400">
              {{ avatarFileLabel }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-4 space-y-3">
        <label class="block">
          <span class="text-xs font-medium text-slate-600">ชื่อที่แสดง</span>
          <input
            v-model="form.name"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="เช่น คุณสมชาย"
          />
        </label>

        <label class="block">
          <span class="text-xs font-medium text-slate-600">บ้านเลขที่</span>
          <input
            v-model="form.houseNo"
            type="text"
            inputmode="numeric"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="เช่น 30"
          />
        </label>
      </div>

      <button
        type="submit"
        :disabled="!canSave"
        class="mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:active:scale-100"
        :class="
          canSave
            ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800'
            : 'bg-slate-100 text-slate-400'
        "
      >
        <span v-if="justSaved" class="inline-flex items-center justify-center gap-1.5">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          บันทึกแล้ว
        </span>
        <span v-else-if="!isDirty">ไม่มีการเปลี่ยนแปลง</span>
        <span v-else>บันทึกการแก้ไข</span>
      </button>
    </form>

    <div
      v-if="!isStandalone"
      class="rounded-3xl bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]"
    >
      <p class="text-sm font-semibold text-slate-900">เพิ่มลงหน้าจอโฮม</p>
      <p class="mt-1 text-xs leading-relaxed text-slate-500">
        เปิดแอปได้ทันทีเหมือนแอปมือถือ ไม่ต้องพิมพ์ URL ใหม่ทุกครั้ง
      </p>

      <button
        v-if="canInstall"
        type="button"
        class="mt-3 w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 active:scale-[0.99]"
        @click="onInstallApp"
      >
        ติดตั้ง LunarWater
      </button>
      <p v-else class="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
        <template v-if="isIos">
          เปิดด้วย <span class="font-semibold">Safari</span> → กด
          <span class="font-semibold">แชร์</span> → เลือก
          <span class="font-semibold">เพิ่มไปที่หน้าจอโฮม</span>
        </template>
        <template v-else>
          เปิดเมนูเบราว์เซอร์ (⋮) แล้วเลือก
          <span class="font-semibold">ติดตั้งแอป</span> หรือ
          <span class="font-semibold">เพิ่มไปที่หน้าจอหลัก</span>
        </template>
      </p>
      <p v-if="installNotice" class="mt-2 text-xs text-emerald-600">
        {{ installNotice }}
      </p>
    </div>

    <div
      v-else
      class="rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-200"
    >
      <p class="text-sm font-semibold text-emerald-900">ติดตั้งแล้ว</p>
      <p class="mt-1 text-xs text-emerald-700">
        เปิดจากไอคอนบนหน้าจอโฮมได้เลย
      </p>
    </div>

    <div class="rounded-3xl bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]">
      <p class="text-sm font-semibold text-slate-900">ทางลัด</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
          @click="router.push('/user/water')"
        >
          สั่งน้ำดื่ม
        </button>
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
          @click="router.push('/user/bills')"
        >
          ดูบิล
        </button>
      </div>
    </div>

    <div class="rounded-3xl bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]">
      <p class="text-sm font-semibold text-slate-900">แชทบอทลุคซาเก้ท</p>
      <p class="mt-1 text-xs text-slate-500">
        ล้างชื่อเล่นในเครื่อง — เปิดแชทครั้งถัดไปจะถามชื่อใหม่
      </p>
      <button
        type="button"
        class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        @click="clearChatDisplayName"
      >
        ล้างชื่อในแชท
      </button>
      <p v-if="chatNotice" class="mt-2 text-xs text-emerald-600">{{ chatNotice }}</p>
    </div>

    <button
      type="button"
      class="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.99]"
      @click="onLogout"
    >
      ออกจากระบบ
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "user",
  middleware: "auth",
});

const DEFAULT_AVATAR = "/default-avatar.png";
/** ต้องตรงกับ UserFinanceChatDock.vue */
const CHAT_DISPLAY_NAME_KEY = "lunarwater-chat-display-name";

const router = useRouter();
const { formatInt } = useFormatNumber();
const { user, logout, updateProfile } = useAuth();
const { receipts, loadReceipts } = useWatershopReceipts();
const { canInstall, isIos, isStandalone, install } = usePwaInstall();
const { success: toastSuccess, error: toastError } = useToast();

const totalSpend = computed(() =>
  receipts.value.reduce((sum, receipt) => sum + receipt.amount, 0),
);
const chatNotice = ref("");
const installNotice = ref("");
const justSaved = ref(false);
const avatarFileName = ref("");
const avatarInputRef = ref<HTMLInputElement | null>(null);
let savedTimer: ReturnType<typeof setTimeout> | null = null;

const form = reactive({
  name: "",
  houseNo: "",
  avatar: "",
});

const savedSnapshot = computed(() => ({
  name: (user.value?.name ?? "").trim(),
  houseNo: (user.value?.houseNo ?? "").trim(),
  avatar: user.value?.avatar ?? "",
}));

const isDirty = computed(() => {
  const saved = savedSnapshot.value;
  return (
    form.name.trim() !== saved.name ||
    form.houseNo.trim() !== saved.houseNo ||
    form.avatar !== saved.avatar
  );
});

const canSave = computed(() => isDirty.value && !justSaved.value);

const avatarFileLabel = computed(() => {
  if (avatarFileName.value) return avatarFileName.value;
  if (form.avatar && form.avatar !== savedSnapshot.value.avatar)
    return "เลือกรูปใหม่แล้ว — กดบันทึกเพื่อใช้";
  if (form.avatar) return "ใช้รูปปัจจุบันอยู่";
  return "ยังไม่มีรูป — กดเปลี่ยนรูปเพื่ออัปโหลด";
});

const avatarPreview = computed(() => form.avatar || DEFAULT_AVATAR);
const displayName = computed(() => user.value?.name || "ผู้ใช้งานทั่วไป");
const houseLabel = computed(() => user.value?.houseNo || form.houseNo || "—");

if (import.meta.client) {
  loadReceipts();
}

watchEffect(() => {
  form.name = user.value?.name ?? "";
  form.houseNo = user.value?.houseNo ?? "";
  form.avatar = user.value?.avatar ?? "";
});

watch(isDirty, (dirty) => {
  if (dirty) justSaved.value = false;
});

const onInstallApp = async () => {
  const accepted = await install();
  installNotice.value = accepted
    ? "ติดตั้งแอปเรียบร้อยแล้ว"
    : "ยกเลิกการติดตั้ง — ลองใหม่ได้จากเมนูเบราว์เซอร์";
};

const clearChatDisplayName = () => {
  if (!import.meta.client) return;
  localStorage.removeItem(CHAT_DISPLAY_NAME_KEY);
  chatNotice.value = "ล้างชื่อแล้ว — เปิดแชทครั้งถัดไปจะถามชื่อใหม่";
};

const onLogout = () => {
  logout();
  router.push("/login");
};

const saveProfile = () => {
  if (!canSave.value) return;

  updateProfile({
    name: form.name.trim(),
    houseNo: form.houseNo.trim(),
    avatar: form.avatar,
  });

  avatarFileName.value = "";
  if (avatarInputRef.value) avatarInputRef.value.value = "";
  justSaved.value = true;
  toastSuccess("บันทึกแล้ว", "อัปเดตโปรไฟล์เรียบร้อย");

  if (savedTimer) clearTimeout(savedTimer);
  savedTimer = setTimeout(() => {
    justSaved.value = false;
  }, 1800);
};

const onAvatarSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const toBase64 = (blob: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปได้"));
      reader.readAsDataURL(blob);
    });

  try {
    form.avatar = await toBase64(file);
    avatarFileName.value = file.name;
    justSaved.value = false;
  } catch {
    toastError("อัปโหลดรูปไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
  }
};

onUnmounted(() => {
  if (savedTimer) clearTimeout(savedTimer);
});
</script>
