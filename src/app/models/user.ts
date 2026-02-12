export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  nickname: string | null;
  google_id: string;
  is_deleted: boolean;
  deleted_at: Date;
  deleted_by: number;
}
