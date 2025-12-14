import { handleApiError } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import { CleaningRepository } from './CleaningRepository';
import type {
    Cleaning,
    CleaningDetail,
    CleaningFormData,
    CleaningFilters,
    AvailableMaterial,
    TypeOption,
} from '../types';

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Cleaning Manager - Business logic and error handling layer
 */
export const CleaningManager = {
    /**
     * Get paginated list of cleanings
     */
    getAll: async (filters: CleaningFilters = {}): Promise<ManagerResult<PaginatedResponse<Cleaning>>> => {
        try {
            const data = await CleaningRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single cleaning by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<CleaningDetail>>> => {
        try {
            const data = await CleaningRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new cleaning
     */
    create: async (data: CleaningFormData): Promise<ManagerResult<SingleResponse<CleaningDetail>>> => {
        try {
            const result = await CleaningRepository.create(data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing cleaning
     */
    update: async (id: number, data: Partial<CleaningFormData>): Promise<ManagerResult<SingleResponse<CleaningDetail>>> => {
        try {
            const result = await CleaningRepository.update(id, data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a cleaning
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await CleaningRepository.delete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available materials for cleaning creation
     */
    getAvailableMaterials: async (): Promise<ManagerResult<AvailableMaterial[]>> => {
        try {
            const result = await CleaningRepository.getAvailableMaterials();
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get type options
     */
    getTypeOptions: async (): Promise<ManagerResult<TypeOption[]>> => {
        try {
            const result = await CleaningRepository.getTypeOptions();
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
