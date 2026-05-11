<template>
  <div class="min-h-screen bg-[#ececec] px-4 py-6 text-slate-900">
    <div class="mx-auto w-full max-w-md space-y-4">
      <div class="flex items-center gap-3 px-1 pt-1">
        <button
          type="button"
          class="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 transition active:scale-95"
          @click="goProfile"
        >
          <img
            src="https://api.dicebear.com/9.x/initials/svg?seed=Water%20User"
            alt="profile"
            class="h-full w-full object-cover"
          />
        </button>

        <div class="min-w-0 flex-1">
          <p class="text-[11px] leading-none text-slate-500">{{ todayLabel }}</p>
          <h1
            class="mt-1 truncate text-base font-bold leading-tight tracking-tight text-slate-900"
          >
            สวัสดี,
            <span class="font-medium text-slate-600">{{ displayName }}</span>
          </h1>
        </div>

        <button
          ref="cartIconRef"
          type="button"
          class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-95"
          :class="[
            cartCount > 0
              ? 'bg-black text-white shadow-lg'
              : 'bg-white text-slate-700 ring-1 ring-black/10 hover:ring-black/20',
            { 'cart-pulse': cartPulse },
          ]"
          aria-label="เปิดตะกร้า"
          @click="goCart"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
            />
          </svg>
          <span
            v-if="cartCount > 0"
            class="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#ececec] bg-white px-0.5 text-[10px] font-bold leading-none text-black"
          >
            {{ cartCount > 9 ? "9+" : cartCount }}
          </span>
        </button>
      </div>

      <div
        class="rounded-[2rem] bg-white p-4 text-slate-900 shadow-[0_16px_36px_rgba(0,0,0,0.1)] soft-pop"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="relative h-40 w-40 shrink-0">
            <ClientOnly>
              <apexchart
                type="radialBar"
                width="180"
                height="180"
                :options="gaugeOptions"
                :series="gaugeSeries"
              />
              <template #fallback>
                <div class="grid h-full w-full place-items-center">
                  <div
                    class="h-28 w-28 animate-pulse rounded-full bg-white/10"
                  />
                </div>
              </template>
            </ClientOnly>
            <p
              class="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[11px] text-slate-500"
            >
              ออเดอร์รวม
            </p>
          </div>

          <div class="w-44 shrink-0 space-y-3">
            <div>
              <div class="mb-1 flex items-center justify-between text-xs">
                <span class="text-slate-500">Receipts</span>
                <span class="font-semibold tabular-nums text-slate-900">
                  <span class="text-sm">{{ todayReceiptCount }}</span>
                  <span class="text-slate-400"> /20</span>
                </span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-full rounded-full bg-black transition-[width] duration-500"
                  :style="{ width: `${receiptProgress}%` }"
                />
              </div>
            </div>
            <div>
              <div class="mb-1 flex items-center justify-between text-xs">
                <span class="text-slate-500">Sold Qty</span>
                <span class="font-semibold tabular-nums text-slate-900">
                  <span class="text-sm">{{ todaySoldQty }}</span>
                  <span class="text-slate-400"> /80</span>
                </span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-full rounded-full bg-black transition-[width] duration-500"
                  :style="{ width: `${soldProgress}%` }"
                />
              </div>
            </div>
            <div>
              <div class="mb-1 flex items-center justify-between text-xs">
                <span class="text-slate-500">Spend Today</span>
                <span class="font-semibold tabular-nums text-slate-900">
                  <span class="text-sm">{{ todayTotalAmount }}</span>
                  <span class="text-slate-400"> /2000</span>
                </span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-full rounded-full bg-black transition-[width] duration-500"
                  :style="{ width: `${spendProgress}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="rounded-[2rem] bg-white p-4 shadow-[0_16px_36px_rgba(0,0,0,0.1)] soft-pop"
      >
        <div>
          <p class="text-xs text-slate-500">ล็อกอินด้วย {{ user?.email }}</p>
          <h2 class="mt-1 text-xl font-bold">สั่งน้ำดื่ม</h2>
        </div>
        <div
          v-if="noticeMessage"
          class="mt-3 rounded-xl border border-black/10 bg-black px-3 py-2 text-xs text-white"
        >
          {{ noticeMessage }}
        </div>

        <div class="mt-4 space-y-2">
          <div
            v-for="item in catalogItems"
            :key="item.id"
            data-product-card
            class="flex items-center gap-3 rounded-2xl border border-black/10 bg-slate-50 p-3"
            :class="{ 'opacity-60': item.stock <= 0 }"
          >
            <div
              data-product-image
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
              <p class="truncate font-semibold">{{ item.name }}</p>
              <p class="text-xs text-slate-500">
                1 แพ็ค = {{ item.bottlesPerPack }} ขวด · {{ item.price }} ฿
              </p>
              <p class="text-[11px] text-slate-400">3 แพ็ค 100 ฿</p>
              <p
                class="mt-0.5 text-[11px]"
                :class="
                  item.stock <= 0
                    ? 'font-semibold text-rose-600'
                    : 'text-slate-500'
                "
              >
                {{
                  item.stock <= 0 ? "สินค้าหมด" : `คงเหลือ ${item.stock} แพ็ค`
                }}
              </p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-2">
              <input
                :value="orderQuantities[item.id] ?? 1"
                type="number"
                min="1"
                :max="item.stock > 0 ? item.stock : undefined"
                :disabled="item.stock <= 0"
                class="no-spin w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                @input="onQuantityInput(item.id, $event)"
              />
              <button
                type="button"
                class="rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                :disabled="item.stock <= 0"
                @click="(event) => onOrder(item.id, event)"
              >
                {{ item.stock <= 0 ? "หมด" : "เพิ่มลงตะกร้า" }}
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="mt-2 text-xs text-slate-500 underline underline-offset-2 hover:text-slate-800"
          @click="onResetInventory"
        >
          รีเซ็ตสต็อกเป็นมาตรฐาน
        </button>

        <div
          v-if="cartCount > 0"
          class="mt-4 rounded-xl border border-black/15 bg-slate-50 p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-semibold text-slate-700">ในตะกร้า</p>
            <button
              type="button"
              class="text-xs font-semibold text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
              @click="goCart"
            >
              เปิดตะกร้า
            </button>
          </div>
          <ul class="mt-2 space-y-1.5 text-sm text-slate-800">
            <li
              v-for="line in cartItems"
              :key="line.id"
              class="flex justify-between gap-2"
            >
              <span class="min-w-0 truncate">{{ line.name }}</span>
              <span class="shrink-0 text-slate-600">×{{ line.quantity }}</span>
            </li>
          </ul>
        </div>
      </div>

      <UserTabBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { WATER_CATALOG } from "~/composables/useLocalWatershop";

