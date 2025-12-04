import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type { Supplier, SupplierFormData, SupplierFilters, Item, ItemFilters } from '../types';

/**
 * Supplier Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const SupplierRepository = {
    /**
     * Get paginated list of suppliers
     */
    getAll: async (filters: SupplierFilters = {}): Promise<PaginatedResponse<Supplier>> => {
        const url = buildUrl(API_ENDPOINTS.SUPPLIERS.BASE, {
            page: filters.page,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Supplier>>(url);
        return response.data;
    },

    /**
     * Get a single supplier by ID
     */
    getById: async (id: number): Promise<SingleResponse<Supplier>> => {
        const response = await httpClient.get<SingleResponse<Supplier>>(
            API_ENDPOINTS.SUPPLIERS.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new supplier
     */
    create: async (data: SupplierFormData): Promise<SingleResponse<Supplier>> => {
        const response = await httpClient.post<SingleResponse<Supplier>>(
            API_ENDPOINTS.SUPPLIERS.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing supplier
     */
    update: async (id: number, data: SupplierFormData): Promise<SingleResponse<Supplier>> => {
        const response = await httpClient.put<SingleResponse<Supplier>>(
            API_ENDPOINTS.SUPPLIERS.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a supplier
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
    },

    /**
     * Get paginated list of items for a supplier
     */
    getItems: async (id: number, filters: ItemFilters = {}): Promise<PaginatedResponse<Item>> => {
        const url = buildUrl(API_ENDPOINTS.SUPPLIERS.ITEMS(id), {
            page: filters.page,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Item>>(url);
        return response.data;
    },
};
