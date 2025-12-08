import { handleApiError } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import { IncidentRepository } from './IncidentRepository';
import type {
    Incident,
    IncidentDetail,
    IncidentFormData,
    IncidentFilters,
    AvailableMaterial,
    AvailableMaintenance,
    SeverityOption,
    StatusOption,
} from '../types';

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Incident Manager - Business logic and error handling layer
 */
export const IncidentManager = {
    /**
     * Get paginated list of incidents
     */
    getAll: async (filters: IncidentFilters = {}): Promise<ManagerResult<PaginatedResponse<Incident>>> => {
        try {
            const data = await IncidentRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single incident by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<IncidentDetail>>> => {
        try {
            const data = await IncidentRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new incident
     */
    create: async (data: IncidentFormData): Promise<ManagerResult<SingleResponse<IncidentDetail>>> => {
        try {
            const result = await IncidentRepository.create(data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing incident
     */
    update: async (id: number, data: Partial<IncidentFormData>): Promise<ManagerResult<SingleResponse<IncidentDetail>>> => {
        try {
            const result = await IncidentRepository.update(id, data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete an incident
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await IncidentRepository.delete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available materials for incident creation
     */
    getAvailableMaterials: async (): Promise<ManagerResult<AvailableMaterial[]>> => {
        try {
            const result = await IncidentRepository.getAvailableMaterials();
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available maintenances for incident creation
     */
    getAvailableMaintenances: async (materialId?: number): Promise<ManagerResult<AvailableMaintenance[]>> => {
        try {
            const result = await IncidentRepository.getAvailableMaintenances(materialId);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get severity options
     */
    getSeverityOptions: async (): Promise<ManagerResult<SeverityOption[]>> => {
        try {
            const result = await IncidentRepository.getSeverityOptions();
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get status options
     */
    getStatusOptions: async (): Promise<ManagerResult<StatusOption[]>> => {
        try {
            const result = await IncidentRepository.getStatusOptions();
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
