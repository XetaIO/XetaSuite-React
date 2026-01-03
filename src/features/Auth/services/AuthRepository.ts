import { httpClient, getCsrfCookie, API_ENDPOINTS } from '@/shared/api';
import type { User } from '@/shared/types';
import type {
    LoginCredentials,
    ForgotPasswordData,
    ResetPasswordData,
    ResendSetupPasswordData,
    UpdateLocaleData,
    UpdateSiteData,
    SetupPasswordData,
    SetupPasswordVerifyResponse,
} from '../types';

/**
 * Auth Repository - Responsible for interacting with the auth data source
 * This file marks the boundary of our application - no error handling, no business rules
 */
export const AuthRepository = {
    /**
     * Get current authenticated user
     */
    getUser: async (): Promise<{ data: User }> => {
        const response = await httpClient.get<{ data: User }>(API_ENDPOINTS.AUTH.USER);
        return response.data;
    },

    /**
     * Login with credentials
     */
    login: async (credentials: LoginCredentials): Promise<void> => {
        await getCsrfCookie();
        await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    },

    /**
     * Logout
     */
    logout: async (): Promise<void> => {
        await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    /**
     * Request password reset email
     */
    forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
        await getCsrfCookie();
        await httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    },

    /**
     * Reset password with token
     */
    resetPassword: async (data: ResetPasswordData): Promise<void> => {
        await getCsrfCookie();
        await httpClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    },

    /**
     * Verify password setup link
     */
    verifySetupPassword: async (
        id: number,
        hash: string,
        queryParams: string
    ): Promise<SetupPasswordVerifyResponse> => {
        const url = `${API_ENDPOINTS.AUTH.SETUP_PASSWORD(id, hash)}${queryParams}`;
        const response = await httpClient.get<SetupPasswordVerifyResponse>(url);
        return response.data;
    },

    /**
     * Setup password for new user
     */
    setupPassword: async (
        id: number,
        hash: string,
        queryParams: string,
        data: SetupPasswordData
    ): Promise<{ message: string }> => {
        await getCsrfCookie();
        const url = `${API_ENDPOINTS.AUTH.SETUP_PASSWORD(id, hash)}${queryParams}`;
        const response = await httpClient.post<{ message: string }>(url, data);
        return response.data;
    },

    /**
     * Resend password setup email
     */
    resendSetupPassword: async (data: ResendSetupPasswordData): Promise<void> => {
        await getCsrfCookie();
        await httpClient.post(API_ENDPOINTS.AUTH.RESEND_SETUP_PASSWORD, data);
    },

    /**
     * Update user's locale preference
     */
    updateLocale: async (data: UpdateLocaleData): Promise<void> => {
        await httpClient.patch(API_ENDPOINTS.USER.LOCALE, data);
    },

    /**
     * Update user's current site
     */
    updateSite: async (data: UpdateSiteData): Promise<{ user: User }> => {
        const response = await httpClient.patch<{ user: User }>(API_ENDPOINTS.USER.SITE, data);
        return response.data;
    },
};
