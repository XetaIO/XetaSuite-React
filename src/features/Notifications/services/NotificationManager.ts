import { handleApiError } from "@/shared/api";
import type { PaginatedResponse, ManagerResult } from "@/shared/types";
import type { Notification, NotificationMessageResponse } from "../types";
import { NotificationRepository } from "./NotificationRepository";

/**
 * Notification Manager - Mediates between View Layer and data source
 * Handles business rules, data transformations, and error handling
 */
export const NotificationManager = {
    /**
     * Get paginated list of notifications with error handling
     */
    getAll: async (page = 1, perPage = 15): Promise<ManagerResult<PaginatedResponse<Notification>>> => {
        try {
            const data = await NotificationRepository.getAll(page, perPage);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get unread notifications (max 20)
     */
    getUnread: async (): Promise<ManagerResult<Notification[]>> => {
        try {
            const data = await NotificationRepository.getUnread();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get unread notifications count
     */
    getUnreadCount: async (): Promise<ManagerResult<number>> => {
        try {
            const data = await NotificationRepository.getUnreadCount();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Mark a notification as read
     */
    markAsRead: async (id: string): Promise<ManagerResult<NotificationMessageResponse>> => {
        try {
            const data = await NotificationRepository.markAsRead(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<ManagerResult<NotificationMessageResponse>> => {
        try {
            const data = await NotificationRepository.markAllAsRead();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a notification
     */
    delete: async (id: string): Promise<ManagerResult<NotificationMessageResponse>> => {
        try {
            const data = await NotificationRepository.delete(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete all notifications
     */
    deleteAll: async (): Promise<ManagerResult<NotificationMessageResponse>> => {
        try {
            const data = await NotificationRepository.deleteAll();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
