import type { User } from '@/shared/types';
import type { LoginCredentials, ForgotPasswordData, ResetPasswordData } from '../types';

/**
 * Auth store types - defines the shape of auth state and actions
 */
export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (data: ForgotPasswordData) => Promise<void>;
    resetPassword: (data: ResetPasswordData) => Promise<void>;
    checkAuth: () => Promise<void>;
    switchSite: (siteId: number) => Promise<void>;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    isOnHeadquarters: boolean;
}

export type AuthContextType = AuthState & AuthActions;
