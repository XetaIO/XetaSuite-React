/**
 * Application Settings types
 */

export interface AppSettings {
    currency: string;
    currency_symbol: string;
    [key: string]: string; // Allow additional settings
}

export const DEFAULT_SETTINGS: AppSettings = {
    currency: 'EUR',
    currency_symbol: '€',
};
