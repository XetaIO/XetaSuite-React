import { handleApiError } from '@/shared/api';
import type { PaginatedResponse, SingleResponse, ManagerResult } from '@/shared/types';
import { PermissionRepository } from './PermissionRepository';
import type {
    Permission,
    PermissionDetail,
    PermissionFormData,
    PermissionFilters,
    AvailableRole,
    PermissionRole,
} from '../types';

/**
 * Permission Manager - Business logic and error handling layer
 */
export const PermissionManager = {
    /**
     * Get paginated list of permissions
     */
    getAll: async (filters: PermissionFilters = {}): Promise<ManagerResult<PaginatedResponse<Permission>>> => {
        try {
            const data = await PermissionRepository.getAll(filters);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get a single permission by ID
     */
    getById: async (id: number): Promise<ManagerResult<SingleResponse<PermissionDetail>>> => {
        try {
            const data = await PermissionRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Create a new permission
     */
    create: async (data: PermissionFormData): Promise<ManagerResult<SingleResponse<PermissionDetail>>> => {
        try {
            const result = await PermissionRepository.create(data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Update an existing permission
     */
    update: async (id: number, data: Partial<PermissionFormData>): Promise<ManagerResult<SingleResponse<PermissionDetail>>> => {
        try {
            const result = await PermissionRepository.update(id, data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Delete a permission
     */
    delete: async (id: number): Promise<ManagerResult<void>> => {
        try {
            await PermissionRepository.delete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get available roles for permission display
     */
    getAvailableRoles: async (search?: string, limit?: number): Promise<ManagerResult<AvailableRole[]>> => {
        try {
            const result = await PermissionRepository.getAvailableRoles(search, limit);
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },

    /**
     * Get roles assigned to a permission
     */
    getRoles: async (permissionId: number, page: number = 1, search?: string): Promise<ManagerResult<PaginatedResponse<PermissionRole>>> => {
        try {
            const data = await PermissionRepository.getRoles(permissionId, page, search);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
