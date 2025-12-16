import { lazy } from "react";
import type { RouteConfig } from "./types";

// Lazy load feature pages
const SignInPage = lazy(() => import("@/features/Auth/views/SignInPage"));
const ForgotPasswordPage = lazy(() => import("@/features/Auth/views/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/features/Auth/views/ResetPasswordPage"));

// Lazy load main pages
const HomePage = lazy(() => import("@/features/Dashboard/Home"));
const NotFoundPage = lazy(() => import("@/shared/components/errors/NotFoundPage"));

// Lazy load Suppliers feature
const SupplierListPage = lazy(() => import("@/features/Suppliers/views/SupplierListPage"));
const SupplierDetailPage = lazy(() => import("@/features/Suppliers/views/SupplierDetailPage"));

// Lazy load Sites feature
const SiteListPage = lazy(() => import("@/features/Sites/views/SiteListPage"));
const SiteDetailPage = lazy(() => import("@/features/Sites/views/SiteDetailPage"));

// Lazy load Zones feature
const ZoneListPage = lazy(() => import("@/features/Zones/views/ZoneListPage"));
const ZoneDetailPage = lazy(() => import("@/features/Zones/views/ZoneDetailPage"));

// Lazy load Materials feature
const MaterialListPage = lazy(() => import("@/features/Materials/views/MaterialListPage"));
const MaterialDetailPage = lazy(() => import("@/features/Materials/views/MaterialDetailPage"));

// Lazy load Items feature
const ItemListPage = lazy(() => import("@/features/Items/views/ItemListPage"));
const ItemDetailPage = lazy(() => import("@/features/Items/views/ItemDetailPage"));

// Lazy load ItemMovements feature
const ItemMovementListPage = lazy(() => import("@/features/ItemMovements/views/ItemMovementListPage"));

// Lazy load Incidents feature
const IncidentListPage = lazy(() => import("@/features/Incidents/views/IncidentListPage"));
const IncidentDetailPage = lazy(() => import("@/features/Incidents/views/IncidentDetailPage"));

// Lazy load Maintenances feature
const MaintenanceListPage = lazy(() => import("@/features/Maintenances/views/MaintenanceListPage"));
const MaintenanceDetailPage = lazy(() => import("@/features/Maintenances/views/MaintenanceDetailPage"));

// Lazy load Cleanings feature
const CleaningListPage = lazy(() => import("@/features/Cleanings/views/CleaningListPage"));

// Lazy load Companies feature
const CompanyListPage = lazy(() => import("@/features/Companies/views/CompanyListPage"));
const CompanyDetailPage = lazy(() => import("@/features/Companies/views/CompanyDetailPage"));

// Lazy load Users feature
const UserListPage = lazy(() => import("@/features/Users/views/UserListPage"));
const UserDetailPage = lazy(() => import("@/features/Users/views/UserDetailPage"));

/**
 * Guest-only routes (login, register, forgot password)
 */
export const guestRoutes: RouteConfig[] = [
    {
        path: "/auth/login",
        element: SignInPage,
        requireGuest: true,
    },
    {
        path: "/forgot-password",
        element: ForgotPasswordPage,
        requireGuest: true,
    },
    {
        path: "/reset-password",
        element: ResetPasswordPage,
        requireGuest: true,
    },
];

/**
 * Protected routes (require authentication)
 */
export const protectedRoutes: RouteConfig[] = [
    {
        path: "/",
        element: HomePage,
        requireAuth: true,
    },
    /*{
        path: "/unauthorized",
        element: UnauthorizedPage,
        requireAuth: true,
    },*/
    {
        path: "/suppliers",
        element: SupplierListPage,
        requireAuth: true,
        permission: "supplier.viewAny",
    },
    {
        path: "/suppliers/:id",
        element: SupplierDetailPage,
        requireAuth: true,
        permission: "supplier.view",
    },
    {
        path: "/sites",
        element: SiteListPage,
        requireAuth: true,
        permission: "site.viewAny",
        requiresHQ: true,
    },
    {
        path: "/sites/:id",
        element: SiteDetailPage,
        requireAuth: true,
        permission: "site.view",
        requiresHQ: true,
    },
    {
        path: "/zones",
        element: ZoneListPage,
        requireAuth: true,
        permission: "zone.viewAny"
    },
    {
        path: "/zones/:id",
        element: ZoneDetailPage,
        requireAuth: true,
        permission: "zone.view"
    },
    {
        path: "/materials",
        element: MaterialListPage,
        requireAuth: true,
        permission: "material.viewAny"
    },
    {
        path: "/materials/:id",
        element: MaterialDetailPage,
        requireAuth: true,
        permission: "material.view"
    },
    {
        path: "/items",
        element: ItemListPage,
        requireAuth: true,
        permission: "item.viewAny"
    },
    {
        path: "/items/:id",
        element: ItemDetailPage,
        requireAuth: true,
        permission: "item.view"
    },
    {
        path: "/items-movements",
        element: ItemMovementListPage,
        requireAuth: true,
        permission: "item-movement.viewAny"
    },
    {
        path: "/incidents",
        element: IncidentListPage,
        requireAuth: true,
        permission: "incident.viewAny"
    },
    {
        path: "/incidents/:id",
        element: IncidentDetailPage,
        requireAuth: true,
        permission: "incident.view"
    },
    {
        path: "/maintenances",
        element: MaintenanceListPage,
        requireAuth: true,
        permission: "maintenance.viewAny"
    },
    {
        path: "/maintenances/:id",
        element: MaintenanceDetailPage,
        requireAuth: true,
        permission: "maintenance.view"
    },
    {
        path: "/cleanings",
        element: CleaningListPage,
        requireAuth: true,
        permission: "cleaning.viewAny"
    },
    {
        path: "/companies",
        element: CompanyListPage,
        requireAuth: true,
        permission: "company.viewAny",
    },
    {
        path: "/companies/:id",
        element: CompanyDetailPage,
        requireAuth: true,
        permission: "company.view",
    },
    {
        path: "/users",
        element: UserListPage,
        requireAuth: true,
        permission: "user.viewAny",
        requiresHQ: true,
    },
    {
        path: "/users/:id",
        element: UserDetailPage,
        requireAuth: true,
        permission: "user.view",
        requiresHQ: true,
    },
    // Catch-all for unknown routes within authenticated layout
    {
        path: "*",
        element: NotFoundPage,
        requireAuth: true,
    },
];

/**
 * Public routes (accessible without authentication)
 */
export const publicRoutes: RouteConfig[] = [
    /*{
        path: "*",
        element: NotFoundPage,
    },*/
];

/**
 * All routes combined
 */
export const routes: RouteConfig[] = [...guestRoutes, ...protectedRoutes, ...publicRoutes];
