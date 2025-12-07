import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type {
    Item,
    ItemDetail,
    ItemFormData,
    ItemFilters,
    ItemMovement,
    ItemMonthlyStats,
    ItemMaterial,
    ItemPriceHistory,
    AvailableSupplier,
    AvailableMaterial,
    AvailableRecipient,
} from '../types';
import type { ItemMovementFilters } from '@/features/ItemMovements/types';

/**
 * Item Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const ItemRepository = {
    /**
     * Get paginated list of items
     */
    getAll: async (filters: ItemFilters = {}): Promise<PaginatedResponse<Item>> => {
        const url = buildUrl(API_ENDPOINTS.ITEMS.BASE, {
            page: filters.page,
            per_page: filters.per_page,
            search: filters.search,
            supplier_id: filters.supplier_id,
            stock_status: filters.stock_status,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Item>>(url);
        return response.data;
    },

    /**
     * Get a single item by ID
     */
    getById: async (id: number): Promise<SingleResponse<ItemDetail>> => {
        const response = await httpClient.get<SingleResponse<ItemDetail>>(
            API_ENDPOINTS.ITEMS.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new item
     */
    create: async (data: ItemFormData): Promise<SingleResponse<ItemDetail>> => {
        const response = await httpClient.post<SingleResponse<ItemDetail>>(
            API_ENDPOINTS.ITEMS.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing item
     */
    update: async (id: number, data: ItemFormData): Promise<SingleResponse<ItemDetail>> => {
        const response = await httpClient.put<SingleResponse<ItemDetail>>(
            API_ENDPOINTS.ITEMS.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete an item
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.ITEMS.DETAIL(id));
    },

    /**
     * Get item statistics (monthly entries/exits)
     */
    getStats: async (id: number, months: number = 12): Promise<{ stats: ItemMonthlyStats[] }> => {
        const url = buildUrl(API_ENDPOINTS.ITEMS.STATS(id), { months });
        const response = await httpClient.get<{ stats: ItemMonthlyStats[] }>(url);
        return response.data;
    },

    /**
     * Get item movements
     */
    getMovements: async (id: number, filters: ItemMovementFilters = {}): Promise<PaginatedResponse<ItemMovement>> => {
        const url = buildUrl(API_ENDPOINTS.ITEM_MOVEMENTS.BASE(id), {
            page: filters.page,
            per_page: filters.per_page,
            type: filters.type,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<ItemMovement>>(url);
        return response.data;
    },

    /**
     * Get paginated materials for an item
     */
    getMaterials: async (id: number, page: number = 1, perPage: number = 5): Promise<PaginatedResponse<ItemMaterial>> => {
        const url = buildUrl(API_ENDPOINTS.ITEMS.MATERIALS(id), {
            page,
            per_page: perPage,
        });
        const response = await httpClient.get<PaginatedResponse<ItemMaterial>>(url);
        return response.data;
    },

    /**
     * Get QR code SVG for an item
     * Backend returns JSON with base64 encoded SVG
     */
    getQrCode: async (id: number, size: number = 200): Promise<{ svg: string; url: string; size: number }> => {
        const url = buildUrl(API_ENDPOINTS.ITEMS.QR_CODE(id), { size });
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
     * Get available suppliers for dropdown
     */
    getAvailableSuppliers: async (search?: string, includeId?: number): Promise<AvailableSupplier[]> => {
        const url = buildUrl(API_ENDPOINTS.ITEMS.AVAILABLE_SUPPLIERS, { search, include_id: includeId });
        const response = await httpClient.get<{ suppliers: AvailableSupplier[] }>(url);
        return response.data.suppliers;
    },

    /**
     * Get available materials for dropdown
     */
    getAvailableMaterials: async (search?: string): Promise<AvailableMaterial[]> => {
        const url = buildUrl(API_ENDPOINTS.ITEMS.AVAILABLE_MATERIALS, { search });
        const response = await httpClient.get<{ materials: AvailableMaterial[] }>(url);
        return response.data.materials;
    },

    /**
     * Get available recipients for dropdown
     */
    getAvailableRecipients: async (search?: string): Promise<AvailableRecipient[]> => {
        const url = buildUrl(API_ENDPOINTS.ITEMS.AVAILABLE_RECIPIENTS, { search });
        const response = await httpClient.get<{ recipients: AvailableRecipient[] }>(url);
        return response.data.recipients;
    },

    /**
     * Get price history with statistics for an item
     */
    getPriceHistory: async (id: number, limit: number = 20): Promise<ItemPriceHistory> => {
        const url = buildUrl(API_ENDPOINTS.ITEMS.PRICE_HISTORY(id), { limit });
        const response = await httpClient.get<{ data: ItemPriceHistory }>(url);
        return response.data.data;
    },
};
