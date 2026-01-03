import { httpClient, buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type {
    ItemMovement,
    ItemMovementFormData,
    ItemMovementFilters
} from '../types';

/**
 * ItemMovement Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const ItemMovementRepository = {
    /**
     * Get paginated list of all movements for the current site
     */
    getAll: async (filters: ItemMovementFilters = {}): Promise<PaginatedResponse<ItemMovement>> => {
        const url = buildUrl(API_ENDPOINTS.ITEM_MOVEMENTS.ALL, {
            page: filters.page,
            type: filters.type,
            search: filters.search,
            item_id: filters.item_id,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<ItemMovement>>(url);
        return response.data;
    },

    /**
     * Get a single movement by ID
     */
    getById: async (itemId: number, movementId: number): Promise<SingleResponse<ItemMovement>> => {
        const response = await httpClient.get<SingleResponse<ItemMovement>>(
            API_ENDPOINTS.ITEM_MOVEMENTS.DETAIL(itemId, movementId)
        );
        return response.data;
    },

    /**
     * Create a new movement
     */
    create: async (itemId: number, data: ItemMovementFormData): Promise<SingleResponse<ItemMovement>> => {
        const response = await httpClient.post<SingleResponse<ItemMovement>>(
            API_ENDPOINTS.ITEM_MOVEMENTS.BASE(itemId),
            data
        );
        return response.data;
    },

    /**
     * Update an existing movement
     */
    update: async (itemId: number, movementId: number, data: Partial<ItemMovementFormData>): Promise<SingleResponse<ItemMovement>> => {
        const response = await httpClient.put<SingleResponse<ItemMovement>>(
            API_ENDPOINTS.ITEM_MOVEMENTS.DETAIL(itemId, movementId),
            data
        );
        return response.data;
    },

    /**
     * Delete a movement
     */
    delete: async (itemId: number, movementId: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.ITEM_MOVEMENTS.DETAIL(itemId, movementId));
    },
};
