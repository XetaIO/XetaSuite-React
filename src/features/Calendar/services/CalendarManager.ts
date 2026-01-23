import { handleApiError } from '@/shared/api';
import type { ManagerResult } from '@/shared/types';
import {
    CalendarRepository,
    CalendarEventRepository,
} from './CalendarRepository';
import type {
    CalendarEvent,
    CalendarEventFormData,
    CalendarEventDatesUpdate,
    CalendarFilters,
    FullCalendarEvent,
    AvailableEventCategory,
} from '../types';

/**
 * Calendar Manager - Business logic with error handling
 */
export const CalendarManager = {
    getCalendarData: async (filters?: CalendarFilters): Promise<ManagerResult<FullCalendarEvent[]>> => {
        try {
            const data = await CalendarRepository.getCalendarData(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    getTodayEvents: async (): Promise<ManagerResult<FullCalendarEvent[]>> => {
        try {
            const data = await CalendarRepository.getTodayEvents();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};

/**
 * Calendar Event Manager - Business logic with error handling
 */
export const CalendarEventManager = {
    getAll: async (filters?: CalendarFilters): Promise<ManagerResult<CalendarEvent[]>> => {
        try {
            const data = await CalendarEventRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    getById: async (id: number): Promise<ManagerResult<CalendarEvent>> => {
        try {
            const response = await CalendarEventRepository.getById(id);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    create: async (data: CalendarEventFormData): Promise<ManagerResult<CalendarEvent>> => {
        try {
            const response = await CalendarEventRepository.create(data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    update: async (id: number, data: Partial<CalendarEventFormData>): Promise<ManagerResult<CalendarEvent>> => {
        try {
            const response = await CalendarEventRepository.update(id, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    updateDates: async (id: number, data: CalendarEventDatesUpdate): Promise<ManagerResult<CalendarEvent>> => {
        try {
            const response = await CalendarEventRepository.updateDates(id, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await CalendarEventRepository.delete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available event categories for dropdown selection
     */
    getAvailableEventCategories: async (search?: string): Promise<ManagerResult<AvailableEventCategory[]>> => {
        try {
            const response = await CalendarEventRepository.getAvailableEventCategories(search);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
