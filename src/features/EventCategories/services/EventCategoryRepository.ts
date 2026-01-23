import httpClient from '@/shared/api/httpClient';
import { buildUrl, API_ENDPOINTS, type QueryParams } from '@/shared/api/urlBuilder';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type { EventCategory, EventCategoryFormData, EventCategoryFilters } from '../types';

/**
 * Event Category Repository - Raw API calls (no error handling)
 */
export const EventCategoryRepository = {
    getAll: async (filters?: EventCategoryFilters): Promise<PaginatedResponse<EventCategory>> => {
        const response = await httpClient.get<PaginatedResponse<EventCategory>>(
            buildUrl(API_ENDPOINTS.EVENT_CATEGORIES.BASE, filters as unknown as QueryParams)
        );
        return response.data;
    },

    getById: async (id: number): Promise<SingleResponse<EventCategory>> => {
        const response = await httpClient.get<SingleResponse<EventCategory>>(
            API_ENDPOINTS.EVENT_CATEGORIES.DETAIL(id)
        );
        return response.data;
    },

    create: async (data: EventCategoryFormData): Promise<SingleResponse<EventCategory>> => {
        const response = await httpClient.post<SingleResponse<EventCategory>>(
            API_ENDPOINTS.EVENT_CATEGORIES.BASE,
            data
        );
        return response.data;
    },

    update: async (id: number, data: Partial<EventCategoryFormData>): Promise<SingleResponse<EventCategory>> => {
        const response = await httpClient.put<SingleResponse<EventCategory>>(
            API_ENDPOINTS.EVENT_CATEGORIES.DETAIL(id),
            data
        );
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.EVENT_CATEGORIES.DETAIL(id));
    },
};
