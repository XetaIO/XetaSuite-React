import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type { Site, SiteFormData, SiteFilters, UserOption } from '../types';

/**
 * Site Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const SiteRepository = {
    /**
     * Get paginated list of sites
     */
    getAll: async (filters: SiteFilters = {}): Promise<PaginatedResponse<Site>> => {
        const url = buildUrl(API_ENDPOINTS.SITES.BASE, {
            page: filters.page,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Site>>(url);
        return response.data;
    },

    /**
     * Get a single site by ID
     */
    getById: async (id: number): Promise<SingleResponse<Site>> => {
        const response = await httpClient.get<SingleResponse<Site>>(
            API_ENDPOINTS.SITES.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new site
     */
    create: async (data: SiteFormData): Promise<SingleResponse<Site>> => {
        const response = await httpClient.post<SingleResponse<Site>>(
            API_ENDPOINTS.SITES.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing site
     */
    update: async (id: number, data: SiteFormData): Promise<SingleResponse<Site>> => {
        const response = await httpClient.put<SingleResponse<Site>>(
            API_ENDPOINTS.SITES.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a site
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.SITES.DETAIL(id));
    },

    /**
     * Get users for a site (for manager selection)
     */
    getUsers: async (siteId: number, search?: string): Promise<{ data: UserOption[] }> => {
        const url = buildUrl(API_ENDPOINTS.SITES.USERS(siteId), { search });
        const response = await httpClient.get<{ data: UserOption[] }>(url);
        return response.data;
    }
};
