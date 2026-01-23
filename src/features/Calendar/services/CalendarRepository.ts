import httpClient from '@/shared/api/httpClient';
import { buildUrl, API_ENDPOINTS } from '@/shared/api/urlBuilder';
import type { SingleResponse } from '@/shared/types';
import type {
    CalendarEvent,
    CalendarEventFormData,
    CalendarEventDatesUpdate,
    CalendarFilters,
    FullCalendarEvent,
    AvailableEventCategory,
} from '../types';

/**
 * Calendar Repository - Raw API calls (no error handling)
 */
export const CalendarRepository = {
    /**
     * Get aggregated calendar data (events, maintenances, incidents)
     */
    getCalendarData: async (filters?: CalendarFilters): Promise<FullCalendarEvent[]> => {
        const params: Record<string, string | boolean | undefined> = {};

        if (filters?.start) params.start = filters.start;
        if (filters?.end) params.end = filters.end;
        if (filters?.show_maintenances !== undefined) params.show_maintenances = String(filters.show_maintenances);
        if (filters?.show_incidents !== undefined) params.show_incidents = String(filters.show_incidents);

        const response = await httpClient.get<{ events: FullCalendarEvent[] }>(
            buildUrl(API_ENDPOINTS.CALENDAR.BASE, params)
        );
        return response.data.events;
    },

    /**
     * Get today's events
     */
    getTodayEvents: async (): Promise<FullCalendarEvent[]> => {
        const response = await httpClient.get<FullCalendarEvent[]>(API_ENDPOINTS.CALENDAR.TODAY);
        return response.data;
    },
};

/**
 * Calendar Event Repository - Raw API calls
 */
export const CalendarEventRepository = {
    getAll: async (filters?: CalendarFilters): Promise<CalendarEvent[]> => {
        const params: Record<string, string | undefined> = {};

        if (filters?.start) params.start = filters.start;
        if (filters?.end) params.end = filters.end;

        const response = await httpClient.get<{ data: CalendarEvent[] }>(
            buildUrl(API_ENDPOINTS.CALENDAR_EVENTS.BASE, params)
        );
        return response.data.data;
    },

    getById: async (id: number): Promise<SingleResponse<CalendarEvent>> => {
        const response = await httpClient.get<SingleResponse<CalendarEvent>>(
            API_ENDPOINTS.CALENDAR_EVENTS.DETAIL(id)
        );
        return response.data;
    },

    create: async (data: CalendarEventFormData): Promise<SingleResponse<CalendarEvent>> => {
        const response = await httpClient.post<SingleResponse<CalendarEvent>>(
            API_ENDPOINTS.CALENDAR_EVENTS.BASE,
            data
        );
        return response.data;
    },

    update: async (id: number, data: Partial<CalendarEventFormData>): Promise<SingleResponse<CalendarEvent>> => {
        const response = await httpClient.put<SingleResponse<CalendarEvent>>(
            API_ENDPOINTS.CALENDAR_EVENTS.DETAIL(id),
            data
        );
        return response.data;
    },

    updateDates: async (id: number, data: CalendarEventDatesUpdate): Promise<SingleResponse<CalendarEvent>> => {
        const response = await httpClient.patch<SingleResponse<CalendarEvent>>(
            API_ENDPOINTS.CALENDAR_EVENTS.UPDATE_DATES(id),
            data
        );
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.CALENDAR_EVENTS.DETAIL(id));
    },

    /**
     * Get available event categories for dropdown selection
     */
    getAvailableEventCategories: async (search?: string): Promise<{ data: AvailableEventCategory[] }> => {
        const params: Record<string, string | undefined> = {};
        if (search) params.search = search;

        const response = await httpClient.get<{ data: AvailableEventCategory[] }>(
            buildUrl(API_ENDPOINTS.CALENDAR_EVENTS.AVAILABLE_EVENT_CATEGORIES, params)
        );
        return response.data;
    },
};
