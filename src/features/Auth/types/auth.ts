// Auth-specific types
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

export interface UpdateLocaleData {
    locale: 'fr' | 'en';
}

export interface UpdateSiteData {
    site_id: number;
}
