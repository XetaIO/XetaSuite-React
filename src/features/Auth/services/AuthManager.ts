import { handleApiError } from '@/shared/api';
import type { User } from '@/shared/types';
import type { LoginCredentials, ForgotPasswordData, ResetPasswordData } from '../types';
import { AuthRepository } from './AuthRepository';

/**
 * Auth Manager - Responsible for mediating between View Layer and data source
 * Handles business rules, input/output data transformations, and error handling
 */
export const AuthManager = {
    /**
     * Get current authenticated user with error handling
     */
    getUser: async (): Promise<User> => {
        try {
            const response = await AuthRepository.getUser();
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Login with credentials
     */
    login: async (credentials: LoginCredentials): Promise<void> => {
        try {
            await AuthRepository.login(credentials);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Logout current user
     */
    logout: async (): Promise<void> => {
        try {
            await AuthRepository.logout();
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Request password reset email
     */
    forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
        try {
            await AuthRepository.forgotPassword(data);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Reset password with token
     */
    resetPassword: async (data: ResetPasswordData): Promise<void> => {
        try {
            await AuthRepository.resetPassword(data);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Update user's locale preference
     */
    updateLocale: async (locale: 'fr' | 'en'): Promise<void> => {
        try {
            await AuthRepository.updateLocale({ locale });
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Update user's current site and return updated user
     */
    updateSite: async (siteId: number): Promise<User> => {
        try {
            const response = await AuthRepository.updateSite({ site_id: siteId });
            return response.user;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Check if user has a specific role
     */
    hasRole: (user: User | null, role: string): boolean => {
        return user?.roles?.includes(role) ?? false;
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole: (user: User | null, roles: string[]): boolean => {
        return roles.some(role => user?.roles?.includes(role) ?? false);
    },

    /**
     * Check if user has a specific permission
     */
    hasPermission: (user: User | null, permission: string): boolean => {
        return user?.permissions?.includes(permission) ?? false;
    },

    /**
     * Check if user has any of the specified permissions
     */
    hasAnyPermission: (user: User | null, permissions: string[]): boolean => {
        return permissions.some(permission => user?.permissions?.includes(permission) ?? false);
    },
};
