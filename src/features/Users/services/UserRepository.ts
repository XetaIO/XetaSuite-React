import { httpClient } from '@/shared/api';
import { buildUrl, API_ENDPOINTS } from '@/shared/api';
import type { PaginatedResponse, SingleResponse } from '@/shared/types';
import type {
    User,
    UserFormData,
    UserFilters,
    AvailableSite,
    AvailableRole,
    AvailablePermission,
    UserCleaning,
    UserMaintenance,
    UserIncident,
    SiteWithRoles,
    SiteWithPermissions,
} from '../types';

/**
 * User Repository - Responsible for interacting with the data source
 * No error handling, no business rules - just raw API calls
 */
export const UserRepository = {
    /**
     * Get paginated list of users
     */
    getAll: async (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
        const url = buildUrl(API_ENDPOINTS.USERS.BASE, {
            page: filters.page,
            search: filters.search,
            site_id: filters.site_id,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        });
        const response = await httpClient.get<PaginatedResponse<User>>(url);
        return response.data;
    },

    /**
     * Get a single user by ID
     */
    getById: async (id: number): Promise<SingleResponse<User>> => {
        const response = await httpClient.get<SingleResponse<User>>(
            API_ENDPOINTS.USERS.DETAIL(id)
        );
        return response.data;
    },

    /**
     * Create a new user
     */
    create: async (data: UserFormData): Promise<SingleResponse<User>> => {
        const response = await httpClient.post<SingleResponse<User>>(
            API_ENDPOINTS.USERS.BASE,
            data
        );
        return response.data;
    },

    /**
     * Update an existing user
     */
    update: async (id: number, data: Partial<UserFormData>): Promise<SingleResponse<User>> => {
        const response = await httpClient.put<SingleResponse<User>>(
            API_ENDPOINTS.USERS.DETAIL(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a user
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(API_ENDPOINTS.USERS.DETAIL(id));
    },

    /**
     * Restore a soft-deleted user
     */
    restore: async (id: number): Promise<{ message: string }> => {
        const response = await httpClient.post<{ message: string }>(
            API_ENDPOINTS.USERS.RESTORE(id)
        );
        return response.data;
    },

    /**
     * Get available sites for user assignment
     */
    getAvailableSites: async (search?: string): Promise<{ data: AvailableSite[] }> => {
        const url = buildUrl(API_ENDPOINTS.USERS.AVAILABLE_SITES, { search });
        const response = await httpClient.get<{ data: AvailableSite[] }>(url);
        return response.data;
    },

    /**
     * Get available roles for assignment
     */
    getAvailableRoles: async (search?: string): Promise<{ data: AvailableRole[] }> => {
        const url = buildUrl(API_ENDPOINTS.USERS.AVAILABLE_ROLES, { search });
        const response = await httpClient.get<{ data: AvailableRole[] }>(url);
        return response.data;
    },

    /**
     * Get available permissions for direct assignment
     */
    getAvailablePermissions: async (search?: string): Promise<{ data: AvailablePermission[] }> => {
        const url = buildUrl(API_ENDPOINTS.USERS.AVAILABLE_PERMISSIONS, { search });
        const response = await httpClient.get<{ data: AvailablePermission[] }>(url);
        return response.data;
    },

    /**
     * Get user's roles per site
     */
    getRolesPerSite: async (id: number): Promise<{
        data: {
            roles_per_site: SiteWithRoles[];
            permissions_per_site: SiteWithPermissions[];
        };
    }> => {
        const response = await httpClient.get(API_ENDPOINTS.USERS.ROLES_PER_SITE(id));
        return response.data;
    },

    /**
     * Get user's cleanings
     */
    getCleanings: async (id: number, page = 1, perPage = 10): Promise<PaginatedResponse<UserCleaning>> => {
        const url = buildUrl(API_ENDPOINTS.USERS.CLEANINGS(id), { page, per_page: perPage });
        const response = await httpClient.get<PaginatedResponse<UserCleaning>>(url);
        return response.data;
    },

    /**
     * Get user's maintenances
     */
    getMaintenances: async (id: number, page = 1, perPage = 10): Promise<PaginatedResponse<UserMaintenance>> => {
        const url = buildUrl(API_ENDPOINTS.USERS.MAINTENANCES(id), { page, per_page: perPage });
        const response = await httpClient.get<PaginatedResponse<UserMaintenance>>(url);
        return response.data;
    },

    /**
     * Get user's incidents
     */
    getIncidents: async (id: number, page = 1, perPage = 10): Promise<PaginatedResponse<UserIncident>> => {
        const url = buildUrl(API_ENDPOINTS.USERS.INCIDENTS(id), { page, per_page: perPage });
        const response = await httpClient.get<PaginatedResponse<UserIncident>>(url);
        return response.data;
    },
};
