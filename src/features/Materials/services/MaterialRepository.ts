import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type {
    Material,
    MaterialDetail,
    MaterialFormData,
    MaterialFilters,
    AvailableZone,
    AvailableRecipient,
    MaterialMonthlyStats,
} from '../types';

/**
 * Material Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const MaterialRepository = {
    /**
     * Get paginated list of materials
     * Note: site_id is automatically set to the user's current site on the backend
     */
    getAll: async (filters: MaterialFilters = {}): Promise<PaginatedResponse<Material>> => {
        const url = buildUrl(API_ENDPOINTS.MATERIALS.BASE, {
            page: filters.page,
            search: filters.search,
            zone_id: filters.zone_id,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Material>>(url);
        return response.data;
    },

    /**
     * Get a single material by ID
     */
    getById: async (id: number): Promise<SingleResponse<MaterialDetail>> => {
        const response = await httpClient.get<SingleResponse<MaterialDetail>>(
            API_ENDPOINTS.MATERIALS.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new material
     */
    create: async (data: MaterialFormData): Promise<SingleResponse<MaterialDetail>> => {
        const response = await httpClient.post<SingleResponse<MaterialDetail>>(
            API_ENDPOINTS.MATERIALS.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing material
     */
    update: async (id: number, data: Partial<MaterialFormData>): Promise<SingleResponse<MaterialDetail>> => {
        const response = await httpClient.put<SingleResponse<MaterialDetail>>(
            API_ENDPOINTS.MATERIALS.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a material
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.MATERIALS.DETAIL(id));
    },

    /**
     * Get available zones for material creation (zones that allow materials on current site)
     */
    getAvailableZones: async (): Promise<{ data: AvailableZone[] }> => {
        const response = await httpClient.get<{ data: AvailableZone[] }>(
            API_ENDPOINTS.MATERIALS.AVAILABLE_ZONES
        );
        return response.data;
    },

    /**
     * Get available recipients for cleaning alerts (users with access to current site)
     */
    getAvailableRecipients: async (): Promise<{ data: AvailableRecipient[] }> => {
        const response = await httpClient.get<{ data: AvailableRecipient[] }>(
            API_ENDPOINTS.MATERIALS.AVAILABLE_RECIPIENTS
        );
        return response.data;
    },

    /**
     * Get monthly statistics for a material over the last 12 months
     */
    getStats: async (id: number): Promise<{ data: MaterialMonthlyStats }> => {
        const response = await httpClient.get<{ data: MaterialMonthlyStats }>(
            API_ENDPOINTS.MATERIALS.STATS(id)
        );
        return response.data;
    },
};
