import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { 
  User, 
  AuthContextType, 
  LoginCredentials, 
  ForgotPasswordData, 
  ResetPasswordData 
} from '@/types';
import { authApi, handleApiError } from '@/services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authApi.getUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      await authApi.login(credentials);
      await checkAuth();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }, [checkAuth]);

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
    return user.roles.some(r => r.name === role);
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    // Check direct permissions
    if (user.permissions.some(p => p.name === permission)) {
      return true;
    }
    // Check permissions through roles
    return user.roles.some(role => 
      role.permissions?.some(p => p.name === permission)
    );
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
