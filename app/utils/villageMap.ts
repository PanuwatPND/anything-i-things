export const VILLAGE_ENTRANCE = { lat: 16.5139875, lng: 102.7853795 };

/** พิกัดจริงที่ยืนยันแล้วต่อบ้านเลขที่ — เพิ่มเข้ามาเรื่อยๆ เมื่อมีลูกค้าปักหมุดยืนยัน */
export const HOUSE_COORDS: Record<string, { lat: number; lng: number }> = {
  "68": { lat: 16.513734, lng: 102.7853 },
};

export function resolveHouseCoords(houseNo?: string | null) {
  if (houseNo && HOUSE_COORDS[houseNo]) {
    return { ...HOUSE_COORDS[houseNo], confirmed: true };
  }
  return { ...VILLAGE_ENTRANCE, confirmed: false };
}

export function googleMapsLinkUrl(lat: number, lng: number, zoom = 19) {
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&t=k`;
}
