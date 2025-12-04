import { handleApiError } from "@/shared/api";
import type { PaginatedResponse, SingleResponse } from "@/shared/types";
import type { Supplier, SupplierFormData, SupplierFilters, Item, ItemFilters } from "../types";
import { SupplierRepository } from "./SupplierRepository";

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Supplier Manager - Mediates between View Layer and data source
 * Handles business rules, data transformations, and error handling
 */
export const SupplierManager = {
    /**
     * Get paginated list of suppliers with error handling
     */
    getAll: async (filters: SupplierFilters = {}): Promise<ManagerResult<PaginatedResponse<Supplier>>> => {
        try {
            const data = await SupplierRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single supplier by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<Supplier>>> => {
        try {
            const data = await SupplierRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new supplier
     */
    create: async (data: SupplierFormData): Promise<ManagerResult<SingleResponse<Supplier>>> => {
        try {
            const response = await SupplierRepository.create(data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing supplier
     */
    update: async (id: number, data: SupplierFormData): Promise<ManagerResult<SingleResponse<Supplier>>> => {
        try {
            const response = await SupplierRepository.update(id, data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a supplier
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await SupplierRepository.delete(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get paginated list of items for a supplier
     */
    getItems: async (id: number, filters: ItemFilters = {}): Promise<ManagerResult<PaginatedResponse<Item>>> => {
        try {
            const data = await SupplierRepository.getItems(id, filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Format currency for display
     */
    formatCurrency: (amount: number | null, currency: string = "EUR"): string => {
        if (amount === null) return "—";
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency,
        }).format(amount);
    },
};
