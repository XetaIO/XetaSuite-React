/**
 * Application Settings types
 */

/**
 * Settings for public consumption (key-value format)
 */
export interface AppSettings {
    currency: string;
    currency_symbol: string;
    login_enabled: boolean;
    [key: string]: string | boolean | number; // Allow additional settings
}

export const DEFAULT_SETTINGS: AppSettings = {
    currency: 'EUR',
    currency_symbol: '€',
    login_enabled: true,
};

/**
 * Full setting object for management
 */
export interface Setting {
    id: number;
    key: string;
    value: string | boolean | number;
    text: string | null;
    label: string | null;
    label_info: string | null;
    updated_by_id: number | null;
    updater?: {
        id: number;
        username: string;
        full_name: string;
    } | null;
    created_at: string;
    updated_at: string;
}

/**
 * Update setting payload
 */
export interface UpdateSettingPayload {
    value: string | boolean | number;
}
