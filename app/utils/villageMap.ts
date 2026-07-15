export const VILLAGE_ENTRANCE = { lat: 16.5139875, lng: 102.7853795 };

const HOUSE_COORDS_STORAGE_KEY = "watershop-house-coords";
const HOUSE_COORDS_HIDDEN_KEY = "watershop-house-coords-hidden";

/** พิกัดยืนยันแล้วต่อบ้านเลขที่ — ปรับได้ใน localStorage ผ่าน saveHouseCoords */
export const HOUSE_COORDS: Record<string, { lat: number; lng: number }> = {
  "12": { lat: 16.51483, lng: 102.78639 },
  "68": { lat: 16.513734, lng: 102.7853 },
  "84": { lat: 16.51365, lng: 102.78528 },
};

export type HouseCoordsSource = "override" | "builtin" | "approximate";

export type HouseCoordsResult = {
  lat: number;
  lng: number;
  confirmed: boolean;
  source: HouseCoordsSource;
};

function readOverrides(): Record<string, { lat: number; lng: number }> {
  if (!import.meta.client) return {};
  try {
    const raw = localStorage.getItem(HOUSE_COORDS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, { lat: number; lng: number }>) : {};
  } catch {
    return {};
  }
}

function readHidden(): Set<string> {
  if (!import.meta.client) return new Set();
  try {
    const raw = localStorage.getItem(HOUSE_COORDS_HIDDEN_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(list);
  } catch {
    return new Set();
  }
}

function writeHidden(hidden: Set<string>) {
  if (!import.meta.client) return;
  localStorage.setItem(HOUSE_COORDS_HIDDEN_KEY, JSON.stringify([...hidden]));
}

export function readHouseCoordOverrides(): Record<string, { lat: number; lng: number }> {
  return readOverrides();
}

export function saveHouseCoords(houseNo: string, lat: number, lng: number) {
  if (!import.meta.client) return;
  const key = houseNo.trim();
  if (!key) return;
  const overrides = readOverrides();
  overrides[key] = { lat, lng };
  localStorage.setItem(HOUSE_COORDS_STORAGE_KEY, JSON.stringify(overrides));
  const hidden = readHidden();
  hidden.delete(key);
  writeHidden(hidden);
}

/** ลบพิกัดที่บันทึกเอง — ค่าเริ่มต้นในระบบจะถูกซ่อนด้วยถ้ามี */
export function deleteHouseCoords(houseNo: string) {
  if (!import.meta.client) return;
  const key = houseNo.trim();
  if (!key) return;
  const overrides = readOverrides();
  delete overrides[key];
  localStorage.setItem(HOUSE_COORDS_STORAGE_KEY, JSON.stringify(overrides));
  if (HOUSE_COORDS[key]) {
    const hidden = readHidden();
    hidden.add(key);
    writeHidden(hidden);
  }
}

export function listConfirmedHouses(): string[] {
  if (!import.meta.client) {
    return Object.keys(HOUSE_COORDS);
  }
  const overrides = readOverrides();
  const hidden = readHidden();
  const keys = new Set([
    ...Object.keys(overrides),
    ...Object.keys(HOUSE_COORDS).filter((k) => !hidden.has(k)),
  ]);
  return [...keys].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
}

export function houseCoordsMeta(houseNo: string): {
  source: HouseCoordsSource;
  canDelete: boolean;
} {
  const key = houseNo.trim();
  if (!key) return { source: "approximate", canDelete: false };
  const overrides = readOverrides();
  if (overrides[key]) return { source: "override", canDelete: true };
  if (HOUSE_COORDS[key] && !readHidden().has(key)) {
    return { source: "builtin", canDelete: true };
  }
  return { source: "approximate", canDelete: false };
}

export function resolveHouseCoords(houseNo?: string | null): HouseCoordsResult {
  const key = houseNo?.trim();
  if (key) {
    const overrides = readOverrides();
    if (overrides[key]) {
      return { ...overrides[key], confirmed: true, source: "override" };
    }
    if (HOUSE_COORDS[key] && !readHidden().has(key)) {
      return { ...HOUSE_COORDS[key], confirmed: true, source: "builtin" };
    }
  }
  return { ...VILLAGE_ENTRANCE, confirmed: false, source: "approximate" };
}

export function googleMapsLinkUrl(lat: number, lng: number, zoom = 19) {
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&t=k`;
}

/** เปิดโหมดนำทางเลี้ยวทีละเลี้ยวจากตำแหน่งปัจจุบันไปยัง lat,lng */
export function googleMapsNavigationUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

export type MapMarker = {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  confirmed?: boolean;
  shape?: "pin" | "shop" | "home";
};

/**
 * ขอเส้นทางจริงตามถนนจาก OSRM (public demo server, ฟรี ไม่ต้องขอ API key)
 * คืนค่า null ถ้าขอไม่สำเร็จ — ให้ผู้เรียกใช้เส้นตรงเป็น fallback
 */
export async function fetchRoadRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<{ lat: number; lng: number }[] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await $fetch<{
      code: string;
      routes?: { geometry: { coordinates: [number, number][] } }[];
    }>(url);
    const coords = res?.routes?.[0]?.geometry?.coordinates;
    if (!coords?.length) return null;
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return null;
  }
}

/** ระยะทางตรง (กม.) ระหว่างจุดสองจุด — ใช้ประมาณระยะส่ง ไม่ใช่ระยะถนนจริง */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** เวลาโดยประมาณ (นาที) สมมติความเร็วมอเตอร์ไซค์เฉลี่ยในหมู่บ้าน ~20 กม./ชม. */
export function estimateDeliveryMinutes(km: number) {
  return Math.max(1, Math.round((km / 20) * 60));
}
