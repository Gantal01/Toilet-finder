export interface Toilet {
  toilet_id: number;
  name: string;
  operator: string | null;
  access: string | null;
  approved: boolean;
  lat: number;
  lon: number;
  opening_hours: string | null;
  aprroved_by: number | null;
  added_by: number | null;
  fee: boolean | null;
  wheelchair: boolean | null;
  osm_id: number | null;
  extra_info: Record<string, string> | null;
}
