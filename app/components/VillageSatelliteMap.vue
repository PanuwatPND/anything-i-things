<template>
  <div class="relative h-full w-full">
    <div ref="mapEl" class="h-full w-full" />
    <div
      v-if="isLoading"
      class="pointer-events-none absolute inset-0 animate-pulse bg-slate-200"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from "leaflet";
import type { MapMarker } from "~/utils/villageMap";

const props = withDefaults(
  defineProps<{
    lat?: number;
    lng?: number;
    zoom?: number;
    markers?: MapMarker[];
    pinMode?: boolean;
    draftPin?: { lat: number; lng: number } | null;
    route?: { lat: number; lng: number }[];
  }>(),
  { zoom: 19, pinMode: false, draftPin: null },
);

const emit = defineEmits<{
  mapClick: [coords: { lat: number; lng: number }];
}>();

const mapEl = ref<HTMLElement | null>(null);
let mapInstance: LeafletMap | null = null;
let leafletMarkers: LeafletMarker[] = [];
let draftMarker: LeafletMarker | null = null;
let routeLine: LeafletPolyline | null = null;
let mapClickHandler: ((e: { latlng: { lat: number; lng: number } }) => void) | null = null;
let resizeObserver: ResizeObserver | null = null;
let hasSized = false;
let loadingFallbackTimer: ReturnType<typeof setTimeout> | null = null;
const isLoading = ref(true);

const pinIcon = (L: typeof import("leaflet"), color: string, confirmed: boolean, shape: "pin" | "shop" = "pin") => {
  if (shape === "shop") {
    return L.divIcon({
      className: "",
      html: `<div style="width:30px;height:30px;border-radius:9px;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;font-size:15px;${confirmed ? "" : "opacity:0.65"}">🏪</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);${confirmed ? "" : "opacity:0.65"}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
};

const renderMarkers = async () => {
  if (!mapInstance || !import.meta.client) return;
  const L = await import("leaflet");

  for (const m of leafletMarkers) m.remove();
  leafletMarkers = [];

  const list: MapMarker[] =
    props.markers?.length
      ? props.markers
      : props.lat != null && props.lng != null
        ? [{ lat: props.lat, lng: props.lng, color: "#dc2626", confirmed: true }]
        : [];

  for (const m of list) {
    const marker = L.marker([m.lat, m.lng], {
      icon: pinIcon(L, m.color ?? "#dc2626", m.confirmed !== false, m.shape ?? "pin"),
    });
    if (m.label) marker.bindTooltip(m.label, { permanent: false, direction: "top" });
    marker.addTo(mapInstance);
    leafletMarkers.push(marker);
  }

  if (draftMarker) {
    draftMarker.remove();
    draftMarker = null;
  }
  if (props.draftPin) {
    draftMarker = L.marker([props.draftPin.lat, props.draftPin.lng], {
      icon: pinIcon(L, "#f59e0b", true),
    });
    draftMarker.bindTooltip("หมุดใหม่", { permanent: true, direction: "top" });
    draftMarker.addTo(mapInstance);
  }

  if (routeLine) {
    routeLine.remove();
    routeLine = null;
  }
  if (props.route?.length) {
    routeLine = L.polyline(
      props.route.map((p) => [p.lat, p.lng] as [number, number]),
      { color: "#2563eb", weight: 5, opacity: 0.9, lineCap: "round", lineJoin: "round" },
    ).addTo(mapInstance);
  }

  const fitList = [...list, ...(props.draftPin ? [props.draftPin] : []), ...(props.route ?? [])];
  if (fitList.length > 1) {
    const bounds = L.latLngBounds(fitList.map((m) => [m.lat, m.lng] as [number, number]));
    mapInstance.fitBounds(bounds.pad(0.2));
  } else if (fitList.length === 1) {
    mapInstance.setView([fitList[0]!.lat, fitList[0]!.lng], props.zoom);
  }
};

const syncPinMode = () => {
  if (!mapInstance) return;
  if (mapClickHandler) {
    mapInstance.off("click", mapClickHandler);
    mapClickHandler = null;
  }
  if (props.pinMode) {
    mapClickHandler = (e) => {
      emit("mapClick", { lat: e.latlng.lat, lng: e.latlng.lng });
    };
    mapInstance.on("click", mapClickHandler);
  }
};

onMounted(async () => {
  if (!import.meta.client || !mapEl.value) return;
  await nextTick();
  const L = await import("leaflet");

  const list = props.markers?.length
    ? props.markers
    : props.lat != null && props.lng != null
      ? [{ lat: props.lat, lng: props.lng }]
      : [{ lat: 16.5139875, lng: 102.7853795 }];

  mapInstance = L.map(mapEl.value, {
    zoomControl: true,
    attributionControl: true,
  }).setView([list[0]!.lat, list[0]!.lng], props.zoom);

  const tileLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 20, attribution: "Tiles &copy; Esri" },
  ).addTo(mapInstance);

  tileLayer.on("load", () => {
    isLoading.value = false;
  });
  // กันเคส tile โหลดไม่สำเร็จ/ช้ามาก — ไม่ให้ skeleton ค้างตลอดไป
  loadingFallbackTimer = setTimeout(() => {
    isLoading.value = false;
  }, 4000);

  await renderMarkers();
  syncPinMode();

  // ป้องกัน container วัดขนาดผิดตอน mount (เช่น อยู่ใน modal/teleport ที่ layout ยังไม่นิ่งตอน mount)
  // ใช้ ResizeObserver แทน setTimeout เดาเวลา — พอ container ได้ขนาดจริงเมื่อไหร่ค่อย fit ใหม่
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const { width, height } = entry.contentRect;
    if (width > 0 && height > 0 && !hasSized) {
      hasSized = true;
      mapInstance?.invalidateSize();
      renderMarkers();
    } else if (width > 0 && height > 0) {
      mapInstance?.invalidateSize();
    }
  });
  resizeObserver.observe(mapEl.value);
});

watch(() => props.markers, renderMarkers, { deep: true });
watch(() => [props.lat, props.lng], renderMarkers);
watch(() => props.draftPin, renderMarkers, { deep: true });
watch(() => props.route, renderMarkers, { deep: true });
watch(() => props.pinMode, syncPinMode);

onUnmounted(() => {
  if (mapInstance && mapClickHandler) {
    mapInstance.off("click", mapClickHandler);
  }
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (loadingFallbackTimer) clearTimeout(loadingFallbackTimer);
  loadingFallbackTimer = null;
  mapInstance?.remove();
  mapInstance = null;
  leafletMarkers = [];
  draftMarker = null;
  routeLine = null;
  mapClickHandler = null;
});
</script>
