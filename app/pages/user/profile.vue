<template>
  <div class="mx-auto w-full max-w-md space-y-4">
      <div
        class="rounded-3xl bg-white p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]"
      >
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

        <template v-if="showEditor">
          <div
            class="lg-shell relative mt-4 flex rounded-2xl p-1"
            role="tablist"
            aria-label="ส่วนตั้งค่าโปรไฟล์"
          >
            <div
              class="lg-pill pointer-events-none absolute top-1 rounded-xl"
              :style="editorPillStyle"
              aria-hidden="true"
            />
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'personal'"
              class="relative z-10 flex-1 rounded-xl px-2 py-2 text-center text-xs font-semibold transition-colors duration-200 sm:text-sm"
              :class="
                activeTab === 'personal'
                  ? 'text-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              "
              @click="activeTab = 'personal'"
            >
              ข้อมูลส่วนตัว
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'web'"
              class="relative z-10 flex-1 rounded-xl px-2 py-2 text-center text-xs font-semibold transition-colors duration-200 sm:text-sm"
              :class="
                activeTab === 'web'
                  ? 'text-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              "
              @click="activeTab = 'web'"
            >
              ตั้งค่าเว็บ
            </button>
          </div>
        </template>

        <button
          v-else
          type="button"
          class="mt-4 w-full rounded-xl border-2 border-slate-900 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          @click="showEditor = true"
        >
          ตั้งค่า
        </button>
      </div>

      <div v-if="!showEditor" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div
            class="rounded-2xl bg-black p-4 text-white shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
          >
            <p class="text-xs text-white/70">บิลทั้งหมด</p>
            <p class="mt-1 text-2xl font-bold">
              {{ formatInt(receipts.length) }}
            </p>
          </div>
          <div
            class="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
          >
            <p class="text-xs text-slate-500">ยอดสั่งรวม</p>
            <p class="mt-1 text-2xl font-bold">{{ formatInt(totalSpend) }}</p>
          </div>
        </div>

        <div
          class="rounded-3xl bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]"
        >
          <button
            class="w-full rounded-xl border border-black px-4 py-2 font-semibold hover:bg-black hover:text-white"
            @click="goHome"
          >
            ไปหน้าเมนูรวม
          </button>
          <button
            class="mt-2 w-full rounded-xl bg-black px-4 py-2 font-semibold text-white hover:bg-slate-800"
            @click="onLogout"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      <div v-show="showEditor && activeTab === 'personal'" class="space-y-4">
        <form
          class="rounded-3xl bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]"
          @submit.prevent="saveProfile"
        >
          <p class="text-sm font-semibold text-slate-900">แก้ไขข้อมูลโปรไฟล์</p>
          <p class="mt-1 text-xs text-slate-500">
            สามารถอัปเดตชื่อ บ้านเลขที่ และรูปโปรไฟล์ได้
          </p>

          <hr class="my-4 border-slate-200" />

          <div class="mt-4">
            <label class="text-xs font-medium text-slate-600">รูปโปรไฟล์</label>
            <div class="mt-2 flex items-center gap-3">
              <img
                :src="avatarPreview"
                alt="avatar preview"
                class="h-12 w-12 rounded-full border border-black/10 bg-slate-100"
              />
              <input
                type="file"
                accept="image/*"
                class="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                @change="onAvatarSelect"
              />
            </div>
          </div>

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
          </div>

          <p v-if="notice" class="mt-3 text-xs text-emerald-600">
            {{ notice }}
          </p>

          <button
            type="submit"
            class="mt-4 w-full rounded-xl bg-black px-4 py-2 font-semibold text-white hover:bg-slate-800"
          >
            บันทึกข้อมูลโปรไฟล์
          </button>
        </form>
      </div>

      <div
        v-show="showEditor && activeTab === 'web'"
        class="rounded-3xl bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]"
      >
        <p class="text-sm font-semibold text-slate-900">
          การแสดงผลและความเป็นส่วนตัว
        </p>
        <p class="mt-1 text-xs text-slate-500">
          ตัวเลือกเหล่านี้เก็บในอุปกรณ์นี้เท่านั้น ไม่ส่งไปเซิร์ฟเวอร์
        </p>

        <div
          class="lg-row mt-4 flex items-center justify-between gap-3 px-3 py-3"
        >
          <span class="min-w-0">
            <span class="block text-sm font-medium text-slate-800"
              >ปิดเอฟเฟกต์ blur ตอนเปลี่ยนหน้า</span
            >
            <span class="mt-0.5 block text-[11px] text-slate-500"
              >ลด overlay โฟกัสระหว่างนำทาง</span
            >
          </span>
          <button
            type="button"
            role="switch"
            :aria-checked="disableRouteBlur"
            class="lg-toggle"
            :class="{ 'lg-toggle--on': disableRouteBlur }"
            @click="setRouteBlur(!disableRouteBlur)"
          >
            <span class="lg-toggle-knob" aria-hidden="true" />
          </button>
        </div>

        <div class="lg-row mt-3 px-3 py-3">
          <p class="text-sm font-medium text-slate-800">แชทบอทลุคซาเก้ท</p>
          <p class="mt-0.5 text-[11px] text-slate-500">
            ล้างชื่อเล่นที่บันทึกไว้ในเครื่อง
            ระบบจะถามชื่อใหม่เมื่อเปิดแชทครั้งถัดไป
          </p>
          <button
            type="button"
            class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            @click="clearChatDisplayName"
          >
            ล้างชื่อในแชท
          </button>
        </div>

        <p v-if="webNotice" class="mt-3 text-xs text-emerald-600">
          {{ webNotice }}
        </p>
      </div>

      <div v-if="showEditor && activeTab === 'web'" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div
            class="rounded-2xl bg-black p-4 text-white shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
          >
            <p class="text-xs text-white/70">บิลทั้งหมด</p>
            <p class="mt-1 text-2xl font-bold">
              {{ formatInt(receipts.length) }}
            </p>
          </div>
          <div
            class="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
          >
            <p class="text-xs text-slate-500">ยอดสั่งรวม</p>
            <p class="mt-1 text-2xl font-bold">{{ formatInt(totalSpend) }}</p>
          </div>
        </div>

        <div
          class="rounded-3xl bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]"
        >
          <button
            class="w-full rounded-xl border border-black px-4 py-2 font-semibold hover:bg-black hover:text-white"
            @click="goHome"
          >
            ไปหน้าเมนูรวม
          </button>
          <button
            class="mt-2 w-full rounded-xl bg-black px-4 py-2 font-semibold text-white hover:bg-slate-800"
            @click="onLogout"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      <button
        v-if="showEditor"
        type="button"
        class="w-full rounded-xl py-2 text-center text-xs font-semibold text-slate-500 transition hover:text-slate-800"
        @click="showEditor = false"
      >
        ซ่อนการแก้ไข
      </button>

    </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "user",
  middleware: "auth",
});

