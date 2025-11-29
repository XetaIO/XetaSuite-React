import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import type { ReactNode } from 'react';

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
}

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-body-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  );
}

// Component to protect routes that require authentication
export function RequireAuth({ children, roles, permissions }: RequireAuthProps) {
  const { isAuthenticated, isLoading, hasAnyRole, hasAnyPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required roles
  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for required permissions
  if (permissions && permissions.length > 0 && !hasAnyPermission(permissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Component to redirect authenticated users away from auth pages
export function RequireGuest({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    // Redirect to the page they came from or dashboard
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export { LoadingScreen };
