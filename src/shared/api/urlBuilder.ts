/**
 * URL Builder utility for constructing API endpoints with query parameters
 */

export interface QueryParams {
    [key: string]: string | number | boolean | undefined | null;
}

/**
 * Build URL with query parameters
 */
export const buildUrl = (baseUrl: string, params?: QueryParams): string => {
    if (!params) return baseUrl;

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * API endpoints constants
 */
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        CSRF: '/sanctum/csrf-cookie',
        USER: '/api/v1/auth/user',
        LOGIN: '/api/v1/auth/login',
        LOGOUT: '/api/v1/auth/logout',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
    },
    // User
    USER: {
        LOCALE: '/api/v1/user/locale',
        SITE: '/api/v1/user/site',
    },
    // Suppliers
    SUPPLIERS: {
        BASE: '/api/v1/suppliers',
        DETAIL: (id: number) => `/api/v1/suppliers/${id}`,
        ITEMS: (id: number) => `/api/v1/suppliers/${id}/items`,
    },
    // Sites
    SITES: {
        BASE: '/api/v1/sites',
        DETAIL: (id: number) => `/api/v1/sites/${id}`,
        USERS: (id: number) => `/api/v1/sites/${id}/users`,
    },
} as const;
