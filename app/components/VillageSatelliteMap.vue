<template>
  <div
    class="village-map relative h-full w-full overflow-hidden"
    :class="[
      compact ? 'village-map--compact' : '',
      basemap === 'vector' ? 'village-map--vector' : 'village-map--satellite',
    ]"
  >
    <div ref="mapEl" class="h-full w-full" />
    <div
      v-if="isLoading"
      class="pointer-events-none absolute inset-0 z-[500] animate-pulse bg-slate-100"
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
  TileLayer,
} from "leaflet";
import type { MapMarker } from "~/utils/villageMap";

type LatLng = { lat: number; lng: number };

const props = withDefaults(
  defineProps<{
    lat?: number;
    lng?: number;
    zoom?: number;
    markers?: MapMarker[];
    pinMode?: boolean;
    draftPin?: { lat: number; lng: number } | null;
    route?: LatLng[];
    /** โหมดพรีวิวจัดส่ง — ซ่อน zoom control */
    compact?: boolean;
    /** แผนที่พื้นหลัง */
    basemap?: "vector" | "satellite";
    /** เส้นประวิ่งไหล + รถเลื่อนตามเส้น */
    animateRoute?: boolean;
  }>(),
  {
    zoom: 19,
    pinMode: false,
    draftPin: null,
    compact: false,
    basemap: "vector",
    animateRoute: true,
  },
);

const emit = defineEmits<{
  mapClick: [coords: LatLng];
}>();

const mapEl = ref<HTMLElement | null>(null);
let mapInstance: LeafletMap | null = null;
let baseTiles: TileLayer[] = [];
let leafletMarkers: LeafletMarker[] = [];
let draftMarker: LeafletMarker | null = null;
let routeHalo: LeafletPolyline | null = null;
let routeLine: LeafletPolyline | null = null;
let routeGlowDots: LeafletCircleMarker[] = [];
let vehicleMarker: LeafletMarker | null = null;
let mapClickHandler: ((e: { latlng: LatLng }) => void) | null = null;
let resizeObserver: ResizeObserver | null = null;
let hasSized = false;
let loadingFallbackTimer: ReturnType<typeof setTimeout> | null = null;
let vehicleRaf = 0;
let routeAnimPoints: LatLng[] = [];
let routeCumDist: number[] = [];
let routeTotalDist = 0;
const isLoading = ref(true);

