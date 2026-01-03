import type { AppSettings, Setting, UpdateSettingPayload } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { SettingsRepository } from './SettingsRepository';
import { handleApiError } from '@/shared/api/httpClient';
import type { ManagerResult } from '@/shared/types';

/**
 * Manager for Settings with error handling
 */
export const SettingsManager = {
    /**
     * Fetch all global settings (public - key-value format)
     * Falls back to defaults on error to ensure app can still function
     */
    getPublic: async (): Promise<AppSettings> => {
        try {
            return await SettingsRepository.getPublic();
        } catch (error) {
            console.error('Failed to load settings, using defaults:', error);
            return DEFAULT_SETTINGS;
        }
    },

    /**
     * Fetch all settings for management
     */
    getAll: async (): Promise<ManagerResult<Setting[]>> => {
        try {
            const data = await SettingsRepository.getAll();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: handleApiError(error),
            };
        }
    },

    /**
     * Fetch a single setting by ID
     */
    getById: async (id: number): Promise<ManagerResult<Setting>> => {
        try {
            const data = await SettingsRepository.getById(id);
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: handleApiError(error),
            };
        }
    },

    /**
     * Update a setting
     */
    update: async (id: number, payload: UpdateSettingPayload): Promise<ManagerResult<Setting>> => {
        try {
            const data = await SettingsRepository.update(id, payload);
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: handleApiError(error),
            };
        }
    },
};
