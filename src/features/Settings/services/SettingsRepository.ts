import httpClient from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/urlBuilder';
import type { AppSettings, Setting, UpdateSettingPayload } from '../types';

interface SettingsResponse {
    data: Record<string, string | boolean | number>;
}

interface SettingsListResponse {
    data: Setting[];
}

interface SettingResponse {
    data: Setting;
}

/**
 * Repository for Settings API calls
 * Raw API boundary - no error handling
 */
export const SettingsRepository = {
    /**
     * Fetch all global settings (public - key-value format)
     */
    getPublic: async (): Promise<AppSettings> => {
        const response = await httpClient.get<SettingsResponse>(API_ENDPOINTS.SETTINGS.BASE);
        return response.data.data as AppSettings;
    },

    /**
     * Fetch all settings for management (full resource format)
     */
    getAll: async (): Promise<Setting[]> => {
        const response = await httpClient.get<SettingsListResponse>(API_ENDPOINTS.SETTINGS.MANAGE);
        return response.data.data;
    },

    /**
     * Fetch a single setting by ID
     */
    getById: async (id: number): Promise<Setting> => {
        const response = await httpClient.get<SettingResponse>(API_ENDPOINTS.SETTINGS.DETAIL(id));
        return response.data.data;
    },

    /**
     * Update a setting
     */
    update: async (id: number, data: UpdateSettingPayload): Promise<Setting> => {
        const response = await httpClient.put<SettingResponse>(API_ENDPOINTS.SETTINGS.DETAIL(id), data);
        return response.data.data;
    },
};
