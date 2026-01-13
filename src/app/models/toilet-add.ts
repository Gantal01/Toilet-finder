export interface PostToilet {
  name: string | null;
  operator: string | null;
  access: string | null;
  lat: number | null;
  lon: number | null;
  opening_hours: string | null;
  fee: boolean | null;
  wheelchair: boolean | null;
  extra_info: Record<string, string> | null;
}
