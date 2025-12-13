import { handleApiError } from "@/shared/api";
import type { PaginatedResponse, SingleResponse } from "@/shared/types";
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
    StockStatus,
} from "../types";
import type { ItemMovementFilters } from "@/features/ItemMovements/types";
import { ItemRepository } from "./ItemRepository";

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Item Manager - Mediates between View Layer and data source
 * Handles business rules, data transformations, and error handling
 */
export const ItemManager = {
    /**
     * Get paginated list of items with error handling
     */
    getAll: async (filters: ItemFilters = {}): Promise<ManagerResult<PaginatedResponse<Item>>> => {
        try {
            const data = await ItemRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single item by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<ItemDetail>>> => {
        try {
            const data = await ItemRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new item
     */
    create: async (data: ItemFormData): Promise<ManagerResult<SingleResponse<ItemDetail>>> => {
        try {
            const response = await ItemRepository.create(data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing item
     */
    update: async (id: number, data: ItemFormData): Promise<ManagerResult<SingleResponse<ItemDetail>>> => {
        try {
            const response = await ItemRepository.update(id, data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete an item
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await ItemRepository.delete(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get item statistics
     */
    getStats: async (id: number, months: number = 12): Promise<ManagerResult<ItemMonthlyStats[]>> => {
        try {
            const response = await ItemRepository.getStats(id, months);
            return { success: true, data: response.stats };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get item movements
     */
    getMovements: async (id: number, filters: ItemMovementFilters = {}): Promise<ManagerResult<PaginatedResponse<ItemMovement>>> => {
        try {
            const data = await ItemRepository.getMovements(id, filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get paginated materials for an item
     */
    getMaterials: async (id: number, page: number = 1, perPage: number = 5): Promise<ManagerResult<PaginatedResponse<ItemMaterial>>> => {
        try {
            const data = await ItemRepository.getMaterials(id, page, perPage);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get QR code SVG (decoded from base64)
     */
    getQrCode: async (id: number, size: number = 200): Promise<ManagerResult<{ svg: string; url: string; size: number }>> => {
        try {
            const data = await ItemRepository.getQrCode(id, size);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available suppliers for dropdown
     */
    getAvailableSuppliers: async (search?: string, includeId?: number): Promise<ManagerResult<AvailableSupplier[]>> => {
        try {
            const data = await ItemRepository.getAvailableSuppliers(search, includeId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available materials for dropdown
     */
    getAvailableMaterials: async (search?: string): Promise<ManagerResult<AvailableMaterial[]>> => {
        try {
            const data = await ItemRepository.getAvailableMaterials(search);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available recipients for dropdown
     */
    getAvailableRecipients: async (search?: string): Promise<ManagerResult<AvailableRecipient[]>> => {
        try {
            const data = await ItemRepository.getAvailableRecipients(search);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get price history with statistics
     */
    getPriceHistory: async (id: number, limit: number = 20): Promise<ManagerResult<ItemPriceHistory>> => {
        try {
            const data = await ItemRepository.getPriceHistory(id, limit);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get stock status label key
     */
    getStockStatusLabelKey: (status: StockStatus): string => {
        const labels: Record<StockStatus, string> = {
            ok: "items.stockStatus.ok",
            warning: "items.stockStatus.warning",
            critical: "items.stockStatus.critical",
            empty: "items.stockStatus.empty",
        };
        return labels[status];
    },

    /**
     * Format quantity with sign for movements
     */
    formatMovementQuantity: (type: 'entry' | 'exit', quantity: number): string => {
        return type === 'entry' ? `+${quantity}` : `-${quantity}`;
    },

    /**
     * Prepare form data with defaults for new item
     */
    getDefaultFormData: (): ItemFormData => ({
        name: "",
        reference: "",
        description: "",
        current_price: null,
        supplier_id: null,
        supplier_reference: "",
        number_warning_enabled: false,
        number_warning_minimum: 10,
        number_critical_enabled: false,
        number_critical_minimum: 5,
        material_ids: [],
        recipient_ids: [],
    }),

    /**
     * Convert item detail to form data
     */
    toFormData: (item: ItemDetail): ItemFormData => ({
        name: item.name,
        reference: item.reference || "",
        description: item.description || "",
        current_price: item.current_price,
        supplier_id: item.supplier_id,
        supplier_reference: item.supplier_reference || "",
        number_warning_enabled: item.number_warning_enabled,
        number_warning_minimum: item.number_warning_minimum,
        number_critical_enabled: item.number_critical_enabled,
        number_critical_minimum: item.number_critical_minimum,
        material_ids: item.materials?.map(m => m.id) || [],
        recipient_ids: item.recipients?.map(r => r.id) || [],
    }),
};
