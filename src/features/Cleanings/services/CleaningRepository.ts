import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type {
    Cleaning,
    CleaningDetail,
    CleaningFormData,
    CleaningFilters,
    AvailableMaterial,
    TypeOption,
} from '../types';

/**
 * Cleaning Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const CleaningRepository = {
    /**
     * Get paginated list of cleanings
     */
    getAll: async (filters: CleaningFilters = {}): Promise<PaginatedResponse<Cleaning>> => {
        const url = buildUrl(API_ENDPOINTS.CLEANINGS.BASE, {
            page: filters.page,
            search: filters.search,
            material_id: filters.material_id,
            type: filters.type,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Cleaning>>(url);
        return response.data;
    },

    /**
     * Get a single cleaning by ID
     */
    getById: async (id: number): Promise<SingleResponse<CleaningDetail>> => {
        const response = await httpClient.get<SingleResponse<CleaningDetail>>(
            API_ENDPOINTS.CLEANINGS.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new cleaning
     */
    create: async (data: CleaningFormData): Promise<SingleResponse<CleaningDetail>> => {
        const response = await httpClient.post<SingleResponse<CleaningDetail>>(
            API_ENDPOINTS.CLEANINGS.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing cleaning
     */
    update: async (id: number, data: Partial<CleaningFormData>): Promise<SingleResponse<CleaningDetail>> => {
        const response = await httpClient.put<SingleResponse<CleaningDetail>>(
            API_ENDPOINTS.CLEANINGS.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a cleaning
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.CLEANINGS.DETAIL(id));
    },

    /**
     * Get available materials for cleaning creation
     */
    getAvailableMaterials: async (): Promise<{ data: AvailableMaterial[] }> => {
        const response = await httpClient.get<{ data: AvailableMaterial[] }>(
            API_ENDPOINTS.CLEANINGS.AVAILABLE_MATERIALS
        );
        return response.data;
    },

    /**
     * Get type options
     */
    getTypeOptions: async (): Promise<{ data: TypeOption[] }> => {
        const response = await httpClient.get<{ data: TypeOption[] }>(
            API_ENDPOINTS.CLEANINGS.TYPE_OPTIONS
        );
        return response.data;
    },
};
