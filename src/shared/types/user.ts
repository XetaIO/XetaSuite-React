// User Site (for site switcher)
export interface UserSite {
    id: number;
    name: string;
    is_headquarters: boolean;
}

// User types
export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    avatar: string;
    email: string;
    locale: 'fr' | 'en';
    current_site_id?: number;
    roles: string[];
    permissions: string[];
    sites: UserSite[];
}

// Role type for spatie/laravel-permission
export interface Role {
    id: number;
    name: string;
    guard_name: string;
    site_id?: number;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

// Permission type for spatie/laravel-permission
export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}
