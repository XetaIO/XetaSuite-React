/**
 * Role types for the Roles feature
 */

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    level: number | null;
    site_id: number | null;
    site?: {
        id: number;
        name: string;
    } | null;
    permissions_count: number;
    users_count: number;
    created_at: string;
    updated_at?: string;
}

export interface RoleDetail extends Role {
    permissions: RolePermission[];
}

export interface RolePermission {
    id: number;
    name: string;
}

export interface RoleFormData {
    name: string;
    level?: number | null;
    site_id?: number | null;
    permissions?: number[];
}

export interface RoleFilters {
    page?: number;
    search?: string;
    sort_by?: 'name' | 'created_at' | 'permissions_count' | 'users_count';
    sort_direction?: 'asc' | 'desc';
}

export interface AvailablePermission {
    id: number;
    name: string;
}

export interface RoleUser {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    avatar?: string;
    site?: {
        id: number;
        name: string;
    } | null;
}

export interface AvailableSite {
    id: number;
    name: string;
    is_headquarters: boolean;
}
