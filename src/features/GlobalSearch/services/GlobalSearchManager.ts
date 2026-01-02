import { handleApiError } from '@/shared/api';
import type { ManagerResult } from '@/shared/types';
import type { GlobalSearchResults, SearchTypesResponse, SearchParams, SearchableType } from '../types';
import { GlobalSearchRepository } from './GlobalSearchRepository';

/**
 * Global Search Manager - Mediates between View Layer and data source
 * Handles business rules, data transformations, and error handling
 */
export const GlobalSearchManager = {
    /**
     * Perform a global search with error handling
     */
    search: async (params: SearchParams): Promise<ManagerResult<GlobalSearchResults>> => {
        try {
            const data = await GlobalSearchRepository.search(params);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available search types for the current user
     */
    getTypes: async (): Promise<ManagerResult<SearchTypesResponse>> => {
        try {
            const data = await GlobalSearchRepository.getTypes();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Check if user can search a specific type
     */
    canSearchType: async (type: SearchableType): Promise<boolean> => {
        const result = await GlobalSearchManager.getTypes();
        if (!result.success) return false;
        return result.data.types.includes(type);
    },
};
