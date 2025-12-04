import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { showError } from '@/shared/utils/toast';

/**
 * HTTP Client - Base API configuration for the application
 * This is the lowest level of the Data Layer, providing HTTP communication
 */

const httpClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true, // Required for Sanctum cookie-based authentication
    withXSRFToken: true,
});

/**
 * Flag to control whether to show toast on server errors
 * Can be set per-request using config.meta.showErrorToast = false
 */
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    meta?: {
        showErrorToast?: boolean;
    };
}

/**
 * Response interceptor to handle global error notifications
 */
httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const config = error.config as CustomAxiosRequestConfig | undefined;
        const shouldShowToast = config?.meta?.showErrorToast !== false;

        // Only show toast for server errors (5xx) automatically
        if (shouldShowToast && error.response?.status && error.response.status >= 500) {
            showError('Server error. Please try again later.');
        }

        return Promise.reject(error);
    }
);

/**
 * Get CSRF cookie from Laravel Sanctum
 */
export const getCsrfCookie = async (): Promise<void> => {
    await httpClient.get('/sanctum/csrf-cookie');
};

/**
 * Generic request function with type safety
 */
export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.request<T>(config);
    return response.data;
};

/**
 * Error handler helper - extracts meaningful error messages from API responses
 */
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

        switch (axiosError.response?.status) {
            case 401:
                return 'Invalid credentials';
            case 403:
                return 'Access forbidden';
            case 404:
                return 'Resource not found';
            case 422:
                return 'Validation error';
            case 429:
                return 'Too many attempts. Please try again later.';
            case 500:
                return 'Server error. Please try again later.';
        }
    }

    return 'An unexpected error occurred';
};

/**
 * Check if error is an Axios error
 */
export const isApiError = (error: unknown): error is AxiosError => {
    return axios.isAxiosError(error);
};

export default httpClient;
