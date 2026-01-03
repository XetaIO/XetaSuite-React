import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type {
    Role,
    RoleDetail,
    RoleFormData,
    RoleFilters,
    AvailablePermission,
    AvailableSite,
    RoleUser,
} from '../types';

/**
 * Role Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const RoleRepository = {
    /**
     * Get paginated list of roles
     */
    getAll: async (filters: RoleFilters = {}): Promise<PaginatedResponse<Role>> => {
        const url = buildUrl(API_ENDPOINTS.ROLES.BASE, {
            page: filters.page,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<Role>>(url);
        return response.data;
    },

    /**
     * Get a single role by ID
     */
    getById: async (id: number): Promise<SingleResponse<RoleDetail>> => {
        const response = await httpClient.get<SingleResponse<RoleDetail>>(
            API_ENDPOINTS.ROLES.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new role
     */
    create: async (data: RoleFormData): Promise<SingleResponse<RoleDetail>> => {
        const response = await httpClient.post<SingleResponse<RoleDetail>>(
            API_ENDPOINTS.ROLES.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing role
     */
    update: async (id: number, data: Partial<RoleFormData>): Promise<SingleResponse<RoleDetail>> => {
        const response = await httpClient.put<SingleResponse<RoleDetail>>(
            API_ENDPOINTS.ROLES.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a role
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.ROLES.DETAIL(id));
    },

    /**
     * Get available permissions for role creation/update
     */
    getAvailablePermissions: async (search?: string, limit?: number): Promise<{ data: AvailablePermission[] }> => {
        const url = buildUrl(API_ENDPOINTS.ROLES.AVAILABLE_PERMISSIONS, {
            search,
            limit,
        });
        const response = await httpClient.get<{ data: AvailablePermission[] }>(url);
        return response.data;
    },

    /**
     * Get users assigned to a role
     */
    getUsers: async (roleId: number, page: number = 1, search?: string): Promise<PaginatedResponse<RoleUser>> => {
        const url = buildUrl(API_ENDPOINTS.ROLES.USERS(roleId), { page, search });
        const response = await httpClient.get<PaginatedResponse<RoleUser>>(url);
        return response.data;
    },

    /**
     * Get available sites for role assignment
     */
    getAvailableSites: async (search?: string): Promise<{ data: AvailableSite[] }> => {
        const url = buildUrl(API_ENDPOINTS.USERS.AVAILABLE_SITES, { search });
        const response = await httpClient.get<{ data: AvailableSite[] }>(url);
        return response.data;
    },
};
