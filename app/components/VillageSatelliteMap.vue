<template>
  <div
    class="village-map relative h-full w-full overflow-hidden"
    :class="compact ? 'village-map--compact' : ''"
  >
    <div ref="mapEl" class="h-full w-full" />
    <div
      v-if="isLoading"
      class="pointer-events-none absolute inset-0 z-[500] animate-pulse bg-slate-200"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <span
          class="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  Polyline as LeafletPolyline,
  CircleMarker as LeafletCircleMarker,
} from "leaflet";
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
    /** โหมดพรีวิวจัดส่ง — ซ่อน zoom control, route glow */
    compact?: boolean;
  }>(),
  { zoom: 19, pinMode: false, draftPin: null, compact: false },
);

const emit = defineEmits<{
  mapClick: [coords: { lat: number; lng: number }];
}>();

const mapEl = ref<HTMLElement | null>(null);
let mapInstance: LeafletMap | null = null;
let leafletMarkers: LeafletMarker[] = [];
let draftMarker: LeafletMarker | null = null;
let routeHalo: LeafletPolyline | null = null;
let routeLine: LeafletPolyline | null = null;
let routeGlowDots: LeafletCircleMarker[] = [];
let mapClickHandler: ((e: { latlng: { lat: number; lng: number } }) => void) | null =
  null;
let resizeObserver: ResizeObserver | null = null;
let hasSized = false;
let loadingFallbackTimer: ReturnType<typeof setTimeout> | null = null;
const isLoading = ref(true);

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const pinIcon = (
  L: typeof import("leaflet"),
  color: string,
  confirmed: boolean,
  shape: "pin" | "shop" | "home" = "pin",
) => {
  const dim = confirmed ? "1" : "0.7";

  if (shape === "shop") {
    return L.divIcon({
      className: "village-marker",
      html: `<div class="village-marker__wrap" style="opacity:${dim}">
        <span class="village-marker__pulse" style="background:${color}"></span>
        <div class="village-marker__badge" style="background:${color}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l1-4h16l1 4"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>
          </svg>
        </div>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }

  if (shape === "home") {
    return L.divIcon({
      className: "village-marker",
      html: `<div class="village-marker__wrap" style="opacity:${dim}">
        <span class="village-marker__pulse village-marker__pulse--home" style="background:${color}"></span>
        <div class="village-marker__pin" style="background:${color}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg)">
            <path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>
          </svg>
        </div>
      </div>`,
      iconSize: [36, 44],
      iconAnchor: [18, 40],
    });
  }

  return L.divIcon({
    className: "village-marker",
    html: `<div class="village-marker__wrap" style="opacity:${dim}">
      <span class="village-marker__pulse" style="background:${color}"></span>
      <div class="village-marker__pin" style="background:${color}"></div>
    </div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
  });
};

const clearRoute = () => {
  routeHalo?.remove();
  routeLine?.remove();
  for (const d of routeGlowDots) d.remove();
  routeHalo = null;
  routeLine = null;
  routeGlowDots = [];
};

const renderMarkers = async () => {
  if (!mapInstance || !import.meta.client) return;
  const L = await import("leaflet");

  for (const m of leafletMarkers) m.remove();
  leafletMarkers = [];

  const list: MapMarker[] = props.markers?.length
    ? props.markers
    : props.lat != null && props.lng != null
      ? [{ lat: props.lat, lng: props.lng, color: "#dc2626", confirmed: true }]
      : [];

  for (const m of list) {
    const marker = L.marker([m.lat, m.lng], {
      icon: pinIcon(
        L,
        m.color ?? "#dc2626",
        m.confirmed !== false,
        m.shape ?? "pin",
      ),
      zIndexOffset: m.shape === "shop" ? 200 : 100,
    });
    if (m.label) {
      marker.bindTooltip(escapeHtml(m.label), {
        permanent: false,
        direction: "top",
        offset: [0, -12],
        className: "village-tooltip",
      });
    }
    marker.addTo(mapInstance);
    leafletMarkers.push(marker);
  }

  if (draftMarker) {
    draftMarker.remove();
    draftMarker = null;
  }
  if (props.draftPin) {
    draftMarker = L.marker([props.draftPin.lat, props.draftPin.lng], {
      icon: pinIcon(L, "#f59e0b", true, "pin"),
    });
    draftMarker.bindTooltip("หมุดใหม่", {
      permanent: true,
      direction: "top",
      className: "village-tooltip",
    });
    draftMarker.addTo(mapInstance);
  }

  clearRoute();
  if (props.route?.length) {
    const latlngs = props.route.map(
      (p) => [p.lat, p.lng] as [number, number],
    );

    // เส้นขอบขาว → อ่านง่ายบนดาวเทียม
    routeHalo = L.polyline(latlngs, {
      color: "#ffffff",
      weight: 8,
      opacity: 0.85,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(mapInstance);

    routeLine = L.polyline(latlngs, {
      color: "#38bdf8",
      weight: 4,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
      className: "village-route-line",
    }).addTo(mapInstance);

    const start = props.route[0]!;
    const end = props.route[props.route.length - 1]!;
    routeGlowDots = [
      L.circleMarker([start.lat, start.lng], {
        radius: 5,
        color: "#fff",
        weight: 2,
        fillColor: "#10b981",
        fillOpacity: 1,
      }).addTo(mapInstance),
      L.circleMarker([end.lat, end.lng], {
        radius: 5,
        color: "#fff",
        weight: 2,
        fillColor: "#f43f5e",
        fillOpacity: 1,
      }).addTo(mapInstance),
    ];
  }

  const fitList = [
    ...list,
    ...(props.draftPin ? [props.draftPin] : []),
    ...(props.route ?? []),
  ];
  if (fitList.length > 1) {
    const bounds = L.latLngBounds(
      fitList.map((m) => [m.lat, m.lng] as [number, number]),
    );
    mapInstance.fitBounds(bounds.pad(0.28));
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
    zoomControl: !props.compact,
    attributionControl: true,
    zoomSnap: 0.25,
  }).setView([list[0]!.lat, list[0]!.lng], props.zoom);

  if (!props.compact) {
    mapInstance.zoomControl.setPosition("bottomright");
  }

  // ดาวเทียม + ป้ายชื่อถนนบางๆ ทับด้านบนให้อ่านง่ายขึ้น
  const imagery = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 20, attribution: "Tiles &copy; Esri" },
  ).addTo(mapInstance);

  L.tileLayer(
    "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19, opacity: 0.75, attribution: "" },
  ).addTo(mapInstance);

  imagery.on("load", () => {
    isLoading.value = false;
  });
  loadingFallbackTimer = setTimeout(() => {
    isLoading.value = false;
  }, 4000);

  await renderMarkers();
  syncPinMode();

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
  clearRoute();
  mapInstance?.remove();
  mapInstance = null;
  leafletMarkers = [];
  draftMarker = null;
  mapClickHandler = null;
});
</script>

