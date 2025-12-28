import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type {
    Permission,
    PermissionDetail,
    PermissionFormData,
    PermissionFilters,
    AvailableRole,
    PermissionRole,
} from '../types';

/**
 * Permission Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const PermissionRepository = {
    /**
     * Get paginated list of permissions
     */
    getAll: async (filters: PermissionFilters = {}): Promise<PaginatedResponse<Permission>> => {
        const url = buildUrl(API_ENDPOINTS.PERMISSIONS.BASE, {
            page: filters.page,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Permission>>(url);
        return response.data;
    },

    /**
     * Get a single permission by ID
     */
    getById: async (id: number): Promise<SingleResponse<PermissionDetail>> => {
        const response = await httpClient.get<SingleResponse<PermissionDetail>>(
            API_ENDPOINTS.PERMISSIONS.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new permission
     */
    create: async (data: PermissionFormData): Promise<SingleResponse<PermissionDetail>> => {
        const response = await httpClient.post<SingleResponse<PermissionDetail>>(
            API_ENDPOINTS.PERMISSIONS.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing permission
     */
    update: async (id: number, data: Partial<PermissionFormData>): Promise<SingleResponse<PermissionDetail>> => {
        const response = await httpClient.put<SingleResponse<PermissionDetail>>(
            API_ENDPOINTS.PERMISSIONS.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a permission
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.PERMISSIONS.DETAIL(id));
    },

    /**
     * Get available roles for permission display
     */
    getAvailableRoles: async (search?: string, limit?: number): Promise<{ data: AvailableRole[] }> => {
        const url = buildUrl(API_ENDPOINTS.PERMISSIONS.AVAILABLE_ROLES, {
            search,
            limit,
        });
        const response = await httpClient.get<{ data: AvailableRole[] }>(url);
        return response.data;
    },

    /**
     * Get roles assigned to a permission
     */
    getRoles: async (permissionId: number, page: number = 1, search?: string): Promise<PaginatedResponse<PermissionRole>> => {
        const url = buildUrl(API_ENDPOINTS.PERMISSIONS.ROLES(permissionId), { page, search });
        const response = await httpClient.get<PaginatedResponse<PermissionRole>>(url);
        return response.data;
    },
};