const prefersReducedMotion = () =>
  import.meta.client &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const haversineM = (a: LatLng, b: LatLng) => {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const bearingDeg = (a: LatLng, b: LatLng) => {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

const buildRouteMetrics = (points: LatLng[]) => {
  const cum = [0];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineM(points[i - 1]!, points[i]!);
    cum.push(total);
  }
  return { cum, total };
};

const sampleRoute = (
  points: LatLng[],
  cum: number[],
  total: number,
  t: number,
): { pos: LatLng; bearing: number } => {
  if (points.length === 0) return { pos: { lat: 0, lng: 0 }, bearing: 0 };
  if (points.length === 1 || total <= 0) {
    return { pos: points[0]!, bearing: 0 };
  }
  const dist = t * total;
  let i = 1;
  while (i < cum.length && cum[i]! < dist) i++;
  const i1 = Math.max(1, i);
  const i0 = i1 - 1;
  const segStart = cum[i0]!;
  const segEnd = cum[i1]!;
  const segLen = Math.max(1e-6, segEnd - segStart);
  const u = (dist - segStart) / segLen;
  const a = points[i0]!;
  const b = points[i1]!;
  return {
    pos: {
      lat: a.lat + (b.lat - a.lat) * u,
      lng: a.lng + (b.lng - a.lng) * u,
    },
    bearing: bearingDeg(a, b),
  };
};

const vehicleIcon = (L: typeof import("leaflet")) =>
  L.divIcon({
    className: "village-marker village-vehicle",
    html: `<div class="village-vehicle__wrap" aria-hidden="true">
      <img class="village-vehicle__img" src="/delivery-cat-icon.png" alt="" draggable="false" />
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

/** Lucide-style SVGs — สะอาด อ่านง่าย ไม่ใช้ emoji */
const ICON_STORE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M10 22V12h4v10"/><path d="M15 7H9v5h6z"/></svg>`;
const ICON_HOME = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const ICON_PIN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>`;

const pinIcon = (
  L: typeof import("leaflet"),
  color: string,
  confirmed: boolean,
  shape: "pin" | "shop" | "home" = "pin",
) => {
  const dim = confirmed ? "1" : "0.72";

  if (shape === "shop" || shape === "home") {
    const icon = shape === "shop" ? ICON_STORE : ICON_HOME;
    return L.divIcon({
      className: "village-marker",
      html: `<div class="village-marker__wrap" style="opacity:${dim}">
        <span class="village-marker__ring" style="--marker-color:${color}"></span>
        <div class="village-marker__chip" style="color:${color}">
          ${icon}
        </div>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }

  return L.divIcon({
    className: "village-marker",
    html: `<div class="village-marker__wrap" style="opacity:${dim}">
      <div class="village-marker__teardrop" style="background:${color}">
        ${ICON_PIN}
      </div>
    </div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
  });
};

const stopVehicleAnim = () => {
  if (vehicleRaf) {
    cancelAnimationFrame(vehicleRaf);
    vehicleRaf = 0;
  }
  vehicleMarker?.remove();
  vehicleMarker = null;
  routeAnimPoints = [];
  routeCumDist = [];
  routeTotalDist = 0;
};

const clearRoute = () => {
  stopVehicleAnim();
  routeHalo?.remove();
  routeLine?.remove();
  for (const d of routeGlowDots) d.remove();
  routeHalo = null;
  routeLine = null;
  routeGlowDots = [];
};

const startVehicleAnim = async (points: LatLng[]) => {
  if (!mapInstance || points.length < 2) return;
  if (!props.animateRoute || prefersReducedMotion()) return;

  const L = await import("leaflet");
  const { cum, total } = buildRouteMetrics(points);
  if (total <= 0) return;

  routeAnimPoints = points;
  routeCumDist = cum;
  routeTotalDist = total;

  const first = sampleRoute(points, cum, total, 0);
  vehicleMarker = L.marker([first.pos.lat, first.pos.lng], {
    icon: vehicleIcon(L),
    zIndexOffset: 800,
    interactive: false,
  }).addTo(mapInstance);

  const durationMs = Math.min(14000, Math.max(8000, total * 40));
  let startTs = 0;

  const tick = (ts: number) => {
    if (!vehicleMarker || !mapInstance) return;
    if (!startTs) startTs = ts;
    const t = ((ts - startTs) % durationMs) / durationMs;
    const sample = sampleRoute(
      routeAnimPoints,
      routeCumDist,
      routeTotalDist,
      t,
    );
    vehicleMarker.setLatLng([sample.pos.lat, sample.pos.lng]);
    vehicleRaf = requestAnimationFrame(tick);
  };

  vehicleRaf = requestAnimationFrame(tick);
};

const applyBasemap = async () => {
  if (!mapInstance) return;
  const L = await import("leaflet");
  for (const t of baseTiles) t.remove();
  baseTiles = [];

  if (props.basemap === "satellite") {
    const imagery = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 20, attribution: "Tiles &copy; Esri" },
    ).addTo(mapInstance);
    const labels = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, opacity: 0.75, attribution: "" },
    ).addTo(mapInstance);
    baseTiles = [imagery, labels];
    imagery.on("load", () => {
      isLoading.value = false;
    });
  } else {
    // CartoDB Positron — เวกเตอร์สว่าง อ่านง่าย
    const vector = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 20,
        subdomains: "abcd",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    ).addTo(mapInstance);
    baseTiles = [vector];
    vector.on("load", () => {
      isLoading.value = false;
    });
  }
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
    const latlngs = props.route.map((p) => [p.lat, p.lng] as [number, number]);
    const onVector = props.basemap === "vector";

    routeHalo = L.polyline(latlngs, {
      color: onVector ? "#cbd5e1" : "#ffffff",
      weight: onVector ? 7 : 8,
      opacity: onVector ? 1 : 0.85,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(mapInstance);

    const shouldAnimate =
      props.animateRoute && !prefersReducedMotion() && props.route.length >= 2;

    routeLine = L.polyline(latlngs, {
      color: onVector ? "#0ea5e9" : "#38bdf8",
      weight: 4,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
      dashArray: shouldAnimate ? "10 14" : undefined,
      className: shouldAnimate ? "village-route-flow" : "village-route-line",
    }).addTo(mapInstance);

    const start = props.route[0]!;
    const end = props.route[props.route.length - 1]!;
    routeGlowDots = [
      L.circleMarker([start.lat, start.lng], {
        radius: 4,
        color: "#fff",
        weight: 2,
        fillColor: "#059669",
        fillOpacity: 1,
      }).addTo(mapInstance),
      L.circleMarker([end.lat, end.lng], {
        radius: 4,
        color: "#fff",
        weight: 2,
        fillColor: "#e11d48",
        fillOpacity: 1,
      }).addTo(mapInstance),
    ];

    await startVehicleAnim(props.route);
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

  await applyBasemap();

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
watch(
  () => props.basemap,
  async () => {
    isLoading.value = true;
    await applyBasemap();
    await renderMarkers();
  },
);

onUnmounted(() => {
  if (mapInstance && mapClickHandler) {
    mapInstance.off("click", mapClickHandler);
  }
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (loadingFallbackTimer) clearTimeout(loadingFallbackTimer);
  loadingFallbackTimer = null;
  clearRoute();
  for (const t of baseTiles) t.remove();
  baseTiles = [];
  mapInstance?.remove();
  mapInstance = null;
  leafletMarkers = [];
  draftMarker = null;
  mapClickHandler = null;
});
</script>

<style>
.village-map .leaflet-control-attribution {
  background: rgba(255, 255, 255, 0.8) !important;
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

.village-marker__ring {
  position: absolute;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--marker-color, #0f172a) 18%, transparent);
  animation: village-pulse 2.2s ease-out infinite;
}

.village-marker__chip {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18);
}

.village-marker__chip svg {
  display: block;
}

.village-marker__teardrop {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  color: #fff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.28);
}

.village-marker__teardrop svg {
  transform: rotate(45deg);
  display: block;
}

.village-vehicle__wrap {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  animation: village-vehicle-bob 1.2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(15, 23, 42, 0.28));
}

.village-vehicle__img {
  display: block;
  width: 40px;
  height: 40px;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
  user-select: none;
  background: transparent;
}

@keyframes village-vehicle-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* เส้นประวิ่งไหล */
.village-route-flow {
  stroke-dasharray: 10 14;
  animation: village-dash-flow 0.9s linear infinite;
}

@keyframes village-dash-flow {
  to {
    stroke-dashoffset: -24;
  }
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
  .village-marker__ring {
    animation: none;
    opacity: 0.35;
  }
  .village-route-flow {
    animation: none;
  }
  .village-vehicle__wrap {
    animation: none;
  }
}
</style>
