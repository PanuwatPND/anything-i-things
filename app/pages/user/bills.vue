<template>
  <div class="mx-auto w-full max-w-md space-y-4">
    <!-- Header + summary -->
    <section
      class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
    >
      <p class="text-xs font-medium text-slate-500">Billing</p>
      <h1 class="mt-1 text-xl font-bold tracking-tight">บิล / ใบเสร็จ</h1>

      <div v-if="orderedReceipts.length > 0" class="mt-4 grid grid-cols-3 gap-2">
        <div class="rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
          <p class="text-[10px] font-medium text-slate-500">ทั้งหมด</p>
          <p class="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
            {{ formatInt(orderedReceipts.length) }}
          </p>
        </div>
        <div
          class="rounded-2xl px-3 py-2.5 ring-1"
          :class="
            actionCount > 0
              ? 'bg-amber-50 ring-amber-200/80'
              : 'bg-slate-50 ring-slate-100'
          "
        >
          <p class="text-[10px] font-medium text-slate-500">รอดำเนินการ</p>
          <p
            class="mt-0.5 text-lg font-bold tabular-nums"
            :class="actionCount > 0 ? 'text-amber-700' : 'text-slate-900'"
          >
            {{ formatInt(actionCount) }}
          </p>
        </div>
        <div class="rounded-2xl bg-slate-900 px-3 py-2.5 text-white">
          <p class="text-[10px] font-medium text-white/60">ยอดรวม</p>
          <p class="mt-0.5 text-lg font-bold tabular-nums">
            {{ formatInt(totalAmount) }}
            <span class="text-xs font-semibold text-white/70">฿</span>
          </p>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section
      v-if="orderedReceipts.length > 0"
      class="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        v-for="f in filterOptions"
        :key="f.value"
        type="button"
        class="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition"
        :class="
          billFilter === f.value
            ? 'bg-slate-900 text-white shadow-sm'
            : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
        "
        @click="billFilter = f.value"
      >
        {{ f.label }}
        <span
          v-if="f.count > 0"
          class="ml-1 tabular-nums opacity-80"
        >({{ f.count }})</span>
      </button>
    </section>

    <!-- List -->
    <section v-if="orderedReceipts.length > 0">
      <div
        v-if="filteredReceipts.length === 0"
        class="rounded-3xl bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
      >
        ไม่มีบิลในตัวกรองนี้
      </div>

      <div v-else class="space-y-5">
        <div v-for="group in groupedReceipts" :key="group.label">
          <p class="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {{ group.label }}
          </p>
          <ul class="space-y-2.5">
            <li
              v-for="r in group.items"
              :key="r.id"
              class="relative rounded-2xl bg-white px-4 py-3.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.22)] ring-1 ring-slate-200/90 transition-all"
              :class="rowClass(r)"
              @click="onRowClick(r)"
            >
              <span
                class="absolute right-3 top-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none shadow-sm"
                :class="statusClass(statusOf(r).code)"
              >
                {{ statusShort(statusOf(r).code) }}
              </span>
              <p class="truncate pr-20 text-sm font-bold text-slate-900">
                {{ r.itemName }}
              </p>
              <div class="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                <span class="text-[11px] tabular-nums text-slate-500">
                  #{{ r.id }} · {{ formatTime(r.createdAt) }} · {{ formatInt(r.quantity) }} แพ็ค
                </span>
                <p class="shrink-0 text-base font-bold tabular-nums text-slate-900">
                  {{ formatInt(r.amount) }} ฿
                </p>
              </div>
              <p
                v-if="isTrackable(r)"
                class="mt-1.5 text-[11px] font-semibold text-violet-700"
              >
                🗺️ แตะเพื่อดูเส้นทางจัดส่ง
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section
      v-else
      class="rounded-3xl bg-white p-4 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
    >
      <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
        <p class="text-sm font-medium text-slate-700">ยังไม่มีบิล</p>
        <p class="mt-1 text-xs text-slate-500">สั่งซื้อจากตะกร้าแล้วจะแสดงที่นี่</p>
      </div>
    </section>

    <DeliveryRoutePreview
      :open="trackingReceipt != null"
      :item-name="trackingReceipt?.itemName ?? ''"
      :house-no="user?.houseNo"
      :order-id="trackingReceipt?.id"
      stage="shipping"
      @close="trackingReceipt = null"
      @confirm="trackingReceipt = null"
    />
  </div>
</template>

<script setup lang="ts">
import {
  type WatershopReceipt,
  type BillStatusCode,
  BILL_STATUS_LABEL,
} from "~/composables/useWatershopReceipts";

