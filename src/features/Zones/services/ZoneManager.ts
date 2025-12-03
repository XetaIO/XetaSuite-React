import { handleApiError } from "@/shared/api";
import type { PaginatedResponse, SingleResponse } from "@/shared/types";
import type { Zone, ZoneFormData, ZoneFilters, ParentZoneOption, ZoneChild, ZoneMaterial } from "../types";
import { ZoneRepository } from "./ZoneRepository";

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Zone Manager - Mediates between View Layer and data source
 * Handles business rules, data transformations, and error handling
 */
export const ZoneManager = {
    /**
     * Get paginated list of zones with error handling
     */
    getAll: async (filters: ZoneFilters = {}): Promise<ManagerResult<PaginatedResponse<Zone>>> => {
        try {
            const data = await ZoneRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single zone by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<Zone>>> => {
        try {
            const data = await ZoneRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new zone
     */
    create: async (data: ZoneFormData): Promise<ManagerResult<SingleResponse<Zone>>> => {
        try {
            const response = await ZoneRepository.create(data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing zone
     */
    update: async (id: number, data: Partial<ZoneFormData>): Promise<ManagerResult<SingleResponse<Zone>>> => {
        try {
            const response = await ZoneRepository.update(id, data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a zone
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await ZoneRepository.delete(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get child zones for a zone
     */
    getChildren: async (zoneId: number): Promise<ManagerResult<ZoneChild[]>> => {
        try {
            const data = await ZoneRepository.getChildren(zoneId);
            return { success: true, data: data.data as ZoneChild[] };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get materials for a zone
     */
    getMaterials: async (zoneId: number): Promise<ManagerResult<ZoneMaterial[]>> => {
        try {
            const data = await ZoneRepository.getMaterials(zoneId);
            return { success: true, data: data.data as ZoneMaterial[] };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available parent zones for the current site
     */
    getAvailableParents: async (excludeZoneId?: number): Promise<ManagerResult<{ data: ParentZoneOption[] }>> => {
        try {
            const data = await ZoneRepository.getAvailableParents(excludeZoneId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