definePageMeta({
  middleware: "auth",
});

type ReceiptItem = {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  createdAt: string;
};

const RECEIPTS_STORAGE_KEY = "watershop-receipts";

const router = useRouter();
const { user } = useAuth();

const todayLabel = computed(() => {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date());
  } catch {
    return "";
  }
});

const displayName = computed(() => {
  const email = user.value?.email ?? "";
  const local = email.split("@")[0] ?? "";
  if (!local) return "ผู้ใช้";
  const cleaned = local.replace(/[-_.]+/g, " ").trim();
  if (!cleaned) return "ผู้ใช้";
  return cleaned
    .split(" ")
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(" ");
});

const shop = useLocalWatershop();
const {
  items,
  cartItems,
  totalCount: cartCount,
  hydrateShop,
  ensureCatalog,
  resetInventory,
  addItem,
} = shop;
const noticeMessage = ref("");
const orderQuantities = ref<Record<string, number>>({});
const receipts = ref<ReceiptItem[]>([]);

/** แสดง 2 รายการเสมอ — ดึงสต็อกจาก state ถ้ามี */
const catalogItems = computed(() =>
  WATER_CATALOG.map((def) => {
    const live = items.value.find((i) => i.id === def.id);
    return live
      ? { ...live, price: 35, stock: Math.max(0, Math.trunc(live.stock)) }
      : { ...def };
  }),
);

const todayReceiptCount = computed(
  () => receipts.value.filter((r) => isToday(r.createdAt)).length,
);
const todaySoldQty = computed(() =>
  receipts.value
    .filter((r) => isToday(r.createdAt))
    .reduce((sum, r) => sum + r.quantity, 0),
);
const todayTotalAmount = computed(() =>
  receipts.value
    .filter((r) => isToday(r.createdAt))
    .reduce((sum, r) => sum + r.amount, 0),
);
const todayOrderCount = computed(
  () => receipts.value.filter((r) => isToday(r.createdAt)).length,
);

const receiptProgress = computed(() =>
  Math.min((todayReceiptCount.value / 20) * 100, 100),
);
const soldProgress = computed(() =>
  Math.min((todaySoldQty.value / 80) * 100, 100),
);
const spendProgress = computed(() =>
  Math.min((todayTotalAmount.value / 2000) * 100, 100),
);

const ORDER_GOAL = 20;
const gaugeSeries = computed(() => [
  Math.min((todayOrderCount.value / ORDER_GOAL) * 100, 100),
]);
const gaugeOptions = computed(() => ({
  chart: {
    type: "radialBar" as const,
    sparkline: { enabled: true },
    animations: {
      enabled: true,
      easing: "easeinout" as const,
      speed: 600,
      dynamicAnimation: { enabled: true, speed: 400 },
    },
    foreColor: "#0f172a",
  },
  plotOptions: {
    radialBar: {
      startAngle: -110,
      endAngle: 110,
      hollow: { size: "62%", background: "transparent" },
      track: {
        background: "#e2e8f0",
        strokeWidth: "100%",
        margin: 0,
      },
      dataLabels: {
        name: { show: false },
        value: {
          offsetY: 6,
          fontSize: "44px",
          fontFamily: "inherit",
          fontWeight: 800,
          color: "#0f172a",
          formatter: () => String(todayOrderCount.value),
        },
      },
    },
  },
  fill: {
    type: "solid",
  },
  colors: ["#000000"],
  stroke: { lineCap: "round" as const },
  labels: ["ออเดอร์วันนี้"],
}));

