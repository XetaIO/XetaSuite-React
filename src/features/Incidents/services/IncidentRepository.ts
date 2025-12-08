import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
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

/**
 * Incident Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const IncidentRepository = {
    /**
     * Get paginated list of incidents
     */
    getAll: async (filters: IncidentFilters = {}): Promise<PaginatedResponse<Incident>> => {
        const url = buildUrl(API_ENDPOINTS.INCIDENTS.BASE, {
            page: filters.page,
            search: filters.search,
            material_id: filters.material_id,
            status: filters.status,
            severity: filters.severity,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Incident>>(url);
        return response.data;
    },

    /**
     * Get a single incident by ID
     */
    getById: async (id: number): Promise<SingleResponse<IncidentDetail>> => {
        const response = await httpClient.get<SingleResponse<IncidentDetail>>(
            API_ENDPOINTS.INCIDENTS.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new incident
     */
    create: async (data: IncidentFormData): Promise<SingleResponse<IncidentDetail>> => {
        const response = await httpClient.post<SingleResponse<IncidentDetail>>(
            API_ENDPOINTS.INCIDENTS.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing incident
     */
    update: async (id: number, data: Partial<IncidentFormData>): Promise<SingleResponse<IncidentDetail>> => {
        const response = await httpClient.put<SingleResponse<IncidentDetail>>(
            API_ENDPOINTS.INCIDENTS.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete an incident
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.INCIDENTS.DETAIL(id));
    },

    /**
     * Get available materials for incident creation
     */
    getAvailableMaterials: async (): Promise<{ data: AvailableMaterial[] }> => {
        const response = await httpClient.get<{ data: AvailableMaterial[] }>(
            API_ENDPOINTS.INCIDENTS.AVAILABLE_MATERIALS
        );
        return response.data;
    },

    /**
     * Get available maintenances for incident creation
     */
    getAvailableMaintenances: async (materialId?: number): Promise<{ data: AvailableMaintenance[] }> => {
        const url = buildUrl(API_ENDPOINTS.INCIDENTS.AVAILABLE_MAINTENANCES, {
            material_id: materialId,
        });
        const response = await httpClient.get<{ data: AvailableMaintenance[] }>(url);
        return response.data;
    },

    /**
     * Get severity options
     */
    getSeverityOptions: async (): Promise<{ data: SeverityOption[] }> => {
        const response = await httpClient.get<{ data: SeverityOption[] }>(
            API_ENDPOINTS.INCIDENTS.SEVERITY_OPTIONS
        );
        return response.data;
    },

    /**
     * Get status options
     */
    getStatusOptions: async (): Promise<{ data: StatusOption[] }> => {
        const response = await httpClient.get<{ data: StatusOption[] }>(
            API_ENDPOINTS.INCIDENTS.STATUS_OPTIONS
        );
        return response.data;
    },
};
