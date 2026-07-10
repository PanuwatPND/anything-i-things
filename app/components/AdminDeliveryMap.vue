<template>
  <div class="space-y-4">
    <!-- Pin controls -->
    <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div class="flex flex-wrap items-end gap-3">
        <div class="min-w-[7rem] flex-1">
          <label class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            บ้านเลขที่
          </label>
          <input
            v-model="houseInput"
            type="text"
            inputmode="numeric"
            placeholder="เช่น 12"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none ring-slate-900/10 focus:ring-2"
          />
        </div>
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-[0.98]"
          :class="
            pinMode
              ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
          "
          @click="togglePinMode"
        >
          {{ pinMode ? "กำลังปักหมุด…" : "📍 ปักหมุด" }}
        </button>
        <button
          v-if="draftPin"
          type="button"
          class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-40"
          :disabled="!houseInput.trim()"
          @click="savePin"
        >
          {{ editingHouse ? "อัปเดต" : "บันทึก" }}
        </button>
        <button
          v-if="draftPin"
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
          @click="clearDraft"
        >
          ยกเลิก
        </button>
      </div>
      <p class="mt-2 text-[11px] text-slate-500">
        <template v-if="pinMode && editingHouse">
          แก้ไขบ้าน <strong>{{ editingHouse }}</strong> — แตะตำแหน่งใหม่บนแผนที่ แล้วกด <strong>อัปเดต</strong>
        </template>
        <template v-else-if="pinMode">
          แตะบนแผนที่เพื่อวางหมุด แล้วกด <strong>บันทึก</strong>
        </template>
        <template v-else>
          กด <strong>ปักหมุด</strong> แล้วแตะตำแหน่งบนแผนที่ หรือเลือกบ้านจากรายการด้านล่าง
        </template>
      </p>
      <p
        v-if="saveMessage"
        class="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200"
      >
        {{ saveMessage }}
      </p>
    </div>

    <!-- Map -->
    <div
      class="relative overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"
      :class="pinMode ? 'h-[min(55vh,28rem)] cursor-crosshair' : 'h-[min(50vh,24rem)]'"
    >
      <ClientOnly>
        <VillageSatelliteMap
          :markers="allMarkers"
          :pin-mode="pinMode"
          :draft-pin="draftPin"
          @map-click="onMapClick"
        />
      </ClientOnly>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-600">
      <span class="inline-flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-blue-600" /> ชำระแล้ว
      </span>
      <span class="inline-flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-violet-600" /> กำลังส่ง
      </span>
      <span class="inline-flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-emerald-600" /> ปักหมุดแล้ว
      </span>
      <span class="inline-flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-slate-400 opacity-65" /> โดยประมาณ
      </span>
      <span
        v-if="draftPin"
        class="inline-flex items-center gap-1 text-amber-700"
      >
        <span class="h-2 w-2 rounded-full bg-amber-500" /> หมุดใหม่
      </span>
    </div>

    <!-- Delivery queue -->
    <div v-if="deliveryOrders.length > 0">
      <h3 class="text-sm font-bold text-slate-900">รอจัดส่ง</h3>
      <ul class="mt-2 space-y-1.5">
        <li
          v-for="o in deliveryOrders"
          :key="o.id"
          class="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm"
        >
          <div class="min-w-0">
            <span class="font-bold text-slate-900">บ้าน {{ o.houseNo }}</span>
            <span class="ml-2 text-xs text-slate-500">{{ o.itemName }} × {{ o.quantity }}</span>
            <span
              class="ml-2 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              :class="o.status === 'shipping' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'"
            >
              {{ o.status === "shipping" ? "กำลังส่ง" : "ชำระแล้ว" }}
            </span>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-white"
            :class="resolve(o.houseNo).confirmed ? 'bg-slate-700' : 'bg-slate-900'"
            @click="resolve(o.houseNo).confirmed ? startEditHouse(o.houseNo) : startPinForHouse(o.houseNo)"
          >
            {{ resolve(o.houseNo).confirmed ? "แก้ไข" : "ปักหมุด" }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Saved houses -->
    <div v-if="savedHouseList.length > 0">
      <h3 class="text-sm font-bold text-slate-900">พิกัดที่บันทึกแล้ว</h3>
      <ul class="mt-2 space-y-1.5">
        <li
          v-for="h in savedHouseList"
          :key="h.houseNo"
          class="rounded-xl border border-slate-100 bg-white px-3 py-2.5"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-semibold text-slate-900">บ้าน {{ h.houseNo }}</p>
              <p class="mt-0.5 text-[10px] text-slate-500">
                {{ h.lat.toFixed(5) }}, {{ h.lng.toFixed(5) }}
                <span class="mx-1">·</span>
                {{ sourceLabel(h.source) }}
              </p>
            </div>
            <div class="flex shrink-0 flex-wrap justify-end gap-1">
              <a
                :href="googleMapsLinkUrl(h.lat, h.lng)"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-blue-600"
              >
                เปิด
              </a>
              <button
                type="button"
                class="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white"
                @click="startEditHouse(h.houseNo)"
              >
                แก้ไข
              </button>
              <button
                type="button"
                class="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700"
                @click="removeHouse(h.houseNo)"
              >
                ลบ
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MapMarker } from "~/utils/villageMap";
import { googleMapsLinkUrl } from "~/utils/villageMap";