if (import.meta.client) {
  hydrateShop();
  ensureCatalog();
  const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
  receipts.value = raw ? (JSON.parse(raw) as ReceiptItem[]) : [];
}

const isToday = (timestamp: string) => {
  const target = new Date(timestamp);
  const now = new Date();
  return (
    target.getDate() === now.getDate() &&
    target.getMonth() === now.getMonth() &&
    target.getFullYear() === now.getFullYear()
  );
};

const goProfile = () => {
  router.push("/user/profile");
};

const goCart = () => {
  router.push("/user/cart");
};

watchEffect(() => {
  const nextQuantities = { ...orderQuantities.value };

  for (const item of catalogItems.value) {
    const currentQuantity = nextQuantities[item.id];
    if (!currentQuantity || currentQuantity < 1) {
      nextQuantities[item.id] = 1;
    }
  }

  orderQuantities.value = nextQuantities;
});

const updateOrderQuantity = (itemId: string, value: number) => {
  orderQuantities.value[itemId] = Math.max(1, Math.trunc(value));
};

const onQuantityInput = (itemId: string, event: Event) => {
  const next = Number((event.target as HTMLInputElement).value);
  updateOrderQuantity(itemId, Number.isFinite(next) ? next : 1);
};

const cartIconRef = ref<HTMLElement | null>(null);
const cartPulse = ref(false);

const flyToCart = (sourceEl: HTMLElement, imageSrc: string) => {
  if (!import.meta.client) return;
  const cartEl = cartIconRef.value;
  if (!cartEl || !sourceEl) return;

  const productCard = sourceEl.closest(
    "[data-product-card]",
  ) as HTMLElement | null;
  const productImg = productCard?.querySelector(
    "[data-product-image]",
  ) as HTMLElement | null;
  const originEl = productImg ?? sourceEl;

  const src = originEl.getBoundingClientRect();
  const dst = cartEl.getBoundingClientRect();

  const size = 56;
  const ghost = document.createElement("img");
  ghost.src = imageSrc;
  ghost.alt = "";
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${src.left + src.width / 2 - size / 2}px`,
    top: `${src.top + src.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "14px",
    objectFit: "cover",
    background: "#ffffff",
    boxShadow: "0 18px 36px rgba(0, 0, 0, 0.25)",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    zIndex: "60",
    pointerEvents: "none",
    transition:
      "transform 720ms cubic-bezier(0.55, -0.05, 0.7, 1.05), opacity 720ms ease",
    transform: "translate(0px, 0px) scale(1) rotate(0deg)",
    opacity: "1",
  } as CSSStyleDeclaration);
  document.body.appendChild(ghost);

  void ghost.offsetWidth;

  const dx = dst.left + dst.width / 2 - (src.left + src.width / 2);
  const dy = dst.top + dst.height / 2 - (src.top + src.height / 2);
  ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.18) rotate(15deg)`;
  ghost.style.opacity = "0.35";

  window.setTimeout(() => {
    ghost.remove();
    cartPulse.value = false;
    void cartEl.offsetWidth;
    cartPulse.value = true;
    window.setTimeout(() => {
      cartPulse.value = false;
    }, 420);
  }, 720);
};

const onOrder = (itemId: string, event?: MouseEvent) => {
  noticeMessage.value = "";

  try {
    ensureCatalog();
    const targetItem =
      items.value.find((item) => item.id === itemId) ??
      catalogItems.value.find((item) => item.id === itemId);
    if (!targetItem) throw new Error("ไม่พบสินค้าที่เลือก");
    if (targetItem.stock <= 0) throw new Error("สินค้าหมด");

    const requested = orderQuantities.value[itemId] ?? 1;
    const quantity = Math.min(Math.max(1, requested), targetItem.stock);
    addItem(
      {
        id: targetItem.id,
        name: targetItem.name,
        price: targetItem.price,
      },
      quantity,
    );

    const trigger = event?.currentTarget as HTMLElement | undefined;
    if (trigger) {
      flyToCart(trigger, targetItem.image);
    }

    noticeMessage.value = `เพิ่ม ${targetItem.name} x${quantity} ลงตะกร้าแล้ว (${cartCount.value} รายการ)`;
  } catch (error) {
    noticeMessage.value =
      error instanceof Error ? error.message : "สั่งสินค้าไม่สำเร็จ";
  }
};

const onResetInventory = () => {
  resetInventory();
  noticeMessage.value = "รีเซ็ตสินค้าแล้ว";
};
</script>

<style scoped>
.cart-pulse {
  animation: cart-bounce 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cart-bounce {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.22);
  }
  70% {
    transform: scale(0.94);
  }
  100% {
    transform: scale(1);
  }
}
</style>
