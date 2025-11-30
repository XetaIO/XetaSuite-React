import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
    User,
    LoginCredentials,
    ForgotPasswordData,
    ResetPasswordData
} from '../types';

// Create axios instance configured for Laravel Sanctum
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true, // Required for Sanctum cookie-based authentication
    withXSRFToken: true,
});

// Get CSRF cookie from Laravel Sanctum
export const getCsrfCookie = async (): Promise<void> => {
    await api.get('/sanctum/csrf-cookie');
};

// Auth API functions
export const authApi = {
    // Get current authenticated user
    getUser: async (): Promise<{ data: User }> => {
        const response = await api.get<{ data: User }>('/api/v1/auth/user');
        return response.data;
    },

    // Login with email and password
    login: async (credentials: LoginCredentials): Promise<void> => {
        await getCsrfCookie();
        await api.post('/api/v1/auth/login', credentials);
    },

    // Logout
    logout: async (): Promise<void> => {
        await api.post('/api/v1/auth/logout');
    },

    // Request password reset email
    forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
        await getCsrfCookie();
        await api.post('/forgot-password', data);
    },

    // Reset password with token
    resetPassword: async (data: ResetPasswordData): Promise<void> => {
        await getCsrfCookie();
        await api.post('/reset-password', data);
    },
};

// User API functions
export const userApi = {
    // Update user's locale preference
    updateLocale: async (locale: 'fr' | 'en'): Promise<void> => {
        await api.patch('/api/v1/user/locale', { locale });
    },
};

// Error handler helper
export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        if (axiosError.response?.data?.errors) {
            const errors = axiosError.response.data.errors;
            return Object.values(errors).flat().join(', ');
        }

        if (axiosError.response?.status === 401) {
            return 'Invalid credentials';
        }

        if (axiosError.response?.status === 422) {
            return 'Validation error';
        }

        if (axiosError.response?.status === 429) {
            return 'Too many attempts. Please try again later.';
        }
    }

    return 'An unexpected error occurred';
};

export default api;