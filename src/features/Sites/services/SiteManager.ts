import { handleApiError } from "@/shared/api";
import type { PaginatedResponse, SingleResponse } from "@/shared/types";
import type { Site, SiteFormData, SiteFilters, UserOption, SiteMember } from "../types";
import { SiteRepository } from "./SiteRepository";

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Site Manager - Mediates between View Layer and data source
 * Handles business rules, data transformations, and error handling
 */
export const SiteManager = {
    /**
     * Get paginated list of sites with error handling
     */
    getAll: async (filters: SiteFilters = {}): Promise<ManagerResult<PaginatedResponse<Site>>> => {
        try {
            const data = await SiteRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single site by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<Site>>> => {
        try {
            const data = await SiteRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new site
     */
    create: async (data: SiteFormData): Promise<ManagerResult<SingleResponse<Site>>> => {
        try {
            const response = await SiteRepository.create(data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing site
     */
    update: async (id: number, data: SiteFormData): Promise<ManagerResult<SingleResponse<Site>>> => {
        try {
            const response = await SiteRepository.update(id, data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a site
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await SiteRepository.delete(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get users for a site (for manager selection)
     */
    getUsers: async (siteId: number, search?: string): Promise<ManagerResult<UserOption[]>> => {
        try {
            const response = await SiteRepository.getUsers(siteId, search);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get paginated members of a site with their roles
     */
    getMembers: async (siteId: number, page: number = 1, search?: string): Promise<ManagerResult<PaginatedResponse<SiteMember>>> => {
        try {
            const data = await SiteRepository.getMembers(siteId, page, search);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
