import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type { Company, CompanyFormData, CompanyFilters, CompanyMaintenance, MaintenanceFilters, CompanyStats } from '../types';

/**
 * Company Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const CompanyRepository = {
    /**
     * Get paginated list of companies
     */
    getAll: async (filters: CompanyFilters = {}): Promise<PaginatedResponse<Company>> => {
        const url = buildUrl(API_ENDPOINTS.COMPANIES.BASE, {
            page: filters.page,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Company>>(url);
        return response.data;
    },

    /**
     * Get a single company by ID
     */
    getById: async (id: number): Promise<SingleResponse<Company>> => {
        const response = await httpClient.get<SingleResponse<Company>>(
            API_ENDPOINTS.COMPANIES.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new company
     */
    create: async (data: CompanyFormData): Promise<SingleResponse<Company>> => {
        const response = await httpClient.post<SingleResponse<Company>>(
            API_ENDPOINTS.COMPANIES.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing company
     */
    update: async (id: number, data: CompanyFormData): Promise<SingleResponse<Company>> => {
        const response = await httpClient.put<SingleResponse<Company>>(
            API_ENDPOINTS.COMPANIES.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a company
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.COMPANIES.DETAIL(id));
    },

    /**
     * Get paginated list of maintenances for a company
     */
    getMaintenances: async (id: number, filters: MaintenanceFilters = {}): Promise<PaginatedResponse<CompanyMaintenance>> => {
        const url = buildUrl(API_ENDPOINTS.COMPANIES.MAINTENANCES(id), {
            page: filters.page,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<CompanyMaintenance>>(url);
        return response.data;
    },

    /**
     * Get statistics for a company
     */
    getStats: async (id: number): Promise<SingleResponse<CompanyStats>> => {
        const response = await httpClient.get<SingleResponse<CompanyStats>>(
            API_ENDPOINTS.COMPANIES.STATS(id)
        );
        return response.data;
    },
};
