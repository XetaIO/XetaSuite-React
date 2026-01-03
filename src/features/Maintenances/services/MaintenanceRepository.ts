import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
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

/**
 * Maintenance Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const MaintenanceRepository = {
    /**
     * Get paginated list of maintenances
     */
    getAll: async (filters: MaintenanceFilters = {}): Promise<PaginatedResponse<Maintenance>> => {
        const url = buildUrl(API_ENDPOINTS.MAINTENANCES.BASE, {
            page: filters.page,
            search: filters.search,
            material_id: filters.material_id,
            status: filters.status,
            type: filters.type,
            realization: filters.realization,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Maintenance>>(url);
        return response.data;
    },

    /**
     * Get a single maintenance by ID
     */
    getById: async (id: number): Promise<SingleResponse<MaintenanceDetail>> => {
        const response = await httpClient.get<SingleResponse<MaintenanceDetail>>(
            API_ENDPOINTS.MAINTENANCES.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new maintenance
     */
    create: async (data: MaintenanceFormData): Promise<SingleResponse<MaintenanceDetail>> => {
        const response = await httpClient.post<SingleResponse<MaintenanceDetail>>(
            API_ENDPOINTS.MAINTENANCES.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing maintenance
     */
    update: async (id: number, data: Partial<MaintenanceFormData>): Promise<SingleResponse<MaintenanceDetail>> => {
        const response = await httpClient.put<SingleResponse<MaintenanceDetail>>(
            API_ENDPOINTS.MAINTENANCES.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a maintenance
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.MAINTENANCES.DETAIL(id));
    },

    /**
     * Get paginated incidents for a maintenance
     */
    getIncidents: async (id: number, page: number = 1): Promise<IncidentsPaginatedResponse> => {
        const url = buildUrl(API_ENDPOINTS.MAINTENANCES.INCIDENTS(id), { page });
        const response = await httpClient.get<IncidentsPaginatedResponse>(url);
        return response.data;
    },

    /**
     * Get paginated item movements (spare parts) for a maintenance
     */
    getItemMovements: async (id: number, page: number = 1): Promise<ItemMovementsPaginatedResponse> => {
        const url = buildUrl(API_ENDPOINTS.MAINTENANCES.ITEM_MOVEMENTS(id), { page });
        const response = await httpClient.get<ItemMovementsPaginatedResponse>(url);
        return response.data;
    },

    /**
     * Get available materials for maintenance creation
     */
    getAvailableMaterials: async (search?: string): Promise<{ data: AvailableMaterial[] }> => {
        const url = buildUrl(API_ENDPOINTS.MAINTENANCES.AVAILABLE_MATERIALS, { search });
        const response = await httpClient.get<{ data: AvailableMaterial[] }>(url);
        return response.data;
    },

    /**
     * Get available incidents for maintenance creation
     */
    getAvailableIncidents: async (search?: string): Promise<{ data: AvailableIncident[] }> => {
        const url = buildUrl(API_ENDPOINTS.MAINTENANCES.AVAILABLE_INCIDENTS, { search });
        const response = await httpClient.get<{ data: AvailableIncident[] }>(url);
        return response.data;
    },

    /**
     * Get available operators for internal/both realization
     */
    getAvailableOperators: async (search?: string): Promise<{ data: AvailableOperator[] }> => {
        const url = buildUrl(API_ENDPOINTS.MAINTENANCES.AVAILABLE_OPERATORS, { search });
        const response = await httpClient.get<{ data: AvailableOperator[] }>(url);
        return response.data;
    },

    /**
     * Get available companies for external/both realization
     */
    getAvailableCompanies: async (search?: string): Promise<{ data: AvailableCompany[] }> => {
        const url = buildUrl(API_ENDPOINTS.MAINTENANCES.AVAILABLE_COMPANIES, { search });
        const response = await httpClient.get<{ data: AvailableCompany[] }>(url);
        return response.data;
    },

    /**
     * Get available items for spare parts
     */
    getAvailableItems: async (search?: string): Promise<{ data: AvailableItem[] }> => {
        const url = buildUrl(API_ENDPOINTS.MAINTENANCES.AVAILABLE_ITEMS, { search });
        const response = await httpClient.get<{ data: AvailableItem[] }>(url);
        return response.data;
    },

    /**
     * Get type options
     */
    getTypeOptions: async (): Promise<{ data: TypeOption[] }> => {
        const response = await httpClient.get<{ data: TypeOption[] }>(
            API_ENDPOINTS.MAINTENANCES.TYPE_OPTIONS
        );
        return response.data;
    },

    /**
     * Get status options
     */
    getStatusOptions: async (): Promise<{ data: StatusOption[] }> => {
        const response = await httpClient.get<{ data: StatusOption[] }>(
            API_ENDPOINTS.MAINTENANCES.STATUS_OPTIONS
        );
        return response.data;
    },

    /**
     * Get realization options
     */
    getRealizationOptions: async (): Promise<{ data: RealizationOption[] }> => {
        const response = await httpClient.get<{ data: RealizationOption[] }>(
            API_ENDPOINTS.MAINTENANCES.REALIZATION_OPTIONS
        );
        return response.data;
    },
};
