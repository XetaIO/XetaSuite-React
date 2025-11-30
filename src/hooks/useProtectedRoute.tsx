import { Navigate } from 'react-router';
import { useAuth } from './useAuth';
import { LoadingScreen } from './useRequireAuth';
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
    /** Custom redirect path (default: /unauthorized) */
    redirectTo?: string;
}

/**
 * ProtectedRoute - A component to protect routes based on permissions and roles
 *
 * @example
 * // Single permission
 * <ProtectedRoute permission="supplier.viewAny">
 *   <SuppliersPage />
 * </ProtectedRoute>
 *
 * @example
 * // Multiple permissions (user needs ANY of them)
 * <ProtectedRoute permissions={["supplier.viewAny", "supplier.create"]}>
 *   <SuppliersPage />
 * </ProtectedRoute>
 *
 * @example
 * // Multiple permissions (user needs ALL of them)
 * <ProtectedRoute permissions={["supplier.viewAny", "supplier.export"]} requireAll>
 *   <ExportPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
    children,
    permission,
    permissions = [],
    role,
    roles = [],
    requireAll = false,
    redirectTo = '/unauthorized'
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasRole, hasAnyRole } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    // Combine single and multiple permissions/roles
    const allPermissions = permission ? [permission, ...permissions] : permissions;
    const allRoles = role ? [role, ...roles] : roles;

    // Check permissions
    if (allPermissions.length > 0) {
        if (requireAll) {
            // User needs ALL permissions
            const hasAllPermissions = allPermissions.every(p => hasPermission(p));
            if (!hasAllPermissions) {
                return <Navigate to={redirectTo} replace />;
            }
        } else {
            // User needs ANY permission
            if (!hasAnyPermission(allPermissions)) {
                return <Navigate to={redirectTo} replace />;
            }
        }
    }

    // Check roles
    if (allRoles.length > 0) {
        if (requireAll) {
            // User needs ALL roles
            const hasAllRoles = allRoles.every(r => hasRole(r));
            if (!hasAllRoles) {
                return <Navigate to={redirectTo} replace />;
            }
        } else {
            // User needs ANY role
            if (!hasAnyRole(allRoles)) {
                return <Navigate to={redirectTo} replace />;
            }
        }
    }

    return <>{children}</>;
}

export default ProtectedRoute;
