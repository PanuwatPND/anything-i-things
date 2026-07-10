<template>
  <div class="mx-auto w-full max-w-md space-y-4">
      <div
        class="rounded-3xl bg-white p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500">Cart</p>
            <h1 class="text-xl font-bold">ตะกร้าของฉัน</h1>
          </div>
          <button
            class="rounded-xl border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white"
            @click="goHome"
          >
            กลับ
          </button>
        </div>
      </div>

      <div
        class="rounded-3xl bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
      >
        <div
          v-if="cartItems.length === 0"
          class="rounded-2xl bg-slate-50 px-3 py-6 text-center text-sm text-slate-500"
        >
          ยังไม่มีสินค้าในตะกร้า
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="flex items-center gap-3 rounded-2xl border border-black/10 bg-slate-50 p-3"
          >
            <div
              class="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
            >
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
                1 แพ็ค = {{ formatInt(bottlesOf(item.id)) }} ขวด · คละขนาดรวมกัน 3 แพ็ค 100 ฿
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
              <button
                class="rounded-lg border border-black/20 px-2 py-1 text-xs hover:bg-black hover:text-white"
                @click="removeItem(item.id)"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="rounded-3xl bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
      >
        <div class="mb-3 flex items-center justify-between text-sm">
          <span class="text-slate-500">จำนวนทั้งหมด</span>
          <span class="font-semibold">
            {{ formatInt(totalCount) }} รายการ · {{ formatInt(totalBottles) }} แพ็ค
          </span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span class="text-slate-600">ยอดรวม</span>
          <span class="text-2xl font-bold">{{ formatInt(totalAmount) }} ฿</span>
        </div>

        <div class="space-y-2">
          <button
            class="w-full rounded-xl bg-black px-4 py-2.5 font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:bg-slate-300"
            :disabled="cartItems.length === 0 || isCheckingOut || isOrdering"
            @click="checkout"
          >
            {{ isCheckingOut ? "กำลังยืนยัน..." : "ยืนยันสั่งซื้อ" }}
          </button>
          <button
            class="w-full rounded-xl border-2 border-orange-500 bg-orange-50 px-4 py-2.5 font-semibold text-orange-800 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            :disabled="cartItems.length === 0 || isOrdering || isCheckingOut"
            @click="orderNow"
          >
            {{ isOrdering ? "กำลังสั่ง..." : "สั่งด่วน (จ่ายทีหลัง)" }}
          </button>
        </div>
        <p class="mt-2 text-center text-[11px] text-slate-500">
          คละขนาดได้ — รวม 3 แพ็ค 100 ฿
        </p>
        <p class="mt-1 text-center text-[11px] text-slate-500">
          สั่งด่วน = รอจัดส่งก่อน · ชำระเงินทีหลังได้ที่หน้าบิล
        </p>
      </div>

    </div>
</template>

<script setup lang="ts">
import { WATER_CATALOG } from "~/composables/useLocalWatershop";

definePageMeta({
  layout: "user",
  middleware: "auth",
});

const imageOf = (id: string) =>
  WATER_CATALOG.find((d) => d.id === id)?.image ?? "/products/forest-600ml.png";
const bottlesOf = (id: string) =>
  WATER_CATALOG.find((d) => d.id === id)?.bottlesPerPack ?? 6;

const router = useRouter();
const { formatInt } = useFormatNumber();
const { error: toastError } = useToast();
const shop = useLocalWatershop();
const {
  cartItems,
  hydrateShop,
  ensureCatalog,
  updateQuantity,
  removeItem,
  totalAmount,
  totalCount,
  totalBottles,
} = shop;
const { checkoutCart } = usePlaceOrder();
const isCheckingOut = ref(false);
const isOrdering = ref(false);

if (import.meta.client) {
  hydrateShop();
  ensureCatalog();
}

const goHome = () => {
  router.push("/user/water");
};

const onQtyChange = (id: string, event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  updateQuantity(id, value);
};

const checkout = async () => {
  if (cartItems.value.length === 0 || isCheckingOut.value) return;
  isCheckingOut.value = true;
  try {
    await checkoutCart("pending");
  } catch (error) {
    toastError(
      "สั่งซื้อไม่สำเร็จ",
      error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
    );
  } finally {
    isCheckingOut.value = false;
  }
};

const orderNow = async () => {
  if (cartItems.value.length === 0 || isOrdering.value) return;
  isOrdering.value = true;
  try {
    await checkoutCart("pay_later");
  } catch (error) {
    toastError(
      "สั่งไม่สำเร็จ",
      error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
    );
  } finally {
    isOrdering.value = false;
  }
};
</script>
