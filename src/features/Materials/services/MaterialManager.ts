import { handleApiError } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type {
    Material,
    MaterialDetail,
    MaterialFormData,
    MaterialFilters,
    AvailableZone,
    AvailableRecipient,
} from '../types';
import { MaterialRepository } from './MaterialRepository';

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Material Manager - Mediates between View Layer and data source
 * Handles business rules, data transformations, and error handling
 */
export const MaterialManager = {
    /**
     * Get paginated list of materials with error handling
     */
    getAll: async (filters: MaterialFilters = {}): Promise<ManagerResult<PaginatedResponse<Material>>> => {
        try {
            const data = await MaterialRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single material by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<MaterialDetail>>> => {
        try {
            const data = await MaterialRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new material
     */
    create: async (data: MaterialFormData): Promise<ManagerResult<SingleResponse<MaterialDetail>>> => {
        try {
            const response = await MaterialRepository.create(data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing material
     */
    update: async (id: number, data: Partial<MaterialFormData>): Promise<ManagerResult<SingleResponse<MaterialDetail>>> => {
        try {
            const response = await MaterialRepository.update(id, data);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a material
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await MaterialRepository.delete(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available zones for material creation
     */
    getAvailableZones: async (): Promise<ManagerResult<AvailableZone[]>> => {
        try {
            const data = await MaterialRepository.getAvailableZones();
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available recipients for cleaning alerts
     */
    getAvailableRecipients: async (): Promise<ManagerResult<AvailableRecipient[]>> => {
        try {
            const data = await MaterialRepository.getAvailableRecipients();
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
