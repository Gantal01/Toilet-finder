export interface Suggestion {
    suggestion_id: number;
    toilet_id: number;
    user_id: number;
    description: string;
    creation_time: Date;
    status: string;
    handled_by: number | null;
    handled_at: Date | null;
    deleted_at: Date | null;
}