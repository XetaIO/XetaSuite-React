import httpClient from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/urlBuilder';
import type { AppSettings } from '../types';

interface SettingsResponse {
    data: Record<string, string>;
}

/**
 * Repository for Settings API calls
 * Raw API boundary - no error handling
 */
export const SettingsRepository = {
    /**
     * Fetch all global settings
     */
    getAll: async (): Promise<AppSettings> => {
        const response = await httpClient.get<SettingsResponse>(API_ENDPOINTS.SETTINGS.BASE);
        return response.data.data as AppSettings;
    },
};
