import { handleApiError } from "@/shared/api";
import type { PaginatedResponse } from '@/shared/types';
import { ItemMovementRepository } from './ItemMovementRepository';
import type {
    ItemMovement,
    ItemMovementFormData,
    ItemMovementFilters,
} from '../types';
import type { AvailableSupplier } from '@/features/Items/types';
import { ItemRepository } from "@/features/Items/services";

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * ItemMovement Manager - Implements business logic and error handling
 * Uses the repository layer for data operations
 */
export const ItemMovementManager = {
    /**
     * Get paginated list of all movements for the current site
     */
    getAll: async (filters: ItemMovementFilters = {}): Promise<ManagerResult<PaginatedResponse<ItemMovement>>> => {
        try {
            const data = await ItemMovementRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single movement
     */
    getById: async (itemId: number, movementId: number): Promise<ManagerResult<ItemMovement>> => {
        try {
            const response = await ItemMovementRepository.getById(itemId, movementId);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new movement
     */
    create: async (itemId: number, data: ItemMovementFormData): Promise<ManagerResult<ItemMovement>> => {
        try {
            const response = await ItemMovementRepository.create(itemId, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing movement
     */
    update: async (itemId: number, movementId: number, data: Partial<ItemMovementFormData>): Promise<ManagerResult<ItemMovement>> => {
        try {
            const response = await ItemMovementRepository.update(itemId, movementId, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a movement
     */
    delete: async (itemId: number, movementId: number): Promise<ManagerResult<void>> => {
        try {
            await ItemMovementRepository.delete(itemId, movementId);
            return { success: true };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available suppliers
     */
    getAvailableSuppliers: async (search?: string, includeId?: number): Promise<ManagerResult<AvailableSupplier[]>> => {
        try {
            const response = await ItemRepository.getAvailableSuppliers(search, includeId);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Format date for display
     */
    formatDate: (dateString: string | null | undefined): string => {
        if (!dateString) return '—';
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(dateString));
    },
};