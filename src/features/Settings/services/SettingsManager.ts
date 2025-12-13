import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { SettingsRepository } from './SettingsRepository';
import { handleApiError } from '@/shared/api/httpClient';

interface ManagerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Manager for Settings with error handling
 */
export const SettingsManager = {
    /**
     * Fetch all global settings with error handling
     */
    getAll: async (): Promise<ManagerResult<AppSettings>> => {
        try {
            const data = await SettingsRepository.getAll();
            return { success: true, data };
        } catch (error) {
            console.error('Failed to load settings, using defaults:', error);
            // Return defaults on error so app can still function
            return {
                success: false,
                error: handleApiError(error),
                data: DEFAULT_SETTINGS
            };
        }
    },
};
