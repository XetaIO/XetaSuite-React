// Team type for multi-tenancy
export interface Site {
    id: number;
    name: string;
    is_headquarters: boolean;
    zone_count: number;
    user_count: number;
    email?: string;
    office_phone?: string;
    cell_phone?: string;
    address?: string;
    zip_code?: string;
    city?: string;
    country?: string;
    managers?: SiteUser[];
    users?: SiteUser[];
    created_at: string;
    updated_at: string;
}

export interface SiteUser {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
}

export interface SiteFormData {
    name: string;
    email?: string;
    office_phone?: string;
    cell_phone?: string;
    address?: string;
    zip_code?: string;
    city?: string;
    manager_ids?: number[];
}

export interface SiteFilters {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: 'name' | 'zone_count' | 'created_at';
    sort_direction?: 'asc' | 'desc';
}

export interface UserOption {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    avatar: string;
    roles: string[];
}

export interface SiteMember {
    id: number;
    full_name: string;
    email: string;
    avatar: string;
    roles: string[];
    created_at: string;
}
