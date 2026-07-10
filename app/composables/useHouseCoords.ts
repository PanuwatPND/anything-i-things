import {
  deleteHouseCoords,
  houseCoordsMeta,
  listConfirmedHouses,
  resolveHouseCoords,
  saveHouseCoords,
  type HouseCoordsResult,
  type HouseCoordsSource,
} from "~/utils/villageMap";

const coordsVersion = ref(0);

export function useHouseCoords() {
  const version = computed(() => coordsVersion.value);

  const bump = () => {
    coordsVersion.value++;
  };

  const save = (houseNo: string, lat: number, lng: number) => {
    saveHouseCoords(houseNo, lat, lng);
    bump();
  };

  const remove = (houseNo: string) => {
    deleteHouseCoords(houseNo);
    bump();
  };

  const resolve = (houseNo?: string | null): HouseCoordsResult => {
    void version.value;
    return resolveHouseCoords(houseNo);
  };

  const meta = (houseNo: string) => {
    void version.value;
    return houseCoordsMeta(houseNo);
  };

  const allSavedHouses = computed(() => {
    void version.value;
    return listConfirmedHouses();
  });

  const sourceLabel = (source: HouseCoordsSource) => {
    if (source === "override") return "บันทึกเอง";
    if (source === "builtin") return "ค่าเริ่มต้น";
    return "โดยประมาณ";
  };

  return { version, save, remove, resolve, meta, allSavedHouses, sourceLabel };
}