definePageMeta({
  layout: "user",
  middleware: "auth",
});

type BillFilter = "all" | "action" | "active" | "done";

const router = useRouter();
const { formatInt } = useFormatNumber();
const { user } = useAuth();
const { orderedReceipts, loadReceipts } = useWatershopReceipts();
const billFilter = ref<BillFilter>("all");
const trackingReceipt = ref<WatershopReceipt | null>(null);

onMounted(() => {
  loadReceipts();
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", onVisibilityChange);
});

const onVisibilityChange = () => {
  if (document.visibilityState === "visible") loadReceipts();
};

const statusOf = (r: WatershopReceipt) => {
  const code = (r.status ?? "pending") as BillStatusCode;
  return { code, label: BILL_STATUS_LABEL[code] };
};

const isActionable = (r: WatershopReceipt) => {
  const code = statusOf(r).code;
  return code === "pending" || code === "pay_later";
};

const actionCount = computed(
  () => orderedReceipts.value.filter((r) => isActionable(r)).length,
);

const totalAmount = computed(() =>
  orderedReceipts.value.reduce((sum, r) => sum + r.amount, 0),
);

const countByFilter = (value: BillFilter) => {
  if (value === "all") return orderedReceipts.value.length;
  if (value === "action")
    return orderedReceipts.value.filter((r) => isActionable(r)).length;
  if (value === "active")
    return orderedReceipts.value.filter((r) => {
      const c = statusOf(r).code;
      return c === "paid" || c === "shipping";
    }).length;
  return orderedReceipts.value.filter((r) => {
    const c = statusOf(r).code;
    return c === "delivered" || c === "cancelled";
  }).length;
};

const filterOptions = computed(() => [
  { value: "all" as const, label: "ทั้งหมด", count: countByFilter("all") },
  { value: "action" as const, label: "รอดำเนินการ", count: countByFilter("action") },
  { value: "active" as const, label: "กำลังส่ง", count: countByFilter("active") },
  { value: "done" as const, label: "เสร็จแล้ว", count: countByFilter("done") },
]);

const filteredReceipts = computed(() => {
  if (billFilter.value === "all") return orderedReceipts.value;
  if (billFilter.value === "action")
    return orderedReceipts.value.filter((r) => isActionable(r));
  if (billFilter.value === "active")
    return orderedReceipts.value.filter((r) => {
      const c = statusOf(r).code;
      return c === "paid" || c === "shipping";
    });
  return orderedReceipts.value.filter((r) => {
    const c = statusOf(r).code;
    return c === "delivered" || c === "cancelled";
  });
});

const dateGroupLabel = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const t = d.getTime();
  if (t >= startOfToday.getTime()) return "วันนี้";
  if (t >= startOfYesterday.getTime()) return "เมื่อวาน";
  try {
    return d.toLocaleDateString("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso.slice(0, 10);
  }
};

const groupedReceipts = computed(() => {
  const map = new Map<string, WatershopReceipt[]>();
  for (const r of filteredReceipts.value) {
    const label = dateGroupLabel(r.createdAt);
    const list = map.get(label) ?? [];
    list.push(r);
    map.set(label, list);
  }
  return [...map.entries()].map(([label, items]) => ({ label, items }));
});

const statusShort = (code: BillStatusCode) => {
  const map: Record<BillStatusCode, string> = {
    pending: "รอชำระ",
    pay_later: "สั่งด่วน",
    paid: "ชำระแล้ว",
    shipping: "กำลังส่ง",
    delivered: "ส่งแล้ว",
    cancelled: "ยกเลิก",
  };
  return map[code];
};

const statusClass = (code: BillStatusCode) => {
  if (code === "pending") return "bg-amber-100 text-amber-800";
  if (code === "pay_later") return "bg-orange-100 text-orange-800";
  if (code === "paid") return "bg-sky-100 text-sky-800";
  if (code === "shipping") return "bg-violet-100 text-violet-800";
  if (code === "delivered") return "bg-emerald-100 text-emerald-800";
  return "bg-rose-100 text-rose-800";
};

const isTrackable = (r: WatershopReceipt) => statusOf(r).code === "shipping";

const rowClass = (r: WatershopReceipt) => {
  if (!isActionable(r) && !isTrackable(r)) return "";
  return "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(15,23,42,0.28)] hover:ring-amber-200 active:scale-[0.99]";
};

const onRowClick = (r: WatershopReceipt) => {
  if (isActionable(r)) {
    router.push(`/user/payment?id=${r.id}`);
    return;
  }
  if (isTrackable(r)) {
    trackingReceipt.value = r;
  }
};

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};
</script>
