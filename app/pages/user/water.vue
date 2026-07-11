<template>
  <div class="mx-auto w-full max-w-md space-y-4">
      <div
        class="rounded-3xl bg-white p-5 text-slate-900 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="grid h-40 w-40 shrink-0 place-items-center">
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
          </div>

          <div class="w-44 shrink-0 space-y-3">
            <div>
              <div class="mb-1 flex items-center justify-between text-xs">
                <span class="text-slate-500">จำนวนครั้ง / ใบเสร็จ</span>
                <span class="font-semibold tabular-nums text-slate-900">
                  <span class="text-sm">{{
                    formatInt(todayReceiptCount)
                  }}</span>
                  <span class="text-slate-400"> /{{ formatInt(20) }}</span>
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
                <span class="text-slate-500">ประหยัด</span>
                <span class="font-semibold tabular-nums text-slate-900">
                  <span class="text-sm">{{ formatInt(todaySavedAmount) }}</span>
                  <span class="text-slate-400"> /{{ formatInt(200) }}</span>
                </span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-full rounded-full bg-black transition-[width] duration-500"
                  :style="{ width: `${savedProgress}%` }"
                />
              </div>
            </div>
            <div>
              <div class="mb-1 flex items-center justify-between text-xs">
                <span class="text-slate-500">Spend Today</span>
                <span class="font-semibold tabular-nums text-slate-900">
                  <span class="text-sm">{{ formatInt(todayTotalAmount) }}</span>
                  <span class="text-slate-400"> /{{ formatInt(2000) }}</span>
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
        class="rounded-3xl bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
      >
        <div class="flex items-end justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-xl font-bold leading-tight">สั่งน้ำดื่ม</h2>
          </div>
          <span
            class="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
          >
            {{ formatInt(catalogItems.length) }} เมนู
          </span>
        </div>
        <p class="mt-2 text-xs text-slate-500">
          เลือกจำนวนจากปุ่ม + / - แล้วกดเพิ่มลงตะกร้าได้ทันที
        </p>
        <div>
          <p class="text-[11px] text-slate-400">โปร 3 แพ็ค 100 ฿ (คละขนาดรวมกันได้)</p>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            v-for="quick in quickMenus"
            :key="quick.id"
            type="button"
            class="rounded-2xl border px-3 py-3 text-left shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            :class="quick.buttonClass"
            :disabled="!canQuickAdd(quick.id)"
            @click="(event) => onQuickAdd(quick.id, event)"
          >
            <p class="text-sm font-bold leading-tight">{{ quick.label }}</p>
            <p class="mt-1 text-[11px] font-semibold opacity-80">100 ฿ · เพิ่มตะกร้า</p>
          </button>
        </div>

        <div class="mt-4 space-y-3">
          <div
            v-for="item in catalogItems"
            :key="item.id"
            data-product-card
            class="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition"
            :class="item.stock <= 0 ? 'opacity-60' : 'hover:border-slate-200'"
          >
            <div class="flex items-start gap-3">
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
                <p class="truncate font-semibold text-slate-900">
                  {{ item.name }}
                </p>

                <p
                  class="mt-0.5 text-[11px]"
                  :class="
                    item.stock <= 0
                      ? 'font-semibold text-rose-600'
                      : 'text-slate-500'
                  "
                >
                  {{
                    item.stock <= 0
                      ? "สินค้าหมด"
                      : `คงเหลือ ${formatInt(item.stock)} แพ็ค`
                  }}
                </p>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between gap-3">
              <div
                class="inline-flex items-center rounded-xl bg-white p-1 ring-1 ring-slate-200"
              >
                <button
                  type="button"
                  class="grid h-8 w-8 place-items-center rounded-lg text-base font-semibold text-slate-700 transition active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300"
                  :disabled="
                    item.stock <= 0 || (orderQuantities[item.id] ?? 1) <= 1
                  "
                  @click="decrementQuantity(item.id)"
                >
                  -
                </button>
                <input
                  :value="orderQuantities[item.id] ?? 1"
                  type="number"
                  min="1"
                  :max="item.stock > 0 ? item.stock : undefined"
                  :disabled="item.stock <= 0"
                  class="no-spin w-12 border-0 bg-transparent px-1 text-center text-sm font-semibold text-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                  @input="onQuantityInput(item.id, $event)"
                />
                <button
                  type="button"
                  class="grid h-8 w-8 place-items-center rounded-lg text-base font-semibold text-slate-700 transition active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300"
                  :disabled="
                    item.stock <= 0 ||
                    (orderQuantities[item.id] ?? 1) >= item.stock
                  "
                  @click="incrementQuantity(item.id, item.stock)"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                class="rounded-xl bg-black px-3.5 py-2 text-xs font-semibold text-white shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                :disabled="item.stock <= 0"
                @click="(event) => onOrder(item.id, event)"
              >
                {{ item.stock <= 0 ? "หมด" : "เพิ่มลงตะกร้า" }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
</template>

<script setup lang="ts">
import { WATER_CATALOG } from "~/composables/useLocalWatershop";

definePageMeta({
  layout: "user",
  middleware: "auth",
});

const { formatInt } = useFormatNumber();

const shop = useLocalWatershop();
const {
  items,
  hydrateShop,
  ensureCatalog,
  addItem,
} = shop;
const { receipts, loadReceipts } = useWatershopReceipts();
const orderQuantities = ref<Record<string, number>>({});

const QUICK_PACK_QTY = 3;

const quickMenus = [
  {
    id: "water-600ml",
    label: "กลาง 3 แพ็ค",
    buttonClass:
      "border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300 hover:bg-sky-100",
  },
  {
    id: "water-1500ml",
    label: "ใหญ่ 3 แพ็ค",
    buttonClass:
      "border-violet-200 bg-violet-50 text-violet-900 hover:border-violet-300 hover:bg-violet-100",
  },
] as const;

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
const todaySavedAmount = computed(() =>
  receipts.value
    .filter((r) => isToday(r.createdAt))
    .reduce((sum, r) => {
      const regularPrice = r.quantity * 35;
      const saved = Math.max(regularPrice - r.amount, 0);
      return sum + saved;
    }, 0),
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
const savedProgress = computed(() =>
  Math.min((todaySavedAmount.value / 200) * 100, 100),
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
  loadReceipts();
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
  const max =
    catalogItems.value.find((item) => item.id === itemId)?.stock ??
    Number.POSITIVE_INFINITY;
  const normalized = Math.max(1, Math.trunc(value));
  orderQuantities.value[itemId] = Math.min(normalized, max);
};

const onQuantityInput = (itemId: string, event: Event) => {
  const next = Number((event.target as HTMLInputElement).value);
  updateOrderQuantity(itemId, Number.isFinite(next) ? next : 1);
};

const incrementQuantity = (itemId: string, stock: number) => {
  if (stock <= 0) return;
  const current = orderQuantities.value[itemId] ?? 1;
  updateOrderQuantity(itemId, Math.min(current + 1, stock));
};

const decrementQuantity = (itemId: string) => {
  const current = orderQuantities.value[itemId] ?? 1;
  updateOrderQuantity(itemId, Math.max(1, current - 1));
};

const flyToCart = (sourceEl: HTMLElement, imageSrc: string) => {
  if (!import.meta.client) return;
  const cartEl = document.querySelector(
    "[data-user-cart-icon]",
  ) as HTMLElement | null;
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
    cartEl.classList.remove("cart-pulse");
    void cartEl.offsetWidth;
    cartEl.classList.add("cart-pulse");
    window.setTimeout(() => {
      cartEl.classList.remove("cart-pulse");
    }, 420);
  }, 720);
};

