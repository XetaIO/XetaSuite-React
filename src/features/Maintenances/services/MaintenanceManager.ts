import { handleApiError } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import { MaintenanceRepository } from './MaintenanceRepository';
import type {
    Maintenance,
    MaintenanceDetail,
    MaintenanceFormData,
    MaintenanceFilters,
    AvailableMaterial,
    AvailableIncident,
    AvailableOperator,
    AvailableCompany,
    AvailableItem,
    TypeOption,
    StatusOption,
    RealizationOption,
    IncidentsPaginatedResponse,
    ItemMovementsPaginatedResponse,
} from '../types';

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Maintenance Manager - Business logic and error handling layer
 */
export const MaintenanceManager = {
    /**
     * Get paginated list of maintenances
     */
    getAll: async (filters: MaintenanceFilters = {}): Promise<ManagerResult<PaginatedResponse<Maintenance>>> => {
        try {
            const data = await MaintenanceRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single maintenance by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<MaintenanceDetail>>> => {
        try {
            const data = await MaintenanceRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new maintenance
     */
    create: async (data: MaintenanceFormData): Promise<ManagerResult<SingleResponse<MaintenanceDetail>>> => {
        try {
            const result = await MaintenanceRepository.create(data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing maintenance
     */
    update: async (id: number, data: Partial<MaintenanceFormData>): Promise<ManagerResult<SingleResponse<MaintenanceDetail>>> => {
        try {
            const result = await MaintenanceRepository.update(id, data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a maintenance
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await MaintenanceRepository.delete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get paginated incidents for a maintenance
     */
    getIncidents: async (id: number, page: number = 1): Promise<ManagerResult<IncidentsPaginatedResponse>> => {
        try {
            const data = await MaintenanceRepository.getIncidents(id, page);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get paginated item movements (spare parts) for a maintenance
     */
    getItemMovements: async (id: number, page: number = 1): Promise<ManagerResult<ItemMovementsPaginatedResponse>> => {
        try {
            const data = await MaintenanceRepository.getItemMovements(id, page);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available materials for maintenance creation
     */
    getAvailableMaterials: async (search?: string): Promise<ManagerResult<AvailableMaterial[]>> => {
        try {
            const result = await MaintenanceRepository.getAvailableMaterials(search);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available incidents for maintenance creation
     */
    getAvailableIncidents: async (search?: string): Promise<ManagerResult<AvailableIncident[]>> => {
        try {
            const result = await MaintenanceRepository.getAvailableIncidents(search);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available operators for internal/both realization
     */
    getAvailableOperators: async (search?: string): Promise<ManagerResult<AvailableOperator[]>> => {
        try {
            const result = await MaintenanceRepository.getAvailableOperators(search);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available companies for external/both realization
     */
    getAvailableCompanies: async (search?: string): Promise<ManagerResult<AvailableCompany[]>> => {
        try {
            const result = await MaintenanceRepository.getAvailableCompanies(search);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available items for spare parts
     */
    getAvailableItems: async (search?: string): Promise<ManagerResult<AvailableItem[]>> => {
        try {
            const result = await MaintenanceRepository.getAvailableItems(search);
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
            const result = await MaintenanceRepository.getTypeOptions();
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
            const result = await MaintenanceRepository.getStatusOptions();
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get realization options
     */
    getRealizationOptions: async (): Promise<ManagerResult<RealizationOption[]>> => {
        try {
            const result = await MaintenanceRepository.getRealizationOptions();
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
