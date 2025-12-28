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
    MaterialIncident,
    MaterialMaintenance,
    MaterialCleaning,
    MaterialItem,
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

    /**
     * Get QR code SVG for a material
     * Backend returns JSON with base64 encoded SVG
     */
    getQrCode: async (id: number, size: number = 200): Promise<{ svg: string; url: string; size: number }> => {
        const url = buildUrl(API_ENDPOINTS.MATERIALS.QR_CODE(id), { size });
        const response = await httpClient.get<{ data: { svg: string; url: string; size: number } }>(url);
        // Decode base64 SVG
        const svgContent = atob(response.data.data.svg);
        return {
            svg: svgContent,
            url: response.data.data.url,
            size: response.data.data.size,
        };
    },

    /**
     * Get paginated incidents for a material
     */
    getIncidents: async (id: number, page = 1, perPage = 10, search?: string): Promise<PaginatedResponse<MaterialIncident>> => {
        const url = buildUrl(API_ENDPOINTS.MATERIALS.INCIDENTS(id), { page, per_page: perPage, search });
        const response = await httpClient.get<PaginatedResponse<MaterialIncident>>(url);
        return response.data;
    },

    /**
     * Get paginated maintenances for a material
     */
    getMaintenances: async (id: number, page = 1, perPage = 10, search?: string): Promise<PaginatedResponse<MaterialMaintenance>> => {
        const url = buildUrl(API_ENDPOINTS.MATERIALS.MAINTENANCES(id), { page, per_page: perPage, search });
        const response = await httpClient.get<PaginatedResponse<MaterialMaintenance>>(url);
        return response.data;
    },

    /**
     * Get paginated cleanings for a material
     */
    getCleanings: async (id: number, page = 1, perPage = 10, search?: string): Promise<PaginatedResponse<MaterialCleaning>> => {
        const url = buildUrl(API_ENDPOINTS.MATERIALS.CLEANINGS(id), { page, per_page: perPage, search });
        const response = await httpClient.get<PaginatedResponse<MaterialCleaning>>(url);
        return response.data;
    },

    /**
     * Get paginated items for a material
     */
    getItems: async (id: number, page = 1, perPage = 10, search?: string): Promise<PaginatedResponse<MaterialItem>> => {
        const url = buildUrl(API_ENDPOINTS.MATERIALS.ITEMS(id), { page, per_page: perPage, search });
        const response = await httpClient.get<PaginatedResponse<MaterialItem>>(url);
        return response.data;
    },
};
