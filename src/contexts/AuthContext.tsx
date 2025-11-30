import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type {
    User,
    AuthContextType,
    LoginCredentials,
    ForgotPasswordData,
    ResetPasswordData
} from '../types';
import { authApi, handleApiError } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { i18n } = useTranslation();

    const isAuthenticated = user !== null;

    // Sync i18next with user's locale preference
    const syncLocale = useCallback((userLocale: string | undefined) => {
        if (userLocale && ['fr', 'en'].includes(userLocale) && i18n.language !== userLocale) {
            i18n.changeLanguage(userLocale);
        }
    }, [i18n]);

    // Force fetch user from API (used after login)
    const fetchUser = useCallback(async () => {
        try {
            const userData = await authApi.getUser();
            setUser(userData.data);
            // Sync locale when user is fetched
            syncLocale(userData.data.locale);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [syncLocale]);

    const checkAuth = useCallback(async () => {
        // Skip API call on initial load if no XSRF token exists (user never logged in)
        // Note: session cookie is HttpOnly so we can only check XSRF-TOKEN
        const hasXsrfToken = document.cookie.includes('XSRF-TOKEN');

        if (!hasXsrfToken) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        await fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            await authApi.login(credentials);
            // After login, directly fetch user (cookies are now set)
            await fetchUser();
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }, [fetchUser]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
            setUser(null);
        } catch (error) {
            // Even if logout fails on server, clear local state
            setUser(null);
            throw new Error(handleApiError(error));
        }
    }, []);

    const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
        try {
            await authApi.forgotPassword(data);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }, []);

    const resetPassword = useCallback(async (data: ResetPasswordData) => {
        try {
            await authApi.resetPassword(data);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }, []);

    // Permission and role helpers for spatie/laravel-permission
    const hasRole = useCallback((role: string): boolean => {
        if (!user) return false;
        return user.roles.includes(role);
    }, [user]);

    const hasPermission = useCallback((permission: string): boolean => {
        if (!user) return false;
        return user.permissions.includes(permission);
    }, [user]);

    const hasAnyRole = useCallback((roles: string[]): boolean => {
        if (!user) return false;
        return roles.some(role => hasRole(role));
    }, [user, hasRole]);

    const hasAnyPermission = useCallback((permissions: string[]): boolean => {
        if (!user) return false;
        return permissions.some(permission => hasPermission(permission));
    }, [user, hasPermission]);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        forgotPassword,
        resetPassword,
        checkAuth,
        hasRole,
        hasPermission,
        hasAnyRole,
        hasAnyPermission,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;