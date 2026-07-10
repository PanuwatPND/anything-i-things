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

export type MapMarker = {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  confirmed?: boolean;
};
