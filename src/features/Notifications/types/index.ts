/**
 * Notification types for the frontend
 */

/**
 * Enum representing the different types of notifications.
 * Must match the backend NotificationType enum values.
 */
export enum NotificationType {
    CleaningAlert = 'cleaning_alert',
    ItemWarningStock = 'item_warning_stock',
}

/**
 * Icon identifiers for notifications.
 * Must match the backend NotificationType::icon() values.
 */
export type NotificationIcon = 'broom' | 'cubes';

export interface Notification {
    id: string; // UUID
    data: NotificationData;
    read_at: string | null;
    is_read: boolean;
    created_at: string;
    time_ago: string;
}

/**
 * Notification data payload based on alert_type.
 */
export interface NotificationData {
    alert_type: NotificationType;
    title: string;
    message: string;
    icon: NotificationIcon;
    link: string;
    // Cleaning alert specific
    material_id?: number;
    material_name?: string;
    last_cleaning?: string;
    next_cleaning?: string;
    // Item warning stock specific
    item_id?: number;
    item_name?: string;
    current_stock?: number;
    warning_minimum?: number;
}

export interface NotificationCountResponse {
    count: number;
}

export interface NotificationMessageResponse {
    message: string;
}
