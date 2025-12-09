import type { ComponentType, ReactNode } from "react";

/**
 * Route configuration for type-safe routing
 */
export interface RouteConfig {
    path: string;
    element: ComponentType;
    children?: RouteConfig[];
    // Protection settings
    requireAuth?: boolean;
    requireGuest?: boolean;
    permission?: string;
    /** Requires user to be on headquarters site */
    requiresHQ?: boolean;
    // Layout wrapper
    layout?: ComponentType<{ children: ReactNode }>;
}

/**
 * Create route configuration with defaults
 */
export function createRoute(config: RouteConfig): RouteConfig {
    return {
        requireAuth: false,
        requireGuest: false,
        ...config,
    };
}

/**
 * Create protected route configuration
 */
export function createProtectedRoute(
    config: Omit<RouteConfig, "requireAuth">
): RouteConfig {
    return {
        ...config,
        requireAuth: true,
    };
}

/**
 * Create guest-only route configuration
 */
export function createGuestRoute(
    config: Omit<RouteConfig, "requireGuest">
): RouteConfig {
    return {
        ...config,
        requireGuest: true,
    };
}
