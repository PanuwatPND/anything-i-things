<template>
  <div class="min-h-screen bg-[#ececec] px-4 pb-32 pt-2 text-slate-900">
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
            {{ totalCount }} รายการ · {{ totalBottles }} แพ็ค
          </span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span class="text-slate-600">ยอดรวม</span>
          <span class="text-2xl font-bold">{{ totalAmount }} ฿</span>
        </div>

        <button
          class="w-full rounded-xl bg-black px-4 py-2.5 font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="cartItems.length === 0 || isCheckingOut"
          @click="checkout"
        >
          {{ isCheckingOut ? "กำลังยืนยัน..." : "ยืนยันสั่งซื้อ" }}
        </button>
      </div>

      <UserTabBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { WATER_CATALOG } from "~/composables/useLocalWatershop";
import Swal from "sweetalert2";

definePageMeta({
  layout: "user",
  middleware: "auth",
});

const imageOf = (id: string) =>
  WATER_CATALOG.find((d) => d.id === id)?.image ?? "/products/water-bottle.png";
const bottlesOf = (id: string) =>
  WATER_CATALOG.find((d) => d.id === id)?.bottlesPerPack ?? 6;

type ReceiptItem = {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  createdAt: string;
};

const RECEIPTS_STORAGE_KEY = "watershop-receipts";

const router = useRouter();
const shop = useLocalWatershop();
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
} = shop;
const isCheckingOut = ref(false);

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

const topRightToast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true,
  customClass: {
    popup: "watershop-toast",
    title: "watershop-toast-title",
    timerProgressBar: "watershop-toast-progress",
  },
});

const checkout = async () => {
  const confirmation = await Swal.fire({
    title: "ยืนยันการสั่งซื้อ",
    text: `ต้องการยืนยันออเดอร์ ${totalCount.value} รายการ (${totalAmount.value} ฿) ใช่ไหม`,
    icon: "question",
    iconColor: "#0f172a",
    position: "center",
    width: 360,
    padding: "1rem",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    buttonsStyling: false,
    customClass: {
      popup: "watershop-confirm",
      title: "watershop-confirm-title",
      htmlContainer: "watershop-confirm-text",
      confirmButton: "watershop-confirm-btn watershop-confirm-btn-primary",
      cancelButton: "watershop-confirm-btn watershop-confirm-btn-secondary",
      icon: "watershop-confirm-icon",
    },
    reverseButtons: true,
  });
  if (!confirmation.isConfirmed) return;

  isCheckingOut.value = true;

  try {
    ensureCatalog();
    for (const cartItem of cartItems.value) {
      const stockItem = items.value.find((item) => item.id === cartItem.id);
      if (!stockItem) throw new Error(`ไม่พบสินค้า ${cartItem.name}`);
      if (stockItem.stock < cartItem.quantity) {
        throw new Error(`สต็อก ${cartItem.name} ไม่พอ`);
      }
    }

    const orderedItems = [...cartItems.value];
    const finalTotalQty = totalBottles.value;
    const finalTotalAmount = totalAmount.value;
    const summaryName =
      orderedItems.length === 1
        ? orderedItems[0]!.name
        : `ออเดอร์รวม ${orderedItems.length} รายการ`;

    const newReceipts: ReceiptItem[] = [];
    for (const cartItem of orderedItems) {
      placeOrder(cartItem.id, cartItem.quantity);
    }

    newReceipts.push({
      id: `${Date.now()}${Math.floor(Math.random() * 100)}`.slice(-6),
      itemName: summaryName,
      quantity: finalTotalQty,
      amount: finalTotalAmount,
      createdAt: new Date().toISOString(),
    });

    if (import.meta.client) {
      const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
      const currentReceipts = raw ? (JSON.parse(raw) as ReceiptItem[]) : [];
      localStorage.setItem(
        RECEIPTS_STORAGE_KEY,
        JSON.stringify([...newReceipts, ...currentReceipts]),
      );
    }

    clearCart();
    await topRightToast.fire({
      icon: "success",
      title: "สั่งซื้อสำเร็จ",
      text: "ระบบบันทึกบิลเรียบร้อยแล้ว",
    });
    await router.push("/user/bills");
  } catch (error) {
    await topRightToast.fire({
      text:
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
      icon: "error",
      title: "สั่งซื้อไม่สำเร็จ",
      timer: 2400,
    });
  } finally {
    isCheckingOut.value = false;
  }
};
</script>

<style scoped>
:global(.swal2-popup.watershop-confirm) {
  border-radius: 1.25rem;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 20px 46px rgba(15, 23, 42, 0.24);
  margin-top: -5.25rem !important;
}

:global(.swal2-title.watershop-confirm-title) {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

:global(.swal2-html-container.watershop-confirm-text) {
  margin-top: 0.4rem;
  color: #64748b;
  font-size: 0.84rem;
}

:global(.swal2-icon.watershop-confirm-icon) {
  margin-top: 0.2rem;
  margin-bottom: 0.1rem;
}

:global(.swal2-actions) {
  gap: 0.55rem;
}

:global(button.watershop-confirm-btn) {
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0.8rem !important;
  min-width: 88px !important;
  padding: 0.48rem 0.85rem !important;
  font-size: 0.82rem !important;
  font-weight: 700 !important;
  box-shadow: none !important;
}

:global(button.watershop-confirm-btn:focus) {
  box-shadow: none !important;
}

:global(button.watershop-confirm-btn-primary) {
  background: #0f172a !important;
  border: 1px solid #0f172a !important;
  color: #ffffff !important;
}

:global(button.watershop-confirm-btn-secondary) {
  background: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
  color: #64748b !important;
}

:global(.swal2-popup.watershop-toast) {
  border-radius: 0.95rem;
  background: #ffffff;
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
}

:global(.swal2-title.watershop-toast-title) {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}

:global(.swal2-popup.watershop-toast .swal2-html-container) {
  font-size: 0.78rem !important;
  color: #64748b;
}

:global(.swal2-timer-progress-bar.watershop-toast-progress) {
  background: linear-gradient(90deg, #0f172a, #334155);
}

:global(.swal2-popup.watershop-toast .swal2-icon.swal2-success) {
  border-color: rgba(5, 150, 105, 0.4) !important;
  color: #059669 !important;
}

:global(.swal2-popup.watershop-toast .swal2-icon.swal2-error) {
  border-color: rgba(220, 38, 38, 0.35) !important;
  color: #dc2626 !important;
}
</style>
