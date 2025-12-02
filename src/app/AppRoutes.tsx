import { Suspense, type FC } from "react";
import { Routes, Route } from "react-router";
import { RequireAuth, RequireGuest, LoadingScreen } from "@/features/Auth/hooks/useRequireAuth";
import { ProtectedRoute } from "@/features/Auth/hooks/useProtectedRoute";
import { AppLayout } from "@/shared/components/layout";
import { guestRoutes, protectedRoutes, publicRoutes } from "./routes";
import type { RouteConfig } from "./routes";

/**
 * Renders a single route with proper guards
 */
const RouteElement: FC<{ config: RouteConfig }> = ({ config }) => {
    const Component = config.element;

    let element = (
        <Suspense fallback={<LoadingScreen />}>
            <Component />
        </Suspense>
    );

    // Apply permission/HQ guard if specified
    if (config.permission || config.requiresHQ) {
        element = (
            <ProtectedRoute
                permission={config.permission}
                requiresHQ={config.requiresHQ}
            >
                {element}
            </ProtectedRoute>
        );
    }

    return element;
};

/**
 * App Routes Component
 * Generates routes from configuration without JSX Route tags in config
 */
const AppRoutes: FC = () => {
    return (
        <Routes>
            {/* Guest routes (login, register, forgot password) */}
            {guestRoutes.map((route) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={
                        <RequireGuest>
                            <RouteElement config={route} />
                        </RequireGuest>
                    }
                />
            ))}

            {/* Protected routes with AppLayout */}
            <Route
                element={
                    <RequireAuth>
                        <AppLayout />
                    </RequireAuth>
                }
            >
                {protectedRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={<RouteElement config={route} />} />
                ))}
            </Route>

            {/* Public routes (404, etc.) - no auth required */}
            {publicRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={<RouteElement config={route} />} />
            ))}
        </Routes>
    );
};

export default AppRoutes;
