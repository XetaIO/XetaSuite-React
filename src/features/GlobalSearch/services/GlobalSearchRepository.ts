import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { GlobalSearchResults, SearchTypesResponse, SearchParams } from '../types';

/**
 * Global Search Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const GlobalSearchRepository = {
    /**
     * Perform a global search across all authorized resources
     */
    search: async (params: SearchParams): Promise<GlobalSearchResults> => {
        const url = buildUrl(API_ENDPOINTS.SEARCH.BASE, {
            q: params.q,
            per_type: params.per_type,
        });
        const response = await httpClient.get<GlobalSearchResults>(url);
        return response.data;
    },

    /**
     * Get the list of searchable types available for the current user
     */
    getTypes: async (): Promise<SearchTypesResponse> => {
        const response = await httpClient.get<SearchTypesResponse>(API_ENDPOINTS.SEARCH.TYPES);
        return response.data;
    },
};
