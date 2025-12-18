export interface Rating {
  rating_id: number;
  toilet_id: number;
  user_id: number;
  value: number;
  description: string | null;
  toilet_name?: string | null;
  user_name?: string | null;
  osm_id?: number | null;
  creation_time: Date;
}