<style>
.village-map .leaflet-control-attribution {
  background: rgba(255, 255, 255, 0.72) !important;
  backdrop-filter: blur(6px);
  border-radius: 8px 0 0 0;
  font-size: 9px !important;
  margin: 0 !important;
  padding: 2px 6px !important;
  color: #64748b !important;
  box-shadow: none !important;
}

.village-map .leaflet-control-zoom {
  border: none !important;
  box-shadow: 0 8px 20px -8px rgba(15, 23, 42, 0.35) !important;
  border-radius: 12px !important;
  overflow: hidden;
}

.village-map .leaflet-control-zoom a {
  width: 34px !important;
  height: 34px !important;
  line-height: 34px !important;
  border: none !important;
  color: #0f172a !important;
  background: rgba(255, 255, 255, 0.92) !important;
  font-size: 16px !important;
}

.village-map .leaflet-control-zoom a:hover {
  background: #fff !important;
}

.village-map--compact .leaflet-control-attribution {
  opacity: 0.55;
  transform: scale(0.92);
  transform-origin: bottom right;
}

.village-marker {
  background: transparent !important;
  border: none !important;
}

.village-marker__wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}

.village-marker__pulse {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  opacity: 0.35;
  animation: village-pulse 2s ease-out infinite;
}

.village-marker__pulse--home {
  bottom: 6px;
}

.village-marker__badge {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 3px solid #fff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.35);
}

.village-marker__pin {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 3px solid #fff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.35);
}

.village-tooltip {
  background: rgba(15, 23, 42, 0.92) !important;
  border: none !important;
  border-radius: 10px !important;
  color: #fff !important;
  font-family: inherit !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 6px 10px !important;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25) !important;
}

.village-tooltip::before {
  border-top-color: rgba(15, 23, 42, 0.92) !important;
}

@keyframes village-pulse {
  0% {
    transform: scale(0.7);
    opacity: 0.45;
  }
  70% {
    transform: scale(1.55);
    opacity: 0;
  }
  100% {
    transform: scale(1.55);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .village-marker__pulse {
    animation: none;
    opacity: 0.25;
  }
}
</style>
