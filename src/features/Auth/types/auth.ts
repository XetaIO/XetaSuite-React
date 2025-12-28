// Auth-specific types
export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface ForgotPasswordData {
    email: string;
    recaptcha_token?: string | null;
}

export interface ResetPasswordData {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
}

export interface SetupPasswordData {
    password: string;
    password_confirmation: string;
}

export interface SetupPasswordVerifyResponse {
    valid: boolean;
    message?: string;
    user?: {
        id: number;
        email: string;
        full_name: string;
    };
}

export interface SetupPasswordParams {
    id: number;
    hash: string;
    signature: string;
    expires: string;
}

export interface ResendSetupPasswordData {
    email: string;
    recaptcha_token?: string | null;
}

export interface UpdateLocaleData {
    locale: 'fr' | 'en';
}

export interface UpdateSiteData {
    site_id: number;
}