const onOrder = (itemId: string, event?: MouseEvent) => {
  const requested = orderQuantities.value[itemId] ?? 1;
  addToCart(itemId, requested, event?.currentTarget as HTMLElement | undefined);
};

const canQuickAdd = (itemId: string) => {
  const item = catalogItems.value.find((i) => i.id === itemId);
  return Boolean(item && item.stock >= QUICK_PACK_QTY);
};

const onQuickAdd = (itemId: string, event?: MouseEvent) => {
  addToCart(itemId, QUICK_PACK_QTY, event?.currentTarget as HTMLElement | undefined);
};

const addToCart = (
  itemId: string,
  quantity: number,
  trigger?: HTMLElement,
) => {
  try {
    ensureCatalog();
    const targetItem =
      items.value.find((item) => item.id === itemId) ??
      catalogItems.value.find((item) => item.id === itemId);
    if (!targetItem) throw new Error("ไม่พบสินค้าที่เลือก");
    if (targetItem.stock <= 0) throw new Error("สินค้าหมด");

    const safeQty = Math.min(Math.max(1, Math.trunc(quantity)), targetItem.stock);
    addItem(
      {
        id: targetItem.id,
        name: targetItem.name,
        price: targetItem.price,
      },
      safeQty,
    );

    if (trigger) {
      flyToCart(trigger, targetItem.image);
    }
  } catch (error) {
    console.error(error);
  }
};
</script>
