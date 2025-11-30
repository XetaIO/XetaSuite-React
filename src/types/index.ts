// User types
export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    locale: 'fr' | 'en';
    current_site_id?: number;
    roles: string[];
    permissions: string[];
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

// Team type for multi-tenancy
export interface Site {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
}

// API response types
export interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface ValidationErrors {
    [key: string]: string[];
}

// Auth context types
export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (data: ForgotPasswordData) => Promise<void>;
    resetPassword: (data: ResetPasswordData) => Promise<void>;
    checkAuth: () => Promise<void>;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
}