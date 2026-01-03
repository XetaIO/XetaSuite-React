import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse } from '@/shared/types';
import type { Notification, NotificationCountResponse, NotificationMessageResponse } from '../types';

/**
 * Notification Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const NotificationRepository = {
    /**
     * Get paginated list of notifications
     */
    getAll: async (page = 1, perPage = 15): Promise<PaginatedResponse<Notification>> => {
        const url = buildUrl(API_ENDPOINTS.NOTIFICATIONS.BASE, { page, per_page: perPage });
        const response = await httpClient.get<PaginatedResponse<Notification>>(url);
        return response.data;
    },

    /**
     * Get unread notifications (max 20)
     */
    getUnread: async (): Promise<Notification[]> => {
        const response = await httpClient.get<{ data: Notification[] }>(
            API_ENDPOINTS.NOTIFICATIONS.UNREAD
        );
        return response.data.data;
    },

    /**
     * Get unread notifications count
     */
    getUnreadCount: async (): Promise<number> => {
        const response = await httpClient.get<NotificationCountResponse>(
            API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
        );
        return response.data.count;
    },

    /**
     * Mark a notification as read
     */
    markAsRead: async (id: string): Promise<NotificationMessageResponse> => {
        const response = await httpClient.patch<NotificationMessageResponse>(
            API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)
        );
        return response.data;
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<NotificationMessageResponse> => {
        const response = await httpClient.patch<NotificationMessageResponse>(
            API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ
        );
        return response.data;
    },

    /**
     * Delete a notification
     */
    delete: async (id: string): Promise<NotificationMessageResponse> => {
        const response = await httpClient.delete<NotificationMessageResponse>(
            API_ENDPOINTS.NOTIFICATIONS.DELETE(id)
        );
        return response.data;
    },

    /**
     * Delete all notifications
     */
    deleteAll: async (): Promise<NotificationMessageResponse> => {
        const response = await httpClient.delete<NotificationMessageResponse>(
            API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL
        );
        return response.data;
    },
};
