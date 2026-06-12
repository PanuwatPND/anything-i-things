<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 px-4 pb-10 pt-2 text-slate-900"
  >
    <input
      ref="slipInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onSlipFile"
    />

    <div class="mx-auto w-full max-w-lg space-y-4">
      <section
        class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <span
              class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/80"
            >
              Admin
            </span>
            <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {{
                activeTab === "stock"
                  ? "จัดการสต็อกน้ำ"
                  : activeTab === "slips"
                    ? "สลิป / ใบเสร็จ"
                    : "ตรวจสอบสลิป"
              }}
            </h1>
            <p class="mt-1 truncate text-sm text-slate-500">
              {{ user?.email }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            @click="onLogout"
          >
            ออกจากระบบ
          </button>
        </div>

        <div
          class="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100/90 p-1 ring-1 ring-slate-200/80"
          role="tablist"
          aria-label="เมนูแอดมิน"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'stock'"
            class="rounded-xl py-2 text-center text-xs font-semibold transition sm:text-sm"
            :class="
              activeTab === 'stock'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            "
            @click="activeTab = 'stock'"
          >
            สต็อก
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'slips'"
            class="rounded-xl py-2 text-center text-xs font-semibold transition sm:text-sm"
            :class="
              activeTab === 'slips'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            "
            @click="activeTab = 'slips'"
          >
            สลิป
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'verify'"
            class="rounded-xl py-2 text-center text-xs font-semibold transition sm:text-sm"
            :class="
              activeTab === 'verify'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            "
            @click="activeTab = 'verify'"
          >
            ตรวจสอบ
          </button>
        </div>
      </section>

      <template v-if="activeTab === 'stock'">
        <section
          class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
        >
          <div class="grid grid-cols-3 gap-2">
            <div
              class="rounded-2xl border border-slate-200 bg-slate-900 p-3 text-white shadow-[0_8px_20px_-14px_rgba(15,23,42,0.55)]"
            >
              <p
                class="text-[10px] font-medium uppercase tracking-wide text-white/70"
              >
                เมนู
              </p>
              <p class="mt-1 text-xl font-bold tabular-nums">
                {{ formatInt(items.length) }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
              <p
                class="text-[10px] font-medium uppercase tracking-wide text-slate-500"
              >
                สต็อกรวม
              </p>
              <p class="mt-1 text-xl font-bold tabular-nums text-slate-900">
                {{ formatInt(totalStock) }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
              <p
                class="text-[10px] font-medium uppercase tracking-wide text-slate-500"
              >
                ใกล้หมด
              </p>
              <p
                class="mt-1 text-xl font-bold tabular-nums"
                :class="lowStockItems > 0 ? 'text-rose-600' : 'text-slate-900'"
              >
                {{ formatInt(lowStockItems) }}
              </p>
              <p class="mt-0.5 text-[9px] leading-tight text-slate-400">
                ≤ 5 แพ็ค
              </p>
            </div>
          </div>
        </section>

        <section
          class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
        >
          <div class="flex items-end justify-between gap-3">
            <div class="min-w-0">
              <h2 class="text-xl font-bold leading-tight text-slate-900">
                รายการสินค้า
              </h2>
              <p class="mt-2 text-xs text-slate-500">
                ปรับจำนวนสต็อกเป็นจำนวนแพ็ค — ระบบจะซิงค์กับหน้าสั่งน้ำของผู้ใช้
              </p>
            </div>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="item in items"
              :key="item.id"
              class="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-slate-200"
            >
              <div
                class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div class="flex min-w-0 items-start gap-3">
                  <div
                    class="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
                  >
                    <img
                      :src="item.image"
                      :alt="item.name"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-semibold text-slate-900">
                      {{ item.name }}
                    </p>
                    <p class="mt-0.5 text-[11px] text-slate-500">
                      ราคา {{ formatInt(item.price) }} บาท · 1 แพ็ค =
                      {{ formatInt(item.bottlesPerPack) }} ขวด
                    </p>
                    <p
                      class="mt-1 text-[11px] font-semibold"
                      :class="
                        item.stock <= 5 ? 'text-rose-600' : 'text-slate-500'
                      "
                    >
                      {{
                        item.stock <= 5
                          ? `ใกล้หมด — เหลือ ${formatInt(item.stock)} แพ็ค`
                          : `คงเหลือ ${formatInt(item.stock)} แพ็ค`
                      }}
                    </p>
                  </div>
                </div>

                <div
                  class="inline-flex shrink-0 items-center self-end rounded-xl bg-white p-1 ring-1 ring-slate-200 md:self-center"
                >
                  <button
                    type="button"
                    class="grid h-8 w-8 place-items-center rounded-lg text-base font-semibold text-slate-700 transition active:scale-95"
                    @click="adjust(item.id, item.stock - 1)"
                  >
                    -
                  </button>
                  <input
                    :value="item.stock"
                    type="number"
                    min="0"
                    class="no-spin w-14 border-0 bg-transparent px-1 text-center text-sm font-semibold text-slate-900 focus:outline-none"
                    @change="onInput(item.id, $event)"
                  />
                  <button
                    type="button"
                    class="grid h-8 w-8 place-items-center rounded-lg text-base font-semibold text-slate-700 transition active:scale-95"
                    @click="adjust(item.id, item.stock + 1)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <template v-else-if="activeTab === 'slips'">
        <section
          class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
        >
          <div
            v-if="orderedReceipts.length === 0"
            class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600"
          >
            ยังไม่มีใบเสร็จ — เมื่อมีการสั่งซื้อจากตะกร้า รายการจะขึ้นที่นี่
          </div>

          <ul v-else class="mt-4 space-y-3">
            <li
              v-for="r in orderedReceipts"
              :key="r.id"
              class="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70"
            >
              <div
                class="flex items-start justify-between gap-3 border-b border-slate-100/80 bg-white/60 px-4 py-3"
              >
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900">{{ r.itemName }}</p>
                  <p class="mt-0.5 text-[11px] text-slate-500">
                    {{ formatReceiptDate(r.createdAt) }} ·
                    {{ formatInt(r.quantity) }} แพ็ค
                  </p>
                  <p
                    class="mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    :class="slipCompareClass(r)"
                  >
                    {{ slipCompareLabel(r) }}
                  </p>
                </div>
                <p
                  class="shrink-0 text-lg font-bold tabular-nums text-slate-900"
                >
                  {{ formatInt(r.amount) }}
                  <span class="text-xs font-semibold text-slate-500">฿</span>
                </p>
              </div>

              <div class="space-y-3 p-4">
                <p
                  v-if="r.slipVerification?.ocrMessage"
                  class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] text-slate-700 ring-1 ring-slate-200/80"
                >
                  {{ r.slipVerification.ocrMessage }}
                </p>
                <div
                  v-if="r.slipDataUrl"
                  class="relative overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80"
                >
                  <button
                    type="button"
                    class="relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none"
                    :disabled="ocrBusyId === r.id"
                    @click="openSlipPreview(r.slipDataUrl)"
                  >
                    <img
                      :src="r.slipDataUrl"
                      alt="สลิปโอน"
                      class="max-h-52 w-full object-contain object-center"
                      loading="lazy"
                    />
                    <span
                      class="absolute bottom-2 right-2 rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm"
                    >
                      แตะเพื่อขยาย
                    </span>
                  </button>
                  <div
                    v-if="ocrBusyId === r.id"
                    class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/75 backdrop-blur-[2px]"
                  >
                    <span
                      class="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
                      aria-hidden="true"
                    />
                    <span class="text-[11px] font-semibold text-slate-800">
                      กำลังวิเคราะห์
                    </span>
                  </div>
                </div>
                <div
                  v-else
                  class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500"
                >
                  ยังไม่มีรูปสลิป
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    @click="openSlipPicker(r.id)"
                  >
                    {{ r.slipDataUrl ? "เปลี่ยนรูปสลิป" : "แนบรูปสลิป" }}
                  </button>
                  <button
                    v-if="r.slipDataUrl"
                    type="button"
                    class="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    @click="onRemoveSlip(r.id)"
                  >
                    ลบรูป
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </template>

      <template v-else>
        <section
          class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
        >
          <div
            class="rounded-2xl border border-violet-100 bg-violet-50/80 px-3 py-3 text-[11px] leading-snug text-violet-950"
          >
            <p class="font-semibold text-violet-900">อ่านสลิปด้วย</p>
            <p class="mt-1 text-violet-900/90">
              ภาพสลิปถูกส่งไปวิเคราะห์บนเซิร์ฟเวอร์ — ความแม่นยำขึ้นกับคุณภาพภาพ
              และคำตอบของโมเดล ถ้าไม่ตรงให้แก้ในฟอร์มแล้วกดบันทึก
            </p>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="opt in verifyFilterOptions"
              :key="opt.value"
              type="button"
              class="rounded-full px-3 py-1 text-[11px] font-semibold transition"
              :class="
                verifyFilter === opt.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              "
              @click="verifyFilter = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>

          <div
            v-if="filteredVerifyReceipts.length === 0"
            class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600"
          >
            ไม่มีรายการในตัวกรองนี้
          </div>

          <ul v-else class="mt-4 space-y-4">
            <li
              v-for="r in filteredVerifyReceipts"
              :key="r.id"
              class="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70"
            >
              <div class="border-b border-slate-100/80 bg-white/70 px-4 py-3">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-900">{{ r.itemName }}</p>
                    <p class="mt-0.5 text-[11px] text-slate-500">
                      {{ formatReceiptDate(r.createdAt) }} · ใบเสร็จ #
                      {{ r.id }}
                    </p>
                  </div>
                  <span
                    class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    :class="slipCompareClass(r)"
                  >
                    {{ slipCompareLabel(r) }}
                  </span>
                </div>

                <dl class="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div
                    class="rounded-xl bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100"
                  >
                    <dt class="text-slate-500">ยอดในระบบ</dt>
                    <dd class="font-bold tabular-nums text-slate-900">
                      {{ formatInt(r.amount) }} ฿
                    </dd>
                  </div>
                  <div
                    class="rounded-xl bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100"
                  >
                    <dt class="text-slate-500">จำนวนแพ็ค</dt>
                    <dd class="font-bold tabular-nums text-slate-900">
                      {{ formatInt(r.quantity) }}
                    </dd>
                  </div>
                </dl>
                <p
                  v-if="r.slipVerification?.ocrReadAt"
                  class="mt-2 text-[10px] text-slate-500"
                >
                  ล่าสุด · ความมั่นใจโดยประมาณ
                  {{ Math.round(r.slipVerification.ocrConfidence ?? 0) }}% ·
                  {{ formatReceiptDate(r.slipVerification.ocrReadAt) }}
                </p>
                <p
                  v-if="r.slipVerification?.ocrMessage"
                  class="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] text-amber-950 ring-1 ring-amber-100"
                >
                  {{ r.slipVerification.ocrMessage }}
                </p>
                <div
                  v-if="
                    r.slipVerification?.payerHint ||
                    r.slipVerification?.note ||
                    r.slipVerification?.amountOnSlip != null
                  "
                  class="mt-3 space-y-1 rounded-xl bg-white/80 px-3 py-2 text-[11px] ring-1 ring-slate-100"
                >
                  <p v-if="r.slipVerification?.amountOnSlip != null">
                    <span class="text-slate-500">ยอดจากสลิป:</span>
                    <span
                      class="ml-1 font-semibold tabular-nums text-slate-900"
                    >
                      {{ formatInt(r.slipVerification.amountOnSlip) }} ฿
                    </span>
                  </p>
                  <p v-if="r.slipVerification?.payerHint">
                    <span class="text-slate-500">จาก:</span>
                    <span class="ml-1 font-medium text-slate-800">{{
                      r.slipVerification.payerHint
                    }}</span>
                  </p>
                  <p v-if="r.slipVerification?.note">
                    <span class="text-slate-500">หมายเหตุ:</span>
                    <span class="ml-1 text-slate-700">{{
                      r.slipVerification.note
                    }}</span>
                  </p>
                </div>
              </div>

              <div class="flex gap-3 p-4">
                <button
                  v-if="r.slipDataUrl"
                  type="button"
                  class="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
                  @click="openSlipPreview(r.slipDataUrl)"
                >
                  <img
                    :src="r.slipDataUrl"
                    alt=""
                    class="h-full w-full object-cover"
                  />
                </button>
                <div
                  v-else
                  class="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400"
                >
                  ไม่มีรูป
                </div>

                <div class="min-w-0 flex-1 space-y-2">
                  <div>
                    <label
                      class="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      ยอดที่เห็นบนสลิป (พิมพ์มือ)
                    </label>
                    <input
                      v-model="verifyRow(r).amount"
                      type="text"
                      inputmode="decimal"
                      placeholder="เช่น 350"
                      class="mt-0.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-slate-900 outline-none ring-slate-900/10 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label
                      class="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      จากใคร / ธนาคาร / เลขท้าย
                    </label>
                    <input
                      v-model="verifyRow(r).payer"
                      type="text"
                      placeholder="เช่น สมชาย · SCB · **1234"
                      class="mt-0.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label
                      class="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      หมายเหตุ
                    </label>
                    <input
                      v-model="verifyRow(r).note"
                      type="text"
                      placeholder="ถ้ามี"
                      class="mt-0.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 focus:ring-2"
                    />
                  </div>
                  <button
                    type="button"
                    class="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-md transition active:scale-[0.99]"
                    @click="persistVerification(r)"
                  >
                    บันทึกการตรวจ
                  </button>
                  <p
                    v-if="r.slipVerification?.checkedAt"
                    class="text-[10px] text-slate-400"
                  >
                    บันทึกล่าสุด:
                    {{ formatReceiptDate(r.slipVerification.checkedAt) }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  SlipVerification,
  WatershopReceipt,
} from "~/composables/useWatershopReceipts";
import {
  readFileAsDataUrl,
  slipImagePartsForOcr,
} from "~/utils/slipImageForOcr";

definePageMeta({
  middleware: "admin",
});

const router = useRouter();
const { formatInt } = useFormatNumber();
const { user, logout } = useAuth();
const { items, hydrateShop, ensureCatalog, updateStock } = useLocalWatershop();
const {
  orderedReceipts,
  loadReceipts,
  attachSlip,
  removeSlip,
  saveVerificationDraft,
  updateSlipVerification,
} = useWatershopReceipts();

const { runOcr } = useSlipOcr();
const activeTab = ref<"stock" | "slips" | "verify">("stock");
const slipInputRef = ref<HTMLInputElement | null>(null);
const pendingSlipReceiptId = ref<string | null>(null);
const ocrBusyId = ref<string | null>(null);

const totalStock = computed(() =>
  items.value.reduce((sum, item) => sum + item.stock, 0),
);
const lowStockItems = computed(
  () => items.value.filter((item) => item.stock <= 5).length,
);

if (import.meta.client) {
  hydrateShop();
  ensureCatalog();
  loadReceipts();
}

watch(activeTab, (tab) => {
  if ((tab === "slips" || tab === "verify") && import.meta.client)
    loadReceipts();
});

type VerifyFilterValue = "all" | "has_slip" | "unchecked" | "mismatch";

const verifyFilter = ref<VerifyFilterValue>("all");
const verifyFilterOptions: { value: VerifyFilterValue; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "has_slip", label: "มีรูปสลิป" },
  { value: "unchecked", label: "ยังไม่กรอกยอดจากสลิป" },
  { value: "mismatch", label: "ยอดไม่ตรง" },
];

const filteredVerifyReceipts = computed(() =>
  orderedReceipts.value.filter((r) => {
    if (verifyFilter.value === "has_slip") return Boolean(r.slipDataUrl);
    if (verifyFilter.value === "unchecked")
      return r.slipVerification?.amountOnSlip == null;
    if (verifyFilter.value === "mismatch") {
      const v = r.slipVerification?.amountOnSlip;
      return v != null && v !== r.amount;
    }
    return true;
  }),
);

type DraftRow = { amount: string; payer: string; note: string };
const verifyDrafts = reactive<Record<string, DraftRow>>({});

const ensureVerifyDraft = (r: WatershopReceipt) => {
  if (verifyDrafts[r.id]) return;
  verifyDrafts[r.id] = {
    amount:
      r.slipVerification?.amountOnSlip != null
        ? String(r.slipVerification.amountOnSlip)
        : "",
    payer: r.slipVerification?.payerHint ?? "",
    note: r.slipVerification?.note ?? "",
  };
};

const syncDraftFromReceipt = (r: WatershopReceipt) => {
  ensureVerifyDraft(r);
  verifyDrafts[r.id] = {
    amount:
      r.slipVerification?.amountOnSlip != null
        ? String(r.slipVerification.amountOnSlip)
        : "",
    payer: r.slipVerification?.payerHint ?? "",
    note: r.slipVerification?.note ?? "",
  };
};

/** ให้เทมเพลตอ้างถึงแถวฟอร์มได้โดย TypeScript ไม่ฟ้องว่าอาจเป็น undefined */
const verifyRow = (r: WatershopReceipt) => {
  ensureVerifyDraft(r);
  return verifyDrafts[r.id]!;
};

watch(
  orderedReceipts,
  (list) => {
    for (const r of list) ensureVerifyDraft(r);
  },
  { immediate: true },
);

const slipCompareLabel = (r: WatershopReceipt) => {
  const v = r.slipVerification?.amountOnSlip;
  const ocrTag = r.slipVerification?.amountFromOcr ? " · บาท" : "";
  if (v == null) return "ยังไม่มียอดจากสลิป";
  if (v === r.amount) return `ยอดตรงกับระบบ${ocrTag}`;
  return `ยอดไม่ตรง (${formatInt(v)} กับ ${formatInt(r.amount)})${ocrTag}`;
};

const slipCompareClass = (r: WatershopReceipt) => {
  const v = r.slipVerification?.amountOnSlip;
  if (v == null) return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  if (v === r.amount)
    return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
  return "bg-rose-100 text-rose-800 ring-1 ring-rose-200";
};

const persistVerification = (r: WatershopReceipt) => {
  ensureVerifyDraft(r);
  const d = verifyDrafts[r.id];
  if (!d) return;

  const trimmed = d.amount.trim();
  let amountOnSlip: number | undefined;
  if (trimmed === "") {
    amountOnSlip = undefined;
  } else {
    const n = Number(trimmed.replace(/,/g, ""));
    if (Number.isNaN(n)) {
      alert("ยอดบนสลิปไม่ใช่ตัวเลข — ลองพิมพ์เฉพาะจำนวน เช่น 350");
      return;
    }
    amountOnSlip = n;
  }

  saveVerificationDraft(r.id, {
    amountOnSlip,
    payerHint: d.payer.trim() || undefined,
    note: d.note.trim() || undefined,
  });

  const updated = orderedReceipts.value.find((x) => x.id === r.id);
  if (updated) syncDraftFromReceipt(updated);
};

const adjust = (id: string, nextStock: number) => {
  updateStock(id, nextStock);
};

const onInput = (id: string, event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  updateStock(id, value);
};

const onLogout = () => {
  logout();
  router.push("/login");
};

const formatReceiptDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

const geminiFetchErrorMessage = (e: unknown): string => {
  if (e && typeof e === "object") {
    const anyErr = e as {
      data?: { statusMessage?: string; message?: string };
      statusMessage?: string;
    };
    const msg =
      anyErr.data?.statusMessage ||
      anyErr.data?.message ||
      anyErr.statusMessage ||
      (e instanceof Error ? e.message : "");
    if (msg) return msg;
  }
  return e instanceof Error ? e.message : "เรียก PND ไม่สำเร็จ";
};

const openSlipPicker = (receiptId: string) => {
  pendingSlipReceiptId.value = receiptId;
  slipInputRef.value?.click();
};

const onRemoveSlip = (id: string) => {
  removeSlip(id);
  Reflect.deleteProperty(verifyDrafts, id);
  loadReceipts();
  const fresh = orderedReceipts.value.find((x) => x.id === id);
  if (fresh) ensureVerifyDraft(fresh);
};

const onSlipFile = async (event: Event) => {
  const receiptId = pendingSlipReceiptId.value;
  pendingSlipReceiptId.value = null;
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file || !receiptId) return;
  if (!file.type.startsWith("image/")) return;

  const before = orderedReceipts.value.find((x) => x.id === receiptId);
  const orderHint = before?.amount;

  let url: string;
  try {
    url = await readFileAsDataUrl(file);
  } catch {
    return;
  }

  attachSlip(receiptId, url);
  updateSlipVerification(receiptId, {
    amountOnSlip: undefined,
    payerHint: undefined,
    amountFromOcr: false,
    ocrConfidence: undefined,
    ocrReadAt: undefined,
    ocrMessage: "กำลังวิเคราะห์สลิป",
  });

  const mid = orderedReceipts.value.find((x) => x.id === receiptId);
  if (mid) syncDraftFromReceipt(mid);

  ocrBusyId.value = receiptId;

  const imageParts = await slipImagePartsForOcr(file);
  if (!imageParts) {
    updateSlipVerification(receiptId, {
      ocrReadAt: new Date().toISOString(),
      amountFromOcr: false,
      ocrMessage: "ย่อรูปสำหรับ OCR ไม่ได้ — ลองรูปอื่น",
    });
    ocrBusyId.value = null;
    const bad = orderedReceipts.value.find((x) => x.id === receiptId);
    if (bad) syncDraftFromReceipt(bad);
    return;
  }

  try {
    await runOcr(receiptId, imageParts, orderHint);
  } catch (err: unknown) {
    updateSlipVerification(receiptId, {
      ocrReadAt: new Date().toISOString(),
      amountFromOcr: false,
      ocrMessage: geminiFetchErrorMessage(err).slice(0, 400),
    });
  } finally {
    ocrBusyId.value = null;
    const done = orderedReceipts.value.find((x) => x.id === receiptId);
    if (done) syncDraftFromReceipt(done);
  }
};

const openSlipPreview = (dataUrl: string | undefined) => {
  if (!dataUrl || !import.meta.client) return;
  window.open(dataUrl, "_blank", "noopener,noreferrer");
};
</script>
