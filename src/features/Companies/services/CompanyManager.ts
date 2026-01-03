import { handleApiError } from "@/shared/api";
import type { PaginatedResponse, SingleResponse, ManagerResult } from "@/shared/types";
import type { Company, CompanyFormData, CompanyFilters, CompanyItem, ItemFilters, CompanyMaintenance, MaintenanceFilters, CompanyStats } from "../types";
import { CompanyRepository } from "./CompanyRepository";

/**
 * Company Manager - Mediates between View Layer and data source
 * Handles business rules, data transformations, and error handling
 */
export const CompanyManager = {
    /**
     * Get paginated list of companies with error handling
     */
    getAll: async (filters: CompanyFilters = {}): Promise<ManagerResult<PaginatedResponse<Company>>> => {
        try {
            const data = await CompanyRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single company by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<Company>>> => {
        try {
            const data = await CompanyRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new company
     */
    create: async (data: CompanyFormData): Promise<ManagerResult<SingleResponse<Company>>> => {
        try {
            const response = await CompanyRepository.create(data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing company
     */
    update: async (id: number, data: CompanyFormData): Promise<ManagerResult<SingleResponse<Company>>> => {
        try {
            const response = await CompanyRepository.update(id, data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a company
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await CompanyRepository.delete(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get paginated list of items for a company
     */
    getItems: async (id: number, filters: ItemFilters = {}): Promise<ManagerResult<PaginatedResponse<CompanyItem>>> => {
        try {
            const data = await CompanyRepository.getItems(id, filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get paginated list of maintenances for a company
     */
    getMaintenances: async (id: number, filters: MaintenanceFilters = {}): Promise<ManagerResult<PaginatedResponse<CompanyMaintenance>>> => {
        try {
            const data = await CompanyRepository.getMaintenances(id, filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get statistics for a company
     */
    getStats: async (id: number): Promise<ManagerResult<SingleResponse<CompanyStats>>> => {
        try {
            const data = await CompanyRepository.getStats(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
