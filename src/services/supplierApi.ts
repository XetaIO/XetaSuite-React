import api from './api';
import type { Supplier, SupplierFormData, SupplierFilters } from '../types/supplier';
import type { Item, ItemFilters } from '../types/item';
import type { PaginatedResponse } from '../types/pagination';

export const supplierApi = {
    /**
     * Get paginated list of suppliers with optional filters
     */
    getAll: async (filters: SupplierFilters = {}): Promise<PaginatedResponse<Supplier>> => {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.sort_by) params.append('sort_by', filters.sort_by);
        if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

        const queryString = params.toString();
        const url = `/api/v1/suppliers${queryString ? `?${queryString}` : ''}`;

        const response = await api.get<PaginatedResponse<Supplier>>(url);
        return response.data;
    },

    /**
     * Get a single supplier by ID
     */
    getById: async (id: number): Promise<{ data: Supplier }> => {
        const response = await api.get<{ data: Supplier }>(`/api/v1/suppliers/${id}`);
        return response.data;
    },

    /**
     * Create a new supplier
     */
    create: async (data: SupplierFormData): Promise<{ data: Supplier }> => {
        const response = await api.post<{ data: Supplier }>('/api/v1/suppliers', data);
        return response.data;
    },

    /**
     * Update an existing supplier
     */
    update: async (id: number, data: SupplierFormData): Promise<{ data: Supplier }> => {
        const response = await api.put<{ data: Supplier }>(`/api/v1/suppliers/${id}`, data);
        return response.data;
    },

    /**
     * Delete a supplier
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/v1/suppliers/${id}`);
    },

    /**
     * Get paginated list of items for a supplier
     */
    getItems: async (id: number, filters: ItemFilters = {}): Promise<PaginatedResponse<Item>> => {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.sort_by) params.append('sort_by', filters.sort_by);
        if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

        const queryString = params.toString();
        const url = `/api/v1/suppliers/${id}/items${queryString ? `?${queryString}` : ''}`;

        const response = await api.get<PaginatedResponse<Item>>(url);
        return response.data;
    },
};
