import { useMemo } from "react";

/**
 * Auth context values needed by useEntityPermissions
 */
export interface EntityPermissionsAuth {
    hasPermission: (permission: string) => boolean;
    isOnHeadquarters: boolean;
}

/**
 * Options for useEntityPermissions hook
 */
export interface UseEntityPermissionsOptions {
    /**
     * If true, permissions require being on headquarters
     * If false (default), permissions require NOT being on headquarters
     */
    hqOnly?: boolean;
    /**
     * If true, no location check is performed (permissions work everywhere)
     */
    noLocationCheck?: boolean;
}

/**
 * Return type for useEntityPermissions hook
 */
export interface EntityPermissions {
    canView: boolean;
    canViewAny: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canExport: boolean;
    canGenerateQrCode: boolean;
    /** True if any CRUD action is available */
    hasAnyAction: boolean;
}

/**
 * Hook to get standardized entity permissions
 * Reduces boilerplate permission checks in components
 *
 * @param entity - The entity name (e.g., "item", "company", "material")
 * @param auth - Auth context values (hasPermission, isOnHeadquarters)
 * @param options - Configuration options for location-based permissions
 *
 * @example
 * // For items (regular site only)
 * const { hasPermission, isOnHeadquarters } = useAuth();
 * const { canCreate, canUpdate, canDelete } = useEntityPermissions("item", { hasPermission, isOnHeadquarters });
 *
 * @example
 * // For companies (HQ only)
 * const { canCreate, canUpdate } = useEntityPermissions("company", { hasPermission, isOnHeadquarters }, { hqOnly: true });
 */
export function useEntityPermissions(
    entity: string,
    auth: EntityPermissionsAuth,
    options: UseEntityPermissionsOptions = {}
): EntityPermissions {
    const { hasPermission, isOnHeadquarters } = auth;
    const { hqOnly = false, noLocationCheck = false } = options;

    return useMemo(() => {
        // Determine if location check passes
        let locationCheck: boolean;
        if (noLocationCheck) {
            locationCheck = true;
        } else if (hqOnly) {
            locationCheck = isOnHeadquarters;
        } else {
            locationCheck = !isOnHeadquarters;
        }

        const canView = hasPermission(`${entity}.view`);
        const canViewAny = hasPermission(`${entity}.viewAny`);
        const canCreate = locationCheck && hasPermission(`${entity}.create`);
        const canUpdate = locationCheck && hasPermission(`${entity}.update`);
        const canDelete = locationCheck && hasPermission(`${entity}.delete`);
        const canExport = locationCheck && hasPermission(`${entity}.export`);
        const canGenerateQrCode = locationCheck && hasPermission(`${entity}.generateQrCode`);

        const hasAnyAction = canUpdate || canDelete || canGenerateQrCode;

        return {
            canView,
            canViewAny,
            canCreate,
            canUpdate,
            canDelete,
            canExport,
            canGenerateQrCode,
            hasAnyAction,
        };
    }, [entity, hasPermission, isOnHeadquarters, hqOnly, noLocationCheck]);
}
