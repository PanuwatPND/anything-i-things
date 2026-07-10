<template>
  <div ref="mapEl" class="h-full w-full" />
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

const props = withDefaults(
  defineProps<{
    lat: number;
    lng: number;
    zoom?: number;
  }>(),
  { zoom: 19 },
);

const mapEl = ref<HTMLElement | null>(null);
let mapInstance: LeafletMap | null = null;

const pinIcon = (L: typeof import("leaflet")) =>
  L.divIcon({
    className: "",
    html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#dc2626;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45)"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });

onMounted(async () => {
  if (!import.meta.client || !mapEl.value) return;
  const L = await import("leaflet");

  mapInstance = L.map(mapEl.value, {
    zoomControl: true,
    attributionControl: true,
  }).setView([props.lat, props.lng], props.zoom);

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 20,
      attribution: "Tiles &copy; Esri",
    },
  ).addTo(mapInstance);

  L.marker([props.lat, props.lng], { icon: pinIcon(L) }).addTo(mapInstance);
});

onUnmounted(() => {
  mapInstance?.remove();
  mapInstance = null;
});
</script>