const DEFAULT_AVATAR = "/default-avatar.png";
const ROUTE_BLUR_DISABLED_KEY = "watershop-disable-route-blur";
/** ต้องตรงกับ UserFinanceChatDock.vue */
const CHAT_DISPLAY_NAME_KEY = "lunarwater-chat-display-name";

const router = useRouter();
const { formatInt } = useFormatNumber();
const { user, logout, updateProfile } = useAuth();
const { receipts, loadReceipts } = useWatershopReceipts();
const totalSpend = computed(() =>
  receipts.value.reduce((sum, receipt) => sum + receipt.amount, 0),
);
const notice = ref("");
const webNotice = ref("");
const showEditor = ref(false);
const activeTab = ref<"personal" | "web">("personal");
const disableRouteBlur = ref(false);

const editorPillStyle = computed(() => ({
  left: activeTab.value === "personal" ? "4px" : "calc(50%)",
  width: "calc(50% - 4px)",
  height: "calc(100% - 8px)",
  transition: "left 0.32s cubic-bezier(0.25, 1, 0.5, 1)",
}));
const form = reactive({
  name: "",
  houseNo: "",
  avatar: "",
});

const avatarPreview = computed(() => form.avatar || DEFAULT_AVATAR);
const displayName = computed(() => user.value?.name || "ผู้ใช้งานทั่วไป");

if (import.meta.client) {
  loadReceipts();
  disableRouteBlur.value =
    localStorage.getItem(ROUTE_BLUR_DISABLED_KEY) === "1";
}

watchEffect(() => {
  form.name = user.value?.name ?? "";
  form.houseNo = user.value?.houseNo ?? "";
  form.avatar = user.value?.avatar ?? "";
});

const goHome = () => {
  router.push("/user");
};

const routeBlurOverlay = useState("route-nav-blur", () => false);

const setRouteBlur = (checked: boolean) => {
  disableRouteBlur.value = checked;
  if (!import.meta.client) return;
  if (checked) {
    localStorage.setItem(ROUTE_BLUR_DISABLED_KEY, "1");
    routeBlurOverlay.value = false;
  } else {
    localStorage.removeItem(ROUTE_BLUR_DISABLED_KEY);
  }
  webNotice.value = "บันทึกการตั้งค่าเว็บแล้ว";
};

const clearChatDisplayName = () => {
  if (!import.meta.client) return;
  localStorage.removeItem(CHAT_DISPLAY_NAME_KEY);
  webNotice.value = "ล้างชื่อในแชทบอทแล้ว — เปิดแชทครั้งถัดไปจะถามชื่อใหม่";
};

const onLogout = () => {
  logout();
  router.push("/login");
};

const saveProfile = () => {
  updateProfile({
    name: form.name,
    houseNo: form.houseNo,
    avatar: form.avatar,
  });
  notice.value = "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว";
};

const onAvatarSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // เก็บเป็น base64 เพื่อใช้งานใน localStorage ได้ทันที
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
  } catch {
    notice.value = "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
  }
};
</script>
