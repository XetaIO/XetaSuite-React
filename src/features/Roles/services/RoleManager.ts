import { handleApiError } from '@/shared/api';
import type { PaginatedResponse, SingleResponse, ManagerResult } from '@/shared/types';
import { RoleRepository } from './RoleRepository';
import type {
    Role,
    RoleDetail,
    RoleFormData,
    RoleFilters,
    AvailablePermission,
    RoleUser,
} from '../types';

/**
 * Role Manager - Business logic and error handling layer
 */
export const RoleManager = {
    /**
     * Get paginated list of roles
     */
    getAll: async (filters: RoleFilters = {}): Promise<ManagerResult<PaginatedResponse<Role>>> => {
        try {
            const data = await RoleRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single role by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<RoleDetail>>> => {
        try {
            const data = await RoleRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new role
     */
    create: async (data: RoleFormData): Promise<ManagerResult<SingleResponse<RoleDetail>>> => {
        try {
            const result = await RoleRepository.create(data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing role
     */
    update: async (id: number, data: Partial<RoleFormData>): Promise<ManagerResult<SingleResponse<RoleDetail>>> => {
        try {
            const result = await RoleRepository.update(id, data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a role
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await RoleRepository.delete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available permissions for role creation/update
     */
    getAvailablePermissions: async (search?: string, limit?: number): Promise<ManagerResult<AvailablePermission[]>> => {
        try {
            const result = await RoleRepository.getAvailablePermissions(search, limit);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get users assigned to a role
     */
    getUsers: async (roleId: number, page: number = 1, search?: string): Promise<ManagerResult<PaginatedResponse<RoleUser>>> => {
        try {
            const data = await RoleRepository.getUsers(roleId, page, search);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