type DeliveryOrder = {
  id: string;
  houseNo: string;
  itemName: string;
  quantity: number;
  status: "paid" | "shipping";
};

const props = defineProps<{
  orders: DeliveryOrder[];
}>();

const { save, remove, resolve, meta, allSavedHouses, version, sourceLabel } = useHouseCoords();

const houseInput = ref("");
const pinMode = ref(false);
const editingHouse = ref<string | null>(null);
const draftPin = ref<{ lat: number; lng: number } | null>(null);
const saveMessage = ref("");

const deliveryOrders = computed(() =>
  props.orders.filter((o) => o.houseNo && (o.status === "paid" || o.status === "shipping")),
);

const deliveryMarkers = computed((): MapMarker[] => {
  void version.value;
  const seen = new Set<string>();
  const markers: MapMarker[] = [];
  for (const o of deliveryOrders.value) {
    if (seen.has(o.houseNo)) continue;
    seen.add(o.houseNo);
    const c = resolve(o.houseNo);
    markers.push({
      lat: c.lat,
      lng: c.lng,
      label: `บ้าน ${o.houseNo}`,
      color: o.status === "shipping" ? "#7c3aed" : "#2563eb",
      confirmed: c.confirmed,
    });
  }
  return markers;
});

const savedHouseMarkers = computed((): MapMarker[] => {
  void version.value;
  const deliveryHouses = new Set(deliveryOrders.value.map((o) => o.houseNo));
  return allSavedHouses.value
    .filter((h) => !deliveryHouses.has(h))
    .map((houseNo) => {
      const c = resolve(houseNo);
      return {
        lat: c.lat,
        lng: c.lng,
        label: `บ้าน ${houseNo}`,
        color: "#059669",
        confirmed: true,
      };
    });
});

const allMarkers = computed((): MapMarker[] => [...deliveryMarkers.value, ...savedHouseMarkers.value]);

const savedHouseList = computed(() => {
  void version.value;
  return allSavedHouses.value.map((houseNo) => {
    const c = resolve(houseNo);
    return { houseNo, lat: c.lat, lng: c.lng, source: c.source };
  });
});

const resetPinState = () => {
  pinMode.value = false;
  editingHouse.value = null;
  draftPin.value = null;
};

const togglePinMode = () => {
  if (pinMode.value) {
    resetPinState();
  } else {
    pinMode.value = true;
    editingHouse.value = null;
    draftPin.value = null;
  }
  saveMessage.value = "";
};

const startPinForHouse = (houseNo: string) => {
  houseInput.value = houseNo;
  pinMode.value = true;
  editingHouse.value = null;
  draftPin.value = null;
  saveMessage.value = "";
};

const startEditHouse = (houseNo: string) => {
  const c = resolve(houseNo);
  houseInput.value = houseNo;
  editingHouse.value = houseNo;
  pinMode.value = true;
  draftPin.value = { lat: c.lat, lng: c.lng };
  saveMessage.value = "";
};

const onMapClick = (coords: { lat: number; lng: number }) => {
  if (!pinMode.value) return;
  draftPin.value = coords;
};

const clearDraft = () => {
  draftPin.value = null;
};

const savePin = () => {
  const house = houseInput.value.trim();
  if (!house || !draftPin.value) return;
  save(house, draftPin.value.lat, draftPin.value.lng);
  saveMessage.value = editingHouse.value
    ? `อัปเดตพิกัดบ้าน ${house} แล้ว`
    : `บันทึกพิกัดบ้าน ${house} แล้ว`;
  resetPinState();
  setTimeout(() => {
    saveMessage.value = "";
  }, 3000);
};

const removeHouse = (houseNo: string) => {
  const m = meta(houseNo);
  if (!m.canDelete) return;
  const label = m.source === "override" ? "พิกัดที่บันทึกเอง" : "พิกัดค่าเริ่มต้น";
  if (
    !confirm(
      `ลบ${label}ของบ้าน ${houseNo}?\n\nแผนที่จะกลับไปใช้ตำแหน่งโดยประมาณ (ทางเข้าหมู่บ้าน)`,
    )
  ) {
    return;
  }
  remove(houseNo);
  if (editingHouse.value === houseNo) resetPinState();
  if (houseInput.value.trim() === houseNo) houseInput.value = "";
  saveMessage.value = `ลบพิกัดบ้าน ${houseNo} แล้ว`;
  setTimeout(() => {
    saveMessage.value = "";
  }, 3000);
};

defineExpose({ startPinForHouse, startEditHouse });
</script>
