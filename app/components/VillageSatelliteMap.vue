<template>
  <div ref="mapEl" class="h-full w-full" />
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { MapMarker } from "~/utils/villageMap";

const props = withDefaults(
  defineProps<{
    lat?: number;
    lng?: number;
    zoom?: number;
    markers?: MapMarker[];
    pinMode?: boolean;
    draftPin?: { lat: number; lng: number } | null;
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
let mapClickHandler: ((e: { latlng: { lat: number; lng: number } }) => void) | null = null;

const pinIcon = (L: typeof import("leaflet"), color: string, confirmed: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);${confirmed ? "" : "opacity:0.65"}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });

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
      icon: pinIcon(L, m.color ?? "#dc2626", m.confirmed !== false),
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

  const fitList = props.draftPin ? [...list, props.draftPin] : list;
  if (fitList.length > 1) {
    const bounds = L.latLngBounds(fitList.map((m) => [m.lat, m.lng] as [number, number]));
    mapInstance.fitBounds(bounds.pad(0.15));
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

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 20, attribution: "Tiles &copy; Esri" },
  ).addTo(mapInstance);

  await renderMarkers();
  syncPinMode();
});

watch(() => props.markers, renderMarkers, { deep: true });
watch(() => [props.lat, props.lng], renderMarkers);
watch(() => props.draftPin, renderMarkers, { deep: true });
watch(() => props.pinMode, syncPinMode);

onUnmounted(() => {
  if (mapInstance && mapClickHandler) {
    mapInstance.off("click", mapClickHandler);
  }
  mapInstance?.remove();
  mapInstance = null;
  leafletMarkers = [];
  draftMarker = null;
  mapClickHandler = null;
});
</script>
