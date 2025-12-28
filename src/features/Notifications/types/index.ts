/**
 * Notification types for the frontend
 */

export interface Notification {
    id: string; // UUID
    type: string;
    title: string;
    message: string;
    icon: string | null;
    link: string | null;
    data: Record<string, unknown>;
    read_at: string | null;
    is_read: boolean;
    created_at: string;
    time_ago: string;
}

export interface NotificationCountResponse {
    count: number;
}

export interface NotificationMessageResponse {
    message: string;
}
