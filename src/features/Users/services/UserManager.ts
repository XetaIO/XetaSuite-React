import { handleApiError } from '@/shared/api';
import type { ManagerResult, PaginatedResponse, SingleResponse } from '@/shared/types';
import { UserRepository } from './UserRepository';
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
 * User Manager - Handles business logic and error handling
 */
export const UserManager = {
    /**
     * Get paginated list of users
     */
    getAll: async (filters: UserFilters = {}): Promise<ManagerResult<PaginatedResponse<User>>> => {
        try {
            const data = await UserRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single user by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<User>>> => {
        try {
            const data = await UserRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new user
     */
    create: async (data: UserFormData): Promise<ManagerResult<SingleResponse<User>>> => {
        try {
            const result = await UserRepository.create(data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing user
     */
    update: async (id: number, data: Partial<UserFormData>): Promise<ManagerResult<SingleResponse<User>>> => {
        try {
            const result = await UserRepository.update(id, data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a user
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await UserRepository.delete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Restore a soft-deleted user
     */
    restore: async (id: number): Promise<ManagerResult<{ message: string }>> => {
        try {
            const result = await UserRepository.restore(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available sites for user assignment
     */
    getAvailableSites: async (search?: string): Promise<ManagerResult<AvailableSite[]>> => {
        try {
            const result = await UserRepository.getAvailableSites(search);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available roles for assignment
     */
    getAvailableRoles: async (search?: string): Promise<ManagerResult<AvailableRole[]>> => {
        try {
            const result = await UserRepository.getAvailableRoles(search);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available permissions for direct assignment
     */
    getAvailablePermissions: async (search?: string): Promise<ManagerResult<AvailablePermission[]>> => {
        try {
            const result = await UserRepository.getAvailablePermissions(search);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get user's roles per site
     */
    getRolesPerSite: async (id: number): Promise<ManagerResult<{
        roles_per_site: SiteWithRoles[];
        permissions_per_site: SiteWithPermissions[];
    }>> => {
        try {
            const result = await UserRepository.getRolesPerSite(id);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get user's cleanings
     */
    getCleanings: async (id: number, page = 1, perPage = 10): Promise<ManagerResult<PaginatedResponse<UserCleaning>>> => {
        try {
            const data = await UserRepository.getCleanings(id, page, perPage);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get user's maintenances
     */
    getMaintenances: async (id: number, page = 1, perPage = 10): Promise<ManagerResult<PaginatedResponse<UserMaintenance>>> => {
        try {
            const data = await UserRepository.getMaintenances(id, page, perPage);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get user's incidents
     */
    getIncidents: async (id: number, page = 1, perPage = 10): Promise<ManagerResult<PaginatedResponse<UserIncident>>> => {
        try {
            const data = await UserRepository.getIncidents(id, page, perPage);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
