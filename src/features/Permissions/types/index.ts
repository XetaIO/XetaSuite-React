/**
 * Permission types for the Permissions feature
 */

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    roles_count: number;
    created_at: string;
    updated_at?: string;
}

export interface PermissionDetail extends Permission {
    roles: PermissionRole[];
}

export interface PermissionRole {
    id: number;
    name: string;
    guard_name: string;
    users_count: number;
    created_at: string;
}

export interface PermissionFormData {
    name: string;
}

export interface PermissionFilters {
    page?: number;
    search?: string;
    sort_by?: 'name' | 'created_at' | 'roles_count';
    sort_direction?: 'asc' | 'desc';
}

export interface AvailableRole {
    id: number;
    name: string;
}
