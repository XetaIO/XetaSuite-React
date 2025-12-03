import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type { Zone, ZoneFormData, ZoneFilters, ParentZoneOption } from '../types';

/**
 * Zone Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const ZoneRepository = {
    /**
     * Get paginated list of zones
     * Note: site_id is automatically set to the user's current site on the backend
     */
    getAll: async (filters: ZoneFilters = {}): Promise<PaginatedResponse<Zone>> => {
        const url = buildUrl(API_ENDPOINTS.ZONES.BASE, {
            page: filters.page,
            search: filters.search,
            parent_id: filters.parent_id ?? undefined,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Zone>>(url);
        return response.data;
    },

    /**
     * Get a single zone by ID
     */
    getById: async (id: number): Promise<SingleResponse<Zone>> => {
        const response = await httpClient.get<SingleResponse<Zone>>(
            API_ENDPOINTS.ZONES.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new zone
     */
    create: async (data: ZoneFormData): Promise<SingleResponse<Zone>> => {
        const response = await httpClient.post<SingleResponse<Zone>>(
            API_ENDPOINTS.ZONES.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing zone
     */
    update: async (id: number, data: Partial<ZoneFormData>): Promise<SingleResponse<Zone>> => {
        const response = await httpClient.put<SingleResponse<Zone>>(
            API_ENDPOINTS.ZONES.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a zone
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.ZONES.DETAIL(id));
    },

    /**
     * Get child zones for a zone
     */
    getChildren: async (zoneId: number): Promise<{ data: Zone[] }> => {
        const response = await httpClient.get<{ data: Zone[] }>(
            API_ENDPOINTS.ZONES.CHILDREN(zoneId)
        );
        return response.data;
    },

    /**
     * Get materials for a zone
     */
    getMaterials: async (zoneId: number): Promise<{ data: { id: number; name: string; description?: string }[] }> => {
        const response = await httpClient.get<{ data: { id: number; name: string; description?: string }[] }>(
            API_ENDPOINTS.ZONES.MATERIALS(zoneId)
        );
        return response.data;
    },

    /**
     * Get available parent zones for the current site
     * Note: site is automatically set to the user's current site on the backend
     */
    getAvailableParents: async (excludeZoneId?: number): Promise<{ data: ParentZoneOption[] }> => {
        const url = buildUrl(API_ENDPOINTS.ZONES.AVAILABLE_PARENTS, {
            exclude_zone_id: excludeZoneId,
        });
        const response = await httpClient.get<{ data: ParentZoneOption[] }>(url);
        return response.data;
    },
};
