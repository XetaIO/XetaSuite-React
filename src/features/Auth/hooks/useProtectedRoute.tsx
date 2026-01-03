import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { LoadingScreen } from './useRequireAuth';
import { showError } from '@/shared/utils';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Permission required to access this route */
    permission?: string;
    /** Multiple permissions - user needs ANY of them */
    permissions?: string[];
    /** Role required to access this route */
    role?: string;
    /** Multiple roles - user needs ANY of them */
    roles?: string[];
    /** Require ALL permissions instead of ANY (default: false) */
    requireAll?: boolean;
    /** Requires user to be on headquarters site */
    requiresHQ?: boolean;
    /** Custom redirect path (default: /) */
    redirectTo?: string;
}

/**
 * ProtectedRoute - A component to protect routes based on permissions and roles
 *
 * @example
 * // Single permission
 * <ProtectedRoute permission="company.viewAny">
 *   <CompaniesPage />
 * </ProtectedRoute>
 *
 * @example
 * // Multiple permissions (user needs ANY of them)
 * <ProtectedRoute permissions={["company.viewAny", "company.create"]}>
 *   <CompaniesPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
    children,
    permission,
    permissions = [],
    role,
    roles = [],
    requireAll = false,
    requiresHQ = false,
    redirectTo = '/'
}: ProtectedRouteProps) {
    const { t } = useTranslation();
    const { isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasRole, hasAnyRole, isOnHeadquarters } = useAuth();
    const hasShownToast = useRef(false);

    const allPermissions = permission ? [permission, ...permissions] : permissions;
    const allRoles = role ? [role, ...roles] : roles;

    // Check if user has access
    const checkAccess = (): boolean => {
        if (!isAuthenticated) return false;

        // Check HQ requirement
        if (requiresHQ && !isOnHeadquarters) return false;

        if (allPermissions.length > 0) {
            if (requireAll) {
                if (!allPermissions.every(p => hasPermission(p))) return false;
            } else {
                if (!hasAnyPermission(allPermissions)) return false;
            }
        }

        if (allRoles.length > 0) {
            if (requireAll) {
                if (!allRoles.every(r => hasRole(r))) return false;
            } else {
                if (!hasAnyRole(allRoles)) return false;
            }
        }

        return true;
    };

    const hasAccess = !isLoading && checkAccess();
    const shouldRedirect = !isLoading && isAuthenticated && !hasAccess;

    // Show toast notification when access is denied
    useEffect(() => {
        if (shouldRedirect && !hasShownToast.current) {
            hasShownToast.current = true;
            showError(t('errors.forbidden'));
        }
    }, [shouldRedirect, t]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!hasAccess) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
