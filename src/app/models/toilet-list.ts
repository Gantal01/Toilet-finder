export interface ToiletList {
  toilet_id: number;
  osm_id: number;
  lat: number;
  lon: number;
  fee: boolean | null;
  wheelchair: boolean | null;
}
