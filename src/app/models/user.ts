export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  nickname: string | null;
  google_id: string;
}
