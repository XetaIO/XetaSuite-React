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
        MEMBERS: (id: number) => `/api/v1/sites/${id}/members`,
    },
    // Zones
    ZONES: {
        BASE: '/api/v1/zones',
        DETAIL: (id: number) => `/api/v1/zones/${id}`,
        CHILDREN: (id: number) => `/api/v1/zones/${id}/children`,
        MATERIALS: (id: number) => `/api/v1/zones/${id}/materials`,
        AVAILABLE_PARENTS: '/api/v1/zones/available-parents',
    },
    // Materials
    MATERIALS: {
        BASE: '/api/v1/materials',
        DETAIL: (id: number) => `/api/v1/materials/${id}`,
        STATS: (id: number) => `/api/v1/materials/${id}/stats`,
        AVAILABLE_ZONES: '/api/v1/materials/available-zones',
        AVAILABLE_RECIPIENTS: '/api/v1/materials/available-recipients',
    },
    // Items
    ITEMS: {
        BASE: '/api/v1/items',
        DETAIL: (id: number) => `/api/v1/items/${id}`,
        STATS: (id: number) => `/api/v1/items/${id}/stats`,
        MOVEMENTS: (id: number) => `/api/v1/items/${id}/movements`,
        QR_CODE: (id: number) => `/api/v1/items/${id}/qr-code`,
        DASHBOARD: '/api/v1/items-dashboard',
        AVAILABLE_SUPPLIERS: '/api/v1/items/available-suppliers',
        AVAILABLE_MATERIALS: '/api/v1/items/available-materials',
        AVAILABLE_RECIPIENTS: '/api/v1/items/available-recipients',
    },
} as const;
